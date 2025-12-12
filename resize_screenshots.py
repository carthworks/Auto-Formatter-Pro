"""
Screenshot Resizer for Chrome Web Store
Resizes images to 1280x800 pixels, 24-bit PNG (no alpha)
"""

from PIL import Image
import os

# Configuration
INPUT_DIR = "screenshots"
OUTPUT_DIR = "screenshots/store_ready"
TARGET_SIZE = (1280, 800)

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Get all PNG files
screenshots = [f for f in os.listdir(INPUT_DIR) if f.endswith('.png')]

print(f"Found {len(screenshots)} screenshots to process\n")

for filename in screenshots:
    input_path = os.path.join(INPUT_DIR, filename)
    output_path = os.path.join(OUTPUT_DIR, filename)
    
    try:
        # Open image
        img = Image.open(input_path)
        
        print(f"Processing: {filename}")
        print(f"  Original size: {img.size}")
        
        # Convert RGBA to RGB (remove alpha channel)
        if img.mode == 'RGBA':
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background
            print(f"  Converted RGBA to RGB")
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            print(f"  Converted {img.mode} to RGB")
        
        # Calculate aspect ratio
        original_ratio = img.width / img.height
        target_ratio = TARGET_SIZE[0] / TARGET_SIZE[1]
        
        # Resize to fit within target size while maintaining aspect ratio
        if original_ratio > target_ratio:
            # Image is wider - fit to width
            new_width = TARGET_SIZE[0]
            new_height = int(TARGET_SIZE[0] / original_ratio)
        else:
            # Image is taller - fit to height
            new_height = TARGET_SIZE[1]
            new_width = int(TARGET_SIZE[1] * original_ratio)
        
        # Resize image
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create canvas with target size and white background
        canvas = Image.new('RGB', TARGET_SIZE, (255, 255, 255))
        
        # Center the resized image on canvas
        x_offset = (TARGET_SIZE[0] - new_width) // 2
        y_offset = (TARGET_SIZE[1] - new_height) // 2
        canvas.paste(img_resized, (x_offset, y_offset))
        
        # Save as 24-bit PNG
        canvas.save(output_path, 'PNG', optimize=True)
        
        print(f"  Saved: {output_path}")
        print(f"  Final size: {canvas.size}")
        print(f"  Mode: {canvas.mode} (24-bit RGB)\n")
        
    except Exception as e:
        print(f"  ERROR: {e}\n")

print(f"\n✅ Processing complete!")
print(f"📁 Output folder: {OUTPUT_DIR}")
print(f"📊 Processed {len(screenshots)} screenshots")
print(f"📐 Target size: {TARGET_SIZE[0]}x{TARGET_SIZE[1]} pixels")
print(f"🎨 Format: 24-bit PNG (no alpha)")
