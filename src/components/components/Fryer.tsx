import { useRef } from "react";
import { Group } from "three";

interface FryerProps {
  position: [number, number, number];
}

export default function Fryer({ position }: FryerProps) {
  const groupRef = useRef<Group>(null);

  // Just use geometric shapes - no model loading
  return (
    <group ref={groupRef} position={position} scale={0.5}>
      {/* Fryer base */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 2, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Oil inside */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.3, 16]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>
      {/* Handle */}
      <mesh position={[1.8, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Basket */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshStandardMaterial color="#C0C0C0" wireframe />
      </mesh>
      {/* Bubbling oil effect */}
      <mesh position={[0.3, 1, 0.2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.2, 1, -0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
