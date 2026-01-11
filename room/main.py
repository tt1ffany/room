import os
from google import genai
import json
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Tuple

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Initialize with your working key
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Define the data models

class Preferences(BaseModel):
    productivityGoal: Literal["Focused", "Creative"] = Field(..., description="Focused or Creative")
    mood: Literal["Calm", "Energetic"] = Field(..., description="Calm or Energetic")
    lighting: Literal["Warm", "Neutral", "Cool"] = Field(..., description="Warm, Neutral,or Cool")

class IntakeRequest(BaseModel):
    preferences: Preferences

class LayoutResponse(BaseModel):
    layoutId: str
    explanation: str

def build_user_personality(p: Preferences) -> str:
    return (
        f"Between being focused and creative, my productivity style is {p.productivityGoal}. "
        f"Between being calm and energetic, my energy level is {p.mood}. "
        f"And I prefer {p.lighting} lighting in my workspace."
    )

# 2. The Setup
system_instruction = """
You are a 3D Layout Assistant for the 'DecideRoom' app. 
You must analyze the user's personality and preferences to pick exactly one of these 3D layouts:

Energetic, Calm, or Sample.

Layount 1: "Energetic". Sometimes called the 'Kinetic Studio' (Creative, Orange/Green, curved shapes, movement)
Layout 2: 'Calm'. Sometimes called the 'Grounded Retreat' (Calm, Wood tones, low profile, neutrals)
Layout 3: 'Sample'. Sometimes called the 'Balanced Standard' (Practical, symmetrical, generic pieces)

Output ONLY a JSON object: {"layoutId": "Energetic", "explanation": "two sentence reasoning"}
"""

@app.post("/generate-room")
async def generate_room(payload: IntakeRequest) -> LayoutResponse:
  
    # model = genai.GenerativeModel('gemini-1.5-flash')
    
    # 3. Call Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config={'system_instruction': system_instruction},
        contents=build_user_personality(payload.preferences)
    )

# 4. Use the Result

    # Clean the response text (just in case Gemini adds markdown)
    clean_json = response.text.replace("```json", "").replace("```", "").strip()
    decision = json.loads(clean_json)
    layout_id = decision['layoutId']

    
    print(f"--- DECIDEROOM RESULT ---")
    print(f"Selected Layout ID: {decision['layoutId']}")
    print(f"Reasoning: {decision['explanation']}")

    return {"layoutId": layout_id, "explanation": decision.get("explanation", "")}
    
    # This is where you would call your 3D loading function:
    # load_3d_scene(decision['layoutId'])
    
# except Exception as e:
#     print(f"Error parsing Gemini's choice: {e}")


# ---------- Shuffle models ----------

Vec3 = Tuple[float, float, float]

LayoutId = Literal["Energetic", "Calm", "Sample"]

class AssetPlacement(BaseModel):
    asset_id: str
    position: Vec3
    rotation: Vec3
    scale: Optional[Vec3] = None

class ShuffleRequest(BaseModel):
    layoutId: LayoutId
    arrange: List[AssetPlacement]

class ShuffleResponse(BaseModel):
    arrange: List[AssetPlacement]


def build_shuffle_prompt(layout_id: str, arrange: List[AssetPlacement]) -> str:
    arrange_json = json.dumps([a.model_dump() for a in arrange])

    return f"""
Return ONLY valid JSON. No markdown. No commentary.

You are asked to rearrange furniture in a virtual room.
You must stay in the same layout style: "{layout_id}".

Output type:
[
  {{ "asset_id": string, "position": [number, number, number], "rotation": [number, number, number], "scale": [number, number, number] | null }}
]

Rules:
- all assets MUST stay within the room bounds: x in [-1, 1], z in [-1, 1]
- assets can not be in contact with each other, must be as far apart as possible within the room bounds.
- Keep the exact same items (same asset_id set and same array length).
- Do NOT change any asset_id values.
- Only change position[x,z] and rotation[y]. Keep position[y] the same as input.
- rotation[y] must be one of: 0, 1.57079632679, 3.14159265359, 4.71238898038
- If an item has "scale", keep scale EXACTLY the same as input.
- Keep items at least 0.25 units apart (approx).
- keep the chair and desk assets near each other in every arrangement and must have the same rotation[y] output value.

Input arrange JSON:
{arrange_json}
""".strip()

@app.post("/shuffle-arrangement")
async def shuffle_arrangment(request: ShuffleRequest) -> ShuffleResponse    :

    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=build_shuffle_prompt(request.layoutId, request.arrange)
    )


    clean_json = (response.text or "").replace("```json", "").replace("```", "").strip()
    new_arrange_raw = json.loads(clean_json)

    new_arrange = [AssetPlacement(**item) for item in new_arrange_raw]

    return ShuffleResponse(arrange=new_arrange)



