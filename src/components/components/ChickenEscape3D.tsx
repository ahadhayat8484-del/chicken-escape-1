// ...existing code...
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

function Fryer({ position, isChasing = false }: { position: [number, number, number], isChasing?: boolean }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#555555" />
      {/* Add some flame effect for team mode */}
      {!isChasing && (
        <mesh position={[0, 1.5, 0]}>
          <coneGeometry args={[0.3, 1, 8]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" />
        </mesh>
      )}
    </mesh>
  );
}

function Gun({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
  try {
    // Load the actual Glock FBX model
    const gunModel = useFBX("/glock-17-gen-5/Glock-17gen5.fbx");
    
    // Load textures
    const diffuseTexture = useTexture("/glock-17-gen-5/textures/Glock_SP_Set_001_Diffuse.jpeg");
    const normalTexture = useTexture("/glock-17-gen-5/textures/Glock_SP_Set_001_Normal.jpeg");
    const glossinessTexture = useTexture("/glock-17-gen-5/textures/Glock_SP_Set_001_Glossiness.jpeg");
    
    // Clone the model so we can use multiple instances
    const clonedModel = gunModel.clone();
    
    // Apply textures to the model
    clonedModel.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = diffuseTexture;
        child.material.normalMap = normalTexture;
        child.material.roughnessMap = glossinessTexture;
        child.material.needsUpdate = true;
      }
    });
    
    return (
      <primitive 
        object={clonedModel} 
        position={position} 
        rotation={rotation || [0, 0, 0]} 
        scale={[0.05, 0.05, 0.05]}
      />
    );
  } catch (error) {
    console.log("Failed to load gun model, using fallback:", error);
    // Fallback to basic gun shape with textures
    try {
      const diffuseTexture = useTexture("/glock-17-gen-5/textures/Glock_SP_Set_001_Diffuse.jpeg");
      return (
        <group position={position} rotation={rotation}>
          <mesh>
            <boxGeometry args={[0.1, 0.3, 0.8]} />
            <meshStandardMaterial map={diffuseTexture} />
          </mesh>
          <mesh position={[0, 0, 0.3]}>
            <boxGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial map={diffuseTexture} />
          </mesh>
        </group>
      );
    } catch (textureError) {
      // Ultimate fallback
      return (
        <group position={position} rotation={rotation}>
          <mesh>
            <boxGeometry args={[0.1, 0.3, 0.8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, 0, 0.3]}>
            <boxGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      );
    }
  }
}

function AIChicken({ position }: { position: [number, number, number] }) {
  // UPDATED PATHS: removed space from folder name
  const fbx = useFBX("/minecraft-chicken/source/Chicken.fbx");
  const texture = useTexture("/minecraft-chicken/textures/chicken.png");
  
  return (
    <group position={position}>
      <primitive object={fbx} scale={[0.02, 0.02, 0.02]}>
        <meshStandardMaterial map={texture} />
      </primitive>
      <Gun position={[0.5, 0.5, 0]} rotation={[0, 0, 0]} />
    </group>
  );
}

function Crosshair() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <div style={{
        width: '20px',
        height: '2px',
        backgroundColor: 'red',
        position: 'absolute',
        left: '-10px',
        top: '-1px'
      }} />
      <div style={{
        width: '2px',
        height: '20px',
        backgroundColor: 'red',
        position: 'absolute',
        left: '-1px',
        top: '-10px'
      }} />
    </div>
  );
}

interface ChickenEscape3DProps {
  gameMode?: string;
}

export default function ChickenEscape3D({ gameMode }: ChickenEscape3DProps) {
  const groupRef = useRef<Group>(null);
  const mode: "solo" | "team" = gameMode === "team" ? "team" : "solo";

  const { jump, playJumpSound, playHitSound } = useGameLogic(mode);

  // UPDATED PATHS: removed space from folder name
  const fbx = useFBX("/minecraft-chicken/source/Chicken.fbx");
  const texture = useTexture("/minecraft-chicken/textures/chicken.png");

  // Player & lanes
  const [lane, setLane] = useState<number>(1); // 0 left, 1 center, 2 right
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  const [jumpStartTime, setJumpStartTime] = useState(0);

  // Game state
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Solo mode
  const [obstacles, setObstacles] = useState<Array<[number, number, number]>>([]);
  const [chasingFryer, setChasingFryer] = useState<[number, number, number]>([0, 1, 5]);
  const [gameSpeed, setGameSpeed] = useState(5);

  // Team mode
  const [bossHealth, setBossHealth] = useState(5000);
  const [projectiles, setProjectiles] = useState<Array<{
    position: [number, number, number];
    fromPlayer: boolean;
    id: number;
  }>>([]);
  const [aiProjectiles, setAiProjectiles] = useState<Array<{
    position: [number, number, number];
    id: number;
  }>>([]);
  const [lastAiShot, setLastAiShot] = useState(0);
  const [projectileIdCounter, setProjectileIdCounter] = useState(0);

  // Generate obstacles for solo mode
  useEffect(() => {
    if (mode === "solo") {
      const obs: Array<[number, number, number]> = [];
      for (let i = 10; i < 200; i += 8) {
        const laneIndex = Math.floor(Math.random() * 3);
        obs.push([laneIndex - 1, 0.5, -i]);
      }
      setObstacles(obs);
    }
  }, [mode]);

  // Reset game function
  const resetGame = () => {
    setGameOver(false);
    setGameWon(false);
    setLane(1);
    setPlayerPos([0, 0, 0]);
    setJumpHeight(0);
    setIsJumping(false);
    setJumpStartTime(0);
    if (mode === "solo") {
      setChasingFryer([0, 1, 5]);
      setGameSpeed(5);
      // Regenerate obstacles
      const obs: Array<[number, number, number]> = [];
      for (let i = 10; i < 200; i += 8) {
        const laneIndex = Math.floor(Math.random() * 3);
        obs.push([laneIndex - 1, 0.5, -i]);
      }
      setObstacles(obs);
    } else {
      setBossHealth(5000);
      setProjectiles([]);
      setAiProjectiles([]);
      setLastAiShot(0);
      setProjectileIdCounter(0);
    }
  };

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver || gameWon) {
        if (e.key.toLowerCase() === "q") {
          resetGame();
        }
        return;
      }

      if (mode === "solo") {
        if (e.key === "ArrowLeft" && lane > 0) setLane(lane - 1);
        if (e.key === "ArrowRight" && lane < 2) setLane(lane + 1);
        if (e.code === "Space" && !isJumping) {
          setIsJumping(true);
          setJumpStartTime(Date.now());
          if (playJumpSound) playJumpSound();
        }
      } else {
        if (e.key === "ArrowLeft")
          setPlayerPos([Math.max(playerPos[0] - 1, -3), playerPos[1], playerPos[2]]);
        if (e.key === "ArrowRight")
          setPlayerPos([Math.min(playerPos[0] + 1, 3), playerPos[1], playerPos[2]]);
        if (e.key.toLowerCase() === "f") {
          const newId = projectileIdCounter + 1;
          setProjectileIdCounter(newId);
          setProjectiles((p) => [
            ...p,
            {
              position: [playerPos[0], playerPos[1] + 1, playerPos[2]] as [number, number, number],
              fromPlayer: true,
              id: newId,
            },
          ]);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lane, playerPos, mode, gameOver, gameWon, isJumping, playJumpSound, projectileIdCounter]);

  // Game loop
  useFrame((state, delta) => {
    if (gameOver || gameWon) return;

    const currentTime = Date.now();

    if (mode === "solo") {
      // Handle jumping with proper physics
      if (isJumping) {
        const jumpDuration = 800; // milliseconds
        const elapsed = currentTime - jumpStartTime;
        const progress = elapsed / jumpDuration;
        
        if (progress >= 1) {
          setIsJumping(false);
          setJumpHeight(0);
        } else {
          // Parabolic jump arc
          const height = 2 * Math.sin(progress * Math.PI);
          setJumpHeight(height);
        }
      }

      // Move obstacles towards player
      setObstacles((obs) =>
        obs.map(([x, y, z]) => [x, y, z + delta * gameSpeed] as [number, number, number])
          .filter(([x, y, z]) => z < 10) // Remove obstacles that passed
      );

      // Move chasing fryer closer
      setChasingFryer(([x, y, z]) => [lane - 1, y, Math.min(z - delta * (gameSpeed * 0.8), 3)]);

      // Increase game speed over time
      setGameSpeed(speed => speed + delta * 0.2);

      // Check collisions with obstacles
      obstacles.forEach(([x, y, z]) => {
        if (Math.abs(x - (lane - 1)) < 0.8 && Math.abs(z) < 1.2 && jumpHeight < 1.5) {
          setGameOver(true);
          if (playHitSound) playHitSound();
        }
      });

      // Check if fryer caught player
      if (Math.abs(chasingFryer[0] - (lane - 1)) < 1.2 && chasingFryer[2] <= 1.5) {
        setGameOver(true);
        if (playHitSound) playHitSound();
      }

    } else {
      // Team mode
      const time = state.clock.getElapsedTime();

      // Move player projectiles
      setProjectiles((p) =>
        p.map((proj) => ({
          ...proj,
          position: [
            proj.position[0],
            proj.position[1],
            proj.position[2] - 0.8,
          ] as [number, number, number],
        })).filter((proj) => proj.position[2] > -20)
      );

      // Move AI projectiles (fire from boss)
      setAiProjectiles((p) =>
        p.map((proj) => ({
          ...proj,
          position: [
            proj.position[0],
            proj.position[1],
            proj.position[2] + 0.6,
          ] as [number, number, number],
        })).filter((proj) => proj.position[2] < 8)
      );

      // AI shooting every 3 seconds (boss shoots fire)
      if (time - lastAiShot > 3) {
        const newId1 = projectileIdCounter + 1;
        const newId2 = projectileIdCounter + 2;
        setProjectileIdCounter(newId2);
        
        // Boss shoots fire at all three targets
        setAiProjectiles((p) => [
          ...p,
          { position: [playerPos[0], 1, -14] as [number, number, number], id: newId1 },
          { position: [-2, 1, -14] as [number, number, number], id: newId1 + 0.1 },
          { position: [2, 1, -14] as [number, number, number], id: newId2 },
        ]);
        setLastAiShot(time);
      }

      // Check projectile hits on boss
      projectiles.forEach((proj) => {
        if (proj.position[2] < -13 && proj.fromPlayer) {
          setBossHealth((hp) => {
            const newHealth = Math.max(hp - 100, 0);
            if (newHealth === 0) {
              setGameWon(true);
            }
            return newHealth;
          });
          // Remove hit projectile
          setProjectiles(p => p.filter(p => p.id !== proj.id));
        }
      });

      // Check AI projectile hits on player and AI chickens
      aiProjectiles.forEach((proj) => {
        // Check hit on player
        if (
          Math.abs(proj.position[0] - playerPos[0]) < 1 &&
          Math.abs(proj.position[2]) < 1.5
        ) {
          setGameOver(true);
          if (playHitSound) playHitSound();
        }
        // Check hits on AI chickens (they can also get hit)
        if (
          (Math.abs(proj.position[0] - (-2)) < 1 && Math.abs(proj.position[2] - (-8)) < 1.5) ||
          (Math.abs(proj.position[0] - 2) < 1 && Math.abs(proj.position[2] - (-8)) < 1.5)
        ) {
          // AI chickens get hit but don't die, just for visual effect
        }
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[5, 10, 5]} castShadow />
      <spotLight intensity={0.5} position={[0, 10, 0]} angle={0.3} penumbra={1} />
      
      <group ref={groupRef}>
        <Ground />
        
        {/* Player Chicken */}
        <group position={[mode === "solo" ? lane - 1 : playerPos[0], jumpHeight, mode === "solo" ? 0 : playerPos[2]]}>
          <primitive
            object={fbx}
            scale={[0.02, 0.02, 0.02]}
          >
            <meshStandardMaterial map={texture} />
          </primitive>
          
          {/* Player gun in team mode */}
          {mode === "team" && (
            <Gun position={[0.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} />
          )}
        </group>

        {/* Solo mode obstacles */}
        {mode === "solo" &&
          obstacles.map((pos, i) => (
            <mesh key={i} position={pos} castShadow>
              <boxGeometry args={[0.8, 1.5, 0.8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          ))}

        {/* Chasing fryer in solo mode */}
        {mode === "solo" && (
          <Fryer position={chasingFryer} isChasing={true} />
        )}

        {/* Team mode setup */}
        {mode === "team" && (
          <>
            {/* Boss Fryer */}
            <Fryer position={[0, 1, -15]} />
            {/* AI Chickens */}
            <AIChicken position={[-2, 0, -8]} />
            <AIChicken position={[2, 0, -8]} />
          </>
        )}
      </group>

      {/* Player Projectiles (bullets) */}
      {mode === "team" &&
        projectiles.map((proj) => (
          <mesh key={proj.id} position={proj.position}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="yellow" emissive="#ffff00" emissiveIntensity={0.5} />
          </mesh>
        ))}

      {/* AI Projectiles (fire) */}
      {mode === "team" &&
        aiProjectiles.map((proj) => (
          <mesh key={proj.id} position={proj.position}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.8} />
          </mesh>
        ))}

      <Html>
        {mode === "team" && !gameOver && !gameWon && <Crosshair />}
        
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            color: "white",
            fontSize: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {mode === "solo"
            ? `Speed: ${gameSpeed.toFixed(1)}`
            : `Boss Health: ${bossHealth}`}
        </div>

        {gameOver && (
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "30px",
            borderRadius: "10px",
          }}>
            <div style={{ color: "red", fontSize: "40px", marginBottom: "20px" }}>
              Game Over!
            </div>
            <div style={{ color: "white", fontSize: "24px" }}>
              Press Q to try again
            </div>
          </div>
        )}

        {gameWon && (
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "30px",
            borderRadius: "10px",
          }}>
            <div style={{ color: "green", fontSize: "40px", marginBottom: "20px" }}>
              You Win!
            </div>
            <div style={{ color: "white", fontSize: "24px" }}>
              Press Q to play again
            </div>
          </div>
        )}

        {mode === "solo" && !gameOver && (
          <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            color: "white",
            fontSize: "16px",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "10px",
            borderRadius: "5px",
          }}>
            Use Arrow Keys to move, Space to jump
          </div>
        )}

        {mode === "team" && !gameOver && !gameWon && (
          <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            color: "white",
            fontSize: "16px",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "10px",
            borderRadius: "5px",
          }}>
            Arrow Keys to move, F to shoot
          </div>
        )}
      </Html>

      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
}
// ...existing code...