import time
from playwright.sync_api import sync_playwright

def verify_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to the Studio page
            page.goto("http://localhost:3000/studio")

            # Wait for the Library panel to be visible (or at least some text)
            # Since the library might be empty, we look for "Sonic Archive" which is in the header
            page.wait_for_selector("text=Sonic Archive", timeout=10000)

            # Since we can't easily populate data without running a backend job,
            # we mainly verify that the component renders without crashing.
            # We'll take a screenshot of the library section.

            # Wait a bit for animations
            time.sleep(2)

            page.screenshot(path="verification/library_panel.png")
            print("Screenshot saved to verification/library_panel.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_library()
