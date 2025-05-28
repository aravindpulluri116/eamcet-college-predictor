
import type { CollegeRawData, PredictedCollege, UserInput } from '@/types';
import collegeDataJson from '@/lib/data/college-data.json';
import { ALL_BRANCHES_IDENTIFIER } from '@/lib/constants';

// Helper function to normalize branch names for comparison
function normalizeBranchName(name: string | undefined | null): string {
  if (typeof name !== 'string') {
    return '';
  }
  return name.trim().replace(/\s\s+/g, ' ').toUpperCase();
}

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

function parseRank(rankStr: string | number | undefined | null): number | null {
  if (rankStr === undefined || rankStr === null) {
    return null;
  }
  if (typeof rankStr === 'number') {
    return !isNaN(rankStr) ? rankStr : null;
  }
  if (typeof rankStr === 'string') {
    const trimmedRankStr = rankStr.trim();
    if (trimmedRankStr.toUpperCase() === "NA" || trimmedRankStr === "" || trimmedRankStr === "-") {
      return null;
    }
    const parsed = parseInt(trimmedRankStr, 10);
    return !isNaN(parsed) ? parsed : null;
  }
  return null;
}


export async function predictCollege(userInput: UserInput): Promise<PredictedCollege[] | null> {
  const actualDataRows = (collegeDataJson as CollegeRawData[])
    .filter(row =>
      row &&
      typeof row["TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"] === 'string' &&
      row["TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"] !== "Inst\n Code" &&
      row["Column2"] !== "Disclaimer:"
    );

  const rankJsonAccessKey = getActualRankColumnKey(userInput.rankCategory, userInput.gender);

  if (!rankJsonAccessKey) {
    console.error("Could not determine rank JSON access key for category:", userInput.rankCategory, "and gender:", userInput.gender);
    return null;
  }

  const displayRankCategoryUsed = getDisplayRankColumnName(userInput.rankCategory, userInput.gender);

  const userSelectedNormalizedBranches = userInput.branches.map(normalizeBranchName);
  const selectAllBranches = userSelectedNormalizedBranches.includes(ALL_BRANCHES_IDENTIFIER);

  const qualifiedCollegesRaw = actualDataRows
    .map(college => {
      const cutoffRankStr = college[rankJsonAccessKey];
      const cutoffRank = parseRank(cutoffRankStr);
      return {
        ...college,
        cutoffRank,
        parsedCutoffRankDisplay: cutoffRankStr !== undefined && cutoffRankStr !== null ? String(cutoffRankStr) : "N/A"
      };
    })
    .filter(college => {
      const collegeBranchName = college["Column9"];
      const normalizedCollegeBranchName = normalizeBranchName(collegeBranchName);

      const branchNameMatches = selectAllBranches || userSelectedNormalizedBranches.includes(normalizedCollegeBranchName);
      
      // Show colleges with cutoff ranks starting from 500 positions lower than user's rank
      const lowerRankThreshold = Math.max(1, userInput.userRank - 500);
      
      return branchNameMatches &&
             college.cutoffRank !== null &&
             lowerRankThreshold <= college.cutoffRank &&
             userInput.userRank <= college.cutoffRank;
    });

  if (qualifiedCollegesRaw.length === 0) {
    return null;
  }

  qualifiedCollegesRaw.sort((a, b) => (a.cutoffRank!) - (b.cutoffRank!));

  const mappedQualifiedColleges: PredictedCollege[] = qualifiedCollegesRaw.map(collegeRaw => {
    const instCode = String(collegeRaw["TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"] || "N/A");
    const collegeName = String(collegeRaw["Column2"] || "N/A");
    const tuitionFee = String(collegeRaw["Column28"] || "N/A");
    const place = String(collegeRaw["Column3"] || "N/A");
    const district = String(collegeRaw["Column4"] || "N/A");
    const branchName = String(collegeRaw["Column9"] || "N/A");

    return {
      instCode,
      collegeName,
      tuitionFee,
      cutoffRank: collegeRaw.cutoffRank!,
      parsedCutoffRankDisplay: collegeRaw.parsedCutoffRankDisplay,
      location: {
        place,
        district,
      },
      branchName,
      rankCategoryUsed: displayRankCategoryUsed,
    };
  });

  const limit = (userInput.numberOfColleges && userInput.numberOfColleges > 0 && userInput.numberOfColleges <= 50)
                ? userInput.numberOfColleges
                : 20;

  return mappedQualifiedColleges.slice(0, limit);
}
