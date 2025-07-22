# Changelog

## 4.0.0 (2025-07-22)

Pa11y CI 4.0.0 requires a stable (even-numbered) Node.js version of `20` or above, updates to the latest version of Pa11y (`9`) and Puppeteer (`24`), updates several other dependencies, and includes some GitHub actions and documentation cleanup. See the [migration guide](https://github.com/pa11y/pa11y-ci/blob/main/MIGRATION.md#migrating-from-30-to-40) for details.

### Changes

* **Breaking**: Upgrade Node.js support: Pa11y CI 4 requires a stable (even-numbered) Node.js version of `20` or above, dropping support for Node 12, 14, 16, 18.
* **Breaking**: Upgrade `pa11y` to `9` (from `6`), which updates numerous dependencies, fixes issues with Pa11y CI failing to run on Ubuntu 24.04, and resolves several vulnerabilities and deprecated packages (closing [#198](https://github.com/pa11y/pa11y-ci/issues/198), [#227](https://github.com/pa11y/pa11y-ci/issues/227), [#242](https://github.com/pa11y/pa11y-ci/issues/242), [#247](https://github.com/pa11y/pa11y-ci/issues/247)).
  * Upgrade `puppeteer` to `24` (from `9.1`), which updates to the current Chrome. This changes Chrome's default headless mode, see the [migration guide](https://github.com/pa11y/pa11y-ci/blob/main/MIGRATION.md#migrating-from-30-to-40) for details. Also expand the `puppeteer` dependency compatibility to caret (patch and minor releases) to allow upgrades to a more recent compatible version upon install (which frequently contains Chrome updates and security patches).
  * Upgrade `axe-core` to `4.10` from `4.2`. This includes rule fixes that may change results when using the `axe` runner. See axe-core [releases](https://github.com/dequelabs/axe-core/releases) for complete details.
  * Upgrade `semver` to `7.7` from `7.3`, resolving [CVE-2022-25883](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw).
* Fixed issue with `pa11y-ci` process hanging if `browser` passed from config file. (#248)
* Other dependency upgrades: `commander` to `14.0`, `async` to `3.2`, `cheerio` to `1.1`, and `node-fetch` to `2.7`.
* GitHub Actions changes: Update workflows for supported Node version, [Ubuntu 24.04 compatibility](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md), and [publishing package with provenance](https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/).
* Other changes: Refactor code and tests for dependency compatibility, update support table and fix some links in the README.

See the [migration guide](https://github.com/pa11y/pa11y-ci/blob/main/MIGRATION.md#migrating-from-30-to-40) for details.

### Full changelog

[3.1.0...4.0.0](https://github.com/pa11y/pa11y-ci/compare/3.1.0...4.0.0)

### Changes

## 3.1.0 (2023-11-14)

### Changes

* Upgrade `pa11y` to `^6.2.3` from `~6.1.0`
  * Switch to caret for `pa11y` to allow `pa11y` to be upgraded to a more recent compatible version upon install (thanks @aarongoldenthal)
* [Fix licensing identifier](https://github.com/pa11y/pa11y-ci/pull/123) (thanks @LorenzoAncora)
* Update documentation:
  * Indicate support for more recent stable versions of operating systems and Node.js
  * Add [JS config file example](https://github.com/pa11y/pa11y-ci/pull/197) (thanks @aarongoldenthal)

### New contributors

* @LorenzoAncora [made their first contribution](https://github.com/pa11y/pa11y-ci/pull/123)
* @danyalaytekin [made their first contribution](https://github.com/pa11y/pa11y-ci/pull/213)

### Behind the scenes

* Expand testing to:
  * [test Windows and macOS](https://github.com/pa11y/pa11y-ci/pull/177) alongside Linux (thanks again @aarongoldenthal)
  * test with Node.js 18 and 20, alongside 12, 14, 16

### Full changelog

[3.0.1...3.1.0](https://github.com/pa11y/pa11y-ci/compare/3.0.1...3.1.0)

## 3.0.1 (2021-12-20)

* missing await for async function (thanks @aarongoldenthal)

## 3.0.0 (2021-11-26)

* Add support for reporters that work similar to the pa11y ones (thanks @dwightjack, @aarongoldenthal).
* Update pa11y to version 6.
* Drop support for versions of Node.js older than 12.
* Default concurrency is now 1 instead of 2.
* Default browser context for each page is now Incognito.
* Documentation cleanup.

See the [migration guide](https://github.com/pa11y/pa11y-ci/blob/master/MIGRATION.md#migrating-from-20-to-30) for details.

## 2.4.2 (2021-06-28)

* If Chrome crashes during startup, pa11y-ci will now retry to launch Chrome once before bailing out instead of giving up straight away
* Add Docker examples to documentation
* Reduce size of npm package (thanks @mfranzke)

## 2.4.1 (2021-04-25)

* Upgrades pa11y to the latest 5.3.1 version
* Fix a bug related to having to download puppeteer twice since pa11y 5.3.1 was release (#131)

## 2.4.0 (2020-08-18)

* Adds support for parsing sitemapindex (Thanks @42tte)
* Better test coverage (Thanks @kkoskelin)
* Updated dependencies and devDependencies
* Less eslint warnings
* Restrict dependency upgrades to bugfixes to avoid potential breakages when updating or integrating with other apps
* Minor documentation improvements and fixes

## 2.3.1 (2020-08-17)

Add missing puppeteer dependency

## 2.3.0 (2019-05-14)

* Add useIncognitoBrowserContext option for test runs

## 2.2.0 (2019-04-16)

* Allow loaded config to return promises

## 2.1.1 (2018-04-24)

* Pin puppeteer at 1.0.0 to fix file URL issues

## 2.1.0 (2018-04-09)

* Respect the Pa11y `threshold` configuration option for individual urls when determining whether to pass or fail

## 2.0.1 (2018-03-14)

* Fix an issue with reporting null contexts

## 2.0.0 (2018-03-12)

* See the [migration guide](https://github.com/pa11y/pa11y-ci/blob/master/MIGRATION.md#migrating-from-10-to-20) for details

## 1.3.1 (2017-12-06)

* Fix the way configurations are loaded

## 1.3.0 (2017-10-18)

* Add the ability to specify paths and URLs as command-line arguments
* Documentation updates

## 1.2.0 (2017-06-02)

* Add the ability to make Pa11y CI perform POST requests
* Documentation and linting updates

## 1.1.1 (2017-03-13)

* Update readme to document `--sitemap-exclude`

## 1.1.0 (2017-03-11)

* Add a `--sitemap-exclude` parameter to the command-line interface

## 1.0.2 (2017-03-08)

* Use Pa11y 4.7.0+

## 1.0.1 (2017-03-08)

* Use default wrapWidth if process.stdout.columns is reported as 0

## 1.0.0 (2017-03-07)

* Initial stable release

## 0.5.0 pre-release (2016-12-16)

* Add and document the `verifyPage` option

## 0.4.0 pre-release (2016-12-05)

* Exit with an error if config files have syntax errors

## 0.3.1 pre-release (2016-11-30)

* Updates pa11y dependency to ^4.2

## 0.3.0 pre-release (2016-09-20)

* Add a `--threshold` parameter to the command-line interface

## 0.2.0 pre-release (2016-07-26)

* Add support for find/replace in sitemap URLs

## 0.1.0 pre-release (2016-07-05)

* Initial release
