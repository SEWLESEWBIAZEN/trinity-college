// src/app/(public)/media/page.tsx
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { Play, FileText, Image as ImageIcon } from "lucide-react";
import type { Media, MediaAlbum } from "@/types";

export const metadata: Metadata = { title: "Media Gallery" };

export default async function MediaPage() {
  const albums = await query<MediaAlbum & { coverUrl: string; mediaCount: number }>(
    `SELECT a.id, a.title, a.slug, a.description, a.sort_order AS sortOrder,
            m.url AS coverUrl,
            (SELECT COUNT(*) FROM media WHERE album_id = a.id AND is_public = 1) AS mediaCount
     FROM media_albums a
     LEFT JOIN media m ON a.cover_id = m.id
     ORDER BY a.sort_order`
  );

  const images = await query<Media>(
    `SELECT id, title, url, alt_text AS altText, album_id AS albumId
     FROM media WHERE type = 'image' AND is_public = 1
     ORDER BY created_at DESC LIMIT 24`
  );

  const videos = await query<Media>(
    `SELECT id, title, url, thumbnail_url AS thumbnailUrl, description
     FROM media WHERE type = 'video' AND is_public = 1
     ORDER BY created_at DESC LIMIT 9`
  );

  const documents = await query<Media>(
    `SELECT id, title, url, mime_type AS mimeType, file_size_kb AS fileSizeKb
     FROM media WHERE type = 'document' AND is_public = 1
     ORDER BY created_at DESC LIMIT 20`
  );

  return (
    <div>
      {/* Hero */}
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="badge badge-gold text-xs mb-4">Gallery</span>
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">Media Center</h1>
          <p className="text-white/70 text-lg">
            Photos, videos, and documents from Trinity Lutheran College.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <h2 className="section-heading mb-3">Photo Albums</h2>
            <span className="gold-bar" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((a) => (
                <div key={a.id} className="card group overflow-hidden">
                  {a.coverUrl ? (
                    <img src={a.coverUrl} alt={a.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center"
                      style={{ background: "var(--clr-stone)" }}>
                      <ImageIcon className="w-10 h-10 text-stone-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-playfair font-bold mb-1"
                      style={{ color: "var(--clr-navy)" }}>{a.title}</h3>
                    <p className="text-xs text-stone-400">{a.mediaCount} photo{a.mediaCount !== 1 ? "s" : ""}</p>
                    {a.description && (
                      <p className="text-sm text-stone-500 mt-1 line-clamp-2">{a.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo grid */}
        {images.length > 0 && (
          <section>
            <h2 className="section-heading mb-3">Campus Photos</h2>
            <span className="gold-bar" />
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {images.map((img) => (
                <div key={img.id} className="break-inside-avoid overflow-hidden rounded-xl">
                  <img
                    src={img.url}
                    alt={img.altText ?? img.title ?? "Campus photo"}
                    className="w-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section>
            <h2 className="section-heading mb-3">Videos</h2>
            <span className="gold-bar" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => (
                <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                  className="card group relative overflow-hidden">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.title ?? "Video"}
                      className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center"
                      style={{ background: "var(--clr-navy)" }}>
                      <Play className="w-10 h-10 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-6 h-6 ml-1" style={{ color: "var(--clr-navy)" }} />
                    </div>
                  </div>
                  {v.title && (
                    <div className="p-4">
                      <p className="font-semibold text-sm" style={{ color: "var(--clr-navy)" }}>
                        {v.title}
                      </p>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <section>
            <h2 className="section-heading mb-3">Documents & Resources</h2>
            <span className="gold-bar" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((d) => (
                <a key={d.id} href={d.url} download
                  className="card p-4 flex items-start gap-4 group hover:border-navy transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--clr-stone)" }}>
                    <FileText className="w-5 h-5" style={{ color: "var(--clr-gold)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate"
                      style={{ color: "var(--clr-navy)" }}>{d.title ?? "Document"}</p>
                    {d.fileSizeKb && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {d.fileSizeKb > 1024
                          ? `${(d.fileSizeKb / 1024).toFixed(1)} MB`
                          : `${d.fileSizeKb} KB`}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
