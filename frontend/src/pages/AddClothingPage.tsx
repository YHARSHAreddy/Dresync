import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectedInfo, setDetectedInfo] = useState<{ colorName?: string; pattern?: string; category?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    image_url: undefined,
  });

  const set = (key: keyof ClothingItemCreate, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    // Set immediate preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setAnalyzing(true);
    setError('');

    try {
      const result = await wardrobeApi.analyzeImage(file);
      setForm((prev) => ({
        ...prev,
        name: result.name || prev.name,
        category: result.category || prev.category,
        subcategory: result.subcategory || prev.subcategory,
        primary_color: result.primary_color || prev.primary_color,
        secondary_colors: result.secondary_colors || prev.secondary_colors,
        pattern: result.pattern || prev.pattern,
        styles: result.styles?.length ? result.styles : prev.styles,
        seasons: result.seasons?.length ? result.seasons : prev.seasons,
        occasions: result.occasions?.length ? result.occasions : prev.occasions,
        notes: result.notes || prev.notes,
        image_url: result.image_url,
      }));

      setDetectedInfo({
        colorName: result.color_name || result.primary_color,
        pattern: result.pattern,
        category: result.category,
      });
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setError(err?.response?.data?.detail || 'Failed to analyze garment image. You can still fill details manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

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
          <p className="font-body-lg text-body-lg text-on-surface-variant">Upload your garment photo to auto-extract textures, fabric patterns, and colors with AI.</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-6 rounded-lg mb-8 font-body-md border border-error/20 flex items-start gap-3">
           <span className="material-symbols-outlined mt-0.5">error</span>
           <div>{error}</div>
        </div>
      )}

      {/* AI Garment Ingestion & Texture Extraction Dropzone */}
      <div className="glass-card p-6 md:p-8 border border-outline-variant/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h2 className="font-headline-sm text-base text-primary">1. AI Garment & Texture Ingestion</h2>
          </div>
          {detectedInfo && (
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
              Texture & Attributes Captured
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />

        {imagePreview ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
            <div className="relative w-36 h-44 rounded-xl overflow-hidden bg-surface-container border border-outline-variant shrink-0">
              <img src={imagePreview} alt="Uploaded Garment" className="w-full h-full object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-2">
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '24px' }}>autorenew</span>
                  <span>Extracting AI Texture...</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              {analyzing ? (
                <div className="space-y-2">
                  <div className="h-4 bg-primary/20 rounded-full animate-pulse w-3/4" />
                  <div className="h-3 bg-primary/10 rounded-full animate-pulse w-1/2" />
                  <p className="text-xs text-on-surface-variant italic">
                    Analyzing fabric weave, color distribution, and garment category...
                  </p>
                </div>
              ) : detectedInfo ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high border border-outline-variant text-primary">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: form.primary_color }} />
                      {detectedInfo.colorName}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs uppercase font-label-caps bg-secondary/10 text-primary">
                      Pattern: {detectedInfo.pattern}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs uppercase font-label-caps bg-secondary/10 text-primary">
                      Type: {detectedInfo.category}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Attributes and texture map extracted! You can verify or edit the values below before saving.
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="text-xs font-button text-primary hover:underline flex items-center gap-1.5 mt-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                Choose a different photo
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant hover:border-primary/60 bg-surface-container-low/40 hover:bg-surface-container-low'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add_photo_alternate</span>
            </div>
            <h3 className="font-headline-sm text-sm text-primary mb-1">
              Drag & Drop or Click to Upload Garment Photo
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-sm mb-4">
              AI automatically extracts texture, fabric pattern, hex colors, and garment category.
            </p>
            <span className="bg-primary text-on-primary text-xs font-button px-5 py-2 rounded-lg shadow-sm">
              Select Garment Photo
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card p-8 md:p-12 flex flex-col gap-10">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
            <span className="material-symbols-outlined text-outline">tune</span>
            <h2 className="font-headline-sm text-base text-primary">2. Curated Attributes & Details</h2>
          </div>
          
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
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-color">Primary Color (Hex or Name) *</label>
              <div className="flex items-center gap-3">
                 {form.primary_color && (
                    <div className="w-6 h-6 rounded-full border border-outline-variant shadow-sm shrink-0" style={{ backgroundColor: form.primary_color }} />
                 )}
                 <input id="item-color" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none placeholder:text-outline/50" placeholder="e.g. #1e3a8a or navy…"
                    value={form.primary_color} onChange={(e) => set('primary_color', e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="item-pattern">Pattern / Texture</label>
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
            <button type="submit" className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2" disabled={loading || analyzing}>
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
