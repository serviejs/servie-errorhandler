import { Request } from "servie/dist/node";
import * as boom from "boom";
import * as httpErrors from "http-errors";
import { errorhandler } from "./index";

describe("servie-errorhandler", () => {
  const req = new Request("/");
  const basicHandler = errorhandler(req);

  it('should fail "gracefully" with non-error', () => {
    const res = basicHandler("test");

    expect(res).toMatchSnapshot();
  });

  it("should render an error", () => {
    const res = basicHandler(new Error("boom!"));

    expect(res).toMatchSnapshot();
  });

  it("should render boom status errors", () => {
    const res = basicHandler(boom.badRequest("data has an issue"));

    expect(res).toMatchSnapshot();
  });

  it("should render http errors status error", () => {
    const res = basicHandler(new httpErrors.BadRequest("data has an issue"));

    expect(res).toMatchSnapshot();
  });
});
