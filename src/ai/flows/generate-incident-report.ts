'use server';
/**
 * @fileOverview An AI agent for generating incident reports from alerts.
 *
 * - generateIncidentReport - A function that creates a detailed incident report.
 * - GenerateIncidentReportInput - The input type for the function.
 * - GenerateIncidentReportOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateIncidentReportInputSchema = z.object({
  alert: z.object({
    type: z.string(),
    title: z.string(),
    message: z.string(),
    location: z.string(),
    severity: z.string(),
    timestamp: z.string(),
  }),
});
export type GenerateIncidentReportInput = z.infer<typeof GenerateIncidentReportInputSchema>;

const GenerateIncidentReportOutputSchema = z.object({
  reportId: z.string().describe("A unique identifier for the report, e.g., INC-00123."),
  timestamp: z.string().describe("The timestamp of when the report was generated."),
  location: z.string().describe("The specific location of the incident."),
  summary: z.string().describe("A concise summary of the incident."),
  priority: z.enum(['low', 'medium', 'high', 'critical']).describe("The priority level of the incident."),
  suggestedActions: z.array(z.string()).describe("A list of clear, actionable steps for response teams."),
});
export type GenerateIncidentReportOutput = z.infer<typeof GenerateIncidentReportOutputSchema>;

export async function generateIncidentReport(input: GenerateIncidentReportInput): Promise<GenerateIncidentReportOutput> {
  return generateIncidentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIncidentReportPrompt',
  input: { schema: GenerateIncidentReportInputSchema },
  output: { schema: GenerateIncidentReportOutputSchema },
  prompt: `You are a command center AI responsible for creating formal incident reports based on system alerts.

An alert has been triggered. Your task is to generate a structured incident report.

Alert Details:
- Type: {{{alert.type}}}
- Title: {{{alert.title}}}
- Message: {{{alert.message}}}
- Location: {{{alert.location}}}
- Severity: {{{alert.severity}}}
- Time: {{{alert.timestamp}}}

Based on these details, create a report that includes:
1.  A unique report ID (e.g., INC- followed by 5 random digits).
2.  The current timestamp.
3.  The incident location.
4.  A brief, clear summary of the incident.
5.  A priority level ('low', 'medium', 'high', 'critical') based on the alert's severity.
6.  A list of 3-5 specific, actionable steps for security and medical teams to take in response.

For example, if the alert is about high congestion, suggested actions might include "Dispatch security to manage crowd flow," "Set up barriers to redirect foot traffic," and "Monitor surveillance cameras for any escalation."
If the alert is a medical emergency, actions should be about clearing a path, dispatching paramedics, and notifying nearby staff.
`,
});

const generateIncidentReportFlow = ai.defineFlow(
  {
    name: 'generateIncidentReportFlow',
    inputSchema: GenerateIncidentReportInputSchema,
    outputSchema: GenerateIncidentReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
