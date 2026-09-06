import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bodyProfileApi } from '../api/bodyProfile';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();

  const [privacy, setPrivacy] = useState('private');
  const [intensity, setIntensity] = useState(35);

  const [heightCm, setHeightCm] = useState('');
  const [bustChest, setBustChest] = useState('86');
  const [waist, setWaist] = useState('68');
  const [hips, setHips] = useState('94');

  const { data: bodyProfile } = useQuery({
    queryKey: ['body-profile'],
    queryFn: bodyProfileApi.getProfile,
  });

  useEffect(() => {
    if (bodyProfile?.height_cm) {
      setHeightCm(bodyProfile.height_cm.toString());
    }
  }, [bodyProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload = { height_cm: heightCm ? parseFloat(heightCm) : null };
      if (bodyProfile?.id) {
        return bodyProfileApi.updateProfile(payload);
      } else {
        return bodyProfileApi.createProfile(payload);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(['body-profile'], data);
      alert('Measurements updated successfully!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Failed to update measurements');
    }
  });

  const getIntensityText = (val: number) => {
    if (val < 25) return 'Very Conservative';
    if (val < 50) return 'Subtle Tweaks';
    if (val < 75) return 'Creative Flair';
    return 'Avant-Garde';
  };

  return (
    <div className="max-w-[1024px] mx-auto space-y-12">
      {/* Profile Header */}
      <section className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-10"></div>
        <div className="glass-image-container w-32 h-32 flex-shrink-0 bg-surface-variant flex items-center justify-center">
          {user?.profile_image_url ? (
            <img className="w-full h-full object-cover" src={user.profile_image_url} alt="Profile" />
          ) : (
            <span className="font-headline-md text-primary">{user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="font-headline-md text-headline-md text-primary mb-2">{user?.full_name || user?.username}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">{user?.email}</p>
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>diamond</span>
            <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant">Style Persona: Minimalist Chic</span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col gap-4">
          <button disabled title="Coming Soon" className="bg-transparent border border-outline text-primary/50 cursor-not-allowed font-button text-button px-6 py-2 rounded-lg transition-colors">
            Edit Profile
          </button>
          <button onClick={logout} className="bg-error/10 text-error font-button text-button px-6 py-2 rounded-lg hover:bg-error/20 transition-colors">
            Sign Out
          </button>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Wardrobe Privacy */}
        <section className="glass-card p-8 flex flex-col">
          <div className="settings-group-header">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">lock</span>
              Wardrobe Privacy
            </h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-1">Control who can view your curated digital wardrobe and outfit combinations.</p>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
              <div>
                <span className="font-body-lg text-body-lg block">Private</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Only visible to you and AI Stylist.</span>
              </div>
              <input checked={privacy === 'private'} onChange={() => setPrivacy('private')} className="form-radio text-primary focus:ring-primary w-5 h-5" name="privacy" type="radio" />
            </label>
            <label className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
              <div>
                <span className="font-body-lg text-body-lg block">Friends</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Share inspiration with connected friends.</span>
              </div>
              <input checked={privacy === 'friends'} onChange={() => setPrivacy('friends')} className="form-radio text-primary focus:ring-primary w-5 h-5" name="privacy" type="radio" />
            </label>
          </div>
        </section>

        {/* AI Styling Intensity */}
        <section className="glass-card p-8 flex flex-col">
          <div className="settings-group-header">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">psychology</span>
              AI Styling Intensity
            </h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-1">Adjust how adventurous the AI should be when suggesting new outfit combinations.</p>
          <div className="space-y-6">
            <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
              <span>Conservative</span>
              <span>Avant-Garde</span>
            </div>
            <input value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer custom-range" max="100" min="1" type="range" />
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant mt-6">
              <p className="font-body-md text-body-md text-on-surface-variant italic">Current setting: <strong className="text-primary not-italic font-medium">{getIntensityText(intensity)}</strong>. The AI will adapt to this choice.</p>
            </div>
          </div>
        </section>

        {/* Body Measurements */}
        <section className="glass-card p-8 md:col-span-2">
          <div className="settings-group-header flex justify-between items-end">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">straighten</span>
              Precision Measurements
            </h3>
            <button 
              onClick={() => updateProfileMutation.mutate()} 
              disabled={updateProfileMutation.isPending}
              className="font-label-caps text-label-caps text-primary hover:text-secondary transition-colors uppercase tracking-widest disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Update'}
            </button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">Accurate measurements ensure perfect fit recommendations across brands.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Height (cm)</label>
              <input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" placeholder="170" />
            </div>
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors" title="Locally saved (not synced to backend)">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Bust/Chest (cm)</label>
              <input value={bustChest} onChange={(e) => setBustChest(e.target.value)} className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" placeholder="86" />
            </div>
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors" title="Locally saved (not synced to backend)">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Waist (cm)</label>
              <input value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" placeholder="68" />
            </div>
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors" title="Locally saved (not synced to backend)">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Hips (cm)</label>
              <input value={hips} onChange={(e) => setHips(e.target.value)} className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" placeholder="94" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
