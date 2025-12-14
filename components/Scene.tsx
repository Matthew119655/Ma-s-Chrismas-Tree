import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ChristmasTree } from './ChristmasTree';
import { useStore } from '../store';

export const Scene: React.FC = () => {
  const { phase } = useStore();

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 25], fov: 50 }}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
      className="bg-black"
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#ffaa00" intensity={20} distance={50} decay={2} /> {/* Warm */}
      <pointLight position={[-10, 5, -10]} color="#4455ff" intensity={5} distance={50} decay={2} /> {/* Cool */}
      <spotLight 
        position={[0, 30, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={50} 
        color="#fff" 
        castShadow 
      />

      {/* Environment */}
      <Environment preset="city" blur={0.8} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Content */}
      <ChristmasTree />

      {/* Controls - Limit orbit in tree mode, free in nebula */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 2}
        minDistance={10}
        maxDistance={40}
        autoRotate={phase === 'tree'}
        autoRotateSpeed={0.5}
      />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.9} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
