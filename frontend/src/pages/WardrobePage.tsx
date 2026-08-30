import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { wardrobeApi } from '../api/wardrobe';
import { ClothingCard } from '../components/wardrobe/ClothingCard';

const CATEGORY_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Tops', value: 'top' },
  { label: 'Bottoms', value: 'bottom' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessories', value: 'accessory' },
];

export function WardrobePage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['wardrobe-items', categoryFilter, search],
    queryFn: () => wardrobeApi.getItems({ category: categoryFilter || undefined, search: search || undefined }),
  });

  return (
    <div className="max-w-[1024px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-outline-variant pb-8">
        <div>
          <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight mb-2">My Wardrobe</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {items ? `${items.length} Curated Piece${items.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <Link to="/wardrobe/add" className="bg-primary text-on-primary font-button text-button px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Add Piece
        </Link>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute text-outline left-4 top-1/2 -translate-y-1/2">search</span>
          <input
            type="search"
            className="w-full bg-surface-container-low border-none rounded-full py-3 pl-12 pr-6 font-body-md text-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Search collection..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`px-5 py-2 rounded-full font-label-caps text-label-caps uppercase transition-colors ${categoryFilter === f.value ? 'bg-primary text-on-primary' : 'bg-secondary/10 text-on-surface-variant hover:bg-secondary/20'}`}
              onClick={() => setCategoryFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="bg-surface-variant rounded-xl aspect-[3/4] mb-4" />
              <div className="bg-surface-variant h-4 rounded w-2/3 mb-2" />
              <div className="bg-surface-variant h-3 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {items.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center text-center p-12 relative overflow-hidden border border-dashed border-outline-variant">
          <div className="absolute top-0 right-0 w-full h-full bg-secondary-container/20 blur-3xl -z-10 opacity-50"></div>
          <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '48px' }}>checkroom</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-4">
            {search || categoryFilter ? 'No pieces found' : 'Your wardrobe is empty'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-8">
            {search || categoryFilter
              ? 'Try adjusting your search terms or clearing the filters.'
              : 'Begin building your digital collection by adding your first piece.'}
          </p>
          {!search && !categoryFilter && (
            <Link to="/wardrobe/add" className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Add Your First Piece
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
