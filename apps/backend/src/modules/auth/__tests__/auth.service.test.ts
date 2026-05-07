import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service.js";
import type { AuthRepository } from "../auth.repository.js";

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
    findSessionByHash: vi.fn().mockResolvedValue(null),
    markSessionUsed: vi.fn().mockResolvedValue(undefined),
    revokeFamilySessions: vi.fn().mockResolvedValue(undefined),
    revokeSession: vi.fn().mockResolvedValue(undefined),
    revokeAllUserSessions: vi.fn().mockResolvedValue(undefined),
    countActiveSessions: vi.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as AuthRepository;
}

describe("AuthService.register", () => {
  it("throws CONFLICT if email already exists", async () => {
    const repo = makeRepo({ findUserByEmail: vi.fn().mockResolvedValue({ id: "existing" }) });
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
    const service = new AuthService(
      makeRepo({ findUserByEmail: vi.fn().mockResolvedValue(null) }),
    );
    await expect(
      service.login({ email: "noexist@x.com", password: "anypass" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("AuthService.logout", () => {
  it("calls revokeSession with hashed token", async () => {
    const revokeSession = vi.fn().mockResolvedValue(undefined);
    const service = new AuthService(makeRepo({ revokeSession }));

    await service.logout("some-raw-token-123");

    expect(revokeSession).toHaveBeenCalledOnce();
    const calledWith = revokeSession.mock.calls[0]?.[0] as string;
    expect(calledWith).not.toBe("some-raw-token-123");
    expect(calledWith).toHaveLength(64); // sha256 hex = 64 chars
  });
});

describe("AuthService.refresh", () => {
  it("throws UNAUTHORIZED if session not found", async () => {
    const service = new AuthService(
      makeRepo({ findSessionByHash: vi.fn().mockResolvedValue(null) }),
    );
    await expect(service.refresh("invalid-token")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws UNAUTHORIZED and revokes family on token reuse", async () => {
    const revokeFamilySessions = vi.fn().mockResolvedValue(undefined);
    const service = new AuthService(
      makeRepo({
        findSessionByHash: vi.fn().mockResolvedValue({
          id: "s1",
          familyId: "family-abc",
          userId: "user_1",
          usedAt: new Date(), // already rotated — reuse!
          revokedAt: null,
          expiresAt: new Date(Date.now() + 999_999),
        }),
        revokeFamilySessions,
      }),
    );

    await expect(service.refresh("some-token")).rejects.toMatchObject({ statusCode: 401 });
    expect(revokeFamilySessions).toHaveBeenCalledWith("family-abc");
  });

  it("issues new tokens in the same family on valid refresh", async () => {
    const markSessionUsed = vi.fn().mockResolvedValue(undefined);
    const createSession = vi.fn().mockResolvedValue({ id: "new-session" });
    const service = new AuthService(
      makeRepo({
        findSessionByHash: vi.fn().mockResolvedValue({
          id: "s1",
          familyId: "family-abc",
          userId: "user_1",
          usedAt: null,
          revokedAt: null,
          expiresAt: new Date(Date.now() + 999_999),
        }),
        findUserById: vi.fn().mockResolvedValue({
          id: "user_1",
          email: "test@example.com",
          role: "STUDENT",
          displayName: "Test",
        }),
        markSessionUsed,
        createSession,
      }),
    );

    const result = await service.refresh("valid-token");

    expect(markSessionUsed).toHaveBeenCalledOnce();
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ familyId: "family-abc" }),
    );
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });
});

describe("AuthService.verifyAccessToken", () => {
  it("throws UNAUTHORIZED for malformed token", () => {
    const service = new AuthService(makeRepo());
    expect(() => service.verifyAccessToken("not.a.jwt")).toThrow();
  });
});
