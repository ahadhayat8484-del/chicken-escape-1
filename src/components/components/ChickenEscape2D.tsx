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
  isDucking: boolean;
}

interface FryerState {
  x: number;
  y: number;
  speed: number;
}

interface Smoke {
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- Sounds ---
const jumpSound = new Audio("/sounds/jump.mp3");
const hitSound = new Audio("/sounds/hit.mp3");

// --- Drawing Functions ---
function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#87CEEB");
  sky.addColorStop(1, "#B0E0E6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#228B22";
  ctx.fillRect(0, 340, canvas.width, 60);
  for (let i = 0; i < canvas.width; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, 340);
    ctx.lineTo(i + 5, 330);
    ctx.lineTo(i + 10, 340);
    ctx.fill();
  }
}

function drawChicken(ctx: CanvasRenderingContext2D, c: ChickenState) {
  const height = c.isDucking ? 20 : 40;
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.ellipse(c.x + 20, c.y + height / 2, 20, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(c.x + 30, c.y + 10, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(c.x + 35, c.y + 10);
  ctx.lineTo(c.x + 45, c.y + 15);
  ctx.lineTo(c.x + 35, c.y + 20);
  ctx.fill();
}

function drawFryer(ctx: CanvasRenderingContext2D, f: FryerState) {
  const gradient = ctx.createLinearGradient(f.x, f.y, f.x, f.y + 40);
  gradient.addColorStop(0, "#555");
  gradient.addColorStop(1, "#222");
  ctx.fillStyle = gradient;
  ctx.fillRect(f.x, f.y, 40, 40);

  ctx.fillStyle = "#333";
  ctx.fillRect(f.x + 5, f.y - 10, 30, 10);

  ctx.strokeStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(f.x + 20, f.y, 10, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSmoke(ctx: CanvasRenderingContext2D, smokes: Smoke[]) {
  ctx.fillStyle = "rgba(200,200,200,0.5)";
  smokes.forEach((s) => {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(s.x + i * 10, s.y - i * 5, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawUI(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${state.score}`, 20, 40);
  ctx.fillText(`Time: ${Math.ceil(state.timeLeft / 1000)}s`, 650, 40);
}

function drawGameOver(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "#FF0000";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 10;
  ctx.fillText("GAME OVER", canvas.width / 2 - 150, 60);
  ctx.shadowBlur = 0;
}

// --- Main Component ---
export default function ChickenEscape2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameStartTime = useRef<number>(0);

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
    isDucking: false,
  });

  const [fryer, setFryer] = useState<FryerState>({
    x: 800,
    y: 300,
    speed: 6,
  });

  const [smokes, setSmokes] = useState<Smoke[]>([
    { x: 500, y: 260, width: 60, height: 40 },
  ]);

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

    setChicken((prev) => {
      const gravity = 0.6;
      const jumpForce = -12;
      const groundY = 300;
      const newChicken = { ...prev };

      newChicken.isDucking = keysRef.current["ArrowDown"] || false;

      if (keysRef.current["Space"] && newChicken.isGrounded && !newChicken.isDucking) {
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

    setFryer((prev) => {
      const newFryer = { ...prev };
      newFryer.x -= newFryer.speed;
      if (newFryer.x + 40 < 0) {
        newFryer.x = canvas.width;
        newFryer.speed += 0.2;
        setGameState((prev) => ({ ...prev, score: prev.score + 1 }));
      }
      return newFryer;
    });

    setChicken((c) => {
      for (const smoke of smokes) {
        const height = c.isDucking ? 20 : 40;
        if (
          c.x < smoke.x + smoke.width &&
          c.x + 40 > smoke.x &&
          c.y < smoke.y + smoke.height &&
          c.y + height > smoke.y
        ) {
          hitSound.currentTime = 0;
          hitSound.play();
          setGameState((prev) => ({ ...prev, phase: "gameOver" }));
        }
      }

      if (
        c.x < fryer.x + 40 &&
        c.x + 40 > fryer.x &&
        c.y < fryer.y + 40 &&
        c.y + (c.isDucking ? 20 : 40) > fryer.y
      ) {
        hitSound.currentTime = 0;
        hitSound.play();
        setGameState((prev) => ({ ...prev, phase: "gameOver" }));
      }

      return c;
    });

    setGameState((prev) => ({ ...prev, timeLeft: newTimeLeft }));
  }, [gameState.phase, fryer.x, fryer.y, smokes]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas);

    // Draw smoke
    drawSmoke(ctx, smokes);

    // Draw fryer
    drawFryer(ctx, fryer);

    // Draw chicken
    drawChicken(ctx, chicken);

    // Draw UI
    drawUI(ctx, gameState);

    // Draw game over if needed
    if (gameState.phase === "gameOver") {
      drawGameOver(ctx, canvas);
    }
    if (gameState.phase === "gameWon") {
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#00FF00";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 10;
      ctx.fillText("YOU ESCAPED!", canvas.width / 2 - 180, 60);
      ctx.shadowBlur = 0;
    }
    }, [chicken, fryer, smokes, gameState]);
  
    // Add your useEffect hooks and return statement here
    // Example:
    useEffect(() => {
      let animationFrameId: number;
      function gameLoop() {
        updateGame();
        render();
        animationFrameId = requestAnimationFrame(gameLoop);
      }
      if (gameState.phase === "playing") {
        gameLoop();
      }
      return () => cancelAnimationFrame(animationFrameId);
    }, [gameState.phase, updateGame, render]);
  
    // Keyboard event listeners
    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        keysRef.current[e.code] = true;
        if (gameState.phase === "ready" && e.code === "Space") {
          setGameState((prev) => ({ ...prev, phase: "playing" }));
          gameStartTime.current = Date.now();
        }
      }
      function handleKeyUp(e: KeyboardEvent) {
        keysRef.current[e.code] = false;
      }
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [gameState.phase]);
  
    return (
      <div style={{ textAlign: "center" }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          style={{
            border: "4px solid #333",
            background: "#eee",
            marginTop: 20,
          }}
          tabIndex={0}
        />
        {gameState.phase === "ready" && (
          <div style={{ marginTop: 20, fontSize: 24 }}>
            Press <b>Space</b> to start!
          </div>
        )}
        {gameState.phase === "gameOver" && (
          <div style={{ marginTop: 20, fontSize: 24, color: "#FF0000" }}>
            Game Over! Press <b>Space</b> to restart.
          </div>
        )}
        {gameState.phase === "gameWon" && (
          <div style={{ marginTop: 20, fontSize: 24, color: "#00FF00" }}>
            You Escaped! Press <b>Space</b> to play again.
          </div>
        )}
      </div>
    );
  }