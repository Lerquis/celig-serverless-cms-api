export const CreateSuscriptorSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["email"],
      // ! Check data types
      // https://ajv.js.org/json-schema.html#json-data-type
      properties: {
        email: { type: "string", minLength: 1, format: "email" },
      },
    },
  },
};
