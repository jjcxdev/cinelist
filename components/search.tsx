// src/components/Search.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AddToList from "@/components/addtolist";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: number;
  title: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
  release_date: string | null;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  const debouncedSearch = useCallback((q: string) => {
    if (!q) {
      setSearchResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching search results for:", q);
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(q)}`,
        );
        if (!response.ok) {
          throw new Error(
            `Search failed: ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();
        console.log("Search response:", data);
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (query) {
      const timerId = setTimeout(() => {
        debouncedSearch(query);
      }, 300); // Debounce delay of 300ms

      return () => clearTimeout(timerId);
    } else {
      setSearchResults([]);
    }
  }, [query, debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start"
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          Search for movies and series
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Search Movies and Series
          </DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput
            placeholder="Search for movies and series..."
            value={query}
            onValueChange={setQuery}
            className="text-base"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  className="flex items-center gap-4"
                >
                  {result.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                      alt={result.title}
                      className="h-16 w-auto rounded"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{result.title}</span>
                    {result.release_date && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.release_date).getFullYear()}
                      </span>
                    )}
                  </div>
                  <AddToList
                    item={result}
                    className="ml-auto"
                    onSuccess={() => setOpen(false)}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
