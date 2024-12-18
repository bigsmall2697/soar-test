const { roles } = require("../libs/utils.js");
const Middleware = require("./__longToken.mw.js");

const permissions = {
  [roles.SUPER_ADMIN]: {
    school: ["create", "update", "delete", "getAll", "getByID"],
    classroom: ["create", "update", "delete", "getAll", "getByID"],
    student: ["create", "update", "delete", "getAll", "getByID"],
    user: ["createUser"],
  },
  [roles.SCHOOL_ADMIN]: {
    school: ["getByID"],
    classroom: ["create", "update", "delete", "getAll", "getByID"],
    student: ["create", "update", "delete", "getAll", "getByID"],
  },
  [roles.STUDENT]: {
    school: ["getByID"],
    classroom: ["getByID"],
    student: ["getByID"],
  },
};

describe("Token middleware", () => {
  let managers;
  let req;
  let res;
  let next;
  let longTokenMiddleware;

  beforeEach(() => {
    managers = {
      responseDispatcher: {
        dispatch: jest.fn(),
      },
      token: {
        verifyLongToken: jest.fn(),
      },
    };
    req = {
      headers: {},
      decoded: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    longTokenMiddleware = Middleware({ managers });
  });

  test("should return 401 if the token is missing", () => {
    longTokenMiddleware({ req, res, next });

    expect(managers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: "unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if the token verification fails", () => {
    req.headers.token = "invalidToken";
    managers.token.verifyLongToken.mockReturnValue(null);

    longTokenMiddleware({ req, res, next });

    expect(managers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: "unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if the token decoding throws an error", () => {
    req.headers.token = "someToken";
    managers.token.verifyLongToken.mockImplementation(() => {
      throw new Error("Decoding Error");
    });

    longTokenMiddleware({ req, res, next });

    expect(managers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: "unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if the role does not exist in permissions", () => {
    req.headers.token = "validToken";
    req.params = { fnName: "getAll", moduleName: "student" };
    managers.token.verifyLongToken.mockReturnValue({ role: "nonexistentRole" });

    longTokenMiddleware({ req, res, next });

    expect(managers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: `unauthorized to get permissions for nonexistentRole`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if the role lacks permissions for the resource", () => {
    req.headers.token = "validToken";
    req.params = { fnName: "create", moduleName: "school" };
    managers.token.verifyLongToken.mockReturnValue({ role: "student" });

    longTokenMiddleware({ req, res, next });

    expect(managers.responseDispatcher.dispatch).toHaveBeenCalledWith(res, {
      ok: false,
      code: 401,
      errors: `unauthorized to access school:create from student`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if the role has the required permissions", () => {
    req.headers.token = "validToken";
    req.params = { fnName: "getAll", moduleName: "student" };
    managers.token.verifyLongToken.mockReturnValue({ role: "schoolAdmin" });

    longTokenMiddleware({ req, res, next });

    expect(managers.responseDispatcher.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith({ role: "schoolAdmin" });
  });
});
