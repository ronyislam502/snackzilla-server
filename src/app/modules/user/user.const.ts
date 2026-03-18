export const USER_ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export interface IAuthProvider {
    provider: "google" | "credentials";  // "Google", "Credential"
    providerId: string;
}

export const UserSearchableFields = [
  "name",
  "email",
  "phone",
  "role",
  "status",
];
