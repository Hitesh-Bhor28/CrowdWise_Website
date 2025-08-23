
"use server";

import { analyzeCrowd } from "@/ai/flows/analyze-crowd";
import { generatePredictiveAlerts } from "@/ai/flows/generate-predictive-alerts";
import { suggestEvacuationRoutes } from "@/ai/flows/suggest-evacuation-routes";
import { generateIncidentReport } from "@/ai/flows/generate-incident-report";
import { analyzeSocialMediaPost } from "@/ai/flows/analyze-social-media";
import { suggestResourceAllocation } from "@/ai/flows/suggest-resource-allocation";
import { generateAudioAnnouncement } from "@/ai/flows/generate-audio-announcement";
import { generateRouteVisualization } from "@/ai/flows/generate-route-visualization";
import type { Alert, Hotspot } from "@/lib/types";

import { z } from "zod";


const routeSchema = z.object({
  currentLocation: z.string().min(3, { message: "Location is required" }),
  destination: z.string().min(3, { message: "Destination is required" }),
});

export async function suggestEvacuationRoutesAction(values: z.infer<typeof routeSchema>) {
  const validatedFields = routeSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
    };
  }

  const { currentLocation, destination } = validatedFields.data;

  try {
    const routeResult = await suggestEvacuationRoutes({
      currentLocation,
      destination,
    });
    
    return { success: routeResult };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate routes. Please try again." };
  }
}

export async function generatePredictiveAlertsAction() {
  // Mock data for hackathon demo
  const historicalData = JSON.stringify({
    "10:00": { density: 520, checkpoint: "Checkpoint 3" },
    "11:00": { density: 650, checkpoint: "Checkpoint 3" },
  });
  const realtimeData = JSON.stringify({
    "12:00": { density: 810, checkpoint: "Checkpoint 3" },
  });
  const sensorData = JSON.stringify({
    temperature: 32,
    humidity: 75,
    air_quality: "moderate",
  });
  const thresholds = JSON.stringify({
    high_density: 750,
    critical_density: 900,
  });

  try {
    const result = await generatePredictiveAlerts({
      historicalData,
      realtimeData,
      sensorData,
      thresholds,
    });
    return { success: result };
  } catch (error) {
    return { error: "Failed to generate predictive alert." };
  }
}

const crowdAnalysisSchema = z.object({
  checkpointId: z.string(),
  photoDataUri: z.string(),
});

export async function analyzeCrowdAction(values: z.infer<typeof crowdAnalysisSchema>) {
    const validatedFields = crowdAnalysisSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }
    const { photoDataUri } = validatedFields.data;
    try {
        const result = await analyzeCrowd({ photoDataUri });
        return { success: result };
    } catch (error) {
        return { error: 'Failed to analyze crowd. Please try again.' };
    }
}

const generateReportSchema = z.object({
  alert: z.any(),
});

export async function generateIncidentReportAction(values: z.infer<typeof generateReportSchema>) {
    const validatedFields = generateReportSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }
    const { alert } = validatedFields.data;
    try {
        const result = await generateIncidentReport({ alert });
        return { success: result };
    } catch (error) {
        return { error: 'Failed to generate incident report. Please try again.' };
    }
}

const analyzeSocialMediaSchema = z.object({
  postText: z.string().min(10, { message: "Post text must be at least 10 characters." }),
});

export async function analyzeSocialMediaAction(values: z.infer<typeof analyzeSocialMediaSchema>) {
    const validatedFields = analyzeSocialMediaSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }
    const { postText } = validatedFields.data;
    try {
        const result = await analyzeSocialMediaPost({ postText });
        return { success: result };
    } catch (error) {
        return { error: 'Failed to analyze post. Please try again.' };
    }
}

const suggestResourceAllocationSchema = z.object({
    hotspots: z.any(),
});

export async function suggestResourceAllocationAction(values: z.infer<typeof suggestResourceAllocationSchema>) {
    const validatedFields = suggestResourceAllocationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }
    const { hotspots } = validatedFields.data;
    const hotspotsJson = JSON.stringify(hotspots);
    try {
        const result = await suggestResourceAllocation({ hotspots: hotspotsJson });
        return { success: result };
    } catch (error) {
        return { error: 'Failed to suggest resource allocation. Please try again.' };
    }
}

const generateAudioSchema = z.object({
  text: z.string(),
});

export async function generateAudioAction(values: z.infer<typeof generateAudioSchema>) {
    const validatedFields = generateAudioSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }
    const { text } = validatedFields.data;
    try {
        const result = await generateAudioAnnouncement({ text });
        return { success: result };
    } catch (error) {
        return { error: 'Failed to generate audio. Please try again.' };
    }
}
