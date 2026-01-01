import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float, Sky, useHelper } from '@react-three/drei';
import { EffectComposer, Noise, Vignette, Bloom } from '@react-three/postprocessing';
import { create } from 'zustand';
import * as THREE from 'three';

// --- SISTEMA DE ESTADO DO JOGO ---
const useStore = create((set) => ({
  pecas: 0,
  status: 'jogando', 
  playerPos: [0, 0, 0],
  coletar: () => set((state) => ({ pecas: Math.min(state.pecas + 1, 3) })),
  morrer: () => set({ status: 'morto' }),
  vencer: () => set({ status: 'venceu' }),
  updatePlayer: (pos) => set({ playerPos: pos }),
  reset: () => set({ pecas: 0, status: 'jogando' })
}));

// --- O ASSASSINO (BOT IA) ---
function Killer() {
  const mesh = useRef();
  const playerPos = useStore((state) => state.playerPos);
  const status = useStore((state) => state.status);
  const morrer = useStore((state) => state.morrer);

  useFrame((state, delta) => {
    if (!mesh.current || status !== 'jogando') return;

    const target = new THREE.Vector3(playerPos[0], 0, playerPos[2]);
    mesh.current.lookAt(target);
    mesh.current.position.lerp(target, 0.4 * delta); // Velocidade do bot

    if (mesh.current.position.distanceTo(target) < 1.2) morrer();
  });

  return (
    <mesh ref={mesh} position={[15, 1, -15]}>
      <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
      <meshStandardMaterial color="#050505" />
      <pointLight position={[0, 1, 0.5]} color="red" intensity={5} distance={3} />
    </mesh>
  );
}

// --- JOGADOR E CONTROLES MOBILE ---
function Player({ joystick }) {
  const mesh = useRef();
  const updatePlayer = useStore((state) => state.updatePlayer);
  const status = useStore((state) => state.status);

  useFrame((state, delta) => {
    if (!mesh.current || status !== 'jogando') return;

    if (joystick.active) {
      const moveSpeed = 6 * delta;
      mesh.current.position.x += Math.cos(joystick.angle) * moveSpeed;
      mesh.current.position.z -= Math.sin(joystick.angle) * moveSpeed;
    }

    updatePlayer([mesh.current.position.x, 0, mesh.current.position.z]);
    state.camera.position.lerp(new THREE.Vector3(mesh.current.position.x, 12, mesh.current.position.z + 8), 0.1);
    state.camera.lookAt(mesh.current.position);
  });

  return (
    <mesh ref={mesh} position={[0, 1, 0]}>
      <capsuleGeometry args={[0.5, 1, 4]} />
      <meshStandardMaterial color="#111155" />
      <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
    </mesh>
  );
}

// --- ITEM COLETÁVEL ---
function Item({ position }) {
  const [coletado, setColetado] = useState(false);
  const coletar = useStore((state) => state.coletar);

  if (coletado) return null;

  return (
    <Float speed={4} rotationIntensity={2}>
      <mesh position={position} onClick={() => { setColetado(true); coletar(); }} onPointerDown={() => { setColetado(true); coletar(); }}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
      </mesh>
    </Float>
  );
}

// --- CENA PRINCIPAL ---
export default function Jogo() {
  const [joystick, setJoystick] = useState({ active: false, angle: 0 });
  const { pecas, status, reset } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleTouch = (e) => {
    const touch = e.touches[0];
    const angle = Math.atan2(window.innerHeight / 2 - touch.clientY, touch.clientX - window.innerWidth / 2);
    setJoystick({ active: true, angle });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', touchAction: 'none' }} onTouchMove={handleTouch} onTouchEnd={() => setJoystick({ active: false })}>
      
      <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', zIndex: 10, color: 'white', fontFamily: 'monospace', pointerEvents: 'none' }}>
        <h1>GASOLINA: {pecas}/3</h1>
        {status !== 'jogando' && (
          <div style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.9)', padding: '20px' }}>
            <h2>{status === 'morto' ? 'O ASSASSINO TE PEGOU' : 'VOCÊ ESCAPOU!'}</h2>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: 'white' }}>REINICIAR</button>
          </div>
        )}
      </div>

      <Canvas shadows>
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 5, 30]} />
        <Sky sunPosition={[0, -1, 0]} />
        <Stars count={1000} factor={4} />
        <ambientLight intensity={0.1} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <Player joystick={joystick} />
        <Killer />
        
        <Item position={[10, 1, 10]} />
        <Item position={[-15, 1, 5]} />
        <Item position={[5, 1, -15]} />

        {/* Carro de Fuga */}
        <mesh position={[0, 0.5, -20]} onClick={() => pecas >= 3 && useStore.getState().vencer()}>
          <boxGeometry args={[4, 2, 6]} />
          <meshStandardMaterial color={pecas >= 3 ? "green" : "#222"} />
        </mesh>

        <EffectComposer>
          <Bloom intensity={0.5} />
          <Noise opacity={0.15} />
          <Vignette darkness={1.2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
