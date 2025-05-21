export const CreateTestimonialSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["names", "content"],
      // ! Check data types
      // https://ajv.js.org/json-schema.html#json-data-type
      properties: {
        names: { type: "string", minLength: 1 },
        content: { type: "string", minLength: 1 },
        image: { type: "string", minLength: 1 },
      },
    },
  },
};

export const UpdateTestimonialSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      minProperties: 1,
      // ! Check data types
      // https://ajv.js.org/json-schema.html#json-data-type
      properties: {
        names: { type: "string", minLength: 1 },
        content: { type: "string", minLength: 1 },
        image: { type: "string", minLength: 1 },
      },
    },
  },
};
