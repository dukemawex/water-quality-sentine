import React from 'react';
import './SafetyScore.css';

const RATING_CONFIG = {
  Safe: { color: 'var(--color-safe)', bg: '#dcfce7', icon: '✅' },
  Marginal: { color: 'var(--color-marginal)', bg: '#fef9c3', icon: '⚠️' },
  Unsafe: { color: 'var(--color-unsafe)', bg: '#fee2e2', icon: '❌' },
  'Highly Unsafe': { color: 'var(--color-highly-unsafe)', bg: '#fecaca', icon: '🚫' },
};

/**
 * SafetyScore
 * Displays a large numeric safety score with a colour-coded arc gauge and rating badge.
 */
function SafetyScore({ score, rating }) {
  const config = RATING_CONFIG[rating] || { color: '#64748b', bg: '#f1f5f9', icon: '❓' };

  // Arc gauge: 0–100 maps to 0–220 degrees of stroke
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270° arc
  const filled = arc * (Math.min(Math.max(score || 0, 0), 100) / 100);
  const offset = circumference - filled;

  return (
    <div className="safety-score" style={{ background: config.bg }}>
      <div className="safety-score__gauge">
        <svg viewBox="0 0 100 100" width="90" height="90" aria-hidden="true">
          {/* Background arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="9"
            strokeDasharray={`${arc} ${circumference - arc}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform="rotate(135 50 50)"
          />
          {/* Filled arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth="9"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            transform="rotate(135 50 50)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          {/* Score text */}
          <text x="50" y="52" textAnchor="middle" dominantBaseline="middle"
            fontSize="18" fontWeight="700" fill={config.color}>
            {score !== undefined ? score.toFixed(0) : '—'}
          </text>
        </svg>
      </div>

      <div className="safety-score__info">
        <span className="safety-score__icon">{config.icon}</span>
        <span className="safety-score__rating" style={{ color: config.color }}>
          {rating || 'Unknown'}
        </span>
        <span className="safety-score__label">Safety Score</span>
      </div>
    </div>
  );
}

export default SafetyScore;
