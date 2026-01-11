// Handles lighting and camera setup for the room scene
import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Model } from "./Model";
import { AssetData } from "./AssetLibrary";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

interface RoomPreferences {
  productivityGoal: string;
  mood: string;
}

interface RoomProps {
  preferences: RoomPreferences;
  onBack: () => void;
}

// Sample Layouts (Replace with dynamic data from Backend later)
const SAMPLE_LAYOUT: AssetData[] = [
  { asset_id: "desk1", position: [0, 0, -0.75], rotation: [0, 0, 0] },
  { asset_id: "chair1", position: [0.5, 0, -0.75], rotation: [0, 3.14, 0] },
  { asset_id: "plant1", position: [1, 0, -1], rotation: [0, 0, 0] },
  { asset_id: "bed1", position: [-1.25, 0, 0], rotation: [0, 0, 0] },
  { asset_id: "lamp1", position: [-1, 0, 1], rotation: [0, 0, 0] },
  { asset_id: "rug1", position: [-0.5, 0, 0.5], rotation: [0, 0, 0] },
];

const CALM_LAYOUT: AssetData[] = [
  {
    asset_id: "desk2",
    position: [-1, 0.2, 0.75],
    rotation: [0, 3 * (Math.PI / 2), 0],
    scale: [1.4, 1.4, 1.4],
  },
  {
    asset_id: "chair2",
    position: [-0.75, 0.3, 0.75],
    rotation: [0, 3 * (Math.PI / 2), 0],
    scale: [0.7, 0.7, 0.7],
  },
  { asset_id: "plant2", position: [-1, 0.5, 0], rotation: [0, Math.PI / 2, 0] },
  { asset_id: "bed2", position: [0.5, 0.25, -0.75], rotation: [0, 0, 0] },
  { asset_id: "lamp2", position: [-0.2, 0.5, -1], rotation: [0, 0, 0] },
  { asset_id: "rug2", position: [0.5, 0, -0.25], rotation: [0, 0, 0] },
];
const ENERGETIC_LAYOUT: AssetData[] = [
  {
    asset_id: "desk3",
    position: [0.6, 0.35, -1],
    rotation: [0, 0, 0],
    scale: [1.25, 1.25, 1.25],
  },
  {
    asset_id: "chair3",
    position: [0.7, 0.35, -0.55],
    rotation: [0, 3.14, 0],
    scale: [0.75, 0.75, 0.75],
  },
  { asset_id: "plant3", position: [-1, 0.5, -1], rotation: [0, 0, 0] },
  {
    asset_id: "bed3",
    position: [-0.65, 0.25, 0.5],
    rotation: [0, Math.PI / 2, 0],
    scale: [1.2, 1.2, 1.2],
  },
  { asset_id: "lamp3", position: [-1, 0.5, 1], rotation: [0, 0, 0] },
];

export function Room({ preferences, onBack }: RoomProps) {
  const [layout, setLayout] = useState<AssetData[]>(CALM_LAYOUT);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'night'>('morning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function askGemini() {
    try {
      const res = await fetch("http://127.0.0.1:8000/generate-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ user_personality: "..." }) // if you add this
      });
      console.log("status:", res.status);

      const data = await res.json();
      console.log("Gemini Response:", data);

      if (data.layoutId === "calm") setLayout(CALM_LAYOUT);
      else if (data.layoutId === "energetic") setLayout(ENERGETIC_LAYOUT);
      else setLayout(SAMPLE_LAYOUT);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
      <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
        {/* Basic Lighting (Make this dynamic later) */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Suspense fallback={null}>
          {/* The Room Floor */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[2.5, 2.5]} />
            <meshStandardMaterial color="#d3d1d1" />
          </mesh>

          {/* Back Walls */}
          <mesh rotation={[0, 0, 0]} position={[0, 0.74, -1.25]} receiveShadow>
            <planeGeometry args={[2.5, 1.5]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh
            rotation={[0, Math.PI / 2, 0]}
            position={[-1.25, 0.74, 0]}
            receiveShadow
          >
            <planeGeometry args={[2.5, 1.5]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>

          {/* Render the Layout Array */}
          <group>
            {layout.map((item, index) => (
              <Model
                key={index}
                id={item.asset_id}
                position={item.position}
                rotation={item.rotation}
                scale={item.scale}
              />
            ))}
          </group>

          {/* Aesthetics */}
          <ContactShadows
            resolution={1024}
            scale={20}
            blur={2}
            opacity={0.5}
            far={1}
          />
          <Environment preset="city" />
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>

      {/* HUD for Testing */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <h2>My Room</h2>
        {/* <p>Assets Loaded: {layout.length}</p> */}
        <button>Go Back To Start</button>
      </div>

      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-4 left-4 z-30 shadow-lg transition-colors ${timeOfDay === 'night'
          ? 'bg-slate-800/90 hover:bg-slate-700/90 text-white'
          : 'bg-white/90 hover:bg-amber-100/60'
          }`}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar (Menu) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        timeOfDay={timeOfDay}
        onTimeChange={setTimeOfDay}
        onShuffle={askGemini}
      />
    </div>
  );
}
