import { useQuery, useQueryClient } from '@tanstack/react-query';
import { outfitsApi } from '../api/outfits';
import { Outfit } from '../types';
import { OutfitCard } from '../components/outfit/OutfitCard';

export function FavoritesPage() {
  const qc = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['outfits-favorites'],
    queryFn: () => outfitsApi.getAll(true),
  });

  const handleUpdate = (updated: Outfit) => {
    qc.setQueryData(['outfits-favorites'], (old: Outfit[] | undefined) =>
      old
        ? updated.is_favorite
          ? old.map((o) => (o.id === updated.id ? updated : o))
          : old.filter((o) => o.id !== updated.id) // Remove unfavorited outfits
        : old
    );
  };

  const handleDelete = (id: string) => {
    qc.setQueryData(['outfits-favorites'], (old: Outfit[] | undefined) =>
      old ? old.filter((o) => o.id !== id) : old
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Favorites</h1>
          <p className="page-subtitle">Your saved favorite outfits</p>
        </div>
      </div>

      {isLoading ? (
        <div className="outfits-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: '200px', marginBottom: '8px', borderRadius: 'var(--radius-lg)' }} />
              <div className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />
            </div>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="outfits-grid">
          {favorites.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">♥</div>
          <div className="empty-state-title">No favorites yet</div>
          <div className="empty-state-desc">Heart any outfit to save it here. Your favorites are always easy to find.</div>
        </div>
      )}
    </div>
  );
}
