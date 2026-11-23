from PIL import Image, ImageDraw

ICON_SIZE = (40, 40)
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal
COLOR_GREEN = (46, 204, 113)   # #2ECC71 Active Signal Green
COLOR_MUTED = (169, 187, 205)  # #A9BBCD Inactive Gray

def generate_hotspot_icon(filename, stroke_color, bg_color=COLOR_CARD):
    img = Image.new("RGB", ICON_SIZE, bg_color)
    draw = ImageDraw.Draw(img)
    cx, cy = 20, 22

    # 1. Base Stand / Mast
    draw.line([cx, cy + 4, cx, cy + 12], fill=stroke_color, width=2)
    draw.line([cx - 5, cy + 12, cx + 5, cy + 12], fill=stroke_color, width=2)

    # 2. Central Transmitter Core Dot
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=stroke_color)

    # 3. Inner Broadcast Wave Arcs
    draw.arc([cx - 8, cy - 8, cx + 8, cy + 8], start=210, end=330, fill=stroke_color, width=2)

    # 4. Outer Broadcast Wave Arcs
    draw.arc([cx - 14, cy - 14, cx + 14, cy + 14], start=215, end=325, fill=stroke_color, width=2)

    img.save(filename)
    print(f"✅ Generated: {filename} (40x40)")

generate_hotspot_icon("icon_hotspot_teal.png", COLOR_TEAL)
generate_hotspot_icon("icon_hotspot_active.png", COLOR_GREEN)
generate_hotspot_icon("icon_hotspot_muted.png", COLOR_MUTED)
