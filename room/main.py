import os
from google import genai
import json
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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



# 1. Define the Personality (This could eventually come from a user input/form)
user_personality = "I am really shy"

# 2. The Setup
system_instruction = """
You are a 3D Layout Assistant for the 'DecideRoom' app. 
You must analyze the user's personality and pick exactly one of these 3D layouts:

Layout 'energetic': 'Kinetic Studio' (Creative, Orange/Green, curved shapes, movement)
Layout 'calm': 'Grounded Retreat' (Calm, Wood tones, low profile, neutrals)
Layout 'sample': 'Balanced Standard' (Practical, symmetrical, generic pieces)

Output ONLY a JSON object: {"layoutId": "energetic", "explanation": "one sentence reasoning"}
"""

@app.post("/generate-room")
async def generate_room(user_personality=user_personality, system_instruction=system_instruction):
    # model = genai.GenerativeModel('gemini-1.5-flash')
    
    # 3. Call Gemini
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config={'system_instruction': system_instruction},
        contents=user_personality
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