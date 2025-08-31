import { useRef, useEffect, useCallback, useState } from "react";

// --- Types ---
interface GameState {
  score: number;
  timeLeft: number;
  phase: "ready" | "playing" | "gameOver" | "gameWon";
}

interface ChickenState {
  x: number;
  y: number;
  dy: number;
  isGrounded: boolean;
}

interface FryerState {
  x: number;
  y: number;
  speed: number;
}

// --- Sounds ---
const jumpSound = new Audio("/sounds/jump.mp3"); // add your sound file
const hitSound = new Audio("/sounds/hit.mp3"); // add your sound file

export default function ChickenEscape2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 120000,
    phase: "ready",
  });

  const [chicken, setChicken] = useState<ChickenState>({
    x: 50,
    y: 300,
    dy: 0,
    isGrounded: true,
  });

  const [fryer, setFryer] = useState<FryerState>({
    x: 800,
    y: 300,
    speed: 6,
  });

  const gameStartTime = useRef<number>(0);

  // --- Draw functions ---
  const drawChicken = useCallback(
    (ctx: CanvasRenderingContext2D, chickenState: ChickenState) => {
      const { x, y } = chickenState;
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(x, y, 40, 40);
    },
    [],
  );

  const drawFryer = useCallback(
    (ctx: CanvasRenderingContext2D, fryerState: FryerState) => {
      const { x, y } = fryerState;
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(x, y, 40, 40);
    },
    [],
  );

  const drawUI = useCallback(
    (ctx: CanvasRenderingContext2D, state: GameState) => {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.font = "24px Arial";
      const scoreText = `Score: ${state.score}`;
      ctx.strokeText(scoreText, 20, 40);
      ctx.fillText(scoreText, 20, 40);
      const timeText = `Time: ${Math.ceil(state.timeLeft / 1000)}s`;
      ctx.strokeText(timeText, 650, 40);
      ctx.fillText(timeText, 650, 40);
    },
    [],
  );

  // --- Game update ---
  const updateGame = useCallback(() => {
    if (gameState.phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timeElapsed = Date.now() - gameStartTime.current;
    const newTimeLeft = Math.max(0, 120000 - timeElapsed);
    if (newTimeLeft <= 0) {
      setGameState((prev) => ({ ...prev, phase: "gameWon", timeLeft: 0 }));
      return;
    }

    // --- Update Chicken ---
    setChicken((prevChicken) => {
      const newChicken = { ...prevChicken };
      const gravity = 0.6;
      const jumpForce = -12;
      const groundY = 300;

      if (keysRef.current["Space"] && newChicken.isGrounded) {
        newChicken.dy = jumpForce;
        newChicken.isGrounded = false;
        jumpSound.currentTime = 0;
        jumpSound.play();
      }

      if (keysRef.current["KeyA"] || keysRef.current["ArrowLeft"]) {
        newChicken.x = Math.max(0, newChicken.x - 5);
      }
      if (keysRef.current["KeyD"] || keysRef.current["ArrowRight"]) {
        newChicken.x = Math.min(canvas.width - 40, newChicken.x + 5);
      }

      newChicken.y += newChicken.dy;
      newChicken.dy += gravity;

      if (newChicken.y >= groundY) {
        newChicken.y = groundY;
        newChicken.dy = 0;
        newChicken.isGrounded = true;
      }

      return newChicken;
    });

    // --- Update Fryer ---
    setFryer((prevFryer) => {
      const newFryer = { ...prevFryer };
      newFryer.x -= newFryer.speed;
      if (newFryer.x + 40 < 0) {
        newFryer.x = canvas.width;
        newFryer.speed += 0.2;
        setGameState((prev) => ({ ...prev, score: prev.score + 1 }));
      }
      return newFryer;
    });

    setGameState((prev) => ({ ...prev, timeLeft: newTimeLeft }));

    // --- Collision ---
    setChicken((chicken) => {
      if (
        chicken.x < fryer.x + 40 &&
        chicken.x + 40 > fryer.x &&
        chicken.y < fryer.y + 40 &&
        chicken.y + 40 > fryer.y
      ) {
        hitSound.currentTime = 0;
        hitSound.play();
        setGameState((prev) => ({ ...prev, phase: "gameOver" }));
      }
      return chicken;
    });
  }, [gameState.phase, fryer.x, fryer.y]);

  // --- Render ---
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#90EE90";
    ctx.fillRect(0, 340, canvas.width, 60);

    if (gameState.phase === "playing") {
      drawChicken(ctx, chicken);
      drawFryer(ctx, fryer);
      drawUI(ctx, gameState);
    }
  }, [chicken, fryer, drawChicken, drawFryer, drawUI, gameState]);

  // --- Game Loop ---
  useEffect(() => {
    let loopId: number;

    const loop = () => {
      updateGame();
      render();
      if (gameState.phase === "playing") {
        loopId = requestAnimationFrame(loop);
      }
    };

    if (gameState.phase === "playing") loopId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(loopId);
  }, [gameState.phase, updateGame, render]);

  // --- Key listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- Click to Start ---
  const handleStart = () => {
    if (gameState.phase === "ready") {
      setGameState((prev) => ({ ...prev, phase: "playing" }));
      gameStartTime.current = Date.now();
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {gameState.phase === "ready" && (
        <button
          onClick={handleStart}
          style={{
            padding: "12px 24px",
            fontSize: "20px",
            marginTop: "100px",
            cursor: "pointer",
          }}
        >
          Start Game
        </button>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{
          display: "block",
          margin: "20px auto",
          border: "2px solid black",
        }}
      />
      {(gameState.phase === "gameOver" || gameState.phase === "gameWon") && (
        <div style={{ fontSize: "24px", color: "#FF0000", marginTop: "20px" }}>
          {gameState.phase === "gameOver" ? "Game Over!" : "You Win!"} Score:{" "}
          {gameState.score}
        </div>
      )}
    </div>
  );
}
