// src/app/(admin)/admin/programs/[id]/edit/page.tsx
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import ProgramForm from "@/components/admin/ProgramForm";

interface Props { params: { id: string } }

export default async function EditProgramPage({ params }: Props) {
  const rows = await query<{
    id: number; category_id: number; name: string; degree_type: string;
    duration_years: number; description: string; objectives: string;
    career_outcomes: string; admission_req: string;
    thumbnail_url: string; is_published: boolean; sort_order: number;
  }>("SELECT * FROM programs WHERE id = ?", [params.id]);

  if (!rows[0]) notFound();
  const p = rows[0];

  return (
    <ProgramForm
      programId={p.id}
      initial={{
        categoryId:     p.category_id,
        name:           p.name,
        degreeType:     p.degree_type as "bachelor",
        durationYears:  p.duration_years,
        description:    p.description ?? "",
        objectives:     p.objectives ?? "",
        careerOutcomes: p.career_outcomes ?? "",
        admissionReq:   p.admission_req ?? "",
        thumbnailUrl:   p.thumbnail_url,
        isPublished:    Boolean(p.is_published),
        sortOrder:      p.sort_order,
      }}
    />
  );
}
