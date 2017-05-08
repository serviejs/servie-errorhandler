# Servie Errorhandler

[![NPM version](https://img.shields.io/npm/v/servie-errorhandler.svg?style=flat)](https://npmjs.org/package/servie-errorhandler)
[![NPM downloads](https://img.shields.io/npm/dm/servie-errorhandler.svg?style=flat)](https://npmjs.org/package/servie-errorhandler)
[![Build status](https://img.shields.io/travis/serviejs/servie-errorhandler.svg?style=flat)](https://travis-ci.org/serviejs/servie-errorhandler)
[![Test coverage](https://img.shields.io/coveralls/serviejs/servie-errorhandler.svg?style=flat)](https://coveralls.io/r/serviejs/servie-errorhandler?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/serviejs/servie-errorhandler.svg)](https://greenkeeper.io/)

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

Apache 2.0
