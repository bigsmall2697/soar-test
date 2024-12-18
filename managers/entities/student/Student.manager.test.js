const StudentManager = require("./Student.manager");
const mongoose = require("mongoose");
const { mockRequest, mockResponse } = require("jest-mock-req-res");
const { roles } = require("../../../libs/utils");

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    model: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };
});

describe("StudentManager", () => {
  let studentManager;
  let req;
  let res;

  beforeEach(() => {
    studentManager = new StudentManager({
      managers: {
        authorization: {
          isAuthorized: jest.fn().mockReturnValue(true),
        },
        token: {
          genLongToken: jest.fn().mockReturnValue("mockedLongToken"),
        },
      },
      utils: {
        roles,
      },
      validators: {
        student: {
          createStudent: jest.fn().mockReturnValue(null),
          updateStudent: jest.fn().mockReturnValue(null),
          deleteStudent: jest.fn().mockReturnValue(null),
          getStudent: jest.fn().mockReturnValue(null),
        },
      },
      mongomodels: {
        student: mongoose,
        classroom: mongoose,
        user: mongoose,
        school: mongoose,
      },
    });
    req = mockRequest();
    res = mockResponse();
  });

  test("create - success", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      classroomId: "5f8d0d55b54764421b7156c1",
      username: "johndoe",
      email: "johndoe@test.com",
      password: "password",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue({ _id: "5f8d0d55b54764421b7156c1" });
    mongoose.findOne.mockResolvedValue(null);
    mongoose.create.mockResolvedValue(req.body);

    const result = await studentManager.create(req.body);

    expect(result.student.firstName).toBe("John");
    expect(result.student.lastName).toBe("Doe");
    expect(result.student.classroomId).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("create - unauthorized", async () => {
  //   req.body = {
  //     firstName: "John",
  //     lastName: "Doe",
  //     classroomId: "5f8d0d55b54764421b7156c1",
  //     username: "johndoe",
  //     email: "johndoe@test.com",
  //     password: "password",
  //     __longToken: { role: "student" },
  //   };
  //   studentManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await studentManager.create(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("create - classroom not found", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      classroomId: "5f8d0d55b54764421b7156c1",
      username: "johndoe",
      email: "johndoe@test.com",
      password: "password",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue(null);

    const result = await studentManager.create(req.body);

    expect(result.error).toBe("classroom not found");
    expect(result.status).toBe(404);
  });

  test("create - user already exists", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      classroomId: "5f8d0d55b54764421b7156c1",
      username: "johndoe",
      email: "johndoe@test.com",
      password: "password",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue({ _id: "5f8d0d55b54764421b7156c1" });
    mongoose.findOne.mockResolvedValue(req.body);

    const result = await studentManager.create(req.body);

    expect(result.error).toBe("User already exists");
    expect(result.status).toBe(409);
  });

  test("update - success", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      classroomId: "5f8d0d55b54764421b7156c1",
      id: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue({ _id: "5f8d0d55b54764421b7156c1" });
    mongoose.findByIdAndUpdate.mockResolvedValue(req.body);

    const result = await studentManager.update(req.body);
    expect(result.student.firstName).toBe("John");
    expect(result.student.lastName).toBe("Doe");
    expect(result.student.classroomId).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("update - unauthorized", async () => {
  //   req.body = {
  //     firstName: "John",
  //     lastName: "Doe",
  //     classroomId: "5f8d0d55b54764421b7156c1",
  //     id: "5f8d0d55b54764421b7156c1",
  //     username: "johndoe",
  //     __longToken: { role: "student" },
  //   };
  //   studentManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await studentManager.update(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("update - student not found", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      classroomId: "5f8d0d55b54764421b7156c1",
      id: "5f8d0d55b54764421b7156c1",
      username: "johndoe",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue(null);

    const result = await studentManager.update(req.body);

    expect(result.error).toBe("student not found");
    expect(result.status).toBe(404);
  });

  test("delete - success", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);
    mongoose.findByIdAndDelete.mockResolvedValue(req.query);

    const result = await studentManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.student.id).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("delete - unauthorized", async () => {
  //   req.query = { id: "5f8d0d55b54764421b7156c1" };
  //   req.body = { __longToken: { role: "student" } };
  //   studentManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await studentManager.delete({
  //     __query: req.query,
  //     __longToken: req.body.__longToken,
  //   });

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("delete - student not found", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(null);

    const result = await studentManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("student not found");
    expect(result.status).toBe(404);
  });

  test("getByID - success", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);

    const result = await studentManager.getByID({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.student.id).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("getByID - unauthorized", async () => {
  //   req.query = { id: "5f8d0d55b54764421b7156c1" };
  //   req.body = { __longToken: { role: "student" } };
  //   studentManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await studentManager.getByID({
  //     __query: req.query,
  //     __longToken: req.body.__longToken,
  //   });

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("getByID - student not found", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(null);

    const result = await studentManager.getByID({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("student not found");
    expect(result.status).toBe(404);
  });

  test("getAll - success", async () => {
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.find.mockResolvedValue([req.body]);

    const result = await studentManager.getAll(req.body);

    expect(result.students.length).toBeGreaterThan(0);
  });

  // test("getAll - unauthorized", async () => {
  //   req.body = { __longToken: { role: "student" } };
  //   studentManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await studentManager.getAll(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });
});
