import os
from google import genai
import json
from dotenv import load_dotenv

# Initialize with your working key
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 1. Define the Personality (This could eventually come from a user input/form)
user_personality = "I dont know what i want"

# 2. The Setup
system_instruction = """
You are a 3D Layout Assistant for the 'DecideRoom' app. 
You must analyze the user's personality and pick exactly one of these 3D layouts:

Layout ID 1: 'Kinetic Studio' (Creative, Orange/Green, curved shapes, movement)
Layout ID 2: 'Grounded Retreat' (Calm, Wood tones, low profile, neutrals)
Layout ID 3: 'Balanced Standard' (Practical, symmetrical, generic pieces)

Output ONLY a JSON object: {"layout_id": 1, "explanation": "..."}
"""

# 3. Call Gemini
response = client.models.generate_content(
    model="gemini-2.0-flash",
    config={'system_instruction': system_instruction},
    contents=user_personality
)

# 4. Use the Result
try:
    # Clean the response text (just in case Gemini adds markdown)
    clean_json = response.text.replace("```json", "").replace("```", "").strip()
    decision = json.loads(clean_json)
    
    print(f"--- DECIDEROOM RESULT ---")
    print(f"Selected Layout ID: {decision['layout_id']}")
    print(f"Reasoning: {decision['explanation']}")
    
    # This is where you would call your 3D loading function:
    # load_3d_scene(decision['layout_id'])
    
except Exception as e:
    print(f"Error parsing Gemini's choice: {e}")