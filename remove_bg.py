from PIL import Image

def remove_white_bg(image_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Change all white (also shades of whites)
        # to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(image_path, "PNG")
    print(f"Removed white background for {image_path}")

if __name__ == "__main__":
    logo_path = r"c:\Users\asus\Pictures\jms-sistem\admin-dashboard\public\logo.png"
    favicon_path = r"c:\Users\asus\Pictures\jms-sistem\admin-dashboard\public\favicon.ico"
    
    # Process logo
    remove_white_bg(logo_path)
    
    # Save a copy as favicon
    img = Image.open(logo_path)
    img.save(favicon_path, "ICO")
    print("Favicon updated.")
