
from playwright.sync_api import sync_playwright

def verify_studio(page):
    page.set_viewport_size({"width": 1280, "height": 1800})
    # Go to studio page (assuming port 3000)
    page.goto("http://localhost:3000/studio")

    # Wait for the Library Panel to be visible
    page.wait_for_selector("text=Sonic Archive", timeout=30000)

    # Wait for animation/load
    page.wait_for_timeout(2000)

    # Scroll to bottom
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Take a screenshot
    page.screenshot(path="verification/studio_library_3.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_studio(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
