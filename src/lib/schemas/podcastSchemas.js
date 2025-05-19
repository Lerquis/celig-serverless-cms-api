export const PodcastSchema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["url"],
      // ! Check data types
      // https://ajv.js.org/json-schema.html#json-data-type
      properties: {
        url: { type: "string", minLength: 1 },
      },
    },
  },
};
