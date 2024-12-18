module.exports = {
  createStudent: [
    {
      label: "firstName",
      path: "firstName",
      model: "name",
      required: true,
    },
    {
      label: "lastName",
      path: "lastName",
      model: "name",
      required: true,
    },
    {
      label: "classroomId",
      path: "classroomId",
      model: "mongoId",
      required: true,
    },
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
      label: "schoolId",
      path: "schoolId",
      model: "mongoId",
      required: true,
    },
  ],
  updateStudent: [
    {
      label: "firstName",
      path: "firstName",
      model: "name",
      required: true,
    },
    {
      label: "lastName",
      path: "lastName",
      model: "name",
      required: true,
    },
    {
      label: "classroomId",
      path: "classroomId",
      model: "mongoId",
      required: true,
    },
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
    {
      label: "username",
      path: "username",
      model: "username",
      required: false,
    },
  ],
  deleteStudent: [
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
  getStudent: [
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
};
