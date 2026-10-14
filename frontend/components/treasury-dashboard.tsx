"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { formatGen, listPrograms, ProgramRecord, readProgramAccounting, readProgramOperations, readProtocolAccounting } from "@/lib/genlayer";
import { RejectedPayableCreditPanel } from "@/components/rejected-payable-credit";

type Row = { program: ProgramRecord; accounting: Record<string, string | number>; operations: Array<Record<string, unknown>> };
const buckets = [
  ["locked_wei", "Locked principal", "Unearned milestone tranches remain restricted by sequence."],
  ["earned_claimable_wei", "Earned entitlement", "Finalized qualification credits reserved for the recipient."],
  ["recipient_authorized_wei", "Recipient transfer authorized", "Entitlement reserved for an immutable recipient transfer operation."],
  ["refund_claimable_wei", "Refund entitlement", "Unused principal available to the funder after terminal closure."],
  ["funder_authorized_wei", "Refund transfer authorized", "Refund reserved for an immutable funder transfer operation."],
  ["recipient_pending_wei", "Recipient transfer pending", "Submitted operations remain unresolved until authenticated delivery evidence exists."],
  ["funder_pending_wei", "Funder refund pending", "Submitted refund operations are not counted as delivered."],
  ["funder_refunded_wei", "Funder refund recorded", "Contract-confirmed refund only."],
  ["recipient_delivered_wei", "Recipient delivery recorded", "Contract-confirmed delivery only; browser observations do not increase this amount."],
  ["bond_received_wei", "Challenge bonds received", "Bonds are kept separate from program principal."],
  ["bond_locked_wei", "Challenge bonds locked", "Challenge bond held for an active review."],
  ["bond_funder_claimable_wei", "Funder bond entitlement", "Bond allocated to the funder under frozen challenge rules."],
  ["bond_recipient_claimable_wei", "Recipient bond entitlement", "Bond allocated to the recipient under frozen challenge rules."],
  ["bond_authorized_wei", "Bond transfer authorized", "Bond entitlement reserved for an immutable operation."],
  ["bond_pending_wei", "Bond transfer pending", "Submitted bond operations are not counted as delivered."],
  ["bond_delivered_wei", "Bond delivery recorded", "Contract-confirmed bond delivery only."],
] as const;

export function TreasuryDashboard() {
  const [total, setTotal] = useState<Record<string, string> | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [accounting, programs] = await Promise.all([readProtocolAccounting(), listPrograms(50)]);
      const details = await Promise.all(programs.map(async (program) => {
        const [programAccounting, operations] = await Promise.all([readProgramAccounting(program.id), readProgramOperations(program.id)]);
        return { program, accounting: programAccounting, operations };
      }));
      setTotal(accounting); setRows(details);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Canonical treasury read failed");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  return <section className="treasury-dashboard" aria-live="polite">
    <RejectedPayableCreditPanel/>
    <div className="registry-toolbar"><div><span className="eyebrow">CANONICAL CONTRACT ACCOUNTING</span><h2>Protocol treasury</h2></div><button className="action secondary" type="button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15}/>{loading ? "Reading chain" : "Refresh"}</button></div>
    {loading && <p className="registry-state">Reading the protocol ledger from the configured Studionet contract…</p>}
    {error && <div className="glass-card form-alert" role="alert"><strong>Treasury read unavailable</strong><p>{error}</p><p>Ascende displays no cached or estimated balances when canonical state cannot be read.</p></div>}
    {!loading && !error && total && <>
      <div className="treasury-buckets">{buckets.map(([key, label, help]) => <article className="glass-card treasury-bucket" key={key}><span className="overline">{label}</span><strong>{formatGen(total[key] ?? "0")} GEN</strong><p>{help}</p></article>)}</div>
      <div className="treasury-programs"><div className="section-head"><div><span className="eyebrow">PROGRAM LEDGERS</span><h2>Obligations by program</h2></div><Link href="/activity" className="text-link">Transaction history <ArrowUpRight size={15}/></Link></div>
        {rows.length === 0 ? <div className="glass-card registry-state"><strong>No program ledgers</strong><p>The configured contract returned no programs.</p></div> : rows.map(({ program, accounting, operations }) => {
          const unresolved = operations.filter((operation) => ["TRANSFER_SUBMITTED", "DELIVERY_UNRESOLVED"].includes(String(operation.status)));
          return <article className="glass-card treasury-program" key={program.id}>
            <div className="treasury-program-head"><div><span className="overline">PROGRAM #{program.id} · {program.status.replaceAll("_", " ")}</span><h3>{program.title}</h3></div><Link className="text-link" href={`/programs/${program.id}`}>Open program <ArrowUpRight size={15}/></Link></div>
            <div className="treasury-program-stats"><span>Funded<strong>{formatGen(String(accounting.funded_wei ?? "0"))} GEN</strong></span><span>Locked<strong>{formatGen(String(accounting.locked_wei ?? "0"))} GEN</strong></span><span>Earned claimable<strong>{formatGen(String(accounting.earned_claimable_wei ?? "0"))} GEN</strong></span><span>Operations unresolved<strong>{unresolved.length}</strong></span></div>
            {unresolved.length > 0 && <div className="treasury-operations"><span className="overline">UNRESOLVED DELIVERY · NO AUTOMATIC RETRY</span>{unresolved.map((operation) => <p key={String(operation.id)}>Operation {String(operation.id)} · {String(operation.status)} · {formatGen(String(operation.amount_wei ?? "0"))} GEN · <code>{String(operation.destination ?? "")}</code></p>)}</div>}
          </article>;
        })}
      </div>
      <p className="treasury-caveat">These values are on-chain obligation buckets. A transfer submission or finalized parent transaction does not establish that an EOA received GEN. The contract currently has no authenticated child-delivery reconciliation method.</p>
    </>}
  </section>;
}
