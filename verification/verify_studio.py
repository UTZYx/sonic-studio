
from playwright.sync_api import sync_playwright
import time

def verify_studio():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to studio...")
            page.goto("http://localhost:3000/studio")

            # Wait for the visualizer canvas to be present
            print("Waiting for canvas...")
            page.wait_for_selector("canvas", timeout=30000)

            # Wait a bit for the animation to run
            time.sleep(2)

            print("Taking screenshot...")
            page.screenshot(path="verification/studio_visualizer.png")
            print("Screenshot saved to verification/studio_visualizer.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_studio()
