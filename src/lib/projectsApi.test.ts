import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWithAuthMock = vi.fn();
vi.mock("./fetchWithAuth", () => ({
  fetchWithAuth: (...args: unknown[]) => fetchWithAuthMock(...args),
}));

import {
  createProject,
  getProject,
  listProjects,
  shareProject,
} from "./projectsApi";

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body }) as Response;

describe("projectsApi", () => {
  beforeEach(() => fetchWithAuthMock.mockReset());

  it("listProjects unwraps the projects array", async () => {
    fetchWithAuthMock.mockResolvedValue(
      jsonResponse({ projects: [{ id: "p1", name: "A" }] }),
    );
    const projects = await listProjects();
    expect(projects).toEqual([{ id: "p1", name: "A" }]);
    const [url] = fetchWithAuthMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/projects");
  });

  it("createProject POSTs name, session_id and checkpoint", async () => {
    fetchWithAuthMock.mockResolvedValue(jsonResponse({ id: "p1", name: "A" }));
    await createProject("A", "s1", { sessionId: "s1" } as never);
    const [, init] = fetchWithAuthMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      name: "A",
      session_id: "s1",
      checkpoint: { sessionId: "s1" },
    });
  });

  it("getProject requests the project by id", async () => {
    fetchWithAuthMock.mockResolvedValue(jsonResponse({ id: "p1", name: "A" }));
    await getProject("p1");
    const [url] = fetchWithAuthMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/projects\/p1$/);
  });

  // The backend's error envelope (app_exception_handler) puts the real text in
  // `trace`; `error.message` is only the generic label for the error code.
  it("throws the backend trace on failure", async () => {
    fetchWithAuthMock.mockResolvedValue(
      jsonResponse(
        {
          error: { code: "ERR_VALIDATION", message: "Invalid input data" },
          stack: [],
          trace: "recipient not found. they need a Luma account first.",
          success: false,
        },
        false,
        400,
      ),
    );
    await expect(shareProject("p1", "x@y.z")).rejects.toThrow(
      "recipient not found. they need a Luma account first.",
    );
  });

  it("falls back to the generic error label, then the status", async () => {
    fetchWithAuthMock.mockResolvedValue(
      jsonResponse({ error: { message: "Invalid input data" } }, false, 400),
    );
    await expect(shareProject("p1", "x@y.z")).rejects.toThrow(
      "Invalid input data",
    );

    fetchWithAuthMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(shareProject("p1", "x@y.z")).rejects.toThrow(
      "Request failed (502)",
    );
  });

  it("shareProject reports whether the recipient was invited", async () => {
    fetchWithAuthMock.mockResolvedValue(
      jsonResponse({ shared: true, invited: true, recipient_project_id: "p2" }),
    );
    await expect(shareProject("p1", "new@person.com")).resolves.toEqual({
      invited: true,
    });

    fetchWithAuthMock.mockResolvedValue(jsonResponse({ shared: true }));
    await expect(shareProject("p1", "old@person.com")).resolves.toEqual({
      invited: false,
    });
  });
});
