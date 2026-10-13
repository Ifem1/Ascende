import Link from "next/link";
import { ProgramDetail } from "@/components/program-detail";

export default async function Challenges({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programId = Number(id);
  if (!Number.isSafeInteger(programId) || programId < 1) return <main className="wrap subpage"><h1>Invalid program</h1><Link className="text-link" href="/programs">Return to programs</Link></main>;
  return <><main className="wrap subpage evidence-entry"><span className="eyebrow">BOUNDED REVIEW</span><h1>Challenge a provisional result.</h1><p className="sub-lead">A challenge is available only during the frozen window, requires the exact committed bond and new admissible evidence, and receives an independent reevaluation.</p></main><ProgramDetail id={programId}/></>;
}
