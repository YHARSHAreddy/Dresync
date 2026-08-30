import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const { user, logout } = useAuthStore();

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
          <button className="bg-transparent border border-outline text-primary font-button text-button px-6 py-2 rounded-lg hover:bg-surface-variant transition-colors">
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
              <input defaultChecked className="form-radio text-primary focus:ring-primary w-5 h-5" name="privacy" type="radio" />
            </label>
            <label className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
              <div>
                <span className="font-body-lg text-body-lg block">Friends</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Share inspiration with connected friends.</span>
              </div>
              <input className="form-radio text-primary focus:ring-primary w-5 h-5" name="privacy" type="radio" />
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
            <input className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer custom-range" max="100" min="1" type="range" defaultValue="35" />
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant mt-6">
              <p className="font-body-md text-body-md text-on-surface-variant italic">Current setting: <strong className="text-primary not-italic font-medium">Subtle Tweaks</strong>. The AI will suggest safe, classic pairings based on your existing habits.</p>
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
            <button className="font-label-caps text-label-caps text-primary hover:text-secondary transition-colors uppercase tracking-widest">Update</button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">Accurate measurements ensure perfect fit recommendations across brands.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Height (cm)</label>
              <input className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" defaultValue="170" />
            </div>
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Bust/Chest (cm)</label>
              <input className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" defaultValue="86" />
            </div>
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Waist (cm)</label>
              <input className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" defaultValue="68" />
            </div>
            <div className="border-b border-outline-variant pb-2 focus-within:border-primary transition-colors">
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Hips (cm)</label>
              <input className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" type="number" defaultValue="94" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
