import Link from "next/link";
import { ProgramRegistry } from "@/components/program-registry";

export default function Programs() {
  return <main className="wrap subpage"><span className="eyebrow">PUBLIC REGISTRY</span><h1>Proof-backed progress.</h1><p className="sub-lead">Explore finalized Studionet records, frozen milestone terms, source authorities and treasury state.</p><ProgramRegistry/><div className="registry-cta glass-card"><div><span className="overline">START A NEW PROGRAM</span><h2>Commit the terms before the work.</h2></div><Link href="/create" className="action primary">Create program</Link></div></main>;
}
