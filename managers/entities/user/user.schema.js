const { model } = require("mongoose");

module.exports = {
  createUser: [
    {
      label: "username",
      path: "username",
      model: "username",
      required: true,
    },
    {
      label: "email",
      path: "email",
      model: "email",
      required: true,
    },
    {
      label: "password",
      path: "password",
      model: "password",
      required: true,
    },
    {
      label: "role",
      path: "role",
      model: "role",
      required: true,
    },
    {
      label: "schoolId",
      path: "schoolId",
      model: "mongoId",
      required: false,
    },
  ],
  login: [
    {
      label: "username",
      path: "username",
      model: "username",
      required: true,
    },
    {
      label: "password",
      path: "password",
      model: "password",
      required: true,
    },
  ],
};
