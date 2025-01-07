import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, GitFork } from "lucide-react";
import { LibraryRecommendation } from "@/lib/github";

type LibraryCardProps = {
  library: LibraryRecommendation;
};

export function LibraryCard({ library }: LibraryCardProps) {
  return (
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {library.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {library.forks.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{library.description}</p>
        <div className="flex flex-wrap gap-2">
          {library.topics.map((topic) => (
            <Badge key={topic} variant="secondary">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
