from PIL import Image
import os
from collections import Counter
import colorsys

def adjust_lightness(hex_color, amount=0.8):
    # Convert hex to RGB
    hex_color = hex_color.lstrip('#')
    rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    # Convert RGB to HLS
    h, l, s = colorsys.rgb_to_hls(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
    
    # Darken
    l = max(0, min(1, l * amount))
    
    # Convert back to RGB
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    
    # Convert back to hex
    return '#{:02x}{:02x}{:02x}'.format(int(r*255), int(g*255), int(b*255))

def get_vibrant_color(image_path):
    try:
        img = Image.open(image_path)
        img = img.resize((150, 150))
        img = img.quantize(colors=20) # Get more colors to find a vibrant one
        img = img.convert('RGB')
        pixels = list(img.getdata())
        common = Counter(pixels).most_common(10)
        
        # Heuristic: Pick the most saturated/vibrant color that isn't black/white/grey
        best_color = common[0][0]
        max_saturation = -1
        
        for color_count in common:
            color = color_count[0]
            # Skip very dark or very light colors
            if sum(color) < 50 or sum(color) > 700:
                continue
                
            r, g, b = color[0]/255.0, color[1]/255.0, color[2]/255.0
            h, l, s = colorsys.rgb_to_hls(r, g, b)
            
            # Prefer higher saturation
            if s > max_saturation:
                max_saturation = s
                best_color = color
                
        hex_color = '#{:02x}{:02x}{:02x}'.format(best_color[0], best_color[1], best_color[2])
        return hex_color
    except Exception as e:
        return f"Error: {e}"

files = [
    ("Beauty", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-beauty-new.jpg"),
    ("Skincare", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-skin_care-new.jpg"),
    ("Tech", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/tech_new.jpg"),
    ("Home Appliances", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-appliances-new.jpg"),
    ("Home Decor", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-decor-new.jpg"),
    ("Ladies Fashion", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-ladies_fashion-new.jpg"),
    ("Baby & Kids", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/category-baby-kids_new.jpg"),
    ("Travel Gear", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-travel_gear-new.jpg"),
    ("Toys & Fun", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-toys-new.jpg"),
    ("Smart Home", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-smart_home-new.jpg"),
    ("Gift Bundles", "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-bundles-new.png")
]

print("Slide Name | Primary Accent | Secondary Accent")
print("--- | --- | ---")
for name, f in files:
    primary = get_vibrant_color(f)
    if not primary.startswith('#'):
        print(f"{name}: {primary}")
        continue
    secondary = adjust_lightness(primary, 0.8) # 20% darker
    print(f"{name} | {primary} | {secondary}")
