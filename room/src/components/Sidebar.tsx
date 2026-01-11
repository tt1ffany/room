import { on } from "events";
import { Button } from "./ui/button";
import { X, Sun, Sunset, Moon, Shuffle } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  timeOfDay: "morning" | "evening" | "night";
  onTimeChange: (time: "morning" | "evening" | "night") => void;
  onShuffle: () => void;
}

// Theme configurations for each time of day
const themes = {
  morning: {
    bg: "bg-amber-50/40 backdrop-blur-xl border-r border-amber-200/30",
    text: "text-gray-800",
    textSecondary: "text-amber-700/70",
    hover: "hover:bg-amber-100/60",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    buttonGhost: "hover:bg-amber-100/50 text-gray-700",
    border: "border-amber-200/30",
    accent: "text-amber-600",
    icon: "text-amber-600",
  },
  evening: {
    bg: "bg-purple-100/40 backdrop-blur-xl border-r border-purple-200/30",
    text: "text-gray-800",
    textSecondary: "text-purple-700/70",
    hover: "hover:bg-purple-200/50",
    button:
      "bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white",
    buttonGhost: "hover:bg-purple-100/50 text-gray-700",
    border: "border-purple-200/30",
    accent: "text-purple-600",
    icon: "text-orange-600",
  },
  night: {
    bg: "bg-slate-900/40 backdrop-blur-xl border-r border-slate-700/30",
    text: "text-gray-100",
    textSecondary: "text-blue-300/70",
    hover: "hover:bg-slate-700/50",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonGhost: "hover:bg-slate-700/50 text-gray-100",
    border: "border-slate-700/30",
    accent: "text-blue-400",
    icon: "text-blue-400",
  },
};

export function Sidebar({
  isOpen,
  onClose,
  timeOfDay,
  onTimeChange,
  onShuffle,
}: SidebarProps) {
  const theme = themes[timeOfDay];

  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 shadow-2xl z-30 transform transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${theme.bg}`}
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${theme.border}`}
        >
          <h2 className={`text-xl ${theme.text}`}>My Room</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={theme.buttonGhost}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Time of Day Selector */}
        <div className="p-4">
          <div className="flex gap-2 justify-center">
            {/* Morning Button */}
            <Button
              variant={timeOfDay === "morning" ? "default" : "ghost"}
              size="sm"
              onClick={() => onTimeChange("morning")}
              className={
                timeOfDay === "morning"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : theme.buttonGhost
              }
            >
              <Sun className="h-4 w-4" />
            </Button>
            {/* Evening Button */}
            <Button
              variant={timeOfDay === "evening" ? "default" : "ghost"}
              size="sm"
              onClick={() => onTimeChange("evening")}
              className={
                timeOfDay === "evening"
                  ? "bg-gradient-to-r from-orange-500 to-purple-500 text-white"
                  : theme.buttonGhost
              }
            >
              <Sunset className="h-4 w-4" />
            </Button>
            {/* Night Button */}
            <Button
              variant={timeOfDay === "night" ? "default" : "ghost"}
              size="sm"
              onClick={() => onTimeChange("night")}
              className={
                timeOfDay === "night"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : theme.buttonGhost
              }
            >
              <Moon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Shuffle Room Button */}
        <div className={`px-4 pt-4 border-t ${theme.border}`}>
          <Button className={`w-full ${theme.button}`} onClick={onShuffle}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle Room
          </Button>
        </div>
      </div>
    </div>
  );
}
