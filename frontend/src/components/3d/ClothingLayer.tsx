import React from 'react';
import { Outfit } from '../../types';

interface ClothingLayerProps {
  outfit?: Outfit | null;
}

/**
 * ClothingLayer is maintained as an empty overlay hook.
 * Clothing materials are now mapped directly onto the anatomical submesh components
 * of male_base_mesh.glb for flawless, tailored virtual try-on with zero cylinder artifacts.
 */
export function ClothingLayer(_props: ClothingLayerProps) {
  return null;
}
