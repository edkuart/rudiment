export interface MediaFileRecord {
  id: string;
  lessonId: string | null;
  courseId: string | null;
  type: "PDF" | "AUDIO" | "IMAGE" | "DOWNLOAD";
  label: string;
  filename: string;
  mimeType: string;
  sizeBytes: number | null;
  storageKey: string;
  isPublic: boolean;
  position: number;
  createdAt: Date;
}

export interface UploadPresignResult {
  mediaFileId: string;
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
}

export interface DownloadPresignResult {
  downloadUrl: string;
  expiresIn: number;
}

export interface CreateMediaInput {
  lessonId?: string;
  courseId?: string;
  type: "PDF" | "AUDIO" | "IMAGE" | "DOWNLOAD";
  label: string;
  filename: string;
  mimeType: string;
  sizeBytes?: number;
  isPublic?: boolean;
  position?: number;
}
