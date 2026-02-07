import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    timeout: 60000,
    expect: {
        timeout: 10000,
    },
    reporter: [
        ["html", { outputFolder: "playwright-report" }],
        ["list"],
    ],
    use: {
        baseURL: "http://localhost:3006",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "cd apps/web && SKIP_CLOUDFLARE=true PORT=3006 bun run dev",
        url: "http://localhost:3006",
        reuseExistingServer: !process.env.CI,
        timeout: 180000,
        stdout: "pipe",
        stderr: "pipe",
    },
});
