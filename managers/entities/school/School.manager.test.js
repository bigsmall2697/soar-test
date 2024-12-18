const SchoolManager = require("./School.manager");
const mongoose = require("mongoose");
const { mockRequest, mockResponse } = require("jest-mock-req-res");

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

describe("SchoolManager", () => {
  let schoolManager;
  let req;
  let res;

  beforeEach(() => {
    schoolManager = new SchoolManager({
      managers: {
        authorization: {
          isAuthorized: jest.fn().mockReturnValue(true),
        },
        token: {
          genLongToken: jest.fn().mockReturnValue("mockedLongToken"),
        },
      },
      validators: {
        school: {
          createSchool: jest.fn().mockReturnValue(null),
          updateSchool: jest.fn().mockReturnValue(null),
          deleteSchool: jest.fn().mockReturnValue(null),
          getSchool: jest.fn().mockReturnValue(null),
        },
      },
      mongomodels: {
        school: mongoose,
        classroom: mongoose,
      },
    });
    req = mockRequest();
    res = mockResponse();
  });

  test("create - success", async () => {
    req.body = {
      name: "Test School",
      address: {
        street: "123 Main St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
      },
      __longToken: { role: "superAdmin" },
    };
    mongoose.findOne.mockResolvedValue(null);
    mongoose.findById.mockResolvedValue(null);

    mongoose.create.mockResolvedValue(req.body);

    const result = await schoolManager.create(req.body);
    expect(result.school.name).toBe("Test School");
    expect(result.school.address.street).toBe("123 Main St");
    expect(result.school.address.city).toBe("Test City");
    expect(result.school.address.state).toBe("TS");
    expect(result.school.address.zipCode).toBe("12345");
  });

  // test("create - unauthorized", async () => {
  //   req.body = {
  //     name: "Test School",
  //     address: {
  //       street: "123 Main St",
  //       city: "Test City",
  //       state: "TS",
  //       zipCode: "12345",
  //     },
  //     __longToken: { role: "student" },
  //   };
  //   schoolManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await schoolManager.create(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("create - school already exists", async () => {
    req.body = {
      name: "Test School",
      address: {
        street: "123 Main St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
      },
      __longToken: { role: "superAdmin" },
    };
    mongoose.findOne.mockResolvedValue(req.body);

    const result = await schoolManager.create(req.body);

    expect(result.error).toBe("school already exists");
    expect(result.status).toBe(409);
  });

  test("update - success", async () => {
    mongoose.findOne.mockResolvedValue(null);
    req.body = {
      name: "Updated School",
      address: {
        street: "456 Main St",
        city: "Updated City",
        state: "US",
        zipCode: "67890",
      },
      id: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    const updatedSchool = { ...req.body, _id: req.body.id };
    mongoose.findById.mockResolvedValue(updatedSchool);
    mongoose.findByIdAndUpdate.mockResolvedValue(updatedSchool);

    const result = await schoolManager.update(req.body);
    expect(result.school.name).toBe("Updated School");
    expect(result.school.address.street).toBe("456 Main St");
    expect(result.school.address.city).toBe("Updated City");
    expect(result.school.address.state).toBe("US");
    expect(result.school.address.zipCode).toBe("67890");
  });

  // test("update - unauthorized", async () => {
  //   req.body = {
  //     name: "Updated School",
  //     address: {
  //       street: "456 Main St",
  //       city: "Updated City",
  //       state: "US",
  //       zipCode: "67890",
  //     },
  //     id: "5f8d0d55b54764421b7156c1",
  //     __longToken: { role: "student" },
  //   };
  //   schoolManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await schoolManager.update(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("update - school not found", async () => {
    req.body = {
      name: "Updated School",
      address: {
        street: "456 Main St",
        city: "Updated City",
        state: "US",
        zipCode: "67890",
      },
      id: "5f8d0d55b54764421b7156c1",
      __longToken: { role: "superAdmin" },
    };
    mongoose.findById.mockResolvedValue(null);

    const result = await schoolManager.update(req.body);

    expect(result.error).toBe("school not found");
    expect(result.status).toBe(404);
  });

  test("delete - success", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);
    mongoose.findByIdAndDelete.mockResolvedValue(req.query);

    const result = await schoolManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.School.id).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("delete - unauthorized", async () => {
  //   req.query = { id: "5f8d0d55b54764421b7156c1" };
  //   req.body = { __longToken: { role: "student" } };
  //   schoolManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await schoolManager.delete({
  //     __query: req.query,
  //     __longToken: req.body.__longToken,
  //   });

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("delete - school not found", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(null);

    const result = await schoolManager.delete({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("school not found");
    expect(result.status).toBe(404);
  });

  test("getByID - success", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(req.query);

    const result = await schoolManager.getByID({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.School.id).toBe("5f8d0d55b54764421b7156c1");
  });

  // test("getByID - unauthorized", async () => {
  //   req.query = { id: "5f8d0d55b54764421b7156c1" };
  //   req.body = { __longToken: { role: "student" } };
  //   schoolManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await schoolManager.getByID({
  //     __query: req.query,
  //     __longToken: req.body.__longToken,
  //   });

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });

  test("getByID - school not found", async () => {
    req.query = { id: "5f8d0d55b54764421b7156c1" };
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.findById.mockResolvedValue(null);

    const result = await schoolManager.getByID({
      __query: req.query,
      __longToken: req.body.__longToken,
    });

    expect(result.error).toBe("school not found");
    expect(result.status).toBe(404);
  });

  test("getAll - success", async () => {
    req.body = { __longToken: { role: "superAdmin" } };
    mongoose.find.mockResolvedValue([req.body]);

    const result = await schoolManager.getAll(req.body);

    expect(result.schools.length).toBeGreaterThan(0);
  });

  // test("getAll - unauthorized", async () => {
  //   req.body = { __longToken: { role: "student" } };
  //   schoolManager.managers.authorization.isAuthorized.mockReturnValue(false);

  //   const result = await schoolManager.getAll(req.body);

  //   expect(result.error).toBe("Unauthorized");
  //   expect(result.status).toBe(401);
  // });
});
