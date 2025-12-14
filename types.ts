export type Phase = 'tree' | 'blooming' | 'nebula' | 'collapsing';

export type GestureType = 'None' | 'Open_Palm' | 'Closed_Fist';

export interface ParticleData {
  id: number;
  treePos: [number, number, number];
  nebulaPos: [number, number, number];
  color: string;
  size: number;
}

export interface OrnamentData {
  id: number;
  treePos: [number, number, number];
  nebulaPos: [number, number, number];
  type: 'ball' | 'star' | 'snowflake' | 'gift';
  color: string;
  scale: [number, number, number];
  rotation: [number, number, number];
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      instancedMesh: any;
      coneGeometry: any;
      sphereGeometry: any;
      boxGeometry: any;
      dodecahedronGeometry: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      pointLight: any;
      ambientLight: any;
      spotLight: any;
      color: any;
    }
  }
}
