import { ProgramRegistry } from "@/components/program-registry";

export default function MyWork() {
  return <main className="wrap subpage"><span className="eyebrow">ROLE-BASED WORKSPACE</span><h1>Work that moves forward.</h1><p className="sub-lead">See programs where the connected address is a funder or recipient. Current permissions always come from finalized contract state.</p><ProgramRegistry role="recipient"/><ProgramRegistry role="funder"/></main>;
}
