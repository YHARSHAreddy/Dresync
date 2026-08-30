import { RecommendationReason } from '../../types';

interface CompatibilityScoreProps {
  score: number; // 0–1
  label: string;
  reasons: RecommendationReason[];
}

const REASON_ICONS: Record<string, string> = {
  color:    '🎨',
  style:    '✨',
  occasion: '📍',
  season:   '🌿',
  category: '👔',
};

const REASON_COLORS: Record<string, string> = {
  color:    'var(--info)',
  style:    'var(--accent)',
  occasion: 'var(--success)',
  season:   'var(--success)',
  category: 'var(--text-secondary)',
};

export function CompatibilityScore({ score, label, reasons }: CompatibilityScoreProps) {
  const pct = Math.round(score * 100);
  const barColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--error)';

  return (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <div>
          <div className="score-number" style={{ color: barColor }}>{pct}%</div>
          <div className="score-label">Compatibility</div>
        </div>
        <span
          className="badge"
          style={{
            background: `${barColor}18`,
            color: barColor,
            fontSize: 'var(--font-size-sm)',
            padding: '6px 14px',
          }}
        >
          {label}
        </span>
      </div>

      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}CC 100%)`,
          }}
        />
      </div>

      {reasons.length > 0 && (
        <div className="score-reasons">
          {reasons.map((r, i) => (
            <div key={i} className="score-reason">
              <div
                className="score-reason-icon"
                style={{ background: `${REASON_COLORS[r.type] || 'var(--text-muted)'}18` }}
              >
                {REASON_ICONS[r.type] || '•'}
              </div>
              <span>{r.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
