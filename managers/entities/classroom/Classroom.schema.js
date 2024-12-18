module.exports = {
  createClassRoom: [
    {
      label: "name",
      path: "name",
      model: "name",
      required: true,
    },
    {
      label: "capacity",
      path: "capacity",
      model: "capacity",
      required: true,
    },
    {
      label: "schoolId",
      path: "schoolId",
      model: "mongoId",
      required: true,
    },
  ],
  updateClassroom: [
    {
      label: "name",
      path: "name",
      model: "name",
      required: true,
    },
    {
      label: "capacity",
      path: "capacity",
      model: "capacity",
      required: true,
    },
    {
      label: "schoolId",
      path: "schoolId",
      model: "mongoId",
      required: true,
    },
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
  deleteClassroom: [
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
  getClassroom: [
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
};
