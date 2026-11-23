from PIL import Image, ImageDraw

WIDTH = 800
HEIGHT = 480

COLOR_BG = (16, 27, 42)        # #101B2A Deep Navy
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_BORDER = (40, 65, 92)    # #28415C Card Border
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal
COLOR_MUTED = (169, 187, 205)  # #A9BBCD Muted Gray

def draw_corner_accents(draw, x1, y1, x2, y2, size=10, color=COLOR_TEAL):
    draw.line([x1, y1, x1 + size, y1], fill=color, width=2)
    draw.line([x1, y1, x1, y1 + size], fill=color, width=2)
    draw.line([x2, y2, x2 - size, y2], fill=color, width=2)
    draw.line([x2, y2, x2, y2 - size], fill=color, width=2)

def build_climate_page_dual_targets(draw):
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=COLOR_BG)
    draw.line([24, 76, 776, 76], fill=COLOR_BORDER, width=1)

    # --- LEFT CARD: DUAL SETPOINTS (TEMP + HUMIDITY) ---
    draw.rounded_rectangle([24, 90, 388, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 24, 90, 388, 386, size=10, color=COLOR_TEAL)

    # Section 1: Temperature Stepper Bay (Y: 140 to 196)
    draw.rounded_rectangle([44, 140, 96, 196], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([106, 140, 306, 196], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([316, 140, 368, 196], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # Section 2: Humidity Stepper Bay (Y: 236 to 292)
    draw.rounded_rectangle([44, 236, 96, 292], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([106, 236, 306, 292], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([316, 236, 368, 292], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # Apply Button Housing Bay (Y: 320 to 368)
    draw.rounded_rectangle([44, 320, 368, 368], radius=8, fill=COLOR_TEAL, outline=COLOR_TEAL, width=1)

    # --- RIGHT CARD: MODE & 3 OVERRIDE SLOTS ---
    draw.rounded_rectangle([412, 90, 776, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 412, 90, 776, 386, size=10, color=COLOR_TEAL)

    # Mode Toggle Housing (Y: 136 to 184)
    draw.rounded_rectangle([432, 136, 756, 184], radius=20, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # 3 Actuator Override Rows (Y: 204, 260, 316)
    draw.rounded_rectangle([432, 204, 756, 252], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([432, 260, 756, 308], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([432, 316, 756, 364], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)

    # --- BOTTOM NAVIGATION DOCK ---
    nav_x = [24, 180, 336, 648]
    nav_w = 138
    nav_h = 56
    nav_y = 404
    for i, x in enumerate(nav_x):
        if i == 1:  # Climate is active tab
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_TEAL, width=2)
        else:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
draw = ImageDraw.Draw(img)
build_climate_page_dual_targets(draw)
img.save("hmi_bg_1_climate_v2.png")
print("✅ Generated: hmi_bg_1_climate_v2.png with Dual Setpoints (Temp + Humidity)")
