import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Zap, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatsPanelProps {
  points: number;
  userId: string;
}

const StatsPanel = ({ points, userId }: StatsPanelProps) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    if (points >= 50 && !quote) {
      fetchMotivationalQuote();
    }
  }, [points, userId]);

  const fetchStats = async () => {
    const { count } = await supabase
      .from("focus_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setSessionCount(count || 0);
  };

  const fetchMotivationalQuote = async () => {
    try {
      const response = await fetch("https://api.quotable.io/random?tags=motivational");
      const data = await response.json();
      setQuote(data.content);
    } catch (error) {
      console.error("Failed to fetch quote:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-3xl font-bold">{points}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span>{sessionCount} focus sessions completed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-accent" />
            <span>Next reward at {Math.ceil(points / 50) * 50} points</span>
          </div>
        </div>
      </Card>

      {quote && points >= 50 && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 animate-slide-up">
          <p className="text-sm font-medium mb-2">🎉 Reward Unlocked!</p>
          <p className="italic text-sm leading-relaxed">"{quote}"</p>
        </Card>
      )}
    </div>
  );
};

export default StatsPanel;
