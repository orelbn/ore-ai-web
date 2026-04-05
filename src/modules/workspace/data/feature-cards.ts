import { Coffee, Dumbbell, Swords, type LucideIcon } from "lucide-react";

export type ConversationFeatureCard = {
  description: string;
  icon: LucideIcon;
  prompt: string;
  title: string;
};

export const FEATURE_CARDS: ConversationFeatureCard[] = [
  {
    icon: Coffee,
    title: "Coffee Places",
    description: "Explore Orel's favourite coffee places.",
    prompt: "What are Orel's favorite coffee shops?",
  },
  {
    icon: Swords,
    title: "MMA Hot Takes",
    description: "Get Orel's take on recent MMA fights.",
    prompt: "What are Orel's hot takes on recent MMA fights?",
  },
  {
    icon: Dumbbell,
    title: "Workout Routine",
    description: "See how Orel is staying active these days.",
    prompt: "What is Orel's workout routine?",
  },
];
