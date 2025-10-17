import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PomodoroTimerProps {
  userId: string;
  onSessionComplete: () => void;
}

const PomodoroTimer = ({ userId, onSessionComplete }: PomodoroTimerProps) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Session complete!
            completeSession();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, minutes, seconds]);

  const completeSession = async () => {
    setIsRunning(false);
    const duration = 25; // Standard Pomodoro
    const pointsEarned = 10;

    // Save session and update points
    try {
      await supabase.from("focus_sessions").insert({
        user_id: userId,
        duration_minutes: duration,
        points_earned: pointsEarned,
      });

      await supabase.rpc("increment_user_points", {
        user_id: userId,
        points: pointsEarned,
      });

      toast.success(
        `🎉 Focus session complete! +${pointsEarned} points`,
        {
          description: "Time for a break!",
        }
      );

      onSessionComplete();
      reset();
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    }
  };

  const toggle = () => {
    if (!isRunning) {
      setSessionStart(Date.now());
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    setSessionStart(null);
  };

  const progress = ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Pomodoro Timer</h2>
        <p className="text-sm text-muted-foreground">
          25 minutes of focused work
        </p>
      </div>

      {/* Circular Progress */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {isRunning ? "Focusing..." : "Ready to focus"}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          size="lg"
          onClick={toggle}
          className="bg-gradient-to-r from-primary to-primary-glow"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button size="lg" variant="outline" onClick={reset}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};

export default PomodoroTimer;
