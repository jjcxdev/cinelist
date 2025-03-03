// src/app/api/cine-list-items/route.ts (POST)
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Use server-side client

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, media_type, tmdb_id, poster_path, release_date } = body;

    // Check if item already exists
    const { data: existingItem } = await supabase
      .from("cine_list_items")
      .select()
      .eq("tmdb_id", tmdb_id)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists in the list" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("cine_list_items")
      .insert([{ title, media_type, tmdb_id, poster_path, release_date }])
      .select();

    if (error) {
      console.error("Supabase error details:", error);
      return NextResponse.json(
        { error: "Failed to add item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/cine-list-items:", error);
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
      .select("*, completed_by(email)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 },
      );
    }

    // Fetch episode information for TV series
    const enrichedData = await Promise.all(
      data.map(async (item) => {
        if (item.media_type === "tv") {
          const tvResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${item.tmdb_id}?language=en-US`,
            {
              headers: {
                Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (tvResponse.ok) {
            const tvData = await tvResponse.json();
            return { ...item, number_of_seasons: tvData.number_of_seasons };
          }
        }
        return item;
      }),
    );

    return NextResponse.json({ data: enrichedData });
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

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (!userRole?.is_admin) {
      return NextResponse.json(
        { error: "Only admins can mark items as complete" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { id, is_completed } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("cine_list_items")
      .update({
        is_completed,
        completed_by: is_completed ? user.id : null,
      })
      .eq("id", id)
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

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("cine_list_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting item:", error);
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/cine-list-items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
