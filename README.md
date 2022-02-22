# Pa11y CI

Pa11y CI is an accessibility test runner built using [Pa11y] for use in Continuous Integration (CI) environments.

Pa11y CI runs accessibility tests against multiple URLs and reports on any issues. This is best used during automated testing of your application and can act as a gatekeeper to stop a11y issues from making it to live.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![LGPL-3.0-only licensed][shield-license]][info-license]

---

## Table of contents

* [Table of contents](#table-of-contents)
* [Requirements](#requirements)
* [Usage](#usage)
  * [Configuration](#configuration)
  * [Default configuration](#default-configuration)
  * [URL configuration](#url-configuration)
  * [Sitemaps](#sitemaps)
* [Reporters](#reporters)
  * [Use Multiple reporters](#use-multiple-reporters)
  * [Reporter options](#reporter-options)
  * [Write a custom reporter](#write-a-custom-reporter)
    * [Configurable reporters](#configurable-reporters)
  * [Docker](#docker)
* [Tutorials and articles](#tutorials-and-articles)
* [Contributing](#contributing)
* [Support and Migration](#support-and-migration)
* [Licence](#licence)

## Requirements

This command line tool requires [Node.js] 12+. Install through npm:

```sh
npm install -g pa11y-ci
```

## Usage

Run Pa11y CI as a command line tool, `pa11y-ci`:

```sh
Usage: pa11y-ci [options] [<paths>]

Options:

  -h, --help                       output usage information
  -V, --version                    output the version number
  -c, --config <path>              the path to a JSON or JavaScript config file
  -s, --sitemap <url>              the path to a sitemap
  -f, --sitemap-find <pattern>     a pattern to find in sitemaps. Use with --sitemap-replace
  -r, --sitemap-replace <string>   a replacement to apply in sitemaps. Use with --sitemap-find
  -x, --sitemap-exclude <pattern>  a pattern to find in sitemaps and exclude any url that matches
  -j, --json                       Output results as JSON
  -T, --threshold <number>         permit this number of errors, warnings, or notices, otherwise fail with exit code 2
  --reporter <reporter>            The reporter to use. Can be "cli", "json", an npm module, or a path to a local file.
```

### Configuration

By default, Pa11y CI looks for a JSON config file named `.pa11yci` in the current working directory.

To specify a different config file in JSON or JavaScript format, use the `--config` command line argument.

Example config file (JSON):

```json
{
    "urls": [
        "https://pa11y.org/",
        "https://pa11y.org/contributing"
    ]
}
```

Pa11y will be run against each URL specified in the `urls` array and ech path specified in the command line arguments.

Paths can be specified as relative, absolute, and [glob](https://github.com/isaacs/node-glob#glob) patterns.

### Default configuration

You can specify a default set of [pa11y configurations] to use for every test run. Do so by adding a `defaults` object to your config file. For example:

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

Some additional configuration options unique to Pa11y CI can also be set:

* `concurrency`: The number of tests that should be run in parallel. Defaults to `1`.
* `useIncognitoBrowserContext`: Runs test with an isolated incognito browser context, which stops cookies from being shared and modified between tests. Defaults to `true`.

### URL configuration

Each URL in your config file can be an object and specify [pa11y configurations] which override the defaults. To do so, use an object instead of a string, and provide  the URL as a `url` property on that object.

This can be useful if, for example, you know that a certain URL takes a while to load or you want to check what the page looks like when the test is run.

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

Instead of specifying URLs in a config file, you can use an XML sitemap available online. To do so, use the `--sitemap` option:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml
```

This takes the text content of each `<loc>` in the XML and runs Pa11y against that URL. This can also be combined with a config file, but **URLs in the sitemap will override any found in your config file.**

If you'd like to perform a find/replace operation on each URL in a sitemap-- for example, if your sitemap points to production URLs rather than local ones-- then you can use the following flags:

```sh
pa11y-ci --sitemap https://pa11y.org/sitemap.xml --sitemap-find pa11y.org --sitemap-replace localhost
```

The above code ensures that you run Pa11y CI against local URLs instead of the live site.

If there are items in the sitemap that you'd like to exclude from testing (for example, PDFs), you can use the `--sitemap-exclude` flag.

## Reporters

### Built-in reporters

Pa11y CI has two reporters built-in:

* `cli`, a command line interface reporter that outputs pa11y results to the console.
* `json`, a JSON reporter that outputs JSON-formatted results (to the console or a file).

If no reporter is specified, the `cli` reporter is selected by default.

### Selecting a reporter

Use the `--reporter` option to define a single reporter. Set `--reporter` to:

* `cli` or `json` to use one of the two reporters bundled with Pa11y CI
* the path of a locally installed npm module (e.g.: `pa11y-ci-reporter-html`)
* the path to a local node module relative to the current working directory (e.g.: `./reporters/my-reporter.js`)
* an absolute path to a node module (e.g.: `/root/user/me/reporters/my-reporter.js`)

Example of adding an npm module as a reporter:

```sh
npm install pa11y-ci-reporter-html --save
pa11y-ci --reporter=pa11y-ci-reporter-html https://pa11y.org/
```

**Note**: Specifying a reporter will override the default reporter (`cli`).

### Use multiple reporters

Use multiple reporters by setting them in the `defaults.reporters` array in your config.  To specify the reporters bundled with Pa11y CI, you can use the shorthand `cli` and `json`.

```json
{
    "defaults": {
        "reporters": [
            "cli", // <-- this is the default reporter
            "pa11y-ci-reporter-html",
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

**Note**: Specifying the `--reporter` option on the command line will override any reporters specified in the config file.

### Reporter options

To configure a reporter, set it as an array and include the options as the second item:

```json
{
    "defaults": {
        "reporters": [
            "pa11y-ci-reporter-html",
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

The `cli` reporter has no options.

The `json` reporter outputs results to the console by default.  As an option, it accepts a `fileName` with a relative or absolute file name to which the JSON results will be written. Relative file nams are resolved from the current working directory.

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
        // add test results to the report
        results(results) {
            customReport.results[results.pageUrl] = results;
            customReport.violations += results.issues.length;
        },

        // also store errors
        error(error, url) {
            customReport.errors.push({ error, url });
        },

        // write to a file
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

There are many ways to contribute to Pa11y CI, we cover these in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo locally and commit your code on a new branch.

Please write unit tests for your code, and check that everything works by running the following before opening a <abbr title="pull request">PR</abbr>:

```sh
npm run lint
npm test
```

You can also run verifications and tests individually:

```sh
npm run lint                # Verify all of the code (ESLint)
npm test                    # Run all tests
npm run test-unit           # Run the unit tests
npm run coverage            # Run the unit tests with coverage
npm run test-integration    # Run the integration tests
```

## Support and Migration

Pa11y CI major versions are normally supported for 6 months after their last minor release. This means that patch-level changes will be added and bugs will be fixed. The table below outlines the end-of-support dates for major versions, and the last minor release for that version.

We also maintain a [migration guide](MIGRATION.md) to help you migrate.

| :grey_question: | Major Version | Last Minor Release | Node.js Versions | Support End Date |
| :-------------- | :------------ | :----------------- | :--------------- | :--------------- |
| :heart:         | 3             | N/A                | 12+              | N/A              |
| :hourglass:     | 2             | 2.4.2              | 8+               | 2022-05-26       |
| :skull:         | 1             | 1.3                | 4+               | 2018-04-18       |

If you're opening issues related to these, please mention the version that the issue relates to.

## Licence

Licensed under the [Lesser General Public License (LGPL-3.0-only)](LICENSE).<br/>
Copyright &copy; 2016–2021, Team Pa11y

[issues]: https://github.com/pa11y/pa11y-ci/issues
[node.js]: https://nodejs.org/
[pa11y]: https://github.com/pa11y/pa11y
[pa11y configurations]: https://github.com/pa11y/pa11y#configuration
[pa11y reporters]: https://github.com/pa11y/pa11y#reporters
[sidekick-proposal]: https://github.com/pa11y/sidekick/blob/master/PROPOSAL.md
[twitter]: https://twitter.com/pa11yorg

[info-dependencies]: https://gemnasium.com/pa11y/pa11y-ci
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y-ci
[info-build]: https://travis-ci.org/pa11y/pa11y-ci
[shield-dependencies]: https://img.shields.io/gemnasium/pa11y/pa11y-ci.svg
[shield-license]: https://img.shields.io/badge/license-LGPL--3.0--only-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-8-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-ci.svg
[shield-build]: https://img.shields.io/travis/pa11y/pa11y-ci/master.svg
