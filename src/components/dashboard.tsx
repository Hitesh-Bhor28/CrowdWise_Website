
"use client";

import {
  Activity,
  Bell,
  Bot,
  Camera,
  ChevronRight,
  FileText,
  Flame,
  Globe,
  HeartPulse,
  Loader2,
  Map,
  Route,
  Search,
  Send,
  Siren,
  Shield,
  User,
  Users,
  Volume2,
} from "lucide-react";
import * as React from "react";
import dynamic from 'next/dynamic';

import { analyzeCrowdAction, generateAudioAction, generateIncidentReportAction, generatePredictiveAlertsAction, suggestEvacuationRoutesAction, analyzeSocialMediaAction, suggestResourceAllocationAction } from "@/app/actions";
import { CrowdWiseLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Alert, EmergencyService, EvacuationRoute, Hotspot, IncidentReport, ResourceSuggestion, RouteSuggestion, SocialMediaAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import Image from "next/image";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { README } from "@/components/readme";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const Heatmap = dynamic(() => import('@/components/heatmap').then(mod => mod.Heatmap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />,
});

const initialAlerts: Alert[] = [
  { id: '1', type: 'emergency', title: 'Medical Emergency', message: 'Assistance required at Sector 4.', location: 'Sector 4', severity: 'critical', timestamp: '1 min ago' },
  { id: '2', type: 'predictive', title: 'High Congestion Alert', message: 'Crowd at Gate 3 nearing unsafe levels. Rerouting suggested.', location: 'Gate 3', severity: 'high', timestamp: '3 mins ago' },
  { id: '3', type: 'info', title: 'Weather Update', message: 'Light showers expected in 30 mins.', location: 'All Zones', severity: 'low', timestamp: '10 mins ago' },
];

const initialHotspots: Hotspot[] = [
    { id: 1, name: "Main Stage", density: 95, position: [20.006, 73.791], size: 500, severity: "critical" },
    { id: 2, name: "Food Court", density: 78, position: [20.009, 73.795], size: 350, severity: "high" },
    { id: 3, name: "Gate 3 Entrance", density: 85, position: [20.003, 73.788], size: 400, severity: "high" },
    { id: 4, name: "Merch Tent", density: 60, position: [20.004, 73.796], size: 250, severity: "medium" },
    { id: 5, name: "Restrooms", density: 45, position: [20.008, 73.787], size: 200, severity: "low" },
];

const emergencyServicesData: EmergencyService[] = [
    { id: 'h1', type: 'hospital', name: 'Wockhardt Hospital', position: [20.008, 73.766] },
    { id: 'h2', type: 'hospital', name: 'Apollo Hospital', position: [19.996, 73.784] },
    { id: 'h3', type: 'hospital', name: 'Six Sigma Medicare', position: [19.992, 73.765] },
    { id: 'p1', type: 'police', name: 'Bhadrakali Police Station', position: [19.993, 73.789] },
    { id: 'p2', type: 'police', name: 'Gangapur Police Station', position: [20.009, 73.753] },
    { id: 'p3', type: 'police', name: 'Sarkarwada Police Station', position: [19.999, 73.781] },
    { id: 'f1', type: 'fire', name: 'Panchavati Fire Station', position: [20.007, 73.795] },
    { id: 'f2', type: 'fire', name: 'CIDCO Fire Station', position: [19.969, 73.757] },
    { id: 'f3', type: 'fire', name: 'Nashik Road Fire Station', position: [19.957, 73.834] },
];

const trendData = [
  { time: "8 AM", density: 1200, "last-year": 900 },
  { time: "10 AM", density: 3400, "last-year": 2800 },
  { time: "12 PM", density: 7800, "last-year": 6500 },
  { time: "2 PM", density: 6500, "last-year": 6100 },
  { time: "4 PM", density: 8200, "last-year": 7800 },
  { time: "6 PM", density: 9500, "last-year": 9100 },
];

const routeSchema = z.object({
  currentLocation: z.string().min(3, "Current location is required."),
  destination: z.string().min(3, "Destination is required."),
});

const socialMediaSchema = z.object({
    postText: z.string().min(10, "Post must be at least 10 characters."),
});

const alertIcons = {
  emergency: <Siren className="h-5 w-5" />,
  predictive: <Users className="h-5 w-5" />,
  info: <Bell className="h-5 w-5" />,
  social: <Globe className="h-5 w-5" />,
};

const alertColors = {
  low: "border-blue-500/80 bg-blue-500/10",
  medium: "border-yellow-500/80 bg-yellow-500/10",
  high: "border-orange-500/80 bg-orange-500/10",
  critical: "border-red-500/80 bg-red-500/10",
};

const marqueeAlertColors: {[key: string]: string} = {
    low: "text-blue-400",
    medium: "text-yellow-400",
    high: "text-orange-400",
    critical: "text-red-400",
}

type GateAnalysis = {
  gateId: string;
  location: string;
  videoSrc?: string;
  peopleCount?: number;
  density?: 'low' | 'medium' | 'high' | 'critical';
  isLoading: boolean;
  isAutoAnalyzing: boolean;
};

const densityMap = {
  low: { size: 200, severity: "low" as const },
  medium: { size: 350, severity: "medium" as const },
  high: { size: 400, severity: "high" as const },
  critical: { size: 500, severity: "critical" as const },
};

const initialGates: GateAnalysis[] = [
  { gateId: 'Checkpoint 1', location: '20.012085516682763, 73.76271362476956', isLoading: false, isAutoAnalyzing: false },
  { gateId: 'Checkpoint 2', location: '20.01402106323487, 73.82142181452639', isLoading: false, isAutoAnalyzing: false },
  { gateId: 'Checkpoint 3', location: '19.994503211817726, 73.81069297867901', isLoading: false, isAutoAnalyzing: false },
  { gateId: 'Checkpoint 4', location: '19.993535321495504, 73.75825042905704', isLoading: false, isAutoAnalyzing: false },
];

function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function Dashboard() {
  const [alerts, setAlerts] = React.useState<Alert[]>(initialAlerts);
  const [routeSuggestion, setRouteSuggestion] = React.useState<RouteSuggestion | null>(null);
  const [isSuggestingRoute, setIsSuggestingRoute] = React.useState(false);
  const [gateAnalyses, setGateAnalyses] = React.useState<GateAnalysis[]>(initialGates);
  const videoRefs = React.useRef<{[key: string]: React.RefObject<HTMLVideoElement>}>({});
  gateAnalyses.forEach(gate => {
    if (!videoRefs.current[gate.gateId]) {
      videoRefs.current[gate.gateId] = React.createRef<HTMLVideoElement>();
    }
  });

  const [hotspots, setHotspots] = React.useState<Hotspot[]>(initialHotspots);
  const [incidentReports, setIncidentReports] = React.useState<IncidentReport[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);
  const [socialMediaAnalysis, setSocialMediaAnalysis] = React.useState<SocialMediaAnalysis | null>(null);
  const [isAnalyzingSocialMedia, setIsAnalyzingSocialMedia] = React.useState(false);
  const [resourceSuggestion, setResourceSuggestion] = React.useState<ResourceSuggestion | null>(null);
  const [isSuggestingResources, setIsSuggestingResources] = React.useState(false);
  const [evacuationRoutes, setEvacuationRoutes] = React.useState<EvacuationRoute[]>([]);
  const [visibleServices, setVisibleServices] = React.useState<EmergencyService[]>([]);
  const { toast } = useToast();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([20.006, 73.792]);
  
  const analysisIntervals = React.useRef<{[key: string]: NodeJS.Timeout}>({});

  React.useEffect(() => {
    setIsMounted(true);
    // Cleanup intervals on component unmount
    return () => {
      Object.values(analysisIntervals.current).forEach(clearInterval);
    };
  }, []);

  const routeForm = useForm<z.infer<typeof routeSchema>>({
    resolver: zodResolver(routeSchema),
    defaultValues: { currentLocation: "Ram Ghat", destination: "Panchavati" },
  });

  const socialMediaForm = useForm<z.infer<typeof socialMediaSchema>>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: { postText: "" },
  });
  
  const playAnnouncement = async (text: string) => {
    try {
        const { success, error } = await generateAudioAction({ text });
        if (error) {
            toast({ variant: 'destructive', title: 'Audio Error', description: error });
            return;
        }
        if (success && audioRef.current) {
            audioRef.current.src = success.audioDataUri;
            audioRef.current.play();
        }
    } catch (e) {
        toast({ variant: 'destructive', title: 'Audio Error', description: "Failed to generate announcement." });
    }
  }

  const handleGeneratePredictiveAlert = async () => {
    const { success, error } = await generatePredictiveAlertsAction();
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error });
    }
    if (success) {
      const newAlert: Alert = {
        id: generateUniqueId(),
        type: 'predictive',
        title: success.alertType,
        message: success.alertMessage,
        location: success.location,
        severity: success.severity.toLowerCase() as Alert['severity'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAlerts(prev => [newAlert, ...prev]);
      toast({ title: 'New Predictive Alert', description: `Severity: ${success.severity} at ${success.location}` });

      if (newAlert.severity === 'critical') {
        playAnnouncement(`Critical Alert: ${newAlert.title}. ${newAlert.message}`);
      }
    }
  };

  const onSuggestRouteSubmit = async (values: z.infer<typeof routeSchema>) => {
    setIsSuggestingRoute(true);
    setRouteSuggestion(null);
    setEvacuationRoutes([]);
    const { success, error } = await suggestEvacuationRoutesAction(values);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error });
    }
    if (success) {
      setRouteSuggestion(success);
      const allRoutes = [
        ...(success.recommendedRoutes || []).map(r => ({ ...r, type: 'safe' as const })),
        ...(success.congestedRoutes || []).map(r => ({ ...r, type: 'congested' as const })),
      ];
      setEvacuationRoutes(allRoutes);
    }
    setIsSuggestingRoute(false);
  };

  const analyzeVideoFrame = React.useCallback((gateId: string, location: string) => {
    const videoRef = videoRefs.current[gateId]?.current;
    if (!videoRef || videoRef.paused || videoRef.ended) {
        return;
    }
    
    const latLonStrings = location.split(',').map(s => s.trim());
    if (latLonStrings.length !== 2 || isNaN(parseFloat(latLonStrings[0])) || isNaN(parseFloat(latLonStrings[1]))) {
        // Silently return if location is invalid to prevent spamming toasts in auto-mode
        return;
    }
    const latLon: [number, number] = [parseFloat(latLonStrings[0]), parseFloat(latLonStrings[1])];

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
    const photoDataUri = canvas.toDataURL('image/jpeg');

    setGateAnalyses(prev => prev.map(g => g.gateId === gateId ? { ...g, isLoading: true } : g));

    analyzeCrowdAction({ checkpointId: gateId, photoDataUri }).then(({ success, error }) => {
        if (error) {
            toast({ variant: 'destructive', title: 'Analysis Error', description: error });
            setGateAnalyses(prev => prev.map(g => g.gateId === gateId ? { ...g, isLoading: false } : g));
            return;
        }

        if (success) {
            const density = success.density as 'low' | 'medium' | 'high' | 'critical';
            const densityInfo = densityMap[density];

            setGateAnalyses(prev => prev.map(g => g.gateId === gateId ? { ...g, isLoading: false, peopleCount: success.peopleCount, density: density } : g));
            
            const newHotspot: Hotspot = {
                id: `${gateId}-${Date.now()}`,
                name: `${gateId} - Analysis`,
                density: success.peopleCount,
                position: latLon,
                size: densityInfo.size,
                severity: densityInfo.severity,
            };
            
            setHotspots(prev => {
                const existingHotspotIndex = prev.findIndex(h => typeof h.id === 'string' && h.id.startsWith(gateId));
                if (existingHotspotIndex > -1) {
                    const updatedHotspots = [...prev];
                    updatedHotspots[existingHotspotIndex] = newHotspot;
                    return updatedHotspots;
                }
                return [...prev, newHotspot];
            });

            if (success.density === 'high' || success.density === 'critical') {
                const newAlert: Alert = {
                    id: generateUniqueId(),
                    type: 'predictive',
                    title: `High Crowd Density at ${gateId}`,
                    message: `Detected ${success.peopleCount} people. Density is ${success.density}. Proactive measures required.`,
                    location: gateId,
                    severity: success.density as 'high' | 'critical',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setAlerts(prev => [newAlert, ...prev]);

                if (newAlert.severity === 'critical') {
                    playAnnouncement(`Critical Alert: ${newAlert.title}. ${newAlert.message}`);
                }
            }
        }
    });
  }, [toast]);

  const toggleAutoAnalysis = (gateId: string, location: string, shouldAutoAnalyze: boolean) => {
    setGateAnalyses(prev => prev.map(g => g.gateId === gateId ? { ...g, isAutoAnalyzing: shouldAutoAnalyze } : g));

    if (shouldAutoAnalyze) {
        if (analysisIntervals.current[gateId]) {
            clearInterval(analysisIntervals.current[gateId]);
        }
        analysisIntervals.current[gateId] = setInterval(() => {
            analyzeVideoFrame(gateId, location);
        }, 2000); // Analyze every 2 seconds
    } else {
        if (analysisIntervals.current[gateId]) {
            clearInterval(analysisIntervals.current[gateId]);
            delete analysisIntervals.current[gateId];
        }
        // Set loading to false when toggled off
        setGateAnalyses(prev => prev.map(g => g.gateId === gateId ? { ...g, isLoading: false } : g));
    }
  };


  const handleVideoSourceChange = (gateId: string, source: string, type: 'file' | 'url') => {
    let videoSrc = '';
    if (type === 'file') {
        const file = (document.getElementById(`video-upload-${gateId}`) as HTMLInputElement)?.files?.[0];
        if (file) {
            videoSrc = URL.createObjectURL(file);
        }
    } else {
        videoSrc = source;
    }
    setGateAnalyses(prev => prev.map(g => g.gateId === gateId ? { ...g, videoSrc } : g));
  };
  
  const handleLocationChange = (gateId: string, newLocation: string) => {
    setGateAnalyses(prev =>
      prev.map(g => (g.gateId === gateId ? { ...g, location: newLocation } : g))
    );
  };

  const handleGenerateReport = async (alert: Alert) => {
    setIsGeneratingReport(true);
    const { success, error } = await generateIncidentReportAction({ alert });
    if (error) {
        toast({ variant: 'destructive', title: 'Report Generation Error', description: error });
    }
    if (success) {
        setIncidentReports(prev => [success, ...prev]);
        toast({ title: 'Incident Report Generated', description: `Report ID: ${success.reportId}` });
    }
    setIsGeneratingReport(false);
  }

  const onAnalyzeSocialMediaSubmit = async (values: z.infer<typeof socialMediaSchema>) => {
    setIsAnalyzingSocialMedia(true);
    setSocialMediaAnalysis(null);
    const { success, error } = await analyzeSocialMediaAction(values);

    if(error){
        toast({ variant: 'destructive', title: 'Analysis Error', description: error });
    }
    if(success){
        setSocialMediaAnalysis(success);
        toast({ title: 'Social Media Post Analyzed', description: `Issue Detected: ${success.issueDetected ? 'Yes' : 'No'}` });
        
        if (success.issueDetected) {
            const newAlert: Alert = {
                id: generateUniqueId(),
                type: 'social',
                title: success.issueType,
                message: `Social media post flagged: "${values.postText.substring(0, 50)}..."`,
                location: success.location || "Unknown",
                severity: success.severity,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setAlerts(prev => [newAlert, ...prev]);

            if (newAlert.severity === 'critical') {
                playAnnouncement(`Critical Alert from Social Media: ${newAlert.title}. ${newAlert.message}`);
            }
        }
    }
    setIsAnalyzingSocialMedia(false);
  };

  const handleSuggestResources = async () => {
    setIsSuggestingResources(true);
    setResourceSuggestion(null);
    const { success, error } = await suggestResourceAllocationAction({ hotspots });
    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error });
    }
    if (success) {
        setResourceSuggestion(success);
        toast({ title: 'Resource Allocation Suggested', description: 'Optimal placements for teams calculated.' });
    }
    setIsSuggestingResources(false);
  }
  
  const toggleServiceVisibility = (type: EmergencyService['type']) => {
    setVisibleServices(prev => {
        const isVisible = prev.some(s => s.type === type);
        if (isVisible) {
            return prev.filter(s => s.type !== type);
        } else {
            const servicesToAdd = emergencyServicesData.filter(s => s.type === type);
            return [...prev, ...servicesToAdd];
        }
    });
  }

  const isServiceVisible = (type: EmergencyService['type']) => {
    return visibleServices.some(s => s.type === type);
  }
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;

    if (!query) return;

    const allLocations = [
        ...hotspots.map(h => ({name: h.name, position: h.position})),
        ...gateAnalyses.map(g => {
            const [lat, lon] = g.location.split(',').map(s => parseFloat(s.trim()));
            return {name: g.gateId, position: [lat, lon] as [number, number]};
        })
    ];

    const found = allLocations.find(loc => loc.name.toLowerCase().includes(query.toLowerCase()));

    if (found && found.position[0] && found.position[1]) {
        setMapCenter(found.position);
        toast({ title: 'Location Found', description: `Moving map to ${found.name}` });
    } else {
        toast({ variant: 'destructive', title: 'Not Found', description: `Could not find location: ${query}` });
    }
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'critical');

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <audio ref={audioRef} className="sr-only" />
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <CrowdWiseLogo className="h-6 w-6" />
                <span>CrowdWise</span>
            </a>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial" onSubmit={handleSearch}>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="search"
                        placeholder="Search locations..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    />
                </div>
            </form>
            
            <UserButton afterSignOutUrl="/" />

        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {criticalAlerts.length > 0 && (
            <div className="relative flex h-10 w-full overflow-hidden rounded-lg bg-gray-900">
                <div className="absolute inset-0 flex items-center animate-marquee whitespace-nowrap">
                    {Array.from({ length: 3 }).map((_, i) =>
                      criticalAlerts.map((alert, alertIndex) => (
                          <span key={`${alert.id}-${i}-${alertIndex}`} className={cn("mx-4 text-sm font-medium", marqueeAlertColors[alert.severity])}>
                             <Siren className="inline-block h-4 w-4 mr-2" /> {alert.title}: {alert.message} at {alert.location}
                          </span>
                      ))
                    )}
                </div>
            </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 row-span-2">
                <CardHeader>
                    <CardTitle>Live Crowd Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="h-[60vh]">
                    <Heatmap center={mapCenter} hotspots={hotspots} evacuationRoutes={evacuationRoutes} emergencyServices={visibleServices} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Live Alerts</CardTitle>
                    <Button onClick={handleGeneratePredictiveAlert} size="sm" className="gap-1">
                        <Flame className="h-4 w-4" />
                        Predictive Alert
                    </Button>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[28vh]">
                        <div className="space-y-3">
                        {alerts.map((alert) => (
                          <Card key={alert.id} className={cn("p-3", alertColors[alert.severity])}>
                            <div className="flex items-start gap-3">
                              <div className="mt-1">{alertIcons[alert.type]}</div>
                              <div className="flex-1">
                                <p className="font-semibold">{alert.title}</p>
                                <p className="text-xs text-muted-foreground">{alert.message}</p>
                                <div className="text-xs text-muted-foreground/80 mt-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span>{alert.location}</span>
                                    <span>{alert.timestamp}</span>
                                    {(alert.severity === 'critical' || alert.severity === 'high') && (
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => playAnnouncement(`Attention: ${alert.title}. ${alert.message}`)}>
                                        <Volume2 className="h-4 w-4"/>
                                      </Button>
                                    )}
                                  </div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isGeneratingReport}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Generate Incident Report?</DialogTitle>
                                            <DialogDescription>
                                                This will generate a new incident report based on the details of this alert.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Button onClick={() => handleGenerateReport(alert)} disabled={isGeneratingReport}>
                                            {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4"/>}
                                            Confirm & Generate
                                        </Button>
                                    </DialogContent>
                                   </Dialog>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Incident Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[28vh]">
                        {incidentReports.length > 0 ? (
                            incidentReports.map((report) => (
                                <div key={report.reportId} className="mb-4">
                                    <h4 className="font-semibold">{report.summary}</h4>
                                    <p className="text-xs text-muted-foreground">ID: {report.reportId} | Prio: {report.priority}</p>
                                    <ul className="list-disc pl-5 mt-1 text-xs">
                                        {report.suggestedActions.map((action, i) => <li key={i}>{action}</li>)}
                                    </ul>
                                </div>
                            ))
                        ) : (
                             <div className="text-center text-sm text-muted-foreground pt-10">
                                <p>No incident reports generated yet.</p>
                             </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="xl:col-span-2">
                <CardHeader>
                    <CardTitle>Crowd Video Analysis</CardTitle>
                    <CardDescription>Upload or link a video to analyze crowd density in real-time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gateAnalyses.map((gate) => (
                        <Card key={gate.gateId} className="overflow-hidden">
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span>{gate.gateId}</span>
                              {gate.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0 space-y-2">
                             <div className="relative aspect-video w-full bg-black rounded-md flex items-center justify-center">
                                <video
                                  ref={videoRefs.current[gate.gateId]}
                                  src={gate.videoSrc}
                                  controls
                                  muted
                                  loop
                                  playsInline
                                  className="w-full h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                                {!gate.videoSrc && (
                                    <div className="text-center text-muted-foreground">
                                        <Camera className="mx-auto h-6 w-6" />
                                        <span className="text-xs">No Video Source</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-xs">
                                <Input
                                    type="text"
                                    placeholder="Enter video URL (e.g., MP4, WebM)"
                                    onChange={(e) => handleVideoSourceChange(gate.gateId, e.target.value, 'url')}
                                    className="h-8"
                                    disabled={gate.isAutoAnalyzing}
                                />
                                <label htmlFor={`video-upload-${gate.gateId}`} className={cn("block text-center w-full border border-dashed rounded-md p-1", gate.isAutoAnalyzing ? "cursor-not-allowed bg-muted/50" : "cursor-pointer hover:bg-muted")}>
                                    or Upload Video File
                                </label>
                                <input
                                    id={`video-upload-${gate.gateId}`}
                                    type="file"
                                    accept="video/*"
                                    className="sr-only"
                                    onChange={(e) => handleVideoSourceChange(gate.gateId, '', 'file')}
                                    disabled={gate.isAutoAnalyzing}
                                />
                                 <Input 
                                    type="text"
                                    placeholder="Lat, Lon"
                                    value={gate.location}
                                    onChange={(e) => handleLocationChange(gate.gateId, e.target.value)}
                                    disabled={gate.isLoading || gate.isAutoAnalyzing}
                                    className="h-8"
                                  />
                            </div>
                             <div className="flex items-center justify-between mt-2">
                                <Button
                                    onClick={() => analyzeVideoFrame(gate.gateId, gate.location)}
                                    disabled={gate.isLoading || !gate.videoSrc || gate.isAutoAnalyzing}
                                    className="flex-1 mr-2"
                                >
                                    {gate.isLoading && !gate.isAutoAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Analyze Frame
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id={`auto-analyze-${gate.gateId}`}
                                        checked={gate.isAutoAnalyzing}
                                        onCheckedChange={(checked) => toggleAutoAnalysis(gate.gateId, gate.location, checked)}
                                        disabled={!gate.videoSrc}
                                    />
                                    <Label htmlFor={`auto-analyze-${gate.gateId}`} className="text-xs">Auto</Label>
                                </div>
                            </div>
                            {gate.peopleCount !== undefined && (
                              <div className="mt-2 text-xs">
                                <p>People Count: <span className="font-bold">{gate.peopleCount}</span></p>
                                <p>Density: <span className={cn("font-bold capitalize", {
                                  'text-green-500': gate.density === 'low',
                                  'text-yellow-500': gate.density === 'medium',
                                  'text-orange-500': gate.density === 'high',
                                  'text-red-500': gate.density === 'critical',
                                })}>{gate.density}</span></p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Evacuation Route Suggestion</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...routeForm}>
                      <form onSubmit={routeForm.handleSubmit(onSuggestRouteSubmit)} className="space-y-4">
                        <FormField control={routeForm.control} name="currentLocation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Ram Ghat" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={routeForm.control} name="destination" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Safe Destination</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Panchavati" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isSuggestingRoute} className="w-full">
                          {isSuggestingRoute ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                          Suggest Routes
                        </Button>
                      </form>
                    </Form>
                    {routeSuggestion && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Recommendations:</h4>
                            <p className="text-xs text-muted-foreground mb-2">{routeSuggestion.recommendationReasoning}</p>
                            <ScrollArea className="h-[20vh]">
                              <ul className="space-y-2">
                                  {routeSuggestion.recommendedRoutes.map((route, i) => (
                                  <li key={route.name} className="text-sm flex items-center">
                                      <ChevronRight className="h-4 w-4 mr-2 text-green-500" />
                                      <div>
                                          <span className="font-medium">{route.name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">({route.travelTime})</span>
                                      </div>
                                  </li>
                                  ))}
                              </ul>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Trend Analysis</CardTitle>
                    <CardDescription>Crowd density over time.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="h-[200px] w-full">
                      <ResponsiveContainer>
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                          <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip cursor={{ fill: "hsl(var(--primary) / 0.1)" }} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }} />
                          <Bar dataKey="density" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle>Social Media Monitoring</CardTitle>
                    <CardDescription>Analyze a simulated social media post for potential issues.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...socialMediaForm}>
                        <form onSubmit={socialMediaForm.handleSubmit(onAnalyzeSocialMediaSubmit)} className="space-y-4">
                            <FormField control={socialMediaForm.control} name="postText" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="e.g., It's getting really crowded near the main stage, can't move!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                            )} />
                            <Button type="submit" disabled={isAnalyzingSocialMedia} className="w-full">
                               {isAnalyzingSocialMedia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Analyze Post
                            </Button>
                        </form>
                    </Form>
                    {socialMediaAnalysis && (
                        <Card className="bg-background/70 mt-4">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Analysis Result</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1 p-4 pt-0">
                                <p>Issue Detected: <span className="font-bold">{socialMediaAnalysis.issueDetected ? 'Yes' : 'No'}</span></p>
                                {socialMediaAnalysis.issueDetected && <>
                                    <p>Issue Type: <span className="font-bold">{socialMediaAnalysis.issueType}</span></p>
                                    <p>Location: <span className="font-bold">{socialMediaAnalysis.location || 'N/A'}</span></p>
                                    <p>Severity: <span className="font-bold capitalize">{socialMediaAnalysis.severity}</span></p>
                                </>}
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>AI Resource Allocation</CardTitle>
                    <CardDescription>Get AI-powered suggestions for security and medical team placements based on live hotspots.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSuggestResources} className="w-full" disabled={isSuggestingResources}>
                        {isSuggestingResources ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        Suggest Resource Placements
                    </Button>
                    {resourceSuggestion && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-sm mb-2">Reasoning:</h4>
                            <p className="text-xs text-muted-foreground mb-4">{resourceSuggestion.reasoning}</p>
                            
                            <h4 className="font-semibold text-sm mb-2">Security Teams</h4>
                            <ul className="space-y-1 list-disc pl-5 text-sm mb-4">
                                {resourceSuggestion.security.map((suggestion, i) => <li key={`sec-${i}`}>{suggestion}</li>)}
                            </ul>
                           
                            <h4 className="font-semibold text-sm mb-2">Medical Teams</h4>
                            <ul className="space-y-1 list-disc pl-5 text-sm">
                                {resourceSuggestion.medical.map((suggestion, i) => <li key={`med-${i}`}>{suggestion}</li>)}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Emergency Services</CardTitle>
                    <CardDescription>Toggle visibility of emergency services on the map.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button onClick={() => toggleServiceVisibility('hospital')} variant={isServiceVisible('hospital') ? 'secondary' : 'outline'} className="justify-start">
                        <HeartPulse className="mr-2 h-4 w-4" /> Hospitals
                    </Button>
                    <Button onClick={() => toggleServiceVisibility('police')} variant={isServiceVisible('police') ? 'secondary' : 'outline'} className="justify-start">
                        <Shield className="mr-2 h-4 w-4" /> Police
                    </Button>
                     <Button onClick={() => toggleServiceVisibility('fire')} variant={isServiceVisible('fire') ? 'secondary' : 'outline'} className="justify-start">
                        <Flame className="mr-2 h-4 w-4" /> Fire Stations
                    </Button>
                </CardContent>
            </Card>
        </div>

      </main>
    </div>
  );
}
