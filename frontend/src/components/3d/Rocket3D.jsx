import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from '../ui/ErrorBoundary';

/**
 * Frame-rate-independent smooth damp.
 * Returns the interpolation factor adjusted for actual frame delta time.
 * `smoothTime` is in seconds — lower = faster response.
 */
function damp(current, target, smoothTime, delta) {
  // Exponential decay formula for frame-rate independence
  const factor = 1 - Math.exp(-delta / Math.max(smoothTime, 0.0001));
  return THREE.MathUtils.lerp(current, target, factor);
}

/* ── Camera Controller: Scroll-linked zoom ── */
function CameraController({ scrollProgress }) {
  const smoothProgress = useRef(0);

  useFrame(({ camera }, delta) => {
    // Smooth the raw scroll value (smoothTime 0.15s = responsive but silky)
    smoothProgress.current = damp(smoothProgress.current, scrollProgress, 0.15, delta);
    const p = smoothProgress.current;

    // Map scrollProgress to camera zoom phases:
    // 0.0 - 0.2: Idle (camera at default z=10)
    // 0.2 - 0.8: Zoom in (z: 10 → 2.5), slight upward tilt
    // 0.8 - 1.0: Hold close
    const zoomPhase = THREE.MathUtils.clamp((p - 0.2) / 0.6, 0, 1);
    // Eased zoom curve (ease-in-out cubic)
    const easedZoom = zoomPhase < 0.5
      ? 4 * zoomPhase * zoomPhase * zoomPhase
      : 1 - Math.pow(-2 * zoomPhase + 2, 3) / 2;

    const targetZ = THREE.MathUtils.lerp(10, 2.5, easedZoom);
    const targetY = THREE.MathUtils.lerp(0, 1.0, easedZoom);
    // Slight lateral drift during zoom for cinematic feel
    const targetX = Math.sin(easedZoom * Math.PI) * 0.5;

    // Single damp — no double lerp
    camera.position.x = damp(camera.position.x, targetX, 0.12, delta);
    camera.position.y = damp(camera.position.y, targetY, 0.12, delta);
    camera.position.z = damp(camera.position.z, targetZ, 0.12, delta);

    // Always look at the rocket center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Warp Speed Lines ── */
function WarpLines({ scrollProgress }) {
  const count = 150; // Slightly reduced for mobile perf
  const meshRef = useRef();
  const smoothProgress = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 8;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -Math.random() * 30;
      vel[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame((_, delta) => {
    smoothProgress.current = damp(smoothProgress.current, scrollProgress, 0.12, delta);
    const p = smoothProgress.current;

    // Warp lines only active during zoom phase (0.15 - 0.9)
    const warpIntensity = THREE.MathUtils.clamp((p - 0.15) / 0.5, 0, 1) *
                          THREE.MathUtils.clamp((0.9 - p) / 0.1, 0, 1);

    if (!meshRef.current) return;

    // Skip updates when warp is inactive (performance optimization)
    if (warpIntensity < 0.001) {
      meshRef.current.material.opacity = 0;
      return;
    }

    const posAttr = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 2] += velocities[i] * warpIntensity * delta * 40;

      if (posAttr.array[i * 3 + 2] > 5) {
        posAttr.array[i * 3 + 2] = -25 - Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 8;
        posAttr.array[i * 3] = Math.cos(angle) * radius;
        posAttr.array[i * 3 + 1] = Math.sin(angle) * radius;
      }
    }
    posAttr.needsUpdate = true;
    meshRef.current.material.opacity = warpIntensity * 0.6;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00f0ff"
        size={0.06}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Rocket Model ── */
function RocketModel({ scrollProgress = 0 }) {
  const { scene } = useGLTF('/rocket.glb');
  const groupRef = useRef();
  const smoothScroll = useRef(0);

  const basePositionX = 1.5;

  // Modify the 3D model's materials directly from React!
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {

        // CONTOH 1: Mengubah semua warna menjadi merah neon
        // child.material.color = new THREE.Color('#ff0055');

        // CONTOH 2: Menambahkan efek bersinar (Glow/Emissive)
        // child.material.emissive = new THREE.Color('#00f0ff');
        // child.material.emissiveIntensity = 0.5;

        // CONTOH 3: Membuatnya terlihat seperti kerangka garis (Wireframe)
        // child.material.wireframe = true;

        // Default: Kita buat agak metalik agar pantulan cahayanya bagus
        child.material.metalness = 0.8;
        child.material.roughness = 0.2;
      }
    });
  }, [scene]);

  const lastPointer = useRef({ x: 0, y: 0 });
  const idleTime = useRef(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      smoothScroll.current = damp(smoothScroll.current, scrollProgress, 0.15, delta);
      const sp = smoothScroll.current;

      // During zoom phase, gradually pull rocket toward center
      const zoomPhase = THREE.MathUtils.clamp((sp - 0.2) / 0.6, 0, 1);
      const mouseInfluence = 1 - zoomPhase * 0.7;
      const centerPull = zoomPhase;

      // Check for mouse movement
      if (
        Math.abs(state.pointer.x - lastPointer.current.x) > 0.001 ||
        Math.abs(state.pointer.y - lastPointer.current.y) > 0.001
      ) {
        idleTime.current = 0;
        lastPointer.current.x = state.pointer.x;
        lastPointer.current.y = state.pointer.y;
      } else {
        idleTime.current += delta;
      }

      let pointerX = state.pointer.x;
      let pointerY = state.pointer.y;

      // Automatically animate if idle for more than 2 seconds — smooth figure-8 drift
      if (idleTime.current > 2) {
        const time = state.clock.elapsedTime;
        const autoX = Math.sin(time * 0.12) * 0.6;
        const autoY = Math.sin(time * 0.24) * 0.35;
        const blend = Math.min((idleTime.current - 2) * 0.5, 1);
        pointerX = THREE.MathUtils.lerp(pointerX, autoX, blend);
        pointerY = THREE.MathUtils.lerp(pointerY, autoY, blend);
      }

      pointerX *= mouseInfluence;
      pointerY *= mouseInfluence;

      // 1. Rotation — frame-rate independent
      const targetRotationX = (pointerX * Math.PI) / 3;
      const targetRotationY = (pointerY * Math.PI) / 3;

      groupRef.current.rotation.y = damp(groupRef.current.rotation.y, targetRotationX, 0.18, delta);
      groupRef.current.rotation.x = damp(groupRef.current.rotation.x, -targetRotationY, 0.18, delta);

      // 2. Translation — pull toward center during zoom
      const moveRadiusX = THREE.MathUtils.lerp(11, 3, centerPull);
      const moveRadiusY = THREE.MathUtils.lerp(5, 1.5, centerPull);

      const targetBaseX = THREE.MathUtils.lerp(basePositionX, 0, centerPull);
      const targetPosX = targetBaseX + (pointerX * moveRadiusX);
      const targetPosY = (pointerY * moveRadiusY);

      groupRef.current.position.x = damp(groupRef.current.position.x, targetPosX, 0.25, delta);
      groupRef.current.position.y = damp(groupRef.current.position.y, targetPosY, 0.25, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={0.02} />
      </Center>
    </group>
  );
}

// ── Satellite: Orbiting autonomously ──
function SatelliteModel({ scrollProgress = 0 }) {
  const { scene } = useGLTF('/satelit.glb');
  const orbitRef = useRef();
  const meshRef = useRef();
  const smoothScroll = useRef(0);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.metalness = 0.9;
        child.material.roughness = 0.15;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    smoothScroll.current = damp(smoothScroll.current, scrollProgress, 0.15, delta);
    const time = state.clock.elapsedTime;

    const orbitRadiusX = 5.5;
    const orbitRadiusZ = 3.5;
    const orbitSpeed = 0.25;

    if (orbitRef.current) {
      orbitRef.current.position.x = Math.cos(time * orbitSpeed) * orbitRadiusX;
      orbitRef.current.position.z = Math.sin(time * orbitSpeed) * orbitRadiusZ;
      orbitRef.current.position.y = Math.sin(time * 0.4) * 0.8;

      const zoomPhase = THREE.MathUtils.clamp((smoothScroll.current - 0.2) / 0.6, 0, 1);
      orbitRef.current.position.x += zoomPhase * 15;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={orbitRef}>
      <group ref={meshRef}>
        <Center>
          <primitive object={scene} scale={0.003} />
        </Center>
      </group>
    </group>
  );
}

useGLTF.preload('/rocket.glb');
useGLTF.preload('/satelit.glb');

export default function Rocket3D({ scrollProgress = 0 }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative', zIndex: 10 }}>
      {/* 
          eventSource={document.body} allows the Canvas to track mouse movements 
          across the ENTIRE web page, even though the Canvas container has pointerEvents: 'none'
        */}
      <ErrorBoundary fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          dpr={[1, 1.5]}
          eventSource={typeof document !== 'undefined' ? document.body : undefined}
          eventPrefix="client"
        >
          <CameraController scrollProgress={scrollProgress} />

          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 20, 10]} intensity={3} color="#00f0ff" />
          <directionalLight position={[-10, -10, -10]} intensity={2} color="#ff00ff" />
          <Environment preset="city" />

          <Suspense fallback={null}>
            <Float
              speed={2}
              rotationIntensity={0.2}
              floatIntensity={1.5}
              floatingRange={[-0.5, 0.5]}
            >
              <RocketModel scrollProgress={scrollProgress} />
            </Float>

            <SatelliteModel scrollProgress={scrollProgress} />

            <WarpLines scrollProgress={scrollProgress} />

            <ContactShadows
              position={[0, -4, 0]}
              opacity={0.5}
              scale={30}
              blur={3}
              far={10}
              color="#00f0ff"
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
