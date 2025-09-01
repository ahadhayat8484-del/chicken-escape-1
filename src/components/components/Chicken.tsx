import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MeshStandardMaterial, Texture } from "three";

interface ChickenProps {
  position: [number, number, number];
  color?: string;
  jumpHeight?: number; // optional max jump height
}

export default function Chicken({
  position,
  color = "#FFD700",
  jumpHeight = 2,
}: ChickenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // FBX and texture
  let fbx: THREE.Group | null = null;
  let texture: Texture | null = null;

  try {
    fbx = useFBX("/minecraft-chicken/source/chicken.fbx") as THREE.Group;
    texture = useTexture(
      "/minecraft-chicken/textures/chicken.png"
    ) as THREE.Texture;
  } catch (err) {
    console.warn("Could not load chicken FBX or texture:", err);
    fbx = null;
    texture = null;
  }

  // Smooth jump state
  const targetY = useRef(position[1]);
  const currentY = useRef(position[1]);

  useEffect(() => {
    if (!fbx || !groupRef.current) return;

    // Setup animation mixer
    const fbxWithAnimations = fbx as any;
    if (fbxWithAnimations.animations?.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(fbx);

      const runAction = fbxWithAnimations.animations.find((anim: any) =>
        /run|walk|idle/i.test(anim.name)
      );
      const action = mixerRef.current.clipAction(
        runAction || fbxWithAnimations.animations[0]
      );
      action.play();
    }

    // Apply texture and color to meshes
    fbx.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        const material = new THREE.MeshStandardMaterial({
          map: texture || null,
          color,
        });
        child.material = Array.isArray(child.material)
          ? child.material.map(() => material.clone())
          : material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [fbx, texture, color]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smoothly interpolate Y for jump
    currentY.current += (targetY.current - currentY.current) * 0.2;
    groupRef.current.position.set(position[0], currentY.current, position[2]);

    // Update animations
    if (mixerRef.current) mixerRef.current.update(delta);

    // Dynamic color
    if (fbx) {
      fbx.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => {
              if (mat instanceof THREE.MeshStandardMaterial)
                mat.color.set(color);
            });
          } else if (child.material instanceof MeshStandardMaterial) {
            child.material.color.set(color);
          }
        }
      });
    }
  });

  // Method to trigger jump from parent
  const jump = () => {
    targetY.current = position[1] + jumpHeight;
    setTimeout(() => {
      targetY.current = position[1];
    }, 300); // simple jump duration
  };

  // Fallback cube if FBX fails
  if (!fbx) {
    return (
      <group ref={groupRef} scale={0.5}>
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.2, 0.6]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color="#FFA500" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} scale={0.5}>
      <primitive object={fbx.clone()} />
    </group>
  );
}
