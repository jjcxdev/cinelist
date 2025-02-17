// src/app/api/cine-list-items/route.ts (POST)
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Use server-side client

export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // Get Supabase client

    const {
      data: { user },
    } = await supabase.auth.getUser(); // Get user from session

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      media_type,
      series_type,
      series_id,
      season_number,
      episode_number,
      tmdb_id,
    } = body;

    const { data, error } = await supabase
      .from("cine_list_items")
      .insert([
        {
          user_id: user.id,
          title,
          media_type,
          series_type,
          series_id,
          season_number,
          episode_number,
          tmdb_id,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting data:", error);
      return NextResponse.json(
        { error: "Failed to add item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 }); // Return the newly created item
  } catch (error) {
    console.error("Error in /api/cine-list-items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("cine_list_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }); // Or any other ordering you prefer

    if (error) {
      console.error("Error fetching data:", error);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in GET /api/cine-list-items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_completed } = body; // Expecting item ID and new is_completed value

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("cine_list_items")
      .update({ is_completed })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure the user owns the item
      .select();

    if (error) {
      console.error("Error updating item:", error);
      return NextResponse.json(
        { error: "Failed to update item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in PATCH /api/cine-list-items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
