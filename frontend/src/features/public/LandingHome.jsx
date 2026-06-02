import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useTransform } from 'framer-motion';
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
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi2';
import { FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
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
      speedFactor: 0.3 + Math.random() * 0.7, // parallax speed multiplier
    }))
  ).current;

  const { scrollY } = useScroll();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => {
        const yOffset = useTransform(scrollY, [0, 3000], [0, -120 * p.speedFactor]);
        return (
          <motion.div key={p.id} style={{
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
            y: yOffset,
          }} />
        );
      })}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(15px, -20px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-10px, 10px) scale(0.8); opacity: 0.2; }
          75% { transform: translate(-20px, -10px) scale(1.1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ── Parallax Orb (reusable per-section) ── */
function ParallaxOrb({ color, size, blur, opacity, left, right, top, bottom, speed = -100 }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 3000], [0, speed]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        background: color,
        filter: `blur(${blur}px)`,
        opacity,
        borderRadius: '50%',
        left,
        right,
        top,
        bottom,
        y,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ── Feature Showcases (Sticky Scroll) ── */
function FeatureShowcases() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scroll-linked progress bar width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // ─── SHOWCASE DATA ───
  // To add a new feature, simply append an object with { title, desc, img }.
  // Everything else (scroll zones, height, dots) adapts automatically.
  const showcases = [
    {
      title: t('landing.features.items.2.title'),
      desc: t('landing.features.items.2.desc'),
      img: '/dashboard.png',
    },
    {
      title: t('landing.features.items.0.title'),
      desc: t('landing.features.items.0.desc'),
      img: '/email.png',
    },
    {
      title: t('landing.features.items.3.title'),
      desc: t('landing.features.items.3.desc'),
      img: '/osint.png',
    },
  ];

  // Dynamic scroll zones — evenly distributed based on item count
  const count = showcases.length;
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(Math.floor(latest * count), count - 1);
    setActiveIndex(idx);
  });

  // Container height scales with number of items (100vh per item + buffer)
  const containerHeight = `${count * 100}vh`;

  return (
    <>
      <style>{`
        .sticky-container {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px;
          display: flex;
          gap: 4rem;
          align-items: center;
        }
        .sticky-text-side {
          flex: 1;
          position: relative;
          height: 300px;
        }
        .sticky-img-side {
          flex: 1.2;
          position: relative;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sticky-badge {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(0, 240, 255, 0.1);
          color: var(--neon-cyan);
          border-radius: 20px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          margin-bottom: 16px;
          align-self: flex-start;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sticky-text-align {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: absolute;
          inset: 0;
        }
        /* Progress dots */
        .sticky-dots {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        .sticky-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--border);
          background: transparent;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .sticky-dot.active {
          background: var(--neon-cyan);
          border-color: var(--neon-cyan);
          box-shadow: 0 0 12px var(--neon-cyan-glow);
          transform: scale(1.3);
        }
        @media (max-width: 768px) {
          .sticky-container {
            flex-direction: column-reverse;
            gap: 1rem;
            justify-content: center;
            margin-top: 60px;
          }
          .sticky-text-side {
            height: 280px;
            width: 100%;
            flex: none;
          }
          .sticky-img-side {
            height: 200px;
            width: 100%;
            flex: none;
            margin-bottom: 28px;
          }
          .sticky-text-side {
            height: 260px;
          }
          .sticky-text-align {
            align-items: center;
            text-align: center;
          }
          .sticky-text-align p {
            max-width: 95%;
            margin: 0 auto;
            font-size: 0.95rem !important;
          }
          .sticky-text-align h3 {
            font-size: 1.5rem !important;
            margin-bottom: 12px !important;
          }
          .sticky-badge {
            align-self: center !important;
            margin-bottom: 12px !important;
          }
          .sticky-dots {
            flex-direction: row;
            position: absolute;
            right: auto;
            left: 50%;
            top: auto;
            bottom: -24px;
            transform: translateX(-50%);
            justify-content: center;
          }
        }
      `}</style>
      <div ref={containerRef} style={{ height: containerHeight, position: 'relative', background: 'var(--bg-secondary)' }}>
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          borderTop: '1px solid var(--border)'
        }}>
          {/* Scroll progress bar at top */}
          <motion.div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))',
            width: progressWidth,
            zIndex: 20,
            boxShadow: '0 0 12px var(--neon-cyan-glow)'
          }} />

          <div className="sticky-container">

            {/* Left Side: Text Content */}
            <div className="sticky-text-side">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="sticky-text-align"
                >
                  <div className="sticky-badge">{t('landing.footer_links.product.features')} 0{activeIndex + 1}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                    marginBottom: '16px',
                    color: 'var(--text-heading)',
                    lineHeight: 1.1
                  }}>{showcases[activeIndex].title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.6 }}>{showcases[activeIndex].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side: Image Showcase */}
            <div className="sticky-img-side">
              <div style={{
                position: 'absolute',
                inset: '10%',
                background: activeIndex % 2 === 0 ? 'var(--neon-cyan)' : 'var(--neon-magenta)',
                filter: 'blur(80px)',
                opacity: 0.15,
                borderRadius: '50%',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />

              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  src={showcases[activeIndex].img}
                  alt={showcases[activeIndex].title}
                  initial={{ opacity: 0, scale: 0.92, x: 30, y: "-50%" }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: "-50%" }}
                  exit={{ opacity: 0, scale: 1.03, x: -30, y: "-50%" }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg), 0 20px 40px rgba(0,0,0,0.4)',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    zIndex: 1
                  }}
                />
              </AnimatePresence>

              {/* Progress dots */}
              <div className="sticky-dots">
                {showcases.map((_, i) => (
                  <div key={i} className={`sticky-dot ${activeIndex === i ? 'active' : ''}`} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
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

/**
 * Bridges scroll ref → Rocket3D prop without triggering parent re-renders.
 * Uses requestAnimationFrame to read the ref and only re-renders this tiny wrapper.
 */
function Rocket3DWrapper({ scrollRef }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let lastValue = -1;
    function tick() {
      const v = scrollRef.current;
      // Only update state (re-render) when value actually changed
      if (Math.abs(v - lastValue) > 0.001) {
        lastValue = v;
        setProgress(v);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrollRef]);

  return <Rocket3D scrollProgress={progress} />;
}

/* ── Custom Cinematic Smooth Scroll ── */
function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

const handleCinematicScroll = (e, targetId) => {
  e.preventDefault();
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const startY = window.scrollY;
  const targetY = targetElement.getBoundingClientRect().top + window.scrollY;
  const distance = targetY - startY;
  
  // Sangat lambat di awal (hero section), total durasi 8 detik
  const duration = 8000; 
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // easeInOutQuint memberikan efek tahan lama di awal, melesat di tengah, dan berhenti perlahan
    const easeProgress = easeInOutQuint(progress);
    
    window.scrollTo(0, startY + (distance * easeProgress));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  requestAnimationFrame(animation);
};

export default function LandingHome() {
  const { t, i18n } = useTranslation();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const { theme, toggleTheme } = useTheme();

  // ── Cinematic Hero Scroll ──
  const heroContainerRef = useRef(null);
  const heroScrollRef = useRef(0); // ref instead of state — avoids 60fps re-renders
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"]
  });
  useMotionValueEvent(heroProgress, "change", (v) => { heroScrollRef.current = v; });

  // Derived motion values for cinematic phases (these use motion values, no re-render)
  const textOpacity = useTransform(heroProgress, [0, 0.15], [1, 0], { clamp: true });
  const textScale = useTransform(heroProgress, [0, 0.15], [1, 1.5], { clamp: true });
  // Hysteresis: once hidden at 0.15, only show again if scrolled back below 0.05
  const textHiddenRef = useRef(false);
  const textDisplay = useTransform(heroProgress, v => {
    if (v >= 0.15) textHiddenRef.current = true;
    if (v < 0.05) textHiddenRef.current = false;
    return textHiddenRef.current ? "none" : "block";
  });
  const overlayOpacity = useTransform(heroProgress, [0.78, 1], [0, 1]);
  // Particles fade out during zoom
  const particlesOpacity = useTransform(heroProgress, [0, 0.25], [1, 0]);

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

      <div className="fade-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', position: 'relative' }}>

        {/* ── Cinematic Hero (Scroll-linked 3D Zoom) ── */}
        <div ref={heroContainerRef} style={{ height: '300vh', position: 'relative' }}>
          <header style={{
            position: 'sticky',
            top: 0,
            height: '100dvh',
            // minHeight: '-webkit-fill-available',
            padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(3rem, 8vw, 5rem)',
            textAlign: 'center',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
          }}>
            {/* Particles — fade out during zoom */}
            <motion.div style={{ position: 'absolute', inset: 0, opacity: particlesOpacity, pointerEvents: 'none' }}>
              <Particles count={35} />
            </motion.div>

            {/* Parallax gradient orbs */}
            <ParallaxOrb color="var(--neon-cyan)" size={500} blur={200} opacity={0.08} left="10%" top="5%" speed={-200} />
            <ParallaxOrb color="var(--neon-magenta)" size={600} blur={200} opacity={0.06} right="10%" bottom="5%" speed={-350} />

            {/* 3D Rocket Component — scroll-controlled */}
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
              <Rocket3DWrapper scrollRef={heroScrollRef} />
            </div>

            {/* Hero Text Content — scales up and fades out in phase 1 */}
            <motion.div style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: '900px',
              margin: '0 auto',
              opacity: textOpacity,
              scale: textScale,
              display: textDisplay,
              transformOrigin: 'center center',
            }}>
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
                  display: 'inline',
                  wordBreak: 'break-word'
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
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleCinematicScroll(e, 'how-it-works')}
                  className="btn btn-secondary btn-lg"
                >
                  {t('landing.hero.btn_how_it_works')}
                </a>
              </div>
            </motion.div>

            {/* Dark transition overlay — fades in at phase 3 */}
            <motion.div style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg-primary)',
              opacity: overlayOpacity,
              zIndex: 50,
              pointerEvents: 'none',
            }} />

            <style>{`
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}</style>
          </header>
        </div>

        {/* ── Content Wrapper: Pulls everything up over the sticky hero to prevent empty gap ── */}
        <div style={{ marginTop: '-200px', position: 'relative', zIndex: 20, background: 'var(--bg-primary)' }}>
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

          {/* ── About ── */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem', position: 'relative', overflow: 'hidden' }}
          >
            <ParallaxOrb color="var(--neon-magenta)" size={400} blur={200} opacity={0.06} right="-5%" top="-10%" speed={-180} />
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🛡️</div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}>
                {t('landing.about.title')}
              </h2>
              <p style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '650px'
              }}>
                {t('landing.about.desc')}
              </p>
              <div style={{
                padding: '16px 24px',
                background: 'rgba(255, 0, 170, 0.05)',
                borderLeft: '4px solid var(--neon-magenta)',
                borderRadius: '0 12px 12px 0',
                marginTop: '8px'
              }}>
                <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-primary)' }}>{t('landing.about.quote')}</p>
              </div>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6, fontSize: '0.9rem', marginTop: '8px' }}>
                {t('landing.about.mission')}
              </p>
            </div>
          </motion.section>

          {/* ── Features ── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}
          >
            <ParallaxOrb color="var(--neon-cyan)" size={450} blur={180} opacity={0.05} left="-10%" top="20%" speed={-250} />
            <ParallaxOrb color="var(--neon-magenta)" size={350} blur={160} opacity={0.04} right="-8%" bottom="10%" speed={-150} />
            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                  marginBottom: '12px',
                  letterSpacing: '0.03em',
                }}>
                  {t('landing.features.title')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '550px', margin: '0 auto' }}>
                  {t('landing.features.desc')}
                </p>
              </div>

              <div className="bento-grid" style={{ gap: '20px' }}>
                {t('landing.features.items', { returnObjects: true }).map((f, i) => {
                  const Icon = featuresVisuals[i].icon;
                  const isWide = i === 0 || i === 3 || i === 4;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      key={i}
                      className={`card-glow ${isWide ? 'bento-item-wide' : ''}`}
                      onMouseEnter={() => setHoveredFeature(i)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      style={{
                        display: 'flex',
                        padding: '24px',
                        borderRadius: '20px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        backdropFilter: 'blur(10px)',
                        cursor: 'default',
                        transform: hoveredFeature === i ? 'translateY(-6px)' : 'translateY(0)',
                        borderColor: hoveredFeature === i ? `${featuresVisuals[i].color}55` : 'var(--border)',
                        boxShadow: hoveredFeature === i ? `0 10px 30px ${featuresVisuals[i].color}15` : 'var(--shadow-md)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Subtle Background Accent for Wide Cards */}
                      {isWide && (
                        <div style={{
                          position: 'absolute',
                          right: '-10%',
                          top: '-20%',
                          width: '160px',
                          height: '160px',
                          background: featuresVisuals[i].color,
                          filter: 'blur(80px)',
                          opacity: 0.06,
                          zIndex: 0,
                          borderRadius: '50%'
                        }} />
                      )}

                      <div className="feature-icon-container" style={{
                        width: '48px',
                        height: '48px',
                        flexShrink: 0,
                        borderRadius: '14px',
                        background: `${featuresVisuals[i].color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: featuresVisuals[i].color,
                        boxShadow: `inset 0 0 16px ${featuresVisuals[i].color}10`,
                        position: 'relative',
                        zIndex: 1
                      }}>
                        <Icon className="feature-icon-svg" />
                      </div>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <h3 style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          marginBottom: '8px',
                          color: 'var(--text-heading)'
                        }}>
                          {f.title}
                        </h3>
                        <p className="feature-desc" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                      </div>
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

          {/* ── Feature Showcases ── */}
          <FeatureShowcases />

          {/* ── FAQ ── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', position: 'relative', background: 'var(--bg-primary)' }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
                  marginBottom: '14px',
                }}>
                  {t('landing.faq.title')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)' }}>
                  {t('landing.faq.desc')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {t('landing.faq.items', { returnObjects: true }).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${openFaq === idx ? 'var(--neon-cyan)' : 'var(--border)'}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: openFaq === idx ? '0 0 20px rgba(0, 240, 255, 0.1)' : 'none'
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-heading)',
                        fontSize: '1.1rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {item.q}
                      {openFaq === idx ? <HiOutlineChevronUp size={20} color="var(--neon-cyan)" /> : <HiOutlineChevronDown size={20} color="var(--text-muted)" />}
                    </button>
                    <div style={{
                      maxHeight: openFaq === idx ? '200px' : '0',
                      opacity: openFaq === idx ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      padding: openFaq === idx ? '0 24px 24px 24px' : '0 24px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7
                    }}>
                      {item.a}
                    </div>
                  </div>
                ))}
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
            <ParallaxOrb color="var(--neon-cyan)" size={600} blur={250} opacity={0.06} left="50%" top="50%" speed={-400} />
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
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: '64px 24px 24px',
            position: 'relative'
          }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '64px' }}>
                {/* Brand Col */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <HiOutlineShieldCheck size={28} style={{ color: 'var(--neon-cyan)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      PHI<span style={{ color: 'var(--neon-cyan)' }}>SIM</span>
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {t('landing.about.mission')}
                  </p>
                </div>

                {/* Links Cols */}
                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '20px' }}>{t('landing.footer_links.product.title')}</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.product.features')}</a></li>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.product.pricing')}</a></li>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.product.changelog')}</a></li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '20px' }}>{t('landing.footer_links.resources.title')}</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.resources.documentation')}</a></li>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.resources.blog')}</a></li>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.resources.templates')}</a></li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '20px' }}>{t('landing.footer_links.legal.title')}</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.legal.privacy')}</a></li>
                    <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--neon-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{t('landing.footer_links.legal.terms')}</a></li>
                  </ul>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--divider)',
                paddingTop: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {t('landing.footer_copyright')}
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="#" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--neon-cyan)'; e.currentTarget.style.borderColor = 'var(--neon-cyan)' }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                    <FaXTwitter size={14} />
                  </a>
                  <a href="#" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--neon-cyan)'; e.currentTarget.style.borderColor = 'var(--neon-cyan)' }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                    <FaLinkedinIn size={14} />
                  </a>
                  <a href="#" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = 'var(--neon-cyan)'; e.currentTarget.style.borderColor = 'var(--neon-cyan)' }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                    <FaGithub size={14} />
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
