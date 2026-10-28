import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bodyProfileApi } from '../api/bodyProfile';
import { MannequinViewer } from '../components/wardrobe/MannequinViewer';

export function BodyProfilePage() {
  const qc = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  const [heightCm, setHeightCm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'photos' | 'avatar'>('photos');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['body-profile'],
    queryFn: bodyProfileApi.getProfile,
  });

  // Keep local height in sync with query
  const displayHeight = heightCm || (profile?.height_cm ? profile.height_cm.toString() : '');

  const uploadMutation = useMutation({
    mutationFn: async ({ file, photoType }: { file: File; photoType: 'front' | 'side' }) => {
      return bodyProfileApi.uploadPhoto(file, photoType);
    },
    onSuccess: (data) => {
      qc.setQueryData(['body-profile'], data);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Failed to upload photo.');
    },
  });

  const saveHeightMutation = useMutation({
    mutationFn: async () => {
      const val = displayHeight ? parseFloat(displayHeight) : null;
      if (profile?.id) {
        return bodyProfileApi.updateProfile({ height_cm: val });
      } else {
        return bodyProfileApi.createProfile({ height_cm: val });
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(['body-profile'], data);
      alert('Measurements updated successfully!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Failed to save measurements.');
    },
  });

  const removePhotoMutation = useMutation({
    mutationFn: async (photoType: 'front' | 'side') => {
      const payload = photoType === 'front' ? { front_photo_url: null } : { side_photo_url: null };
      return bodyProfileApi.updateProfile(payload);
    },
    onSuccess: (data) => {
      qc.setQueryData(['body-profile'], data);
    },
  });

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'front' | 'side') => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, photoType });
    e.target.value = '';
  };

  const isVtoReady = Boolean(profile?.front_photo_url);

  return (
    <div className="max-w-[1080px] mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight">Body Profile</h1>
            {isVtoReady ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                VTO Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                Photo Needed
              </span>
            )}
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Upload your front-facing body photo to power photorealistic AI Virtual Try-On and customize your interactive 3D styling avatar.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 shrink-0">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-caps text-label-caps transition-all ${
              activeTab === 'photos'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_a_photo</span>
            Photos & Fit
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-caps text-label-caps transition-all ${
              activeTab === 'avatar'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_in_ar</span>
            3D Mannequin
          </button>
        </div>
      </div>

      {activeTab === 'photos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Front Photo Card (Required for VTO) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 relative overflow-hidden border border-outline-variant/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Front-Facing Photo
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Required for AI Virtual Try-On garments and outfits.
                  </p>
                </div>
                {profile?.front_photo_url && (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
                    Active
                  </span>
                )}
              </div>

              {/* Upload Drop Zone / Preview */}
              <div className="mt-6">
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e, 'front')}
                />

                {profile?.front_photo_url ? (
                  <div className="relative group rounded-2xl overflow-hidden bg-surface-container-high aspect-[3/4] max-h-[440px] flex items-center justify-center border border-outline-variant">
                    <img
                      src={profile.front_photo_url}
                      alt="Front Profile"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <button
                        onClick={() => frontInputRef.current?.click()}
                        disabled={uploadMutation.isPending}
                        className="bg-white/90 hover:bg-white text-black font-button text-button px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
                        Change Photo
                      </button>
                      <button
                        onClick={() => removePhotoMutation.mutate('front')}
                        disabled={removePhotoMutation.isPending}
                        className="bg-red-500/80 hover:bg-red-500 text-white font-button text-button px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-surface-container-low/50 hover:bg-secondary-container/5 transition-all group min-h-[300px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_photo_alternate</span>
                    </div>
                    <h3 className="font-headline-sm text-base text-primary mb-1">
                      {uploadMutation.isPending ? 'Uploading photo...' : 'Click to upload front photo'}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                      PNG, JPG or WebP up to 10MB. Full body or upper torso facing the camera.
                    </p>
                    <button
                      type="button"
                      disabled={uploadMutation.isPending}
                      className="mt-6 bg-primary text-on-primary font-button text-button px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                      {uploadMutation.isPending ? 'Uploading…' : 'Select Photo'}
                    </button>
                  </div>
                )}
              </div>

              {/* Guidelines banner */}
              <div className="mt-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '20px' }}>tips_and_updates</span>
                <div className="text-xs text-on-surface-variant space-y-1">
                  <p className="font-medium text-primary">Tips for Best Virtual Try-On Results:</p>
                  <p>• Stand straight facing the camera with arms slightly away from your torso.</p>
                  <p>• Wear fitted clothing with a plain, neutral background and even lighting.</p>
                  <p>• Avoid baggy outerwear or heavy shadows in your photo.</p>
                </div>
              </div>
            </div>

            {/* Side Photo Card (Optional) */}
            <div className="glass-card p-6 border border-outline-variant/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-headline-sm text-sm text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline">photo_camera</span>
                    Side-Profile Photo (Optional)
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Used for side-profile fit analysis and 3D silhouette precision.
                  </p>
                </div>
                {profile?.side_photo_url && (
                  <span className="bg-secondary/10 text-secondary text-xs px-2.5 py-1 rounded-full font-medium">
                    Added
                  </span>
                )}
              </div>

              <input
                ref={sideInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileSelected(e, 'side')}
              />

              {profile?.side_photo_url ? (
                <div className="flex items-center gap-4 mt-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                  <img
                    src={profile.side_photo_url}
                    alt="Side Profile"
                    className="w-16 h-20 object-cover rounded-lg border border-outline-variant"
                  />
                  <div className="flex-1">
                    <p className="font-body-sm text-sm text-primary font-medium">Side silhouette saved</p>
                    <p className="font-body-sm text-xs text-on-surface-variant">Ready for 3D mapping</p>
                  </div>
                  <button
                    onClick={() => sideInputRef.current?.click()}
                    className="text-primary hover:underline text-xs font-button"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => removePhotoMutation.mutate('side')}
                    className="text-error hover:underline text-xs font-button ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => sideInputRef.current?.click()}
                  className="w-full mt-3 py-3 border border-dashed border-outline-variant hover:border-primary rounded-xl text-xs font-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Add Side Photo
                </button>
              )}
            </div>
          </div>

          {/* Precision Measurements & Stats Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 border border-outline-variant/40 space-y-6">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">straighten</span>
                Body Dimensions
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Set your height to accurately scale the 3D mannequin and match garment sizing.
              </p>

              <div className="space-y-4">
                <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={displayHeight}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="175"
                    className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none"
                  />
                </div>

                <button
                  onClick={() => saveHeightMutation.mutate()}
                  disabled={saveHeightMutation.isPending}
                  className="w-full bg-primary text-on-primary font-button text-button py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saveHeightMutation.isPending ? 'Saving…' : 'Save Measurements'}
                </button>
              </div>
            </div>

            {/* Virtual Try-On Status Card */}
            <div className="glass-card p-6 border border-outline-variant/40 bg-secondary-container/10 space-y-3">
              <h4 className="font-label-caps text-label-caps uppercase text-primary font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>auto_awesome</span>
                VTO Compatibility
              </h4>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                {isVtoReady
                  ? 'Your front photo is registered in the database. When you open any item or outfit detail page, clicking "Virtual Try-On" will use this photo directly!'
                  : 'A front photo is required before AI Virtual Try-On can process wardrobe pieces. Please upload your photo on the left.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 3D Mannequin Interactive Canvas */
        <div className="space-y-6">
          <div className="glass-card p-6 border border-outline-variant/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">accessibility_new</span>
                  Interactive 3D Mannequin
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                  Rotate, zoom, and inspect your virtual stylist avatar with realistic studio lighting and shadow physics.
                </p>
              </div>
              <div className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/40">
                Height scaled: <strong className="text-primary">{displayHeight || '175'} cm</strong>
              </div>
            </div>

            <div className="w-full h-[580px] rounded-xl overflow-hidden border border-outline-variant">
              <MannequinViewer outfit={null} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
