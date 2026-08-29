import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Default fallback to create account if it doesn't exist, or just login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If user not found, try to sign up automatically for demo purposes
      if (error.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setErrorMsg(signUpError.message);
        } else {
          alert('Akun berhasil dibuat! Silakan cek email Anda atau coba login kembali jika auto-confirm aktif.');
        }
      } else {
        setErrorMsg(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Logo" className={styles.logoImage} />
          <div className={styles.logoTextWrapper}>
            <span className={styles.logoTitle}>PT Jayata Medika</span>
            <span className={styles.logoSubtitle}>Sentosa</span>
          </div>
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Sistem Administrasi <br/> & Manajemen Terpadu</h1>
          <p className={styles.subtitle}>
            Kelola inventaris, keuangan proyek, dan dokumen operasional 
            dalam satu platform yang cerdas dan efisien.
          </p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Masuk ke Akun Anda</h2>
          <p className={styles.loginSubtitle}>Gunakan akun perusahaan untuk mengakses dashboard.</p>
          
          {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

          <form onSubmit={handleEmailLogin} className={styles.emailForm}>
            <Input 
              label="Alamat Email" 
              type="email" 
              placeholder="admin@jayatamedika.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Kata Sandi" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk dengan Email'}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>ATAU</span>
          </div>

          <Button 
            className={styles.googleBtn} 
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 24 24" className={styles.googleIcon}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </Button>
        </div>
      </div>
    </div>
  );
}
