import type { CollegeRawData, PredictedCollege, UserInput, CollegeDataset } from '@/types';
import collegeDataJson from '@/lib/data/college-data.json';

const collegeData = (collegeDataJson as CollegeDataset)["TGEAPCET-2024 LAST RANK STATEMENT FIRST PHASE"];

function getRankColumnName(rankCategory: UserInput['rankCategory'], gender: UserInput['gender']): string {
  if (rankCategory === "EWS") {
    return gender === "BOYS" ? "EWS GEN OU" : "EWS GIRLS OU";
  }
  return `${rankCategory} ${gender}`;
}

function parseRank(rankStr: string | number | undefined): number | null {
  if (rankStr === undefined || rankStr === null || typeof rankStr === 'number') {
    return typeof rankStr === 'number' && !isNaN(rankStr) ? rankStr : null;
  }
  if (typeof rankStr === 'string') {
    const parsed = parseInt(rankStr, 10);
    return !isNaN(parsed) ? parsed : null;
  }
  return null;
}


export async function predictCollege(userInput: UserInput): Promise<PredictedCollege | null> {
  const rankColumnName = getRankColumnName(userInput.rankCategory, userInput.gender);

  const qualifiedColleges = collegeData
    .map(college => {
      const cutoffRankStr = college[rankColumnName] as string | undefined;
      const cutoffRank = parseRank(cutoffRankStr);
      return { ...college, cutoffRank, parsedCutoffRankDisplay: cutoffRankStr || "N/A" };
    })
    .filter(college => 
      college["Branch Name"]?.toUpperCase() === userInput.branch.toUpperCase() &&
      college.cutoffRank !== null &&
      userInput.userRank <= college.cutoffRank
    );

  if (qualifiedColleges.length === 0) {
    return null;
  }

  qualifiedColleges.sort((a, b) => (a.cutoffRank!) - (b.cutoffRank!));

  const topCollegeRaw = qualifiedColleges[0];

  return {
    collegeName: topCollegeRaw["Institute Name"],
    tuitionFee: topCollegeRaw["Tuition Fee"],
    cutoffRank: topCollegeRaw.cutoffRank!,
    parsedCutoffRankDisplay: topCollegeRaw.parsedCutoffRankDisplay,
    location: {
      place: topCollegeRaw["Place"],
      district: topCollegeRaw["Dist Code"],
    },
    branchName: topCollegeRaw["Branch Name"],
    rankCategoryUsed: rankColumnName
  };
}
