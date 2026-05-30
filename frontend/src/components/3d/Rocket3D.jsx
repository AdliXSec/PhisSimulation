import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';

function RocketModel(props) {
  const { scene } = useGLTF('/rocket.glb');
  const groupRef = useRef();

  // Default starting position (slightly to the right so it doesn't block text too much)
  const basePositionX = 1.5;

  // Modify the 3D model's materials directly from React!
  useEffect(() => {
    scene.traverse((child) => {
      // Find all 3D objects that are actual Meshes (shapes)
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

      // Automatically animate if idle for more than 2 seconds
      if (idleTime.current > 2) {
        const time = state.clock.elapsedTime;
        // Kombinasi beberapa gelombang sinus (harmonisasi) untuk pergerakan pseudo-random (tidak berulang persis)
        const autoX = (Math.sin(time * 0.35) + Math.sin(time * 0.55 + 2) + Math.sin(time * 0.85 + 4.5)) / 2.5; 
        const autoY = (Math.sin(time * 0.45) + Math.sin(time * 0.65 + 1) + Math.sin(time * 0.95 + 3.5)) / 2.5;
        
        // Smoothly blend to auto movement over 2 seconds
        const blend = Math.min((idleTime.current - 2) * 0.5, 1);
        pointerX = THREE.MathUtils.lerp(pointerX, autoX, blend);
        pointerY = THREE.MathUtils.lerp(pointerY, autoY, blend);
      }

      // 1. Rotation logic
      const targetRotationX = (pointerX * Math.PI) / 3;
      const targetRotationY = (pointerY * Math.PI) / 3;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetRotationY, 0.05);

      // 2. Translation logic
      const moveRadiusX = 11; // Increased to allow moving further to the left
      const moveRadiusY = 5;

      const targetPosX = basePositionX + (pointerX * moveRadiusX);
      const targetPosY = (pointerY * moveRadiusY);

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.02);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.02);
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <Center>
        <primitive object={scene} scale={0.045} />
      </Center>
    </group>
  );
}

useGLTF.preload('/rocket.glb');

export default function Rocket3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative', zIndex: 10 }}>
      {/* 
        eventSource={document.body} allows the Canvas to track mouse movements 
        across the ENTIRE web page, even though the Canvas container has pointerEvents: 'none'
      */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
      >
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
            <RocketModel />
          </Float>

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
    </div>
  );
}
