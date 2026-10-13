"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Layers3, RotateCw } from "lucide-react";
import { listPrograms, ProgramRecord, formatGen } from "@/lib/genlayer";
import { getActiveProvider } from "@/lib/wallet-store";

export function ProgramRegistry({ role }: { role?: "funder" | "recipient" }) {
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const rows = await listPrograms();
      setPrograms(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Contract read failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(refresh);
    let provider = getActiveProvider();
    const changed = (accounts: unknown) => setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : "");
    const updateAccount = () => {
      provider = getActiveProvider();
      if (!provider) { setAccount(""); return; }
      void provider.request({ method: "eth_accounts" }).then((result) => changed(result)).catch(() => setAccount(""));
    };
    const providerChanged = () => {
      provider?.removeListener?.("accountsChanged", changed);
      provider = getActiveProvider();
      provider?.on?.("accountsChanged", changed);
      updateAccount();
    };
    provider?.on?.("accountsChanged", changed);
    window.addEventListener("ascende:wallet-provider-changed", providerChanged);
    updateAccount();
    return () => { provider?.removeListener?.("accountsChanged", changed); window.removeEventListener("ascende:wallet-provider-changed", providerChanged); };
  }, []);

  const visible = programs.filter((program) => !role || (role === "funder" ? program.funder === account : program.recipient === account));
  return <section className="registry-block" aria-live="polite">
    <div className="registry-toolbar"><div><span className="eyebrow">CANONICAL STUDIONET STATE</span><h2>{role ? "Your programs" : "Program registry"}</h2></div><button className="action secondary" type="button" onClick={() => void refresh()} disabled={loading}><RotateCw size={16}/>{loading ? "Loading" : "Refresh"}</button></div>
    {loading && <p className="registry-state">Reading finalized contract state…</p>}
    {!loading && error && <div className="glass-card registry-state"><strong>On-chain data unavailable</strong><p>{error}</p><p>Configure a verified Studionet deployment address to enable canonical reads.</p></div>}
    {!loading && !error && visible.length === 0 && <div className="glass-card registry-state"><Layers3 size={22}/><strong>{role && !account ? "Connect a wallet to filter your programs" : "No programs found"}</strong><p>{role && !account ? "Public program browsing works without a wallet." : "The registry returned no matching records."}</p>{role && !account && <Link className="text-link" href="/programs">Browse all programs <ArrowUpRight size={15}/></Link>}</div>}
    {!loading && !error && visible.length > 0 && <div className="program-grid">{visible.map((program) => <Link className="glass-card program-card" key={program.id} href={`/programs/${program.id}`}>
      <div className="program-card-top"><span className="overline">PROGRAM #{program.id}</span><span className="status-pill">{program.status.replaceAll("_", " ")}</span></div>
      <h3>{program.title}</h3><p>{program.purpose}</p>
      <div className="program-stats"><span>Budget<strong>{formatGen(program.funded_wei)} GEN</strong></span><span>Stages<strong>{program.milestones.length} milestones</strong></span></div>
      <div className="program-rail" aria-label={`${program.milestones.length} milestone statuses`}>{program.milestones.map((milestone, index) => <span key={`${program.id}-${index}`} data-status={milestone.status} title={`Stage ${index + 1}: ${milestone.status.replaceAll("_", " ")}`} />)}</div>
    </Link>)}</div>}
  </section>;
}
