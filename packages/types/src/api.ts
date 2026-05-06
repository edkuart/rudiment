// API request/response DTOs — shared between web (client) and api (server)

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

// Courses
export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  difficulty: string;
  estimatedDuration: number;
  accessType: string;
  publishedAt: string | null;
}

// Progress
export interface UpdateProgressRequest {
  watchedSeconds: number;
  lastPositionSeconds: number;
  totalSeconds: number;
}
