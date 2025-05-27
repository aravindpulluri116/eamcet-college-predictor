
"use server";

import type { UserInput, PredictedCollege, PredictionResult } from "@/types";
import { predictCollege as findColleges } from "@/lib/college-predictor"; 
import { analyzeRank, type AnalyzeRankInput, type AnalyzeRankOutput } from "@/ai/flows/rank-analysis";
import { collegeSummary, type CollegeSummaryInput, type CollegeSummaryOutput } from "@/ai/flows/college-summary";
import { ALL_BRANCHES_IDENTIFIER } from "@/lib/constants";

export async function getCollegePrediction(userInput: UserInput): Promise<PredictionResult> {
  try {
    const colleges = await findColleges(userInput); 

    if (!colleges || colleges.length === 0) { 
      return { error: "No suitable colleges found matching your criteria. Please try different options." };
    }

    let rankAnalysisResult: AnalyzeRankOutput | undefined;
    let collegeSummaryResult: CollegeSummaryOutput | undefined;

    const topCollege = colleges[0];

    const branchForAnalysis = userInput.branches.includes(ALL_BRANCHES_IDENTIFIER) || userInput.branches.length > 1
                             ? topCollege.branchName
                             : userInput.branches[0];

    const analyzeRankInput: AnalyzeRankInput = {
      rankCategory: userInput.rankCategory,
      gender: userInput.gender,
      branch: branchForAnalysis,
    };

    let finalPreferencesString = `User's stated preferences: "${userInput.userPreferences || 'None explicitly stated'}".`;

    if (userInput.branches.includes(ALL_BRANCHES_IDENTIFIER)) {
        finalPreferencesString += " Branch preferences: The user is open to all branches.";
    } else if (userInput.branches.length > 1) {
        finalPreferencesString += ` Branch preferences: The user is interested in the following branches: ${userInput.branches.join(', ')}.`;
    } else if (userInput.branches.length === 1 && userInput.branches[0]) { // Ensure the single branch is not an empty string
        finalPreferencesString += ` Branch preferences: The user's primary preferred branch is ${userInput.branches[0]}.`;
    }


    const collegeSummaryInput: CollegeSummaryInput = {
      collegeDetails: {
        instCode: topCollege.instCode,
        collegeName: topCollege.collegeName,
        tuitionFee: topCollege.tuitionFee,
        cutoffRank: topCollege.parsedCutoffRankDisplay,
        location: {
          place: topCollege.location.place,
          district: topCollege.location.district,
        },
      },
      userPreferences: finalPreferencesString,
    };
    
    try {
        const [analysis, summary] = await Promise.all([
            analyzeRank(analyzeRankInput),
            collegeSummary(collegeSummaryInput)
        ]);
        rankAnalysisResult = analysis;
        collegeSummaryResult = summary;
    } catch (aiError) {
        console.error("AI Flow Error:", aiError);
        // Non-critical error, proceed with college info
    }

    return {
      colleges, 
      analysis: rankAnalysisResult,
      summary: collegeSummaryResult,
    };

  } catch (error) {
    console.error("Error in getCollegePrediction:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

