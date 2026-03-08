import React, { useState, useEffect } from 'react';
import MapComponent from '../Map/MapComponent';
import SafetyScore from '../SafetyScore/SafetyScore';
import { getAllWaterData } from '../../services/api';
import './Dashboard.css';

function Dashboard({ selectedLocation, onLocationSelect, refreshKey }) {
  const [waterData, setWaterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReading, setActiveReading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getAllWaterData();
        setWaterData(result.data || []);
      } catch (err) {
        setError('Failed to load water quality data. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleMarkerClick = (reading) => {
    setActiveReading(reading);
  };

  const handleMapClick = (latlng) => {
    if (onLocationSelect) {
      onLocationSelect(latlng);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__map-container">
        {loading && (
          <div className="dashboard__overlay">
            <span className="dashboard__spinner" aria-label="Loading" />
            <p>Loading water quality data…</p>
          </div>
        )}
        {error && (
          <div className="dashboard__overlay dashboard__overlay--error">
            <p>⚠️ {error}</p>
          </div>
        )}
        <MapComponent
          waterData={waterData}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          selectedLocation={selectedLocation}
        />
      </div>

      <aside className="dashboard__sidebar">
        <h2 className="dashboard__sidebar-title">Water Quality Insights</h2>

        {!activeReading && (
          <div className="dashboard__hint">
            <p>🗺️ Click any map marker to inspect water quality readings.</p>
            <p>Click the map to select a location for data submission.</p>
          </div>
        )}

        {activeReading && (
          <div className="dashboard__reading">
            <h3 className="dashboard__location-name">
              {activeReading.locationName || 'Unknown Location'}
            </h3>
            <p className="dashboard__coords">
              {activeReading.location.coordinates[1].toFixed(4)},{' '}
              {activeReading.location.coordinates[0].toFixed(4)}
            </p>

            <SafetyScore
              score={activeReading.safetyScore}
              rating={activeReading.safetyRating}
            />

            <div className="dashboard__params">
              <ParameterRow
                label="pH"
                value={activeReading.ph}
                unit="pH"
                whoOk={activeReading.whoCompliance?.ph}
                nsdqwOk={activeReading.nsdqwCompliance?.ph}
              />
              <ParameterRow
                label="Turbidity"
                value={activeReading.turbidity}
                unit="NTU"
                whoOk={activeReading.whoCompliance?.turbidity}
                nsdqwOk={activeReading.nsdqwCompliance?.turbidity}
              />
              <ParameterRow
                label="TDS"
                value={activeReading.tds}
                unit="mg/L"
                whoOk={activeReading.whoCompliance?.tds}
                nsdqwOk={activeReading.nsdqwCompliance?.tds}
              />
              <ParameterRow
                label="Conductivity"
                value={activeReading.conductivity}
                unit="µS/cm"
                whoOk={activeReading.whoCompliance?.conductivity}
                nsdqwOk={activeReading.nsdqwCompliance?.conductivity}
              />
            </div>

            <p className="dashboard__recorded-at">
              Recorded: {new Date(activeReading.createdAt).toLocaleString()}
            </p>
            {activeReading.recordedBy && (
              <p className="dashboard__recorded-by">By: {activeReading.recordedBy}</p>
            )}
          </div>
        )}

        <div className="dashboard__legend">
          <h4>Safety Score Legend</h4>
          <ul>
            <li><span className="legend-dot legend-dot--safe" />Safe (≥ 80)</li>
            <li><span className="legend-dot legend-dot--marginal" />Marginal (60–79)</li>
            <li><span className="legend-dot legend-dot--unsafe" />Unsafe (40–59)</li>
            <li><span className="legend-dot legend-dot--highly-unsafe" />Highly Unsafe (&lt; 40)</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function ParameterRow({ label, value, unit, whoOk, nsdqwOk }) {
  return (
    <div className="param-row">
      <span className="param-row__label">{label}</span>
      <span className="param-row__value">
        {value} <span className="param-row__unit">{unit}</span>
      </span>
      <span className="param-row__badges">
        <span
          className={`badge badge--who ${whoOk ? 'badge--ok' : 'badge--fail'}`}
          title="WHO compliance"
        >
          WHO
        </span>
        <span
          className={`badge badge--nsdqw ${nsdqwOk ? 'badge--ok' : 'badge--fail'}`}
          title="NSDQW compliance"
        >
          NSDQW
        </span>
      </span>
    </div>
  );
}

export default Dashboard;
