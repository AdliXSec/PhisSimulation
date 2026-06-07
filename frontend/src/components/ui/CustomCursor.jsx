import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  
  // Deteksi mode mobile atau perangkat layar sentuh
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window)
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Jika mobile, jangan eksekusi kustom kursor sama sekali

    // Sembunyikan semua kursor bawaan sistem secara paksa
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    const updateMousePosition = (e) => {
      // Langsung update nilai posisi dengan offset (sehingga ujung pas dengan kursor)
      cursorX.set(e.clientX - 18);
      cursorY.set(e.clientY - 7);
    };

    const handleMouseOver = (e) => {
      // Perbesar kursor jika menyentuh tombol atau tautan
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style); // Hapus style saat komponen di-unmount
      }
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isMobile]);

  // Jika di mode mobile, jangan render komponen kursor roket sama sekali
  if (isMobile) return null;

  return (
    <>
      {/* Kursor Roket Utama */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '40px', // Sedikit lebih kecil dari 48px
          height: '40px',
          pointerEvents: 'none',
          zIndex: 999999,
          filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))',
          x: cursorX, // Binding langsung ke useMotionValue
          y: cursorY,
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
          rotate: isHovering ? -15 : 0, 
        }}
        // Durasi hover diset sangat cepat, namun pergerakan xy sudah terbebas dari framer animate
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.15 }}
      >
        <img
          src="/rocket.svg"
          alt="cursor"
          style={{
            width: '100%',
            height: '100%',
            // Putar SVG agak miring (lebih dari -45deg agar tidak terlalu tegak)
            transform: 'rotate(-55deg)'
          }}
        />
      </motion.div>
    </>
  );
}
