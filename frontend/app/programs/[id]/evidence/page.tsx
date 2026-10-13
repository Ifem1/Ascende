import Link from "next/link";
import { ProgramDetail } from "@/components/program-detail";

export default async function MilestoneEvidence({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programId = Number(id);
  if (!Number.isSafeInteger(programId) || programId < 1) return <main className="wrap subpage"><h1>Invalid program</h1><Link className="text-link" href="/programs">Return to programs</Link></main>;
  return <><main className="wrap subpage evidence-entry"><span className="eyebrow">MILESTONE EVIDENCE</span><h1>Evidence, sealed to the rules.</h1><p className="sub-lead">Review the program’s frozen evidence authorities and manifest. Only the assigned recipient can submit evidence, and every source must match its precommitted URL policy.</p></main><ProgramDetail id={programId}/></>;
}
