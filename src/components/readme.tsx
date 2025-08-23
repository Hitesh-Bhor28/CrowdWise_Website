
import { CrowdWiseLogo } from "./icons";

// This is a placeholder README component.
// In a real application, you might fetch this content from a markdown file.
export const README = () => (
    <div>
        <div className="flex items-center gap-4 mb-6">
            <CrowdWiseLogo className="h-12 w-12 text-primary" />
            <h1 className="text-3xl font-bold">CrowdWise: AI-Powered Crowd & Disaster Management</h1>
        </div>

        <p className="lead text-muted-foreground">
            CrowdWise is an advanced, AI-driven command center dashboard designed for real-time crowd analysis, predictive alerting, and intelligent disaster management. Built with Next.js, Genkit, and ShadCN UI, this platform provides actionable insights to ensure public safety during large-scale events.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
        <ul className="list-disc list-inside space-y-3">
            <li>
                <strong>Live Crowd Heatmap:</strong> A real-time, interactive map visualizing crowd density and hotspots. Integrated with Leaflet for robust performance.
            </li>
            <li>
                <strong>AI Crowd Video Analysis:</strong> Upload CCTV footage or provide a video URL to get real-time people counts and density estimates. Features an auto-analysis mode for continuous monitoring.
            </li>
            <li>
                <strong>Predictive Alerts:</strong> An AI model analyzes historical and real-time data to generate predictive alerts for high-congestion events before they become critical.
            </li>
            <li>
                <strong>AI Evacuation Route Suggestion:</strong> In emergencies, the AI suggests the safest and fastest evacuation routes, which are then rendered directly on the map, avoiding congested paths.
            </li>
            <li>
                <strong>AI Incident Reporting:</strong> Automatically generate detailed incident reports from alerts with a single click, including summaries, priority levels, and suggested actions.
            </li>
            <li>
                <strong>AI Social Media Monitoring:</strong> Analyze social media posts for keywords and sentiment that might indicate an emerging issue, automatically flagging them as alerts.
            </li>
            <li>
                <strong>AI Resource Allocation:</strong> Get intelligent recommendations for deploying security and medical teams based on the locations and severity of crowd hotspots.
            </li>
            <li>
                <strong>Emergency Service Locator:</strong> Toggle on-map visibility for nearby hospitals, police stations, and fire stations.
            </li>
            <li>
                <strong>Trend Analysis:</strong> Visualize historical crowd data to identify patterns and aid in future event planning.
            </li>
            <li>
                <strong>Text-to-Speech Announcements:</strong> Generate and play audio announcements for critical alerts directly from the dashboard.
            </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Technology Stack</h2>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Framework:</strong> Next.js (App Router)</li>
            <li><strong>AI/ML:</strong> Google's Genkit & Gemini Models</li>
            <li><strong>UI:</strong> React, TypeScript, ShadCN UI, Tailwind CSS</li>
            <li><strong>Mapping:</strong> Leaflet, OpenStreetMap</li>
            <li><strong>Authentication:</strong> Clerk</li>
            <li><strong>Styling:</strong> Tailwind CSS</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">LinkedIn Post Suggestion</h2>
        <div className="p-4 border rounded-lg bg-muted/50">
            <p className="font-semibold">Here's a post you can use to share your project:</p>
            <hr className="my-2" />
            <p className="text-sm">
                Excited to share **CrowdWise**, my new AI-powered crowd management platform! 🚀
                <br /><br />
                I built this command center dashboard using Next.js, Google's Genkit, and TypeScript to tackle the challenge of ensuring public safety at large events.
                <br /><br />
                Key features include:
                <br />
                - 📹 Real-time crowd counting from video feeds
                <br />
                - 🔥 Predictive alerts for high-congestion zones
                <br />
                - 🗺️ AI-suggested evacuation routes drawn on a live map
                <br />
                - 🤖 Automated incident reporting and resource allocation
                <br /><br />
                This project showcases how generative AI can be used to create powerful, proactive safety tools. Check out the GitHub repo to see how it works!
                <br /><br />
                #AI #NextJS #Genkit #PublicSafety #React #TypeScript #ShadCN
            </p>
        </div>
    </div>
);
