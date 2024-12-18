module.exports = {
  createSchool: [
    {
      label: "name",
      path: "name",
      model: "name",
      required: true,
    },
    {
      label: "address",
      path: "address",
      model: "address",
      required: true,
    },
  ],
  updateSchool: [
    {
      label: "name",
      path: "name",
      model: "name",
      required: true,
    },
    {
      label: "address",
      path: "address",
      model: "address",
      required: true,
    },
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
  deleteSchool: [
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
  getSchool: [
    {
      label: "id",
      path: "id",
      model: "mongoId",
      required: true,
    },
  ],
};
