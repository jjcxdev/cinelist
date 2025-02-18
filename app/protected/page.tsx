// src/app/page.tsx
import Search from "@/components/search";
import CineList from "@/components/cinelist";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface CineListData {
  items: any[];
  isAdmin: boolean;
}

async function getCineListItems(): Promise<CineListData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user's admin status
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (roleError) {
    console.error(
      "Error fetching user role:",
      JSON.stringify(roleError, null, 2),
    );
    // If no role exists, create one
    const { data: newRole, error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, is_admin: false })
      .select()
      .single();

    if (insertError) {
      console.error(
        "Error creating user role:",
        JSON.stringify(insertError, null, 2),
      );
    }
  }

  // First, get the items without the join to see if that works
  const { data, error } = await supabase
    .from("cine_list_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Error fetching cine list items:",
      JSON.stringify(error, null, 2),
    );
    return {
      items: [],
      isAdmin: userRole?.is_admin ?? false,
    };
  }

  // Then manually fetch the completed_by emails
  const itemsWithCompletedBy = await Promise.all(
    data.map(async (item) => {
      if (item.completed_by) {
        const { data: userData } = await supabase
          .from("users")
          .select("email")
          .eq("id", item.completed_by)
          .single();
        return {
          ...item,
          completed_by: userData ? { email: userData.email } : null,
        };
      }
      return { ...item, completed_by: null };
    }),
  );

  return {
    items: itemsWithCompletedBy ?? [],
    isAdmin: userRole?.is_admin ?? false,
  };
}

export default async function ProtectedPage() {
  const { items, isAdmin } = await getCineListItems();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Search />
      </div>
      <CineList items={items} isAdmin={isAdmin} />
    </div>
  );
}
