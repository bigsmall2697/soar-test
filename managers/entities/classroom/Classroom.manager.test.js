const ClassroomManager = require("./Classroom.manager");
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

describe("ClassroomManager", () => {
  let classroomManager;
  let req;
  let res;

  beforeEach(() => {
    classroomManager = new ClassroomManager({
      managers: {
        auth: {
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
        classroom: {
          createClassRoom: jest.fn().mockReturnValue(null),
          updateClassroom: jest.fn().mockReturnValue(null),
          deleteClassroom: jest.fn().mockReturnValue(null),
          getClassroom: jest.fn().mockReturnValue(null),
        },
      },
      mongomodels: {
        classroom: mongoose,
        school: mongoose,
        student: mongoose,
      },
    });
    req = mockRequest();
    res = mockResponse();
  });

  test("create - success", async () => {
    mongoose.findOne.mockResolvedValue(null);
    req.body = {
      name: "Math 101",
      capacity: 30,
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue({ _id: "5f8d0d55b54764421b7156c1" });
    mongoose.findOne.mockResolvedValue(null);
    mongoose.create.mockResolvedValue(req.body);

    const result = await classroomManager.create(req.body);

    expect(result.classroom.name).toBe("Math 101");
    expect(result.classroom.capacity).toBe(30);
    expect(result.classroom.schoolId).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("create - unauthorized", async () => {
  //   req.body = {
  //     name: "Math 101",
  //     capacity: 30,
  //     schoolId: "5f8d0d55b54764421b7156c1",
  //     __longToken: { role: "student" },
  //   };
  //   classroomManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await classroomManager.create(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("create - classroom already exists", async () => {
    req.body = {
      name: "Math 101",
      capacity: 30,
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findOne.mockResolvedValue(req.body);

    const result = await classroomManager.create(req.body);

    expect(result.error).toBe("classroom already exists");
    expect(result.status).toBe(409);
  });

  test("create - school not found", async () => {
    mongoose.findById.mockResolvedValue(null);
    mongoose.findOne.mockResolvedValue(null);
    req.body = {
      name: "Math 101",
      capacity: 30,
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue(null);

    const result = await classroomManager.create(req.body);

    expect(result.error).toBe("school not found");
    expect(result.status).toBe(404);
  });

  test("update - success", async () => {
    mongoose.findOne.mockResolvedValue(null);
    req.body = {
      name: "Math 101",
      capacity: 30,
      id: "5f8d0d55b54764421b7156c1",
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    const updatedClassroom = { ...req.body, _id: req.body.id };
    mongoose.findById.mockResolvedValue(updatedClassroom);
    mongoose.findByIdAndUpdate.mockResolvedValue(updatedClassroom);

    const result = await classroomManager.update(req.body);

    expect(result.classroom.name).toBe("Math 101");
    expect(result.classroom.capacity).toBe(30);
    expect(result.classroom.schoolId).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("update - unauthorized", async () => {
  //   req.body = {
  //     name: "Math 101",
  //     capacity: 30,
  //     id: "5f8d0d55b54764421b7156c1",
  //     schoolId: "5f8d0d55b54764421b7156c1",
  //     __longToken: { role: "student" },
  //   };
  //   classroomManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await classroomManager.update(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("update - classroom not found", async () => {
    req.body = {
      name: "Math 101",
      capacity: 30,
      id: "5f8d0d55b54764421b7156c1",
      schoolId: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue(null);

    const result = await classroomManager.update(req.body);

    expect(result.error).toBe("classroom not found");
    expect(result.status).toBe(404);
  });

  test("delete - success", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);
    mongoose.findByIdAndDelete.mockResolvedValue(req.query);

    const result = await classroomManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.classroom.id).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("delete - unauthorized", async () => {
  //   req.query = { id: "5f8d0d55b54764421b7156c1" };
  //   req.body = { __longToken: { role: "student" } };
  //   classroomManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await classroomManager.delete({
  //     __query: req.query,
  //     __longToken: req.body.__longToken,
  //   });

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("delete - classroom not found", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(null);

    const result = await classroomManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("classroom not found");
    expect(result.status).toBe(404);
  });

  test("delete - classroom has students", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);
    mongoose.find.mockResolvedValue([req.body]);

    const result = await classroomManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("classroom has students, cannot delete");
    expect(result.status).toBe(409);
  });

  test("getByID - success", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);

    const result = await classroomManager.getByID({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.classroom.id).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("getByID - unauthorized", async () => {
  //   req.query = { id: "5f8d0d55b54764421b7156c1" };
  //   req.body = { __longToken: { role: "student" } };
  //   classroomManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await classroomManager.getByID({
  //     __query: req.query,
  //     __longToken: req.body.__longToken,
  //   });

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("getByID - classroom not found", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(null);

    const result = await classroomManager.getByID({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("classroom not found");
    expect(result.status).toBe(404);
  });

  test("getAll - success", async () => {
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.find.mockResolvedValue([req.body]);

    const result = await classroomManager.getAll(req.body);

    expect(result.classrooms.length).toBeGreaterThan(0);
  });

  // test("getAll - unauthorized", async () => {
  //   req.body = { __longToken: { role: "student" } };
  //   classroomManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await classroomManager.getAll(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });
});
