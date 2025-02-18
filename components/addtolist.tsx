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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: number;
  title: string;
  media_type: "movie" | "tv"; // 'tv' represents series in TMDb
  poster_path: string | null;
  release_date: string | null;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons: {
    season_number: number;
    episode_count: number;
    episodes: {
      episode_number: number;
      name: string;
    }[];
  }[];
  // Add other relevant fields from the TMDb API response
}

interface AddToListProps {
  item: SearchResult;
  className?: string;
  onSuccess?: () => void;
}

export default function AddToList({
  item,
  className,
  onSuccess,
}: AddToListProps) {
  const [seriesType, setSeriesType] = useState<
    "entire" | "season" | "episode"
  >();
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddItem = async () => {
    setIsLoading(true);
    console.log("Item data:", item);
    console.log("Current state:", {
      seriesType,
      seasonNumber,
      episodeNumber,
    });

    // Check if we have the episode data
    const episodeData = item.seasons
      ?.find((s) => s.season_number === seasonNumber)
      ?.episodes?.find((e) => e.episode_number === episodeNumber);

    console.log("Episode data found:", episodeData);
    console.log("Seasons data:", item.seasons);

    const payload = {
      title: item.title,
      media_type: item.media_type === "movie" ? "movie" : "series",
      series_type: item.media_type === "movie" ? null : seriesType,
      series_id: item.media_type === "movie" ? null : item.id.toString(),
      season_number: seasonNumber,
      episode_number: seriesType === "episode" ? episodeNumber : null,
      episode_name: episodeData?.name || null,
      tmdb_id: item.id.toString(),
      poster_path: item.poster_path,
      release_date: item.release_date,
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch("/api/cine-list-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      toast({
        title: "Success",
        description: "Added to your list",
      });

      router.refresh(); // Refresh the page to update the list
      onSuccess?.(); // Call onSuccess callback (to close dialog)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {item.media_type === "tv" && (
        <div className="flex flex-col gap-2">
          <Select
            onValueChange={(value) => {
              const type = value as "entire" | "season" | "episode";
              setSeriesType(type);
              if (type === "entire") {
                setSeasonNumber(null);
                setEpisodeNumber(null);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Series Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entire">Entire Series</SelectItem>
              <SelectItem value="season">Season</SelectItem>
              <SelectItem value="episode">Episode</SelectItem>
            </SelectContent>
          </Select>

          {(seriesType === "season" || seriesType === "episode") && (
            <Select
              value={seasonNumber?.toString()}
              onValueChange={(value) => {
                const season = parseInt(value);
                setSeasonNumber(season);
                console.log("Selected season:", season);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                {item.seasons.map((season) => (
                  <SelectItem
                    key={season.season_number}
                    value={season.season_number.toString()}
                  >
                    Season {season.season_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {seriesType === "episode" && (
            <Select
              value={episodeNumber?.toString()}
              onValueChange={(value) => setEpisodeNumber(parseInt(value))}
              disabled={!seasonNumber}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Episode" />
              </SelectTrigger>
              <SelectContent>
                {seasonNumber &&
                  item.seasons
                    .find((s) => s.season_number === seasonNumber)
                    ?.episodes?.map((episode) => (
                      <SelectItem
                        key={episode.episode_number}
                        value={episode.episode_number.toString()}
                      >
                        {episode.episode_number}. {episode.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <Button
        onClick={handleAddItem}
        className="w-[180px]"
        disabled={
          isLoading ||
          (item.media_type === "tv" && !seriesType) ||
          (seriesType === "season" && !seasonNumber) ||
          (seriesType === "episode" && (!seasonNumber || !episodeNumber))
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add to List"
        )}
      </Button>
    </div>
  );
}
