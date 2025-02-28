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
  poster_path: string | null;
  release_date: string | null;
  completed_by: { email: string } | null;
}

interface CineListProps {
  items: CineListItem[];
  isAdmin: boolean;
}

export default function CineList({ items, isAdmin }: CineListProps) {
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
        const error = await response.json();
        throw new Error(error.error || "Failed to update item");
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
        description:
          error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Requests */}
      <div className="flex flex-col gap-4">
        <p>Requests</p>
        {items
          .filter((item) => !item.is_completed)
          .map((item) => (
            <Card
              key={item.id}
              className={cn(
                "flex flex-col items-start p-4",
                item.is_completed && "opacity-50",
              )}
            >
              <div className="flex w-full flex-1 flex-col">
                <CardHeader className="p-0">
                  <div className="flex flex-col">
                    <CardTitle>{item.title}</CardTitle>
                    {item.release_date && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.release_date).getFullYear()}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <div className="flex w-full flex-col items-start justify-start">
                  {item.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={item.title}
                      className={cn(
                        "w-ful flex h-24 w-16 items-center justify-center rounded",
                        item.is_completed && "grayscale",
                      )}
                    />
                  )}
                  <div className="flex justify-start pt-2">
                    <CardContent className="p-0">
                      {isAdmin ? (
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
                        </label>
                      ) : null}
                    </CardContent>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Added */}
      <div className="flex flex-col gap-4">
        <p>Added</p>
        {items
          .filter((item) => item.is_completed)
          .map((item) => (
            <Card
              key={item.id}
              className={cn(
                "flex flex-col items-start p-4",
                item.is_completed && "opacity-50",
              )}
            >
              <div className="flex w-full flex-1 flex-col">
                <CardHeader className="p-0">
                  <div className="flex flex-col">
                    <CardTitle>{item.title}</CardTitle>
                    {item.release_date && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.release_date).getFullYear()}
                      </span>
                    )}
                    {item.completed_by && (
                      <span className="text-sm text-muted-foreground">
                        Completed by: {item.completed_by.email}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <div className="flex w-full flex-col items-start justify-start">
                  {item.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={item.title}
                      className={cn(
                        "w-ful flex h-24 w-16 items-center justify-center rounded",
                        item.is_completed && "grayscale",
                      )}
                    />
                  )}
                  <div className="flex justify-start pt-2">
                    <CardContent className="p-0">
                      {isAdmin ? (
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
                        </label>
                      ) : null}
                    </CardContent>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
