import { STATUS_CODES } from 'http'
import escapeHtml = require('escape-html')
import { Request, Response } from 'servie'
import { sendJson, sendHtml } from 'servie-send'
import Negotiator = require('negotiator')

const DOUBLE_SPACE_REGEXP = /\x20{2}/g

export interface Options {
  log?: (err: any) => void
}

/**
 * Render errors into a response object.
 */
export function errorhandler (req: Request, options: Options = {}): (err: any) => Response {
  const env = process.env.NODE_ENV || 'development'
  const log = options.log || (env === 'test' ? Function.prototype : console.error)

  return function errorhandler (err: any) {
    const output = toOutput(err)
    const negotiator = new Negotiator({ headers: req.allHeaders.asObject() })
    const type = negotiator.mediaType(['text/html', 'application/json'])

    log(err)

    if (type === 'text/html') return renderHtml(req, output)

    return renderJson(req, output)
  }
}

/**
 * Boom-compatible output.
 */
interface Output {
  statusCode: number
  headers: Record<string, string | string[]>
  payload: object
}

/**
 * Convert an error into an "output" object.
 */
function toOutput (err: any): Output {
  const output = err.output || {}
  const statusCode = Number(output.statusCode || err.statusCode) || 500
  const headers = output.headers || err.headers || {}
  const payload = output.payload || {
    statusCode,
    error: STATUS_CODES[statusCode] || 'Error',
    message: err.message || 'Error'
  }

  return { statusCode, headers, payload }
}

/**
 * Render HTML response.
 */
function renderHtml (req: Request, output: Output) {
  const content = escapeHtml(JSON.stringify(output.payload, null, 2))

  return sendHtml(req, `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Error</title></head>
<body>
<pre>${content.replace(DOUBLE_SPACE_REGEXP, ' &nbsp;')}</pre>
</body>
</html>
  `.trim(), {
    skipEtag: true,
    statusCode: output.statusCode,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'",
      ...output.headers
    }
  })
}

/**
 * Send JSON response.
 */
function renderJson (req: Request, output: Output) {
  return sendJson(req, output.payload, {
    skipEtag: true,
    statusCode: output.statusCode,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      ...output.headers
    }
  })
}
