import { Sky, Stars, Cloud, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function World() {
  return (
    <>
      {/* Iluminação de Terror */}
      <color attach="background" args={['#020205']} />
      <fogExp2 attach="fog" args={['#020205', 0.07]} />
      <ambientLight intensity={0.05} />
      
      {/* Estrelas e Atmosfera */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Chão com Textura de Neve */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1} 
          metalness={0.1}
        />
      </mesh>

      {/* Floresta Procedural */}
      {[...Array(40)].map((_, i) => (
        <Tree key={i} position={[
          (Math.random() - 0.5) * 80, 
          0, 
          (Math.random() - 0.5) * 80
        ]} />
      ))}
    </>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow>
        <coneGeometry args={[1.5, 5, 6]} />
        <meshStandardMaterial color="#0b1a0e" roughness={1} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1]} />
        <meshStandardMaterial color="#1a0d02" />
      </mesh>
    </group>
  );
}
