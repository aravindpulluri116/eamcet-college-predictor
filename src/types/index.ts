export interface CollegeRawData {
  [key: string]: string | number | undefined; // Allows for dynamic rank category keys
  "Inst Code": string;
  "Institute Name": string;
  "Place": string;
  "Dist Code": "HYD" | "RRD" | string; // Making it more specific with known codes, but open
  "Co Education": string;
  "College Type": string;
  "Year of Estab": string; // Could be number, but keeping as string from dataset
  "Branch Code": string;
  "Branch Name": "COMPUTER SCIENCE AND ENGINEERING" | "ELECTRONICS AND COMMUNICATION ENGINEERING" | "INFORMATION TECHNOLOGY" | "MECHANICAL ENGINEERING" | "CIVIL ENGINEERING" | "ELECTRICAL AND ELECTRONICS ENGINEERING" | string;
  "Tuition Fee": string; // Could be number
  "Affiliated To": string;
  // Rank columns like "OC BOYS", "BC_A GIRLS" will be accessed dynamically
}

export interface CollegeDataset {
  "TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE": CollegeRawData[];
}

export interface UserInput {
  userRank: number;
  rankCategory: "OC" | "BC_A" | "BC_B" | "BC_C" | "BC_D" | "BC_E" | "SC" | "ST" | "EWS";
  gender: "BOYS" | "GIRLS";
  branch: string;
  userPreferences: string;
}

export interface PredictedCollege {
  collegeName: string;
  tuitionFee: string;
  cutoffRank: number; // Storing as number after parsing
  parsedCutoffRankDisplay: string; // Original string value of cutoff for display
  location: {
    place: string;
    district: string;
  };
  branchName: string;
  rankCategoryUsed: string; // e.g. "OC BOYS"
}

export interface PredictionResult {
  college?: PredictedCollege;
  analysis?: { analysis: string };
  summary?: { summary: string };
  error?: string;
}
