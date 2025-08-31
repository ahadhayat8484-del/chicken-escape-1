import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Html, OrbitControls, useFBX, useTexture } from "@react-three/drei";
import { useGameLogic } from "hooks/useGameLogic";

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#228B22" />
    </mesh>
  );
}

function Fryer({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#555555" />
    </mesh>
  );
}

interface ChickenEscape3DProps {
  gameMode?: string;
}

export default function ChickenEscape3D({ gameMode }: ChickenEscape3DProps) {
  const groupRef = useRef<Group>(null);
  const mode: "solo" | "team" = gameMode === "team" ? "team" : "solo";

  const { jump, playJumpSound, playHitSound } = useGameLogic(mode);

  // FBX
  const fbx = useFBX("/minecraft-chicken (1)/source/chicken.fbx");
  const texture = useTexture("/minecraft-chicken (1)/textures/chicken.png");

  // Player & lanes
  const [lane, setLane] = useState<number>(1); // 0 left, 1 center, 2 right
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [playerHealth, setPlayerHealth] = useState(100);

  // Solo obstacles
  const [obstacles, setObstacles] = useState<Array<[number, number, number]>>(
    [],
  );

  // Boss mode
  const [bossHealth, setBossHealth] = useState(4000);
  const [projectiles, setProjectiles] = useState<
    Array<{
      position: [number, number, number];
      headshot: boolean;
    }>
  >([]);
  const [aiProjectiles, setAiProjectiles] = useState<
    Array<{
      position: [number, number, number];
    }>
  >([]);

  // Generate obstacles for solo mode
  useEffect(() => {
    if (mode === "solo") {
      const obs: Array<[number, number, number]> = [];
      for (let i = 5; i < 50; i += 5) {
        const laneIndex = Math.floor(Math.random() * 3);
        obs.push([laneIndex - 1, 0.5, -i]);
      }
      setObstacles(obs);
    }
  }, [mode]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (mode === "solo") {
        if (e.key === "ArrowLeft" && lane > 0) setLane(lane - 1);
        if (e.key === "ArrowRight" && lane < 2) setLane(lane + 1);
        if (e.code === "Space") jump();
      } else {
        if (e.key === "ArrowLeft")
          setPlayerPos([playerPos[0] - 1, playerPos[1], playerPos[2]]);
        if (e.key === "ArrowRight")
          setPlayerPos([playerPos[0] + 1, playerPos[1], playerPos[2]]);
        if (e.key.toLowerCase() === "f") {
          setProjectiles((p) => [
            ...p,
            {
              position: [playerPos[0], playerPos[1] + 1, playerPos[2]] as [
                number,
                number,
                number,
              ],
              headshot: Math.random() < 0.2,
            },
          ]);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lane, playerPos, jump, mode]);

  // Game loop
  useFrame((state, delta) => {
    // Move obstacles (solo)
    if (mode === "solo") {
      setObstacles((obs) =>
        obs.map(
          ([x, y, z]) => [x, y, z + delta * 5] as [number, number, number],
        ),
      );
      // Check collisions
      obstacles.forEach(([x, y, z]) => {
        if (Math.abs(x - (lane - 1)) < 0.5 && Math.abs(z) < 1) {
          setPlayerHealth(0);
        }
      });
    } else {
      // Projectiles move
      setProjectiles((p) =>
        p
          .map((proj) => ({
            position: [
              proj.position[0],
              proj.position[1],
              proj.position[2] - 0.5,
            ] as [number, number, number],
            headshot: proj.headshot,
          }))
          .filter((proj) => proj.position[2] > -50),
      );
      setAiProjectiles((p) =>
        p
          .map((proj) => ({
            position: [
              proj.position[0],
              proj.position[1],
              proj.position[2] + 0.3,
            ] as [number, number, number],
          }))
          .filter((proj) => proj.position[2] < 10),
      );

      // Check projectile hits on boss
      projectiles.forEach((proj) => {
        if (proj.position[2] < -10) {
          setBossHealth((hp) => hp - (proj.headshot ? 400 : 100));
        }
      });

      // AI hits player
      aiProjectiles.forEach((proj) => {
        if (
          Math.abs(proj.position[0] - playerPos[0]) < 0.5 &&
          Math.abs(proj.position[2]) < 1
        ) {
          setPlayerHealth((hp) => Math.max(hp - 30, 0));
        }
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight intensity={0.6} position={[5, 10, 5]} />
      <group ref={groupRef}>
        <Ground />
        <primitive
          object={fbx}
          position={[lane - 1, 0, 0]}
          scale={[0.02, 0.02, 0.02]}
        >
          <meshStandardMaterial map={texture} />
        </primitive>

        {mode === "solo" &&
          obstacles.map((pos, i) => (
            <mesh key={i} position={pos}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="red" />
            </mesh>
          ))}

        {mode === "team" && <Fryer position={[0, 0, -10]} />}
      </group>

      {mode === "team" &&
        projectiles.map((proj, i) => (
          <mesh key={i} position={proj.position}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={proj.headshot ? "yellow" : "blue"} />
          </mesh>
        ))}

      {mode === "team" &&
        aiProjectiles.map((proj, i) => (
          <mesh key={i} position={proj.position}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="green" />
          </mesh>
        ))}

      <Html>
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            color: "white",
            fontSize: "20px",
          }}
        >
          {mode === "solo"
            ? `Player Health: ${playerHealth}`
            : `Boss Health: ${bossHealth}`}
        </div>
        {playerHealth <= 0 && (
          <div style={{ color: "red", fontSize: "40px" }}>You Lose!</div>
        )}
        {mode === "team" && bossHealth <= 0 && (
          <div style={{ color: "green", fontSize: "40px" }}>You Win!</div>
        )}
      </Html>

      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
}
