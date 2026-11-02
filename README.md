# Pa11y CI

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![LGPL-3.0-only licensed][shield-license]][info-license]

Pa11y CI is an accessibility test runner built using [Pa11y], designed to run in Continuous Integration environments. Automated testing of your application can help to prevent accessibility issues reaching production.

Use this tool to test against a list of URLs or a sitemap, and report on issues it finds.

Automated accessibility checks complement manual testing and testing with assistive technologies. Passing these checks does not guarantee that your site is accessible or complies with accessibility standards.

On the command line:

```sh
pa11y-ci https://example.com https://example.com/about
```

Or test all URLs in a sitemap:

```sh
pa11y-ci --sitemap https://example.com/sitemap.xml
```

In JavaScript:

```js
const pa11yCi = require('pa11y-ci');

pa11yCi(['https://example.com', 'https://example.com/about'], {}).then((results) => {
    // Use the results
});
```

## Requirements

Pa11y CI requires a supported LTS version of [Node.js]. See [Support and migration](#support-and-migration) for the Node.js versions supported by each major release.

## Command-line interface

Pa11y CI is provided as a command line tool, `pa11y-ci`. To install it globally with npm:

```sh
npm install -g pa11y-ci
```

```console
$ pa11y-ci --help

Usage: pa11y-ci [options] <paths>

Options:
  -V, --version                    output the version number
  -c, --config <path>              the path to a JSON or JavaScript config file
  -s, --sitemap <url>              the path to a sitemap
  -f, --sitemap-find <pattern>     a pattern to find in sitemaps. Use with --sitemap-replace
  -r, --sitemap-replace <string>   a replacement to apply in sitemaps. Use with --sitemap-find
  -x, --sitemap-exclude <pattern>  a pattern to find in sitemaps and exclude any url that matches
  -j, --json                       Output results as JSON
  -T, --threshold <number>         permit this number of errors, warnings, or notices, otherwise fail with exit code 2
                                   (default: "0")
  --reporter <reporter>            the reporter to use. Can be a npm module or a path to a local file.
  -h, --help                       display help for command
```

### URLs and local files

Test one or more URLs by passing them as command-line arguments:

```sh
pa11y-ci https://example.com https://example.com/about
```

You can also test local HTML files using relative paths, absolute paths, or [glob] patterns. Quote glob patterns so Pa11y CI can expand them:

```sh
pa11y-ci ./index.html "./pages/**/*.html"
```

Command-line arguments are tested together with any URLs listed in your [configuration](#configuration).

### JSON output

Use `--json` (or `-j`) to print the full report as JSON to standard output instead of the usual console output:

```sh
pa11y-ci https://example.com --json > results.json
```

To write JSON to a file while keeping the console output, use the [JSON reporter](#reporter-options) instead.

### Exit codes and thresholds

The command-line tool uses the following exit codes:

* `0`: All pages passed, or the total number of reported issues is below the command-line threshold.
* `1`: Pa11y CI failed due to a technical fault, such as an invalid configuration or a sitemap that could not be loaded.
* `2`: At least one page failed and the total number of reported issues reached or exceeded the command-line threshold.

The command-line threshold defaults to `0`, so any accessibility errors or failed page tests cause an exit code of `2`. By default, only accessibility errors are reported; use the Pa11y options `includeWarnings` and `includeNotices` in your configuration to include warnings and notices too.

Use `--threshold` (or `-T`) to set a threshold for the whole run. For example, fail when there are five or more reported issues:

```sh
pa11y-ci https://example.com https://example.com/about --threshold 5
```

You can also set `threshold` in your configuration's `defaults` or individual URL options. These thresholds apply per page: a page passes when its issue count is at or below its threshold, and its issues do not count towards the command-line threshold.

## Configuration

Pa11y CI looks in the current working directory for a configuration file. It uses the first of these that exists: `.pa11yci` (JSON), `.pa11yci.cjs`, `.pa11yci.js`, or `.pa11yci.json`. An example:

```json
{
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

Pa11y CI will visit each URL in the `urls` array, together with any path provided as a CLI argument. Entries in `urls` can be URLs or local file paths, either relative or absolute. [Glob] patterns are only expanded when passed as command-line arguments.

Specify a different configuration file, JSON or JavaScript, using the command-line parameter `--config`:

```sh
pa11y-ci --config path/to/config.json
```

Most [Pa11y options][pa11y configurations] configure individual page tests. Set them in `defaults` to reuse them across pages, or in a URL object to override them for that page. Some Pa11y CI options control the whole run and must be set in `defaults`.

| Scope | Options | Where to set them |
| :--- | :--- | :--- |
| Per page | For example `timeout`, `viewport`, `runners`, `actions`, `headers`, `ignore`, `includeWarnings`, `includeNotices`, `screenCapture`, `threshold`. See [Pa11y's options][pa11y configurations] for the full list | In `defaults`, with optional overrides in URL objects |
| Whole run | `concurrency`, `reporters`, `chromeLaunchConfig`, `useIncognitoBrowserContext` | In `defaults`; URL objects cannot override them |
| Whole-run CLI threshold | `--threshold` / `-T` | On the command line |

Pa11y CI launches one shared browser, so `chromeLaunchConfig` cannot vary by page. See [Exit codes and thresholds](#exit-codes-and-thresholds) for the distinction between per-page and command-line thresholds.

### Default configuration

You can specify a default set of [pa11y configurations] that should be used for each page test. Attach this to a `defaults` property in your config; for example:

```json
{
    "defaults": {
        "viewport": {
            "width": 320,
            "height": 480
        }
    },
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

Pa11y CI supports two additional options here:

* `concurrency`: The maximum number of page tests to run in parallel. Defaults to `1`.
* `useIncognitoBrowserContext`: Gives each URL a fresh, isolated incognito browser context, which is closed once that URL has been tested. Cookies and local storage are not shared between URLs, so a login performed while testing one URL does not carry over to another. When set to `false`, all URLs share the browser's default context, including its cookies and storage. Defaults to `true`.

### URL configuration overrides

A URL can be a `string`, or an `object`. A URL object can override per-page options from `defaults`. Whole-run settings, such as `concurrency` and `reporters`, cannot be overridden per URL. For example, this allows the timeout to be increased for a slow-loading page, or to take a screenshot for a page of particular interest:

```json
{
    "urls": [
        "https://pa11y.org/",
        {
            "url": "https://pa11y.org/contributing",
            "timeout": 60000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

### JavaScript configuration file

If a JavaScript configuration file is used, it should be a CommonJS module that exports a configuration object. This can be used to dynamically update configuration parameters, for example taking data from environment variables as shown in the example below.

```js
module.exports = {
    defaults: {
        headers: {
            token: process.env.TOKEN
        }
    },
    urls: [
        "https://pa11y.org/"
    ]
};
```

### Runner selection and actions

Use the `runners` array to choose which accessibility test runners to use: `htmlcs` (HTML_CodeSniffer, the default), `axe` (axe-core), or both. Set it in `defaults` for all URLs, or in an individual URL's configuration to override it. See [Pa11y's runner documentation][pa11y runners] for details.

Use the `actions` array to interact with a page before testing it, for example to click a button, fill in a form, or wait for an element to become visible. Actions run in order and can also be set in `defaults` or per URL:

```json
{
    "defaults": {
        "runners": ["axe", "htmlcs"]
    },
    "urls": [
        {
            "url": "https://example.com/",
            "actions": [
                "click element #menu-toggle",
                "wait for element #menu to be visible"
            ]
        }
    ]
}
```

See [Pa11y's actions documentation][pa11y actions] for the available actions and their syntax.

## Sitemaps

Provide a `--sitemap` argument to retrieve a sitemap and then test each URL within:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml
```

Pa11y will be run against the text content of each `<loc/>` in the sitemap's XML.

If the sitemap is a sitemap index (a `<sitemapindex>` listing other sitemaps), Pa11y CI fetches each listed sitemap and tests the URLs found in all of them.

Any `headers` set in `defaults` are sent with the sitemap request as well as with
the page loads, so a sitemap behind the same authentication can still be read.

### Transforming URLs in a sitemap before testing

Pa11y CI can replace a string within each URL found in a sitemap, before beginning to test.  This can be useful when your sitemap contains production URLs, but you'd actually like to test
those pages in another environment. Use the flags `--sitemap-find` and `--sitemap-replace`:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml --sitemap-find "pa11y\.org" --sitemap-replace localhost
```

### Excluding URLs

Exclude URLs from the test run with the flag `--sitemap-exclude`:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml --sitemap-exclude path
```

The `--sitemap-exclude` flag like the `--sitemap-find` flag accepts a regular expression therefore if you want to exclude multiple patterns:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml --sitemap-exclude "path|example"
```
Additionally, you can selectively add urls back to the test run after excluding them using CLI arguments:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml --sitemap-exclude "path|example" https://pa11y.org/example/2
```

> **Note:** The `--sitemap-exclude` flag cannot be chained as only the last argument will be accepted.

## Reporters

Pa11y CI includes two reporters:

* (default) `cli`, a reporter that outputs pa11y results to the console
* `json`, which outputs JSON-formatted results, either to the console or a file

Custom reporters are also supported.

Choose a specific reporter with the flag `--reporter`. The value of this flag can also be:

* the name of an installed npm package that implements the Pa11y CI reporter interface (for example `pa11y-ci-reporter-myreporter`)
* a path to a local node module; either an absolute path, or one relative to the current working directory (for example `./reporters/my-reporter.js`)

For example, if a third-party package named `pa11y-ci-reporter-myreporter` were available:

```sh
npm install pa11y-ci-reporter-myreporter
pa11y-ci https://pa11y.org/ --reporter=pa11y-ci-reporter-myreporter
```

### Use multiple reporters

You can use multiple reporters by setting them on the `defaults.reporters` array in your config.  The shorthand `cli` and `json` can be included to select the included reporters.

```json
{
    "defaults": {
        "reporters": [
            "cli", // <-- this is the default reporter
            "pa11y-ci-reporter-myreporter",
            "./my-local-reporter.js"
        ]
    },
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

> **Note:** If the `--reporter` flag is provided on the command line, all appearances of `reporters` in the config file will be overridden. The flag accepts a single reporter and cannot pass [reporter options](#reporter-options); use `defaults.reporters` in your configuration for that.

### Reporter options

Reporters can be configured, when supported, by setting the reporter as an array with its options as the second item:

```json
{
    "defaults": {
        "reporters": [
            "pa11y-ci-reporter-myreporter",
            ["./my-local-reporter.js", { "option1": true }] // <-- note that this is an array
        ]
    },
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

The included CLI reporter accepts a `wrapWidth` option: the number of characters at which to wrap issue details. By default it uses the width of the terminal.

```json
{
    "defaults": {
        "reporters": [
            ["cli", { "wrapWidth": 100 }]
        ]
    },
    "urls": [
        "https://pa11y.org/"
    ]
}
```

The included JSON reporter outputs the results to the console by default.  It can also accept a `fileName` with a relative or absolute file name where the JSON results will be written. Relative file name will be resolved from the current working directory.

```json
{
    "defaults": {
        "reporters": [
            ["json", { "fileName": "./results.json" }] // <-- note that this is an array
        ]
    },
    "urls": [
        "https://pa11y.org/"
    ]
}
```

### Writing a custom reporter

Use a CommonJS module that exports either an object containing reporter methods, or a function that receives `(options, config)` and returns that object. The function form lets your reporter accept [reporter options](#reporter-options); `config` is the merged `defaults` configuration.

All methods are optional and may return a Promise. When several reporters are configured, each method is called on all of them in parallel, and Pa11y CI waits for all of them to finish before continuing:

| Method | When called |
| :--- | :--- |
| `beforeAll(urls)` | Before testing begins, with the full array of URLs or URL configuration objects. |
| `begin(url)` | Before testing each page. |
| `results(results, config)` | After a successful page test, with the [Pa11y results object](https://github.com/pa11y/pa11y#javascript-interface) and that page's configuration. |
| `error(error, url, config)` | When a page test fails, with the error object, URL, and that page's configuration. |
| `afterAll(report, config)` | After all tests finish, with the [combined report](#javascript-interface) and the merged `defaults` configuration. |

For example, this configurable reporter writes a plain-text summary of the run to a file:

```js
// ./my-reporter.js
const fs = require('node:fs');

module.exports = function (options = {}) {
    return {
        afterAll(report) {
            const lines = [`${report.passes}/${report.total} URLs passed`];
            for (const [url, issues] of Object.entries(report.results)) {
                if (issues.length) {
                    lines.push(`FAIL ${url} (${issues.length})`);
                }
            }
            return fs.promises.writeFile(
                options.fileName || './summary.txt',
                lines.join('\n'),
                'utf8'
            );
        }
    };
};
```

Select it and set its output filename in your configuration:

```json
{
    "defaults": {
        "reporters": [
            ["./my-reporter.js", { "fileName": "./summary.txt" }]
        ]
    },
    "urls": ["https://example.com"]
}
```

## JavaScript interface

Install Pa11y CI as a dependency:

```sh
npm install pa11y-ci
```

Call `pa11yCi(urls, options)` with an array of URLs and an options object (use `{}` for the defaults). It returns a Promise that resolves to a report:

```js
const pa11yCi = require('pa11y-ci');

pa11yCi(['https://example.com', 'https://example.com/about'], {
    concurrency: 2,
    log: console,
    runners: ['axe']
}).then((report) => {
    console.log(`${report.passes} of ${report.total} pages passed`);
    console.log(report.results);
});
```

The options object accepts the same settings as the configuration file's `defaults` property. Array entries can also be objects with a `url` and per-page options, as shown in [URL configuration overrides](#url-configuration-overrides). The JavaScript interface does not automatically load a configuration file.

The default `cli` reporter writes its output through the `log` option, which has `info` and `error` methods. Without `log`, the JavaScript interface prints nothing; pass `log: console` to see the usual output.

The report contains:

* `total`: The number of pages tested.
* `passes`: The number of pages that passed, including those within their per-page threshold.
* `errors`: The total number of accessibility issues on pages that exceeded their per-page threshold.
* `results`: An object mapping page URLs to arrays of accessibility issues or errors from failed tests. Passing pages have empty arrays. For pages that were tested, the key is the final URL of the page, which may differ from the URL you provided (for example after a redirect, or `file://…` for local files). For tests that failed to run, the key is the URL you provided. If the same URL is listed twice, it appears once in `results` but is counted twice in `total`.

## Common questions and troubleshooting

See [Pa11y's Troubleshooting guide](https://github.com/pa11y/pa11y/blob/main/TROUBLESHOOTING.md) to get the answers to common questions about Pa11y, along with some ideas to help you troubleshoot problems when using Pa11y CI.

## Tutorials and articles

You can find some useful tutorials and articles in the [Tutorials section](https://pa11y.org/tutorials/) of [pa11y.org](https://pa11y.org/).

## Contributing

There are many ways to contribute to Pa11y CI, some of which we describe in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo locally and commit your code on a new branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull request:

```sh
npm run lint    # Lint the code
npm test        # Run every test, reporting coverage
```

You can also run verifications and tests individually:

```sh
npm run test-unit           # Run only the unit tests
npm run test-coverage       # Run the unit tests, reporting coverage
npm run test-integration    # Run only the integration tests
```

## Support and migration

We maintain a [migration guide](MIGRATION.md) to help you migrate between major versions.

When we release a new major version we will continue to support the previous major version for 6 months. This support will be limited to fixes for critical bugs and security issues. If you're opening an issue related to this project, please mention the specific version that the issue affects.

The following table lists the major versions available and, for each previous major version, its end-of-support date, and its final minor version released.

| Major version | Final minor release | Node.js LTS support  | Support end date         |
| :------------ | :------------------ | :------------------- | :----------------------- |
| `5`           | _(still supported)_ | `22.13+`, `24`, `26` | ✅ Current major version  |
| `4`           | _(still supported)_ | `20`, `22`, `24`     | 2027-04-05               |
| `3`           | `3.1.0`             | `>= 12`              | May 2024 |
| `2`           | `2.4.2`             | `>= 8`               | 2022-05-26               |
| `1`           | `1.3`               | `>= 4`               | 2018-04-18               |

## Licence

Licensed under the [Lesser General Public License (LGPL-3.0-only)](LICENSE).  
Copyright &copy; 2016-2026, Team Pa11y and contributors

[glob]: https://github.com/isaacs/node-glob#glob
[node.js]: https://nodejs.org/
[pa11y]: https://github.com/pa11y/pa11y
[pa11y configurations]: https://github.com/pa11y/pa11y#configuration
[pa11y actions]: https://github.com/pa11y/pa11y#actions
[pa11y runners]: https://github.com/pa11y/pa11y#runners

[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y-ci
[info-build]: https://github.com/pa11y/pa11y-ci/actions/workflows/tests.yml

[shield-license]: https://img.shields.io/badge/license-LGPL--3.0--only-blue.svg
[shield-node]: https://img.shields.io/node/v/pa11y-ci.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-ci.svg
[shield-build]: https://github.com/pa11y/pa11y-ci/actions/workflows/tests.yml/badge.svg
