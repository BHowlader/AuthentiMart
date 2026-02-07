from PIL import Image
import os
from collections import Counter

def get_palette(image_path):
    try:
        img = Image.open(image_path)
        img = img.resize((100, 100))
        # Quantize to reduce colors
        img = img.quantize(colors=10)
        img = img.convert('RGB')
        pixels = list(img.getdata())
        common = Counter(pixels).most_common(3)
        return [ '#{:02x}{:02x}{:02x}'.format(c[0][0], c[0][1], c[0][2]) for c in common ]
    except Exception as e:
        return [f"Error: {e}"]

files = [
    "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-ladies_fashion-new.jpg",
    "/Users/bibekhowlader/Downloads/Programming/Service Platform/frontend/public/images/hero-travel_gear-new.jpg"
]

for f in files:
    print(f"{os.path.basename(f)}: {get_palette(f)}")
