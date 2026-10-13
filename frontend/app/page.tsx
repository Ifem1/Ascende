import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, CircleDot, Layers3, LockKeyhole, ShieldCheck, MoveUpRight } from "lucide-react";
import { ProgramRegistry } from "@/components/program-registry";

export default function Home() {
  return <main>
    <section className="hero wrap">
      <div className="hero-copy">
        <div className="eyebrow"><CircleDot size={13}/> GENLAYER-NATIVE MILESTONE FUNDING</div>
        <h1>PROGRESS IS <span>EARNED.</span><br/>CAPITAL FOLLOWS <em>PROOF.</em></h1>
        <p>Fund meaningful work through frozen milestones. GenLayer validators independently assess the evidence; deterministic rules unlock what comes next.</p>
        <div className="hero-actions"><Link href="/create" className="action primary">Create a program <ArrowUpRight size={18}/></Link><Link href="/programs" className="action secondary">Explore programs <ArrowUpRight size={18}/></Link></div>
        <div className="hero-facts"><div><ShieldCheck size={18}/><span>Frozen acceptance rules</span></div><div><Layers3 size={18}/><span>Sequential milestones</span></div><div><LockKeyhole size={18}/><span>Deterministic capital</span></div></div>
      </div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-visual-orbit"/><Image src="/ascende-hero.png" width={1050} height={885} priority alt="" className="hero-art"/></div>
    </section>
    <section className="wrap section-divider">
      <div className="section-head"><div><span className="eyebrow">CAPITAL, WITH PROOF</span><h2>Built for earned progression.</h2></div><span className="section-aside">From commitment to final verified entitlement</span></div>
      <div className="feature-grid">
        <article className="glass-card"><div className="feature-icon"><Layers3 size={24}/></div><div className="overline">01 · DESIGN</div><h3>Freeze the mission.</h3><p>Commit the budget and acceptance criteria before the work begins. Milestone conditions cannot be rewritten halfway through.</p><Link href="/create" className="text-link">Build a funding program <MoveUpRight size={16}/></Link></article>
        <article className="glass-card"><div className="feature-icon"><ShieldCheck size={24}/></div><div className="overline">02 · VERIFY</div><h3>Evidence over assertions.</h3><p>Validators independently inspect authorized, hash-bound public evidence and reach consensus on the milestone&apos;s actual result.</p><Link href="/docs" className="text-link">Explore the protocol <MoveUpRight size={16}/></Link></article>
        <article className="glass-card"><div className="feature-icon"><ChartNoAxesCombined size={24}/></div><div className="overline">03 · UNLOCK</div><h3>Progress earns capital.</h3><p>Only finalized qualification vests the precommitted tranche and opens the next stage. Money movement remains independently auditable.</p><Link href="/my-work" className="text-link">My milestones <MoveUpRight size={16}/></Link></article>
      </div>
    </section>
      <section className="wrap section-divider contract-status"><ProgramRegistry/><div className="status-panel"><div><span className="eyebrow">PAYMENT TRANSPARENCY</span><h2>Finalized is not delivered.</h2><p>Ascende separates earned entitlements, one-time transfer authorization, submitted child transfers and verified delivery. The portal never labels a submitted transfer “Paid.”</p></div><div className="pending-chip"><span className="pend-dot"/> Studionet · 61999</div></div></section>
  </main>;
}
