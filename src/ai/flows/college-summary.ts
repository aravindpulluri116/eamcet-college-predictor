
'use server';

/**
 * @fileOverview Summarizes the key aspects of a predicted college, including its pros, cons,
 * and suitability for a student based on their selected branch preferences.
 *
 * - collegeSummary - A function that generates a summary of a college based on its details.
 * - CollegeSummaryInput - The input type for the collegeSummary function.
 * - CollegeSummaryOutput - The return type for the collegeSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CollegeDetailsSchema = z.object({
  instCode: z.string().describe('The EAMCET code of the college.'),
  collegeName: z.string().describe('The name of the college.'),
  tuitionFee: z.string().describe('The tuition fee of the college.'),
  cutoffRank: z.string().describe('The cutoff rank for the college.'),
  location: z.object({
    place: z.string().describe('The place where the college is located.'),
    district: z.string().describe('The district where the college is located.'),
  }).describe('The location details of the college.'),
});

const CollegeSummaryInputSchema = z.object({
  collegeDetails: CollegeDetailsSchema.describe('Details of the college to summarize.'),
  userPreferences: z.string().describe("A string detailing the user's branch preferences (e.g., 'Branch preferences: The user is interested in CSE, ECE.' or 'Branch preferences: The user is open to all branches.' or 'Branch preferences: The user's primary preferred branch is CSE.') This will be an empty string if no branch preferences were effectively selected.").min(0),
});

export type CollegeSummaryInput = z.infer<typeof CollegeSummaryInputSchema>;

const CollegeSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized description of the college, highlighting its best features, potential drawbacks, and overall suitability based on the provided branch preferences. If the userPreferences string is empty or indicates no specific branch interest, focus on general strengths and weaknesses. Make sure to incorporate any specific branch preferences mentioned into the suitability assessment.'),
});

export type CollegeSummaryOutput = z.infer<typeof CollegeSummaryOutputSchema>;

export async function collegeSummary(input: CollegeSummaryInput): Promise<CollegeSummaryOutput> {
  return collegeSummaryFlow(input);
}

const collegeSummaryPrompt = ai.definePrompt({
  name: 'collegeSummaryPrompt',
  input: {schema: CollegeSummaryInputSchema},
  output: {schema: CollegeSummaryOutputSchema},
  prompt: `You are an expert college advisor. Your primary task is to provide a summary of the following college, assessing its suitability **specifically for this student** based on their selected branch preferences.

College Details:
Institute Code: {{{collegeDetails.instCode}}}
College Name: {{{collegeDetails.collegeName}}}
Tuition Fee: {{{collegeDetails.tuitionFee}}}
Cutoff Rank: {{{collegeDetails.cutoffRank}}}
Location: {{{collegeDetails.location.place}}}, {{{collegeDetails.location.district}}}

Branch Preferences: {{{userPreferences}}}

Instructions for your summary:
1.  **Address Branch Preferences:**
    *   Incorporate the "Branch preferences" part of \`{{{userPreferences}}}\` by discussing the college's general suitability for the specified branch(es). If \`{{{userPreferences}}}\` is empty or does not clearly state a branch interest, provide a general summary.

2.  **Balanced Perspective:**
    *   Highlight the college's best features and potential drawbacks.

3.  **Overall Assessment:**
    *   Conclude with a clear overall assessment of how good a fit this college might be for the student, based on the college details and their branch preferences. Be direct.

Generate the summary based on ALL the information provided.
`,
});

const collegeSummaryFlow = ai.defineFlow(
  {
    name: 'collegeSummaryFlow',
    inputSchema: CollegeSummaryInputSchema,
    outputSchema: CollegeSummaryOutputSchema,
  },
  async input => {
    const {output} = await collegeSummaryPrompt(input);
    return output!;
  }
);
