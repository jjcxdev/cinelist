// src/app/page.tsx
import Search from "@/components/search";
import CineList from "@/components/cinelist";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

async function getCineListItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data, error } = await supabase
    .from("cine_list_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cine list items:", error);
    return [];
  }

  return data;
}

export default async function Home() {
  const items = await getCineListItems();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-4">
      <div className="max-w-4xl w-full mx-auto">
        <Search />
        <div className="mt-8">
          <CineList items={items} />
        </div>
      </div>
    </div>
  );
}
