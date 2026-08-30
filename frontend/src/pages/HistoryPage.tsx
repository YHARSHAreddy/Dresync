import { useQuery } from '@tanstack/react-query';
import { outfitsApi } from '../api/outfits';
import { CATEGORY_EMOJIS } from '../types';
import { format } from 'date-fns';

export function HistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['outfit-history'],
    queryFn: outfitsApi.getHistory,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Outfit History</h1>
          <p className="page-subtitle">Every outfit you've worn, tracked</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : history && history.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {history.map((h) => {
            const outfit = h.outfit;
            const items = outfit ? [outfit.top, outfit.bottom, outfit.shoes, outfit.outerwear].filter(Boolean) : [];

            return (
              <div key={h.id} className="card flex gap-4 items-center" style={{ padding: 'var(--space-4)' }}>
                {/* Item thumbnails */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {items.slice(0, 3).map((item: any) => (
                    <div key={item.id} style={{
                      width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                      overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0,
                    }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {CATEGORY_EMOJIS[item.category as keyof typeof CATEGORY_EMOJIS]}
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      👔
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                    {items.map((item: any) => item.name).join(' · ') || 'Outfit'}
                  </div>
                  {outfit && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {Math.round(outfit.compatibility_score * 100)}% compatibility
                      {outfit.occasion ? ` · ${outfit.occasion}` : ''}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                    {format(new Date(h.worn_date), 'MMM d')}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {format(new Date(h.worn_date), 'yyyy')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🕐</div>
          <div className="empty-state-title">No outfit history yet</div>
          <div className="empty-state-desc">When you mark an outfit as worn, it appears here. Track what you've been wearing and when.</div>
        </div>
      )}
    </div>
  );
}
