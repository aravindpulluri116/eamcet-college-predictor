
import type { CollegeRawData, PredictedCollege, UserInput } from '@/types';
import collegeDataJson from '@/lib/data/college-data.json';

// This function generates the display name for the rank category (used for AI prompt and potentially UI)
function getDisplayRankColumnName(rankCategory: UserInput['rankCategory'], gender: UserInput['gender']): string {
  if (rankCategory === "EWS") {
    return gender === "BOYS" ? "EWS GEN OU" : "EWS GIRLS OU";
  }
  return `${rankCategory} ${gender}`;
}

// This function gets the actual JSON key for the rank column
function getActualRankColumnKey(rankCategory: UserInput['rankCategory'], gender: UserInput['gender']): keyof CollegeRawData | null {
  if (rankCategory === "OC") return gender === "BOYS" ? "Column10" : "Column11";
  if (rankCategory === "BC_A") return gender === "BOYS" ? "Column12" : "Column13";
  if (rankCategory === "BC_B") return gender === "BOYS" ? "Column14" : "Column15";
  if (rankCategory === "BC_C") return gender === "BOYS" ? "Column16" : "Column17";
  if (rankCategory === "BC_D") return gender === "BOYS" ? "Column18" : "Column19";
  if (rankCategory === "BC_E") return gender === "BOYS" ? "Column20" : "Column21";
  if (rankCategory === "SC") return gender === "BOYS" ? "Column22" : "Column23";
  if (rankCategory === "ST") return gender === "BOYS" ? "Column24" : "Column25";
  if (rankCategory === "EWS") return gender === "BOYS" ? "Column26" : "Column27"; // "EWS GEN OU" and "EWS GIRLS OU"
  return null;
}

function parseRank(rankStr: string | number | undefined): number | null {
  if (rankStr === undefined || rankStr === null) {
    return null;
  }
  if (typeof rankStr === 'number') {
    // If it's already a number, return it if it's not NaN, otherwise null
    return !isNaN(rankStr) ? rankStr : null;
  }
  // If it's a string, process it
  if (typeof rankStr === 'string') {
    const trimmedRankStr = rankStr.trim();
    if (trimmedRankStr.toUpperCase() === "NA" || trimmedRankStr === "") {
      return null;
    }
    const parsed = parseInt(trimmedRankStr, 10);
    return !isNaN(parsed) ? parsed : null;
  }
  // If it's neither number, string, undefined, nor null (shouldn't happen with current types)
  return null;
}


export async function predictCollege(userInput: UserInput): Promise<PredictedCollege | null> {
  // Filter out header, nulls, and disclaimer rows
  const actualDataRows = (collegeDataJson as CollegeRawData[])
    .filter(row => 
      row && 
      typeof row["TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"] === 'string' && 
      row["TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"] !== "Inst\n Code" &&
      row["Column2"] !== "Disclaimer:" // Explicitly filter out disclaimer markers
    );

  const rankJsonAccessKey = getActualRankColumnKey(userInput.rankCategory, userInput.gender);

  if (!rankJsonAccessKey) {
    console.error("Could not determine rank JSON access key for category:", userInput.rankCategory, "and gender:", userInput.gender);
    return null;
  }

  const displayRankCategoryUsed = getDisplayRankColumnName(userInput.rankCategory, userInput.gender);

  const qualifiedColleges = actualDataRows
    .map(college => {
      const cutoffRankStr = college[rankJsonAccessKey];
      const cutoffRank = parseRank(cutoffRankStr);
      return { 
        ...college, // Keep all original data from the row
        cutoffRank, // Parsed numeric rank
        parsedCutoffRankDisplay: cutoffRankStr !== undefined && cutoffRankStr !== null ? String(cutoffRankStr) : "N/A" // Store original for display
      };
    })
    .filter(college => {
      const collegeBranchName = college["Column9"]; // Branch Name from JSON
      const branchNameMatches = typeof collegeBranchName === 'string' && 
                                collegeBranchName.trim().toUpperCase() === userInput.branch.trim().toUpperCase();
      
      return branchNameMatches &&
             college.cutoffRank !== null &&
             userInput.userRank <= college.cutoffRank;
    });

  if (qualifiedColleges.length === 0) {
    return null;
  }

  // Sort by cutoffRank (ascending - lower rank is better)
  qualifiedColleges.sort((a, b) => (a.cutoffRank!) - (b.cutoffRank!));

  const topCollegeRaw = qualifiedColleges[0];

  // Ensure all fields being accessed for the result exist or provide defaults
  const collegeName = String(topCollegeRaw["Column2"] || "N/A"); // Institute Name
  const tuitionFee = String(topCollegeRaw["Column28"] || "N/A");  // Tuition Fee
  const place = String(topCollegeRaw["Column3"] || "N/A"); // Place
  const district = String(topCollegeRaw["Column4"] || "N/A"); // Dist Code
  const branchName = String(topCollegeRaw["Column9"] || "N/A"); // Branch Name

  return {
    collegeName,
    tuitionFee,
    cutoffRank: topCollegeRaw.cutoffRank!, // Already confirmed not null by filter
    parsedCutoffRankDisplay: topCollegeRaw.parsedCutoffRankDisplay,
    location: {
      place,
      district,
    },
    branchName,
    rankCategoryUsed: displayRankCategoryUsed 
  };
}
