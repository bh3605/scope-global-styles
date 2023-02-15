# scope-global-styles

[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

## Table of Contents

- [Install](#install)
- [Usage with Webpack](#usage-with-webpack)
- [Options](#options)
- [Contribute](#contribute)
- [License](#license)

## Install

```console
$ npm install scope-global-styles
```


## Usage with Webpack
```js
const globalStylePrefixer = require('scope-global-styles');
globalStylePrefixer("my-prefix", webpack, require("./angular.json"));
return webpack;
```

## Options

| Name | Type | Description |
|------|------|-------------|
| prefix | string | The string to prepend to every CSS selector. |
| webpack | object | Webpack configuration object |
| ngJson | object | json object of your angular.json file |

## Contribute

Please contribute! If you have any questions or bugs, [open an issue](https://github.com/bh3605/scope-global-styles/issues/new), or open a pull request with a fix.


## License
[MIT](LICENSE) @ 2023 Bryson Hair
