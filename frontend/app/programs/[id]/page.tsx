"use client";

import { useParams } from "next/navigation";
import { ProgramDetail } from "@/components/program-detail";

export default function ProgramPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return <main className="wrap subpage"><h1>Invalid program ID</h1><p className="sub-lead">Program identifiers are positive canonical integers returned by the contract.</p></main>;
  return <ProgramDetail id={id}/>;
}
