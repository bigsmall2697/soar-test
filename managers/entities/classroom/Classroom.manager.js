/**
 * The Classroom class is responsible for managing classroom operations.
 * @class
 */
class ClassroomManager {
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
    this.utils = utils;
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
   * Creates a new classroom.
   *
   * @param {Object} params - The parameters for creating a classroom.
   * @param {string} params.name - The name of the classroom.
   * @param {number} params.capacity - The capacity of the classroom.
   * @param {string} params.schoolId - The ID of the school to which the classroom belongs.
   * @param {Object} params.__longToken - The token containing user information.
   * @returns {Promise<Object>} The result of the classroom creation.
   * @returns {Object} [error] - The error object if the creation fails.
   * @returns {string} error.error - The error message.
   * @returns {number} error.status - The HTTP status code.
   * @returns {boolean} error.ok - The status of the operation.
   * @returns {Object} [classroom] - The created classroom object if the creation succeeds.
   * @returns {string} classroom.name - The name of the created classroom.
   * @returns {number} classroom.capacity - The capacity of the created classroom.
   * @returns {string} classroom.id - The ID of the created classroom.
   * @returns {string} classroom.schoolId - The ID of the school to which the created classroom belongs.
   * @throws {Error} If an error occurs during the creation process.
   */
  async create({ name, capacity, schoolId, __longToken }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "create",
      //   resource: "classroom",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      //in case of schoolAdmin, check if the schoolId is same as the schoolId of the schoolAdmin
      if (userRole === this.utils.roles.SCHOOL_ADMIN && schoolId !== __longToken.schoolId)
        return { error: "Unauthorized", status: 401, ok: false };
      const classroom = { name, capacity, schoolId };
      let result = await this.validators.classroom.createClassRoom(classroom);
      if (result) return result;

      // Check if exists
      let exists = await this.mongomodels.classroom.findOne({ name });
      if (exists)
        return { error: "classroom already exists", status: 409, ok: false };
      // check for school
      const school = await this.mongomodels.school.findById(schoolId);
      if (!school) return { error: "school not found", status: 404, ok: false };

      // Creation Logic
      let createdClassroom = await this.mongomodels.classroom.create({
        name,
        capacity,
        schoolId,
      });
      // Response
      return {
        classroom: {
          name: createdClassroom.name,
          capacity: createdClassroom.capacity,
          id: createdClassroom._id,
          schoolId: createdClassroom.schoolId,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Updates a classroom with the provided details.
   *
   * @param {Object} params - The parameters for updating the classroom.
   * @param {string} params.name - The name of the classroom.
   * @param {number} params.capacity - The capacity of the classroom.
   * @param {string} params.id - The ID of the classroom to update.
   * @param {string} params.schoolId - The ID of the school the classroom belongs to.
   * @param {Object} params.__longToken - The token containing user authorization details.
   * @returns {Promise<Object>} The result of the update operation.
   * @returns {Object} [returns.error] - The error message if the update fails.
   * @returns {number} [returns.status] - The HTTP status code.
   * @returns {boolean} [returns.ok] - The status of the operation.
   * @returns {Object} [returns.classroom] - The updated classroom details.
   * @returns {string} returns.classroom.name - The name of the updated classroom.
   * @returns {number} returns.classroom.capacity - The capacity of the updated classroom.
   * @returns {string} returns.classroom.id - The ID of the updated classroom.
   * @returns {string} returns.classroom.schoolId - The ID of the school the updated classroom belongs to.
   * @throws {Error} If an error occurs during the update process.
   */
  async update({ name, capacity, id, schoolId, __longToken }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "update",
      //   resource: "classroom",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      //in case of schoolAdmin, check if the schoolId is same as the schoolId of the schoolAdmin
      if (userRole === this.utils.roles.SCHOOL_ADMIN && schoolId !== __longToken.schoolId)
        return { error: "Unauthorized", status: 401, ok: false };
      const classroom = { name, capacity, schoolId, id };
      let result = await this.validators.classroom.updateClassroom(classroom);
      if (result) return result;
      const classExists = await this.mongomodels.classroom.findById(id);
      if (!classExists)
        return { error: "classroom not found", status: 404, ok: false };
      // Check if exists
      let exists = await this.mongomodels.classroom.findOne({
        name,
        _id: { $ne: id },
      });
      if (exists)
        return { error: "classroom already exists", status: 409, ok: false };
      // check for school
      const school = await this.mongomodels.school.findById(schoolId);
      if (!school) return { error: "school not found", status: 404, ok: false };
      // Creation Logic
      let createdClassroom = await this.mongomodels.classroom.findByIdAndUpdate(
        id,
        { name, capacity, schoolId },
      );
      // Response
      return {
        classroom: {
          name: createdClassroom.name,
          capacity: createdClassroom.capacity,
          id: createdClassroom._id,
          schoolId: createdClassroom.schoolId,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Deletes a classroom based on the provided query and authorization token.
   *
   * @param {Object} params - The parameters for the delete operation.
   * @param {Object} params.__query - The query object containing the classroom ID.
   * @param {string} params.__query.id - The ID of the classroom to be deleted.
   * @param {Object} params.__longToken - The authorization token object.
   * @returns {Promise<Object>} The result of the delete operation.
   * @returns {Object} returns.error - Error message if the operation fails.
   * @returns {number} returns.status - HTTP status code.
   * @returns {boolean} returns.ok - Operation success status.
   * @returns {Object} [returns.classroom] - The deleted classroom object if the operation is successful.
   * @throws {Error} Throws an error if the delete operation fails.
   */
  async delete({ __query, __longToken }) {
    try {
      const id = __query.id;
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "delete",
      //   resource: "classroom",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      const classroom = { id };

      let result = await this.validators.classroom.deleteClassroom(classroom);
      if (result) return result;

      // Check if exists
      let exists = await this.mongomodels.classroom.findById(id);
      if (!exists)
        return { error: "classroom not found", status: 404, ok: false };
      //in case of schoolAdmin, check if the schoolId is same as the schoolId of the schoolAdmin
      if (
        userRole === this.utils.roles.SCHOOL_ADMIN &&
        exists.schoolId !== __longToken.schoolId
      )
        return { error: "Unauthorized", status: 401, ok: false };
      // if students are there in the classroom prevent deletion
      let students = await this.mongomodels.student.find({ classroomId: id });
      if (students?.length)
        return {
          error: "classroom has students, cannot delete",
          status: 409,
          ok: false,
        };
      // Creation Logic
      let deletedClassroom =
        await this.mongomodels.classroom.findByIdAndDelete(id);
      // Response
      return {
        classroom: deletedClassroom,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Retrieves a classroom by its ID.
   *
   * @param {Object} params - The parameters for the function.
   * @param {Object} params.__longToken - The token containing user information.
   * @param {Object} params.__query - The query parameters.
   * @param {string} params.__query.id - The ID of the classroom to retrieve.
   * @returns {Promise<Object>} The result of the retrieval operation.
   * @throws {Error} If an error occurs during the retrieval process.
   */
  async getByID({ __longToken, __query }) {
    try {
      const id = __query.id;

      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "read",
      //   resource: "classroom",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      //in case of schoolAdmin, check if the schoolId is same as the schoolId of the schoolAdmin
      if (userRole === this.utils.roles.SCHOOL_ADMIN && id !== __longToken.schoolId)
        return { error: "Unauthorized", status: 401, ok: false };
      const classroom = { id };
      console.log(id)

      let result = await this.validators.classroom.getClassroom(classroom);
      if (result) return result;

      // Check if exists
      let classroomExists = await this.mongomodels.classroom.findById(id);
      if (!classroomExists)
        return { error: "classroom not found", status: 404, ok: false };
      if (
        userRole === this.utils.roles.SCHOOL_ADMIN &&
        classroomExists.schoolId !== __longToken.schoolId
      )
        return { error: "Unauthorized", status: 401, ok: false };

      return {
        classroom: classroomExists,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Retrieves all classrooms.
   *
   * @param {Object} param0.__longToken - The token object containing user information.
   * @returns {Promise<Object>} The result object containing classrooms or an error message.
   * @throws Will throw an error if the operation fails.
   */
  async getAll({ __longToken }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "update",
      //   resource: "classroom",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      // Check if exists
      let classrooms;
      if (userRole === this.utils.roles.SCHOOL_ADMIN) {
        classrooms = await this.mongomodels.classroom.find({
          schoolId: __longToken.schoolId,
        });
      } else {
        classrooms = await this.mongomodels.classroom.find({});
      }

      return {
        classrooms,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = ClassroomManager;
