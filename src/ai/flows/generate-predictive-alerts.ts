// src/ai/flows/generate-predictive-alerts.ts
'use server';

/**
 * @fileOverview Generates predictive alerts for unsafe crowd levels.
 *
 * - generatePredictiveAlerts - A function that generates predictive alerts based on crowd data.
 * - GeneratePredictiveAlertsInput - The input type for the generatePredictiveAlerts function.
 * - GeneratePredictiveAlertsOutput - The return type for the generatePredictiveAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePredictiveAlertsInputSchema = z.object({
  historicalData: z.string().describe('Historical crowd density data in JSON format.'),
  realtimeData: z.string().describe('Real-time crowd density data in JSON format.'),
  sensorData: z.string().describe('Sensor data related to environmental conditions.'),
  thresholds: z.string().describe('Threshold values for crowd density to trigger alerts.'),
});
export type GeneratePredictiveAlertsInput = z.infer<
  typeof GeneratePredictiveAlertsInputSchema
>;

const GeneratePredictiveAlertsOutputSchema = z.object({
  alertType: z
    .string()
    .describe(
      'The type of alert generated (e.g., congestion, unsafe density, potential stampede).'
    ),
  alertMessage: z.string().describe('A detailed message describing the alert.'),
  location: z.string().describe('The specific location where the alert is applicable.'),
  severity: z.string().describe('The severity level of the alert (e.g., low, medium, high).'),
  timestamp: z.string().describe('The timestamp when the alert was generated.'),
});
export type GeneratePredictiveAlertsOutput = z.infer<
  typeof GeneratePredictiveAlertsOutputSchema
>;

export async function generatePredictiveAlerts(
  input: GeneratePredictiveAlertsInput
): Promise<GeneratePredictiveAlertsOutput> {
  return generatePredictiveAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePredictiveAlertsPrompt',
  input: {schema: GeneratePredictiveAlertsInputSchema},
  output: {schema: GeneratePredictiveAlertsOutputSchema},
  prompt: `You are an AI-powered system for crowd & disaster management that analyzes historical and real-time data to generate predictive alerts for unsafe crowd levels.

Analyze the following data to predict potential congestion and generate appropriate alerts:

Historical Data: {{{historicalData}}}
Real-time Data: {{{realtimeData}}}
Sensor Data: {{{sensorData}}}
Thresholds: {{{thresholds}}}

Based on your analysis, generate an alert message including the type of alert, a detailed description, the affected location, severity, and timestamp.

Ensure that the alert is specific and actionable, providing relevant information for system administrators to proactively manage potential congestion. Adhere to the thresholds given, and only generate alerts when those thresholds are exceeded.
`,
});

const generatePredictiveAlertsFlow = ai.defineFlow(
  {
    name: 'generatePredictiveAlertsFlow',
    inputSchema: GeneratePredictiveAlertsInputSchema,
    outputSchema: GeneratePredictiveAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
