import "./App.css";
import { useState } from "react";
import { MainMenu } from "./components/MainMenu";
import { Room } from "./components/Room";
import { AnimatePresence, motion } from "motion/react";

interface RoomPreferences {
  productivityGoal: string;
  mood: string;
  lighting: string;
}

type LayoutId = "Energetic" | "Calm" | "Sample";

export default function App() {
  const [currentView, setCurrentView] = useState<"menu" | "room">("menu");
  const [preferences, setPreferences] = useState<RoomPreferences | null>(null);

  const [layoutId, setLayoutId] = useState<LayoutId>("Sample");
  const [explanation, setExplanation] = useState<string>("");

  const handleComplete = async (prefs: RoomPreferences) => {
    setPreferences(prefs);
    setCurrentView("room");

    try {
      const res = await fetch("http://localhost:8000/generate-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: prefs,
        }),
      });

      const data: { layoutId: LayoutId; explanation?: string } =
        await res.json();

      setLayoutId(data.layoutId);
      setExplanation(data.explanation ?? "");
      console.log("Received layoutId:", data.layoutId);
      console.log("Received explanation:", data.explanation);
    } catch (error) {
      console.error("Error fetching room layout:", error);
    }
  };

  const handleBack = () => {
    setCurrentView("menu");
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === "menu" ? (
          <motion.div
            key="menu"
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <MainMenu onComplete={handleComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {preferences && (
              <Room
                preferences={preferences}
                layoutId={layoutId}
                explanation={explanation}
                onBack={handleBack}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
