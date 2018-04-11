import { STATUS_CODES } from 'http'
import escapeHtml = require('escape-html')
import { Request, Response, HeadersValuesObject, createHeaders } from 'servie'
import { createBody } from 'servie/dist/body/universal'

const DOUBLE_SPACE_REGEXP = /\x20{2}/g
const NEWLINE_REGEXP = /\n/g

export interface Options {
  production?: boolean
  log?: (value: any) => void
}

/**
 * Render errors into a response object.
 */
export function errorhandler (req: Request, options: Options = {}): (err: any) => Response {
  const { production = process.env.NODE_ENV === 'production' } = options
  const log = options.log || (production ? ((x: any) => undefined) : console.error)

  if (production) {
    return function (error: any) {
      const statusCode = Number(error.statusCode) || 500
      const headers = typeof error.headers === 'object' ? error.headers : undefined

      log(error)

      return render(req, statusCode, STATUS_CODES[statusCode], headers)
    }
  }

  return function (error: any) {
    const statusCode = Number(error.statusCode) || 500
    const headers = typeof error.headers === 'object' ? error.headers : undefined
    const message = error.stack || error.message || STATUS_CODES[statusCode]

    log(error)

    return render(req, statusCode, message, headers)
  }
}

/**
 * Render HTML response.
 *
 * Reference: https://github.com/pillarjs/finalhandler/blob/master/index.js
 */
function render (req: Request, statusCode: number, message: string, errorHeaders?: HeadersValuesObject) {
  const data = escapeHtml(message)
    .replace(NEWLINE_REGEXP, '<br>')
    .replace(DOUBLE_SPACE_REGEXP, ' &nbsp;')

  const body = createBody(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>${data}</pre>
</body>
</html>
`)

  const headers = createHeaders(errorHeaders)
  headers.set('Content-Type', 'text/html; charset=utf-8')
  headers.set('Content-Security-Policy', "default-src 'self'")
  headers.set('X-Content-Type-Options', 'nosniff')
  return new Response({ statusCode, headers, body })
}
