
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
  userPreferences: z.string().describe('The user preferences for college, such as location, fees and courses.'),
});

export type CollegeSummaryInput = z.infer<typeof CollegeSummaryInputSchema>;

const CollegeSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized description of the college, highlighting its best features, potential drawbacks, and overall suitability based on user preferences.'),
});

export type CollegeSummaryOutput = z.infer<typeof CollegeSummaryOutputSchema>;

export async function collegeSummary(input: CollegeSummaryInput): Promise<CollegeSummaryOutput> {
  return collegeSummaryFlow(input);
}

const collegeSummaryPrompt = ai.definePrompt({
  name: 'collegeSummaryPrompt',
  input: {schema: CollegeSummaryInputSchema},
  output: {schema: CollegeSummaryOutputSchema},
  prompt: `You are an expert college advisor. Summarize the following college details, highlighting its best features, potential drawbacks, and overall suitability based on the user's preferences. Provide a balanced perspective to help the student quickly understand if the college is a good fit.

College Details:
Institute Code: {{{collegeDetails.instCode}}}
College Name: {{{collegeDetails.collegeName}}}
Tuition Fee: {{{collegeDetails.tuitionFee}}}
Cutoff Rank: {{{collegeDetails.cutoffRank}}}
Location: {{{collegeDetails.location.place}}}, {{{collegeDetails.location.district}}}

User Preferences: {{{userPreferences}}}`,
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
