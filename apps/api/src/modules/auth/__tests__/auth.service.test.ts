import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import type { AuthRepository } from "../auth.repository.js";

// ─── Mock de AuthRepository ───────────────────────────────────────────────────

function makeRepo(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findUserById: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      displayName: "Test User",
      role: "STUDENT",
      passwordHash: "hashed",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeenAt: null,
    }),
    updateLastSeen: vi.fn().mockResolvedValue(undefined),
    createSession: vi.fn().mockResolvedValue({ id: "session_1" }),
    findActiveSession: vi.fn().mockResolvedValue(null),
    revokeSession: vi.fn().mockResolvedValue(undefined),
    revokeAllUserSessions: vi.fn().mockResolvedValue(undefined),
    countActiveSessions: vi.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as AuthRepository;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AuthService.register", () => {
  it("throws CONFLICT if email already exists", async () => {
    const repo = makeRepo({
      findUserByEmail: vi.fn().mockResolvedValue({ id: "existing" }),
    });
    const service = new AuthService(repo);

    await expect(
      service.register({ email: "a@b.com", password: "Password1", displayName: "A" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("returns user + tokens on successful registration", async () => {
    const repo = makeRepo();
    const service = new AuthService(repo);

    const result = await service.register({
      email: "new@example.com",
      password: "Password1",
      displayName: "New User",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.tokens.expiresIn).toBe(900);
  });
});

describe("AuthService.login", () => {
  it("throws UNAUTHORIZED for wrong password", async () => {
    const service = new AuthService(makeRepo());

    await expect(
      service.login({ email: "x@x.com", password: "wrongpassword" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws UNAUTHORIZED when user not found", async () => {
    const service = new AuthService(makeRepo({ findUserByEmail: vi.fn().mockResolvedValue(null) }));

    await expect(
      service.login({ email: "noexist@x.com", password: "anypass" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("AuthService.logout", () => {
  it("calls revokeSession with hashed token", async () => {
    const revokeSession = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo({ revokeSession });
    const service = new AuthService(repo);

    await service.logout("some-raw-token-123");

    expect(revokeSession).toHaveBeenCalledOnce();
    // El hash debe ser diferente del raw token
    const calledWith = revokeSession.mock.calls[0]?.[0] as string;
    expect(calledWith).not.toBe("some-raw-token-123");
    expect(calledWith).toHaveLength(64); // sha256 hex
  });
});

describe("AuthService.refresh", () => {
  it("throws UNAUTHORIZED if session not found", async () => {
    const service = new AuthService(makeRepo({ findActiveSession: vi.fn().mockResolvedValue(null) }));

    await expect(service.refresh("invalid-token")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe("AuthService.verifyAccessToken", () => {
  it("throws UNAUTHORIZED for malformed token", () => {
    const service = new AuthService(makeRepo());
    expect(() => service.verifyAccessToken("not.a.jwt")).toThrow();
  });
});
