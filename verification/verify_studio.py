import time
from playwright.sync_api import sync_playwright

def verify_studio():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to Studio
            print("Navigating to Studio...")
            page.goto("http://localhost:3000/studio", timeout=30000)

            # Wait for Visualizer to appear (it's in the DOM)
            print("Waiting for Visualizer...")
            page.wait_for_selector("canvas", state="attached")

            # Wait a bit for Three.js to initialize and render a few frames
            time.sleep(3)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/visualizer.png")
            print("Screenshot saved to verification/visualizer.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_studio()
