import { STATUS_CODES } from "http";
import escapeHtml = require("escape-html");
import Negotiator = require("negotiator");
import { Request, Response } from "servie/dist/node";
import { sendJson, sendHtml } from "servie-send";

const DOUBLE_SPACE_REGEXP = /\x20{2}/g;

export interface Options {
  production?: boolean;
  log?: (err: any) => void;
}

/**
 * Render errors into a response object.
 */
export function errorhandler(
  req: Request,
  options: Options = {}
): (err: any) => Response {
  const env = process.env.NODE_ENV || "development";
  const production = options.production === true || env === "production";
  const log =
    options.log || (env === "test" ? Function.prototype : console.error);

  return function errorhandler(err: any) {
    const output = toOutput(err, production);
    log(err);
    return render(req, output);
  };
}

/**
 * Boom-compatible output.
 */
interface Output {
  status: number;
  headers: Record<string, string | string[]>;
  payload: object;
}

/**
 * Convert an error into an "output" object.
 */
function toOutput(err: any, production: boolean): Output {
  const output = err.output || {};
  const status =
    Number(output.statusCode || err.statusCode || err.status) || 500;
  const headers = output.headers || err.headers || {};
  const payload = output.payload || {
    status,
    error: STATUS_CODES[status] || "Error",
    message: (production ? undefined : err.message) || "Error"
  };

  return { status, headers, payload };
}

/**
 * Render HTTP response.
 */
function render(req: Request, output: Output) {
  const negotiator = new Negotiator({
    headers: {
      accept: req.headers.get("accept") || undefined
    }
  });

  const type = negotiator.mediaType(["text/html", "application/json"]);
  if (type === "text/html") return renderHtml(req, output);
  return renderJson(req, output);
}

/**
 * Render HTML response.
 */
function renderHtml(req: Request, output: Output) {
  const content = escapeHtml(JSON.stringify(output.payload, null, 2));

  return sendHtml(
    req,
    `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Error</title></head>
<body>
<pre>${content.replace(DOUBLE_SPACE_REGEXP, " &nbsp;")}</pre>
</body>
</html>
  `.trim(),
    {
      status: output.status,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'self'",
        ...output.headers
      }
    }
  );
}

/**
 * Send JSON response.
 */
function renderJson(req: Request, output: Output) {
  return sendJson(req, output.payload, {
    status: output.status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      ...output.headers
    }
  });
}
