import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { wardrobeApi } from '../api/wardrobe';
import { outfitsApi } from '../api/outfits';
import { useAuthStore } from '../store/authStore';
import { ClothingCard } from '../components/wardrobe/ClothingCard';
import { OutfitCard } from '../components/outfit/OutfitCard';

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['wardrobe-stats'],
    queryFn: wardrobeApi.getStats,
  });

  const { data: recentOutfits } = useQuery({
    queryKey: ['outfits'],
    queryFn: () => outfitsApi.getAll(),
  });

  const todaysOutfit = recentOutfits && recentOutfits.length > 0 ? recentOutfits[0] : null;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-[1024px] mx-auto space-y-16">
      {/* Header */}
      <section className="text-center md:text-left">
        <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight mb-2">
          {greeting}, {user?.full_name?.split(' ')[0] || user?.username}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Ready to look your best today?
        </p>
      </section>

      {/* Hero: Today's Outfit */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Today's Recommendation
          </h2>
          <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
            AI STYLED
          </span>
        </div>

        {todaysOutfit ? (
          <div className="glass-card p-0 overflow-hidden flex flex-col md:flex-row group">
            <div className="w-full md:w-1/2 aspect-[4/5] bg-surface-variant relative overflow-hidden">
              {todaysOutfit.image_url ? (
                <img src={todaysOutfit.image_url} alt="Today's Outfit" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-surface-container-high">
                  <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '48px' }}>checkroom</span>
                  <p className="font-body-md text-on-surface-variant text-center">No combined image available. Preview items below.</p>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>diamond</span>
                <span className="font-label-caps text-label-caps text-primary">98% Match</span>
              </div>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center w-full md:w-1/2 bg-surface-container-low/50">
              <h3 className="font-display-lg text-display-lg-mobile text-primary mb-4 leading-tight">
                {todaysOutfit.name}
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant italic mb-8 border-l-2 border-secondary pl-4">
                "A sophisticated choice perfect for {todaysOutfit.occasion || 'the day'}. The textures pair beautifully to create an effortlessly chic look."
              </p>

              <div className="flex flex-wrap gap-4 mt-auto">
                <Link to={`/outfits/${todaysOutfit.id}`} className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  View Details
                </Link>
                <Link to="/outfits/generate" className="bg-transparent border border-outline text-primary font-button text-button px-8 py-3 rounded-lg hover:bg-surface-variant transition-colors">
                  Generate Another
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '48px' }}>magic_button</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">No outfits generated yet</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-8">Let your AI Stylist put together the perfect look for you based on your wardrobe.</p>
            <Link to="/outfits/generate" className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Ask AI Stylist
            </Link>
          </div>
        )}
      </section>

      {/* Secondary: Wardrobe Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-card p-8 col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-primary">Wardrobe Insights</h3>
              <Link to="/wardrobe" className="font-label-caps text-label-caps text-primary hover:text-secondary uppercase tracking-widest">View All</Link>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">Your digital closet currently holds <strong className="text-primary">{stats?.total_items || 0}</strong> curated pieces.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats?.by_category && Object.entries(stats.by_category).slice(0, 4).map(([cat, count]) => (
              <div key={cat} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-center">
                <div className="font-display-lg-mobile text-primary mb-1">{count as number}</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">{cat}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 bg-surface-container-high/50 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-secondary mb-4" style={{ fontSize: '40px' }}>calendar_month</span>
          <h3 className="font-headline-sm text-headline-sm text-primary mb-2">7-Day Planner</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">Organize your upcoming looks in advance.</p>
          <Link to="/planner" className="w-full bg-transparent border border-outline text-primary font-button text-button py-2 rounded-lg hover:bg-surface-variant transition-colors">
            Open Planner
          </Link>
        </div>
      </section>
    </div>
  );
}
