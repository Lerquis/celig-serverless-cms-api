export const CreateBlogSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["title", "content", "tags"],
      // ! Check data types
      // https://ajv.js.org/json-schema.html#json-data-type
      properties: {
        title: { type: "string", minLength: 1 },
        content: { type: "string", minLength: 1 },
        tags: { type: "array", minItems: 1, items: { type: "string" } },
      },
    },
  },
};

export const UpdateBlogSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      minProperties: 1,
      // ! Check data types
      // https://ajv.js.org/json-schema.html#json-data-type
      properties: {
        title: { type: "string", minLength: 1 },
        content: { type: "string", minLength: 1 },
        tags: { type: "array", minItems: 1, items: { type: "string" } },
      },
    },
  },
};
