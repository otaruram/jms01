import cv2
import numpy as np

def crop_logo_icon(input_path, output_path):
    # Read the image
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Error: Could not read image.")
        return

    # Convert to HSV to isolate the green colors
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Define range for green color
    lower_green = np.array([30, 50, 50])
    upper_green = np.array([90, 255, 255])
    
    # Threshold the HSV image to get only green colors
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Combine all green contours to find the bounding box of the whole icon
        all_pts = np.vstack(contours)
        x, y, w, h = cv2.boundingRect(all_pts)
        
        # Add a little padding
        padding = 10
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img.shape[1] - x, w + 2*padding)
        h = min(img.shape[0] - y, h + 2*padding)
        
        # Crop the image
        cropped = img[y:y+h, x:x+w]
        
        # Resize to square (standard favicon size)
        size = max(w, h)
        square = np.zeros((size, size, 4), dtype=np.uint8)
        
        # Center the cropped image in the square
        y_off = (size - h) // 2
        x_off = (size - w) // 2
        square[y_off:y_off+h, x_off:x_off+w] = cropped
        
        # Resize to 32x32 for favicon
        favicon = cv2.resize(square, (32, 32), interpolation=cv2.INTER_AREA)
        
        # Save as favicon
        cv2.imwrite(output_path, favicon)
        print(f"Favicon saved successfully to {output_path}")
    else:
        print("Could not detect the green icon in the image.")

if __name__ == "__main__":
    crop_logo_icon(
        "c:/Users/asus/Pictures/jms-sistem/admin-dashboard/public/logo.png",
        "c:/Users/asus/Pictures/jms-sistem/admin-dashboard/public/favicon.ico"
    )
