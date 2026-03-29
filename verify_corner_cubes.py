from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Load the local index.html file
    path = os.path.abspath("mcp-layout/index.html")
    page.goto(f"file://{path}")
    page.wait_for_timeout(1000)

    # 1. Verify 3 corner cubes are present
    cubes = ["cube-tl", "cube-tr", "cube-bl"]
    for cube_id in cubes:
        if page.locator(f"#{cube_id}").is_visible():
            print(f"Verified: {cube_id} is visible.")
        else:
            print(f"Error: {cube_id} is NOT visible.")

    # Verify Bottom Right cube is GONE
    if not page.locator("#cube-br").is_visible():
        print("Verified: cube-br is not visible (as requested).")

    # 2. Test "Click-to-Open" Interaction
    # Click Slot 1 on Top Left cube
    slot = page.locator("#slot-tl-f1")
    slot.click()
    page.wait_for_timeout(500)

    # Verify Center Stage content updated
    center_panel = page.locator("#center-panel")
    if "Active Application" in center_panel.inner_html():
        print("Verified: Slot click opens application in center stage.")
    else:
        print("Error: Center stage did not update.")

    # 3. Take screenshot
    page.screenshot(path="/home/jules/verification/screenshots/3_cube_layout_active_slot.png")
    print("Screenshot saved to /home/jules/verification/screenshots/3_cube_layout_active_slot.png")

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
