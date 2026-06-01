import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Space-themed Loading Screen
 * - Animated starfield background
 * - PhiSim logo with neon glow
 * - Terminal-style loading messages
 * - Smooth fade-out transition
 */
export default function SpaceLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startTime = useRef(Date.now());

  const messages = useMemo(() => [
    '> Initializing quantum core...',
    '> Loading 3D assets...',
    '> Establishing neural link...',
    '> Scanning threat vectors...',
    '> Calibrating phishing matrix...',
    '> System online ✓',
  ], []);

  // ── Animated Starfield ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    const starCount = 180;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1500 + 500,
      size: Math.random() * 1.8 + 0.3,
    }));

    // Shooting stars
    const shootingStars = [];
    let lastShoot = 0;

    function animate(time) {
      ctx.fillStyle = 'rgba(6, 10, 20, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Regular stars — warp speed effect
      stars.forEach(star => {
        star.z -= 2.5;
        if (star.z <= 0) {
          star.z = 1500;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        const sx = (star.x - cx) * (800 / star.z) + cx;
        const sy = (star.y - cy) * (800 / star.z) + cy;
        const r = star.size * (800 / star.z);
        const brightness = Math.min(1, (1500 - star.z) / 1200);

        // Draw star trail
        const prevZ = star.z + 6;
        const px = (star.x - cx) * (800 / prevZ) + cx;
        const py = (star.y - cy) * (800 / prevZ) + cy;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(0, 240, 255, ${brightness * 0.3})`;
        ctx.lineWidth = r * 0.5;
        ctx.stroke();

        // Draw star dot
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fill();
      });

      // Shooting stars
      if (time - lastShoot > 2000 + Math.random() * 3000) {
        lastShoot = time;
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.3,
          vx: (Math.random() - 0.3) * 12,
          vy: Math.random() * 4 + 2,
          life: 1,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.015;

        if (s.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 4, s.y - s.vy * 4);
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 4, s.y - s.vy * 4);
        grad.addColorStop(0, `rgba(0, 240, 255, ${s.life})`);
        grad.addColorStop(1, `rgba(0, 240, 255, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── Progress Simulation + Real Loading ──
  useEffect(() => {
    const minDuration = 2200; // Minimum 2.2s for visual impact
    let fontReady = false;
    let minTimeReady = false;

    // Wait for fonts
    document.fonts.ready.then(() => { fontReady = true; });

    // Progress ticker
    const interval = setInterval(() => {
      setProgress(prev => {
        const elapsed = Date.now() - startTime.current;
        const timeProgress = Math.min(elapsed / minDuration, 1);
        // Ease out the progress for visual smoothness
        const eased = 1 - Math.pow(1 - timeProgress, 3);
        const newVal = Math.min(eased * 100, 100);

        // Update message based on progress
        const msgIdx = Math.min(Math.floor((newVal / 100) * messages.length), messages.length - 1);
        setMessageIdx(msgIdx);

        // Check if minimum time has passed
        if (elapsed >= minDuration) minTimeReady = true;

        // Complete when everything is ready
        if (minTimeReady && fontReady && newVal >= 99) {
          clearInterval(interval);
          // Start fade-out
          setFadingOut(true);
          setTimeout(() => {
            onComplete?.();
          }, 600); // Wait for fade-out animation
          return 100;
        }

        return newVal;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [messages, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060a14',
      opacity: fadingOut ? 0 : 1,
      transition: 'opacity 0.6s ease-out',
      pointerEvents: fadingOut ? 'none' : 'auto',
    }}>
      {/* Starfield Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'loaderPulse 2s ease-in-out infinite',
        }}>
          {/* Shield Icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" stroke="#39ff14" strokeWidth="2" />
          </svg>
          <div>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#f0f4ff',
              letterSpacing: '0.08em',
            }}>
              PHI<span style={{ color: '#00f0ff' }}>SIM</span>
            </span>
          </div>
        </div>

        {/* Terminal Messages */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
          color: '#00f0ff',
          textAlign: 'left',
          width: 'clamp(260px, 50vw, 380px)',
          minHeight: '120px',
          padding: '16px',
          background: 'rgba(0, 240, 255, 0.03)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          borderRadius: '8px',
          letterSpacing: '0.03em',
        }}>
          {messages.slice(0, messageIdx + 1).map((msg, i) => (
            <div key={i} style={{
              opacity: i < messageIdx ? 0.4 : 1,
              marginBottom: '6px',
              color: i === messages.length - 1 && messageIdx === messages.length - 1 ? '#39ff14' : '#00f0ff',
            }}>
              {msg}
              {i === messageIdx && (
                <span style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '14px',
                  background: '#00f0ff',
                  marginLeft: '4px',
                  animation: 'termBlink 0.7s step-end infinite',
                  verticalAlign: 'text-bottom',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: 'clamp(260px, 50vw, 380px)',
          height: '3px',
          background: 'rgba(0, 240, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00f0ff, #ff00aa)',
            borderRadius: '4px',
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
          }} />
        </div>

        {/* Percentage */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.3)',
          letterSpacing: '0.1em',
        }}>
          {Math.round(progress)}% — LOADING SYSTEMS
        </div>
      </div>

      <style>{`
        @keyframes loaderPulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 240, 255, 0.6)); }
        }
        @keyframes termBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
