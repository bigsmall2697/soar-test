const UserManager = require("./User.manager");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { mockRequest, mockResponse } = require("jest-mock-req-res");

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    model: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
});

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe("UserManager", () => {
  let userManager;
  let req;
  let res;

  beforeEach(() => {
    userManager = new UserManager({
      managers: {
        authorization: {
          isAuthorized: jest.fn().mockReturnValue(true),
        },
        token: {
          genLongToken: jest.fn().mockReturnValue("mockedLongToken"),
        },
      },
      validators: {
        user: {
          createUser: jest.fn().mockReturnValue(null),
          login: jest.fn().mockReturnValue(null),
        },
      },
      mongomodels: {
        user: mongoose,
        school: mongoose,
      },
    });
    req = mockRequest();
    res = mockResponse();
  });

  test("createUser - success", async () => {
    req.body = {
      username: "testUser",
      password: "testPassword",
      role: "schoolAdmin",
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findOne.mockResolvedValue(null);
    mongoose.findById.mockResolvedValue({ _id: "5f8d0d55b54764421b7156c1" });
    mongoose.create.mockResolvedValue(req.body);

    const result = await userManager.createUser(req.body);

    expect(result.user.username).toBe("testUser");
    expect(result.user.role).toBe("schoolAdmin");
    expect(result.longToken).toBe("mockedLongToken");
  });

  // test("createUser - unauthorized", async () => {
  //   req.body = {
  //     username: "testUser",
  //     password: "testPassword",
  //     role: "schoolAdmin",
  //     schoolId: "5f8d0d55b54764421b7156c1",
  //     __longToken: { role: "student" },
  //   };
  //   userManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await userManager.createUser(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("createUser - user already exists", async () => {
    req.body = {
      username: "testUser",
      password: "testPassword",
      role: "schoolAdmin",
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findOne.mockResolvedValue(req.body);

    const result = await userManager.createUser(req.body);

    expect(result.error).toBe("User already exists");
    expect(result.status).toBe(409);
  });

  test("login - success", async () => {
    req.body = { username: "testUser", password: "testPassword" };
    const userMock = {
      username: "testUser",
      password: "hashedPassword",
      role: "schoolAdmin",
      _id: "5f8d0d55b54764421b7156c1",
      school: "5f8d0d55b54764421b7156c1",
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    mongoose.findOne.mockResolvedValue(userMock);

    const result = await userManager.login(req.body);

    expect(result.user.username).toBe("testUser");
    expect(result.user.role).toBe("schoolAdmin");
    expect(result.longToken).toBe("mockedLongToken");
  });

  test("login - user not found", async () => {
    req.body = { username: "testUser", password: "testPassword" };
    mongoose.findOne.mockResolvedValue(null);

    const result = await userManager.login(req.body);

    expect(result.error).toBe("User not found");
    expect(result.status).toBe(404);
  });

  test("login - invalid password", async () => {
    req.body = { username: "testUser", password: "testPassword" };
    const userMock = {
      username: "testUser",
      password: "hashedPassword",
      role: "schoolAdmin",
      _id: "5f8d0d55b54764421b7156c1",
      school: "5f8d0d55b54764421b7156c1",
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    mongoose.findOne.mockResolvedValue(userMock);

    const result = await userManager.login(req.body);

    expect(result.error).toBe("Invalid password");
    expect(result.status).toBe(401);
  });
});
