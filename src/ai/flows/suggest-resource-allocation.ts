'use server';
/**
 * @fileOverview An AI agent for suggesting resource allocation based on crowd data.
 *
 * - suggestResourceAllocation - A function that provides resource deployment recommendations.
 * - SuggestResourceAllocationInput - The input type for the function.
 * - SuggestResourceAllocationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestResourceAllocationInputSchema = z.object({
  hotspots: z.string().describe("A JSON string representing an array of current crowd hotspots. Each hotspot has a name, density, and severity."),
});
export type SuggestResourceAllocationInput = z.infer<typeof SuggestResourceAllocationInputSchema>;

const SuggestResourceAllocationOutputSchema = z.object({
  security: z.array(z.string()).describe("A list of recommendations for deploying security teams."),
  medical: z.array(z.string()).describe("A list of recommendations for deploying medical teams."),
  reasoning: z.string().describe("A brief explanation for the overall strategy."),
});
export type SuggestResourceAllocationOutput = z.infer<typeof SuggestResourceAllocationOutputSchema>;

export async function suggestResourceAllocation(input: SuggestResourceAllocationInput): Promise<SuggestResourceAllocationOutput> {
  return suggestResourceAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResourceAllocationPrompt',
  input: { schema: SuggestResourceAllocationInputSchema },
  output: { schema: SuggestResourceAllocationOutputSchema },
  prompt: `You are an AI operations strategist for a major event. Your goal is to ensure safety by optimally allocating resources based on real-time crowd data.

Current Hotspots Data:
{{{hotspots}}}

Analyze the hotspot data, paying close attention to areas with 'high' or 'critical' severity.

Provide specific, actionable recommendations for deploying resources:
1.  **Security Teams:** Suggest where to position or move security personnel to manage crowd flow, prevent congestion, and maintain order. Prioritize the most critical areas. Suggest moving teams from low-density areas if necessary.
2.  **Medical Teams:** Suggest where to station medical teams to ensure quick response times to potential incidents. They should be near, but not inside, the most crowded areas to maintain access.
3.  **Reasoning:** Briefly explain the logic behind your recommendations (e.g., "Focusing resources on the Main Stage due to critical density and redirecting from the less crowded Restrooms area.").

Assume we have 5 security teams and 3 medical teams available for deployment.
`,
});

const suggestResourceAllocationFlow = ai.defineFlow(
  {
    name: 'suggestResourceAllocationFlow',
    inputSchema: SuggestResourceAllocationInputSchema,
    outputSchema: SuggestResourceAllocationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
