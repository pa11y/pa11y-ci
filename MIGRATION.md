# Migration guide

Major versions of Pa11y CI can bring API or compatibility changes. This is a guide to help you make the switch when that happens.

## Migrating from 3.0 to 4.0

Pa11y CI v4 requires a stable (even-numbered) Node.js version of 20 or above.

We've also upgraded to Pa11y 9 (from 6), which includes upgrading to Puppeteer 24 (from 20) and Axe 4.10 (from 4.8), as well as  more recent major versions of several other dependencies - see the Pa11y CI [changelog](https://github.com/pa11y/pa11y-ci/blob/main/CHANGELOG.md) for the complete list.

Puppeteer v22 and subs default to Chrome's [_new_ headless mode](https://developer.chrome.com/docs/chromium/new-headless) to more closely mimic the behavior of headful Chrome. This may affect performance; see the [Puppeteer docs](https://github.com/puppeteer/puppeteer?tab=readme-ov-file#default-runtime-settings) for more information.

* If you were using a `chromeLaunchConfig` with `headless: 'new'`, change to `headless: true` or remove the `headless` setting as `true` is now the default.
* If you were using a `chromeLaunchConfig` with `headless: true` or no `headless` setting, and want to continue use the previous headless mode, change to `headless: 'shell'`.

The Pa11y upgrade incorporates an upgrade of `axe-core` to `4.10` from `4.2`, which contains rule fixes that may change results when using the `axe` runner. See axe-core [releases](https://github.com/dequelabs/axe-core/releases) for complete details.

See the `pa11y` [migration guide](https://github.com/pa11y/pa11y/blob/main/MIGRATION.md) for details on other changes from 6.0 to 9.0, which should not affect most users of Pa11y CI.

## Migrating from 2.0 to 3.0

### New defaults for `concurrency` and `useIncognitoBrowserContext`

Pa11y CI default concurrency when running tests is now set to 1 instead of the previous 2. This may slow down running of multiple tests but it will help Pa11y CI run more consistently on Continuous Integration environments with limited resources. Users can change this value by setting the [`concurrency` property in the default configuration](https://github.com/pa11y/pa11y-ci#default-configuration).

Pa11y CI now creates a new Incognito browser context by default for each page it tests. This will help pa11y-ci run tests more reliably as the state of a page will not depend on pages tested previous any more. This also means that cookies by default won't be shared between different pages on the same origin. If your tests depend on cookies being shared between different tests, you can use the [`useIncognitoBrowserContext` in the default configuration](https://github.com/pa11y/pa11y-ci#default-configuration) to revert to the previous behaviour.

## Migrating from 1.0 to 2.0

### Node.js support

Pa11y CI 2.0 only supports Node.js v8.0.0 and higher, you'll need to upgrade to be able to use the latest versions of Pa11y CI.

### Changes to Pa11y test runner

Pa11y CI now uses Pa11y 5.0 to run its tests, which has introduced numerous changes to the underlying test runner.

Most importantly for upgrading your Pa11y CI, the new version of [Pa11y has removed or renamed numerous Configuration options](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#configuration).  If you are using one of these old configuration options, they will no longer be effective in Pa11y CI 2.0.

You can read more about all of the other changes to Pa11y in the [Pa11y Migration Guide](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#migrating-from-40-to-50)
