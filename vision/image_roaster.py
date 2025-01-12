import os
import base64
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
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

def roast_image(image_path):
    try:
        base64_image = encode_image(image_path)
        
        completion = client.chat.completions.create(
            model="llava-hf/llava-1.5-13b-hf",
            messages=[
                {
                    "role": "system",
                    "content": "You are a witty and sarcastic mortgage advisor cat. Roast the person's outfit in the image using mortgage and real estate terminology. Be creative and funny, but not mean-spirited."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What do you think about this person's outfit?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.7
        )
        
        roast = completion.choices[0].message.content
        return roast
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return "Sorry, I couldn't process that image. Must be a catastrophic error! 😸"

class ImageHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.jpg'):
            print(f"\nNew image detected: {event.src_path}")
            print("Generating roast...")
            roast = roast_image(event.src_path)
            print("\nRoast result:")
            print(roast)
            
            # Save the roast to a text file next to the image
            roast_file = event.src_path.replace('.jpg', '_roast.txt')
            with open(roast_file, 'w') as f:
                f.write(roast)

def watch_directory():
    images_dir = os.path.join(os.getcwd(), 'images')
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
        
    event_handler = ImageHandler()
    observer = Observer()
    observer.schedule(event_handler, images_dir, recursive=False)
    observer.start()
    
    print(f"Watching for new images in: {images_dir}")
    print("Press Ctrl+C to stop...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    watch_directory()