from PIL import Image, ImageDraw

WIDTH = 800
HEIGHT = 480

COLOR_BG = (16, 27, 42)        # #101B2A Deep Navy
COLOR_CARD = (26, 42, 61)      # #1A2A3D Surface Navy
COLOR_BORDER = (40, 65, 92)    # #28415C Subtle Card Border
COLOR_TEAL = (64, 214, 195)    # #40D6C3 Electric Teal
COLOR_WARN = (243, 156, 18)    # #F39C12 Industrial Amber
COLOR_MUTED = (169, 187, 205)  # #A9BBCD Muted Gray

def draw_corner_accents(draw, x1, y1, x2, y2, size=10, color=COLOR_TEAL):
    draw.line([x1, y1, x1 + size, y1], fill=color, width=2)
    draw.line([x1, y1, x1, y1 + size], fill=color, width=2)
    draw.line([x2, y2, x2 - size, y2], fill=color, width=2)
    draw.line([x2, y2, x2, y2 - size], fill=color, width=2)

def build_settings_page(draw):
    # Base Canvas & Header Divider
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=COLOR_BG)
    draw.line([24, 76, 776, 76], fill=COLOR_BORDER, width=1)

    # --- LEFT CARD: NETWORK & CONNECTIVITY (X: 24 to 388, Y: 90 to 386) ---
    draw.rounded_rectangle([24, 90, 388, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 24, 90, 388, 386, size=10, color=COLOR_TEAL)

    # 4 Data Row divider lines
    for y in [152, 200, 248, 296]:
        draw.line([40, y, 372, y], fill=COLOR_BORDER, width=1)

    # Wi-Fi Setup Button Housing Bay (Bottom of left card)
    draw.rounded_rectangle([40, 314, 372, 368], radius=8, fill=COLOR_BG, outline=COLOR_TEAL, width=1)

    # --- RIGHT CARD: HARDWARE & SYSTEM HEALTH (X: 412 to 776, Y: 90 to 386) ---
    draw.rounded_rectangle([412, 90, 776, 386], radius=10, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)
    draw_corner_accents(draw, 412, 90, 776, 386, size=10, color=COLOR_TEAL)

    # 4 Data Row divider lines
    for y in [152, 200, 248, 296]:
        draw.line([428, y, 760, y], fill=COLOR_BORDER, width=1)

    # System Reboot Button Housing Bay (Bottom of right card)
    draw.rounded_rectangle([428, 314, 760, 368], radius=8, fill=COLOR_BG, outline=COLOR_WARN, width=1)

    # --- BOTTOM NAVIGATION DOCK ---
    nav_x = [24, 180, 336, 648]
    nav_w = 138
    nav_h = 56
    nav_y = 404
    for i, x in enumerate(nav_x):
        if i == 3:  # Settings is the active tab here
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_TEAL, width=2)
        else:
            draw.rounded_rectangle([x, nav_y, x + nav_w, nav_y + nav_h], radius=8, fill=COLOR_CARD, outline=COLOR_BORDER, width=1)

img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
draw = ImageDraw.Draw(img)
build_settings_page(draw)
img.save("hmi_bg_4_settings.png")
print("✅ Generated: hmi_bg_4_settings.png")
