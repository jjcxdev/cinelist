import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    console.log(
      "TMDB Request URL:",
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
    );
    console.log(
      "TMDB Access Token:",
      process.env.TMDB_ACCESS_TOKEN ? "Present" : "Missing",
    );

    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!tmdbResponse.ok) {
      const errorText = await tmdbResponse.text();
      console.error("TMDB API Error:", {
        status: tmdbResponse.status,
        statusText: tmdbResponse.statusText,
        response: errorText,
      });
      throw new Error(
        `TMDB API request failed: ${tmdbResponse.status} ${tmdbResponse.statusText}`,
      );
    }

    const data = await tmdbResponse.json();
    console.log("TMDB Response:", data);

    // Filter and transform results to only include movies and TV shows
    const results = await Promise.all(
      data.results
        .filter(
          (item: any) =>
            item.media_type === "movie" || item.media_type === "tv",
        )
        .map(async (item: any) => {
          const baseResult = {
            id: item.id,
            title: item.media_type === "movie" ? item.title : item.name,
            media_type: item.media_type,
            poster_path: item.poster_path,
            release_date: item.release_date || item.first_air_date,
          };

          if (item.media_type === "tv") {
            const tvResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${item.id}?language=en-US&append_to_response=season/1,season/2,season/3,season/4,season/5,season/6`,
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
                ...baseResult,
                number_of_seasons: tvData.number_of_seasons,
                seasons: tvData.seasons
                  .filter((season: any) => season.season_number > 0)
                  .map((season: any) => ({
                    season_number: season.season_number,
                    episode_count: season.episode_count,
                    episodes:
                      tvData[`season/${season.season_number}`]?.episodes?.map(
                        (episode: any) => ({
                          episode_number: episode.episode_number,
                          name: episode.name,
                        }),
                      ) || [],
                  })),
              };
            }
          }

          return baseResult;
        }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 },
    );
  }
}
