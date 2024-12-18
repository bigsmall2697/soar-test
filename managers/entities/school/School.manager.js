/**
 * SchoolManager class for managing school entities.
 * @class
 */
class SchoolManager {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.httpExposed = [
      "post=create",
      "put=update",
      "delete=delete",
      "get=getByID",
      "get=getAll",
    ];
    this.name = "school";
    this.managers = managers;
  }

  /**
   * Creates a new school entity.
   *
   * @param {Object} params - The parameters for creating a school.
   * @param {string} params.name - The name of the school.
   * @param {string} params.address - The address of the school.
   * @param {Object} params.__longToken - The token containing user information.
   * @returns {Promise<Object>} The result of the creation process.
   * @returns {Object} [returns.error] - Error message if creation fails.
   * @returns {number} [returns.status] - HTTP status code.
   * @returns {boolean} [returns.ok] - Status of the operation.
   * @returns {Object} [returns.school] - The created school entity.
   * @returns {string} returns.school.name - The name of the created school.
   * @returns {string} returns.school.address - The address of the created school.
   * @returns {string} returns.school.id - The ID of the created school.
   * @throws Will throw an error if the creation process fails.
   */
  async create({ name, address, __longToken }) {
    try {
      // const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "create",
      //   resource: "school",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      const school = { name, address };
      let result = await this.validators.school.createSchool(school);
      if (result) {
        return { error: result, status: 400, ok: false };
      }

      // Check if exists
      let exists = await this.mongomodels.school.findOne({ name });
      if (exists)
        return { error: "school already exists", status: 409, ok: false };

      // Creation Logic
      let createdSchool = await this.mongomodels.school.create({
        name,
        address,
      });
      // Response
      return {
        school: {
          name: createdSchool.name,
          address: createdSchool.address,
          id: createdSchool._id,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Updates a school entity with the provided details.
   *
   * @param {Object} params - The parameters for updating the school.
   * @param {string} params.name - The name of the school.
   * @param {string} params.address - The address of the school.
   * @param {string} params.id - The unique identifier of the school.
   * @param {Object} params.__longToken - The token containing user role information.
   * @returns {Promise<Object>} The result of the update operation.
   * @returns {Object} result.school - The updated school details.
   * @returns {string} result.school.name - The name of the school.
   * @returns {string} result.school.address - The address of the school.
   * @returns {string} result.school.id - The unique identifier of the school.
   * @returns {Object} result.error - The error object if the update fails.
   * @returns {string} result.error.message - The error message.
   * @returns {number} result.status - The HTTP status code.
   * @returns {boolean} result.ok - The status of the operation.
   * @throws {Error} Throws an error if the update operation fails.
   */
  async update({ name, address, id, __longToken }) {
    try {
      // const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "update",
      //   resource: "school",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      const school = { name, address, id };

      let result = await this.validators.school.updateSchool(school);
      if (result) return result;

      // Check if exists
      let exists = await this.mongomodels.school.findById(id);
      if (!exists) return { error: "school not found", status: 404, ok: false };

      let schoolExists = await this.mongomodels.school.findOne({
        name,
        _id: { $ne: id },
      });
      if (schoolExists)
        return {
          error: "school with this name already exists",
          status: 409,
          ok: false,
        };

      // Creation Logic
      let School = await this.mongomodels.school.findByIdAndUpdate(id, {
        name,
        address,
      });
      // Response
      return {
        school: {
          name: School.name,
          address: School.address,
          id: School._id,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Deletes a school entity by its ID.
   *
   * @param {Object} params - The parameters for the delete operation.
   * @param {string} params.id - The ID of the school to be deleted.
   * @param {Object} params.__longToken - The token containing user information.
   * @returns {Promise<Object>} The result of the delete operation.
   * @throws Will throw an error if the delete operation fails.
   */
  async delete({ id, __longToken }) {
    try {
      // const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "delete",
      //   resource: "school",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      const school = { id };

      let result = await this.validators.school.deleteSchool(school);
      if (result) return result;

      // Check if exists
      let exists = await this.mongomodels.school.findById(id);
      if (!exists) return { error: "school not found", status: 404, ok: false };
      // Check if school has classrooms prevent deletion
      let classrooms = await this.mongomodels.classroom.find({ schoolId: id });
      if (classrooms?.length > 0)
        return {
          error: "school has classrooms, cannot be deleted",
          status: 409,
          ok: false,
        };
      // Creation Logic
      let School = await this.mongomodels.school.findByIdAndDelete(id);
      // Response
      return {
        School,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Retrieves a school entity by its ID.
   *
   * @param {Object} params - The parameters for the function.
   * @param {Object} params.__longToken - The token containing user information.
   * @param {Object} params.__query - The query object containing the school ID.
   * @param {string} params.__query.id - The ID of the school to retrieve.
   * @returns {Promise<Object>} The school entity if found, or an error object if not authorized or not found.
   * @throws Will throw an error if there is an issue with the retrieval process.
   */
  async getByID({ __longToken, __query }) {
    try {
      const id = __query.id;
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "read",
      //   resource: "school",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      if (userRole === "schoolAdmin") {
        const schoolId = __longToken?.schoolId;
        if (id !== schoolId)
          return { error: "Unauthorized", status: 401, ok: false };
      }
      const school = { id };

      let result = await this.validators.school.getSchool(school);
      if (result) return result;

      // Check if exists
      let School = await this.mongomodels.school.findById(id);
      if (!School) return { error: "school not found", status: 404, ok: false };

      return {
        School,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Retrieves all school entities based on the user's role and authorization.
   *
   * @param {Object} param0 - The parameter object.
   * @param {Object} param0.__longToken - The token containing user information.
   *
   * @returns {Promise<Object>} The result object containing the list of schools or an error message.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  async getAll({ __longToken }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "update",
      //   resource: "school",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      // Check if exists
      let schools;
      if (userRole === "schoolAdmin") {
        const schoolId = __longToken?.schoolId;
        schools = await this.mongomodels.school.find({ _id: schoolId });
      } else {
        schools = await this.mongomodels.school.find({});
      }

      return {
        schools,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = SchoolManager;
