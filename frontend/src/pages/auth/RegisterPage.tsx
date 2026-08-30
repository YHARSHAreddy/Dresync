import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(form);
      setAuth(res.user, res.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Background ambient blurs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary-container/30 rounded-full blur-[100px]" style={{ transform: 'translate(-20%, 20%)' }}></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-surface-container-high rounded-full blur-[100px]" style={{ transform: 'translate(20%, -20%)' }}></div>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-[1200px] mx-auto items-center justify-center p-8 gap-16">
        {/* Left Side: Brand Story */}
        <div className="flex-1 hidden md:flex flex-col pr-12 border-r border-outline-variant/30">
          <h1 className="font-display-lg text-[64px] text-primary mb-6 tracking-tight leading-none">Dresync</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-[400px]">
            Join the future of fashion. Build your digital wardrobe and let our editorial AI curate your daily look.
          </p>
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant/30">
                 <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>checkroom</span>
              </div>
              <span className="font-headline-sm text-lg text-primary font-medium tracking-tight">Organize your physical closet</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant/30">
                 <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>magic_button</span>
              </div>
              <span className="font-headline-sm text-lg text-primary font-medium tracking-tight">Discover new combinations</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant/30">
                 <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }}>verified</span>
              </div>
              <span className="font-headline-sm text-lg text-primary font-medium tracking-tight">Always look your best</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex-1 w-full max-w-[480px]">
          <div className="glass-card p-10 md:p-14">
            <div className="md:hidden mb-12 text-center">
              <h1 className="font-display-lg text-[48px] text-primary tracking-tight">Dresync</h1>
            </div>
            
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Apply for Access</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-10">Create your premium account</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {error && (
                <div className="bg-error/10 text-error p-4 rounded-lg font-body-md border border-error/20 flex items-start gap-3">
                   <span className="material-symbols-outlined mt-0.5" style={{ fontSize: '18px' }}>error</span>
                   {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 border-b border-outline-variant/50 pb-2 focus-within:border-primary transition-colors">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="reg-fname">Full Name</label>
                  <input id="reg-fname" name="full_name" type="text" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" placeholder="Jane Doe"
                    value={form.full_name} onChange={handleChange} />
                </div>
                <div className="flex flex-col gap-2 border-b border-outline-variant/50 pb-2 focus-within:border-primary transition-colors">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="reg-username">Username</label>
                  <input id="reg-username" name="username" type="text" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" placeholder="janedoe"
                    value={form.username} onChange={handleChange} required />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-b border-outline-variant/50 pb-2 focus-within:border-primary transition-colors">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="reg-email">Email Address</label>
                <input id="reg-email" name="email" type="email" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none" placeholder="name@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              
              <div className="flex flex-col gap-2 border-b border-outline-variant/50 pb-2 focus-within:border-primary transition-colors">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest" htmlFor="reg-password">Password</label>
                <input id="reg-password" name="password" type="password" className="w-full bg-transparent border-none p-0 font-body-lg text-body-lg text-primary focus:ring-0 outline-none tracking-[0.2em]" placeholder="Min. 8 characters"
                  value={form.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="bg-primary text-on-primary font-button text-button py-4 rounded-lg mt-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>sync</span> : null}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:text-secondary transition-colors underline underline-offset-4">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
