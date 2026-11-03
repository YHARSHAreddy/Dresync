import React, { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import {
  Mesh,
  SkinnedMesh,
  MeshStandardMaterial,
  DoubleSide,
  Color,
  BufferAttribute,
  CanvasTexture,
  RepeatWrapping,
} from 'three';
import { BodyProfile } from './BodyProfile';
import { Outfit } from '../../types';
import { mannequinMeshGroups } from './mannequinMeshGroups';

interface HumanModelProps {
  profile: BodyProfile;
  modelUrl?: string;
  outfit?: Outfit | null;
}

/**
 * Curated fashion palette to ensure garments render with rich, stylish, vibrant tones.
 */
const FASHION_PALETTE: Record<string, string> = {
  orange: '#e65c00', // Rich warm hoodie orange (Allen Solly)
  blue: '#234975',   // Deep indigo denim blue (Levi's)
  'dark blue': '#1c3554',
  navy: '#16253d',
  black: '#1a1a1d',
  charcoal: '#2e3035',
  white: '#f5f5f7',
  offwhite: '#ebe6df',
  grey: '#5c6069',
  gray: '#5c6069',
  lightgrey: '#9a9ea7',
  red: '#b82828',
  burgundy: '#661625',
  green: '#2d634f',
  olive: '#4e5b31',
  beige: '#c2a884',
  khaki: '#a38f6b',
  brown: '#634125',
  yellow: '#d99b26',
  purple: '#5e3575',
  pink: '#cf5d85',
};

function resolveFashionColor(colorInput?: string, defaultHex = '#234975'): string {
  if (!colorInput) return defaultHex;
  const clean = colorInput.trim().toLowerCase();
  if (FASHION_PALETTE[clean]) return FASHION_PALETTE[clean];
  try {
    const c = new Color(clean);
    return `#${c.getHexString()}`;
  } catch {
    return defaultHex;
  }
}

/**
 * Generates procedural micro-fabric tactile bump maps for realistic cloth texture.
 */
function createFabricBumpTexture(type: 'cotton' | 'denim'): CanvasTexture {
  if (typeof document === 'undefined') return new CanvasTexture(null as any);
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new CanvasTexture(canvas);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 64, 64);

  if (type === 'cotton') {
    // Micro-knit cotton fabric weave for hoodies and shirts
    for (let x = 0; x < 64; x += 2) {
      for (let y = 0; y < 64; y += 2) {
        const val = 120 + Math.floor(Math.sin(x * 0.5) * Math.cos(y * 0.5) * 15 + 10);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  } else {
    // Diagonal twill denim weave for jeans and trousers
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const diag = (x + y * 2) % 4;
        const val = diag === 0 ? 150 : diag === 2 ? 100 : 125;
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(type === 'cotton' ? 24 : 28, type === 'cotton' ? 24 : 28);
  return texture;
}

/**
 * Realistic Athletic Male 3D Human Model with Seamless Virtual Try-On
 * - Natural athletic physique with defined chest, abs, and muscular proportions
 * - Sleek, smooth fair-to-medium skin tone (#cfa285) with studio PBR finish
 * - Modern athletic boxer briefs (#363942) when no bottom is selected
 * - Flawless submesh group clothing try-on for Top (hoodie/shirt), Bottom (jeans/trousers), and Shoes
 * - Fully grounded on contact shadow, centered at [0, 0, 0], and rotatable in 360 degrees
 */
export function HumanModel({ profile, outfit }: HumanModelProps) {
  const { scene } = useGLTF('/models/male_base_mesh.glb');

  // Realistic procedural bump textures
  const cottonBump = useMemo(() => createFabricBumpTexture('cotton'), []);
  const denimBump = useMemo(() => createFabricBumpTexture('denim'), []);

  // 1. Sleek Studio Skin Material (Head, face, hands, and bare muscular body when unclad)
  const skinMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#cfa285',
        roughness: 0.52,
        metalness: 0.04,
        side: DoubleSide,
      }),
    []
  );

  // 2. Athletic Boxer Briefs Material (Rendered on pelvis when no pants are selected)
  const underwearMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#363942',
        roughness: 0.70,
        metalness: 0.05,
        side: DoubleSide,
      }),
    []
  );

  // 3. Top Garment Material (Hoodie / Shirt / Jacket)
  const topColor = resolveFashionColor(outfit?.top?.primary_color, '#e65c00');
  const topMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: topColor,
      roughness: 0.72,
      metalness: 0.04,
      bumpMap: cottonBump,
      bumpScale: 0.012,
      side: DoubleSide,
    });
  }, [topColor, cottonBump]);

  // 4. Bottom Garment Material (Jeans / Trousers / Pants)
  const bottomColor = resolveFashionColor(outfit?.bottom?.primary_color, '#234975');
  const bottomMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: bottomColor,
      roughness: 0.85,
      metalness: 0.04,
      bumpMap: denimBump,
      bumpScale: 0.016,
      side: DoubleSide,
    });
  }, [bottomColor, denimBump]);

  // 5. Shoes Material
  const shoesColor = resolveFashionColor(outfit?.shoes?.primary_color, '#1a1a1d');
  const shoesMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: shoesColor,
      roughness: 0.38,
      metalness: 0.10,
      side: DoubleSide,
    });
  }, [shoesColor]);

  // Determine active materials for each group based on outfit state
  const activeSkinMaterial = skinMaterial;
  const activeTopMaterial = outfit?.top ? topMaterial : skinMaterial;
  const activeShortsMaterial = outfit?.bottom ? bottomMaterial : underwearMaterial;
  const activeLowerLegsMaterial = outfit?.bottom ? bottomMaterial : skinMaterial;
  const activeShoesMaterial = outfit?.shoes ? shoesMaterial : skinMaterial;

  // Clone scene with skeleton intact and configure material groups
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);

    const totalIndices =
      mannequinMeshGroups.skin.length +
      mannequinMeshGroups.top.length +
      mannequinMeshGroups.shorts.length +
      mannequinMeshGroups.lowerLegs.length +
      mannequinMeshGroups.feet.length;

    const reorderedIndices = new Uint16Array(totalIndices);
    let offset = 0;

    reorderedIndices.set(mannequinMeshGroups.skin, offset);
    const skinOffset = offset;
    offset += mannequinMeshGroups.skin.length;

    reorderedIndices.set(mannequinMeshGroups.top, offset);
    const topOffset = offset;
    offset += mannequinMeshGroups.top.length;

    reorderedIndices.set(mannequinMeshGroups.shorts, offset);
    const shortsOffset = offset;
    offset += mannequinMeshGroups.shorts.length;

    reorderedIndices.set(mannequinMeshGroups.lowerLegs, offset);
    const lowerLegsOffset = offset;
    offset += mannequinMeshGroups.lowerLegs.length;

    reorderedIndices.set(mannequinMeshGroups.feet, offset);
    const feetOffset = offset;
    offset += mannequinMeshGroups.feet.length;

    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as SkinnedMesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Clone geometry to safely assign partition groups
        const geom = mesh.geometry.clone();
        geom.setIndex(new BufferAttribute(reorderedIndices, 1));
        geom.clearGroups();

        // Material 0: Skin (Head + Hands)
        geom.addGroup(skinOffset, mannequinMeshGroups.skin.length, 0);

        // Material 1: Top (Torso + Arms)
        geom.addGroup(topOffset, mannequinMeshGroups.top.length, 1);

        // Material 2: Pelvis / Shorts (Waist & Boxer area)
        geom.addGroup(shortsOffset, mannequinMeshGroups.shorts.length, 2);

        // Material 3: Lower Legs (Thigh through Ankle)
        geom.addGroup(lowerLegsOffset, mannequinMeshGroups.lowerLegs.length, 3);

        // Material 4: Feet (Shoes or skin)
        geom.addGroup(feetOffset, mannequinMeshGroups.feet.length, 4);

        mesh.geometry = geom;
        mesh.material = [
          activeSkinMaterial,
          activeTopMaterial,
          activeShortsMaterial,
          activeLowerLegsMaterial,
          activeShoesMaterial,
        ];
      }
    });

    return clone;
  }, [scene]);

  // Keep materials updated whenever outfit changes
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        (child as Mesh).material = [
          activeSkinMaterial,
          activeTopMaterial,
          activeShortsMaterial,
          activeLowerLegsMaterial,
          activeShoesMaterial,
        ];
      }
    });
  }, [
    clonedScene,
    activeSkinMaterial,
    activeTopMaterial,
    activeShortsMaterial,
    activeLowerLegsMaterial,
    activeShoesMaterial,
  ]);

  // Proportional scaling based on profile (Reference: 183cm, 87kg athletic)
  const baseScaleY = profile.heightCm / 183;
  const weightFactor = profile.weightKg / 87;
  const isAthletic = profile.physique === 'athletic';
  const scaleX = weightFactor * (isAthletic ? 1.04 : 1);
  const scaleZ = weightFactor * (isAthletic ? 0.98 : 1);

  return (
    <group scale={[scaleX, baseScaleY, scaleZ]}>
      {/* Positioned at origin [0, 0, 0] and rotated -PI/2 so the model faces forward towards the user */}
      <group position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload('/models/male_base_mesh.glb');
