
export type Alert = {
  id: string;
  type: 'emergency' | 'predictive' | 'info' | 'social';
  title: string;
  message: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
};

export type RouteDetail = {
    name: string;
    path: [number, number][];
    congestion: 'low' | 'medium' | 'high';
    travelTime: string;
}

export type RouteSuggestion = {
  recommendedRoutes: RouteDetail[];
  congestedRoutes: RouteDetail[];
  recommendationReasoning: string;
};

export type EvacuationRoute = RouteDetail & {
    type: 'safe' | 'congested';
};

export type Hotspot = {
    id: number | string;
    name: string;
    density: number;
    position: [number, number];
    size: number;
    severity: "low" | "medium" | "high" | "critical";
};

export type IncidentReport = {
    reportId: string;
    timestamp: string;
    location: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    suggestedActions: string[];
};

export type SocialMediaAnalysis = {
    issueDetected: boolean;
    issueType: string;
    location?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
};

export type ResourceSuggestion = {
    security: string[];
    medical: string[];
    reasoning: string;
};

export type EmergencyService = {
  id: string;
  type: 'hospital' | 'police' | 'fire';
  name: string;
  position: [number, number];
};
