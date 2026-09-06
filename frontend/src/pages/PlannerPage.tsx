import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { plannerApi } from '../api/planner';
import { DayOfWeek, DAYS_OF_WEEK, SEASON_OPTIONS, OCCASION_OPTIONS } from '../types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

function OutfitMini({ outfit }: { outfit: any }) {
  const navigate = useNavigate();

  if (!outfit) {
    return (
      <div className="flex flex-col items-center justify-center text-outline/30 bg-surface-container-low/50 border border-dashed border-outline-variant/30 rounded-xl" style={{ height: '160px' }}>
         <span className="material-symbols-outlined mb-2" style={{ fontSize: '32px' }}>checkroom</span>
         <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">No Outfit</span>
      </div>
    );
  }

  const score = Math.round(outfit.compatibility_score * 100);

  return (
    <div 
      className="flex flex-col gap-3 group relative cursor-pointer h-full"
      onClick={() => navigate(`/outfits/${outfit.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/outfits/${outfit.id}`)}
    >
       <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-variant relative">
          {outfit.image_url ? (
            <img src={outfit.image_url} alt={outfit.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-outline/40">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>checkroom</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-label-caps uppercase tracking-widest border border-white/20">
            {score}%
          </div>
       </div>
       <div className="flex flex-col gap-0.5 mt-auto">
          <span className="font-headline-sm text-sm text-primary truncate leading-tight">{outfit.name || 'Curated Look'}</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant truncate uppercase tracking-widest text-[10px]">{outfit.occasion || 'Everyday'}</span>
       </div>
    </div>
  );
}

export function PlannerPage() {
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');
  const [generating, setGenerating] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: plan, isLoading } = useQuery({
    queryKey: ['weekly-plan'],
    queryFn: plannerApi.getCurrentWeek,
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newPlan = await plannerApi.generate({ occasion: occasion || undefined, season: season || undefined });
      qc.setQueryData(['weekly-plan'], newPlan);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Could not generate weekly plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateDay = async (day: string) => {
    setRegeneratingDay(day);
    try {
      const updated = await plannerApi.regenerateDay(day, { occasion: occasion || undefined, season: season || undefined });
      qc.setQueryData(['weekly-plan'], updated);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Could not regenerate day');
    } finally {
      setRegeneratingDay(null);
    }
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const today = new Date();

  return (
    <div className="max-w-[1200px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-outline-variant pb-8">
        <div>
          <h1 className="font-display-lg text-display-lg-mobile text-primary tracking-tight mb-2">Weekly Planner</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Week of {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-4 items-center bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
          <div className="flex flex-col">
            <select className="bg-transparent border-none py-1 pl-2 pr-8 font-label-caps text-label-caps text-on-surface-variant focus:ring-0 outline-none uppercase tracking-widest cursor-pointer" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              <option value="">Any Occasion</option>
              {OCCASION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="w-px h-6 bg-outline-variant"></div>
          <div className="flex flex-col">
            <select className="bg-transparent border-none py-1 pl-2 pr-8 font-label-caps text-label-caps text-on-surface-variant focus:ring-0 outline-none uppercase tracking-widest cursor-pointer" value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="">Any Season</option>
              {SEASON_OPTIONS.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            className="bg-primary text-on-primary font-label-caps text-label-caps px-4 py-2 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest flex items-center gap-2 whitespace-nowrap"
            disabled={generating}
          >
            {generating ? (
              <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>sync</span> Curating...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span> {plan ? 'Regenerate' : 'Generate'}</>
            )}
          </button>
        </div>
      </div>

      {/* Plan grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="glass-card p-4 animate-pulse border border-outline-variant/30">
               <div className="h-4 bg-surface-variant rounded w-1/2 mb-4" />
               <div className="aspect-[4/5] bg-surface-variant rounded-xl mb-4" />
               <div className="h-3 bg-surface-variant rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : plan ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-stretch">
          {DAYS_OF_WEEK.map((day, idx) => {
            const outfit = (plan as any)[day];
            const dayDate = addDays(weekStart, idx);
            const isToday = isSameDay(dayDate, today);

            return (
              <div 
                key={day} 
                className={`glass-card p-4 flex flex-col gap-4 relative overflow-hidden transition-colors ${isToday ? 'border-primary/40 bg-surface-container-low ring-1 ring-primary/20' : 'border-outline-variant/30 hover:border-outline-variant'}`} 
              >
                {isToday && <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>}
                
                <div className="flex justify-between items-start border-b border-outline-variant/50 pb-2">
                  <div>
                    <div className={`font-headline-sm text-sm ${isToday ? 'text-primary' : 'text-primary/70'}`}>
                      {DAY_LABELS[day]}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant mt-1">
                      {format(dayDate, 'MMM d')}
                    </div>
                  </div>
                  <button
                    className="text-on-surface-variant hover:text-secondary transition-colors"
                    onClick={() => handleRegenerateDay(day)}
                    disabled={regeneratingDay === day}
                    title={`Regenerate ${day}`}
                  >
                    <span className={`material-symbols-outlined ${regeneratingDay === day ? 'animate-spin' : ''}`} style={{ fontSize: '16px' }}>sync</span>
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <OutfitMini outfit={outfit} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center text-center p-16 relative overflow-hidden border border-dashed border-outline-variant/50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl -z-10"></div>
          <span className="material-symbols-outlined text-secondary/70 mb-6" style={{ fontSize: '64px' }}>calendar_month</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-4">No plan for this week</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-8">
            Generate a 7-day outfit plan tailored from your wardrobe. The AI will consider your occasion and season preferences.
          </p>
          <button onClick={handleGenerate} className="bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:opacity-90 transition-opacity" disabled={generating}>
            {generating ? 'Curating...' : 'Generate My Week'}
          </button>
        </div>
      )}
    </div>
  );
}
