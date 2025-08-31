import { useState, useEffect } from "react";

interface GameState {
  score: number;
  timeLeft: number;
  phase: "ready" | "playing" | "gameOver" | "gameWon";
}

export default function GameUI({ gameState }: { gameState: GameState }) {
  return (
    <div style={{ position: "absolute", top: 10, left: 10, color: "white" }}>
      <p>Score: {gameState.score}</p>
      <p>Time: {Math.ceil(gameState.timeLeft / 1000)}s</p>
      <p>
        Phase:{" "}
        {gameState.phase === "ready"
          ? "Click to Start"
          : gameState.phase === "playing"
            ? "Playing"
            : gameState.phase === "gameOver"
              ? "Game Over"
              : "You Win!"}
      </p>
    </div>
  );
}
