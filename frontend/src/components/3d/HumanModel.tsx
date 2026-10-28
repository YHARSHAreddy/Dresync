import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Group } from 'three';
import { BodyProfile } from './BodyProfile';
import { ClothingLayer } from './ClothingLayer';
import { Outfit } from '../../types';

interface HumanModelProps {
  profile: BodyProfile;
  modelUrl?: string; // Path to realistic male GLTF/GLB
  outfit?: Outfit | null;
}

export function HumanModel({ profile, modelUrl = '/models/human_male.glb', outfit }: HumanModelProps) {
  const group = useRef<Group>(null);
  
  // Attempt to load the model. The parent ErrorBoundary will catch any 404s.
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Only play the animation if it is specifically an idle animation.
    // We don't want to accidentally play a walking animation just because it's the first one.
    const idleAction = actions['idle'] || actions['Idle'];
    if (idleAction) {
      idleAction.play();
    }
  }, [actions]);

  // Dynamically scale based on height and weight.
  // Assuming the base realistic model is around 180cm (1.8 units) and ~75kg proportions.
  const baseScaleY = profile.heightCm / 180;
  const weightFactor = profile.weightKg / 75;
  
  // Make the physique adjustments
  // For 'athletic', we want slightly broader shoulders (X axis scale) relative to Z (depth).
  const isAthletic = profile.physique === 'athletic';
  const scaleX = weightFactor * (isAthletic ? 1.05 : 1);
  const scaleZ = weightFactor * (isAthletic ? 0.95 : 1);

  return (
    <group ref={group} dispose={null}>
      {/* 
        This group acts as the anchor point for the body.
        In the future, ClothingLayer components can be attached as siblings here
        and receive the same scaling.
      */}
      <group scale={[scaleX, baseScaleY, scaleZ]} position={[0, -1, 0]}>
        <primitive object={scene} />
        {/* Render clothing models over the human */}
        <Suspense fallback={null}>
          <ClothingLayer outfit={outfit} />
        </Suspense>
      </group>
    </group>
  );
}

// Preload is skipped here to avoid top-level errors if the file doesn't exist yet
