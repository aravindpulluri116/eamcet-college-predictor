
"use server";

import type { UserInput, PredictedCollege, PredictionResult } from "@/types";
import { predictCollege as findCollege } from "@/lib/college-predictor";
import { analyzeRank, type AnalyzeRankInput, type AnalyzeRankOutput } from "@/ai/flows/rank-analysis";
import { collegeSummary, type CollegeSummaryInput, type CollegeSummaryOutput } from "@/ai/flows/college-summary";

export async function getCollegePrediction(userInput: UserInput): Promise<PredictionResult> {
  try {
    const college = await findCollege(userInput);

    if (!college) {
      return { error: "No suitable colleges found matching your criteria. Please try different options." };
    }

    let rankAnalysisResult: AnalyzeRankOutput | undefined;
    let collegeSummaryResult: CollegeSummaryOutput | undefined;

    // Prepare inputs for AI flows
    const analyzeRankInput: AnalyzeRankInput = {
      rankCategory: userInput.rankCategory,
      gender: userInput.gender,
      branch: college.branchName,
    };

    const collegeSummaryInput: CollegeSummaryInput = {
      collegeDetails: {
        collegeName: college.collegeName,
        tuitionFee: college.tuitionFee,
        cutoffRank: college.parsedCutoffRankDisplay, // Use string display version
        location: {
          place: college.location.place,
          district: college.location.district,
        },
      },
      userPreferences: userInput.userPreferences,
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
        // Optionally, include a partial error message for AI features
    }

    return {
      college,
      analysis: rankAnalysisResult,
      summary: collegeSummaryResult,
    };

  } catch (error) {
    console.error("Error in getCollegePrediction:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
