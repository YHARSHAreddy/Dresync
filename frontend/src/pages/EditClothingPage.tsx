import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { wardrobeApi } from '../api/wardrobe';
import { ClothingItemCreate, ClothingCategory, ClothingPattern, STYLE_OPTIONS, SEASON_OPTIONS, OCCASION_OPTIONS, PATTERN_OPTIONS } from '../types';

function MultiSelect({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  return (
    <div className="flex flex-col gap-3">
      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button key={opt} type="button"
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps uppercase transition-colors ${selected.includes(opt) ? 'bg-primary text-on-primary' : 'bg-secondary/10 text-on-surface-variant hover:bg-secondary/20'}`}
            onClick={() => toggle(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

export function EditClothingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<ClothingItemCreate>>({});

  const { data: item } = useQuery({
    queryKey: ['clothing-item', id],
    queryFn: () => wardrobeApi.getItem(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || '',
        primary_color: item.primary_color,
        secondary_colors: item.secondary_colors,
        pattern: item.pattern,
        styles: item.styles,
        seasons: item.seasons,
        occasions: item.occasions,
        notes: item.notes || '',
        usage_status: item.usage_status,
      });
    }
  }, [item]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updated = await wardrobeApi.updateItem(id!, form);
      qc.setQueryData(['clothing-item', id], updated);
      qc.invalidateQueries({ queryKey: ['wardrobe-items'] });
      navigate(`/wardrobe/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return (
    <div className="max-w-[1024px] mx-auto animate-pulse flex flex-col gap-8">
      <div className="h-10 bg-surface-variant rounded-full w-1/3" />
      <div className="glass-card h-[600px] border border-outline-variant/30" />
    </div>
  );

  return (
    <div className="max-w-[1024px] mx-auto space-y-12">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6 mb-8">
        <div>
          <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest mb-4">
             <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
             Cancel Edit
          </button>
          <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight mb-2">Edit Details</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{item.name}</p>
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
            <input id="item-name" className="w-full bg-transparent border-none p-0 font-display-sm text-primary focus:ring-0 outline-none" 
              value={form.name || ''} onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Category</label>
              <select className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none cursor-pointer" 
                value={form.category || ''} onChange={(e) => set('category', e.target.value)}>
                {['top','bottom','outerwear','shoes','accessory'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Subcategory</label>
              <input className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" 
                value={form.subcategory || ''} onChange={(e) => set('subcategory', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Primary Color *</label>
              <div className="flex items-center gap-3">
                 {form.primary_color && (
                    <div className="w-6 h-6 rounded-full border border-outline-variant shadow-sm" style={{ backgroundColor: form.primary_color }} />
                 )}
                 <input className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" 
                    value={form.primary_color || ''} onChange={(e) => set('primary_color', e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Pattern</label>
              <select className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none cursor-pointer" 
                value={form.pattern || 'solid'} onChange={(e) => set('pattern', e.target.value)}>
                {PATTERN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <MultiSelect label="Styles" options={STYLE_OPTIONS} selected={form.styles || []} onChange={(v) => set('styles', v)} />
          <MultiSelect label="Seasons" options={SEASON_OPTIONS} selected={form.seasons || []} onChange={(v) => set('seasons', v)} />
          <MultiSelect label="Occasions" options={OCCASION_OPTIONS} selected={form.occasions || []} onChange={(v) => set('occasions', v)} />
          
          <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors mt-4">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Editorial Notes</label>
            <textarea className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none resize-y" 
              value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} />
          </div>

          <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Status</label>
            <select className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none cursor-pointer" 
              value={form.usage_status || 'active'} onChange={(e) => set('usage_status', e.target.value)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4 mt-2 border-t border-outline-variant/30">
            <button type="submit" className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" disabled={loading}>
              {loading ? (
                 <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>sync</span> Saving...</>
              ) : (
                 <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span> Save Changes</>
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
