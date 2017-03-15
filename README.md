# Servie Errorhandler

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/blakeembrey/node-servie-errorhandler.svg)](https://greenkeeper.io/)

> Map errors to a Servie response.

## Installation

```
npm install servie-errorhandler --save
```

## Usage

```ts
import { finalhandler } from 'servie-finalhandler'
import { errorhandler } from 'servie-errorhandler'

const app = compose([get(...), post(...)])
const req = new Request({ url: '/' })

app(req, finalhandler(req)).catch(errorhandler(req))
```

## TypeScript

This project is written using [TypeScript](https://github.com/Microsoft/TypeScript) and publishes the definitions directly to NPM.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/servie-errorhandler.svg?style=flat
[npm-url]: https://npmjs.org/package/servie-errorhandler
[downloads-image]: https://img.shields.io/npm/dm/servie-errorhandler.svg?style=flat
[downloads-url]: https://npmjs.org/package/servie-errorhandler
[travis-image]: https://img.shields.io/travis/blakeembrey/node-servie-errorhandler.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/node-servie-errorhandler
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/node-servie-errorhandler.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/node-servie-errorhandler?branch=master
