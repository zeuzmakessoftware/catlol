import os
import base64
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from parent directory's .env file
load_dotenv(dotenv_path='../.env')

# Get API key with error handling
api_key = os.environ.get("NEBIUS_API_KEY")
if not api_key:
    raise ValueError("NEBIUS_API_KEY not found in environment variables. Please check your .env file.")

client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1/",
    api_key=api_key
)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Replace with your image path
image_path = "path/to/your/image.jpg"
base64_image = encode_image(image_path)

completion = client.chat.completions.create(
    model="llava-hf/llava-1.5-13b-hf",
    messages=[
        {
            "role": "system",
            "content": """Analyze the person's outfit in the image and deliver a witty roast that connects their fashion choices to mortgage/real estate terminology. """
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What do you think about this outfit?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ],
    temperature=0
)

print(completion.choices[0].message.content)