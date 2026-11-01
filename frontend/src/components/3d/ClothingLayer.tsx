import React, { useState, useEffect } from 'react';
import { Texture, TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three';
import { Outfit } from '../../types';

interface ClothingLayerProps {
  outfit?: Outfit | null;
}

/**
 * Safely loads a garment texture without crashing the Canvas if the image is missing or loading.
 */
function useGarmentTexture(imageUrl?: string): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }

    let isMounted = true;
    const loader = new TextureLoader();

    // Support both relative /uploads/... and full URLs
    const src = imageUrl.startsWith('http') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')
      ? imageUrl
      : imageUrl;

    loader.load(
      src,
      (loaded) => {
        if (!isMounted) return;
        loaded.wrapS = RepeatWrapping;
        loaded.wrapT = RepeatWrapping;
        loaded.colorSpace = SRGBColorSpace;
        loaded.repeat.set(1.5, 1.5);
        setTexture(loaded);
      },
      undefined,
      (err) => {
        console.warn('Garment texture failed to load, falling back to primary color:', imageUrl, err);
        if (isMounted) setTexture(null);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return texture;
}

/**
 * Snug, well-fitted 3D clothing overlay calibrated directly to the athletic male mannequin.
 * Dynamically maps the real fabric photo/texture from the uploaded wardrobe piece onto the 3D meshes.
 */
export function ClothingLayer({ outfit }: ClothingLayerProps) {
  if (!outfit) return null;

  const topColor = outfit.top?.primary_color || '#2d3748';
  const bottomColor = outfit.bottom?.primary_color || '#1a202c';
  const shoesColor = outfit.shoes?.primary_color || '#ffffff';

  const topTexture = useGarmentTexture(outfit.top?.image_url);
  const bottomTexture = useGarmentTexture(outfit.bottom?.image_url);
  const shoesTexture = useGarmentTexture(outfit.shoes?.image_url);

  return (
    <group>
      {/* ================= TOP (Shirt / Jacket) ================= */}
      {outfit.top && (
        <group>
          {/* Main Torso Shirt Body - wraps chest and upper abs cleanly */}
          <mesh position={[0, 1.32, 0.005]}>
            <cylinderGeometry args={[0.245, 0.185, 0.44, 32]} />
            <meshStandardMaterial
              color={topTexture ? '#ffffff' : topColor}
              map={topTexture || undefined}
              roughness={0.78}
              metalness={0.06}
            />
          </mesh>

          {/* Left Sleeve (Shoulder to Upper Arm) */}
          <mesh position={[-0.26, 1.34, 0]} rotation={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.088, 0.076, 0.22, 24]} />
            <meshStandardMaterial
              color={topTexture ? '#ffffff' : topColor}
              map={topTexture || undefined}
              roughness={0.78}
              metalness={0.06}
            />
          </mesh>

          {/* Right Sleeve (Shoulder to Upper Arm) */}
          <mesh position={[0.26, 1.34, 0]} rotation={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.088, 0.076, 0.22, 24]} />
            <meshStandardMaterial
              color={topTexture ? '#ffffff' : topColor}
              map={topTexture || undefined}
              roughness={0.78}
              metalness={0.06}
            />
          </mesh>

          {/* Collar Accent */}
          <mesh position={[0, 1.545, 0.015]} rotation={[0.08, 0, 0]}>
            <torusGeometry args={[0.085, 0.014, 16, 32]} />
            <meshStandardMaterial
              color={topColor}
              roughness={0.8}
            />
          </mesh>
        </group>
      )}

      {/* ================= BOTTOM (Pants / Trousers) ================= */}
      {outfit.bottom && (
        <group>
          {/* Waistband / Pelvis */}
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.188, 0.178, 0.18, 32]} />
            <meshStandardMaterial
              color={bottomTexture ? '#ffffff' : bottomColor}
              map={bottomTexture || undefined}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>

          {/* Left Pant Leg (Thigh through Ankle) */}
          <mesh position={[-0.105, 0.48, 0]}>
            <cylinderGeometry args={[0.108, 0.072, 0.84, 24]} />
            <meshStandardMaterial
              color={bottomTexture ? '#ffffff' : bottomColor}
              map={bottomTexture || undefined}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>

          {/* Right Pant Leg (Thigh through Ankle) */}
          <mesh position={[0.105, 0.48, 0]}>
            <cylinderGeometry args={[0.108, 0.072, 0.84, 24]} />
            <meshStandardMaterial
              color={bottomTexture ? '#ffffff' : bottomColor}
              map={bottomTexture || undefined}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>
        </group>
      )}

      {/* ================= SHOES ================= */}
      {outfit.shoes && (
        <group>
          {/* Left Shoe */}
          <mesh position={[-0.105, 0.045, 0.04]} scale={[1, 0.72, 1.7]}>
            <boxGeometry args={[0.105, 0.082, 0.165]} />
            <meshStandardMaterial
              color={shoesTexture ? '#ffffff' : shoesColor}
              map={shoesTexture || undefined}
              roughness={0.4}
              metalness={0.12}
            />
          </mesh>

          {/* Right Shoe */}
          <mesh position={[0.105, 0.045, 0.04]} scale={[1, 0.72, 1.7]}>
            <boxGeometry args={[0.105, 0.082, 0.165]} />
            <meshStandardMaterial
              color={shoesTexture ? '#ffffff' : shoesColor}
              map={shoesTexture || undefined}
              roughness={0.4}
              metalness={0.12}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
