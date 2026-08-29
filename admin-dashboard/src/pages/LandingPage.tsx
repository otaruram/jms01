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


        </div>
      </div>
    </div>
  );
}
