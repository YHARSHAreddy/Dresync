export interface BodyProfile {
  gender: 'male' | 'female' | 'unisex';
  heightCm: number;
  weightKg: number;
  physique: 'athletic' | 'slim' | 'average' | 'muscular' | 'curvy';
}

export const defaultMaleProfile: BodyProfile = {
  gender: 'male',
  heightCm: 183,
  weightKg: 87,
  physique: 'athletic',
};
