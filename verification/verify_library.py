import time
from playwright.sync_api import sync_playwright

def verify_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to studio page...")
            page.goto("http://localhost:3000/studio")

            # Wait for content to load
            print("Waiting for load state...")
            page.wait_for_load_state("networkidle")

            # Wait specifically for the library panel text
            print("Waiting for LibraryPanel text...")
            try:
                page.wait_for_selector("text=Sonic Archive", timeout=10000)
            except:
                print("Could not find 'Sonic Archive' text. Taking screenshot anyway.")

            # Scroll down to make sure LibraryPanel is visible (it's at the bottom)
            print("Scrolling to bottom...")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2) # Wait for scroll and animations

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/library_panel_visible.png")
            print("Screenshot saved to verification/library_panel_visible.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_library()
