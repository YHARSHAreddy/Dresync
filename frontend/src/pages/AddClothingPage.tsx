import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wardrobeApi } from '../api/wardrobe';
import { ClothingItemCreate, ClothingCategory, ClothingPattern, STYLE_OPTIONS, SEASON_OPTIONS, OCCASION_OPTIONS, PATTERN_OPTIONS } from '../types';

function MultiSelect({
  label, options, selected, onChange,
}: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);

  return (
    <div className="flex flex-col gap-3">
      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-colors ${
              selected.includes(opt) 
                ? 'bg-primary text-on-primary' 
                : 'bg-secondary/10 text-on-surface-variant hover:bg-secondary/20'
            }`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AddClothingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ClothingItemCreate>({
    name: '',
    category: 'top',
    subcategory: '',
    primary_color: '',
    secondary_colors: [],
    pattern: 'solid',
    styles: [],
    seasons: [],
    occasions: [],
    notes: '',
  });

  const set = (key: keyof ClothingItemCreate, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.primary_color.trim()) {
      setError('Name and primary color are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await wardrobeApi.createItem(form);
      navigate(`/wardrobe/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1024px] mx-auto space-y-12">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6 mb-8">
        <div>
          <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest mb-4">
             <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
             Back to Wardrobe
          </button>
          <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight mb-2">Curate Piece</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Add a new item to your digital collection</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-6 rounded-lg mb-8 font-body-md border border-error/20 flex items-start gap-3">
           <span className="material-symbols-outlined mt-0.5">error</span>
           <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-card p-8 md:p-12 flex flex-col gap-10">
          
          <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-name">Item Name *</label>
            <input id="item-name" className="w-full bg-transparent border-none p-0 font-display-sm text-primary focus:ring-0 outline-none placeholder:text-outline/50" placeholder="e.g. Navy Oxford Shirt"
              value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-category">Category *</label>
              <select id="item-category" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none cursor-pointer"
                value={form.category} onChange={(e) => set('category', e.target.value as ClothingCategory)}>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outerwear">Outerwear</option>
                <option value="shoes">Shoes</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-sub">Subcategory</label>
              <input id="item-sub" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none placeholder:text-outline/50" placeholder="e.g. Oxford shirt, Jeans…"
                value={form.subcategory || ''} onChange={(e) => set('subcategory', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-color">Primary Color *</label>
              <div className="flex items-center gap-3">
                 {form.primary_color && (
                    <div className="w-6 h-6 rounded-full border border-outline-variant shadow-sm" style={{ backgroundColor: form.primary_color }} />
                 )}
                 <input id="item-color" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none placeholder:text-outline/50" placeholder="e.g. navy, white…"
                    value={form.primary_color} onChange={(e) => set('primary_color', e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-pattern">Pattern</label>
              <select id="item-pattern" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none cursor-pointer"
                value={form.pattern} onChange={(e) => set('pattern', e.target.value as ClothingPattern)}>
                {PATTERN_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <MultiSelect label="Styles" options={STYLE_OPTIONS} selected={form.styles || []} onChange={(v) => set('styles', v)} />
          <MultiSelect label="Seasons" options={SEASON_OPTIONS} selected={form.seasons || []} onChange={(v) => set('seasons', v)} />
          <MultiSelect label="Occasions" options={OCCASION_OPTIONS} selected={form.occasions || []} onChange={(v) => set('occasions', v)} />

          <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors mt-4">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-notes">Editorial Notes</label>
            <textarea id="item-notes" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none placeholder:text-outline/50 resize-y" placeholder="Brand, fabric composition, purchase details..."
              value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} />
          </div>

          <div className="flex gap-4 pt-4 mt-2 border-t border-outline-variant/30">
            <button type="submit" className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" disabled={loading}>
              {loading ? (
                 <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>sync</span> Saving...</>
              ) : (
                 <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span> Save to Collection</>
              )}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="bg-transparent border border-outline text-primary font-button text-button px-8 py-3 rounded-lg hover:bg-surface-variant transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
