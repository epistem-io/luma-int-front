import { authStorage } from "./authStorage";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const buildAuthHeaders = (headers?: HeadersInit) => {
  const nextHeaders = new Headers(headers);
  const token = authStorage.getToken();

  if (token) {
    nextHeaders.set("Authorization", `${token}`);
  }

  return nextHeaders;
};

export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const response = await fetch(input, {
    ...init,
    headers: buildAuthHeaders(init.headers),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  return response;
};
