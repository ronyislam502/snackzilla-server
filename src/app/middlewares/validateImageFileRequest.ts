/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyZodObject, ZodArray, ZodEffects, ZodRecord } from "zod";
import catchAsync from "../utilities/catchAsync";

const validateImageFileRequest = (
  schema: AnyZodObject | ZodEffects<any> | ZodArray<any> | ZodRecord<any>
) => {
  return catchAsync(async (req, res, next) => {
    const parsedFile = await schema.parseAsync({
      files: req.files,
    });

    req.files = parsedFile.files;

    next();
  });
};

export default validateImageFileRequest;
