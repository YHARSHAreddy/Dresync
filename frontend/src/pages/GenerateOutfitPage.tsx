import { useState } from 'react';
import { outfitsApi } from '../api/outfits';
import { Outfit, SEASON_OPTIONS, OCCASION_OPTIONS } from '../types';
import { OutfitCard } from '../components/outfit/OutfitCard';

export function GenerateOutfitPage() {
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Outfit[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const outfits = await outfitsApi.generate({
        occasion: occasion || undefined,
        season: season || undefined,
        count,
      });
      setResults(outfits);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not generate outfits. Make sure you have enough items in your wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updated: Outfit) => {
    setResults((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleDelete = (id: string) => {
    setResults((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="max-w-[1024px] mx-auto space-y-12">
      <div className="text-center md:text-left mb-8 border-b border-outline-variant pb-8">
        <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight mb-4">Recommendations</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Let our editorial AI curate the perfect combinations for your day based on your curated wardrobe.
        </p>
      </div>

      {/* Form */}
      <div className="glass-card p-8 md:p-12 mb-12 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-10"></div>
        <form onSubmit={handleGenerate} className="flex flex-col gap-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" htmlFor="gen-occasion">Occasion</label>
              <select id="gen-occasion" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                <option value="">Any occasion</option>
                {OCCASION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" htmlFor="gen-season">Season</label>
              <select id="gen-season" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" value={season} onChange={(e) => setSeason(e.target.value)}>
                <option value="">Any season</option>
                {SEASON_OPTIONS.filter(s => s !== 'all').map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors max-w-[200px]">
            <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" htmlFor="gen-count">Options (1–10)</label>
            <input id="gen-count" type="number" min={1} max={10} className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none"
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} />
          </div>

          <button type="submit" className="bg-primary text-on-primary font-button text-button px-8 py-4 rounded-lg hover:opacity-90 transition-opacity self-start flex items-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Curating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_awesome</span>
                Generate Outfits
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 text-error p-6 rounded-lg mb-8 font-body-md border border-error/20 flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <div>{error}</div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse border border-outline-variant/30">
              <div className="bg-surface-variant h-6 w-1/3 rounded-full mb-6" />
              <div className="bg-surface-variant aspect-[4/5] rounded-xl mb-6" />
              <div className="bg-surface-variant h-6 w-3/4 rounded mb-2" />
              <div className="bg-surface-variant h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-outline-variant pb-4">
            <h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              {results.length} Curated Look{results.length !== 1 ? 's' : ''}
            </h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded-sm">Sorted by Match Score</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Top Pick (Hero Recommendation) */}
            <div className="md:col-span-2">
              <div className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
                Top Pick For You
              </div>
              <OutfitCard outfit={results[0]} onUpdate={handleUpdate} onDelete={handleDelete} />
            </div>
            
            {/* Rest of the recommendations */}
            {results.slice(1).map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Empty result (after generate, no results) */}
      {!loading && results.length === 0 && !error && (
        <div className="glass-card flex flex-col items-center justify-center text-center p-16 relative overflow-hidden border border-dashed border-outline-variant/50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl -z-10"></div>
          <span className="material-symbols-outlined text-outline/50 font-light mb-6" style={{ fontSize: '64px' }}>magic_button</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Ready to Curate</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Choose your occasion and season preferences above, then click generate to see bespoke outfit recommendations from your wardrobe.
          </p>
        </div>
      )}
    </div>
  );
}
