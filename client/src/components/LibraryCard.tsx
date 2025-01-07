import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, GitFork, Zap, Bookmark } from "lucide-react";
import { LibraryRecommendation } from "@/lib/github";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type LibraryCardProps = {
  library: LibraryRecommendation;
  userId?: number;
  isBookmarked?: boolean;
  bookmarkId?: number;
};

export function LibraryCard({ library, userId, isBookmarked = false, bookmarkId }: LibraryCardProps) {
  const { analysis } = library;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: async () => {
      if (isBookmarked && bookmarkId) {
        await fetch(`/api/bookmarks/${bookmarkId}?userId=${userId}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            libraryId: library.id,
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Library bookmarked",
        description: isBookmarked 
          ? "The library has been removed from your bookmarks" 
          : "The library has been added to your bookmarks",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getComplexityColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold hover:underline">
                <a
                  href={library.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  {library.name}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </h3>
              <p className="text-sm text-muted-foreground">
                by {library.owner}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleBookmark()}
                  className={isBookmarked ? "text-primary" : "text-muted-foreground"}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {library.stars.toLocaleString()}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub Stars</p>
                    <p className="text-xs text-muted-foreground">
                      Indicates project popularity
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {library.forks.toLocaleString()}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub Forks</p>
                    <p className="text-xs text-muted-foreground">
                      Indicates active development and community involvement
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{library.description}</p>

          {analysis && (
            <div className="mb-4 p-3 bg-muted rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={analysis.isOpenSource ? "default" : "secondary"}>
                      {analysis.isOpenSource ? "Open Source" : "Proprietary"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{analysis.isOpenSource 
                      ? "This library is open source and free to use" 
                      : "This is a proprietary library with usage restrictions"}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {!analysis.isOpenSource && analysis.pricing && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline">
                        {analysis.pricing.type === "paid" 
                          ? `Paid (from ${analysis.pricing.startingPrice})` 
                          : analysis.pricing.type === "freemium" 
                            ? "Freemium" 
                            : "Free"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {analysis.pricing.type === "paid" && (
                        <div className="space-y-2">
                          <p>Paid License Required</p>
                          <p className="text-xs text-muted-foreground">
                            Starting from {analysis.pricing.startingPrice}
                          </p>
                        </div>
                      )}
                      {analysis.pricing.type === "freemium" && (
                        <div className="space-y-2">
                          <p>Free tier available</p>
                          <p className="text-xs text-muted-foreground">
                            Premium features require paid license
                          </p>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
                        Integration Complexity: {analysis.integrationComplexity}/5
                      </span>
                    </div>
                    <Progress 
                      value={analysis.integrationComplexity * 20} 
                      className={`h-2 ${getComplexityColor(analysis.integrationComplexity)}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="w-64">
                    <div className="space-y-2">
                      <p className="font-medium">Integration Complexity Score: {analysis.integrationComplexity}/5</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.complexityReason}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        <p>1-2: Easy to integrate</p>
                        <p>3: Moderate complexity</p>
                        <p>4-5: Complex integration</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {library.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}