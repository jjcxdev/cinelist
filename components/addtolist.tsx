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
  media_type: "movie" | "tv";
  poster_path: string | null;
  release_date: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddItem = async () => {
    setIsLoading(true);

    const payload = {
      title: item.title,
      media_type: item.media_type,
      tmdb_id: item.id.toString(),
      poster_path: item.poster_path,
      release_date: item.release_date,
    };

    try {
      const response = await fetch("/api/cine-list-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      toast({
        title: "Success",
        description: "Added to your list",
      });

      router.refresh();
      onSuccess?.();
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
      <Button
        onClick={handleAddItem}
        className="w-[180px]"
        disabled={isLoading}
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
