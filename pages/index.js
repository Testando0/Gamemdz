import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Float, Text, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Noise, Vignette, Bloom } from '@react-three/postprocessing';
import { useGameStore } from '../store/useGameStore';
import World from '../components/Environment';
import Killer from '../components/Killer';

export default function App() {
  const playerRef = useRef();
  const { gameStatus, itemsFound, startGame } = useGameStore();
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {/* UI Overlay */}
      <div style={{ position: 'absolute', zIndex: 10, color: 'white', padding: 20, width: '100%' }}>
        {gameStatus === 'intro' && (
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <h1 style={{ fontSize: '3rem', letterSpacing: '10px' }}>FRIDAY NIGHT</h1>
            <button onClick={startGame} style={{ padding: '15px 40px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
              SOBREVIVER
            </button>
          </div>
        )}
        {gameStatus === 'playing' && <h3>Objetivo: Encontre 3 galões de gasolina ({itemsFound}/3)</h3>}
        {gameStatus === 'caught' && <h1 style={{ color: 'red', textAlign: 'center' }}>VOCÊ FOI MORTO</h1>}
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        
        <World />
        
        {/* Jogador (Invisível para o jogador ver em 1ª pessoa) */}
        <group ref={playerRef} position={[0, 0, 0]}>
           <pointLight intensity={0.5} distance={10} color="#fff" /> {/* Lanterna */}
        </group>

        {gameStatus === 'playing' && <Killer playerRef={playerRef} />}

        {/* Efeitos de Realismo Visual */}
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} opacity={0.5} />
          <Noise opacity={0.2} /> {/* Efeito de câmera antiga */}
          <Vignette eskil={false} offset={0.1} darkness={1.1} /> {/* Escurece as bordas */}
        </EffectComposer>
      </Canvas>

      {/* Controles Touch Mobile Simples */}
      {gameStatus === 'playing' && (
        <div 
          onTouchMove={(e) => {
            const t = e.touches[0];
            playerRef.current.position.x += (t.clientX - window.innerWidth/2) * 0.0005;
            playerRef.current.position.z += (t.clientY - window.innerHeight/2) * 0.0005;
          }}
          style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%', zIndex: 5 }} 
        />
      )}
    </div>
  );
}
