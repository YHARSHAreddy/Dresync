import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outfit } from '../../types';
import { outfitsApi } from '../../api/outfits';

interface OutfitCardProps {
  outfit: Outfit;
  onUpdate?: (updated: Outfit) => void;
  onDelete?: (id: string) => void;
  showWear?: boolean;
}

function ItemThumb({ item, slot }: { item?: any; slot: string }) {
  if (!item) return null;
  return (
    <div className="glass-image-container relative flex items-center justify-center bg-surface-container-high aspect-square overflow-hidden rounded-lg border border-outline-variant/30" title={`${slot}: ${item?.name || ''}`}>
      {item?.image_url ? (
        <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="text-outline/40">
           <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>checkroom</span>
        </div>
      )}
    </div>
  );
}

export function OutfitCard({ outfit, onUpdate, onDelete, showWear = true }: OutfitCardProps) {
  const [favoriting, setFavoriting] = useState(false);
  const [wearing, setWearing] = useState(false);
  const navigate = useNavigate();

  const score = Math.round(outfit.compatibility_score * 100);
  
  // Neutral/Premium colors for scores instead of generic green/red
  const scoreClass = score >= 80 ? 'bg-secondary/10 text-secondary' : score >= 60 ? 'bg-surface-variant text-on-surface-variant' : 'bg-error/10 text-error';

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriting(true);
    try {
      await outfitsApi.toggleFavorite(outfit.id);
      onUpdate?.({ ...outfit, is_favorite: !outfit.is_favorite });
    } finally {
      setFavoriting(false);
    }
  };

  const handleWear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setWearing(true);
    try {
      await outfitsApi.markWorn(outfit.id);
      alert('Outfit logged as worn today!');
    } finally {
      setWearing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this outfit?')) return;
    await outfitsApi.deleteOutfit(outfit.id);
    onDelete?.(outfit.id);
  };

  const previewItems = [
    { item: outfit.top,      slot: 'Top' },
    { item: outfit.bottom,   slot: 'Bottom' },
    { item: outfit.shoes,    slot: 'Shoes' },
    { item: outfit.outerwear, slot: 'Outerwear' },
  ].filter((x) => x.item);

  return (
    <div 
      className="glass-card flex flex-col gap-6 cursor-pointer p-6 hover:opacity-95 transition-transform duration-300 hover:scale-[1.01]" 
      onClick={() => navigate(`/outfits/${outfit.id}`)}
    >
      {/* Header: Score and Favorite */}
      <div className="flex justify-between items-center">
        <div className={`font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1.5 ${scoreClass}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>diamond</span>
          {score}% Match
        </div>
        <button
          onClick={handleFavorite}
          disabled={favoriting}
          className="text-primary hover:opacity-70 transition-opacity"
          aria-label={outfit.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: outfit.is_favorite ? "'FILL' 1" : "'FILL' 0", color: outfit.is_favorite ? 'var(--error)' : 'inherit' }}>
            favorite
          </span>
        </button>
      </div>

      {/* Primary Image or Grid */}
      {outfit.image_url ? (
         <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-variant border border-outline-variant/30">
            <img src={outfit.image_url} alt="Outfit preview" className="w-full h-full object-cover" />
         </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 aspect-square">
          {previewItems.slice(0, 4).map(({ item, slot }) => (
            <ItemThumb key={slot} item={item} slot={slot} />
          ))}
          {previewItems.length === 0 && (
            <div className="col-span-2 flex items-center justify-center text-outline/30 bg-surface-container-low rounded-xl">
               <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>checkroom</span>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-4 flex-1">
        <h3 className="font-headline-sm text-headline-sm text-primary truncate leading-tight">
          {outfit.name || "Styled Look"}
        </h3>
        
        <div className="flex flex-col gap-1">
          {outfit.top && <span className="font-body-md text-body-md text-on-surface-variant truncate"><span className="text-outline text-sm uppercase mr-2 tracking-widest">TOP</span> {outfit.top.name}</span>}
          {outfit.bottom && <span className="font-body-md text-body-md text-on-surface-variant truncate"><span className="text-outline text-sm uppercase mr-2 tracking-widest">BTM</span> {outfit.bottom.name}</span>}
        </div>

        <div className="flex gap-2 flex-wrap mt-auto pt-2">
          {outfit.occasion && <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{outfit.occasion}</span>}
          {outfit.season && <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider before:content-['•'] before:mr-2 before:text-outline">{outfit.season}</span>}
        </div>

        <div className="flex items-center gap-4 mt-2 pt-4 border-t border-outline-variant/50">
          {showWear && (
            <button
              onClick={handleWear}
              className="flex-1 bg-transparent border border-outline text-primary font-button text-button py-2 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
              disabled={wearing}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
              {wearing ? 'Logging...' : 'Log Wear'}
            </button>
          )}
          <button onClick={handleDelete} className="text-on-surface-variant hover:text-error transition-colors" aria-label="Delete">
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
