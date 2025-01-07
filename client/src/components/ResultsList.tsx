import { LibraryCard } from "@/components/LibraryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryRecommendation } from "@/lib/github";

type ResultsListProps = {
  results?: LibraryRecommendation[];
  isLoading: boolean;
};

export function ResultsList({ results, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!results?.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No libraries found matching your criteria
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {results.map((library) => (
        <LibraryCard key={library.url} library={library} />
      ))}
    </div>
  );
}
