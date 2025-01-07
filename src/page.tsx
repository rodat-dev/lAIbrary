import { useState } from "react";
import { LibraryCard } from "../client/src/components/LibraryCard";
import { ResultsList } from "../client/src/components/ResultsList";
import { UserProgress } from "../client/src/components/UserProgress";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../client/src/components/ui/card";
import { ScrollArea } from "../client/src/components/ui/scroll-area";
import { LibraryRecommendation } from "../client/src/lib/github";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../client/src/lib/queryClient";
import { Toaster } from "../client/src/components/ui/toaster";
import "../client/src/index.css";

// Main plugin view component
export default function PluginView() {
  const [searchParams, setSearchParams] = useState<{
    language: string;
    description: string;
    example?: string;
  } | null>(null);

  // TODO: Replace with actual user authentication
  const mockUserId = 1; // Temporary user ID for testing bookmarks

  const { data: results, isLoading } = useQuery<LibraryRecommendation[]>({
    queryKey: ['/api/search', searchParams?.language, searchParams?.description, searchParams?.example],
    queryFn: async () => {
      if (!searchParams) return [];
      const params = new URLSearchParams({
        language: searchParams.language,
        description: searchParams.description,
        ...(searchParams.example ? { example: searchParams.example } : {})
      });
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    enabled: !!searchParams,
  });

  // Mock user progress data (will be replaced with real data from API)
  const userProgress = {
    points: 75,
    level: 2,
    achievements: [
      {
        id: 1,
        name: "First Search",
        description: "Completed your first library search",
        icon: "search",
        points: 10,
        unlockedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Language Explorer",
        description: "Searched for libraries in multiple languages",
        icon: "star",
        points: 20,
        unlockedAt: new Date().toISOString(),
      },
    ],
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  GitHub Library Finder
                </h1>
                <p className="text-muted-foreground text-lg">
                  Find the perfect library for your next project
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <SearchForm onSearch={setSearchParams} />
                </CardContent>
              </Card>

              {(searchParams || isLoading) && (
                <ScrollArea className="h-[600px] rounded-lg border">
                  <ResultsList 
                    results={results} 
                    isLoading={isLoading} 
                    userId={mockUserId}
                  />
                </ScrollArea>
              )}
            </div>

            <div className="lg:sticky lg:top-8 space-y-8">
              <UserProgress {...userProgress} />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}