
'use server';
/**
 * @fileOverview An AI agent for generating a visual map of evacuation routes.
 *
 * - generateRouteVisualization - A function that creates an image of a map.
 * - GenerateRouteVisualizationInput - The input type for the function.
 * - GenerateRouteVisualizationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const GenerateRouteVisualizationInputSchema = z.object({
  currentLocation: z.string().describe("The user's starting point."),
  destination: z.string().describe("The user's safe destination."),
  congestionData: z.string().describe("A JSON string of route congestion levels."),
  safeRoutes: z.array(z.string()).describe("A list of recommended safe routes."),
});
export type GenerateRouteVisualizationInput = z.infer<typeof GenerateRouteVisualizationInputSchema>;

const GenerateRouteVisualizationOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated map image as a base64-encoded PNG data URI."),
});
export type GenerateRouteVisualizationOutput = z.infer<typeof GenerateRouteVisualizationOutputSchema>;

export async function generateRouteVisualization(input: GenerateRouteVisualizationInput): Promise<GenerateRouteVisualizationOutput> {
  return generateRouteVisualizationFlow(input);
}

const promptTemplate = `You are a cartography AI. Your task is to generate a simple, clear, and easy-to-read map visualization for an evacuation route.

**Instructions:**
- The map style should be minimalist and abstract. Use simple lines and shapes. Do not try to make it look like a real-world satellite or road map.
- The background should be a neutral, light gray color.
- Clearly label the "Start" ({{{currentLocation}}}) and "End" ({{{destination}}}) points.
- Based on the congestion data, draw all possible paths between the start and end points.
- Color the paths according to their congestion level:
    - Safe routes (from the provided list) should be a thick, solid **green** line.
    - Congested routes (from the congestion data) should be a thick, dashed **red** line.
- The output must be only the image. Do not add any text, titles, or legends outside of the map itself.

**Data:**
- Start: {{currentLocation}}
- End: {{destination}}
- Congestion Data: {{congestionData}}
- Recommended Safe Routes: {{#each safeRoutes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
`;

const generateRouteVisualizationFlow = ai.defineFlow(
  {
    name: 'generateRouteVisualizationFlow',
    inputSchema: GenerateRouteVisualizationInputSchema,
    outputSchema: GenerateRouteVisualizationOutputSchema,
  },
  async (input) => {
    // Manually build the prompt string
    let prompt = promptTemplate
      .replace('{{{currentLocation}}}', input.currentLocation)
      .replace('{{{destination}}}', input.destination)
      .replace('{{{congestionData}}}', input.congestionData)
      .replace('{{#each safeRoutes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}', input.safeRoutes.join(', '));


    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash-preview-image-generation'),
      prompt: prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed.');
    }

    return { imageDataUri: media.url };
  }
);
