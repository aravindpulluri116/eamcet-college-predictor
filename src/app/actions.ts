
"use server";

import type { UserInput, PredictedCollege, PredictionResult } from "@/types";
import { predictCollege as findColleges } from "@/lib/college-predictor"; // Renamed to findColleges
import { analyzeRank, type AnalyzeRankInput, type AnalyzeRankOutput } from "@/ai/flows/rank-analysis";
import { collegeSummary, type CollegeSummaryInput, type CollegeSummaryOutput } from "@/ai/flows/college-summary";

export async function getCollegePrediction(userInput: UserInput): Promise<PredictionResult> {
  try {
    const colleges = await findColleges(userInput); // Changed from college to colleges

    if (!colleges || colleges.length === 0) { // Check if array is null or empty
      return { error: "No suitable colleges found matching your criteria. Please try different options." };
    }

    let rankAnalysisResult: AnalyzeRankOutput | undefined;
    let collegeSummaryResult: CollegeSummaryOutput | undefined;

    // Use the top college for AI analysis and summary
    const topCollege = colleges[0];

    const analyzeRankInput: AnalyzeRankInput = {
      rankCategory: userInput.rankCategory,
      gender: userInput.gender,
      branch: topCollege.branchName, // Use topCollege's branch
    };

    const collegeSummaryInput: CollegeSummaryInput = {
      collegeDetails: {
        collegeName: topCollege.collegeName,
        tuitionFee: topCollege.tuitionFee,
        cutoffRank: topCollege.parsedCutoffRankDisplay,
        location: {
          place: topCollege.location.place,
          district: topCollege.location.district,
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
    }

    return {
      colleges, // Return the array of colleges
      analysis: rankAnalysisResult,
      summary: collegeSummaryResult,
    };

  } catch (error) {
    console.error("Error in getCollegePrediction:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
