import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import ChickenEscape3D from "./ChickenEscape3D";
import ChickenEscape2D from "./ChickenEscape2D";

export default function GameMenu() {
  const [selectedGame, setSelectedGame] = useState<
    "menu" | "3d-submenu" | "3d-solo" | "3d-team" | "2d"
  >("menu");

  const controls3D = [
    { name: "jump", keys: ["Space"] },
    { name: "left", keys: ["KeyA", "ArrowLeft"] },
    { name: "right", keys: ["KeyD", "ArrowRight"] },
    { name: "restart", keys: ["Enter"] },
  ];

  // Solo / Team mode
  if (selectedGame === "3d-solo" || selectedGame === "3d-team") {
    const mode = selectedGame === "3d-team" ? "team" : "solo";

    return (
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <button
          onClick={() => setSelectedGame("menu")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            padding: "10px 20px",
            fontSize: 16,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          ← Back to Menu
        </button>
        <KeyboardControls map={controls3D}>
          <Canvas
            shadows
            camera={{ position: [0, 8, 12], fov: 60, near: 0.1, far: 1000 }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#87CEEB"]} />
            <Suspense fallback={null}>
              <ChickenEscape3D gameMode={mode} />
            </Suspense>
          </Canvas>
        </KeyboardControls>
      </div>
    );
  }

  // 3D Submenu
  if (selectedGame === "3d-submenu") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #87CEEB 0%, #FFE4B5 100%)",
          fontFamily: "Inter, Arial, sans-serif",
          color: "#333",
        }}
      >
        <button
          onClick={() => setSelectedGame("menu")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "10px 20px",
            fontSize: 16,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          ← Back to Menu
        </button>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 48, margin: 0, color: "#4CAF50" }}>
            🏃‍♂️ 3D Runner Mode 🏃‍♂️
          </h1>
          <p style={{ fontSize: 20, margin: "20px 0", color: "#666" }}>
            Choose your play style!
          </p>
        </div>
        <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
          <div
            onClick={() => setSelectedGame("3d-solo")}
            style={{
              width: 280,
              height: 180,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: 30,
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 15 }}>🐔</div>
            <h2
              style={{ fontSize: 24, margin: "0 0 10px 0", color: "#FF9800" }}
            >
              Solo Runner
            </h2>
            <p style={{ fontSize: 14, margin: 0, color: "#666" }}>
              Run alone and escape the fryer
            </p>
          </div>
          <div
            onClick={() => setSelectedGame("3d-team")}
            style={{
              width: 280,
              height: 180,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: 30,
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 15 }}>🤝</div>
            <h2
              style={{ fontSize: 24, margin: "0 0 10px 0", color: "#2196F3" }}
            >
              Team with AI
            </h2>
            <p style={{ fontSize: 14, margin: 0, color: "#666" }}>
              Defeat the fryer with AI teammates
            </p>
          </div>
        </div>
        <div style={{ marginTop: 40, textAlign: "center", color: "#888" }}>
          <p>Survive for 2 minutes to win! 🏆</p>
          <p>Last update: September 1st, 2025</p>
        </div>
      </div>
    );
  }

  // 2D Mode
  if (selectedGame === "2d") {
    return (
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <button
          onClick={() => setSelectedGame("menu")}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            padding: "10px 20px",
            fontSize: 16,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          ← Back to Menu
        </button>
        <ChickenEscape2D />
      </div>
    );
  }

  // Main Menu
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #87CEEB 0%, #FFE4B5 100%)",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#333",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: 72, margin: 0, color: "#FF6B35" }}>
          🐔 Chicken Escape 🐔
        </h1>
        <p style={{ fontSize: 24, margin: "20px 0", color: "#666" }}>
          Choose your adventure!
        </p>
        <p style={{ fontSize: 16, margin: "10px 0", color: "#888" }}>
          Created by SharkNinja on Aug 25, 2025
        </p>
      </div>
      <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
        <div
          onClick={() => setSelectedGame("3d-submenu")}
          style={{
            width: 300,
            height: 200,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 20,
            padding: 30,
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 15 }}>🏃‍♂️</div>
          <h2 style={{ fontSize: 28, margin: "0 0 10px 0", color: "#4CAF50" }}>
            3D Runner
          </h2>
          <p style={{ fontSize: 16, margin: 0, color: "#666" }}>
            Endless 3D running
          </p>
        </div>
        <div
          onClick={() => setSelectedGame("2d")}
          style={{
            width: 300,
            height: 200,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 20,
            padding: 30,
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 15 }}>🎮</div>
          <h2 style={{ fontSize: 28, margin: "0 0 10px 0", color: "#FF9800" }}>
            2D Classic
          </h2>
          <p style={{ fontSize: 16, margin: 0, color: "#666" }}>
            Side-scrolling platformer
          </p>
        </div>
      </div>
      <div style={{ marginTop: 40, textAlign: "center", color: "#888" }}>
        <p>Survive for 2 minutes to win!</p>
        <p>Last update: September 1st, 2025</p>
      </div>
    </div>
  );
}
