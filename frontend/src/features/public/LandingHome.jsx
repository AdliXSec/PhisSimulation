import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlineCpuChip,
  HiOutlineFingerPrint,
  HiOutlineBoltSlash,
  HiOutlineRocketLaunch,
  HiOutlineEye,
  HiOutlineLockClosed,
  HiOutlineCommandLine,
} from 'react-icons/hi2';

/* ── Animated counter ── */
function useAnimatedCount(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else { setCount(Math.floor(start)); }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ── Typewriter ── */
function TypeWriter({ words, speed = 100, pause = 2000 }) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timer;

    if (!deleting && charIdx <= current.length) {
      timer = setTimeout(() => {
        setText(current.substring(0, charIdx));
        setCharIdx(charIdx + 1);
      }, speed);
    } else if (!deleting && charIdx > current.length) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timer = setTimeout(() => {
        setText(current.substring(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setWordIdx((wordIdx + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return (
    <span>
      {text}
      <span style={{
        display: 'inline-block', width: '3px', height: '1.1em',
        background: 'var(--neon-cyan)', marginLeft: '3px',
        animation: 'blink 0.7s step-end infinite',
        verticalAlign: 'text-bottom',
        boxShadow: '0 0 8px var(--neon-cyan-glow)',
        borderRadius: '1px',
      }} />
    </span>
  );
}

/* ── Floating particle ── */
function Particles({ count = 30 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 3,
      dur: 5 + Math.random() * 10,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? 'var(--neon-cyan)' : 'var(--neon-magenta)',
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          opacity: 0.4,
          animation: `floatParticle ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(${Math.random() > 0.5 ? '' : '-'}15px, -20px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(${Math.random() > 0.5 ? '' : '-'}10px, 10px) scale(0.8); opacity: 0.2; }
          75% { transform: translate(${Math.random() > 0.5 ? '' : '-'}20px, -10px) scale(1.1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function StatCounter({ value, label, suffix = '', icon: Icon }) {
  const [count, ref] = useAnimatedCount(value);
  return (
    <div ref={ref} style={{
      textAlign: 'center',
      padding: '24px 16px',
      background: 'rgba(0, 240, 255, 0.03)',
      border: '1px solid rgba(0, 240, 255, 0.08)',
      borderRadius: '12px',
      transition: 'all 0.3s',
    }}>
      {Icon && <Icon size={24} style={{ color: 'var(--neon-cyan)', marginBottom: '8px', filter: 'drop-shadow(0 0 4px var(--neon-cyan-glow))' }} />}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 5vw, 2.8rem)',
        fontWeight: 700,
        color: 'var(--neon-cyan)',
        textShadow: '0 0 16px var(--neon-cyan-glow)',
        lineHeight: 1,
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        marginTop: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
      }}>
        {label}
      </div>
    </div>
  );
}

const features = [
  {
    icon: HiOutlineSparkles,
    title: 'AI Email Generator',
    desc: 'Cukup tentukan tema — AI akan membuatkan email phishing realistis lengkap dengan landing page tiruannya. Zero effort.',
    color: 'var(--neon-cyan)',
    emoji: '🤖',
  },
  {
    icon: HiOutlineCpuChip,
    title: 'Custom HTML Engine',
    desc: 'Mau pakai desain sendiri? Upload kode HTML kustom (misal tiruan PayPal). Formulirnya diproses otomatis.',
    color: 'var(--neon-magenta)',
    emoji: '🎨',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Real-Time Analytics',
    desc: 'Siapa yang buka email? Klik link? Input password? Semua terpantau live. Dapatkan skor risiko per karyawan.',
    color: 'var(--neon-yellow)',
    emoji: '📊',
  },
];

const steps = [
  { icon: HiOutlineCommandLine, title: 'Buat Kampanye', desc: 'Tentukan nama, tema, dan level kesulitan. Pilih departemen target.', color: 'var(--neon-cyan)' },
  { icon: HiOutlineSparkles, title: 'Generate atau Upload', desc: 'Biarkan AI membuat template, atau upload HTML kustom Anda sendiri.', color: 'var(--neon-magenta)' },
  { icon: HiOutlineRocketLaunch, title: 'Luncurkan!', desc: 'Satu klik — email phishing terkirim ke seluruh target secara otomatis.', color: 'var(--neon-yellow)' },
  { icon: HiOutlineEye, title: 'Pantau & Analisis', desc: 'Lihat dashboard real-time: siapa yang terjebak, siapa yang waspada.', color: 'var(--neon-green)' },
];

export default function LandingHome() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        padding: '14px clamp(16px, 4vw, 32px)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
        background: 'rgba(6, 10, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'rgba(0, 240, 255, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(0, 240, 255, 0.2)',
          }}>
            <HiOutlineShieldCheck size={22} style={{ color: 'var(--neon-cyan)', filter: 'drop-shadow(0 0 4px var(--neon-cyan-glow))' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
          }}>
            PHI<span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 8px var(--neon-cyan-glow)' }}>SIM</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '8px 12px', fontWeight: 600, letterSpacing: '0.05em' }}>
            LOGIN
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '8px 16px', fontWeight: 600, letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)' }}>
            DAFTAR
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{
        position: 'relative',
        padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(3rem, 8vw, 5rem)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <Particles count={35} />

        {/* Gradient orbs */}
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: '500px', height: '500px', background: 'var(--neon-cyan)', filter: 'blur(220px)', opacity: 0.07, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: '600px', height: '600px', background: 'var(--neon-magenta)', filter: 'blur(220px)', opacity: 0.05, borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          {/* Fun badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--neon-cyan)',
            marginBottom: '28px',
            letterSpacing: '0.05em',
          }}>
            <span style={{ animation: 'glowPulse 2s ease infinite' }}>⚡</span>
            PLATFORM SIMULASI PHISHING BERTENAGA AI
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6.5vw, 5rem)',
            fontWeight: 700,
            marginBottom: '24px',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
          }}>
            <span style={{ color: 'var(--text-heading)' }}>Uji Ketahanan Tim</span>
            <br />
            <span style={{ color: 'var(--text-heading)' }}>Anda Terhadap </span>
            <span style={{
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta), var(--neon-cyan))',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 4s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              <TypeWriter words={['Phishing', 'Social Engineering', 'Cyber Attack']} speed={90} pause={2500} />
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: 'var(--text-secondary)',
            marginBottom: '40px',
            maxWidth: '650px',
            marginInline: 'auto',
            lineHeight: 1.7,
          }}>
            Buat simulasi phishing dengan AI, kirim ke seluruh departemen, dan lihat siapa yang klik — semua dalam satu dashboard yang intuitif. <span style={{ color: 'var(--neon-cyan)' }}>Gratis untuk dicoba.</span>
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
              Mulai Sekarang <HiOutlineArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              Lihat Cara Kerja ↓
            </a>
          </div>
        </div>

        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </header>

      {/* ── Stats Bar ── */}
      <section style={{
        padding: '40px 24px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          <StatCounter value={99} suffix="%" label="Delivery Rate" icon={HiOutlineRocketLaunch} />
          <StatCounter value={50} suffix="+" label="Template Siap" icon={HiOutlineSparkles} />
          <StatCounter value={3} suffix=" detik" label="Setup Kampanye" icon={HiOutlineBoltSlash} />
          <StatCounter value={24} suffix="/7" label="Monitoring" icon={HiOutlineEye} />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: 'var(--bg-secondary)', position: 'relative' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              marginBottom: '14px',
              letterSpacing: '0.03em',
            }}>
              Kenapa Harus <span className="text-gradient">PhiSim</span>? 🤔
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', maxWidth: '520px', margin: '0 auto' }}>
              Tiga fitur utama yang membuat simulasi phishing semudah memesan kopi.
            </p>
          </div>

          <div className="grid-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="card-glow"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'default',
                  transform: hoveredFeature === i ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
                  borderColor: hoveredFeature === i ? `${f.color}33` : undefined,
                  boxShadow: hoveredFeature === i ? `0 0 30px ${f.color}15` : undefined,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{ fontSize: '2rem', lineHeight: 1 }}>{f.emoji}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-lg)',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-sm)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', position: 'relative' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              marginBottom: '14px',
            }}>
              Cuma <span className="text-gradient">4 Langkah</span> 🎯
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)' }}>
              Dari nol sampai kampanye berjalan — kurang dari 5 menit.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '0',
              bottom: '0',
              width: '2px',
              background: 'linear-gradient(180deg, var(--neon-cyan), var(--neon-magenta), var(--neon-yellow), var(--neon-green))',
              opacity: 0.2,
              borderRadius: '2px',
            }} />

            {steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                padding: '20px 24px 20px 0',
                position: 'relative',
              }}>
                {/* Step circle */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${s.color}10`,
                  border: `1.5px solid ${s.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color,
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: `0 0 12px ${s.color}15`,
                }}>
                  <s.icon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: s.color,
                    letterSpacing: '0.15em',
                    marginBottom: '4px',
                    textShadow: `0 0 6px ${s.color}44`,
                  }}>
                    STEP 0{i + 1}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>{s.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'var(--neon-cyan)', filter: 'blur(300px)', opacity: 0.04, borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            marginBottom: '16px',
          }}>
            Siap <span className="text-gradient">Upgrade</span> Keamanan?
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 auto 32px', fontSize: 'var(--font-size-base)', lineHeight: 1.7 }}>
            Mulai simulasi phishing pertama Anda hari ini. Gratis, tanpa kartu kredit, tanpa batas waktu trial.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              🚀 Daftar Gratis
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <HiOutlineLockClosed size={16} /> Login Admin
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '20px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
      }}>
        <p>© 2026 PHISIM // DIBUAT DENGAN ❤️ UNTUK KEAMANAN SIBER YANG LEBIH BAIK</p>
      </footer>
    </div>
  );
}
