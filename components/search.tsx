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

interface SearchResult {
  id: number;
  title: string;
  media_type: "movie" | "tv"; // 'tv' represents series in TMDb
  poster_path: string | null; // Path to the poster image (optional)
  // Add other relevant fields from the TMDb API response
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  // Debounce the search function to prevent excessive API calls
  const debouncedSearch = useCallback((q: string) => {
    if (!q) {
      setSearchResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/search?query=${q}`);
        const data = await response.json();
        setSearchResults(data.results);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]); // Clear results on error
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (query) {
      const timerId = setTimeout(() => {
        debouncedSearch(query);
      }, 300); // Adjust the debounce delay as needed (e.g., 300ms)

      return () => clearTimeout(timerId); // Clear the timeout on unmount or query change
    } else {
      setSearchResults([]); // Clear results when the query is empty
    }
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-5 w-5 text-zinc-500 peer-focus:text-sky-500 transition-colors duration-150" />
            <Input
              type="search"
              placeholder="Search for a movie or series..."
              value={query}
              onChange={handleInputChange}
              className="pl-10 transition-colors duration-150 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search for movies and series.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Command>
              <CommandInput placeholder="Type a movie or series..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Movies & Series">
                  {searchResults.map((result) => (
                    <CommandItem key={result.id}>
                      {result.title}
                      <AddToList item={result} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
