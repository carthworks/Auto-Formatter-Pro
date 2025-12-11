"""
Generate extension icons in multiple sizes
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient effect (simple two-color blend)
    for y in range(size):
        # Blend from #6366f1 to #8b5cf6
        r = int(99 + (139 - 99) * y / size)
        g = int(102 + (92 - 102) * y / size)
        b = int(241 + (246 - 241) * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # Draw brackets {}
    bracket_size = size // 2
    bracket_thickness = max(2, size // 16)
    bracket_color = (255, 255, 255)
    
    # Left bracket {
    left_x = size // 4
    center_y = size // 2
    bracket_height = bracket_size
    
    # Draw left bracket arc
    draw.arc(
        [left_x - bracket_size//4, center_y - bracket_height//2, 
         left_x + bracket_size//4, center_y + bracket_height//2],
        start=90, end=270, fill=bracket_color, width=bracket_thickness
    )
    
    # Right bracket }
    right_x = size * 3 // 4
    draw.arc(
        [right_x - bracket_size//4, center_y - bracket_height//2, 
         right_x + bracket_size//4, center_y + bracket_height//2],
        start=270, end=90, fill=bracket_color, width=bracket_thickness
    )
    
    # Add sparkle effect (small stars)
    star_positions = [
        (size // 6, size // 6),
        (size * 5 // 6, size // 6),
        (size // 2, size * 5 // 6)
    ]
    
    star_size = max(2, size // 32)
    for x, y in star_positions:
        draw.ellipse([x - star_size, y - star_size, x + star_size, y + star_size], 
                     fill=(255, 255, 255, 200))
    
    return img

# Create icons in different sizes
sizes = [16, 32, 48, 128]
output_dir = 'assets'

os.makedirs(output_dir, exist_ok=True)

for size in sizes:
    icon = create_icon(size)
    icon.save(f'{output_dir}/icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created successfully!')
