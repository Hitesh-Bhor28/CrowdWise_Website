'use server';
/**
 * @fileOverview An AI agent for analyzing crowd density in an image.
 *
 * - analyzeCrowd - A function that handles the crowd analysis process.
 * - AnalyzeCrowdInput - The input type for the analyzeCrowd function.
 * - AnalyzeCrowdOutput - The return type for the analyzeCrowd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCrowdInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crowd, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCrowdInput = z.infer<typeof AnalyzeCrowdInputSchema>;

const AnalyzeCrowdOutputSchema = z.object({
  peopleCount: z.number().describe('The estimated number of people in the image.'),
  density: z.enum(['low', 'medium', 'high', 'critical']).describe('The estimated crowd density.'),
});
export type AnalyzeCrowdOutput = z.infer<typeof AnalyzeCrowdOutputSchema>;

export async function analyzeCrowd(input: AnalyzeCrowdInput): Promise<AnalyzeCrowdOutput> {
  return analyzeCrowdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCrowdPrompt',
  input: {schema: AnalyzeCrowdInputSchema},
  output: {schema: AnalyzeCrowdOutputSchema},
  prompt: `You are an expert in crowd analysis. Your task is to analyze the provided image and estimate the number of people present. Based on the people count, classify the crowd density as 'low', 'medium', 'high', or 'critical'.

- low: 1-20 people
- medium: 21-50 people
- high: 51-100 people
- critical: 101+ people

Analyze the image and return the estimated people count and the corresponding density level.

Photo: {{media url=photoDataUri}}`,
});

const analyzeCrowdFlow = ai.defineFlow(
  {
    name: 'analyzeCrowdFlow',
    inputSchema: AnalyzeCrowdInputSchema,
    outputSchema: AnalyzeCrowdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
