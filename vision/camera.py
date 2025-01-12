import cv2
import os
import time

def capture_photo():
    """Capture a photo from webcam and return the file path."""
    # Initialize the webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        raise IOError("Cannot open webcam")
    
    # Wait a bit for the camera to warm up
    time.sleep(2)
    
    # Create images directory if it doesn't exist
    if not os.path.exists('images'):
        os.makedirs('images')
    
    # Capture frame
    ret, frame = cap.read()
    
    # Generate filename with timestamp
    filename = f"images/capture_{int(time.time())}.jpg"
    
    # Save the image
    cv2.imwrite(filename, frame)
    
    # Release the webcam
    cap.release()
    
    return filename

# Explicitly declare what should be imported
__all__ = ['capture_photo']

if __name__ == "__main__":
    print("Taking photo...")
    photo_path = capture_photo()
    print(f"Photo saved to: {photo_path}")
