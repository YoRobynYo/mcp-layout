from playwright.sync_api import sync_playwright
import os

def run_test(page):
    # Load the root index.html file
    path = os.path.abspath("index.html")
    page.goto(f"file://{path}")
    page.wait_for_timeout(1000)

    # 1. Verify 3 corner cubes are present
    cubes = ["cube-tl", "cube-tr", "cube-bl"]
    for cube_id in cubes:
        if page.locator(f"#{cube_id}").is_visible():
            print(f"Verified: {cube_id} is visible.")
        else:
            print(f"Error: {cube_id} is NOT visible.")

    # 2. Test "Click-to-Open" on Cube Face
    # Click front face on Top Left cube
    face = page.locator("#cube-tl .front")
    face.click()
    page.wait_for_timeout(500)

    # Verify Center Stage content updated
    center_panel = page.locator("#center-panel")
    if "Source: cube-tl" in center_panel.inner_html():
        print("Verified: Face click opens application in center stage.")
    else:
        print("Error: Center stage did not update correctly.")

    # 3. Test interactive button inside cube face
    # We added a button with alert('Button clicked!')
    # In Playwright we can listen to dialogs
    page.on("dialog", lambda dialog: (print(f"Dialog appeared: {dialog.message}"), dialog.accept()))

    face_btn = page.locator("#cube-tl .face-btn")
    if face_btn.is_visible():
        print("Verified: Interactive button inside face is visible.")
        face_btn.click()
        print("Clicked interactive button inside face.")
    else:
        print("Error: Interactive button inside face is NOT visible.")

    # 4. Take screenshot
    page.screenshot(path="/home/jules/verification/screenshots/final_cube_layout.png")
    print("Screenshot saved to /home/jules/verification/screenshots/final_cube_layout.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_test(page)
        finally:
            context.close()
            browser.close()
