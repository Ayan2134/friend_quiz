export type TemplateQuestion = {
  prompt: string;
  options: string[];
};

export type StarterPack = {
  id: string;
  name: string;
  description: string;
  titleSuffix: string;
  questions: TemplateQuestion[];
};

export const STARTER_PACKS: StarterPack[] = [
  {
    id: "classic",
    name: "Classic Bestie",
    description: "Everyday friendship lore — food, moods, and petty truths.",
    titleSuffix: "How well do you know me?",
    questions: [
      {
        prompt: "What's my go-to comfort food?",
        options: ["Pizza", "Ice cream", "Maggi / instant noodles", "Anything fried"],
      },
      {
        prompt: "How do I usually reply to texts?",
        options: ["Instantly", "Hours later", "Leaves on read", "Voice notes only"],
      },
      {
        prompt: "What am I most likely doing on a free Saturday?",
        options: ["Sleeping in", "Out with friends", "Doomscrolling", "Gym / walk"],
      },
      {
        prompt: "What's my biggest red flag (affectionately)?",
        options: ["Always late", "Overthinks everything", "Starts drama then naps", "Can't pick a restaurant"],
      },
      {
        prompt: "Which playlist vibe is most me?",
        options: ["Sad indie", "Bollywood bangers", "Rap / hip-hop", "Chaotic mix of everything"],
      },
      {
        prompt: "How do I handle conflict?",
        options: ["Talk it out", "Go silent", "Joke until it passes", "Write a long text"],
      },
      {
        prompt: "What's my dream weekend trip?",
        options: ["Beach", "Mountains", "City food crawl", "Staycation at home"],
      },
    ],
  },
  {
    id: "chaotic",
    name: "Chaotic Friend",
    description: "Unhinged prompts for people who thrive in group chats.",
    titleSuffix: "Prove you survive my chaos",
    questions: [
      {
        prompt: "What's my most likely 2am activity?",
        options: ["Overthinking life", "Ordering food", "Memes", "Calling someone randomly"],
      },
      {
        prompt: "Which conspiracy would I believe first?",
        options: ["Simulations are real", "Astrology runs the world", "My ex is watching my stories", "None — I'm too tired"],
      },
      {
        prompt: "What's my toxic trait in a friend group?",
        options: ["Starts plans then cancels", "Spills tea too fast", "Hogs the aux", "Ghosts then reappears like nothing happened"],
      },
      {
        prompt: "How would I survive a zombie apocalypse?",
        options: ["Lead the group", "Hide and snack", "Bargain with zombies", "Be the first to go"],
      },
      {
        prompt: "What's my signature apology?",
        options: ["A meme", "Food offering", "Long paragraph", "Pretend it never happened"],
      },
      {
        prompt: "Which superpower fits me?",
        options: ["Mind reading", "Invisibility", "Teleportation", "Unlimited battery / wifi"],
      },
    ],
  },
  {
    id: "deep",
    name: "Actually Know Me",
    description: "Softer, deeper questions for close friends.",
    titleSuffix: "Do you really know me?",
    questions: [
      {
        prompt: "What stresses me out the most?",
        options: ["Letting people down", "Being behind on work", "Feeling left out", "Uncertainty about the future"],
      },
      {
        prompt: "How do I recharge after a long day?",
        options: ["Alone time", "Talking to a close friend", "Music / shows", "A walk outside"],
      },
      {
        prompt: "What am I quietly proud of?",
        options: ["My loyalty", "My humor", "My work ethic", "How I show up for people"],
      },
      {
        prompt: "What's my love language (friendship edition)?",
        options: ["Quality time", "Thoughtful gifts", "Words of affirmation", "Acts of service"],
      },
      {
        prompt: "What do I want more of this year?",
        options: ["Peace", "Adventure", "Closer friendships", "Confidence"],
      },
      {
        prompt: "When I'm sad, what helps most?",
        options: ["Someone checking in", "Space to process", "A distraction", "A good cry then food"],
      },
      {
        prompt: "What's a fear I don't talk about much?",
        options: ["Being forgotten", "Failing publicly", "Ending up alone", "Not living up to potential"],
      },
    ],
  },
];

export function getPack(id: string): StarterPack | undefined {
  return STARTER_PACKS.find((p) => p.id === id);
}
