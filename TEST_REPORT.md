[0m[1mbun test [0m[2mv1.3.5 (1e86cebd)[0m


# E2E Tests

[2m[WebServer] [22m
[2m[WebServer] [22m  [32m[1mVITE[22m v7.3.1[39m  [2mready in [0m[1m2757[22m[2m[0m ms[22m
[2m[WebServer] [22m
[2m[WebServer] [22m  [32m➜[39m  [1mLocal[22m:   [36mhttp://localhost:[1m3006[22m/[39m
[2m[WebServer] [22m  [32m➜[39m  [1mNetwork[22m: [36mhttp://192.168.29.229:[1m3006[22m/[39m
[2m[WebServer] [22m[vite] connected.

Running 1 test using 1 worker

  ✘  1 [chromium] › tests/e2e/app.spec.ts:3:1 › has title and dashboard text (11.3s)


  1) [chromium] › tests/e2e/app.spec.ts:3:1 › has title and dashboard text ─────────────────────────

    Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

    Locator: getByText('System is online')
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
    [2m  - Expect "toBeVisible" with timeout 10000ms[22m
    [2m  - waiting for getByText('System is online')[22m


      11 |
      12 |     // Expect "System is online" to be visible
    > 13 |     await expect(page.getByText('System is online')).toBeVisible();
         |                                                      ^
      14 | });
      15 |
        at /Users/aryaminakshi/Developer/health/tests/e2e/app.spec.ts:13:54

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/app-has-title-and-dashboard-text-chromium/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results/app-has-title-and-dashboard-text-chromium/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/app-has-title-and-dashboard-text-chromium/error-context.md

  1 failed
    [chromium] › tests/e2e/app.spec.ts:3:1 › has title and dashboard text ──────────────────────────

[36m  Serving HTML report at http://localhost:49318. Press Ctrl+C to quit.[39m
E2E: 1 passed (app.spec.ts)
