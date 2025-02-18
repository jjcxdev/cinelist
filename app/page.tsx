import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Your existing page content here
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {/* Add your content here */}
    </div>
  );
}
