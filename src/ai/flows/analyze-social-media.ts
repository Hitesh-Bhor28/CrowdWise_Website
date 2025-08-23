'use server';
/**
 * @fileOverview An AI agent for analyzing social media posts for potential issues.
 *
 * - analyzeSocialMediaPost - A function that analyzes text for signs of trouble.
 * - AnalyzeSocialMediaPostInput - The input type for the function.
 * - AnalyzeSocialMediaPostOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeSocialMediaPostInputSchema = z.object({
  postText: z.string().describe("The text content of a social media post."),
});
export type AnalyzeSocialMediaPostInput = z.infer<typeof AnalyzeSocialMediaPostInputSchema>;

const AnalyzeSocialMediaPostOutputSchema = z.object({
  issueDetected: z.boolean().describe("Whether the post indicates a potential issue requiring attention."),
  issueType: z.string().describe("A classification of the issue (e.g., 'Overcrowding', 'Medical Emergency', 'Safety Concern', 'Lost Person', 'General Inquiry')."),
  location: z.string().optional().describe("Any specific location mentioned in the post."),
  severity: z.enum(['low', 'medium', 'high', 'critical']).describe("The assessed severity of the potential issue."),
});
export type AnalyzeSocialMediaPostOutput = z.infer<typeof AnalyzeSocialMediaPostOutputSchema>;

export async function analyzeSocialMediaPost(input: AnalyzeSocialMediaPostInput): Promise<AnalyzeSocialMediaPostOutput> {
  return analyzeSocialMediaPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSocialMediaPostPrompt',
  input: { schema: AnalyzeSocialMediaPostInputSchema },
  output: { schema: AnalyzeSocialMediaPostOutputSchema },
  prompt: `You are a security AI monitoring social media for a large public event. Your task is to analyze the following post and determine if it signals a potential problem.

Post: "{{{postText}}}"

Analyze the post for keywords and sentiment related to safety, crowding, medical needs, or distress.

- If the post indicates a problem, set 'issueDetected' to true.
- Classify the issue type (e.g., 'Overcrowding', 'Medical Emergency', 'Safety Concern'). If no issue, classify as 'General Inquiry'.
- Extract any specific location mentioned (e.g., "Main Stage", "Gate 3").
- Assign a severity level ('low', 'medium', 'high', 'critical'). A medical emergency should be 'critical'. A simple complaint about queues might be 'low'. A report of unsafe crowding should be 'high'.

If the post is benign (e.g., "Having a great time!"), set 'issueDetected' to false.
`,
});

const analyzeSocialMediaPostFlow = ai.defineFlow(
  {
    name: 'analyzeSocialMediaPostFlow',
    inputSchema: AnalyzeSocialMediaPostInputSchema,
    outputSchema: AnalyzeSocialMediaPostOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
