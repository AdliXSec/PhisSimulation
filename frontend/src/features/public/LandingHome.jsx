import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Rocket3D from '../../components/3d/Rocket3D';
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
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineGlobeAlt,
  HiOutlineKey,
} from 'react-icons/hi2';
import { useTheme } from '../../context/ThemeContext';

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

const featuresVisuals = [
  { icon: HiOutlineSparkles, color: 'var(--neon-cyan)', emoji: '🤖' },
  { icon: HiOutlineCpuChip, color: 'var(--neon-magenta)', emoji: '🎨' },
  { icon: HiOutlineChartBar, color: 'var(--neon-yellow)', emoji: '📊' },
  { icon: HiOutlineGlobeAlt, color: 'var(--neon-green)', emoji: '🔍' },
  { icon: HiOutlineShieldCheck, color: 'var(--neon-purple)', emoji: '🛡️' },
  { icon: HiOutlineKey, color: 'var(--info)', emoji: '🔑' },
];

const stepsVisuals = [
  { icon: HiOutlineCommandLine, color: 'var(--neon-cyan)' },
  { icon: HiOutlineSparkles, color: 'var(--neon-magenta)' },
  { icon: HiOutlineRocketLaunch, color: 'var(--neon-yellow)' },
  { icon: HiOutlineEye, color: 'var(--neon-green)' },
];

export default function LandingHome() {
  const { t, i18n } = useTranslation();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="fade-in" style={{
        padding: '14px clamp(16px, 4vw, 32px)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 9999,
        boxShadow: 'var(--shadow-sm)',
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
          <button
            onClick={toggleLanguage}
            className="btn btn-ghost"
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}
            title="Ubah Bahasa / Change Language"
          >
            {i18n.language === 'en' ? 'ID' : 'EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
          </button>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '8px 12px', fontWeight: 600, letterSpacing: '0.05em' }}>
            {t('landing.nav.login')}
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '8px 16px', fontWeight: 600, letterSpacing: '0.05em' }}>
            {t('landing.nav.register')}
          </Link>
        </div>
      </nav>

      <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* ── Hero ── */}
      <header style={{
        position: 'relative',
        padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(3rem, 8vw, 5rem)',
        textAlign: 'center',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Particles count={35} />

        {/* Gradient orbs */}
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: '500px', height: '500px', background: 'var(--neon-cyan)', filter: 'blur(220px)', opacity: 0.07, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: '600px', height: '600px', background: 'var(--neon-magenta)', filter: 'blur(220px)', opacity: 0.05, borderRadius: '50%' }} />

        {/* 3D Rocket Component */}
        <div id="rocket-canvas-container" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.9
        }}>
          <Rocket3D />
        </div>

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
            {t('landing.hero.badge')}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6.5vw, 5rem)',
            fontWeight: 700,
            marginBottom: '24px',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
          }}>
            <span style={{ color: 'var(--text-heading)' }}>{t('landing.hero.title1')}</span>
            <br />
            <span style={{ color: 'var(--text-heading)' }}>{t('landing.hero.title2')}</span>
            <span style={{
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta), var(--neon-cyan))',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 4s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
              whiteSpace: 'nowrap'
            }}>
              <TypeWriter words={t('landing.hero.words', { returnObjects: true })} speed={90} pause={2500} />
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
            {t('landing.hero.desc')}
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
              {t('landing.hero.btn_start')} <HiOutlineArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              {t('landing.hero.btn_how_it_works')}
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
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: '40px 24px',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          <StatCounter value={99} suffix="%" label={t('landing.stats.delivery')} icon={HiOutlineRocketLaunch} />
          <StatCounter value={50} suffix="+" label={t('landing.stats.templates')} icon={HiOutlineSparkles} />
          <StatCounter value={3} suffix={t('landing.stats.seconds')} label={t('landing.stats.setup')} icon={HiOutlineBoltSlash} />
          <StatCounter value={24} suffix="/7" label={t('landing.stats.monitor')} icon={HiOutlineEye} />
        </div>
      </motion.section>

      {/* ── Features ── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: 'var(--bg-secondary)', position: 'relative' }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              marginBottom: '14px',
              letterSpacing: '0.03em',
            }}>
              {t('landing.features.title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', maxWidth: '520px', margin: '0 auto' }}>
              {t('landing.features.desc')}
            </p>
          </div>

          <div className="grid-3">
            {t('landing.features.items', { returnObjects: true }).map((f, i) => {
              const Icon = featuresVisuals[i].icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
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
                    borderColor: hoveredFeature === i ? `${featuresVisuals[i].color}33` : undefined,
                    boxShadow: hoveredFeature === i ? `0 0 30px ${featuresVisuals[i].color}15` : undefined,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ fontSize: '2rem', lineHeight: 1 }}>{featuresVisuals[i].emoji}</div>
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── How It Works ── */}
      <motion.section 
        id="how-it-works"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', position: 'relative' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              marginBottom: '14px',
            }}>
              {t('landing.steps.title')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)' }}>
              {t('landing.steps.desc')}
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

            {t('landing.steps.items', { returnObjects: true }).map((s, i) => {
              const Icon = stepsVisuals[i].icon;
              return (
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
                    background: `${stepsVisuals[i].color}10`,
                    border: `1.5px solid ${stepsVisuals[i].color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stepsVisuals[i].color,
                    flexShrink: 0,
                    zIndex: 1,
                    boxShadow: `0 0 12px ${stepsVisuals[i].color}15`,
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      color: stepsVisuals[i].color,
                      letterSpacing: '0.15em',
                      marginBottom: '4px',
                      textShadow: `0 0 6px ${stepsVisuals[i].color}44`,
                    }}>
                      {t('landing.steps.step')} 0{i + 1}
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>{s.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'var(--neon-cyan)', filter: 'blur(300px)', opacity: 0.04, borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            marginBottom: '16px',
          }}>
            {t('landing.cta.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 auto 32px', fontSize: 'var(--font-size-base)', lineHeight: 1.7 }}>
            {t('landing.cta.desc')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              {t('landing.cta.btn_signup')}
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <HiOutlineLockClosed size={16} /> {t('landing.cta.btn_login')}
            </Link>
          </div>
        </div>
      </motion.section>

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
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
    </>
  );
}
