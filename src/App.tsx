import { Canvas, useThree } from '@react-three/fiber';
import * as React from 'react';
import { OrbitControls } from '@react-three/drei';

import generate3DKenKen from './genKenKen.tsx';


const N: number = 4;

type BoxProps = {
  position: [number, number, number];
}

function Box({ position }: BoxProps) {
  const boxColor = 0x808080; // Gray

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} /> {/* Half in size */}
        <meshStandardMaterial color={boxColor} transparent opacity={0.3} /> {/* Gray color */}
      </mesh>
      <lineSegments>
        <edgesGeometry attach="geometry">
          <boxGeometry args={[0.5, 0.5, 0.5]} /> {/* Half in size for the edges as well */}
        </edgesGeometry>
        <lineBasicMaterial color={boxColor} />
      </lineSegments>
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
            // number
            // color
          />
        );
      }
    }
  }

  return (
    <Canvas>
      <ambientLight intensity={0.1} />
      <directionalLight color="red" position={[0, 0, 5]} />
      <OrbitGroup>
        {cubes}
      </OrbitGroup>
    </Canvas>
  );
}

export default App;
