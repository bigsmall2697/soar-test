const config = require("../config/index.config.js");
const UserModel = require("../managers/entities/user/User.model.js");
const { roles } = require("../libs/utils.js");

const mongoDB = config.dotEnv.MONGO_URI
  ? require("../connect/mongo")({
      uri: config.dotEnv.MONGO_URI,
    })
  : null;

const superAdminData = {
  username: "superadmin",
  email: "superadmin@test.com",
  password: "test",
  role: roles.SUPER_ADMIN,
};

async function seedSuperAdmin() {
  try {
    // Check if Super Admin already exists
    const existingAdmin = await UserModel.findOne({
      email: superAdminData.email,
    });
    if (existingAdmin) {
      console.log("Super Admin user already exists.");
      process.exit(0);
    }

    // Create Super Admin
    const superAdmin = new UserModel({
      ...superAdminData,
    });
    await superAdmin.save();

    console.log("Super Admin user created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
}

// Run the script
seedSuperAdmin();
