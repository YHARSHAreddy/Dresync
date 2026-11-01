import React, { useMemo } from 'react';
import { BodyProfile } from './BodyProfile';
import { ClothingLayer } from './ClothingLayer';
import { Outfit } from '../../types';

interface HumanModelProps {
  profile: BodyProfile;
  modelUrl?: string;
  outfit?: Outfit | null;
}

/**
 * Realistic Athletic Male 3D Mannequin
 * Proportions calibrated to:
 * - Reference Height: 183 cm (6 ft)
 * - Reference Weight: 87 kg
 * - Muscular athletic physique: broad shoulders, defined chest, V-taper waist, six-pack abs, athletic thighs & calves
 * - Natural fair-to-medium warm skin tone (#d4a387)
 * - Clean dark hair (#201c19)
 */
export function HumanModel({ profile, outfit }: HumanModelProps) {
  // Proportional scaling based on profile
  const baseScaleY = profile.heightCm / 183;
  const weightFactor = profile.weightKg / 87;

  const isAthletic = profile.physique === 'athletic';
  const scaleX = weightFactor * (isAthletic ? 1.04 : 1);
  const scaleZ = weightFactor * (isAthletic ? 0.96 : 1);

  // Natural fair-to-medium skin tone (warm, healthy, realistic tone)
  const skinColor = '#d4a387';
  const hairColor = '#1e1b18';

  return (
    <group scale={[scaleX, baseScaleY, scaleZ]} position={[0, -0.95, 0]}>
      {/* ================= HEAD & HAIR ================= */}
      {/* Cranium / Head */}
      <mesh position={[0, 1.76, 0]}>
        <sphereGeometry args={[0.108, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Styled Dark Hair (athletic crew cut) */}
      <mesh position={[0, 1.805, -0.015]} scale={[1.04, 0.92, 1.08]}>
        <sphereGeometry args={[0.104, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color={hairColor} roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Masculine Jaw & Chin */}
      <mesh position={[0, 1.695, 0.025]} scale={[1, 0.9, 1.15]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.605, 0]}>
        <cylinderGeometry args={[0.065, 0.078, 0.13, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Trapezius muscles (connects neck to shoulders) */}
      <mesh position={[0, 1.52, -0.01]} rotation={[0.05, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.22, 0.1, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* ================= TORSO & CHEST ================= */}
      {/* Upper Torso (Broad Pectoral Ribcage) */}
      <mesh position={[0, 1.41, 0]}>
        <cylinderGeometry args={[0.225, 0.185, 0.24, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Defined Left Pectoral */}
      <mesh position={[-0.088, 1.41, 0.088]} rotation={[0.06, 0.12, -0.03]} scale={[1.15, 0.82, 0.55]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.58} metalness={0.05} />
      </mesh>

      {/* Defined Right Pectoral */}
      <mesh position={[0.088, 1.41, 0.088]} rotation={[0.06, -0.12, 0.03]} scale={[1.15, 0.82, 0.55]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.58} metalness={0.05} />
      </mesh>

      {/* Mid Torso (Athletic V-Taper / Latissimus) */}
      <mesh position={[0, 1.23, 0]}>
        <cylinderGeometry args={[0.185, 0.165, 0.18, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Lower Torso / Waist */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.165, 0.175, 0.16, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* ================= SIX-PACK ABS (Integrated Anatomical Contours) ================= */}
      {/* Upper Abs (Left & Right) */}
      <mesh position={[-0.045, 1.28, 0.08]} scale={[1.1, 0.75, 0.45]}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.04} />
      </mesh>
      <mesh position={[0.045, 1.28, 0.08]} scale={[1.1, 0.75, 0.45]}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.04} />
      </mesh>

      {/* Mid Abs (Left & Right) */}
      <mesh position={[-0.042, 1.205, 0.076]} scale={[1.05, 0.75, 0.42]}>
        <sphereGeometry args={[0.036, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.04} />
      </mesh>
      <mesh position={[0.042, 1.205, 0.076]} scale={[1.05, 0.75, 0.42]}>
        <sphereGeometry args={[0.036, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.04} />
      </mesh>

      {/* Lower Abs (Left & Right) */}
      <mesh position={[-0.038, 1.13, 0.072]} scale={[1.0, 0.75, 0.4]}>
        <sphereGeometry args={[0.034, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.04} />
      </mesh>
      <mesh position={[0.038, 1.13, 0.072]} scale={[1.0, 0.75, 0.4]}>
        <sphereGeometry args={[0.034, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.04} />
      </mesh>

      {/* External Obliques (Waist contour) */}
      <mesh position={[-0.135, 1.12, 0.02]} rotation={[0, 0, -0.15]} scale={[0.6, 1.2, 0.8]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>
      <mesh position={[0.135, 1.12, 0.02]} rotation={[0, 0, 0.15]} scale={[0.6, 1.2, 0.8]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Pelvis / Hips */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.175, 0.165, 0.16, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* ================= SHOULDERS & ARMS ================= */}
      {/* Left Deltoid (Shoulder Cap) */}
      <mesh position={[-0.245, 1.45, 0]} scale={[1.15, 1.0, 0.95]}>
        <sphereGeometry args={[0.078, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Upper Arm (Biceps / Triceps) */}
      <mesh position={[-0.27, 1.30, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.065, 0.058, 0.24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Elbow */}
      <mesh position={[-0.282, 1.16, 0]}>
        <sphereGeometry args={[0.052, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Forearm */}
      <mesh position={[-0.288, 1.02, 0.01]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.052, 0.042, 0.24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Hand */}
      <mesh position={[-0.292, 0.87, 0.02]} scale={[0.7, 1.1, 0.5]}>
        <sphereGeometry args={[0.046, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Deltoid (Shoulder Cap) */}
      <mesh position={[0.245, 1.45, 0]} scale={[1.15, 1.0, 0.95]}>
        <sphereGeometry args={[0.078, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Upper Arm (Biceps / Triceps) */}
      <mesh position={[0.27, 1.30, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.065, 0.058, 0.24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Elbow */}
      <mesh position={[0.282, 1.16, 0]}>
        <sphereGeometry args={[0.052, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Forearm */}
      <mesh position={[0.288, 1.02, 0.01]} rotation={[0, 0, -0.06]}>
        <cylinderGeometry args={[0.052, 0.042, 0.24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Hand */}
      <mesh position={[0.292, 0.87, 0.02]} scale={[0.7, 1.1, 0.5]}>
        <sphereGeometry args={[0.046, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* ================= LEGS & FEET ================= */}
      {/* Left Thigh (Muscular Athletic Quadriceps) */}
      <mesh position={[-0.105, 0.69, 0]}>
        <cylinderGeometry args={[0.096, 0.076, 0.40, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Knee */}
      <mesh position={[-0.105, 0.47, 0.01]}>
        <sphereGeometry args={[0.068, 20, 20]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Lower Leg (Calf & Shin) */}
      <mesh position={[-0.105, 0.26, -0.005]}>
        <cylinderGeometry args={[0.068, 0.052, 0.38, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Left Foot */}
      <mesh position={[-0.105, 0.045, 0.035]} scale={[0.9, 0.6, 1.6]}>
        <boxGeometry args={[0.088, 0.07, 0.16]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* Right Thigh (Muscular Athletic Quadriceps) */}
      <mesh position={[0.105, 0.69, 0]}>
        <cylinderGeometry args={[0.096, 0.076, 0.40, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Knee */}
      <mesh position={[0.105, 0.47, 0.01]}>
        <sphereGeometry args={[0.068, 20, 20]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Lower Leg (Calf & Shin) */}
      <mesh position={[0.105, 0.26, -0.005]}>
        <cylinderGeometry args={[0.068, 0.052, 0.38, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Right Foot */}
      <mesh position={[0.105, 0.045, 0.035]} scale={[0.9, 0.6, 1.6]}>
        <boxGeometry args={[0.088, 0.07, 0.16]} />
        <meshStandardMaterial color={skinColor} roughness={0.62} metalness={0.04} />
      </mesh>

      {/* ================= CLOTHING TRY-ON LAYER ================= */}
      <ClothingLayer outfit={outfit} />
    </group>
  );
}
