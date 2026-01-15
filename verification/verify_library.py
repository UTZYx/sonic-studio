
from playwright.sync_api import sync_playwright

def verify_studio(page):
    # Go to studio page (assuming port 3000)
    page.goto("http://localhost:3000/studio")

    # Wait for the Library Panel to be visible
    # The Library Panel header has "Sonic Archive"
    page.wait_for_selector("text=Sonic Archive", timeout=10000)

    # Wait a bit for files to load (mock or real)
    # The empty state text is "Archive Empty. Ignite a job."
    # OR we might see files.
    # We want to screenshot the library panel area.

    # Take a screenshot
    page.screenshot(path="verification/studio_library.png")

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
