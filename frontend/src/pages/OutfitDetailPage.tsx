import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { outfitsApi } from '../api/outfits';
import { vtoApi } from '../api/vto';
import { CATEGORY_EMOJIS, ClothingItem } from '../types';
import { MannequinViewer } from '../components/wardrobe/MannequinViewer';

function GarmentCard({ item, label }: { item?: ClothingItem; label: string }) {
  if (!item) return null;
  return (
    <div className="glass-card p-4 flex flex-col gap-2 relative overflow-hidden border border-outline-variant/30">
      <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{label} {CATEGORY_EMOJIS[item.category]}</div>
      <div className="w-full aspect-square bg-surface-variant rounded-lg overflow-hidden relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-outline/40">
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>image</span>
          </div>
        )}
      </div>
      <div className="font-body-md text-primary truncate" title={item.name}>{item.name}</div>
    </div>
  );
}

export function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [vtoImage, setVtoImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: outfit, isLoading, error } = useQuery({
    queryKey: ['outfit', id],
    queryFn: () => outfitsApi.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading outfit...</div>;
  if (error || !outfit) return <div className="p-8 text-center text-error">Outfit not found or error loading.</div>;

  const handleVTO = async () => {
    if (!id) return;
    setIsGenerating(true);
    setVtoImage(null);
    try {
      const res = await vtoApi.tryOnOutfit(id);
      if (res.success && res.result_image_url) {
        setVtoImage(res.result_image_url);
      } else {
        alert(res.error_message || 'Virtual Try-On failed');
      }
    } catch (err: any) {
      if (err?.response?.status === 400) {
        alert(`Virtual Try-On is currently limited: ${err.response.data.detail}`);
      } else {
        alert(err?.response?.data?.detail || 'Could not perform Virtual Try-On');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="font-display-lg text-primary tracking-tight">{outfit.name || 'Outfit Details'}</h1>
          <p className="font-body-lg text-on-surface-variant flex items-center gap-2">
            <span className="uppercase tracking-widest text-xs font-label-caps">{outfit.occasion || 'Everyday'}</span>
            &bull;
            <span className="uppercase tracking-widest text-xs font-label-caps">{outfit.season || 'All Season'}</span>
            &bull;
            <span className="text-secondary font-medium">{Math.round(outfit.compatibility_score * 100)}% Match</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Col: 3D Mannequin & VTO Preview */}
        <div className="glass-card p-6 border border-outline-variant flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-caps text-label-caps uppercase transition-colors ${
                  viewMode === '3d'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>3d_rotation</span>
                3D Model
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-label-caps text-label-caps uppercase transition-colors ${
                  viewMode === '2d'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
                AI Photo
              </button>
            </div>

            {viewMode === '2d' && (
              <button
                onClick={handleVTO}
                disabled={isGenerating}
                className="bg-primary text-on-primary font-button px-4 py-2 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest disabled:opacity-50 flex items-center gap-2 text-xs"
              >
                {isGenerating ? (
                  <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span> Generating...</>
                ) : 'Generate Photo'}
              </button>
            )}
          </div>
          
          <div className="w-full aspect-[3/4] min-h-[440px] bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-center overflow-hidden relative">
            {viewMode === '3d' ? (
              <div className="w-full h-full relative">
                <MannequinViewer outfit={outfit} />
                <div className="absolute bottom-3 left-3 z-10 bg-surface/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-1.5 pointer-events-none">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>touch_app</span>
                  360° View &bull; Realistic Athletic Male (183cm, 87kg)
                </div>
              </div>
            ) : vtoImage ? (
              <img src={vtoImage} alt="Virtual Try-On Result" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-outline/50 p-8 text-center">
                <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>face</span>
                <p className="font-body-md max-w-[250px]">Click "Generate Photo" to render an AI photo on your uploaded avatar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Items */}
        <div className="space-y-6">
          <h2 className="font-headline-sm text-primary">Garments</h2>
          <div className="grid grid-cols-2 gap-4">
            <GarmentCard item={outfit.top} label="Top" />
            <GarmentCard item={outfit.bottom} label="Bottom" />
            <GarmentCard item={outfit.outerwear} label="Outerwear" />
            <GarmentCard item={outfit.shoes} label="Shoes" />
          </div>

          {outfit.recommendation_reasons && outfit.recommendation_reasons.length > 0 && (
            <div className="mt-8 glass-card p-6 border border-outline-variant/30">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-4">Stylist Notes</h3>
              <ul className="space-y-3">
                {outfit.recommendation_reasons.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: '20px' }}>check_circle</span>
                    <span>{rec.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
