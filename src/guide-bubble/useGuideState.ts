import { useState, useEffect, useCallback } from "react";

export interface CourseProgress {
  module: number;
  beat: number;
  title: string;
  status: "in-progress" | "complete";
  guideStep: number | null;
  interactiveStep?: string;
}

const POLL_INTERVAL = 2000;

/**
 * Guide steps hardcoded per module.
 * The key is the module number, the value maps guideStep → message.
 */
const GUIDE_STEPS: Record<number, Record<number, string>> = {
  0: {
    1: "Sign up here — use any email address (real or fake) and any password. It's all local, just for you.",
    2: "Welcome to YOUR app! This whole page — the header, the task list — is all running on your computer (it can't be accessed by anyone via the internet yet).",
    3: "I added your module checklist as tasks — you've already knocked out the first two!",
    4: "Try it out — check off a task, add a new one, or play with tags!",
    5: "See this page? It exists because the wasp config file has a route pointing \"/\" here. The blueprint decides what pages exist.",
    6: "This is the title you're about to change. What do you want YOUR app to be called?",
    7: "Look — it already updated! You didn't restart anything. That's hot reload in action.",
    8: "You described what you wanted, and it happened. That describe → see → adjust loop is the whole course.",
    9: "Next module, you'll add new info to these tasks — like a priority level — and build a real feature with it.",
  },
};

export function useCourseProgress(): CourseProgress | null {
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/course-progress.json", { cache: "no-store" });
      if (res.ok) {
        setProgress(await res.json());
      }
    } catch {
      // No progress file yet
    }
  }, []);

  useEffect(() => {
    fetchProgress();
    const id = setInterval(fetchProgress, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchProgress]);

  return progress;
}

export function getGuideMessage(progress: CourseProgress | null): string | null {
  if (!progress || progress.guideStep == null) return null;
  const moduleSteps = GUIDE_STEPS[progress.module];
  if (!moduleSteps) return null;
  return moduleSteps[progress.guideStep] ?? null;
}
