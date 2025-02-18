"use client";

// src/components/cinelist.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CineListItem {
  id: string;
  title: string;
  is_completed: boolean;
  media_type: "movie" | "tv";
  series_type?: "entire" | "season" | "episode";
  series_id?: string;
  season_number?: number;
  episode_number?: number;
  episode_name?: string;
  poster_path: string | null;
  release_date: string | null;
  seasons?: {
    season_number: number;
    episode_count: number;
    episodes: {
      episode_number: number;
      name: string;
    }[];
  }[];
}

interface CineListProps {
  items: CineListItem[];
}

export default function CineList({ items }: CineListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleCompleteToggle = async (id: string, is_completed: boolean) => {
    try {
      const response = await fetch(`/api/cine-list-items`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "flex flex-row items-start p-4",
            item.is_completed && "opacity-50",
          )}
        >
          {item.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
              alt={item.title}
              className={cn(
                "h-24 w-auto rounded mr-4",
                item.is_completed && "grayscale",
              )}
            />
          )}
          <div className="flex flex-col flex-1">
            <CardHeader className="p-0">
              <div className="flex flex-col">
                <CardTitle>
                  {item.title}
                  {item.series_type === "season" && item.season_number && (
                    <span className="text-sm font-normal ml-2">
                      Season {item.season_number}
                    </span>
                  )}
                  {item.series_type === "episode" &&
                    item.season_number &&
                    item.episode_number && (
                      <span className="text-sm font-normal ml-2">
                        Season: {item.season_number} Episode:{" "}
                        {item.episode_name || item.episode_number}
                      </span>
                    )}
                </CardTitle>
                {item.release_date && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.release_date).getFullYear()}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <label
                htmlFor={`complete-${item.id}`}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`complete-${item.id}`}
                  checked={item.is_completed}
                  onCheckedChange={(checked) =>
                    handleCompleteToggle(item.id, checked === true)
                  }
                />
                <span>Complete</span>
              </label>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
