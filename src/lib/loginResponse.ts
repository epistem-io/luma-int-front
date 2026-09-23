import type { AuthUser } from "@/contexts/authContext";

export interface LoginResponseUser {
  email: string;
  fullname?: string;
  organization_name?: string;
}

// Returned by both /account/login and /account/login-code.
export interface LoginResponse {
  api_key: string;
  api_key_expires?: string;
  user: LoginResponseUser;
}

export const normalizeLoginUser = (identity: LoginResponseUser): AuthUser => ({
  email: identity.email,
  name: identity.fullname,
  organizationName: identity.organization_name,
});
