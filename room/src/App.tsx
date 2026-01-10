import './App.css';
import { useState } from "react";
import { MainMenu } from './components/MainMenu'
import { Room } from './components/Room';
import { AnimatePresence, motion } from "motion/react";

interface RoomPreferences {
  productivityGoal: string;
  mood: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<"menu" | "room">("menu");
  const [preferences, setPreferences] = useState<RoomPreferences | null>(null);

  const handleComplete = (prefs: RoomPreferences) => {
    setPreferences(prefs);
    setCurrentView("room");
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
            {preferences && <Room preferences={preferences} onBack={handleBack} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
