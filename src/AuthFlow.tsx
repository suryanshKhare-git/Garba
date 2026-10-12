import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, Heart, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import './auth-flow.css';

type User = { _id?: string; id?: string; name: string; location: { city: string } };
type Signup = { name: string; email: string; phone: string; password: string; age?: number; city: string };
const api = async (path: string, body: unknown) => {
  const response = await fetch(`/api${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};
const photos = ['1506794778202-cad84cf45f1d', '1524504388940-b1c1722653e1', '1500648767791-00dcc994a43e'];
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=82`;

export default function AuthFlow({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [signup, setSignup] = useState<Signup | null>(null);
  const [otp, setOtp] = useState('');
  const [developmentCode, setDevelopmentCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const changeMode = (next: 'login' | 'register') => { setMode(next); setStep('details'); setSignup(null); setOtp(''); setDevelopmentCode(''); setError(''); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'login') {
        const result = await api('/auth/login', { identifier: form.get('identifier'), password: form.get('password'), remember: Boolean(form.get('remember')) });
        onSuccess(result.user); return;
      }
      const details: Signup = { name: String(form.get('name') || '').trim(), email: String(form.get('email') || '').trim().toLowerCase(), phone: String(form.get('phone') || '').trim(), password: String(form.get('password') || ''), age: form.get('age') ? Number(form.get('age')) : undefined, city: String(form.get('city') || '').trim() };
      const result = await api('/auth/otp/send', { email: details.email });
      setSignup(details); setStep('otp'); setDevelopmentCode(result.developmentCode || '');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  };

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!signup) return; setBusy(true); setError('');
    try {
      const verification = await api('/auth/otp/verify', { email: signup.email, code: otp });
      const result = await api('/auth/register', { ...signup, verificationToken: verification.verificationToken });
      onSuccess(result.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  };

  const resend = async () => {
    if (!signup) return; setBusy(true); setError('');
    try { const result = await api('/auth/otp/send', { email: signup.email }); setDevelopmentCode(result.developmentCode || ''); setOtp(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  };

  return <div className="auth-screen">
    <div className="auth-image"><div className="auth-brand"><span className="brand-mark">g</span> GarbaCircle</div><div className="auth-image-copy"><div className="eyebrow light"><span/> A LITTLE CLOSER TO YOUR PEOPLE</div><h1>Find your rhythm.<br/><i>Find your circle.</i></h1><p>Good nights are better together. Meet the people nearby who are ready to dance.</p><div className="auth-proof"><div className="proof-faces">{photos.map((p) => <img key={p} src={photo(p)} />)}</div><span>Made for your kind of celebration</span></div></div><div className="auth-image-foot"><span>Navratri, shared your way</span><span>01 — Find your people</span></div></div>
    <div className="auth-panel"><div className="auth-mobile-brand"><span className="brand-mark">g</span> GarbaCircle</div><div className="auth-form-wrap">
      {step === 'otp' ? <>
        <button type="button" className="text-btn" onClick={() => { setStep('details'); setError(''); }}><ArrowLeft size={14}/> Back to details</button>
        <div className="auth-heading"><div className="eyebrow"><span/> ONE QUICK CHECK</div><h2>Check your email</h2><p>Enter the six-digit code we sent to <b>{signup?.email}</b>.</p></div>
        <form onSubmit={verify}><label>Verification code<input aria-label="Six-digit verification code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} minLength={6} pattern="[0-9]{6}" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus /></label>
          {developmentCode && <div className="dev-code"><b>Local development code</b><span>{developmentCode}</span><small>Email delivery is not configured, so this code is shown for local testing.</small></div>}
          {error && <div className="error-box" role="alert">{error}</div>}
          <button className="btn primary wide submit-btn" disabled={busy || otp.length !== 6}>{busy ? <LoaderCircle className="spin" size={17}/> : 'Verify email & create account'}{!busy && <ArrowUpRight size={16}/>}</button>
          <button type="button" className="text-btn resend-code" disabled={busy} onClick={resend}>Didn’t receive a code? Send another</button>
        </form>
        <div className="auth-privacy"><ShieldCheck size={16}/><span>Your verification code expires after 10 minutes.</span></div>
      </> : <>
        <div className="auth-heading"><div className="eyebrow"><span/> YOUR NEXT DANCE STARTS HERE</div><h2>{mode === 'login' ? 'Welcome back' : 'Make an account'}</h2><p>{mode === 'login' ? 'Pick up where the music left off.' : 'A few details, then verify your email.'}</p></div>
        <div className="auth-switch"><button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => changeMode('login')}>Sign in</button><button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => changeMode('register')}>Create account</button></div>
        <form onSubmit={submit}>
          {mode === 'register' && <>
            <label>Display name<input name="name" placeholder="What should we call you?" required minLength={2} autoComplete="name"/></label>
            <label>Email address<input type="email" name="email" placeholder="you@example.com" required autoComplete="email"/><small className="field-hint"><Mail size={12}/> We’ll send a one-time verification code.</small></label>
            <div className="form-grid"><label>Phone <span className="optional">optional</span><input name="phone" placeholder="+91 98765 43210" autoComplete="tel"/></label><label>Age <span className="optional">18+</span><input type="number" name="age" placeholder="Your age" min="18" max="100"/></label></div>
            <label>City<input name="city" placeholder="e.g. Ahmedabad" required minLength={2} autoComplete="address-level2"/></label>
          </>}
          {mode === 'login' && <label>Email or phone<input name="identifier" placeholder="you@example.com" required autoComplete="username"/></label>}
          <label>Password<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} placeholder={mode === 'register' ? 'At least 10 characters' : 'Enter your password'} minLength={mode === 'register' ? 10 : 1} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/><button type="button" className="icon-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
          {mode === 'login' && <div className="form-row"><label className="checkbox-label"><input type="checkbox" name="remember"/> Remember me</label><button className="text-btn" type="button" onClick={() => setError('Password reset requires email delivery setup. Please contact the site administrator for now.')}>Forgot password?</button></div>}
          {error && <div className="error-box" role="alert">{error}</div>}
          <button className="btn primary wide submit-btn" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : mode === 'login' ? 'Sign in to GarbaCircle' : 'Continue to email verification'}{!busy && <ArrowUpRight size={16}/>}</button>
        </form>
        <div className="auth-privacy"><ShieldCheck size={16}/><span>Your email and phone are never shown on your profile.</span></div>
        <p className="auth-terms">By continuing, you agree to keep GarbaCircle kind, respectful, and safe for everyone.</p>
      </>}
    </div><div className="auth-side-foot">© 2026 GarbaCircle <span>Built around good company <Heart size={13}/></span></div></div>
  </div>;
}
