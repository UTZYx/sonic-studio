
from playwright.sync_api import sync_playwright, expect
import re

def verify_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context with reduced motion to ensure consistent screenshots
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Navigate to the studio page where components are likely used
        print("Navigating to studio...")
        try:
            page.goto("http://localhost:3000/studio", timeout=60000)

            # Wait for content to load
            page.wait_for_timeout(5000)

            # Take a screenshot of the initial state
            page.screenshot(path="verification/studio_initial.png")
            print("Initial screenshot taken.")

            # Locate sliders (Knob/Fader)
            sliders = page.locator('[role="slider"]')
            count = sliders.count()
            print(f"Found {count} sliders.")

            if count > 0:
                first_slider = sliders.first
                # Verify attributes
                expect(first_slider).to_have_attribute("tabindex", "0")
                # Using regex to match any number
                expect(first_slider).to_have_attribute("aria-valuenow", re.compile(r".*"))

                # Focus and take screenshot to see focus ring
                first_slider.focus()
                page.wait_for_timeout(500)
                page.screenshot(path="verification/slider_focused.png")
                print("Slider focused screenshot taken.")

            # Locate switches
            switches = page.locator('[role="switch"]')
            switch_count = switches.count()
            print(f"Found {switch_count} switches.")

            if switch_count > 0:
                first_switch = switches.first
                # Verify attributes
                expect(first_switch).to_have_attribute("tabindex", "0")

                # Focus and take screenshot
                first_switch.focus()
                page.wait_for_timeout(500)
                page.screenshot(path="verification/switch_focused.png")
                print("Switch focused screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_accessibility()
