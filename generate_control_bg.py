from PIL import Image, ImageDraw

WIDTH = 800
HEIGHT = 480

COLOR_BG = (16, 27, 42)        # #101B2A Deep Navy
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_BORDER = (40, 65, 92)    # #28415C Subtle Card Border
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal Accent
COLOR_MUTED = (169, 187, 205)  # #A9BBCD Muted Gray

def draw_corner_accents(draw, x1, y1, x2, y2, size=10, color=COLOR_TEAL):
    draw.line([x1, y1, x1 + size, y1], fill=color, width=2)
    draw.line([x1, y1, x1, y1 + size], fill=color, width=2)
    draw.line([x2, y2, x2 - size, y2], fill=color, width=2)
    draw.line([x2, y2, x2, y2 - size], fill=color, width=2)

def build_control_page(draw):
    # Canvas
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=COLOR_BG)
    # Header separator
    draw.line([24, 76, 776, 76], fill=COLOR_BORDER, width=1)

    # --- LEFT CARD: TARGET SETPOINT STATION ---
    draw.rounded_rectangle([24, 90, 388, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 24, 90, 388, 386, size=10, color=COLOR_TEAL)
    
    # Target value center container bay
    draw.rounded_rectangle([130, 160, 282, 230], radius=8, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    
    # Stepper button housings (behind + and -)
    draw.rounded_rectangle([48, 160, 114, 230], radius=8, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([298, 160, 364, 230], radius=8, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # Setpoint guidance strip at bottom of card
    draw.line([40, 310, 372, 310], fill=COLOR_BORDER, width=1)

    # --- RIGHT CARD: MODE & OVERRIDE MATRIX ---
    draw.rounded_rectangle([412, 90, 776, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 412, 90, 776, 386, size=10, color=COLOR_TEAL)

    # Sliding toggle track background
    draw.rounded_rectangle([436, 140, 752, 188], radius=24, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # Manual Overrides slot bays
    draw.rounded_rectangle([436, 214, 752, 260], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([436, 270, 752, 316], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([436, 326, 752, 372], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # --- BOTTOM NAVIGATION DOCK ---
    nav_x = [24, 180, 336, 648]
    nav_w = 138
    nav_h = 56
    nav_y = 404
    for i, x in enumerate(nav_x):
        if i == 1: # Climate Control is the active tab here
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_TEAL, width=2)
        else:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
draw = ImageDraw.Draw(img)
build_control_page(draw)
img.save("hmi_bg_1_control.png")
print("✅ Generated: hmi_bg_1_control.png")
