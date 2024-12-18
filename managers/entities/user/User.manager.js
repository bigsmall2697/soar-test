/**
 * User manager class for handling user-related operations.
 * @class
 */
class UserManager {
  /**
   * Constructs a new User manager.
   * @param {Object} options - The options for the User manager.
   * @param {Object} options.utils - Utility functions.
   * @param {Object} options.cache - Cache manager.
   * @param {Object} options.config - Configuration settings.
   * @param {Object} options.cortex - Cortex manager.
   * @param {Object} options.managers - Other managers.
   * @param {Object} options.validators - Validators.
   * @param {Object} options.mongomodels - MongoDB models.
   */
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
    this.httpExposed = ["post=createUser", "post=login"];
    this.name = "user";
    this.managers = managers;
  }

  /**
   * Creates a new user in the system.
   *
   * @param {Object} params - The parameters for creating a user.
   * @param {string} params.username - The username of the new user.
   * @param {string} params.email - The email of the new user.
   * @param {string} params.password - The password of the new user.
   * @param {string} params.role - The role of the new user.
   * @param {string} [params.schoolId] - The ID of the school, required if the role is 'schoolAdmin'.
   * @param {Object} params.__longToken - The token object containing user role information should be superAdmin.
   *
   * @returns {Promise<Object>} The result of the user creation process.
   * @returns {Object} [returns.error] - The error message if the creation fails.
   * @returns {number} [returns.status] - The HTTP status code.
   * @returns {boolean} [returns.ok] - The status of the operation.
   * @returns {Object} [returns.user] - The created user information.
   * @returns {string} returns.user.username - The username of the created user.
   * @returns {string} returns.user.email - The email of the created user.
   * @returns {string} returns.user.role - The role of the created user.
   * @returns {string} returns.user.id - The ID of the created user.
   * @returns {string} [returns.longToken] - The generated long token for the created user.
   *
   * @throws {Error} Throws an error if the user creation process fails.
   */
  async createUser({ username, email, password, role, schoolId, __longToken }) {
    try {
      // const userRole = __longToken?.role;
      // const isAuthorized = this.managers.authorization.isAuthorized({
      //   userRole,
      //   action: "create",
      //   resource: "createUser",
      // });
      // if (!isAuthorized)
      //   return { error: "Unauthorized", status: 401, ok: false };
      if (role !== "superAdmin" && role !== "schoolAdmin")
        return { error: "Invalid role", status: 400, ok: false };
      const user = { username, email, password, role, schoolId };

      let result = await this.validators.user.createUser(user);
      if (result) return result;
      // check for schoolId incase of school admin
      if (role === "schoolAdmin" && !schoolId)
        return { error: "School Id is required", status: 400, ok: false };
      if (role === "schoolAdmin") {
        let school = await this.mongomodels.school.findById(schoolId);
        if (!school)
          return { error: "School not found", status: 404, ok: false };
      }
      // Check if user exists
      let userExists = await this.mongomodels.user.findOne({ username });
      if (userExists)
        return { error: "User already exists", status: 409, ok: false };

      // Creation Logic
      let createdUser = await this.mongomodels.user.create({
        username,
        email,
        role,
        password,
        school: schoolId,
      });
      let longToken = this.tokenManager.genLongToken({
        userId: createdUser._id,
        role: createdUser.role,
        schoolId,
      });

      // Response
      return {
        user: {
          username: createdUser.username,
          email: createdUser.email,
          role: createdUser.role,
          id: createdUser._id,
          schoolId: createdUser.school,
        },
        longToken,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Login a user with the provided username and password.
   *
   * @param {Object} credentials - The login credentials.
   * @param {string} credentials.username - The username of the user.
   * @param {string} credentials.password - The password of the user.
   * @returns {Promise<Object>} The login result.
   * @returns {Object} [result.user] - The user details if login is successful.
   * @returns {string} result.user.username - The username of the user.
   * @returns {string} result.user.role - The role of the user.
   * @returns {string} result.user.id - The ID of the user.
   * @returns {string} result.longToken - The long token generated for the user.
   * @returns {Object} [result.error] - The error details if login fails.
   * @returns {string} result.error.message - The error message.
   * @returns {number} result.error.status - The HTTP status code.
   * @returns {boolean} result.error.ok - The status of the operation.
   * @throws {Error} If an error occurs during the login process.
   */
  async login({ username, password }) {
    try {
      const user = { username, password };
      let result = await this.validators.user.login(user);
      if (result) return result;
      // Check if user exists
      let userExists = await this.mongomodels.user.findOne({ username });
      if (!userExists)
        return { error: "User not found", status: 404, ok: false };
      // Check if password is correct
      let passwordMatch = await userExists.comparePassword(password);
      if (!passwordMatch)
        return { error: "Invalid password", status: 401, ok: false };
      // Creation Logic
      let longToken = this.tokenManager.genLongToken({
        userId: userExists._id,
        role: userExists.role,
        schoolId: userExists.school,
      });
      // Response
      return {
        user: {
          username: userExists.username,
          email: userExists.email,
          role: userExists.role,
          id: userExists._id,
          schoolId: userExists.school,
        },
        longToken,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = UserManager;
