import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Search, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
}

interface UserProgressProps {
  points: number;
  level: number;
  achievements: Achievement[];
}

const POINTS_PER_LEVEL = 100;

export function UserProgress({ points, level, achievements }: UserProgressProps) {
  const progressToNextLevel = (points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100;
  const remainingPoints = POINTS_PER_LEVEL - (points % POINTS_PER_LEVEL);

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case "trophy": return <Trophy className="h-4 w-4" />;
      case "star": return <Star className="h-4 w-4" />;
      case "search": return <Search className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Progress</CardTitle>
          <CardDescription>Level {level} Explorer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{remainingPoints} points to go</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Recent Achievements</h4>
            <div className="grid gap-2">
              {achievements.map((achievement) => (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      {getAchievementIcon(achievement.icon)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">+{achievement.points}</Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{achievement.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Total Points: {points}
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
