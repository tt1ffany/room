// Handles lighting and camera setup for the room scene
import React, { useState, Suspense, useEffect } from "react";
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
  lighting: string;
}

type LayoutId = "Energetic" | "Calm" | "Sample";

interface RoomProps {
  layoutId: LayoutId;
  explanation?: string;
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

export function Room({ onBack, layoutId, explanation }: RoomProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'night'>('morning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const layout =
    layoutId === "Calm"
      ? CALM_LAYOUT
      : layoutId === "Energetic"
        ? ENERGETIC_LAYOUT
        : SAMPLE_LAYOUT;
  const [showInfo, setShowInfo] = useState(true);

  // Handle initial fade away of info (quick preview)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 3500); // Show info for 3.5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
      <Canvas shadows camera={{ position: [2.5, 2.5, 2.5], fov: 50 }}>
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

      {/* Room Description / Info Button (Tool Tip) */}
      <div className="absolute top-0 right-0 z-20">
        {/* Info Button / Tool Tip */}
        <button
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full
             bg-black/60 text-white text-sm font-semibold
             flex items-center justify-center
             hover:bg-white/80 transition hover:text-black"
        >
          i
        </button>

        {/* Description Box */}
        <div className={`
            absolute top-16 right-4 z-10 w-[420px] 
            bg-white/60 backdrop-blur-md rounded-3xl 
            text-[#2C2416] text-sm 
            p-6 shadow-xl border border-[#C8D5BC]/40 
            transition-all duration-300 ease-out 
            ${showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          {explanation && <p>{explanation}</p>}
        </div>
      </div>

      {/* Create a New Space Button */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-[#5B6B52] hover:text-[#2C2416] hover:bg-white/50"
        >
          ← Create a New Space
        </Button>
      </div>

      {/* Sidebar Menu Button */}
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
      // onShuffle={askGemini}
      />
    </div>
  );
}
