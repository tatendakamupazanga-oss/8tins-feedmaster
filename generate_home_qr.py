from PIL import Image, ImageDraw

WIDTH = 800
HEIGHT = 480

COLOR_BG = (16, 27, 42)        # #101B2A Deep Navy
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_BORDER = (40, 65, 92)    # #28415C Subtle Card Border
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal Accent
COLOR_MUTED = (169, 187, 205)  # #A9BBCD

def draw_corner_accents(draw, x1, y1, x2, y2, size=8, color=COLOR_TEAL):
    draw.line([x1, y1, x1 + size, y1], fill=color, width=2)
    draw.line([x1, y1, x1, y1 + size], fill=color, width=2)
    draw.line([x2, y2, x2 - size, y2], fill=color, width=2)
    draw.line([x2, y2, x2, y2 - size], fill=color, width=2)

def draw_thermometer_icon(draw, cx, cy, color=COLOR_TEAL):
    draw.rounded_rectangle([cx - 4, cy - 14, cx + 4, cy + 6], radius=4, outline=color, width=2)
    draw.ellipse([cx - 8, cy + 4, cx + 8, cy + 20], fill=COLOR_CARD, outline=color, width=2)
    draw.ellipse([cx - 5, cy + 7, cx + 5, cy + 17], fill=color)
    draw.rounded_rectangle([cx - 2, cy - 6, cx + 2, cy + 8], radius=2, fill=color)

def draw_droplet_icon(draw, cx, cy, color=COLOR_TEAL):
    draw.polygon([(cx, cy - 14), (cx - 8, cy + 2), (cx + 8, cy + 2)], fill=color)
    draw.ellipse([cx - 8, cy - 4, cx + 8, cy + 12], fill=color)

def build_home_with_qr(draw):
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=COLOR_BG)
    draw.line([24, 76, 776, 76], fill=COLOR_BORDER, width=1)

    # 1. Left Card: Temperature (W: 242)
    draw.rounded_rectangle([24, 90, 266, 316], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 24, 90, 266, 316, size=8, color=COLOR_TEAL)
    draw.rounded_rectangle([38, 100, 68, 130], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw_thermometer_icon(draw, 53, 115, color=COLOR_TEAL)
    draw.line([38, 246, 252, 246], fill=COLOR_BORDER, width=1)

    # 2. Middle Card: Humidity (W: 242)
    draw.rounded_rectangle([280, 90, 522, 316], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 280, 90, 522, 316, size=8, color=COLOR_TEAL)
    draw.rounded_rectangle([294, 100, 324, 130], radius=6, fill=COLOR_BG, outline=COLOR_BORDER, width=1)
    draw_droplet_icon(draw, 309, 115, color=COLOR_TEAL)
    draw.line([294, 246, 508, 246], fill=COLOR_BORDER, width=1)

    # 3. Right Card: Mobile QR Code Access (W: 240)
    draw.rounded_rectangle([536, 90, 776, 316], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 536, 90, 776, 316, size=8, color=COLOR_TEAL)
    # White dock box for the Nextion QR code (140x140 px)
    draw.rounded_rectangle([586, 126, 726, 266], radius=6, fill=(255, 255, 255), outline=COLOR_TEAL, width=2)

    # 4. Actuator Bays (Fan, Heater, Cooler)
    draw.rounded_rectangle([24, 330, 258, 386], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([283, 330, 517, 386], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw.rounded_rectangle([542, 330, 776, 386], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

    # 5. Bottom Navigation Dock
    nav_x = [24, 180, 336, 648]
    nav_w = 138
    nav_h = 56
    nav_y = 404
    for i, x in enumerate(nav_x):
        if i == 0:  # Dashboard active
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_TEAL, width=2)
        else:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
draw = ImageDraw.Draw(img)
build_home_with_qr(draw)
img.save("hmi_bg_0_home_qr.png")
print("✅ Generated: hmi_bg_0_home_qr.png with 3-Card Layout & QR Dock")
