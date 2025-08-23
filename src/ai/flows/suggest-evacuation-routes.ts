
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting evacuation routes.
 *
 * - suggestEvacuationRoutes - A function that initiates the route suggestion process.
 * - SuggestEvacuationRoutesInput - The input type for the suggestEvacuationRoutes function.
 * - SuggestEvacuationRoutesOutput - The return type for the suggestEvacuationRoutes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RouteDetailSchema = z.object({
  name: z.string().describe("The name of the route, e.g., 'Ram Ghat via Main Road'."),
  path: z.array(z.array(z.number())).describe("An array of [latitude, longitude] coordinates representing the route's path. This should be a plausible, but not necessarily real, path between the start and end points."),
  congestion: z.enum(['low', 'medium', 'high']).describe("The fictional congestion level of the route."),
  travelTime: z.string().describe("The estimated travel time in minutes."),
});

const SuggestEvacuationRoutesInputSchema = z.object({
  currentLocation: z
    .string()
    .describe('The current location of the user as text, likely in or around Nashik.'),
  destination: z
    .string()
    .describe('The desired destination for evacuation as text, likely in or around Nashik.'),
});
export type SuggestEvacuationRoutesInput = z.infer<typeof SuggestEvacuationRoutesInputSchema>;

const SuggestEvacuationRoutesOutputSchema = z.object({
  recommendedRoutes: z.array(RouteDetailSchema).describe('A list of 2 recommended safe evacuation routes with their paths and details.'),
  congestedRoutes: z.array(RouteDetailSchema).describe('A list of 1 congested route to be avoided, with its path and details.'),
  recommendationReasoning: z
    .string()
    .describe('Explanation of why certain routes are recommended. Explain that this is a simulation.'),
});
export type SuggestEvacuationRoutesOutput = z.infer<typeof SuggestEvacuationRoutesOutputSchema>;

export async function suggestEvacuationRoutes(
  input: SuggestEvacuationRoutesInput
): Promise<SuggestEvacuationRoutesOutput> {
  return suggestEvacuationRoutesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestEvacuationRoutesPrompt',
    input: { schema: SuggestEvacuationRoutesInputSchema },
    output: { schema: SuggestEvacuationRoutesOutputSchema },
    prompt: `You are a disaster management AI for the city of Nashik. Your task is to generate a plausible but fictional set of evacuation routes from a start point to a destination within Nashik. Do not use real-world map data, but make the names sound authentic to the location.

Start Location: {{{currentLocation}}}
Destination: {{{destination}}}

Generate the following:
1.  **Two safe routes**: These should have 'low' or 'medium' congestion. Give them plausible names relevant to Nashik (e.g., "Via Gangapur Road", "Trimbak Road Bypass", "Panchavati Link Road"). Create a simple, fictional path of 5-10 latitude/longitude points for each that looks like a real route. Estimate a travel time.
2.  **One congested route**: This should have 'high' congestion. Give it a plausible name (e.g., "Main Road through Ram Ghat"). Create a simple, fictional path of 5-10 points. Estimate a longer travel time.
3.  **Recommendation Reasoning**: Write a short paragraph explaining that the routes are generated based on a simulation and that the recommended routes are chosen to avoid delays.

For the coordinates, create a logical but fictional path. For example, if moving from south to north, the latitude should generally increase. The path should look like a plausible road on a map (e.g., gentle curves, not random points).
`,
});


const suggestEvacuationRoutesFlow = ai.defineFlow(
  {
    name: 'suggestEvacuationRoutesFlow',
    inputSchema: SuggestEvacuationRoutesInputSchema,
    outputSchema: SuggestEvacuationRoutesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
