import { z } from "zod";
import { USER_ROLE, USER_STATUS } from "./user.const";

const createAddressValidationSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z.string({
      required_error: "Email is required",
    }),
    phone: z.string(),
    role: z.nativeEnum(USER_ROLE).default(USER_ROLE.USER),
    status: z.nativeEnum(USER_STATUS).default(USER_STATUS.ACTIVE),
    address: createAddressValidationSchema,
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});

const updateAddressValidationSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z.nativeEnum(USER_ROLE).optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    address: updateAddressValidationSchema,
    status: z.nativeEnum(USER_STATUS).optional(),
    phone: z.string().optional(),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
