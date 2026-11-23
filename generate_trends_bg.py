from PIL import Image, ImageDraw

WIDTH = 800
HEIGHT = 480

COLOR_BG = (16, 27, 42)        # #101B2A Deep Navy
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_BORDER = (40, 65, 92)    # #28415C Subtle Card Border
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal
COLOR_AMBER = (243, 156, 18)   # #F39C12 Industrial Amber
COLOR_MUTED = (169, 187, 205)  # #A9BBCD Muted Gray

def draw_corner_accents(draw, x1, y1, x2, y2, size=10, color=COLOR_TEAL):
    draw.line([x1, y1, x1 + size, y1], fill=color, width=2)
    draw.line([x1, y1, x1, y1 + size], fill=color, width=2)
    draw.line([x2, y2, x2 - size, y2], fill=color, width=2)
    draw.line([x2, y2, x2, y2 - size], fill=color, width=2)

def build_trends_page(draw):
    # Canvas & Top Header Divider
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=COLOR_BG)
    draw.line([24, 76, 776, 76], fill=COLOR_BORDER, width=1)

    # --- LEFT CARD: WAVEFORM CHART CONTAINER (X: 24 to 530, Y: 90 to 386) ---
    draw.rounded_rectangle([24, 90, 530, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 24, 90, 530, 386, size=10, color=COLOR_TEAL)
    
    # Chart plotting recessed area (X: 74 to 516, Y: 130 to 340 -> W: 442, H: 210)
    draw.rounded_rectangle([74, 130, 516, 340], radius=4, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # Legend indicators (Top-right inside chart card)
    # Teal dot + line for Temp
    draw.line([300, 112, 320, 112], fill=COLOR_TEAL, width=3)
    draw.ellipse([308, 110, 312, 114], fill=COLOR_TEAL)
    # Amber dot + line for RH
    draw.line([410, 112, 430, 112], fill=COLOR_AMBER, width=3)
    draw.ellipse([418, 110, 422, 114], fill=COLOR_AMBER)

    # --- RIGHT CARD: LIVE STATISTICS & RANGE SUMMARY (X: 546 to 776) ---
    draw.rounded_rectangle([546, 90, 776, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 546, 90, 776, 386, size=10, color=COLOR_TEAL)

    # Stats bays inside right card
    draw.rounded_rectangle([562, 140, 760, 230], radius=8, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([562, 254, 760, 344], radius=8, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # --- BOTTOM NAVIGATION DOCK ---
    nav_x = [24, 180, 336, 648]
    nav_w = 138
    nav_h = 56
    nav_y = 404
    for i, x in enumerate(nav_x):
        if i == 2:  # Trends is the active tab here
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_TEAL, width=2)
        else:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
draw = ImageDraw.Draw(img)
build_trends_page(draw)
img.save("hmi_bg_2_trends.png")
print("✅ Generated: hmi_bg_2_trends.png")
