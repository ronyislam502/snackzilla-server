import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { TAddress, TUser, UserModel } from "./user.interface";
import config from "../../config";
import { IAuthProvider, USER_ROLE, USER_STATUS } from "./user.const";

const addressSchema = new Schema<TAddress>({
  street: {
    type: String,
    required: [false, "Street is required"],
    default: ""
  },
  city: {
    type: String,
    required: [false, "City is required"],
    default: ""
  },
  state: { type: String, default: "" },
  postalCode: {
    type: String,
    required: [false, "PostalCode is required"],
    default: ""
  },
  country: {
    type: String,
    required: [false, "Country is required"],
    default: ""
  },
});

const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      //validate email
      match: [
        /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [false, "Password is required"],
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      default: USER_ROLE.USER,
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    passwordChangedAt: {
      type: Date,
    },
    address: {
      type: addressSchema,
    },
    isVerified: { type: Boolean, default: false },
    auths: [authProviderSchema],
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Food",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

userSchema.post("save", function (doc, next) {
  // console.log(doc.password);
  doc.password = "";
  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: number,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>("User", userSchema);
