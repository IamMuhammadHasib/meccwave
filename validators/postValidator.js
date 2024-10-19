const { z } = require("zod");

const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string(),
});

const postSchema = z
  .object({
    text: z.string().optional(),
    media: z.array(mediaItemSchema).optional(),
    visibility: z.enum(["public", "friends", "private"]),
  })
  .refine((data) => data.text || (data.media && data.media.length > 0), {
    message: "Post content can not be empty",
    path: ["text", "media"],
  });

module.exports = postSchema;
