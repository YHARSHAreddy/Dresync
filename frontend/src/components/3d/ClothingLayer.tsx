import React from 'react';
import { Outfit } from '../../types';

interface ClothingLayerProps {
  outfit?: Outfit | null;
}

export function ClothingLayer({ outfit }: ClothingLayerProps) {
  if (!outfit) return null;

  // Since we don't have actual 3D files for every piece of clothing yet,
  // we use dynamic geometry colored with the item's primary color to represent VTO.
  // When real .glb files are available, this component can use useGLTF to load them instead.

  return (
    <group>
      {/* Render Top */}
      {outfit.top && (
        <group position={[0, 1.35, 0]}>
          <mesh>
            {/* A cylinder that acts like a shirt around the torso */}
            <cylinderGeometry args={[0.26, 0.22, 0.65, 32]} />
            <meshStandardMaterial 
              color={outfit.top.primary_color || '#333333'} 
              roughness={0.8}
              transparent
              opacity={0.95} 
            />
          </mesh>
          {/* Sleeves */}
          <mesh position={[-0.3, 0.15, 0]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.08, 0.07, 0.3, 16]} />
            <meshStandardMaterial color={outfit.top.primary_color || '#333333'} />
          </mesh>
          <mesh position={[0.3, 0.15, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.08, 0.07, 0.3, 16]} />
            <meshStandardMaterial color={outfit.top.primary_color || '#333333'} />
          </mesh>
        </group>
      )}

      {/* Render Bottom (Pants) */}
      {outfit.bottom && (
        <group position={[0, 0.45, 0]}>
          {/* Left leg */}
          <mesh position={[-0.12, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.07, 0.9, 16]} />
            <meshStandardMaterial color={outfit.bottom.primary_color || '#1a365d'} />
          </mesh>
          {/* Right leg */}
          <mesh position={[0.12, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.07, 0.9, 16]} />
            <meshStandardMaterial color={outfit.bottom.primary_color || '#1a365d'} />
          </mesh>
          {/* Waist / Pelvis area */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.35, 0.2, 0.2]} />
            <meshStandardMaterial color={outfit.bottom.primary_color || '#1a365d'} />
          </mesh>
        </group>
      )}

      {/* Render Shoes */}
      {outfit.shoes && (
        <group position={[0, -0.05, 0]}>
          <mesh position={[-0.12, 0, 0.05]}>
            <boxGeometry args={[0.1, 0.1, 0.25]} />
            <meshStandardMaterial color={outfit.shoes.primary_color || '#ffffff'} />
          </mesh>
          <mesh position={[0.12, 0, 0.05]}>
            <boxGeometry args={[0.1, 0.1, 0.25]} />
            <meshStandardMaterial color={outfit.shoes.primary_color || '#ffffff'} />
          </mesh>
        </group>
      )}
    </group>
  );
}
