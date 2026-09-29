import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { HumanModel } from '../3d/HumanModel';
import { BodyProfile, defaultMaleProfile } from '../3d/BodyProfile';

// If the realistic GLTF model is not found at /models/human_male.glb, this fallback is used.
function FallbackMannequin({ profile }: { profile: BodyProfile }) {
  const baseScaleY = profile.heightCm / 180;
  const weightFactor = profile.weightKg / 75;
  const isAthletic = profile.physique === 'athletic';
  const scaleX = weightFactor * (isAthletic ? 1.05 : 1);
  const scaleZ = weightFactor * (isAthletic ? 0.95 : 1);

  return (
    <group position={[0, -1, 0]} scale={[scaleX, baseScaleY, scaleZ]}>
      {/* Torso - athletic build */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.7, 32]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
      {/* Chest / Shoulders */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.25]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.12, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.9, 16]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
      <mesh position={[0.12, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.9, 16]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.35, 1.1, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.05, 0.04, 0.7, 16]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
      <mesh position={[0.35, 1.1, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.05, 0.04, 0.7, 16]} />
        <meshStandardMaterial color="#d4c5b9" roughness={0.5} />
      </mesh>
    </group>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Realistic 3D model could not be loaded. Ensure the GLTF model is placed at /models/human_male.glb. Falling back to basic representation.", error);
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export function MannequinViewer() {
  // Pass the user's specific body profile
  // This could later come from a global state or API
  const profile = defaultMaleProfile;

  return (
    <div className="w-full h-full min-h-[500px] bg-surface-container-low rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-outline-variant/30 shadow-md">
      <div className="absolute top-4 left-4 z-10 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/30 text-label-caps font-label-caps text-primary flex items-center gap-2">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>3d_rotation</span>
        Interactive Stylist Model
      </div>

      <Canvas camera={{ position: [0, 1, 3.5], fov: 40 }} shadows>
        {/* Professional Studio Lighting */}
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#444444" />
        {/* Key light */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Fill light */}
        <directionalLight position={[-5, 5, -5]} intensity={0.6} />
        {/* Rim light for definition */}
        <pointLight position={[0, 2, -3]} intensity={2} color="#aaccff" />

        <ErrorBoundary fallback={<FallbackMannequin profile={profile} />}>
          <Suspense fallback={null}>
            <HumanModel profile={profile} modelUrl="/models/human_male.glb" />
          </Suspense>
        </ErrorBoundary>

        <Environment preset="studio" />

        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.6}
          scale={5}
          blur={1.5}
          far={4}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.6}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}
