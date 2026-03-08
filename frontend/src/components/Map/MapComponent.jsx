import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Fix Leaflet default icon paths (broken by Vite's asset pipeline)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Colour a marker by Safety Score
const getMarkerColor = (score) => {
  if (score === undefined || score === null) return '#64748b';
  if (score >= 80) return '#16a34a'; // Safe
  if (score >= 60) return '#ca8a04'; // Marginal
  if (score >= 40) return '#dc2626'; // Unsafe
  return '#7f1d1d'; // Highly Unsafe
};

const createColoredIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div class="map-marker" style="background:${color};border-color:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });

// Nsukka, Enugu — default map centre
const DEFAULT_CENTER = [6.857, 7.393];
const DEFAULT_ZOOM = 10;

/**
 * MapComponent
 *
 * Renders a Leaflet map with:
 *  - OpenStreetMap base tiles
 *  - A heatmap layer representing water quality (via leaflet.heat)
 *  - Coloured circle markers for individual readings
 *  - Click handler to select new measurement locations
 */
function MapComponent({ waterData = [], onMarkerClick, onMapClick, selectedLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const selectedMarkerRef = useRef(null);

  // Initialise map once
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Map click → select location
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e) => {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [onMapClick]);

  // Update markers and heatmap when waterData changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Remove previous heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!waterData || waterData.length === 0) return;

    // Build heatmap points: [lat, lng, intensity]
    const heatPoints = waterData.map((d) => {
      const [lng, lat] = d.location.coordinates;
      // Intensity inversely proportional to safety score (lower score = hotter)
      const intensity = d.safetyScore !== undefined ? (100 - d.safetyScore) / 100 : 0.5;
      return [lat, lng, intensity];
    });

    // Dynamically load leaflet.heat (ESM-friendly)
    import('leaflet.heat').then(() => {
      if (!mapRef.current) return;
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 20,
        maxZoom: 17,
        gradient: { 0.0: '#16a34a', 0.4: '#ca8a04', 0.7: '#dc2626', 1.0: '#7f1d1d' },
      }).addTo(mapRef.current);
    }).catch(() => {
      // leaflet.heat not available; skip heat layer silently
    });

    // Add individual markers
    waterData.forEach((d) => {
      const [lng, lat] = d.location.coordinates;
      const color = getMarkerColor(d.safetyScore);
      const icon = createColoredIcon(color);

      const marker = L.marker([lat, lng], { icon });

      const score = d.safetyScore !== undefined ? d.safetyScore.toFixed(1) : 'N/A';
      marker.bindPopup(
        `<div class="map-popup">
          <strong>${d.locationName || 'Unknown Location'}</strong>
          <div class="map-popup__score" style="color:${color}">Score: ${score}</div>
          <div>pH: ${d.ph} | Turbidity: ${d.turbidity} NTU</div>
          <div>TDS: ${d.tds} mg/L | Conductivity: ${d.conductivity} µS/cm</div>
          <div class="map-popup__rating">${d.safetyRating || ''}</div>
        </div>`,
        { maxWidth: 220 }
      );

      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(d);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [waterData, onMarkerClick]);

  // Show a pin for the currently selected (new) location
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedMarkerRef.current) {
      map.removeLayer(selectedMarkerRef.current);
      selectedMarkerRef.current = null;
    }

    if (!selectedLocation) return;

    const icon = L.divIcon({
      className: '',
      html: `<div class="map-marker map-marker--selected"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const m = L.marker([selectedLocation.lat, selectedLocation.lng], { icon });
    m.bindPopup(`Selected: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`);
    m.addTo(map);
    selectedMarkerRef.current = m;
    map.panTo([selectedLocation.lat, selectedLocation.lng]);
  }, [selectedLocation]);

  return <div ref={containerRef} className="map-container" aria-label="Water quality map" />;
}

export default MapComponent;
