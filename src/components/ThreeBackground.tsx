import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 1. Awwwards-Grade Scroll-Linked Spatial Rig with Smooth Damping
const CameraRig: React.FC = () => {
  const { camera, pointer } = useThree();
  const scrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const current = window.scrollY / maxScroll;
      scrollVelocityRef.current = Math.abs(current - lastScrollY.current) * 10;
      lastScrollY.current = current;
      scrollYRef.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((_state, _delta) => {
    // Decay scroll velocity
    scrollVelocityRef.current = THREE.MathUtils.lerp(scrollVelocityRef.current, 0, 0.05);

    // Cinematic camera lerp (Apple Keynote / Awwwards standard)
    const targetX = pointer.x * 0.26;
    const targetY = pointer.y * 0.18 - scrollYRef.current * 1.35;
    const targetZ = 5.6 + scrollYRef.current * 1.4;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
    camera.lookAt(0, -scrollYRef.current * 0.7, -1.0);
  });

  return null;
};

// 2. Beyond-Fortune-500 3D Spatial Model (Defined Specular Contours, Zero Wire Clutter)
const SpatialNexus: React.FC = () => {
  const knotRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const orbit1Ref = useRef<THREE.Group>(null!);
  const orbit2Ref = useRef<THREE.Group>(null!);
  const beacon1Ref = useRef<THREE.Mesh>(null!);
  const beacon2Ref = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const { pointer } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Harmonic rotation of the defined 3D model
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.06;
      knotRef.current.rotation.y = t * 0.08;
      knotRef.current.rotation.z = Math.sin(t * 0.04) * 0.07;
    }
    if (haloRef.current) {
      haloRef.current.rotation.x = t * 0.06;
      haloRef.current.rotation.y = t * 0.08;
      haloRef.current.rotation.z = Math.sin(t * 0.04) * 0.07;
    }

    // Concentric orbital consensus tracks
    if (orbit1Ref.current) {
      orbit1Ref.current.rotation.x = Math.PI / 3.4 + Math.sin(t * 0.07) * 0.05;
      orbit1Ref.current.rotation.y = t * 0.085;
    }
    if (orbit2Ref.current) {
      orbit2Ref.current.rotation.x = -Math.PI / 3.8 + Math.cos(t * 0.06) * 0.05;
      orbit2Ref.current.rotation.z = -t * 0.075;
    }

    // Travelling consensus beacon pulses
    if (beacon1Ref.current) {
      const angle1 = t * 0.35;
      beacon1Ref.current.position.set(Math.cos(angle1) * 3.15, Math.sin(angle1) * 3.15, 0);
    }
    if (beacon2Ref.current) {
      const angle2 = -t * 0.28 + Math.PI;
      beacon2Ref.current.position.set(Math.cos(angle2) * 3.65, Math.sin(angle2) * 3.65, 0);
    }

    // Smooth ambient cursor spotlight
    if (lightRef.current) {
      lightRef.current.position.x = pointer.x * 4.2;
      lightRef.current.position.y = pointer.y * 3.6;
    }
  });

  return (
    <group position={[0, -0.15, -2.4]}>
      {/* Front Dynamic Cursor Key Light */}
      <pointLight ref={lightRef} position={[0, 0, 4.2]} intensity={9} color="#38bdf8" distance={13} />
      
      {/* Rear Silhouette Rim Light — Adds Crisp Architectural Definition Without Wireframes */}
      <directionalLight position={[0, 4, -4.5]} intensity={9} color="#38bdf8" />
      <directionalLight position={[-4, -3, -3]} intensity={5} color="#818cf8" />

      {/* Atmospheric Secondary Fill Lights */}
      <pointLight position={[-6, 4, -2]} intensity={5.5} color="#6366f1" distance={15} />
      <pointLight position={[6, -4, -2]} intensity={4.5} color="#10b981" distance={15} />

      {/* Floating 3D Core Model */}
      <Float speed={0.95} rotationIntensity={0.2} floatIntensity={0.32}>
        {/* Defined Solid Obsidian/Cyan Physical Torus Knot */}
        <mesh ref={knotRef} scale={1.22}>
          <torusKnotGeometry args={[1.3, 0.32, 160, 32, 2, 3]} />
          <meshPhysicalMaterial
            color="#041421"
            emissive="#02659e"
            emissiveIntensity={0.22}
            roughness={0.12}
            metalness={0.92}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
            transparent
            opacity={0.42}
          />
        </mesh>

        {/* Delicate Translucent Silhouette Halo (Provides Edge Definition) */}
        <mesh ref={haloRef} scale={1.226}>
          <torusKnotGeometry args={[1.3, 0.32, 90, 24, 2, 3]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.2}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
      </Float>

      {/* Inner Subdued Core Pulsar (Soft Cyan Light Anchor) */}
      <mesh scale={0.62}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#0369a1"
          emissive="#0284c7"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Architectural Consensus Ring 1 with Travelling Pulse */}
      <group ref={orbit1Ref}>
        <mesh scale={3.15}>
          <torusGeometry args={[1, 0.004, 16, 140]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} />
        </mesh>
        <mesh ref={beacon1Ref}>
          <sphereGeometry args={[0.042, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Architectural Consensus Ring 2 with Travelling Pulse */}
      <group ref={orbit2Ref}>
        <mesh scale={3.65}>
          <torusGeometry args={[1, 0.0035, 16, 140]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.14} />
        </mesh>
        <mesh ref={beacon2Ref}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// 3. Gentle Ambient Star Dust (Subtle Spatial Motes)
const SpatialDust: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const [positions] = React.useState(() => {
    const count = 100;
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * 22;
      coords[i * 3 + 1] = (Math.random() - 0.5) * 16;
      coords[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2.0;
    }
    return coords;
  });

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
      pointsRef.current.rotation.x += delta * 0.004;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#7dd3fc"
        size={0.026}
        sizeAttenuation
        depthWrite={false}
        opacity={0.25}
      />
    </Points>
  );
};

export const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden bg-[#030305]">
      {/* Resend Top Horizon Glow */}
      <div className="absolute -top-[190px] left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-cyan-500/14 via-indigo-500/06 to-transparent rounded-full blur-[130px] opacity-75" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[22%] h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[1px]" />

      {/* R3F 3D Canvas with Atmospheric Fog & Defined Spatial Model */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5.6], fov: 52 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <fog attach="fog" args={['#030305', 3.8, 10.5]} />
          <ambientLight intensity={0.35} />
          <CameraRig />
          <SpatialNexus />
          <SpatialDust />
        </Canvas>
      </div>

      {/* Optical Contrast Shield directly behind foreground typography */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 720px 440px at 50% 28%, rgba(3, 3, 5, 0.65) 0%, transparent 100%)'
        }}
      />

      {/* Ambient Color Wells */}
      <div className="absolute top-[40%] -left-[260px] w-[550px] h-[550px] rounded-full bg-cyan-950/15 blur-[180px]" />
      <div className="absolute top-[70%] -right-[260px] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[200px]" />
      <div className="absolute -bottom-[160px] left-1/4 w-[750px] h-[450px] rounded-full bg-emerald-950/10 blur-[200px]" />

      {/* Tactile Micro-Grain Noise */}
      <div className="absolute inset-0 bg-grain opacity-35 mix-blend-overlay" />

      {/* Deep Space Radial Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, transparent 50%, rgba(3, 3, 5, 0.92) 100%)'
        }}
      />
    </div>
  );
};
