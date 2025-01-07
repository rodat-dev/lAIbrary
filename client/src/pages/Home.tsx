import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ResultsList } from "@/components/ResultsList";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LibraryRecommendation } from "@/lib/github";

export default function Home() {
  const [searchParams, setSearchParams] = useState<{
    language: string;
    description: string;
    example?: string;
  } | null>(null);

  const { data: results, isLoading } = useQuery<LibraryRecommendation[]>({
    queryKey: ['/api/search', searchParams?.language, searchParams?.description, searchParams?.example],
    enabled: !!searchParams,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
              <ResultsList results={results} isLoading={isLoading} />
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
