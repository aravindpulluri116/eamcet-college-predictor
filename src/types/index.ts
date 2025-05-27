
export interface CollegeRawData {
  "TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"?: string | number; // Inst Code
  "Column2"?: string | number;  // Institute Name
  "Column3"?: string | number;  // Place
  "Column4"?: string | number;  // Dist Code
  "Column5"?: string | number;  // Co Education
  "Column6"?: string | number;  // College Type
  "Column7"?: string | number;  // Year of Estab
  "Column8"?: string | number;  // Branch Code
  "Column9"?: string | number;  // Branch Name
  "Column10"?: string | number; // OC BOYS
  "Column11"?: string | number; // OC GIRLS
  "Column12"?: string | number; // BC_A BOYS
  "Column13"?: string | number; // BC_A GIRLS
  "Column14"?: string | number; // BC_B BOYS
  "Column15"?: string | number; // BC_B GIRLS
  "Column16"?: string | number; // BC_C BOYS
  "Column17"?: string | number; // BC_C GIRLS
  "Column18"?: string | number; // BC_D BOYS
  "Column19"?: string | number; // BC_D GIRLS
  "Column20"?: string | number; // BC_E BOYS
  "Column21"?: string | number; // BC_E GIRLS
  "Column22"?: string | number; // SC BOYS
  "Column23"?: string | number; // SC GIRLS
  "Column24"?: string | number; // ST BOYS
  "Column25"?: string | number; // ST GIRLS
  "Column26"?: string | number; // EWS GEN OU (EWS BOYS)
  "Column27"?: string | number; // EWS GIRLS OU (EWS GIRLS)
  "Column28"?: string | number; // Tuition Fee
  "Column29"?: string | number; // Affiliated To
  [key: string]: string | number | undefined | null;
}

export interface UserInput {
  userRank: number;
  rankCategory: "OC" | "BC_A" | "BC_B" | "BC_C" | "BC_D" | "BC_E" | "SC" | "ST" | "EWS";
  gender: "BOYS" | "GIRLS";
  branches: string[];
}

export interface PredictedCollege {
  instCode: string;
  collegeName: string;
  tuitionFee: string;
  cutoffRank: number; 
  parsedCutoffRankDisplay: string; 
  location: {
    place: string;
    district: string;
  };
  branchName: string;
  rankCategoryUsed: string;
}

export interface PredictionResult {
  colleges?: PredictedCollege[];
  analysis?: { analysis: string };
  summary?: { summary: string };
  error?: string;
}
