import { Canvas, useThree } from '@react-three/fiber';
import * as React from 'react';
import { OrbitControls } from '@react-three/drei';
import { CanvasTexture, Sprite, SpriteMaterial } from 'three';

import generate3DKenKen from './genKenKen.tsx';
import { BoxProps, N } from './types.tsx'


function createTextTexture(number: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;  // you can adjust for resolution
  canvas.height = 128; // you can adjust for resolution
  const context = canvas.getContext('2d')!;

  // Draw the background (optional)
  context.fillStyle = 'rgba(255, 255, 255, 0)';  // transparent
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the number
  context.font = '64px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(number.toString(), canvas.width / 2, canvas.height / 2);

  return new CanvasTexture(canvas);
}

function Box({ position, number, color }: BoxProps) {
  const textTexture = createTextTexture(number);
  const spriteMaterial = new SpriteMaterial({ map: textTexture });
  const sprite = new Sprite(spriteMaterial);
  sprite.scale.set(0.45, 0.45, 1); // Adjust as needed to fit the box

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} transparent={true} opacity={0.7} />
      </mesh>
      <lineSegments>
        <edgesGeometry attach="geometry">
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </edgesGeometry>
        <lineBasicMaterial color={color} />
      </lineSegments>
      <primitive object={sprite} /> {/* This is the sprite containing the number */}
    </group>
  );
}


function OrbitGroup({ children }: { children: React.ReactNode }) {
  const { camera, gl } = useThree();

  return (
    <>
      <OrbitControls args={[camera, gl.domElement]} />
      <group>{children}</group>
    </>
  )
}

function App() {
  const puzzle = generate3DKenKen(N);

  const cubes = [];
  const offset = 0.5; // half the size of a cube (since cube is now 0.5x0.5x0.5)

  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      for (let z = 0; z < N; z++) {
        cubes.push(
          <Box
            key={`${x}-${y}-${z}`}
            position={[
              x * offset - (N - 1) * (offset / 2),
              y * offset - (N - 1) * (offset / 2),
              z * offset - (N - 1) * (offset / 2),
            ]}
            number={puzzle.cube[x][y][z]}
            color={puzzle.cages[puzzle.cellToCageMap.get([x, y, z].join(','))!].color}
          />
        );
      }
    }
  }

  return (
    <Canvas>
      <ambientLight intensity={0.7} />
      <directionalLight color="white" position={[0, 0, 5]} />
      <pointLight position={[0, 0, 0]} intensity={2.0} />
      <OrbitGroup>
        {cubes}
      </OrbitGroup>
    </Canvas>
  );
}

export default App;
