// src/components/AddToList.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: number;
  title: string;
  media_type: "movie" | "tv"; // 'tv' represents series in TMDb
  poster_path: string | null;
  // Add other relevant fields from the TMDb API response
}

interface AddToListProps {
  item: SearchResult;
}

export default function AddToList({ item }: AddToListProps) {
  const [seriesType, setSeriesType] = useState<"series" | "season" | "episode">(
    "series",
  );
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState<number | null>(null);

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/cine-list-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: item.title,
          media_type: item.media_type === "movie" ? "movie" : "series", // Adjust media_type
          series_type: item.media_type === "movie" ? null : seriesType, // Only include series_type for series
          series_id: item.media_type === "movie" ? null : item.id.toString(), // Store TMDb ID as series_id
          season_number: seriesType === "season" ? seasonNumber : null,
          episode_number: seriesType === "episode" ? episodeNumber : null,
          tmdb_id: item.id.toString(), // Store TMDb ID
        }),
      });

      if (!response.ok) {
        console.error("Failed to add item:", response.statusText);
        // Handle error (e.g., show a toast notification)
      } else {
        // Optionally, display a success message or refetch the CineList
        console.log("Item added successfully!");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      // Handle error (e.g., show a toast notification)
    }
  };

  return (
    <div>
      {item.media_type === "tv" && (
        <>
          <Select
            onValueChange={(value) =>
              setSeriesType(value as "series" | "season" | "episode")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Series Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="series">Series</SelectItem>
              <SelectItem value="season">Season</SelectItem>
              <SelectItem value="episode">Episode</SelectItem>
            </SelectContent>
          </Select>

          {seriesType === "season" && (
            <Input
              type="number"
              placeholder="Season Number"
              value={seasonNumber !== null ? seasonNumber.toString() : ""}
              onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
            />
          )}

          {seriesType === "episode" && (
            <>
              <Input
                type="number"
                placeholder="Season Number"
                value={seasonNumber !== null ? seasonNumber.toString() : ""}
                onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Episode Number"
                value={episodeNumber !== null ? episodeNumber.toString() : ""}
                onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
              />
            </>
          )}
        </>
      )}

      <Button onClick={handleAddItem}>Add to List</Button>
    </div>
  );
}
