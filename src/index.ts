import escape = require('escape-html')
import accepts = require('accepts')
import { Request, Response } from 'servie'

const env = process.env.NODE_ENV

export interface Options {
  production?: boolean
  log?: (value: any) => void
}

/**
 * Render errors into a response object.
 */
export function errorhandler (req: Request, options: Options = {}): (err: any) => Response {
  const production = options.production === undefined ? env === 'production' : !!options.production

  if (production) {
    return function (err: any) {
      const message = err.message || JSON.stringify(err)
      const status = Number(err.status) || 500

      return render(req, message, status, undefined)
    }
  }

  const log = typeof options.log === 'function' ? options.log : console.error

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
body{padding:80px 100px;font:13px "Helvetica Neue", "Lucida Grande", "Arial";color:#555;background:#eee}
h1,h2{font-size:22px;color:#333;margin-bottom:20px}
h1{font-size:60px}
ul li{list-style:none}
#stacktrace{margin-left:30px}</style>
  </head>
  <body>
    <div id="wrapper">
      <h1>${status} Error</h1>
      <h2>${escape(message)}</h2>
      ${stack ? `<ul id="stacktrace">${stack.split('\n').map(x => `<li>${escape(x)}</li>`).join('\n')}</ul>` : ''}
    </div>
  </body>
</html>`
  })
}
