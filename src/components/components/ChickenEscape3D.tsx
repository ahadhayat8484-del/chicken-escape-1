import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, OrbitControls, useFBX, useTexture } from "@react-three/drei";
import { Group } from "three";
import { useGameLogic } from "../../hooks/useGameLogic";

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#228B22" />
    </mesh>
  );
}

function Fryer({
  position,
  isChasing = false,
}: {
  position: [number, number, number];
  isChasing?: boolean;
}) {
  // Use fryer.fbx model
  const fryerFbx: any = useFBX("/fryer.fbx");
  
  useEffect(() => {
    if (!fryerFbx) return;
    fryerFbx.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set(isChasing ? "#aa4444" : "#8B4513");
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [fryerFbx, isChasing]);

  if (!fryerFbx) {
    // Fallback fryer shape
    return (
      <mesh position={position} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={isChasing ? "#aa4444" : "#8B4513"} />
      </mesh>
    );
  }

  return (
    <group position={position}>
      <primitive object={fryerFbx} scale={[0.05, 0.05, 0.05]} />
    </group>
  );
}

function FireObstacle({ position }: { position: [number, number, number] }) {
  const fireFbx: any = useFBX("/fire.fbx");
  
  useEffect(() => {
    if (!fireFbx) return;
    fireFbx.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set("#FF4500");
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [fireFbx]);

  if (!fireFbx) {
    return (
      <mesh position={position} castShadow>
        <cylinderGeometry args={[0.5, 0.8, 1.5, 8]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>
    );
  }

  return (
    <group position={position}>
      <primitive object={fireFbx} scale={[0.03, 0.03, 0.03]} />
    </group>
  );
}

function OilObstacle({ position }: { position: [number, number, number] }) {
  const oilFbx: any = useFBX("/oil.fbx");
  
  useEffect(() => {
    if (!oilFbx) return;
    oilFbx.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set("#8B4513");
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [oilFbx]);

  if (!oilFbx) {
    return (
      <mesh position={position} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.3, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
  }

  return (
    <group position={position}>
      <primitive object={oilFbx} scale={[0.03, 0.03, 0.03]} />
    </group>
  );
}

function Gun({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const gunModel: any = useFBX("/glock-17-gen-5/Glock-17gen5.fbx");
  const diffuse: any = useTexture(
    "/glock-17-gen-5/textures/Glock_SP_Set_001_Diffuse.jpeg"
  );
  const normal: any = useTexture(
    "/glock-17-gen-5/textures/Glock_SP_Set_001_Normal.jpeg"
  );
  const roughness: any = useTexture(
    "/glock-17-gen-5/textures/Glock_SP_Set_001_Glossiness.jpeg"
  );

  useEffect(() => {
    if (!gunModel) return;
    gunModel.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        if (diffuse) child.material.map = diffuse;
        if (normal) child.material.normalMap = normal;
        if (roughness) child.material.roughnessMap = roughness;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gunModel, diffuse, normal, roughness]);

  if (gunModel) {
    return (
      <primitive
        object={gunModel}
        position={position}
        rotation={rotation || [0, 0, 0]}
        scale={[0.05, 0.05, 0.05]}
      />
    );
  }

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.12, 0.28, 0.8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function AIChicken({ position }: { position: [number, number, number] }) {
  const fbx: any = useFBX("/minecraft-chicken/source/Chicken.fbx");
  const texture: any = useTexture("/minecraft-chicken/textures/chicken.png");

  useEffect(() => {
    if (!fbx || !texture) return;
    fbx.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = texture;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [fbx, texture]);

  if (!fbx) {
    return (
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#ffcc66" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <primitive object={fbx} scale={[0.02, 0.02, 0.02]} />
    </group>
  );
}

function Crosshair() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 24,
          height: 2,
          backgroundColor: "red",
          position: "absolute",
          left: -12,
          top: -1,
        }}
      />
      <div
        style={{
          width: 2,
          height: 24,
          backgroundColor: "red",
          position: "absolute",
          left: -1,
          top: -12,
        }}
      />
    </div>
  );
}

interface Projectile {
  position: [number, number, number];
  fromPlayer?: boolean;
  id: number;
}

interface Obstacle {
  position: [number, number, number];
  type: 'fire' | 'oil';
  id: number;
}

interface ChickenEscape3DProps {
  gameMode?: string;
}

export default function ChickenEscape3D({ gameMode }: ChickenEscape3DProps) {
  const groupRef = useRef<Group | null>(null);
  const mode: "solo" | "team" = gameMode === "team" ? "team" : "solo";

  const { jump, playJumpSound, playHitSound } = useGameLogic(mode);

  // Player chicken model - positioned at the bottom
  const playerFbx: any = useFBX("/minecraft-chicken/source/Chicken.fbx");
  const playerTexture: any = useTexture("/minecraft-chicken/textures/chicken.png");

  useEffect(() => {
    if (!playerFbx || !playerTexture) return;
    playerFbx.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = playerTexture;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [playerFbx, playerTexture]);

  const lanes = [-2, 0, 2];
  const [lane, setLane] = useState<number>(1);
  // Position chicken at the bottom (negative Z)
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([
    lanes[1],
    0,
    -15,
  ]);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpStartTime, setJumpStartTime] = useState<number | null>(null);

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Changed obstacles to include type and id
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  // Fryer starts behind the chicken
  const [chasingFryer, setChasingFryer] = useState<[number, number, number]>([
    0, 1, -20,
  ]);
  const [gameSpeed, setGameSpeed] = useState(5);
  const [obstacleIdCounter, setObstacleIdCounter] = useState(1);

  const [bossHealth, setBossHealth] = useState(5000);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [aiProjectiles, setAiProjectiles] = useState<Projectile[]>([]);
  const [lastAiShot, setLastAiShot] = useState(0);
  const [projectileIdCounter, setProjectileIdCounter] = useState(1);

  // Generate obstacles coming from the front (positive Z)
  useEffect(() => {
    if (mode !== "solo") return;
    const generated: Obstacle[] = [];
    for (let i = 1; i <= 12; i++) {
      const laneIndex = Math.floor(Math.random() * 3);
      const z = 10 + i * 6 + Math.random() * 4; // Positive Z (in front)
      const type = Math.random() < 0.5 ? 'fire' : 'oil';
      generated.push({
        position: [lanes[laneIndex], 0, z],
        type,
        id: obstacleIdCounter + i
      });
    }
    setObstacles(generated);
    setChasingFryer([0, 1, -20]); // Behind the chicken
    setObstacleIdCounter(prev => prev + 12);
  }, [mode]);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setGameWon(false);
    setLane(1);
    setPlayerPos([lanes[1], 0, -15]); // Reset to bottom position
    setIsJumping(false);
    setJumpStartTime(null);
    setProjectiles([]);
    setAiProjectiles([]);
    setProjectileIdCounter(1);
    setBossHealth(5000);
    if (mode === "solo") {
      const generated: Obstacle[] = [];
      for (let i = 1; i <= 12; i++) {
        const laneIndex = Math.floor(Math.random() * 3);
        const z = 10 + i * 6 + Math.random() * 4;
        const type = Math.random() < 0.5 ? 'fire' : 'oil';
        generated.push({
          position: [lanes[laneIndex], 0, z],
          type,
          id: obstacleIdCounter + i
        });
      }
      setObstacles(generated);
      setChasingFryer([0, 1, -20]);
      setGameSpeed(5);
      setObstacleIdCounter(prev => prev + 12);
    }
  }, [mode, obstacleIdCounter]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key.toLowerCase() === "r") resetGame();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setLane((cur) => Math.max(0, cur - 1));
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setLane((cur) => Math.min(2, cur + 1));
      } else if (e.code === "Space") {
        if (!isJumping) {
          setIsJumping(true);
          setJumpStartTime(Date.now());
          playJumpSound && playJumpSound();
        }
      } else if (mode === "team" && (e.key === "f" || e.key === "F")) {
        setProjectiles((prev) => {
          const id = projectileIdCounter;
          setProjectileIdCounter(id + 1);
          return [
            ...prev,
            {
              position: [lanes[lane], 0.6, playerPos[2] + 0.5] as [number, number, number],
              fromPlayer: true,
              id,
            },
          ];
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    lane,
    isJumping,
    gameOver,
    mode,
    playJumpSound,
    projectileIdCounter,
    resetGame,
    playerPos,
  ]);

  // Add click/touch handler for jumping
  useEffect(() => {
    const handleClick = () => {
      if (gameOver) return;
      if (!isJumping) {
        setIsJumping(true);
        setJumpStartTime(Date.now());
        playJumpSound && playJumpSound();
      }
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, [isJumping, gameOver, playJumpSound]);

  useFrame((_, delta) => {
    if (gameOver || gameWon) return;

    const targetX = lanes[lane];
    setPlayerPos((prev) => {
      const x = prev[0] + (targetX - prev[0]) * Math.min(1, 10 * delta);
      return [x, prev[1], prev[2]];
    });

    if (isJumping && jumpStartTime) {
      const elapsed = (Date.now() - jumpStartTime) / 1000;
      const jumpDuration = 0.6;
      const height = Math.max(
        0,
        2.5 * (4 * (elapsed / jumpDuration) * (1 - elapsed / jumpDuration))
      );
      setPlayerPos((p) => [p[0], height, p[2]]);
      if (elapsed > jumpDuration) {
        setIsJumping(false);
        setJumpStartTime(null);
        setPlayerPos((p) => [p[0], 0, p[2]]);
      }
    }

    if (mode === "solo") {
      // Move obstacles towards the chicken (negative Z direction)
      setObstacles((prev) =>
        prev
          .map((ob) => ({
            ...ob,
            position: [ob.position[0], ob.position[1], ob.position[2] - gameSpeed * delta] as [number, number, number]
          }))
          .filter((ob) => ob.position[2] > playerPos[2] - 5) // Remove obstacles that passed the chicken
      );

      // Move fryer towards the chicken from behind
      setChasingFryer((prev) => {
        const z = prev[2] + (gameSpeed * 0.8) * delta; // Slightly slower than obstacles
        return [prev[0], prev[1], Math.min(z, playerPos[2] - 2)]; // Don't let fryer get too close instantly
      });

      // Check collision with obstacles
      const playerY = playerPos[1];
      const px = playerPos[0];
      const pz = playerPos[2];
      const collided = obstacles.some((ob) => {
        const dz = Math.abs(ob.position[2] - pz);
        const dx = Math.abs(ob.position[0] - px);
        return dz < 1.2 && dx < 0.9 && playerY < 1.0;
      });
      if (collided) {
        setGameOver(true);
        playHitSound && playHitSound();
      }

      // Check if fryer caught the chicken
      if (chasingFryer[2] > playerPos[2] - 1.5) {
        setGameOver(true);
        playHitSound && playHitSound();
      }

      // Gradually increase game speed
      setGameSpeed((s) => Math.min(20, s + delta * 0.5));

      // Spawn new obstacles as old ones are removed
      if (obstacles.length < 8) {
        const maxZ = Math.max(...obstacles.map(o => o.position[2]), 10);
        const newObstacles: Obstacle[] = [];
        for (let i = 0; i < 3; i++) {
          const laneIndex = Math.floor(Math.random() * 3);
          const z = maxZ + 8 + i * 6 + Math.random() * 4;
          const type = Math.random() < 0.5 ? 'fire' : 'oil';
          newObstacles.push({
            position: [lanes[laneIndex], 0, z],
            type,
            id: obstacleIdCounter + i
          });
        }
        setObstacles(prev => [...prev, ...newObstacles]);
        setObstacleIdCounter(prev => prev + 3);
      }
    }

    if (mode === "team") {
      setProjectiles((prev) =>
        prev
          .map((p) => ({
            position: [
              p.position[0],
              p.position[1],
              (p.position[2] as number) + 20 * delta,
            ] as [number, number, number],
            fromPlayer: p.fromPlayer,
            id: p.id,
          }))
          .filter((p) => p.position[2] < 100)
      );

      setAiProjectiles((prev) =>
        prev
          .map((p) => ({
            position: [
              p.position[0],
              p.position[1],
              (p.position[2] as number) - 15 * delta,
            ] as [number, number, number],
            id: p.id,
          }))
          .filter((p) => p.position[2] > -20)
      );

      if (Date.now() - lastAiShot > 1000 + Math.random() * 1500) {
        setLastAiShot(Date.now());
        setAiProjectiles((prev) => {
          const id = projectileIdCounter;
          setProjectileIdCounter(id + 1);
          return [
            ...prev,
            {
              position: [0, 0.6, 30] as [number, number, number],
              fromPlayer: false,
              id,
            },
          ];
        });
      }

      aiProjectiles.forEach((p) => {
        const dx = Math.abs(p.position[0] - playerPos[0]);
        const dz = Math.abs(p.position[2] - playerPos[2]);
        if (dx < 0.6 && dz < 0.8) {
          setGameOver(true);
          playHitSound && playHitSound();
        }
      });

      projectiles.forEach((p) => {
        if (p.position[2] > 28) {
          setBossHealth((h) => {
            const nh = h - 100;
            if (nh <= 0) {
              setGameWon(true);
            }
            return nh;
          });
        }
      });
    }
  });

  const renderObstacles = () =>
    obstacles.map((ob) => {
      if (ob.type === 'fire') {
        return <FireObstacle key={`fire-${ob.id}`} position={ob.position} />;
      } else {
        return <OilObstacle key={`oil-${ob.id}`} position={ob.position} />;
      }
    });

  const renderProjectiles = () =>
    projectiles.map((p) => (
      <mesh key={`p-${p.id}`} position={p.position as [number, number, number]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#00ffdd" />
      </mesh>
    ));

  const renderAiProjectiles = () =>
    aiProjectiles.map((p) => (
      <mesh key={`ai-${p.id}`} position={p.position as [number, number, number]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
    ));

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[5, 10, 5]} castShadow />
      <spotLight intensity={0.5} position={[0, 10, 0]} angle={0.3} penumbra={1} />

      <group ref={groupRef}>
        <Ground />

        {/* Player chicken positioned at the bottom */}
        <group position={[playerPos[0], playerPos[1], playerPos[2]]}>
          {playerFbx ? (
            <primitive object={playerFbx} scale={[0.02, 0.02, 0.02]} />
          ) : (
            <mesh>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color="#ffcc66" />
            </mesh>
          )}

          {mode === "team" && <Gun position={[0.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} />}
        </group>

        {mode === "solo" && renderObstacles()}
        {mode === "solo" && <Fryer position={chasingFryer} isChasing={true} />}

        {mode === "team" && (
          <>
            <Fryer position={[0, 1, -15]} />
            <AIChicken position={[-2, 0, -8]} />
            <AIChicken position={[2, 0, -8]} />
            {renderProjectiles()}
            {renderAiProjectiles()}
          </>
        )}
      </group>

      <Html>
        {mode === "team" && !gameOver && !gameWon && <Crosshair />}

        {/* UI positioned at the top of the screen */}
        <div style={{ 
          position: "absolute", 
          top: 20, 
          left: "50%", 
          transform: "translateX(-50%)",
          color: "white", 
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
        }}>
          {mode === "solo" ? `Speed: ${gameSpeed.toFixed(1)}` : `Boss Health: ${bossHealth}`}
        </div>

        {/* Game Over message at the top */}
        {gameOver && (
          <div style={{ 
            position: "absolute", 
            top: 80, 
            left: "50%", 
            transform: "translateX(-50%)", 
            color: "#ff4444",
            fontSize: 36,
            fontWeight: "bold",
            textAlign: "center",
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            borderRadius: "10px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
          }}>
            Game Over<br/>
            <div style={{fontSize: 18, marginTop: 10}}>Press R to restart</div>
          </div>
        )}

        {gameWon && (
          <div style={{ 
            position: "absolute", 
            top: 80, 
            left: "50%", 
            transform: "translateX(-50%)", 
            color: "lime",
            fontSize: 36,
            fontWeight: "bold",
            textAlign: "center",
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            borderRadius: "10px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
          }}>
            You Win!
          </div>
        )}

        {/* Instructions at the bottom */}
        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: 16,
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
        }}>
          Use SPACE, CLICK, or ARROW KEYS to jump and dodge obstacles!<br/>
          Don't let the fryer catch you!
        </div>
      </Html>

      <OrbitControls />
    </>
  );
}