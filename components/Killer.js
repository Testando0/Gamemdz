import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function Killer({ playerRef }) {
  const mesh = useRef();
  const setGameOver = useGameStore(s => s.setGameOver);

  useFrame((state, delta) => {
    if (!mesh.current || !playerRef.current) return;

    const distance = mesh.current.position.distanceTo(playerRef.current.position);

    // IA: Só persegue se o jogador estiver "perto" (visão)
    if (distance < 25) {
      mesh.current.lookAt(playerRef.current.position.x, 0, playerRef.current.position.z);
      mesh.current.translateZ(3 * delta); // Velocidade do assassino
    }

    if (distance < 1.5) setGameOver('caught');
  });

  return (
    <group ref={mesh} position={[20, 0, -20]}>
      {/* Corpo Sombrio */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1.6, 4, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      {/* Olhos Brilhantes */}
      <mesh position={[0.2, 2, 0.3]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[-0.2, 2, 0.3]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <pointLight position={[0, 2, 0.5]} color="red" intensity={2} distance={3} />
    </group>
  );
}
