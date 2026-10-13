import Link from "next/link";
import { ArrowUpRight, Database, LockKeyhole } from "lucide-react";

type Props={ eyebrow:string; title:string; lead:string; task:string; cta?:{href:string;label:string} };
export function StarterPage({eyebrow,title,lead,task,cta}:Props){
return <main className="wrap subpage"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="sub-lead">{lead}</p>
<div className="sub-grid"><div className="glass-card placeholder-card"><div className="feature-icon"><Database size={22}/></div><h2>Canonical chain state</h2><p>The final contract has not been implemented or deployed in this handoff. This page shows no fabricated data. Codex will connect it to the generated ABI and public contract reads.</p><div className="pending-chip"><span className="pend-dot"/> Integration pending</div></div>
<div className="glass-card placeholder-card"><div className="feature-icon"><LockKeyhole size={22}/></div><h2>Production behavior to implement</h2><p>{task}</p>{cta&&<Link className="text-link" href={cta.href}>{cta.label} <ArrowUpRight size={16}/></Link>}</div></div>
</main>;
}
