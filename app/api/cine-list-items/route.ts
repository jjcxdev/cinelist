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
      episode_name,
      tmdb_id,
      poster_path,
      release_date,
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
          episode_name,
          tmdb_id,
          poster_path,
          release_date,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error details:", error);
      return NextResponse.json(
        { error: "Failed to add item", details: error },
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
        if (item.media_type === "series" && item.series_id) {
          const tvResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${item.series_id}?language=en-US&append_to_response=season/${item.season_number}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (tvResponse.ok) {
            const tvData = await tvResponse.json();
            return {
              ...item,
              seasons: [
                {
                  season_number: item.season_number,
                  episode_count:
                    tvData[`season/${item.season_number}`]?.episodes?.length ||
                    0,
                  episodes:
                    tvData[`season/${item.season_number}`]?.episodes?.map(
                      (episode: any) => ({
                        episode_number: episode.episode_number,
                        name: episode.name,
                      }),
                    ) || [],
                },
              ],
            };
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
      .eq("id", id)
      .eq("user_id", user.id); // Ensure the user owns the item

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
