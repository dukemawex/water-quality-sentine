import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafetyScore from '../SafetyScore/SafetyScore';
import { submitWaterData, analyzeWaterStatus } from '../../services/api';
import './WaterDataForm.css';

const INITIAL_FORM = {
  lat: '',
  lng: '',
  locationName: '',
  ph: '',
  turbidity: '',
  tds: '',
  conductivity: '',
  temperature: '',
  dissolvedOxygen: '',
  recordedBy: '',
  notes: '',
};

function WaterDataForm({ initialLocation, onSubmitted }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState([]);

  // Pre-fill coordinates from the map selection
  useEffect(() => {
    if (initialLocation) {
      setForm((prev) => ({
        ...prev,
        lat: initialLocation.lat.toFixed(6),
        lng: initialLocation.lng.toFixed(6),
      }));
    }
  }, [initialLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors([]);
    setPreview(null);
  };

  const requiredFieldsFilled = () => {
    const required = ['lat', 'lng', 'ph', 'turbidity', 'tds', 'conductivity'];
    return required.every((f) => form[f] !== '');
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!requiredFieldsFilled()) return;

    try {
      const result = await analyzeWaterStatus({
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        ph: parseFloat(form.ph),
        turbidity: parseFloat(form.turbidity),
        tds: parseFloat(form.tds),
        conductivity: parseFloat(form.conductivity),
        locationName: form.locationName,
      });
      setPreview(result);
      setErrors([]);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors.map((e) => e.msg));
      } else {
        setErrors([err.message || 'Failed to preview analysis.']);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requiredFieldsFilled()) return;

    setSubmitting(true);
    setErrors([]);

    try {
      await submitWaterData({
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        locationName: form.locationName,
        ph: parseFloat(form.ph),
        turbidity: parseFloat(form.turbidity),
        tds: parseFloat(form.tds),
        conductivity: parseFloat(form.conductivity),
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        dissolvedOxygen: form.dissolvedOxygen ? parseFloat(form.dissolvedOxygen) : undefined,
        recordedBy: form.recordedBy,
        notes: form.notes,
      });

      setSuccess(true);
      setForm(INITIAL_FORM);
      setPreview(null);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors.map((e) => e.msg));
      } else {
        setErrors([err.message || 'Submission failed. Is the backend running?']);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="form-page">
        <div className="form-success">
          <span className="form-success__icon">✅</span>
          <h2>Data Submitted Successfully!</h2>
          <p>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1 className="form-card__title">Submit Water Quality Data</h1>
        <p className="form-card__subtitle">
          Click a location on the{' '}
          <button className="form-card__link-btn" onClick={() => navigate('/')}>
            map
          </button>{' '}
          to auto-fill coordinates, then enter your measurements.
        </p>

        {errors.length > 0 && (
          <ul className="form-errors">
            {errors.map((msg, i) => (
              <li key={i}>⚠️ {msg}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Location */}
          <fieldset className="form-section">
            <legend>Location</legend>
            <div className="form-row form-row--2">
              <label className="form-label">
                Latitude *
                <input
                  type="number"
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  step="any"
                  min="-90"
                  max="90"
                  required
                  placeholder="e.g. 6.857"
                  className="form-input"
                />
              </label>
              <label className="form-label">
                Longitude *
                <input
                  type="number"
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  step="any"
                  min="-180"
                  max="180"
                  required
                  placeholder="e.g. 7.393"
                  className="form-input"
                />
              </label>
            </div>
            <label className="form-label">
              Location Name
              <input
                type="text"
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                placeholder="e.g. Nsukka Borehole 3"
                className="form-input"
                maxLength={200}
              />
            </label>
          </fieldset>

          {/* Core parameters */}
          <fieldset className="form-section">
            <legend>Water Quality Parameters</legend>
            <div className="form-row form-row--2">
              <label className="form-label">
                pH (0–14) *
                <input
                  type="number"
                  name="ph"
                  value={form.ph}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="14"
                  required
                  placeholder="e.g. 7.2"
                  className="form-input"
                />
              </label>
              <label className="form-label">
                Turbidity (NTU) *
                <input
                  type="number"
                  name="turbidity"
                  value={form.turbidity}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  required
                  placeholder="e.g. 2.5"
                  className="form-input"
                />
              </label>
            </div>
            <div className="form-row form-row--2">
              <label className="form-label">
                TDS (mg/L) *
                <input
                  type="number"
                  name="tds"
                  value={form.tds}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  required
                  placeholder="e.g. 350"
                  className="form-input"
                />
              </label>
              <label className="form-label">
                Conductivity (µS/cm) *
                <input
                  type="number"
                  name="conductivity"
                  value={form.conductivity}
                  onChange={handleChange}
                  step="1"
                  min="0"
                  required
                  placeholder="e.g. 600"
                  className="form-input"
                />
              </label>
            </div>
          </fieldset>

          {/* Optional parameters */}
          <fieldset className="form-section">
            <legend>Optional Parameters</legend>
            <div className="form-row form-row--2">
              <label className="form-label">
                Temperature (°C)
                <input
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 25.0"
                  className="form-input"
                />
              </label>
              <label className="form-label">
                Dissolved Oxygen (mg/L)
                <input
                  type="number"
                  name="dissolvedOxygen"
                  value={form.dissolvedOxygen}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="e.g. 6.5"
                  className="form-input"
                />
              </label>
            </div>
          </fieldset>

          {/* Metadata */}
          <fieldset className="form-section">
            <legend>Metadata</legend>
            <label className="form-label">
              Recorded by
              <input
                type="text"
                name="recordedBy"
                value={form.recordedBy}
                onChange={handleChange}
                placeholder="e.g. Field Team A"
                className="form-input"
                maxLength={100}
              />
            </label>
            <label className="form-label">
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional observations…"
                className="form-input form-input--textarea"
                maxLength={1000}
              />
            </label>
          </fieldset>

          {/* Preview analysis */}
          {preview && (
            <div className="form-preview">
              <h3>Analysis Preview</h3>
              <SafetyScore score={preview.safetyScore} rating={preview.safetyRating} />
              <div className="form-preview__compliance">
                <ComplianceBadge label="WHO" ok={preview.whoCompliance?.overall} />
                <ComplianceBadge label="NSDQW" ok={preview.nsdqwCompliance?.overall} />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handlePreview}
              disabled={!requiredFieldsFilled()}
            >
              Preview Analysis
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || !requiredFieldsFilled()}
            >
              {submitting ? 'Submitting…' : 'Submit Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComplianceBadge({ label, ok }) {
  return (
    <span className={`compliance-badge ${ok ? 'compliance-badge--ok' : 'compliance-badge--fail'}`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}

export default WaterDataForm;
