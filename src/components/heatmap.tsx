
"use client";

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { LatLngExpression, Map as LeafletMap, Polyline, Marker, LayerGroup, Icon } from 'leaflet';
import * as React from 'react';
import type { Hotspot, EvacuationRoute, EmergencyService } from '@/lib/types';
import ReactDOMServer from 'react-dom/server';
import { HeartPulse, Shield, Flame } from 'lucide-react';

const severityColors: { [key: string]: string } = {
    low: "green",
    medium: "yellow",
    high: "orange",
    critical: "red",
};

interface HeatmapProps {
    center: [number, number];
    hotspots: Hotspot[];
    evacuationRoutes: EvacuationRoute[];
    emergencyServices: EmergencyService[];
}

const serviceIcons: { [key in EmergencyService['type']]: React.ReactElement } = {
    hospital: <HeartPulse color="white" />,
    police: <Shield color="white" />,
    fire: <Flame color="white" />,
};

const serviceIconColors: { [key in EmergencyService['type']]: string } = {
    hospital: 'bg-red-500',
    police: 'bg-blue-500',
    fire: 'bg-orange-500',
};

export function Heatmap({ center, hotspots, evacuationRoutes, emergencyServices }: HeatmapProps) {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const mapInstanceRef = React.useRef<LeafletMap | null>(null);
    const routeLayersRef = React.useRef<Polyline[]>([]);
    const serviceLayerRef = React.useRef<LayerGroup | null>(null);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
      setIsClient(true);
    }, []);

    React.useEffect(() => {
        if (isClient && mapRef.current && !mapInstanceRef.current) {
            const L = require('leaflet');
            require('leaflet.markercluster');
            const map = L.map(mapRef.current).setView(center, 16);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
    }, [isClient, center]);

    React.useEffect(() => {
        if (mapInstanceRef.current && center) {
            mapInstanceRef.current.setView(center, 16, { animate: true });
        }
    }, [center]);

    React.useEffect(() => {
        if (mapInstanceRef.current) {
            const L = require('leaflet');
            mapInstanceRef.current.eachLayer(layer => {
                if (layer instanceof L.Circle) {
                    layer.remove();
                }
            });

            hotspots.forEach(hotspot => {
                L.circle(hotspot.position, {
                    radius: hotspot.size / 2,
                    color: severityColors[hotspot.severity],
                    fillColor: severityColors[hotspot.severity],
                    fillOpacity: 0.4
                }).addTo(mapInstanceRef.current!)
                .bindTooltip(`
                    <p class="font-bold">${hotspot.name}</p>
                    <p>Crowd Density: ${hotspot.density}%</p>
                    <p>Status: <span class="capitalize">${hotspot.severity}</span></p>
                `);
            });
        }
    }, [hotspots, isClient]);

    React.useEffect(() => {
        if (mapInstanceRef.current) {
            const L = require('leaflet');
            
            routeLayersRef.current.forEach(layer => layer.remove());
            routeLayersRef.current = [];

            evacuationRoutes.forEach(route => {
                const path = L.polyline(route.path as LatLngExpression[], {
                    color: route.type === 'safe' ? 'green' : 'red',
                    weight: 5,
                    dashArray: route.type === 'congested' ? '10, 10' : undefined,
                }).addTo(mapInstanceRef.current!);
                
                path.bindTooltip(`
                    <b>${route.name}</b><br>
                    Time: ${route.travelTime}<br>
                    Status: ${route.congestion}
                `);

                routeLayersRef.current.push(path);
            });
        }
    }, [evacuationRoutes, isClient]);

    React.useEffect(() => {
        if (mapInstanceRef.current && isClient) {
            const L = require('leaflet');

            if (serviceLayerRef.current) {
                serviceLayerRef.current.clearLayers();
            } else {
                serviceLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
            }

            const getIcon = (serviceType: EmergencyService['type']): Icon => {
                const iconHtml = ReactDOMServer.renderToString(
                    <div className={`rounded-full p-1 ${serviceIconColors[serviceType]}`}>
                        {serviceIcons[serviceType]}
                    </div>
                );
                return L.divIcon({
                    html: iconHtml,
                    className: 'bg-transparent border-0',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });
            };

            emergencyServices.forEach(service => {
                const marker: Marker = L.marker(service.position, { icon: getIcon(service.type) });
                marker.bindTooltip(`<b>${service.name}</b><br>Type: ${service.type.charAt(0).toUpperCase() + service.type.slice(1)}`);
                serviceLayerRef.current?.addLayer(marker);
            });
        }
    }, [emergencyServices, isClient]);


    if (!isClient) {
        return <div className="w-full h-full bg-muted animate-pulse rounded-xl" />;
    }

    return (
        <div ref={mapRef} className="w-full h-full rounded-xl z-0" />
    );
}

    