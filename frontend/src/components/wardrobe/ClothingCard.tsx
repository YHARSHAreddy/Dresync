import { useNavigate } from 'react-router-dom';
import { ClothingItem } from '../../types';

interface ClothingCardProps {
  item: ClothingItem;
  onClick?: () => void;
}

export function ClothingCard({ item, onClick }: ClothingCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/wardrobe/${item.id}`);
  };

  return (
    <div 
      className="glass-card p-4 hover:opacity-90 relative overflow-hidden flex flex-col gap-4 cursor-pointer transition-transform duration-300 hover:scale-[1.02]" 
      onClick={handleClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="glass-image-container w-full aspect-[3/4] bg-surface-variant flex items-center justify-center border border-outline-variant/30 relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
             <span className="material-symbols-outlined text-outline/50 font-light" style={{ fontSize: '48px' }}>checkroom</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-headline-sm text-headline-sm text-primary truncate leading-tight">{item.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-sm uppercase tracking-wider">{item.category}</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border border-outline-variant shadow-sm"
              style={{ backgroundColor: item.primary_color.toLowerCase() }}
              title={item.primary_color}
            />
          </div>
        </div>
        {item.styles.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {item.styles.slice(0, 2).map((s) => (
              <span key={s} className="font-label-caps text-[10px] text-secondary bg-secondary/10 px-2 py-1 rounded-full uppercase tracking-wider">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
