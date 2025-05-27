// src/ai/flows/rank-analysis.ts
'use server';
/**
 * @fileOverview Analyzes rank trends for college admissions based on user inputs.
 *
 * - analyzeRank - A function that analyzes rank trends for college admissions.
 * - AnalyzeRankInput - The input type for the analyzeRank function.
 * - AnalyzeRankOutput - The return type for the analyzeRank function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRankInputSchema = z.object({
  rankCategory: z.string().describe('The rank category of the user (e.g., OC, BC_A, SC).'),
  gender: z.string().describe('The gender of the user (BOYS or GIRLS).'),
  branch: z.string().describe('The preferred branch of study (e.g., Engineering, Science).'),
});
export type AnalyzeRankInput = z.infer<typeof AnalyzeRankInputSchema>;

const AnalyzeRankOutputSchema = z.object({
  analysis: z.string().describe('An analysis of how cutoff ranks for the chosen branch have changed over the past years for similar colleges.'),
});
export type AnalyzeRankOutput = z.infer<typeof AnalyzeRankOutputSchema>;

export async function analyzeRank(input: AnalyzeRankInput): Promise<AnalyzeRankOutput> {
  return analyzeRankFlow(input);
}

const analyzeRankPrompt = ai.definePrompt({
  name: 'analyzeRankPrompt',
  input: {schema: AnalyzeRankInputSchema},
  output: {schema: AnalyzeRankOutputSchema},
  prompt: `You are an expert college admissions counselor. Analyze the cutoff ranks for similar colleges over the past years based on the following information:

Rank Category: {{{rankCategory}}}
Gender: {{{gender}}}
Branch: {{{branch}}}

Provide an analysis of how the cutoff ranks have changed over the past years for similar colleges, to gauge the chances of getting in this year.`, 
});

const analyzeRankFlow = ai.defineFlow(
  {
    name: 'analyzeRankFlow',
    inputSchema: AnalyzeRankInputSchema,
    outputSchema: AnalyzeRankOutputSchema,
  },
  async input => {
    const {output} = await analyzeRankPrompt(input);
    return output!;
  }
);
