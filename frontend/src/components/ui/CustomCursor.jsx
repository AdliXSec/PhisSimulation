import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  // Gunakan useMotionValue untuk update posisi tanpa menunggu re-render React (0 delay)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
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
      document.head.removeChild(style); // Hapus style saat komponen di-unmount
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

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
      {/* <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '48px',
          height: '48px',
          border: '2px solid var(--neon-cyan)',
          backgroundColor: isHovering ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999998,
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
        }}
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 1 : 0.5,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.5,
        }}
      /> */}
    </>
  );
}
