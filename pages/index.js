import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float, Sky } from '@react-three/drei';
import { EffectComposer, Noise, Vignette, Bloom } from '@react-three/postprocessing';
import { create } from 'zustand';

// --- ESTADO GLOBAL (Inventário e Vida) ---
const useStore = create((set) => ({
  pecas: 0,
  status: 'jogando', 
  coletar: () => set((state) => ({ pecas: state.pecas + 1 })),
  morrer: () => set({ status: 'morto' }),
  reset: () => set({ pecas: 0, status: 'jogando' })
}));

// --- ELEMENTOS DO MAPA ---
function Floresta() {
  return (
    <group>
      <Sky sunPosition={[100, -10, 100]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      {/* Árvores Simples */}
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[(Math.random()-0.5)*40, 1.5, (Math.random()-0.5)*40]}>
          <coneGeometry args={[1, 3, 6]} />
          <meshStandardMaterial color="#051a05" />
        </mesh>
      ))}
    </group>
  );
}

// --- INTERFACE (UI) ---
function Overlay() {
  const { pecas, status, reset } = useStore();
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px', zIndex: 10, color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
      <h2 style={{ textShadow: '2px 2px black' }}>GASOLINA: {pecas}/3</h2>
      {status === 'morto' && (
        <div style={{ pointerEvents: 'auto', background: 'rgba(150,0,0,0.8)', padding: '20px', textAlign: 'center', borderRadius: '10px' }}>
          <h1>VOCÊ FOI PEGO!</h1>
          <button onClick={reset} style={{ padding: '10px 20px', cursor: 'pointer' }}>TENTAR NOVAMENTE</button>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function JogoFriday() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Overlay />
      
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 5, 25]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />

        <Floresta />

        {/* Peça do Carro (Item coletável) */}
        <Float speed={3}>
          <mesh position={[2, 1, -5]} onClick={(e) => { e.stopPropagation(); useStore.getState().coletar(); }}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
          </mesh>
        </Float>

        {/* Efeitos Visuais de Realismo */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} intensity={0.4} />
          <Noise opacity={0.2} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
