
'use server';

/**
 * @fileOverview Summarizes the key aspects of a predicted college, including its pros, cons,
 * and suitability for a student based on their preferences.
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
  userPreferences: z.string().describe("A string combining the user's stated preferences (e.g., 'User's stated preferences: \"I prefer colleges in Hyderabad with good placement records.\"') and their selected branch preferences (e.g., 'Branch preferences: The user is interested in CSE, ECE.' or 'Branch preferences: The user is open to all branches.'). If no specific preferences are stated by the user, this part will be 'User's stated preferences: \"None explicitly stated\"'.").min(1),
});

export type CollegeSummaryInput = z.infer<typeof CollegeSummaryInputSchema>;

const CollegeSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized description of the college, highlighting its best features, potential drawbacks, and overall suitability based on user preferences. If user preferences are "None explicitly stated", focus on general strengths and weaknesses. Make sure to incorporate any specific branch preferences mentioned into the suitability assessment.'),
});

export type CollegeSummaryOutput = z.infer<typeof CollegeSummaryOutputSchema>;

export async function collegeSummary(input: CollegeSummaryInput): Promise<CollegeSummaryOutput> {
  return collegeSummaryFlow(input);
}

const collegeSummaryPrompt = ai.definePrompt({
  name: 'collegeSummaryPrompt',
  input: {schema: CollegeSummaryInputSchema},
  output: {schema: CollegeSummaryOutputSchema},
  prompt: `You are an expert college advisor. Your primary task is to provide a personalized summary of the following college, assessing its suitability **specifically for this student** based on their provided preferences.

College Details:
Institute Code: {{{collegeDetails.instCode}}}
College Name: {{{collegeDetails.collegeName}}}
Tuition Fee: {{{collegeDetails.tuitionFee}}}
Cutoff Rank: {{{collegeDetails.cutoffRank}}}
Location: {{{collegeDetails.location.place}}}, {{{collegeDetails.location.district}}}

User Preferences and Branch Selection: {{{userPreferences}}}

Instructions for your summary:
1.  **Prioritize Personalization:**
    *   If the "User's stated preferences" part of \`{{{userPreferences}}}\` is NOT "None explicitly stated", you **MUST** heavily weigh these stated preferences.
    *   Explicitly address how the college's features (location, fees, reputation, specific programs if known) align or misalign with these stated desires. For example, if the user prefers "lower fees," comment on how the college's tuition fee fits this. If they prefer "good placement records," mention this aspect if known, or state if it's not specified in the details.
    *   If the user mentions specific course interests (beyond the main branch), try to relate that if possible, or note if the college is known/not known for those.

2.  **Address Branch Preferences:**
    *   Incorporate the "Branch preferences" part of \`{{{userPreferences}}}\` by discussing the college's general suitability for the specified branch(es).

3.  **Balanced Perspective:**
    *   Highlight the college's best features and potential drawbacks from the student's perspective.

4.  **"None Explicitly Stated" Case:**
    *   If the "User's stated preferences" part of \`{{{userPreferences}}}\` IS "None explicitly stated", then provide a more general summary of the college's strengths and weaknesses, still considering the specified branch preferences for suitability.

5.  **Overall Assessment:**
    *   Conclude with a clear overall assessment of how good a fit this college might be for the student, based on the personalized analysis. Be direct.

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
    
