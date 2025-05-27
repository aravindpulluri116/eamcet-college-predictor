
import type { UserInput } from '@/types';

export const RANK_CATEGORIES: UserInput['rankCategory'][] = [
  "OC", "BC_A", "BC_B", "BC_C", "BC_D", "BC_E", "SC", "ST", "EWS"
];

export const GENDERS: { value: UserInput['gender']; label: string }[] = [
  { value: "BOYS", label: "Boys" },
  { value: "GIRLS", label: "Girls" }
];

export const BRANCHES: string[] = [
  "COMPUTER SCIENCE AND ENGINEERING",
  "ELECTRONICS AND COMMUNICATION ENGINEERING",
  "INFORMATION TECHNOLOGY",
  "MECHANICAL ENGINEERING",
  "CIVIL ENGINEERING",
  "ELECTRICAL AND ELECTRONICS ENGINEERING",
  "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
  "COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)", // Corrected this line
  "COMPUTER SCIENCE AND BUSINESS SYSTEM"
  // Add more branches as needed or derive dynamically
];
