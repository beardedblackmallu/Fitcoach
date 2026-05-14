// Hardcoded data with realistic Indian context

export type ClientStatus = "Active" | "Paused" | "Expired";

export interface Client {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  plan: string;
  startDate: string;
  compliance: number;
  weightStart: number;
  weightCurrent: number;
  weightTarget: number;
  status: ClientStatus;
  goal: string;
  weekOfPlan: number;
  totalWeeks: number;
  joinedWeeksAgo: number;
  weightHistory: { week: string; kg: number }[];
  workoutCompliance: number;
  nutritionCompliance: number;
  online?: boolean;
  lastSeen?: string;
  // Intake / health profile
  email?: string;
  age?: number;
  gender?: "Male" | "Female" | "Prefer not to say";
  heightCm?: number;
  dietPreference?: "Vegetarian" | "Non-vegetarian" | "Eggetarian" | "Vegan";
  workoutPreference?: "Gym" | "Home" | "Hybrid";
  wheyUse?: "Yes" | "No" | "Not sure";
  allergies?: string;
  injuries?: string;
  medicalConditions?: string;
  intakeNotes?: string;
}

export const clients: Client[] = [
  {
    id: "priya",
    name: "Priya Sharma",
    initials: "PS",
    avatarColor: "bg-rose-500",
    phone: "+91 98765 43210",
    plan: "12-Week Transformation",
    startDate: "15 Mar 2026",
    compliance: 84,
    weightStart: 78.0,
    weightCurrent: 75.2,
    weightTarget: 73.0,
    status: "Active",
    goal: "Lose 5 kg by March 2026",
    weekOfPlan: 3,
    totalWeeks: 12,
    joinedWeeksAgo: 8,
    workoutCompliance: 84,
    nutritionCompliance: 71,
    lastSeen: "2h ago",
    email: "priya.s@gmail.com",
    age: 32,
    gender: "Female",
    heightCm: 165,
    dietPreference: "Eggetarian",
    workoutPreference: "Gym",
    wheyUse: "Yes",
    allergies: "None",
    injuries: "Lower back strain (2 years back). Right shoulder discomfort occasionally.",
    medicalConditions: "None",
    intakeNotes: "Prefers morning workouts. Travels for work occasionally — needs hotel gym backup plans.",
    weightHistory: [
      { week: "W1", kg: 78.0 },
      { week: "W2", kg: 77.4 },
      { week: "W3", kg: 76.9 },
      { week: "W4", kg: 76.5 },
      { week: "W5", kg: 76.1 },
      { week: "W6", kg: 75.8 },
      { week: "W7", kg: 75.5 },
      { week: "W8", kg: 75.2 },
    ],
  },
  {
    id: "rohan",
    name: "Rohan Kapoor",
    initials: "RK",
    avatarColor: "bg-blue-500",
    phone: "+91 98123 11045",
    plan: "Strength Foundation 8-week",
    startDate: "01 Apr 2026",
    compliance: 62,
    weightStart: 82.0,
    weightCurrent: 81.4,
    weightTarget: 78.0,
    status: "Active",
    goal: "Build strength + lose 4 kg",
    weekOfPlan: 5,
    totalWeeks: 8,
    joinedWeeksAgo: 5,
    workoutCompliance: 62,
    nutritionCompliance: 55,
    lastSeen: "2h ago",
    weightHistory: [
      { week: "W1", kg: 82.0 },
      { week: "W2", kg: 81.9 },
      { week: "W3", kg: 81.7 },
      { week: "W4", kg: 81.5 },
      { week: "W5", kg: 81.4 },
    ],
  },
  {
    id: "anita",
    name: "Anita Desai",
    initials: "AD",
    avatarColor: "bg-amber-500",
    phone: "+91 99887 22334",
    plan: "Fat Loss + Toning 12-week",
    startDate: "20 Feb 2026",
    compliance: 91,
    weightStart: 68.0,
    weightCurrent: 64.1,
    weightTarget: 62.0,
    status: "Active",
    goal: "Tone up + drop 6 kg",
    weekOfPlan: 11,
    totalWeeks: 12,
    joinedWeeksAgo: 11,
    workoutCompliance: 92,
    nutritionCompliance: 88,
    lastSeen: "18 min ago",
    weightHistory: [
      { week: "W1", kg: 68.0 },
      { week: "W4", kg: 66.5 },
      { week: "W7", kg: 65.2 },
      { week: "W11", kg: 64.1 },
    ],
  },
  {
    id: "karan",
    name: "Karan Mehta",
    initials: "KM",
    avatarColor: "bg-violet-500",
    phone: "+91 90123 45566",
    plan: "Muscle Building 16-week",
    startDate: "10 Jan 2026",
    compliance: 78,
    weightStart: 65.0,
    weightCurrent: 68.4,
    weightTarget: 72.0,
    status: "Active",
    goal: "Gain 7 kg lean muscle",
    weekOfPlan: 9,
    totalWeeks: 16,
    joinedWeeksAgo: 9,
    workoutCompliance: 80,
    nutritionCompliance: 76,
    lastSeen: "30 min ago",
    weightHistory: [
      { week: "W1", kg: 65.0 },
      { week: "W3", kg: 65.8 },
      { week: "W5", kg: 66.7 },
      { week: "W7", kg: 67.5 },
      { week: "W9", kg: 68.4 },
    ],
  },
  {
    id: "neha",
    name: "Neha Singh",
    initials: "NS",
    avatarColor: "bg-emerald-500",
    phone: "+91 98989 77665",
    plan: "Postnatal Recovery 8-week",
    startDate: "12 Mar 2026",
    compliance: 88,
    weightStart: 72.5,
    weightCurrent: 70.0,
    weightTarget: 68.0,
    status: "Active",
    goal: "Postnatal recovery + strength",
    weekOfPlan: 8,
    totalWeeks: 8,
    joinedWeeksAgo: 8,
    workoutCompliance: 90,
    nutritionCompliance: 82,
    lastSeen: "1h ago",
    weightHistory: [
      { week: "W1", kg: 72.5 },
      { week: "W3", kg: 71.8 },
      { week: "W5", kg: 71.0 },
      { week: "W8", kg: 70.0 },
    ],
  },
  {
    id: "arjun",
    name: "Arjun Reddy",
    initials: "AR",
    avatarColor: "bg-orange-500",
    phone: "+91 96321 88990",
    plan: "Athlete Performance 12-week",
    startDate: "05 Mar 2026",
    compliance: 70,
    weightStart: 75.0,
    weightCurrent: 74.2,
    weightTarget: 73.0,
    status: "Active",
    goal: "Improve sprint performance",
    weekOfPlan: 9,
    totalWeeks: 12,
    joinedWeeksAgo: 9,
    workoutCompliance: 72,
    nutritionCompliance: 65,
    lastSeen: "5h ago",
    weightHistory: [
      { week: "W1", kg: 75.0 },
      { week: "W4", kg: 74.8 },
      { week: "W7", kg: 74.5 },
      { week: "W9", kg: 74.2 },
    ],
  },
  {
    id: "vikram",
    name: "Vikram Iyer",
    initials: "VI",
    avatarColor: "bg-cyan-500",
    phone: "+91 91234 67890",
    plan: "General Fitness 12-week",
    startDate: "18 Feb 2026",
    compliance: 55,
    weightStart: 88.0,
    weightCurrent: 86.5,
    weightTarget: 80.0,
    status: "Paused",
    goal: "Improve overall fitness",
    weekOfPlan: 6,
    totalWeeks: 12,
    joinedWeeksAgo: 11,
    workoutCompliance: 55,
    nutritionCompliance: 48,
    lastSeen: "3 days ago",
    weightHistory: [
      { week: "W1", kg: 88.0 },
      { week: "W3", kg: 87.4 },
      { week: "W6", kg: 86.5 },
    ],
  },
  {
    id: "sneha",
    name: "Sneha Nair",
    initials: "SN",
    avatarColor: "bg-pink-500",
    phone: "+91 99001 23456",
    plan: "Yoga + Strength 8-week",
    startDate: "22 Mar 2026",
    compliance: 95,
    weightStart: 60.0,
    weightCurrent: 58.5,
    weightTarget: 57.0,
    status: "Active",
    goal: "Tone + improve flexibility",
    weekOfPlan: 7,
    totalWeeks: 8,
    joinedWeeksAgo: 7,
    workoutCompliance: 96,
    nutritionCompliance: 90,
    lastSeen: "12 min ago",
    weightHistory: [
      { week: "W1", kg: 60.0 },
      { week: "W4", kg: 59.2 },
      { week: "W7", kg: 58.5 },
    ],
  },
  {
    id: "aditya",
    name: "Aditya Verma",
    initials: "AV",
    avatarColor: "bg-indigo-500",
    phone: "+91 90909 11223",
    plan: "Strength Foundation 8-week",
    startDate: "10 Jan 2026",
    compliance: 0,
    weightStart: 80.0,
    weightCurrent: 79.5,
    weightTarget: 75.0,
    status: "Expired",
    goal: "Build base strength",
    weekOfPlan: 8,
    totalWeeks: 8,
    joinedWeeksAgo: 16,
    workoutCompliance: 64,
    nutritionCompliance: 52,
    lastSeen: "2 weeks ago",
    weightHistory: [
      { week: "W1", kg: 80.0 },
      { week: "W4", kg: 79.7 },
      { week: "W8", kg: 79.5 },
    ],
  },
  {
    id: "pooja",
    name: "Pooja Kapoor",
    initials: "PK",
    avatarColor: "bg-teal-600",
    phone: "+91 98654 32109",
    plan: "Fat Loss 12-week",
    startDate: "01 Mar 2026",
    compliance: 81,
    weightStart: 70.0,
    weightCurrent: 67.8,
    weightTarget: 64.0,
    status: "Active",
    goal: "Drop 6 kg before wedding",
    weekOfPlan: 10,
    totalWeeks: 12,
    joinedWeeksAgo: 10,
    workoutCompliance: 82,
    nutritionCompliance: 79,
    lastSeen: "45 min ago",
    weightHistory: [
      { week: "W1", kg: 70.0 },
      { week: "W4", kg: 69.0 },
      { week: "W7", kg: 68.4 },
      { week: "W10", kg: 67.8 },
    ],
  },
];

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

// Conversations / messages
export type MessageSender = "bot" | "trainer" | "client" | "system";
export type MessageKind = "text" | "voice" | "image";

export interface Message {
  id: string;
  sender: MessageSender;
  kind: MessageKind;
  text?: string;
  imageUrl?: string;
  voiceLength?: string; // "0:34"
  time: string; // "9:32 AM"
  fromName?: string; // "From Sandeep" / "Auto"
}

export interface ConversationSeed {
  clientId: string;
  preview: string;
  unread: number;
  lastTime: string;
  lastFromBot?: boolean;
  messages: Message[];
}

export const conversations: ConversationSeed[] = [
  {
    clientId: "priya",
    preview: "Logged: dal makhani 150g, jeera rice...",
    unread: 0,
    lastTime: "1:13 PM",
    lastFromBot: true,
    messages: [
      { id: "m1", sender: "bot", kind: "text", text: "Good morning Priya! Time for your check-in. Please share: weight, sleep hours, energy (1-10)", time: "7:00 AM" },
      { id: "m2", sender: "client", kind: "text", text: "75.2 kg, slept 7 hours, energy 8", time: "7:14 AM" },
      { id: "m3", sender: "bot", kind: "text", text: "Logged. Have a great workout today 💪", time: "7:14 AM" },
      { id: "m4", sender: "trainer", kind: "text", text: "Great consistency this week Priya! Try to hit 8 hours sleep tonight, your energy will jump.", time: "9:32 AM", fromName: "From Sandeep" },
      { id: "m5", sender: "trainer", kind: "voice", voiceLength: "0:34", time: "9:33 AM", fromName: "From Sandeep" },
      { id: "m6", sender: "client", kind: "text", text: "Thanks coach!", time: "9:35 AM" },
      { id: "m7", sender: "client", kind: "image", text: "logging lunch", imageUrl: "food", time: "1:12 PM" },
      { id: "m8", sender: "bot", kind: "text", text: "Logged: dal makhani 150g, jeera rice 100g, roti x 2. Total: 612 kcal, 24g protein, 88g carbs, 18g fat.", time: "1:13 PM" },
    ],
  },
  {
    clientId: "karan",
    preview: "is creatine safe to take with my BP medication?",
    unread: 2,
    lastTime: "12:45 PM",
    messages: [
      { id: "m1", sender: "bot", kind: "text", text: "Hi Karan! Reminder: log today's workout when you're done.", time: "10:30 AM" },
      { id: "m2", sender: "client", kind: "text", text: "Done with chest day, 4 sets of bench at 60kg, all reps", time: "12:30 PM" },
      { id: "m3", sender: "bot", kind: "text", text: "Logged ✓ Great session.", time: "12:30 PM" },
      { id: "m4", sender: "client", kind: "text", text: "is creatine safe to take with my BP medication?", time: "12:45 PM" },
      { id: "m5", sender: "system", kind: "text", text: "🟡 Bot escalated to Sandeep — out-of-scope question", time: "12:45 PM" },
    ],
  },
  {
    clientId: "anita",
    preview: "my left knee has been hurting since yesterday's workout...",
    unread: 1,
    lastTime: "1:50 PM",
    messages: [
      { id: "m1", sender: "bot", kind: "text", text: "Good morning Anita! Time for your check-in. Please share weight, sleep, energy.", time: "6:30 AM" },
      { id: "m2", sender: "client", kind: "text", text: "64.1 kg, 8 hours, energy 7", time: "6:55 AM" },
      { id: "m3", sender: "bot", kind: "text", text: "Logged. Today is leg day 🏋️‍♀️", time: "6:55 AM" },
      { id: "m4", sender: "client", kind: "image", text: "breakfast", imageUrl: "food", time: "8:20 AM" },
      { id: "m5", sender: "bot", kind: "text", text: "Logged: 2 idli, sambar, coconut chutney. ~280 kcal, 9g protein.", time: "8:20 AM" },
      { id: "m6", sender: "client", kind: "text", text: "my left knee has been hurting since yesterday's workout, should I skip leg day?", time: "1:50 PM" },
      { id: "m7", sender: "system", kind: "text", text: "🟡 Bot escalated to Sandeep — medical concern detected", time: "1:50 PM" },
    ],
  },
  {
    clientId: "rohan",
    preview: "Pending morning check-in",
    unread: 1,
    lastTime: "9:00 AM",
    lastFromBot: true,
    messages: [
      { id: "m1", sender: "bot", kind: "text", text: "Good morning Rohan! Please share your check-in: weight, sleep, energy.", time: "7:00 AM" },
      { id: "m2", sender: "bot", kind: "text", text: "Friendly nudge — still waiting on your check-in 🙂", time: "9:00 AM" },
    ],
  },
  {
    clientId: "neha",
    preview: "Completed week 8! 🎉",
    unread: 0,
    lastTime: "11:20 AM",
    messages: [
      { id: "m1", sender: "client", kind: "text", text: "Completed week 8! 🎉", time: "11:18 AM" },
      { id: "m2", sender: "trainer", kind: "text", text: "So proud of you Neha — let's plan the next 8 weeks tonight.", time: "11:20 AM", fromName: "From Sandeep" },
    ],
  },
  {
    clientId: "arjun",
    preview: "Payment due reminder",
    unread: 0,
    lastTime: "10:00 AM",
    lastFromBot: true,
    messages: [
      { id: "m1", sender: "bot", kind: "text", text: "Hi Arjun, your plan renews in 3 days. Renewal amount ₹4,000. Pay link below.", time: "10:00 AM" },
    ],
  },
  {
    clientId: "sneha",
    preview: "Will send my workout video tonight",
    unread: 0,
    lastTime: "Yesterday",
    messages: [
      { id: "m1", sender: "client", kind: "text", text: "Will send my workout video tonight", time: "8:42 PM" },
    ],
  },
  {
    clientId: "pooja",
    preview: "Thanks Sandeep! Will follow this week.",
    unread: 0,
    lastTime: "Yesterday",
    messages: [
      { id: "m1", sender: "trainer", kind: "text", text: "Pooja, switch your evening snack to roasted chana — same calories, more protein.", time: "5:30 PM", fromName: "From Sandeep" },
      { id: "m2", sender: "client", kind: "text", text: "Thanks Sandeep! Will follow this week.", time: "5:42 PM" },
    ],
  },
];

export function getConversation(clientId: string) {
  return conversations.find((c) => c.clientId === clientId);
}

// Escalations
export type EscalationCategory = "Medical" | "Off-topic question" | "Compliance" | "Other";

export interface Escalation {
  id: string;
  clientId: string;
  category: EscalationCategory;
  reasonBadge: string;
  quotedMessage: string;
  whyEscalated: string;
  time: string;
  suggestedReplies: string[];
}

export const escalations: Escalation[] = [
  {
    id: "esc-1",
    clientId: "anita",
    category: "Medical",
    reasonBadge: "Medical concern detected",
    quotedMessage: "my left knee has been hurting since yesterday's workout, should I skip leg day?",
    whyEscalated: "The bot detected medical keywords (pain, hurt, injury) in the client's message. Medical concerns require professional judgment, so the bot deferred to you instead of guessing.",
    time: "23 min ago",
    suggestedReplies: [
      "Hi Anita, sorry to hear about the knee. Let's skip leg day for now. Can you describe the pain — sharp, dull, when does it hurt most?",
      "Anita, knee discomfort is something I want to check properly. Can we hop on a quick 5-min call?",
    ],
  },
  {
    id: "esc-2",
    clientId: "karan",
    category: "Off-topic question",
    reasonBadge: "Out-of-scope question",
    quotedMessage: "is creatine safe to take with my BP medication?",
    whyEscalated: "Bot detected a question about supplement-medication interaction, which requires professional judgment.",
    time: "1h ago",
    suggestedReplies: [
      "Karan, that's an important question and I want to give you a proper answer. What BP medication are you on?",
      "Let's not start creatine until we check with your doctor about the medication interaction. Send me the medicine name and I'll research it tonight.",
    ],
  },
];

// Today's check-ins for dashboard
export type CheckInStatus =
  | "Logged workout"
  | "Pending morning check-in"
  | "Sent food photo"
  | "New question"
  | "Completed week"
  | "Payment due in 3 days";

export interface CheckInItem {
  clientId: string;
  status: CheckInStatus;
  time: string;
  primaryAction: string;
}

export const todaysCheckins: CheckInItem[] = [
  { clientId: "priya", status: "Logged workout", time: "12 min ago", primaryAction: "View log" },
  { clientId: "rohan", status: "Pending morning check-in", time: "2h ago", primaryAction: "Send reminder" },
  { clientId: "anita", status: "Sent food photo", time: "18 min ago", primaryAction: "Review" },
  { clientId: "karan", status: "New question", time: "35 min ago", primaryAction: "Reply" },
  { clientId: "neha", status: "Completed week", time: "1h ago", primaryAction: "Plan next week" },
  { clientId: "arjun", status: "Payment due in 3 days", time: "Today", primaryAction: "Send link" },
];

// Plan builder data
export interface ExerciseEntry {
  id: string;
  name: string;
  detail: string; // "4×8 @ 80kg"
  notes?: string;
  rest?: boolean;
  videoUrl?: string;
}

export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const initialWeekPlan: Record<DayKey, ExerciseEntry[]> = {
  Mon: [
    { id: "mon-1", name: "Squat", detail: "4×8 @ 80kg" },
    { id: "mon-2", name: "Bench Press", detail: "4×8 @ 60kg" },
    { id: "mon-3", name: "Pull-ups", detail: "3×10" },
  ],
  Tue: [{ id: "tue-1", name: "Rest day", detail: "Recovery", rest: true }],
  Wed: [
    { id: "wed-1", name: "Deadlift", detail: "4×6 @ 100kg" },
    { id: "wed-2", name: "Overhead Press", detail: "3×10" },
    { id: "wed-3", name: "Barbell Row", detail: "3×8" },
  ],
  Thu: [{ id: "thu-1", name: "Rest day", detail: "Recovery", rest: true }],
  Fri: [
    { id: "fri-1", name: "Front Squat", detail: "4×6 @ 70kg" },
    { id: "fri-2", name: "Incline Bench", detail: "3×8 @ 50kg" },
    { id: "fri-3", name: "Lat Pulldown", detail: "3×12" },
  ],
  Sat: [{ id: "sat-1", name: "Cardio", detail: "30 min Zone 2 + 4×30s sprints" }],
  Sun: [{ id: "sun-1", name: "Rest day", detail: "Recovery", rest: true }],
};

export const exerciseLibrary = [
  { name: "Squat", category: "Legs" },
  { name: "Bench Press", category: "Push" },
  { name: "Deadlift", category: "Pull" },
  { name: "Overhead Press", category: "Push" },
  { name: "Pull-ups", category: "Pull" },
  { name: "Lat Pulldown", category: "Pull" },
  { name: "Barbell Row", category: "Pull" },
  { name: "Front Squat", category: "Legs" },
  { name: "Incline Bench", category: "Push" },
  { name: "Romanian Deadlift", category: "Legs" },
  { name: "Bicep Curls", category: "Pull" },
  { name: "Tricep Pushdowns", category: "Push" },
  { name: "Plank", category: "Core" },
  { name: "Cable Crunches", category: "Core" },
  { name: "Treadmill Cardio", category: "Cardio" },
];

// Notifications
export interface Notification {
  id: string;
  type: "escalation" | "activity" | "payment" | "warning";
  text: string;
  time: string;
  href: string;
}

export const notifications: Notification[] = [
  { id: "n1", type: "escalation", text: "Anita Desai needs attention — mentioned knee pain", time: "23 min ago", href: "/inbox" },
  { id: "n2", type: "escalation", text: "Karan Mehta asked about supplements", time: "1h ago", href: "/inbox" },
  { id: "n3", type: "activity", text: "Priya Sharma logged her workout", time: "12 min ago", href: "/conversations?c=priya" },
  { id: "n4", type: "payment", text: "Payment received from Neha Singh — ₹2,000", time: "3h ago", href: "/payments" },
  { id: "n5", type: "warning", text: "Rohan Kapoor missed morning check-in", time: "2h ago", href: "/conversations?c=rohan" },
];

// Plans
export type PlanType = "template" | "custom";

export interface Plan {
  id: string;
  name: string;
  durationWeeks: number;
  cycleLengthWeeks: number;
  cycles: number;
  clientIds: string[];
  lastEdited: string;
  description?: string;
  type: PlanType;
}

export const plans: Plan[] = [
  {
    id: "p-12wt",
    name: "12-Week Transformation",
    durationWeeks: 12,
    cycleLengthWeeks: 4,
    cycles: 3,
    clientIds: ["priya", "pooja", "anita", "arjun", "vikram"],
    lastEdited: "2 days ago",
    description: "Progressive overload with weekly nutrition adjustments. Built for clients ready to commit.",
    type: "template",
  },
  {
    id: "p-strength8",
    name: "Strength Foundations 8-week",
    durationWeeks: 8,
    cycleLengthWeeks: 4,
    cycles: 2,
    clientIds: ["rohan", "aditya"],
    lastEdited: "5 days ago",
    description: "Big-3 focused. Squat, bench, deadlift progressions for new lifters.",
    type: "template",
  },
  {
    id: "p-fatloss12",
    name: "Fat Loss + Toning 12-week",
    durationWeeks: 12,
    cycleLengthWeeks: 4,
    cycles: 3,
    clientIds: ["pooja"],
    lastEdited: "1 week ago",
    description: "Calorie deficit with metabolic resistance training. Suited to busy professionals.",
    type: "template",
  },
  {
    id: "p-hyper16",
    name: "Beginner Hypertrophy 16-week",
    durationWeeks: 16,
    cycleLengthWeeks: 4,
    cycles: 4,
    clientIds: ["karan"],
    lastEdited: "2 weeks ago",
    description: "Volume-focused split for new lifters who want size first, strength second.",
    type: "template",
  },
  {
    id: "p-postnatal8",
    name: "Postnatal Recovery 8-week",
    durationWeeks: 8,
    cycleLengthWeeks: 4,
    cycles: 2,
    clientIds: ["neha"],
    lastEdited: "3 days ago",
    description: "Core re-engagement, pelvic floor, gentle progression back to full strength training.",
    type: "template",
  },
  {
    id: "p-athlete12",
    name: "Athlete Performance 12-week",
    durationWeeks: 12,
    cycleLengthWeeks: 4,
    cycles: 3,
    clientIds: ["arjun", "sneha"],
    lastEdited: "yesterday",
    description: "Speed, power, and sport-specific conditioning blocks.",
    type: "template",
  },
];

export function getPlan(id: string) {
  return plans.find((p) => p.id === id);
}

// Exercise YouTube form-video links
export const exerciseVideos: Record<string, string> = {
  "Squat": "https://youtu.be/vOsvDTv19PA",
  "Bench Press": "https://youtu.be/0ewIJJKaTsY",
  "Deadlift": "https://youtu.be/qohkNmgWUuo",
  "Overhead Press": "https://youtu.be/mnd-lFF73oM",
  "Pull-ups": "https://youtu.be/XaXrn0hFGw4",
  "Lat Pulldown": "https://youtu.be/n1T9aOiuDQs",
  "Barbell Row": "https://youtu.be/EvcAxHUEX0Q",
  "Front Squat": "https://youtu.be/vOsvDTv19PA",
  "Incline Bench": "https://youtu.be/0ewIJJKaTsY",
  "Romanian Deadlift": "https://youtu.be/qohkNmgWUuo",
  "Bicep Curls": "https://youtu.be/SUnCUmbRJeQ",
  "Tricep Pushdowns": "https://youtu.be/sYr_FHRLQfI",
  "Plank": "https://youtu.be/SUnCUmbRJeQ",
  "Cable Crunches": "https://youtu.be/SUnCUmbRJeQ",
  "Treadmill Cardio": "https://youtu.be/SUnCUmbRJeQ",
  "Leg Press": "https://youtu.be/zWv-G9thuII",
};

export function getExerciseVideo(name: string): string {
  return exerciseVideos[name] ?? "https://youtu.be/SUnCUmbRJeQ";
}

export function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&/\s]+)/);
  return m ? m[1] : null;
}

// Nutrition plan
export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  carbs: number;
  fats: number;
  protein: number;
  fiber: number;
}

export interface MealVariant {
  id: string;
  label: string;
  foods: FoodItem[];
}

export interface Meal {
  id: string;
  name: string;
  variants: MealVariant[];
  notes?: string;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: Meal[];
  coachNotes: string;
  hungerSubs: string[];
}

const blankMeal = (id: string, name: string): Meal => ({
  id,
  name,
  variants: [
    { id: `${id}-primary`, label: "Primary option", foods: [] },
  ],
});

export const defaultNutritionPlan: NutritionPlan = {
  calories: 2100,
  protein: 130,
  carbs: 250,
  fats: 60,
  meals: [
    blankMeal("pre", "Pre-workout"),
    blankMeal("post", "Post-workout"),
    {
      id: "m1",
      name: "Meal 1 — Breakfast",
      variants: [
        {
          id: "m1-primary",
          label: "Primary option",
          foods: [
            { id: "m1-p-1", name: "Idly", quantity: "2 pieces", calories: 156, carbs: 30, fats: 2, protein: 5, fiber: 2 },
            { id: "m1-p-2", name: "Chutney", quantity: "2 tbsp", calories: 61, carbs: 2, fats: 6, protein: 1, fiber: 2 },
            { id: "m1-p-3", name: "Whole eggs", quantity: "2", calories: 173, carbs: 2, fats: 13, protein: 14, fiber: 0 },
            { id: "m1-p-4", name: "Egg whites", quantity: "2", calories: 34, carbs: 1, fats: 0, protein: 7, fiber: 0 },
            { id: "m1-p-5", name: "Fish oil capsule", quantity: "2000mg", calories: 20, carbs: 0, fats: 2, protein: 0, fiber: 0 },
          ],
        },
        {
          id: "m1-alt-1",
          label: "Alternative 1 (OR)",
          foods: [
            { id: "m1-a-1", name: "Oats", quantity: "50g", calories: 224, carbs: 37, fats: 5, protein: 8, fiber: 7 },
            { id: "m1-a-2", name: "Peanut butter", quantity: "1 tbsp", calories: 95, carbs: 4, fats: 8, protein: 4, fiber: 1 },
            { id: "m1-a-3", name: "Whey protein", quantity: "1 scoop", calories: 134, carbs: 5, fats: 2, protein: 25, fiber: 0 },
          ],
        },
      ],
    },
    blankMeal("m2", "Meal 2 — Lunch"),
    blankMeal("snacks", "Snacks"),
    blankMeal("m3", "Meal 3 — Dinner"),
  ],
  coachNotes:
    "Use only 1-1.5 tsp of oil/ghee per meal. Avoid coconut milk, peanuts, sugar in gravies. Eat 2 servings of vegetables and 1 serving of fruit daily. For hunger between meals: 1 protein bar OR handful of nuts OR a fruit OR buttermilk/sugar-free drink.",
  hungerSubs: [
    "1 protein bar",
    "Handful of nuts (max 15 peanuts / 10 almonds / 1 walnut)",
    "1 fruit (apple, pear, kiwi, orange)",
    "Buttermilk or sugar-free drink",
  ],
};


