import escape = require('escape-html')
import accepts = require('accepts')
import { Request, Response } from 'servie'

export interface Options {
  production?: boolean
  log?: ((value: any) => void) | boolean
}

/**
 * Render errors into a response object.
 */
export function errorhandler (req: Request, options: Options = {}): (err: any) => Response {
  const production = isProduction(options.production)
  const log = logger(options.log, production)

  if (production) {
    return function (err: any) {
      const message = err.message || JSON.stringify(err)
      const status = Number(err.status) || 500

      return render(req, message, status, undefined)
    }
  }

  return function (err: any) {
    const message = err.message || JSON.stringify(err)
    const status = Number(err.status) || 500

    log(err)

    return render(req, message, status, err.stack)
  }
}

/**
 * Switch between renderers based on accepts.
 */
function render (req: Request, message: string, status: number, stack?: string) {
  const type = accepts({ headers: req.headers.object() }).type(['html', 'json'])

  if (type === 'html') {
    return renderHtml(message, status, stack)
  }

  if (type === 'json') {
    return renderJson(message, status, stack)
  }

  return renderPlain(message, status, stack)
}

/**
 * Render the error as plain text.
 */
function renderPlain (message: string, status: number, stack?: string) {
  return new Response({
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: stack || message
  })
}

/**
 * Render the error as JSON.
 */
function renderJson (message: string, status: number, stack?: string) {
  return new Response({
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/html; charset=utf-8'
    },
    body: {
      error: { message, stack }
    }
  })
}

/**
 * Render the error page as HTML.
 */
function renderHtml (message: string, status: number, stack?: string) {
  return new Response({
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/html; charset=utf-8'
    },
    body: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${status} Error</title>
    <style>*{margin:0;padding:0;outline:0}
body{padding:80px 100px;font:13px "Helvetica Neue", "Lucida Grande", "Arial";background:#ECE9E9 -webkit-gradient(linear, 0% 0%, 0% 100%, from(#fff), to(#ECE9E9));background:#ECE9E9 -moz-linear-gradient(top, #fff, #ECE9E9);background-repeat:no-repeat;color:#555;-webkit-font-smoothing:antialiased}
h1,h2{font-size:22px;color:#343434}
h1{font-size:60px;margin-bottom:10px}
ul li{list-style:none}
#validations{margin-bottom:10px}
#stacktrace{margin-left:60px}</style>
  </head>
  <body>
    <div id="wrapper">
      <h1>${status} Error</h1>
      <h2>${message}</h2>
      ${stack ? `<ul id="stacktrace">${stack.split('\n').map(x => `<li>${escape(x)}</li>`).join('\n')}</ul>` : ''}
    </div>
  </body>
</html>`
  })
}

/**
 * Create a log function depending on environment.
 */
function logger (log: boolean | undefined | ((err: any) => void), production: boolean): (err: any) => void {
  if (log === false) {
    return () => undefined
  }

  if (typeof log === 'function') {
    return log
  }

  return production ? (() => undefined) : console.error.bind(console)
}

/**
 * Check for production environment.
 */
function isProduction (production?: boolean) {
  return production === undefined ? process.env.NODE_ENV === 'production' : !!production
}
