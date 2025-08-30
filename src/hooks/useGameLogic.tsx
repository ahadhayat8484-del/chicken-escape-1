import { useState, useEffect, useCallback, useRef } from "react";

export interface GameState {
  score: number;
  timeLeft: number;
  phase: "ready" | "playing" | "gameOver" | "gameWon";
}

export interface ChickenState {
  position: [number, number, number];
  color?: string;
  velocityY?: number;
  onGround?: boolean;
  justJumped?: boolean;
  justHit?: boolean;
}

export interface FryerState {
  position: [number, number, number];
}

export interface AIState {
  position: [number, number, number];
  color: string;
}

export function useGameLogic(gameMode: "solo" | "team") {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 120000,
    phase: "ready",
  });

  const [chicken, setChicken] = useState<ChickenState>({
    position: [0, 0, 0],
    velocityY: 0,
    onGround: true,
    color: "#FFD700",
  });

  const [fryer, setFryer] = useState<FryerState>({ position: [10, 0, 0] });
  const [aiTeammates, setAITeammates] = useState<AIState[]>([
    { position: [-2, 0, 0], color: "#00FF00" },
  ]);

  // Audio refs
  const jumpAudioRef = useRef<HTMLAudioElement | null>(null);
  const hitAudioRef = useRef<HTMLAudioElement | null>(null);

  const playJumpSound = useCallback(() => {
    if (jumpAudioRef.current) {
      jumpAudioRef.current.currentTime = 0;
      jumpAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playHitSound = useCallback(() => {
    if (hitAudioRef.current) {
      hitAudioRef.current.currentTime = 0;
      hitAudioRef.current.play().catch(() => {});
    }
  }, []);

  const jump = () => {
    setChicken((prev) => {
      if (prev.onGround) {
        playJumpSound();
        return { ...prev, velocityY: 0.15, onGround: false, justJumped: true };
      }
      return prev;
    });
  };

  const startGame = () => {
    setGameState({ score: 0, timeLeft: 120000, phase: "playing" });
  };

  useEffect(() => {
    if (gameState.phase !== "playing") return;

    const gravity = -0.01;

    const interval = setInterval(() => {
      // Timer
      setGameState((prev) => {
        const newTime = prev.timeLeft - 16;
        if (newTime <= 0) return { ...prev, timeLeft: 0, phase: "gameOver" };
        return { ...prev, timeLeft: newTime };
      });

      // Fryer movement
      setFryer((prev) => {
        let newX = prev.position[0] - 0.05;
        if (newX < -10) {
          newX = 10;
          setGameState((prevState) => ({
            ...prevState,
            score: prevState.score + 1,
          }));
        }
        return { position: [newX, prev.position[1], prev.position[2]] };
      });

      // Chicken physics
      setChicken((prev) => {
        let newY = prev.position[1] + (prev.velocityY || 0);
        let velocityY = (prev.velocityY || 0) + gravity;
        let onGround = false;

        if (newY <= 0) {
          newY = 0;
          velocityY = 0;
          onGround = true;
        }

        // Hit detection
        const fryerX = fryer.position[0];
        let justHit = false;
        if (Math.abs(prev.position[0] - fryerX) < 0.5 && newY <= 0.3) {
          justHit = true;
          playHitSound();
        }

        return {
          ...prev,
          position: [prev.position[0], newY, prev.position[2]],
          velocityY,
          onGround,
          justJumped: false,
          justHit,
        };
      });

      // AI teammates (basic)
      if (gameMode === "team") {
        setAITeammates((prev) =>
          prev.map((ai) => ({
            ...ai,
            position: [ai.position[0] + 0.02, ai.position[1], ai.position[2]],
          }))
        );
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gameState.phase, gameMode, fryer.position, playHitSound, playJumpSound]);

  return {
    gameState,
    chicken,
    fryer,
    aiTeammates,
    jump,
    startGame,
    playJumpSound,
    playHitSound,
    jumpAudioRef,
    hitAudioRef,
  };
}
