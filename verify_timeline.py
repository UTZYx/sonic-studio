from playwright.sync_api import sync_playwright, expect

def verify_timeline():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use context with larger viewport to see timeline
        context = browser.new_context(viewport={"width": 1280, "height": 1024})
        context.grant_permissions(['microphone'])
        page = context.new_page()

        try:
            print("Navigating to Studio...")
            page.goto("http://localhost:3000/studio")

            # Wait for hydration
            page.wait_for_timeout(2000)

            # Select 'Music' mode to show Timeline
            print("Selecting Music Mode...")
            page.get_by_role("button", name="music").click()

            # Trigger ignite to initialize segments
            print("Triggering Ignite...")
            if page.locator("#ignite-trigger").count() > 0:
                page.locator("#ignite-trigger").click()
            else:
                page.get_by_role("button", name="IGNITE").click()

            # Wait for Timeline to appear
            print("Waiting for Timeline...")
            expect(page.get_by_text("Sonic Edit Bar")).to_be_visible(timeout=10000)

            # Wait for at least one segment
            expect(page.get_by_text("Intro").first).to_be_visible()

            # Verify Toggle Layers button exists
            print("Verifying Toggle Layers button...")
            expect(page.get_by_title("Toggle Layers").first).to_be_visible()

            # Wait a bit for animations
            page.wait_for_timeout(1000)

            # Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verify_timeline.png", full_page=True)
            print("Screenshot saved to verify_timeline.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verify_timeline_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_timeline()
