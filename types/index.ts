// src/types/index.ts

export interface Program {
  id: number;
  categoryId?: number;
  categoryName?: string;
  name: string;
  slug: string;
  degreeType: "certificate" | "diploma" | "bachelor" | "master" | "phd";
  durationYears?: number;
  description?: string;
  objectives?: string;
  careerOutcomes?: string;
  admissionReq?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface ProgramCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface Media {
  id: number;
  title?: string;
  description?: string;
  type: "image" | "video" | "document";
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSizeKb?: number;
  altText?: string;
  albumId?: number;
  albumTitle?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface MediaAlbum {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverId?: number;
  coverUrl?: string;
  sortOrder: number;
  mediaCount?: number;
}

export interface Staff {
  id: number;
  fullName: string;
  title?: string;
  position?: string;
  department?: string;
  bio?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  coverUrl?: string;
  category: "news" | "event" | "notice" | "scholarship";
  eventDate?: string;
  isPublished: boolean;
  isPinned: boolean;
  authorName?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface AdmissionRequirement {
  id: number;
  groupName: string;
  title: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface StudentService {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteContent {
  section: string;
  key: string;
  value?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
