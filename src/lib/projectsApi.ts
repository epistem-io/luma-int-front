import {PROJECTS_URL} from "@/constants";
import {fetchWithAuth} from "./fetchWithAuth";
import type {SessionCheckpoint} from "./sessionCheckpoint";

export interface ProjectSummary {
  id: string;
  name: string;
  last_step: number | null;
  shared_from: string | null;
  modified_date: string | null;
}

export interface ProjectDetail extends ProjectSummary {
  session_id: string;
  checkpoint: SessionCheckpoint;
}

const errorMessageFrom = (body: unknown, status: number) => {
  if (typeof body === "object" && body !== null) {
    const { trace, message, error } = body as {
      trace?: unknown;
      message?: unknown;
      error?: {message?: unknown} | null;
    };
    if (typeof message === "string" && message.trim()) return message
    if (typeof trace === "string" && trace.trim()) return trace
    if (typeof error?.message === "string" && error.message.trim()) {return error.message}
  }
  return `Request failed (${status})`;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetchWithAuth(url, {
    ...init,
    headers: {"Content-Type": "application/json"},
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessageFrom(body, response.status));
  }
  return body as T;
};

export const listProjects = async (): Promise<ProjectSummary[]> => {
  const body = await request<{ projects?: ProjectSummary[] }>(PROJECTS_URL);
  return body.projects ?? [];
};

export const createProject = (
  name: string,
  sessionId: string,
  checkpoint: SessionCheckpoint,
): Promise<ProjectDetail> =>
  request<ProjectDetail>(PROJECTS_URL, {
    method: "POST",
    body: JSON.stringify({ name, session_id: sessionId, checkpoint }),
  });

export const getProject = (id: string): Promise<ProjectDetail> =>
  request<ProjectDetail>(`${PROJECTS_URL}/${id}`);

export const updateProjectCheckpoint = async (
  id: string,
  checkpoint: SessionCheckpoint,
): Promise<void> => {
  await request(`${PROJECTS_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ checkpoint }),
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  await request(`${PROJECTS_URL}/${id}`, { method: "DELETE" });
};

export const shareProject = async (
  id: string,
  email: string,
): Promise<void> => {
  await request(`${PROJECTS_URL}/${id}/share`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

