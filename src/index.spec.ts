import { Request } from "servie/dist/node";
import * as boom from "boom";
import * as httpErrors from "http-errors";
import { errorhandler } from "./index";

describe("errorhandler", () => {
  describe("default accepts", () => {
    const req = new Request("/");
    const handler = errorhandler(req);

    it("should fail gracefully with non-error", () => {
      const res = handler("test");

      expect(res).toMatchSnapshot();
    });

    it("should fail gracefully with empty error", () => {
      const res = handler(undefined);

      expect(res).toMatchSnapshot();
    });

    it("should render an error", () => {
      const res = handler(new Error("boom!"));

      expect(res).toMatchSnapshot();
    });

    it("should render boom status errors", () => {
      const res = handler(boom.badRequest("data has an issue"));

      expect(res).toMatchSnapshot();
    });

    it("should render http errors status error", () => {
      const res = handler(new httpErrors.BadRequest("data has an issue"));

      expect(res).toMatchSnapshot();
    });
  });

  describe("accept html", () => {
    const req = new Request("/", { headers: { accept: "text/html" } });
    const handler = errorhandler(req);

    it("should fail and return html", () => {
      const res = handler(new Error("boom!"));

      expect(res.headers.get("content-type")).toEqual("text/html");
      expect(res).toMatchSnapshot();
    });
  });

  describe("accept json", () => {
    const req = new Request("/", { headers: { accept: "application/json" } });
    const handler = errorhandler(req);

    it("should fail and return json", () => {
      const res = handler(new Error("boom!"));

      expect(res.headers.get("content-type")).toEqual("application/json");
      expect(res).toMatchSnapshot();
    });
  });

  describe("accept as array", () => {
    const req = new Request("/", { headers: { accept: ["text/html"] } });
    const handler = errorhandler(req);

    it("should fail and return html", () => {
      const res = handler(new Error("boom!"));

      expect(res).toMatchSnapshot();
    });
  });
});
