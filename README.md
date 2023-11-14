# Pa11y CI

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![LGPL-3.0-only licensed][shield-license]][info-license]

Pa11y CI is an accessibility test runner built using [Pa11y], designed to run in Continuous Integration environments. Automated testing of your application can help to prevent accessibility issues reaching production.

Use this tool to test against a list of URLs or a sitemap, and report on issues it finds.

## Requirements

This command line tool requires a stable (even-numbered) [Node.js] version of 12 or above.

### Pa11y CI 3 and Ubuntu

To use version 3 of Pa11y CI with a version of Ubuntu above `20.04`, a path for the Chrome executable [must be defined in your Pa11y CI config][ubuntu-fix], as `defaults.chromeLaunchConfig.executablePath`. Version 4 of Pa11y CI, which will use Pa11y 7 along with a more recent version of Puppeteer, will resolve this issue.

## Usage

Pa11y CI is provided as a command line tool, `pa11y-ci`. To install it globally with npm:

```sh
npm install -g pa11y-ci
```

```console
$ npx pa11y-ci --help

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

### Configuration

Pa11y CI checks the current working directory for a JSON config file named `.pa11yci`. An example:

```json
{
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

Pa11y CI will visit each URL in the `urls` array, together with any path provided as a CLI argument. A path can be relative, absolute, or a [glob] pattern.

Specify a different configuration file, JSON or JavaScript, using the command-line parameter `--config`:

```sh
pa11y-ci --config path/to/config.json
```

### Default configuration

You can specify a default set of [pa11y configurations] that should be used for each test run. Attach this to a `defaults` property in your config; for example:

```json
{
    "defaults": {
        "timeout": 1000,
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

* `concurrency`: The number of tests that should be run in parallel. Defaults to `1`.
* `useIncognitoBrowserContext`: Run test with an isolated incognito browser context; stops cookies being shared and modified between tests. Defaults to `true`.

### URL configuration

A URL can be a `string`, or an `object`; in its object form, part or all of the default [pa11y configuration][pa11y configurations] can be overridden per URL. For example, this allows the timeout to be increased for a slow-loading page, or to take a screenshot for a page of particular interest:

```json
{
    "defaults": {
        "timeout": 1000
    },
    "urls": [
        "https://pa11y.org/",
        {
            "url": "https://pa11y.org/contributing",
            "timeout": 50000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

### Sitemaps

Provide a `--sitemap` argument to retrieve a sitemap and then test each URL within:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml
```

Pa11y will be run against the text content of each `<loc/>` in the sitemap's XML.

> NOTE
> Providing a sitemap will cause the `urls` property in your JSON config to be ignored.

#### Transforming URLs retrieved from a sitemap before testing

Pa11y CI can replace a string within each URL found in a sitemap, before beginning to test.  This can be useful when your sitemap contains production URLs, but you'd actually like to test
those pages in another environment. Use the flags `--sitemap-find` and `sitemap-replace`:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml --sitemap-find pa11y.org --sitemap-replace localhost
```

#### Excluding URLs

Exclude URLs from the test run with the flag `--sitemap-exclude`.

## Reporters

Pa11y CI includes two reporters:

* (default) `cli`, a reporter that outputs pa11y results to the console
* `json`, which outputs JSON-formatted results, either to the console or a file

Custom reporters are also supported.

Choose a specific reporter with the flag `--reporter`. The value of this flag can also be:

* a path to a locally installed npm package (ie: `pa11y-reporter-html`)
* a path to a local node module; either an absolute path, or one relative to the current working directory (for example `./reporters/my-reporter.js`)

Example:

```sh
npm install pa11y-reporter-html --save
pa11y-ci https://pa11y.org/ --reporter=pa11y-reporter-html 
```

### Use multiple reporters

You can use multiple reporters by setting them on the `defaults.reporters` array in your config.  The shorthand `cli` and `json` can be included to select the included reporters.

```json
{
    "defaults": {
        "reporters": [
            "cli", // <-- this is the default reporter
            "pa11y-reporter-html",
            "./my-local-reporter.js"
        ]
    },
    "urls": [
        "https://pa11y.org/",
        {
            "url": "https://pa11y.org/contributing",
            "timeout": 50000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

> NOTE
> If the `--reporter` flag is provided on the command line, all appearances of `reporters` in the config file will be overridden.

### Reporter options

Reporters can be configured, when supported, by settings the reporter as an array with its options as the second item:

```json
{
    "defaults": {
        "reporters": [
            "pa11y-reporter-html",
            ["./my-local-reporter.js", { "option1": true }] // <-- note that this is an array
        ]
    },
    "urls": [
        "https://pa11y.org/",
        {
            "url": "https://pa11y.org/contributing",
            "timeout": 50000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

The included CLI reporter does not support any options.

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

### Write a custom reporter

Pa11y CI reporters use an interface similar to [pa11y reporters] and support the following optional methods:

* `beforeAll(urls)`: called at the beginning of the process. `urls` is the URLs array defined in your config
* `afterAll(report)` called at the very end of the process with the following arguments:
  * `report`: pa11y-ci report object
  * `config`: pa11y-ci configuration object
* `begin(url)`: called before processing each URL. `url` is the URL being processed
* `results(results, config)` called after pa11y test run with the following arguments:
  * `results`: pa11y results object [URL configuration object](#url-configuration)
  * `config`: the current [URL configuration object](#url-configuration)
* `error(error, url, config)`: called when a test run fails with the following arguments:
  * `error`: pa11y error message
  * `url`: the URL being processed
  * `config`: the current [URL configuration object](#url-configuration)

Here is an example of a custom reporter writing pa11y-ci report and errors to files:

```js
const fs = require('fs');
const { createHash } = require('crypto');

// create a unique filename from URL
function fileName(url: any, prefix = '') {
    const hash = createHash('md5').update(url).digest('hex');
    return `${prefix}${hash}.json`;
}

exports.afterAll = function (report) {
    return fs.promises.writeFile('report.json', JSON.stringify(report), 'utf8');
}

// write error details to an individual log for each URL
exports.error = function (error, url) {
    const data = JSON.stringify({url, error});
    return fs.promises.writeFile(fileName(url, 'error-'), data, 'utf8');
}
```

#### Configurable reporters

A configurable reporter is a special kind of pa11y-ci reporter exporting a single factory function as its default export.

When initialized, the function receives the user configured options (if any) and pa11y-ci configuration object as argument.

For example, here is a reporter writing all results to a single configurable file:

```js
// ./my-reporter.js

const fs = require('fs');

module.exports = function (options) {
    // initialize an empty report data
    const customReport = {
        results: {},
        errors: [],
        violations: 0,
    }

    const fileName = options.fileName

    return {
        // add results to the report
        results(results) {
            customReport.results[results.pageUrl] = results;
            customReport.violations += results.issues.length;
        },

        // add errors too
        error(error, url) {
            customReport.errors.push({ error, url });
        },

        // write everything to a file
        afterAll() {
            const data = JSON.stringify(customReport);
            return fs.promises.writeFile(fileName, data, 'utf8');
        }
    }
};
```

```json
// configuration file
{
    "defaults": {
        "reporters": [
            ["./my-reporter.js", { "fileName": "./my-report.json" }]
        ]
    },
    "urls": [
        ...
    ]
}
```

### Docker

If you want to run `pa11y-ci` in a Docker container then you can use the [`buildkite/puppeteer`](https://github.com/buildkite/docker-puppeteer) image as this installs Chrome and all the required libs to run headless chrome on Linux.

You will need a `config.json` that sets the `--no-sandbox` Chromium launch arguments:

```json
{
    "defaults": {
        "chromeLaunchConfig": {
            "args": [
                "--no-sandbox"
            ]
        }
    },
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

And then a Dockerfile that installs `pa11y-ci` and adds the `config.json`

```Dockerfile
FROM buildkite/puppeteer:v1.15.0

RUN npm install --global --unsafe-perm pa11y-ci
ADD config.json /usr/config.json

ENTRYPOINT ["pa11y-ci", "-c", "/usr/config.json"]
```

## Tutorials and articles

Here are some useful articles written by Pa11y users and contributors:

* [Automated accessibility testing with Travis and Pa11y CI](https://andrewmee.com/posts/automated-accessibility-testing-node-travis-ci-pa11y/)

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
npm run coverage            # Run the unit tests, reporting coverage
npm run test-integration    # Run only the integration tests
```

## Support and migration

> [!NOTE]
> We maintain a [migration guide](MIGRATION.md) to help you migrate between major versions.

When we release a new major version we will continue to support the previous major version for 6 months. This support will be limited to fixes for critical bugs and security issues. If you're opening an issue related to this project, please mention the specific version that the issue affects.

The following table lists the major versions available and, for each previous major version, its end-of-support date, and its final minor version released.

| Major version | Final minor release | Node.js LTS support | Support end date |
| :------------ | :------------------ | :------------------ | :--------------- |
| 🔜 `4`        |                     | `>= 18`             |                  |
| `3`           | Imminent            | `>= 12` ([Ubuntu caveat](#pa11y-ci-3-and-ubuntu))| May 2024 |
| `2`           | `2.4.2`             | `>= 8`              | 2022-05-26       |
| `1`           | `1.3`               | `>= 4`              | 2018-04-18       |

## Licence

Licensed under the [Lesser General Public License (LGPL-3.0-only)](LICENSE).  
Copyright &copy; 2016-2023, Team Pa11y and contributors

[glob]: https://github.com/isaacs/node-glob#glob
[node.js]: https://nodejs.org/
[pa11y]: https://github.com/pa11y/pa11y
[pa11y configurations]: https://github.com/pa11y/pa11y#configuration
[pa11y reporters]: https://github.com/pa11y/pa11y#reporters
[ubuntu-fix]: https://github.com/pa11y/pa11y-ci/issues/198#issuecomment-1418343240

[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y-ci
[info-build]: https://github.com/pa11y/pa11y-ci/actions/workflows/tests.yml

[shield-license]: https://img.shields.io/badge/license-LGPL--3.0--only-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-8-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-ci.svg
[shield-build]: https://github.com/pa11y/pa11y-ci/actions/workflows/tests.yml/badge.svg
