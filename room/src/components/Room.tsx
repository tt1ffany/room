// Handles lighting and camera setup for the room scene
import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Model } from "./Model";
import { AssetData } from "./AssetLibrary";
import { Button } from "./ui/button";
import { Sun, Moon, PanelLeft, PanelLeftClose, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";
const loaderOverlayStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
  backdropFilter: "blur(10px)", // The "Glass" effect
  zIndex: 9999,
  color: "#5B6B52",
  fontFamily: "sans-serif",
};

const loadingMessages = [
  "Deep breaths...",
  "Arranging your furniture...",
  "Optimizing for peace...",
  "Calibrating the light...",
  "Finalizing your sanctuary...",
];
interface RoomPreferences {
  productivityGoal: string;
  mood: string;
  lighting: string;
}

type LayoutId = "Energetic" | "Calm" | "Sample";

interface RoomProps {
  preferences: RoomPreferences;
  layoutId: LayoutId;
  explanation?: string;
  onBack: () => void;
  lightsOn?: boolean;
  onToggleLights?: () => void;
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
    position: [-1, 0.2, 0.25],
    rotation: [0, 3 * (Math.PI / 2), 0],
    scale: [1.4, 1.4, 1.4],
  },
  {
    asset_id: "chair2",
    position: [-0.75, 0.3, 0.25],
    rotation: [0, 3 * (Math.PI / 2), 0],
    scale: [0.7, 0.7, 0.7],
  },
  {
    asset_id: "plant2",
    position: [-1, 0.5, 0.9],
    rotation: [0, Math.PI / 2, 0],
  },
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

const getLightColor = (temp: number) => {
  if (temp <= 50) {
    // Warm → Neutral
    const t = temp / 50;
    return `rgb(
      ${255},
      ${Math.round(214 + (255 - 214) * t)},
      ${Math.round(165 + (255 - 165) * t)}
    )`;
  } else {
    // Neutral → Cool
    const t = (temp - 50) / 50;
    return `rgb(
      ${Math.round(255 - (255 - 205) * t)},
      ${Math.round(255 - (255 - 235) * t)},
      ${255}
    )`;
  }
};

const lightingPreferenceToTemp = (lighting: string): number => {
  switch (lighting.toLowerCase()) {
    case "warm":
      return 0;
    case "neutral":
      return 50;
    case "cool":
      return 100;
    default:
      return 50;
  }
};

export function Room({
  preferences,
  onBack,
  layoutId,
  explanation,
  onToggleLights,
}: RoomProps) {
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const layout =
    layoutId === "Calm"
      ? CALM_LAYOUT
      : layoutId === "Energetic"
      ? ENERGETIC_LAYOUT
      : SAMPLE_LAYOUT;

  const [showInfo, setShowInfo] = useState(true);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [shuffleLoading, setShuffleLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500); // Simulate a 4-second loading time
    return () => clearTimeout(timer);
  }, []);
  const [lightsOn, setLightsOn] = useState(true);
  const [lightTemp, setLightTemp] = useState<number>(() =>
    lightingPreferenceToTemp(preferences.lighting)
  );

  const toggleTimeOfDay = () => {
    setTimeOfDay(timeOfDay === "day" ? "night" : "day");
  };

  // Handle initial fade away of info (quick preview)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 3500); // Show info for 3.5 seconds
    return () => clearTimeout(timer);
  }, []);

  console.log("Using layoutId:", layoutId);
  console.log("Layout data:", layout);

  // State to manage arrangement (for future shuffling)
  const [arrange, setArrangement] = useState<AssetData[]>(layout);
  React.useEffect(() => {
    setArrangement(layout);
  }, [layoutId]);

  console.log("Current data:", layout);
  console.log("Current arrangement:", arrange);

  const shuffle = async () => {
    setShuffleLoading(true); // 1. Start the "pretty" loader
    try {
      const res = await fetch("http://localhost:8000/shuffle-arrangement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutId: layoutId,
          arrange: arrange,
        }),
      });
      const data: { arrange: AssetData[] } = await res.json();
      console.log("Received shuffled arrange:", data.arrange);
      setArrangement(data.arrange);
      console.log("Updated arrangement state:", data.arrange);
    } catch (error) {
      console.error("Error fetching shuffled arrangement:", error);
    } finally {
      setShuffleLoading(false); // 4. Stop the loader
    }
  };

  return (
    <div className="relative min-h-screen w-full flex">
      <AnimatePresence>
        {isAppLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#E8E4DD]"
          >
            {/* A calming, pulsing logo or icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="mb-8"
            >
              <h2 className="text-3xl font-light tracking-[0.2em] text-[#5B6B52]">
                RUMO
              </h2>
            </motion.div>

            <div className="w-32 h-[1px] bg-[#D4CFBF] overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
                className="w-full h-full bg-[#6B8E5F]"
              />
            </div>
            <p className="mt-4 text-xs tracking-widest text-[#5B6B52]/60 uppercase">
              Finding your balance
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shuffleLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#E8E4DD]"
          >
            {/* A calming, pulsing logo or icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="mb-8"
            >
              <h2 className="text-3xl font-light tracking-[0.2em] text-[#5B6B52]">
                RUMO
              </h2>
            </motion.div>

            <div className="w-32 h-[1px] bg-[#D4CFBF] overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
                className="w-full h-full bg-[#6B8E5F]"
              />
            </div>
            <p className="mt-4 text-xs tracking-widest text-[#5B6B52]/60 uppercase">
              Finding your balance
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <div
        className={`border-r transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-80" : "w-0"
          } ${timeOfDay === "day"
            ? "bg-[#E8E4DD] border-[#D4CFBF]"
            : "bg-[#252525] border-[#3A3A3A]"
          }`}
      >
        <div
          className={`flex-1 p-6 space-y-6 overflow-hidden ${isSidebarOpen ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
        >
          <h3
            className={`text-2xl font-medium ${timeOfDay === "day" ? "text-[#2C2416]" : "text-white"
              }`}
          >
            Customize
          </h3>

          {/* timeOfDay Toggle */}
          <div className="space-y-3">
            <label
              className={`text-sm font-medium ${timeOfDay === "day" ? "text-[#5B6B52]" : "text-[#A8B8A0]"
                }`}
            >
              Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeOfDay("day")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${timeOfDay === "day"
                    ? "bg-gradient-to-br from-[#6B8E5F] to-[#8BA878] text-white shadow-lg"
                    : timeOfDay === "night"
                      ? "bg-[#1A1A1A] text-[#A8B8A0] hover:bg-[#2A2A2A]"
                      : "bg-white/50 text-[#5B6B52] hover:bg-white/70"
                  }`}
              >
                <Sun className="w-5 h-5" />
                <span>Day</span>
              </button>
              <button
                onClick={() => setTimeOfDay("night")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${timeOfDay === "night"
                    ? "bg-gradient-to-br from-[#4A4A4A] to-[#2A2A2A] text-white shadow-lg"
                    : timeOfDay === "day"
                      ? "bg-white/50 text-[#5B6B52] hover:bg-white/70"
                      : "bg-[#1A1A1A] text-[#A8B8A0] hover:bg-[#2A2A2A]"
                  }`}
              >
                <Moon className="w-5 h-5" />
                <span>Night</span>
              </button>
            </div>
          </div>

          {/* Room Info */}
          <div
            className={`p-4 rounded-xl ${timeOfDay === "day"
                ? "bg-white/50 border border-[#C8D5BC]/40"
                : "bg-black/20 border border-[#3A3A3A]/60"
              }`}
          >
            <h4
              className={`text-sm font-medium mb-3 ${timeOfDay === "day" ? "text-[#2C2416]" : "text-white"
                }`}
            >
              Room Settings
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span
                  className={
                    timeOfDay === "day" ? "text-[#5B6B52] font-medium" : "text-[#A8B8A0] font-medium"
                  }
                >
                  Goal:
                </span>
                <span
                  className={
                    timeOfDay === "day" ? "text-[#2C2416]" : "text-white"
                  }
                >
                  {preferences.productivityGoal}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={
                    timeOfDay === "day" ? "text-[#5B6B52] font-medium" : "text-[#A8B8A0] font-medium"
                  }
                >
                  Mood:
                </span>
                <span
                  className={
                    timeOfDay === "day" ? "text-[#2C2416]" : "text-white"
                  }
                >
                  {preferences.mood}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${timeOfDay === "day"
                ? "bg-white/50 border border-[#C8D5BC]/40"
                : "bg-black/20 border border-[#3A3A3A]/60"
              }`}
          >
            <h4
              className={`text-sm font-medium mb-3 ${timeOfDay === "day" ? "text-[#2C2416]" : "text-white"
                }`}
            >
              Light Settings
            </h4>
            {/* Lights Toggle Switch */}
            <div className="flex items-center justify-between py-3 rounded-xl">
              <span
                className={`text-sm font-medium transition ${timeOfDay === "day" ? "text-[#5B6B52]" : "text-[#A8B8A0]"
                  }`}
              >
                Lights
              </span>

              <button
                onClick={() => setLightsOn((prev) => !prev)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300
      ${lightsOn
                    ? "bg-gradient-to-br from-[#6B8E5F] to-[#8BA878]"
                    : "bg-gray-400/50"
                  }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
        transition-transform duration-300
        ${lightsOn ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Lighting Temperature */}
            <div className="space-y-3">
              <label
                className={`text-sm font-medium ${timeOfDay === "day" ? "text-[#5B6B52]" : "text-[#A8B8A0]"
                  }`}
              >
                Lighting Temperature
              </label>

              <input
                type="range"
                min={0}
                max={100}
                value={lightTemp}
                onChange={(e) => setLightTemp(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />

              <div className="flex justify-between text-xs">
                <span className="text-amber-500">Warm</span>
                <span className="text-gray-400">Neutral</span>
                <span className="text-blue-400">Cool</span>
              </div>
            </div>
          </div>

          {/* Shuffle Room Button */}
          <button
            onClick={shuffle}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${timeOfDay === "day"
                ? "bg-white/50 text-[#5B6B52] hover:bg-gradient-to-br from-[#6B8E5F] to-[#8BA878] hover:text-white shadow-lg"
                : timeOfDay === "night"
                  ? "bg-[#1A1A1A] text-[#A8B8A0] hover:bg-[#2A2A2A]"
                  : "bg-white/50 text-[#5B6B52] hover:bg-white/70"
              }`}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Room
          </button>
        </div>

        {/* Create a New Space Button at Bottom */}
        <div
          className={`p-6 border-t ${isSidebarOpen ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300 ${timeOfDay === "day" ? "border-[#D4CFBF]" : "border-[#3A3A3A]"
            }`}
        >
          <Button
            onClick={onBack}
            variant="ghost"
            className={`w-full ${timeOfDay === "day"
                ? "text-[#5B6B52] hover:text-[#2C2416] hover:bg-white/50"
                : "text-[#A8B8A0] hover:text-white hover:bg-white/10"
              }`}
          >
            ← Create a New Space
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        className={`flex-1 relative transition-colors duration-500 ${timeOfDay === "day" ? "bg-[#F5F5F0]" : "bg-[#1A1A1A]"
          }`}
        style={{
          backgroundImage:
            timeOfDay === "day"
              ? `linear-gradient(#D4D4C8 1px, transparent 1px),
                 linear-gradient(90deg, #D4D4C8 1px, transparent 1px)`
              : `linear-gradient(#2A2A2A 1px, transparent 1px),
                 linear-gradient(90deg, #2A2A2A 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      >
        {/* Sidebar Toggle Button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-3 rounded-xl transition-all duration-300 ${timeOfDay === "day"
                ? "bg-white/50 hover:bg-white/70 text-[#5B6B52] border border-[#C8D5BC]/40"
                : "bg-black/30 hover:bg-black/50 text-[#A8B8A0] border border-[#3A3A3A]/60"
              }`}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <Canvas shadows camera={{ position: [2.5, 2.5, 2.5], fov: 50 }}>
          {/* Natural ambient */}
          <ambientLight intensity={timeOfDay === "day" ? 0.45 : 0.1} />

          {/* Sun / Moon */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={timeOfDay === "day" ? 1.2 : 0.15}
            color={timeOfDay === "day" ? "#ffffff" : "#9DB4FF"}
            castShadow
          />

          <Suspense fallback={null}>
            {/* The Room Floor */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.01, 0]}
              receiveShadow
            >
              <planeGeometry args={[2.5, 2.5]} />
              <meshStandardMaterial color="#d0b17a" />
            </mesh>

            {/* Back Walls */}
            <mesh
              rotation={[0, 0, 0]}
              position={[0, 0.74, -1.25]}
              receiveShadow
            >
              <planeGeometry args={[2.5, 1.5]} />
              {layoutId === "Energetic" ? (
                <meshStandardMaterial color="#acc18a" />
              ) : (
                <meshStandardMaterial color="#ECE9D6" />
              )}
            </mesh>
            <mesh
              rotation={[0, Math.PI / 2, 0]}
              position={[-1.25, 0.74, 0]}
              receiveShadow
            >
              <planeGeometry args={[2.5, 1.5]} />
              {layoutId === "Energetic" ? (
                <meshStandardMaterial color="#acc18a" />
              ) : (
                <meshStandardMaterial color="#ECE9D6" />
              )}
            </mesh>

            {/* Render the Layout Array */}
            <group>
              {arrange.map((item, index) => (
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

            {/* Artificial Lighting */}
            {lightsOn && (
              <>
                <pointLight
                  position={[-1, 1.2, 1]} // near lamp
                  intensity={timeOfDay === "night" ? 1.4 : 0.5}
                  distance={4}
                  decay={2}
                  color={getLightColor(lightTemp)}
                  castShadow
                />

                <pointLight
                  position={[0.5, 1.1, -0.8]} // desk lamp
                  intensity={timeOfDay === "night" ? 1.0 : 0.35}
                  distance={3}
                  decay={2}
                  color={getLightColor(lightTemp)}
                />
              </>
            )}
            <Environment preset={timeOfDay === "day" ? "city" : "night"} />
            <OrbitControls makeDefault />
          </Suspense>
        </Canvas>
      </div>

      {/* Room Description / Info Button (Tool Tip) */}
      <div className="absolute top-0 right-0 z-20">
        {/* Info Button / Tool Tip */}
        <button
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full
             bg-white/90 text-sm font-semibold
             flex items-center justify-center
             hover:bg-black/50 transition hover:text-white"
        >
          i
        </button>

        {/* Description Box */}
        <div
          className={`
            absolute top-16 right-4 z-10 w-[420px] 
            bg-white/60 backdrop-blur-md rounded-3xl 
            text-[#2C2416] text-sm 
            p-6 shadow-xl border border-[#C8D5BC]/40 
            transition-all duration-300 ease-out 
            ${showInfo
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
            }`}
        >
          {explanation && <p>{explanation}</p>}
        </div>
      </div>
    </div>
  );
}
