import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { wardrobeApi } from '../api/wardrobe';
import { ImageUploader } from '../components/wardrobe/ImageUploader';
import { format } from 'date-fns';
import { vtoApi } from '../api/vto';
import { useState } from 'react';

export function ClothingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [vtoImage, setVtoImage] = useState<string | null>(null);
  const [isVtoMock, setIsVtoMock] = useState(false);
  const [isVtoLoading, setIsVtoLoading] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ['clothing-item', id],
    queryFn: () => wardrobeApi.getItem(id!),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    await wardrobeApi.deleteItem(id!);
    qc.invalidateQueries({ queryKey: ['wardrobe-items'] });
    navigate('/wardrobe');
  };

  const handleImageUpload = (updated: any) => {
    qc.setQueryData(['clothing-item', id], updated);
  };

  const handleVto = async () => {
    if (!id) return;
    setIsVtoLoading(true);
    setVtoImage(null);
    try {
      const res = await vtoApi.tryOnItem(id);
      if (res.success && res.result_image_url) {
        setVtoImage(res.result_image_url);
        setIsVtoMock(res.is_mock || false);
      } else {
        alert(res.error_message || 'Virtual Try-On failed');
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Could not perform Virtual Try-On');
    } finally {
      setIsVtoLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-[400px] aspect-[3/4] rounded-xl bg-surface-variant animate-pulse" />
        <div className="flex-1 flex flex-col gap-6">
          <div className="h-10 bg-surface-variant rounded-full w-2/3 animate-pulse" />
          <div className="h-6 bg-surface-variant rounded w-1/3 animate-pulse" />
          <div className="h-32 bg-surface-variant rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!item) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-outline/50 mb-4" style={{ fontSize: '64px' }}>search_off</span>
      <h2 className="font-headline-md text-primary mb-2">Item not found</h2>
      <button onClick={() => navigate('/wardrobe')} className="text-secondary hover:underline">Return to Wardrobe</button>
    </div>
  );

  return (
    <div className="max-w-[1024px] mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest">
           <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
           Back
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Image / Uploader */}
        <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col gap-6">
          <div className="glass-card p-2">
            <ImageUploader
              itemId={item.id}
              currentImageUrl={item.image_url}
              onUpload={handleImageUpload}
            />
          </div>
          
          {vtoImage && (
            <div className="glass-card p-4 border border-secondary flex flex-col gap-2 relative overflow-hidden">
              <div className="font-label-caps text-label-caps text-secondary uppercase tracking-widest flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span> Try-On Result</span>
                {isVtoMock && (
                  <span className="bg-warning/20 text-warning px-2 py-0.5 rounded-sm text-[10px] flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span> MOCK / DEMO
                  </span>
                )}
              </div>
              <div className="w-full aspect-[3/4] bg-surface-container-low rounded-xl overflow-hidden relative border border-outline-variant">
                 <img src={vtoImage} alt="Virtual Try-On Result" className="w-full h-full object-cover" />
                 {isVtoMock && (
                   <div className="absolute inset-x-0 bottom-0 bg-surface/80 backdrop-blur-sm p-2 text-center border-t border-outline-variant text-on-surface-variant font-label-caps text-label-caps">
                     Demo Preview (Original Image)
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="border-b border-outline-variant/50 pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="font-label-caps text-label-caps text-primary bg-primary/10 px-3 py-1.5 rounded-sm uppercase tracking-widest border border-primary/20">
                {item.category}
              </span>
              {item.subcategory && (
                <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-sm uppercase tracking-widest">
                  {item.subcategory}
                </span>
              )}
            </div>
            <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight">{item.name}</h1>
          </div>

          {/* Color & Pattern Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Primary Color</div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-outline-variant shadow-sm" style={{ backgroundColor: item.primary_color.toLowerCase() }} />
                <span className="font-body-lg text-body-lg text-primary capitalize">{item.primary_color}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Pattern</div>
              <span className="font-body-lg text-body-lg text-primary capitalize">{item.pattern}</span>
            </div>
            
            {item.secondary_colors?.length > 0 && (
              <div className="col-span-2 flex flex-col gap-2">
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Secondary Colors</div>
                <div className="flex gap-4 flex-wrap mt-1">
                  {item.secondary_colors?.map((c) => (
                    <div key={c} className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30">
                      <div className="w-3 h-3 rounded-full border border-outline-variant/50 shadow-sm" style={{ backgroundColor: c.toLowerCase() }} />
                      <span className="font-label-caps text-label-caps text-primary capitalize">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {(item.styles?.length > 0 || item.seasons?.length > 0 || item.occasions?.length > 0) && (
            <div className="glass-card p-8 flex flex-col gap-8">
              {item.styles?.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Styles</div>
                  <div className="flex gap-2 flex-wrap">
                    {item.styles?.map((s) => <span key={s} className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider">{s}</span>)}
                  </div>
                </div>
              )}
              {item.seasons?.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-6">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Seasons</div>
                  <div className="flex gap-2 flex-wrap">
                    {item.seasons?.map((s) => <span key={s} className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider">{s}</span>)}
                  </div>
                </div>
              )}
              {item.occasions?.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-6">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Occasions</div>
                  <div className="flex gap-2 flex-wrap">
                    {item.occasions?.map((o) => <span key={o} className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider">{o}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-surface-container-low/50 p-6 rounded-xl border border-outline-variant/30">
            <div className="flex flex-col gap-1">
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Times Worn</div>
              <div className="font-display-sm text-primary">{item.wear_count}</div>
            </div>
            {item.last_worn && (
              <div className="flex flex-col gap-1">
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Last Worn</div>
                <div className="font-body-lg text-primary">
                  {format(new Date(item.last_worn), 'MMM d, yyyy')}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Status</div>
              <div>
                 <span className={`font-label-caps text-label-caps uppercase tracking-widest px-2 py-1 rounded-sm ${item.usage_status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                   {item.usage_status}
                 </span>
              </div>
            </div>
          </div>

          {item.notes && (
            <div className="flex flex-col gap-3">
              <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Editorial Notes</div>
              <p className="font-body-lg text-body-lg text-primary italic border-l-2 border-secondary pl-4 py-1">{item.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-6 mt-auto border-t border-outline-variant/50">
            <button 
              onClick={handleVto} 
              disabled={isVtoLoading}
              className="bg-primary text-on-primary font-button text-button px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVtoLoading ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> Generating...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span> Virtual Try-On</>
              )}
            </button>
            <Link to={`/wardrobe/${item.id}/edit`} className="bg-transparent border border-outline text-primary font-button text-button px-6 py-3 rounded-lg hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              Edit Details
            </Link>
            <button onClick={handleDelete} className="bg-error/10 text-error font-button text-button px-6 py-3 rounded-lg hover:bg-error/20 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
