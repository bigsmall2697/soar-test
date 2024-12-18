/**
 * The StudentManager class is responsible for managing student records in the database.
 * @class
 */
class StudentManager {
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
    this.name = "student";
    this.managers = managers;
  }

  /**
   * Creates a new student.
   *
   * @param {Object} params - The parameters for creating a student.
   * @param {string} params.firstName - The first name of the student.
   * @param {string} params.lastName - The last name of the student.
   * @param {string} params.classroomId - The ID of the classroom the student belongs to.
   * @param {string} params.schoolId - The ID of the school the student belongs to.
   * @param {string} params.email - The email for the student's account.
   * @param {string} params.username - The username for the student's account.
   * @param {string} params.password - The password for the student's account.
   * @param {Object} params.__longToken - The token containing user role information.
   * @returns {Promise<Object>} The created student object or an error object.
   * @throws Will throw an error if there is an issue during the creation process.
   */
  async create({
    firstName,
    lastName,
    classroomId,
    schoolId,
    email,
    username,
    password,
    __longToken,
  }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "create",
      //   resource: "student",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      if (userRole === this.utils.roles.SCHOOL_ADMIN && schoolId !== __longToken.schoolId)
        return { error: "Unauthorized", status: 401, ok: false };

      const student = {
        firstName,
        lastName,
        classroomId,
        email,
        username,
        password,
        schoolId,
      };
      let result = await this.validators.student.createStudent(student);
      if (result) return result;

      // Check if classroom exists
      const classroom = await this.mongomodels.classroom.findById(classroomId);
      if (!classroom)
        return { error: "classroom not found", status: 404, ok: false };
      const school = await this.mongomodels.school.findById(schoolId);
      if (!school) return { error: "school not found", status: 404, ok: false };

      let userExists = await this.mongomodels.user.findOne({ username });
      if (userExists)
        return { error: "User already exists", status: 409, ok: false };
      let user = { username, email, password, role: "student" };
      let createdUser = await this.mongomodels.user.create(user);

      let createdStudent = await this.mongomodels.student.create({
        firstName,
        lastName,
        classroomId,
        userId: createdUser._id,
        schoolId,
      });

      // Response
      return {
        student: {
          firstName: createdStudent.firstName,
          lastName: createdStudent.lastName,
          id: createdStudent._id,
          classroomId: createdStudent.classroomId,
          userId: createdStudent.userId,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
     * Updates a student's information.
     *
     * @param {Object} params - The parameters for updating the student.
     * @param {string} params.firstName - The first name of the student.
     * @param {string} params.lastName - The last name of the student.
     * @param {string} params.classroomId - The ID of the classroom the student belongs to.
     * @param {string} params.schoolId - The ID of the school the student belongs to.

     * @param {string} params.id - The ID of the student.
     * @param {string} [params.username] - The username of the student.
     * @param {Object} params.__longToken - The token containing user role information.
     *
     * @returns {Promise<Object>} The result of the update operation.
     * @returns {Object} [returns.error] - The error message if the update fails.
     * @returns {number} [returns.status] - The HTTP status code.
     * @returns {boolean} [returns.ok] - The status of the operation.
     * @returns {Object} [returns.student] - The updated student information.
     * @returns {string} returns.student.firstName - The updated first name of the student.
     * @returns {string} returns.student.lastName - The updated last name of the student.
     * @returns {string} returns.student.id - The updated ID of the student.
     * @returns {string} returns.student.classroomId - The updated classroom ID of the student.
     *
     * @throws {Error} If an error occurs during the update process.
     */
  async update({
    firstName,
    lastName,
    classroomId,
    schoolId,
    id,
    username,
    __longToken,
  }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "update",
      //   resource: "student",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      if (userRole === this.utils.roles.SCHOOL_ADMIN && schoolId !== __longToken.schoolId)
        return { error: "Unauthorized", status: 401, ok: false };

      const student = {
        firstName,
        lastName,
        classroomId,
        id,
        schoolId,
        username,
      };
      let result = await this.validators.student.updateStudent(student);
      if (result) return result;

      const studentExists = await this.mongomodels.student.findById(id);
      if (!studentExists)
        return { error: "student not found", status: 404, ok: false };

      // Check if classroom exists
      const classroom = await this.mongomodels.classroom.findById(classroomId);
      if (!classroom)
        return { error: "classroom not found", status: 404, ok: false };
      const school = await this.mongomodels.school.findById(schoolId);
      if (!school) return { error: "school not found", status: 404, ok: false };
      if (username) {
        // Check if username exists
        let userExists = await this.mongomodels.user.findOne({
          username,
          _id: { $ne: studentExists.userId },
        });
        if (userExists)
          return { error: "User already exists", status: 409, ok: false };
        let user = { username };
        await this.mongomodels.user.findByIdAndUpdate(
          studentExists.userId,
          user,
          { new: true, runValidators: true },
        );
      }

      // Update Logic
      let updatedStudent = await this.mongomodels.student.findByIdAndUpdate(
        id,
        student,
        { new: true, runValidators: true },
      );

      // Response
      return {
        student: {
          firstName: updatedStudent.firstName,
          lastName: updatedStudent.lastName,
          id: updatedStudent._id,
          classroomId: updatedStudent.classroomId,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Deletes a student record based on the provided query and authorization token.
   *
   * @param {Object} params - The parameters for the delete operation.
   * @param {Object} params.__query - The query object containing the student ID.
   * @param {string} params.__query.id - The ID of the student to be deleted.
   * @param {Object} params.__longToken - The authorization token containing user role information.
   * @returns {Promise<Object>} The result of the delete operation.
   * @returns {Object} [error] - An error object if the operation fails.
   * @returns {string} error.error - The error message.
   * @returns {number} error.status - The HTTP status code.
   * @returns {boolean} error.ok - The status of the operation.
   * @returns {Object} [student] - The deleted student object if the operation is successful.
   * @throws {Error} If an unexpected error occurs during the delete operation.
   */
  async delete({ __query, __longToken }) {
    try {
      const id = __query.id;
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "delete",
      //   resource: "student",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };

      const student = { id };
      let result = await this.validators.student.deleteStudent(student);
      if (result) return result;

      const studentExists = await this.mongomodels.student.findById(id);
      if (!studentExists)
        return { error: "student not found", status: 404, ok: false };
      if (
        userRole === this.utils.roles.SCHOOL_ADMIN &&
        studentExists.schoolId !== __longToken.schoolId
      )
        return { error: "Unauthorized", status: 401, ok: false };

      // Deletion Logic
      let deletedStudent = await this.mongomodels.student.findByIdAndDelete(id);

      // Response
      return {
        student: deletedStudent,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Retrieves a student by their ID.
   *
   * @param {Object} params - The parameters for the function.
   * @param {Object} params.__query - The query object containing the student ID.
   * @param {string} params.__query.id - The ID of the student to retrieve.
   * @param {Object} params.__longToken - The token object containing user information.
   * @returns {Promise<Object>} The student object if found, or an error object if not found or unauthorized.
   * @throws {Error} If an error occurs during the process.
   */
  async getByID({ __query, __longToken }) {
    try {
      const id = __query.id;
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "read",
      //   resource: "student",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      const student = { id };
      let result = await this.validators.student.getStudent(student);
      if (result) return result;

      const studentExists = await this.mongomodels.student.findById(id);
      if (!studentExists)
        return { error: "student not found", status: 404, ok: false };
      if (
        userRole === this.utils.roles.SCHOOL_ADMIN &&
        studentExists.schoolId !== __longToken.schoolId
      )
        return { error: "Unauthorized", status: 401, ok: false };

      return {
        student: studentExists,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Retrieves all student records from the database.
   *
   * @param {Object} params - The parameters object.
   * @param {Object} params.__longToken - The token object containing user information.
   * @returns {Promise<Object>} - A promise that resolves to an object containing the list of students or an error message.
   * @throws {Error} - Throws an error if there is an issue with the database query.
   */
  async getAll({ __longToken }) {
    try {
      const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "create",
      //   resource: "student",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      if (userRole === this.utils.roles.SCHOOL_ADMIN) {
        const schoolId = __longToken?.schoolId;
        const students = await this.mongomodels.student.find({ schoolId });
        return {
          students,
        };
      }
      const students = await this.mongomodels.student.find({});
      return {
        students,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = StudentManager;
