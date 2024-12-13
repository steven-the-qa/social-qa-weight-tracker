import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: 'e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // DEV
    baseURL: 'http://localhost:5173',
    // PROD
    // baseURL: 'https://social-qa-weight-tracker.web.app',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: process.env.CI ? true : false,
    testIdAttribute: 'data-testid'
  },

  /* Configure projects for major browsers */
  projects: [
    /* Desktop */
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      }
    },
    /* Mobile */
    {
      name: 'iPhone Chrome',
      use: {
        ...devices['iPhone 12'],
      }
    },
    {
      name: 'Pixel Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Galaxy Chrome',
      use: {
        ...devices['Galaxy S9+']
      }
    }
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'playwright-artifacts',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 30000
  }
}

export default config
