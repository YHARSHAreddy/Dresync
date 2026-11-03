import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { HumanModel } from '../3d/HumanModel';
import { defaultMaleProfile } from '../3d/BodyProfile';
import { Outfit } from '../../types';

interface MannequinViewerProps {
  outfit?: Outfit | null;
}

export function MannequinViewer({ outfit }: MannequinViewerProps) {
  // Use the standardized athletic male profile (183cm, 87kg, athletic)
  const profile = defaultMaleProfile;

  return (
    <div className="w-full h-full min-h-[500px] bg-surface-container-low rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-outline-variant/30 shadow-md">
      <div className="absolute top-4 left-4 z-10 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/30 text-label-caps font-label-caps text-primary flex items-center gap-2">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>3d_rotation</span>
        Interactive Stylist Model
      </div>

      <Canvas camera={{ position: [0, 0.0, 2.7], fov: 42 }} shadows>
        {/* Studio Lighting */}
        <ambientLight intensity={0.5} />
        <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#333333" />
        {/* Key Light */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Fill Light */}
        <directionalLight position={[-4, 4, -3]} intensity={0.6} />
        {/* Muscular Definition Rim Light */}
        <pointLight position={[0, 1.2, -2.5]} intensity={1.5} color="#cce4ff" />

        <Suspense fallback={null}>
          <HumanModel profile={profile} outfit={outfit} />
        </Suspense>

        <Environment preset="studio" />

        <ContactShadows
          position={[0, -0.99, 0]}
          opacity={0.65}
          scale={5}
          blur={1.6}
          far={3.5}
        />

        <OrbitControls
          target={[0, 0.0, 0]}
          enablePan={false}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={1.4}
          maxDistance={4.8}
          minPolarAngle={Math.PI / 4.5}
          maxPolarAngle={Math.PI / 1.7}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}
