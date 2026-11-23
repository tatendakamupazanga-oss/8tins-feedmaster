from PIL import Image, ImageDraw

WIDTH = 800
HEIGHT = 480

COLOR_BG = (16, 27, 42)        # #101B2A Deep Navy Canvas
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_BORDER = (40, 65, 92)    # #28415C Subtle Card Border
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal
COLOR_AMBER = (243, 156, 18)   # #F39C12 Industrial Amber
COLOR_MUTED = (169, 187, 205)  # #A9BBCD Muted Text

def draw_corner_accents(draw, x1, y1, x2, y2, size=10, color=COLOR_TEAL):
    draw.line([x1, y1, x1 + size, y1], fill=color, width=2)
    draw.line([x1, y1, x1, y1 + size], fill=color, width=2)
    draw.line([x2, y2, x2 - size, y2], fill=color, width=2)
    draw.line([x2, y2, x2, y2 - size], fill=color, width=2)

def draw_thermometer_icon(draw, cx, cy, color=COLOR_TEAL):
    """Draws a clean industrial thermometer icon centered around (cx, cy)."""
    # Outer stem
    draw.rounded_rectangle([cx - 4, cy - 14, cx + 4, cy + 6], radius=4, outline=color, width=2)
    # Bulb base
    draw.ellipse([cx - 8, cy + 4, cx + 8, cy + 20], fill=COLOR_CARD, outline=color, width=2)
    # Mercury fill inside bulb & stem
    draw.ellipse([cx - 5, cy + 7, cx + 5, cy + 17], fill=color)
    draw.rounded_rectangle([cx - 2, cy - 6, cx + 2, cy + 8], radius=2, fill=color)
    # Tick marks
    draw.line([cx + 7, cy - 8, cx + 11, cy - 8], fill=color, width=2)
    draw.line([cx + 7, cy - 2, cx + 11, cy - 2], fill=color, width=2)

def draw_droplet_icon(draw, cx, cy, color=COLOR_TEAL):
    """Draws a modern moisture water droplet icon centered around (cx, cy)."""
    # Teardrop point (top polygon)
    draw.polygon([(cx, cy - 14), (cx - 8, cy + 2), (cx + 8, cy + 2)], fill=color)
    # Droplet rounded bottom
    draw.ellipse([cx - 8, cy - 4, cx + 8, cy + 12], fill=color)
    # Inner specular highlight (dark-card crescent)
    draw.arc([cx - 5, cy - 1, cx + 5, cy + 9], start=210, end=330, fill=COLOR_CARD, width=2)

def build_home(draw):
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=COLOR_BG)
    draw.line([24, 76, 776, 76], fill=COLOR_BORDER, width=1)

    # --- Left Card: Temperature ---
    draw.rounded_rectangle([24, 90, 388, 310], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 24, 90, 388, 310, size=10, color=COLOR_TEAL)
    
    # Thermometer icon badge + card label
    draw.rounded_rectangle([40, 102, 74, 136], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw_thermometer_icon(draw, 57, 119, color=COLOR_TEAL)

    # Sub-card divider line
    draw.line([40, 240, 372, 240], fill=COLOR_BORDER, width=1)

    # --- Right Card: Humidity ---
    draw.rounded_rectangle([412, 90, 776, 310], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 412, 90, 776, 310, size=10, color=COLOR_TEAL)
    
    # Droplet icon badge + card label
    draw.rounded_rectangle([428, 102, 462, 136], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw_droplet_icon(draw, 445, 119, color=COLOR_TEAL)

    # Sub-card divider line
    draw.line([428, 240, 760, 240], fill=COLOR_BORDER, width=1)

    # --- Actuator Bays (Fan, Heater, Cooler) ---
    draw.rounded_rectangle([24, 326, 258, 386], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([283, 326, 517, 386], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([542, 326, 776, 386], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

    # --- Bottom Navigation Dock ---
    nav_x = [24, 180, 336, 492, 648]
    nav_w = 138
    nav_h = 56
    nav_y = 404
    for i, x in enumerate(nav_x):
        if i == 0:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_TEAL, width=2)
        else:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
draw = ImageDraw.Draw(img)
build_home(draw)
img.save("hmi_bg_0_home.png")
print("✅ High-res HMI background with Thermometer & Droplet icons generated: hmi_bg_0_home.png")
