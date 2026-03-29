from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Load the local index.html file
    path = os.path.abspath("mcp-layout/index.html")
    page.goto(f"file://{path}")
    page.wait_for_timeout(1000)

    # 1. Verify 4 corner cubes are present
    cubes = ["cube-tl", "cube-tr", "cube-bl", "cube-br"]
    for cube_id in cubes:
        if page.locator(f"#{cube_id}").is_visible():
            print(f"Verified: {cube_id} is visible.")
        else:
            print(f"Error: {cube_id} is NOT visible.")

    # 2. Verify slots are present (4 per face, 6 faces = 24 per cube)
    # Just check one cube's front face slots
    slots = page.locator("#cube-tl .front .slot")
    count = slots.count()
    print(f"Found {count} slots on #cube-tl front face.")

    # 3. Test Rotation Controls
    # Select Top Right cube
    page.click("button[data-target='cube-tr']")
    page.wait_for_timeout(500)

    # Rotate it Right
    page.click("button[data-action='right']")
    page.wait_for_timeout(1000)

    # Rotate it Up
    page.click("button[data-action='up']")
    page.wait_for_timeout(1000)

    # 4. Take screenshot of the layout
    page.screenshot(path="/home/jules/verification/screenshots/corner_cubes_layout.png")
    print("Screenshot saved to /home/jules/verification/screenshots/corner_cubes_layout.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
