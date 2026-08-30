import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { outfitsApi } from '../api/outfits';
import { Outfit } from '../types';
import { OutfitCard } from '../components/outfit/OutfitCard';

export function OutfitsPage() {
  const qc = useQueryClient();

  const { data: outfits, isLoading } = useQuery({
    queryKey: ['outfits'],
    queryFn: () => outfitsApi.getAll(),
  });

  const handleUpdate = (updated: Outfit) => {
    qc.setQueryData(['outfits'], (old: Outfit[] | undefined) =>
      old ? old.map((o) => (o.id === updated.id ? updated : o)) : old
    );
  };

  const handleDelete = (id: string) => {
    qc.setQueryData(['outfits'], (old: Outfit[] | undefined) =>
      old ? old.filter((o) => o.id !== id) : old
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Saved Outfits</h1></div>
        <div className="outfits-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: '200px', marginBottom: '8px', borderRadius: 'var(--radius-lg)' }} />
              <div className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Outfits</h1>
          <p className="page-subtitle">{outfits?.length ?? 0} outfit{outfits?.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {outfits && outfits.length > 0 ? (
        <div className="outfits-grid">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">No outfits yet</div>
          <div className="empty-state-desc">Generate your first outfit using AI recommendations from your wardrobe.</div>
        </div>
      )}
    </div>
  );
}
