import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { generateParticles, generateOrnaments } from '../utils/geometry';
import gsap from 'gsap';
import { Sparkles, Float } from '@react-three/drei';

const DUMMY_OBJ = new THREE.Object3D();

export const ChristmasTree: React.FC = () => {
  const { phase, setPhase, gesture } = useStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const ballsRef = useRef<THREE.InstancedMesh>(null);
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  
  const groupRef = useRef<THREE.Group>(null);

  // Data Generation
  const particles = useMemo(() => generateParticles(), []);
  const allOrnaments = useMemo(() => generateOrnaments(), []);

  const { balls, gifts } = useMemo(() => {
    return {
      balls: allOrnaments.filter(o => o.type === 'ball'),
      gifts: allOrnaments.filter(o => o.type === 'gift')
    };
  }, [allOrnaments]);

  const animState = useRef({ progress: 0 }); 
  const [photoOpacity, setPhotoOpacity] = useState(0);
  const { pointer } = useThree();

  // Handle Phases
  useEffect(() => {
    if (gesture === 'Open_Palm' && phase === 'tree') {
      setPhase('blooming');
    }
    if (gesture === 'Closed_Fist' && phase === 'nebula') {
      setPhase('collapsing');
    }
  }, [gesture, phase, setPhase]);

  // Transitions
  useEffect(() => {
    if (phase === 'blooming') {
      gsap.to(animState.current, {
        progress: 1,
        duration: 2.5,
        ease: 'power3.inOut',
        onComplete: () => {
          setPhase('nebula');
          setPhotoOpacity(1);
        },
      });
    } else if (phase === 'collapsing') {
      setPhotoOpacity(0);
      gsap.to(animState.current, {
        progress: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => setPhase('tree'),
      });
    }
  }, [phase, setPhase]);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = animState.current.progress;

    // --- Particles (Needles) Update ---
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const treePos = new THREE.Vector3(...p.treePos);
      const nebulaPos = new THREE.Vector3(...p.nebulaPos);

      const currentPos = treePos.lerp(nebulaPos, progress);

      // Mouse Repulsion
      const mouseVec = new THREE.Vector3(pointer.x * 10, pointer.y * 10, 0);
      const dist = currentPos.distanceTo(mouseVec);
      
      if (dist < 3 && progress < 0.8) {
        const repelForce = (3 - dist) * 1.5;
        const dir = currentPos.clone().sub(mouseVec).normalize();
        currentPos.add(dir.multiplyScalar(repelForce));
      }

      currentPos.y += Math.sin(time * 0.5 + i * 0.1) * 0.05;

      DUMMY_OBJ.position.copy(currentPos);
      const scale = p.size * (1 - progress * 0.3);
      DUMMY_OBJ.scale.set(scale, scale, scale);
      
      // Needles look slightly up
      DUMMY_OBJ.rotation.set(-0.2, 0, 0); 
      
      DUMMY_OBJ.updateMatrix();
      meshRef.current.setMatrixAt(i, DUMMY_OBJ.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(p.color));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // --- Ornaments Update Helper ---
    const updateOrnaments = (items: typeof balls, ref: React.RefObject<THREE.InstancedMesh>) => {
        if (!ref.current) return;
        for (let i = 0; i < items.length; i++) {
            const o = items[i];
            const treePos = new THREE.Vector3(...o.treePos);
            const nebulaPos = new THREE.Vector3(...o.nebulaPos);

            const currentPos = treePos.lerp(nebulaPos, progress);
            
            // Nebula swirl
            if (progress > 0.8) {
                const angle = time * 0.1;
                const x = currentPos.x * Math.cos(angle) - currentPos.z * Math.sin(angle);
                const z = currentPos.x * Math.sin(angle) + currentPos.z * Math.cos(angle);
                currentPos.x = x;
                currentPos.z = z;
            }

            DUMMY_OBJ.position.copy(currentPos);
            
            // Apply unique scale from data
            DUMMY_OBJ.scale.set(...o.scale);
            
            // Apply unique rotation from data + animation
            // In tree mode: static random rotation. In nebula: slow spin.
            DUMMY_OBJ.rotation.set(
                o.rotation[0] + time * 0.2, 
                o.rotation[1] + time * 0.3, 
                o.rotation[2]
            );
            
            DUMMY_OBJ.updateMatrix();
            ref.current.setMatrixAt(i, DUMMY_OBJ.matrix);
            ref.current.setColorAt(i, new THREE.Color(o.color));
        }
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    };

    updateOrnaments(balls, ballsRef);
    updateOrnaments(gifts, giftsRef);

    // Group Rotation
    if (phase === 'nebula') {
       groupRef.current.rotation.y += 0.001;
       if (gesture === 'Open_Palm') {
           groupRef.current.rotation.y += pointer.x * 0.05;
       }
    } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Particles (Needles) - PBR Pine Material */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial 
            color="#1C4E33" /* Deep Pine Green */
            roughness={0.7} 
            metalness={0.1}
            flatShading={true}
        />
      </instancedMesh>

      {/* Ornament Balls */}
      <instancedMesh ref={ballsRef} args={[undefined, undefined, balls.length]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.15} 
            metalness={0.9} 
            envMapIntensity={1.2}
        />
      </instancedMesh>

      {/* Ornament Gifts (Boxes) */}
      <instancedMesh ref={giftsRef} args={[undefined, undefined, gifts.length]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} /> 
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.6}
            envMapIntensity={1}
        />
      </instancedMesh>

      {/* Star at Top */}
      <mesh position={[0, 9.5, 0]} scale={animState.current.progress > 0.5 ? 0 : 1}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={4}
            toneMapped={false}
        />
        <pointLight intensity={20} distance={10} color="#FFD700" />
      </mesh>

      <Sparkles count={200} scale={20} size={4} speed={0.4} opacity={0.5} color="#FFF" />
      <PhotoWall opacity={photoOpacity} radius={20} />
    </group>
  );
};

const PhotoWall: React.FC<{ opacity: number; radius: number }> = ({ opacity, radius }) => {
  const count = 12;
  const photos = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => ({
      url: `https://picsum.photos/400/${i % 2 === 0 ? 600 : 300}?random=${i}`,
      isLandscape: i % 2 !== 0,
    }));
  }, []);

  if (opacity === 0) return null;

  return (
    <group>
      {photos.map((photo, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rotationY = -angle + Math.PI / 2;

        return (
          <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={1}>
            <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
              <mesh visible={opacity > 0}>
                <boxGeometry args={[3.4, 4.2, 0.1]} />
                <meshStandardMaterial color="#fff" transparent opacity={opacity} />
              </mesh>
              <mesh position={[0, 0.2, 0.06]} rotation={[0, 0, photo.isLandscape ? Math.PI / 2 : 0]}>
                 <planeGeometry args={[2.8, 2.8]} /> 
                 <ImageMaterial url={photo.url} opacity={opacity} />
              </mesh>
            </group>
          </Float>
        );
      })}
    </group>
  );
};

const ImageMaterial = ({ url, opacity }: { url: string; opacity: number }) => {
  const texture = useThree(state => state.gl.textureLoader.load(url));
  return <meshBasicMaterial map={texture} transparent opacity={opacity} />;
};
