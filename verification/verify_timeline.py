import time
from playwright.sync_api import sync_playwright

def verify_timeline():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to the studio page
            print("Navigating to Studio Page...")
            page.goto("http://localhost:3000/studio", timeout=30000)

            # Wait for content to load
            page.wait_for_selector("text=Sector 01", timeout=10000)

            # Switch to Music mode to see Timeline
            print("Switching to Music Mode...")
            page.click("button:has-text('Music')")

            # Ignite/Add a segment if needed or verify empty state
            # Current logic in StudioPage adds a segment on startJob if empty in Music mode.
            # But we want to see the timeline.

            # Check if "Sonic Edit Bar" is visible
            page.wait_for_selector("text=Sonic Edit Bar", timeout=10000)

            # Click Ignite to add a segment if empty
            # But the "Ignite" button is in ControlPanel
            # We can also check if timeline is empty

            if page.is_visible("text=Timeline Empty"):
                print("Timeline is empty. Attempting to ignite...")
                # Find Ignite button in Control Panel
                # It is usually the big button
                page.click("#ignite-trigger") # If ID exists? Or by text
                # "IGNITE" text
                page.click("button:has-text('IGNITE')")

                # Wait for segment to appear
                page.wait_for_selector("text=Intro", timeout=10000)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/timeline_optimized.png", full_page=True)
            print("Screenshot saved to verification/timeline_optimized.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_timeline()
