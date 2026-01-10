import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { ASSET_MAP } from "./AssetLibrary";

interface ModelProps {
  id: string; // The ID from Gemini (e.g., "desk")
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
}

export function Model({ id, position, rotation, scale }: ModelProps) {
  // Look up the file path. Fallback to default if not found.
  const filePath = ASSET_MAP[id] || ASSET_MAP["default"];

  // Load the 3D model (Auto-cached by Drei)
  const { scene } = useGLTF(filePath);

  // Clone the scene so we can reuse the same asset multiple times
  // (e.g., 4 chairs around a table)
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale || [1, 1, 1]}
      dispose={null} // optimizing memory
    />
  );
}

// Pre-load all assets so there's no "pop-in" delay during
Object.values(ASSET_MAP).forEach((path) => useGLTF.preload(path));
