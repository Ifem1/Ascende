"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import { listPrograms, readProgramHistory, ProgramRecord } from "@/lib/genlayer";

type Entry = { program: ProgramRecord; item: Record<string, unknown> };
export function ActivityFeed() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true); setError("");
    try {
      const programs = await listPrograms(50);
      const histories = await Promise.all(programs.map(async (program) => ({ program, history: await readProgramHistory(program.id) })));
      setEntries(histories.flatMap(({ program, history }) => history.map((item) => ({ program, item }))).sort((a,b) => Number(b.item.time ?? 0) - Number(a.item.time ?? 0)));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Canonical history read failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void Promise.resolve().then(refresh); }, []);
  return <section className="activity-panel"><div className="registry-toolbar"><h2>Contract-recorded activity</h2><button type="button" className="action secondary" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15}/>{loading ? "Loading" : "Refresh"}</button></div>
    {loading && <p className="registry-state">Reading finalized contract history…</p>}{error && <div className="glass-card form-alert" role="alert">{error}</div>}
    {!loading && !error && entries.length === 0 && <div className="glass-card registry-state"><strong>No activity records</strong><p>The contract returned no stored program history.</p></div>}
    {!loading && !error && entries.map(({ program, item }, index) => <Link className="glass-card activity-row" href={`/programs/${program.id}`} key={`${program.id}-${String(item.kind)}-${index}`}><Clock3 size={16}/><span><strong>{String(item.kind).replaceAll("_", " ")}</strong><small>{program.title} · stage {String(item.milestone ?? "—")}</small></span><time>{item.time ? new Date(Number(item.time)*1000).toLocaleString() : ""}</time></Link>)}
  </section>;
}
