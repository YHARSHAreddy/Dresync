import React, { useEffect } from 'react';
import { Outfit } from '../../types';
import { MannequinViewer } from './MannequinViewer';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: Outfit | null;
}

export function TryOnModal({ isOpen, onClose, outfit }: TryOnModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !outfit) return null;

  const score = Math.round((outfit.compatibility_score || 0.85) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left: 3D Mannequin Stage */}
        <div className="w-full md:w-3/5 h-[420px] md:h-auto min-h-[380px] relative bg-surface-container-lowest">
          <MannequinViewer outfit={outfit} />
          <div className="absolute bottom-4 left-4 z-10 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-body-sm text-on-surface-variant flex items-center gap-1.5 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>touch_app</span>
            Drag to rotate 360° &bull; Scroll to zoom
          </div>
        </div>

        {/* Right: Outfit Info & Actions */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-surface-container-low border-t md:border-t-0 md:border-l border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>diamond</span>
                  {score}% Match
                </span>
                {outfit.occasion && (
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider bg-surface-container px-2.5 py-1 rounded-md text-xs">
                    {outfit.occasion}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h2 className="font-headline-md text-headline-md text-primary tracking-tight mb-2">
              {outfit.name || 'Curated Ensemble'}
            </h2>
            <p className="font-body-sm text-on-surface-variant mb-6">
              Modeled on Male &bull; 183 cm &bull; 87 kg &bull; Athletic build
            </p>

            {/* Pieces Breakdown */}
            <div className="space-y-3 mb-6">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-xs">
                Outfit Components
              </h3>
              
              {outfit.top && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>checkroom</span>
                    <div>
                      <div className="font-body-md text-primary font-medium">{outfit.top.name}</div>
                      <div className="font-body-xs text-on-surface-variant text-xs">Top &bull; {outfit.top.primary_color}</div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-outline-variant" style={{ backgroundColor: outfit.top.primary_color }} />
                </div>
              )}

              {outfit.bottom && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>straighten</span>
                    <div>
                      <div className="font-body-md text-primary font-medium">{outfit.bottom.name}</div>
                      <div className="font-body-xs text-on-surface-variant text-xs">Bottom &bull; {outfit.bottom.primary_color}</div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-outline-variant" style={{ backgroundColor: outfit.bottom.primary_color }} />
                </div>
              )}

              {outfit.shoes && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>steps</span>
                    <div>
                      <div className="font-body-md text-primary font-medium">{outfit.shoes.name}</div>
                      <div className="font-body-xs text-on-surface-variant text-xs">Shoes &bull; {outfit.shoes.primary_color}</div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-outline-variant" style={{ backgroundColor: outfit.shoes.primary_color }} />
                </div>
              )}

              {outfit.outerwear && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>dry_cleaning</span>
                    <div>
                      <div className="font-body-md text-primary font-medium">{outfit.outerwear.name}</div>
                      <div className="font-body-xs text-on-surface-variant text-xs">Outerwear &bull; {outfit.outerwear.primary_color}</div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-outline-variant" style={{ backgroundColor: outfit.outerwear.primary_color }} />
                </div>
              )}
            </div>

            {/* Recommendations / Stylist Notes */}
            {outfit.recommendation_reasons && outfit.recommendation_reasons.length > 0 && (
              <div className="p-4 rounded-xl bg-surface border border-outline-variant/30 mb-6">
                <div className="font-label-caps text-label-caps text-secondary uppercase tracking-widest text-xs flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                  Stylist Notes
                </div>
                <ul className="space-y-1.5">
                  {outfit.recommendation_reasons.map((r, idx) => (
                    <li key={idx} className="font-body-xs text-xs text-on-surface-variant flex items-start gap-1.5">
                      <span className="text-secondary">&bull;</span>
                      <span>{r.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/40">
            <button
              onClick={onClose}
              className="flex-1 bg-primary text-on-primary font-button py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
              Done Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
