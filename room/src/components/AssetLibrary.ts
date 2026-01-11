// Maps the "ID" Gemini uses to the actual file in your public/assets folder
export const ASSET_MAP: Record<string, string> = {
  // Sample default room assets
  desk1: "/assets/sample/desk.glb",
  chair1: "/assets/sample/chair.glb",
  lamp1: "/assets/sample/lampRoundFloor.glb",
  bed1: "/assets/sample/bedSingle.glb",
  plant1: "/assets/sample/pottedPlant.glb",
  rug1: "/assets/sample/rugRound.glb",
  // Calm room assets
  desk2: "/assets/deskCalm.glb",
  chair2: "/assets/chairWhite.glb",
  lamp2: "/assets/lampCylinder.glb",
  bed2: "/assets/bedCalm.glb",
  plant2: "/assets/plantCalm.glb",
  rug2: "/assets/rugCalm.glb",
  // Energetic room assets
  desk3: "/assets/deskOval.glb",
  chair3: "/assets/chairOrange.glb",
  lamp3: "/assets/lampRoundTop.glb",
  bed3: "/assets/bedOrange.glb",
  plant3: "/assets/plantLeaves.glb",
  // Add a default to prevent crashing if AI hallucinates an ID
  default: "/assets/sample/pottedPlant.glb",
  light: "/assets/light.glb",
};

// Types for the data coming from your future Backend
export interface AssetData {
  asset_id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
}
