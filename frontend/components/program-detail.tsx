"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleDot, Clock3, RefreshCw } from "lucide-react";
import { Eip1193Provider, formatGen, parseGen, prepareWrite, ProgramRecord, readProgram, readProgramAccounting, readProgramHistory, readTransaction, PreparedWrite, submitPreparedWrite } from "@/lib/genlayer";
import { getActiveProvider } from "@/lib/wallet-store";

type EvidenceItem = { url: string; sha256: string; byte_length: number };
type DecisionLineage = { id: number; kind: string; evidence_root?: string; previous_evidence_root?: string; result?: string; prior_result?: string; attempt?: number; challenger?: string; time: number };
type ChallengeRecord = { challenger: string; manifest: EvidenceItem[]; root: string; prior_manifest: EvidenceItem[]; prior_manifest_root: string; prior_result: string; opened_at: number; resolution?: { result: string; flipped: boolean; bond_owner: string; bond_wei: string; time: number } | null };
type Milestone = { status: string; tranche_wei: string; deadline: number; criteria: string[]; authorities: Array<{ prefix: string; role: string; required: boolean }>; manifest: EvidenceItem[]; manifest_root: string; result: string; provisional_until: number; retry_after: number; challenge_used: boolean; challenge?: ChallengeRecord | null; decision_history?: DecisionLineage[] };
type Program = ProgramRecord & { policy: { challenge_bond_wei: string }; milestones: Milestone[]; operations: Array<{ id: string; status: string; purpose: string; destination: string; amount_wei: string; child_tx: string }> };
type Action = "submit_evidence" | "evaluate_milestone" | "challenge_milestone" | "resolve_challenge" | "finalize_milestone" | "finalize_unresolved" | "close_program" | "request_withdrawal" | "request_refund" | "request_bond_withdrawal" | "submit_payment";
type TransactionSnapshot = Awaited<ReturnType<typeof readTransaction>>;
const EXPLORER = "https://explorer-studio.genlayer.com";

export function ProgramDetail({ id }: { id: number }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [accounting, setAccounting] = useState<Record<string, string | number> | null>(null);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [account, setAccount] = useState("");
  const [stage, setStage] = useState(0);
  const [url, setUrl] = useState("");
  const [digest, setDigest] = useState("");
  const [byteLength, setByteLength] = useState("");
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<Action | "">("");
  const [prepared, setPrepared] = useState<PreparedWrite | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hash, setHash] = useState("");
  const [lastTransactions, setLastTransactions] = useState<string[]>([]);
  const [transactionSnapshots, setTransactionSnapshots] = useState<Array<{ hash: string; snapshot?: TransactionSnapshot; error?: string }>>([]);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [record, acct, events] = await Promise.all([readProgram(id), readProgramAccounting(id), readProgramHistory(id)]);
      if (!record) throw new Error("Program ID not found in the configured contract.");
      setProgram(record as Program); setAccounting(acct); setHistory(events);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Contract read failed"); }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`ascende:program:${id}:tx`);
    if (saved) void Promise.resolve().then(() => setLastTransactions(saved.split(",").filter(Boolean)));
    const updateAccount = () => {
      const ethereum = getActiveProvider();
      if (!ethereum) { setAccount(""); return; }
      void ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : "");
      }).catch(() => setAccount(""));
    };
    let ethereum = getActiveProvider();
    const changed = (accounts: unknown) => setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : "");
    const providerChanged = () => {
      ethereum?.removeListener?.("accountsChanged", changed);
      ethereum = getActiveProvider();
      ethereum?.on?.("accountsChanged", changed);
      updateAccount();
    };
    ethereum?.on?.("accountsChanged", changed);
    window.addEventListener("ascende:wallet-provider-changed", providerChanged);
    updateAccount();
    return () => { ethereum?.removeListener?.("accountsChanged", changed); window.removeEventListener("ascende:wallet-provider-changed", providerChanged); };
  }, [id, refresh]);

  useEffect(() => {
    let live = true;
    void Promise.all(lastTransactions.map(async (tx) => {
      try { return { hash: tx, snapshot: await readTransaction(tx as `0x${string}`) }; }
      catch (cause) { return { hash: tx, error: cause instanceof Error ? cause.message : "Transaction lookup unavailable" }; }
    })).then((snapshots) => { if (live) setTransactionSnapshots(snapshots); });
    return () => { live = false; };
  }, [lastTransactions]);

  const current = program?.milestones[stage];
  const role = !program ? "" : account === program.recipient ? "RECIPIENT" : account === program.funder ? "FUNDER" : "PUBLIC";
  const address = program?.funder ? `${program.funder.slice(0, 8)}…${program.funder.slice(-6)}` : "";

  function requestFor(next: Action, operationId = "") {
    if (!program) throw new Error("Program data is not loaded.");
    if (next === "submit_evidence" || next === "challenge_milestone") {
      const entry = [{ url, sha256: digest, byte_length: Number(byteLength) }];
      return { functionName: next, args: [BigInt(id), BigInt(stage), JSON.stringify(entry)], ...(next === "challenge_milestone" ? { value: BigInt(program.policy.challenge_bond_wei) } : {}) };
    }
    if (next === "evaluate_milestone" || next === "resolve_challenge" || next === "finalize_milestone" || next === "finalize_unresolved") return { functionName: next, args: [BigInt(id), BigInt(stage)] };
    if (next === "close_program") return { functionName: next, args: [BigInt(id)] };
    if (next === "submit_payment") return { functionName: next, args: [BigInt(id), operationId] };
    if (next === "request_withdrawal" || next === "request_refund" || next === "request_bond_withdrawal") return { functionName: next, args: [BigInt(id), parseGen(amount).toString()] };
    throw new Error("Unsupported action");
  }

  async function prepare(next: Action, operationId?: string) {
    try {
      setBusy(true); setError(""); setAction(next);
      const provider = getActiveProvider() as Eip1193Provider | undefined;
      if (!provider) throw new Error("Connect an injected wallet before submitting a transaction.");
      const accounts = await provider.request({ method: "eth_accounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string") throw new Error("Connect a wallet account first.");
      const request = requestFor(next, operationId);
      setPrepared(await prepareWrite(accounts[0], provider, request));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not prepare this transaction."); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!prepared) return;
    try {
      setBusy(true); setError("");
      const result = await submitPreparedWrite(prepared, (tx) => {
        setHash(tx); setLastTransactions((current) => { const next = [...current, tx]; localStorage.setItem(`ascende:program:${id}:tx`, next.join(",")); return next; });
      });
      if (!result.successful) throw new Error(`Transaction ${result.hash} finalized but its execution failed.`);
      setPrepared(null); setAction(""); setNotice(`Execution succeeded: ${result.hash}`);
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Transaction failed. Reconcile the original hash before retrying."); }
    finally { setBusy(false); }
  }
  const [notice, setNotice] = useState("");

  function eligibleActions(): Array<{ action: Action; label: string }> {
    if (!program || !current) return [];
    const actions: Array<{ action: Action; label: string }> = [];
    if (current.status === "OPEN" && role === "RECIPIENT") actions.push({ action: "submit_evidence", label: "Seal evidence" });
    if (["EVIDENCE_SEALED", "RETRYABLE"].includes(current.status)) actions.push({ action: "evaluate_milestone", label: current.status === "RETRYABLE" ? "Retry evaluation" : "Evaluate evidence" });
    if (current.status.startsWith("PROVISIONAL_") && role !== "PUBLIC" && !current.challenge_used) actions.push({ action: "challenge_milestone", label: "Challenge · bond required" });
    if (current.status === "CHALLENGED") actions.push({ action: "resolve_challenge", label: "Resolve challenge" });
    if (current.status.startsWith("PROVISIONAL_")) actions.push({ action: "finalize_milestone", label: "Finalize decision" });
    if (current.status === "RETRYABLE") actions.push({ action: "finalize_unresolved", label: "Finalize unresolved (after retry window)" });
    if (program.status === "ACTIVE" && (program.milestones.some((milestone) => ["FINAL_NOT_QUALIFIED", "FINAL_UNRESOLVED"].includes(milestone.status)) || program.milestones.every((milestone) => milestone.status === "FINAL_QUALIFIED"))) actions.push({ action: "close_program", label: "Close program" });
    if (role === "RECIPIENT" && BigInt(String(accounting?.earned_claimable_wei ?? 0)) > 0n) actions.push({ action: "request_withdrawal", label: "Request earned withdrawal" });
    if (role === "FUNDER" && BigInt(String(accounting?.refund_claimable_wei ?? 0)) > 0n) actions.push({ action: "request_refund", label: "Request unused-fund refund" });
    if ((role === "FUNDER" && BigInt(String(accounting?.bond_funder_claimable_wei ?? 0)) > 0n) || (role === "RECIPIENT" && BigInt(String(accounting?.bond_recipient_claimable_wei ?? 0)) > 0n)) actions.push({ action: "request_bond_withdrawal", label: "Request challenge-bond withdrawal" });
    return actions;
  }

  if (error && !program) return <main className="wrap subpage"><Link className="text-link" href="/programs">← Programs</Link><h1>Program unavailable</h1><p className="sub-lead">{error}</p></main>;
  if (!program) return <main className="wrap subpage"><p className="registry-state">Loading finalized program state…</p></main>;
  return <main className="wrap subpage detail-page">
    <Link className="text-link" href="/programs">← All programs</Link><div className="detail-title"><div><span className="eyebrow">PROGRAM #{program.id} · {program.status.replaceAll("_", " ")}</span><h1>{program.title}</h1><p className="sub-lead">{program.purpose}</p><div className="detail-workflow-links"><Link className="text-link" href={`/programs/${program.id}/evidence`}>Milestone evidence</Link><Link className="text-link" href={`/programs/${program.id}/challenges`}>Challenges</Link></div></div><button className="action secondary" type="button" onClick={() => void refresh()}><RefreshCw size={15}/>Refresh chain state</button></div>
    <div className="detail-overview glass-card"><div><span className="overline">COMMITTED BUDGET</span><strong>{formatGen(program.funded_wei)} GEN</strong></div><div><span className="overline">FUNDER</span><code>{address}</code></div><div><span className="overline">YOUR ROLE</span><strong>{role || "PUBLIC"}</strong></div><div><span className="overline">RECIPIENT</span><code>{program.recipient.slice(0, 8)}…{program.recipient.slice(-6)}</code></div></div>
    <div className="detail-layout"><section className="milestone-list"><span className="eyebrow">SEQUENTIAL PROGRESSION</span>{program.milestones.map((milestone, index) => <button type="button" key={index} className="milestone-detail glass-card" data-active={stage === index} onClick={() => {setStage(index);setPrepared(null);setAction("");}}><div className="milestone-marker">{milestone.status.startsWith("FINAL_QUALIFIED") ? <CheckCircle2 size={18}/> : <CircleDot size={18}/>}</div><div><span className="overline">STAGE {String(index + 1).padStart(2, "0")} · {milestone.status.replaceAll("_", " ")}</span><h2>{formatGen(milestone.tranche_wei)} GEN</h2><p>{milestone.criteria.join(" · ")}</p><small>Deadline {new Date(milestone.deadline * 1000).toLocaleString()}</small><div className="authority-list">{milestone.authorities.map((authority) => <code key={authority.prefix}>{authority.role}{authority.required ? " · REQUIRED" : ""} · {authority.prefix}</code>)}</div>{milestone.manifest_root && <small>Evidence root <code>{milestone.manifest_root}</code></small>}{milestone.result && <small>Validator classification <strong>{milestone.result}</strong></small>}{(milestone.challenge || (milestone.decision_history?.length ?? 0) > 0) && <div className="evidence-lineage"><small>Decision and challenge lineage · {milestone.decision_history?.length ?? 0} records</small>{milestone.challenge && <div><strong>Challenge evidence · {milestone.challenge.root}</strong><small>Prior decision: {milestone.challenge.prior_result} · prior evidence root: {milestone.challenge.prior_manifest_root}</small><small>Challenger: <code>{milestone.challenge.challenger}</code> · bond {formatGen(milestone.challenge.bond_wei ?? program.policy.challenge_bond_wei)} GEN</small>{milestone.challenge.resolution && <small>Resolution: {milestone.challenge.resolution.result} · flipped: {String(milestone.challenge.resolution.flipped)} · bond owner: <code>{milestone.challenge.resolution.bond_owner}</code></small>}<div className="authority-list">{[...milestone.challenge.prior_manifest.map((item) => ({ version: "SUBMISSION", item })), ...milestone.challenge.manifest.map((item) => ({ version: "CHALLENGE", item }))].map(({ version, item }) => <code key={`${version}-${item.url}`}>{version} · {item.url} · SHA-256 {item.sha256} · {item.byte_length} bytes</code>)}</div></div>}{milestone.decision_history?.map((decision) => <small key={decision.id}>#{decision.id} {decision.kind.replaceAll("_", " ")} · {decision.result ?? decision.prior_result ?? "—"} · evidence {decision.evidence_root ?? decision.previous_evidence_root ?? "—"} · {new Date(decision.time * 1000).toLocaleString()}</small>)}</div>}</div></button>)}</section>
      <aside className="detail-side"><section className="glass-card action-card"><span className="eyebrow">AVAILABLE ACTIONS · {role}</span>{current && <>
        {(["submit_evidence", "challenge_milestone"] as const).includes(action as "submit_evidence" | "challenge_milestone") && <div className="form-grid compact-form"><label className="wide-field">Authorized evidence URL<input value={url} onChange={(event) => setUrl(event.target.value)} /></label><label>SHA-256<input value={digest} onChange={(event) => setDigest(event.target.value)} maxLength={64} /></label><label>Exact byte length<input inputMode="numeric" value={byteLength} onChange={(event) => setByteLength(event.target.value)} /></label></div>}
        {(["request_withdrawal", "request_refund", "request_bond_withdrawal"] as const).includes(action as "request_withdrawal" | "request_refund" | "request_bond_withdrawal") && <label>Amount (GEN)<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>}
        {eligibleActions().map((item) => <button className="action primary full-action" key={item.action} disabled={busy || !account} type="button" onClick={() => void prepare(item.action)}>{item.label} <ArrowUpRight size={16}/></button>)}
        {program.operations.filter((operation) => operation.status === "AUTHORIZED").map((operation) => <button className="action secondary full-action" key={operation.id} disabled={busy || !account} type="button" onClick={() => void prepare("submit_payment", operation.id)}>Submit authorized transfer #{operation.id} · {formatGen(operation.amount_wei)} GEN <ArrowUpRight size={16}/></button>)}
        {!eligibleActions().length && <p>No action is available for this wallet and finalized state.</p>}
        {action === "challenge_milestone" && <small>Frozen challenge bond: {formatGen(program.policy.challenge_bond_wei)} GEN.</small>}
        {prepared && <div className="fee-panel"><strong>{prepared.simulated ? "Simulation passed · confirm transaction" : "Confirm payable transaction"}</strong><span>Payable value: {formatGen(prepared.call.value ?? 0n)} GEN</span><span>Your wallet shows the network fee before you approve.</span><button type="button" className="action primary full-action" disabled={busy} onClick={() => void submit()}>{busy ? "Waiting for finality…" : "Sign and submit"}</button></div>}
      </>}</section>
      <section className="glass-card treasury-card"><span className="eyebrow">TREASURY OBLIGATIONS</span>{accounting && Object.entries(accounting).filter(([key]) => key.endsWith("_wei")).map(([key, value]) => <div key={key}><span>{key.replaceAll("_wei", "").replaceAll("_", " ")}</span><strong>{formatGen(String(value))} GEN</strong></div>)}<p>Transfer submitted and delivery verified are separate states. A submitted child transfer remains pending until a contract-authenticated delivery status exists.</p></section>
      </aside></div>
    {error && <div className="form-alert" role="alert">{error}</div>}{notice && <div className="form-success" role="status">{notice}</div>}{hash && <p className="tx-truth">Latest parent: <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a></p>}
    {transactionSnapshots.length > 0 && <section className="glass-card tx-list"><span className="eyebrow">PARENT AND TRIGGERED CHILD RECEIPTS · OBSERVATIONAL</span>{transactionSnapshots.map(({ hash: tx, snapshot, error: lookupError }) => <article key={tx}><div><Clock3 size={14}/><a href={`${EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer">Parent {tx}</a><span>{lookupError ?? `${String((snapshot?.receipt as { statusName?: string } | undefined)?.statusName ?? "UNKNOWN")} · ${snapshot?.successful ? "execution succeeded" : "execution result unverified or unsuccessful"}`}</span></div>{snapshot?.children.map((child) => <div className="child-transaction" key={String(child.hash)}><ArrowUpRight size={14}/><a href={`${EXPLORER}/tx/${String(child.hash)}`} target="_blank" rel="noreferrer">Child {String(child.hash)}</a><span>{String(child.status)} · {String(child.execution)}</span></div>)}{snapshot && snapshot.children.length === 0 && <p>No triggered child is visible yet. This is not evidence of recipient credit.</p>}</article>)}<p>Receipt status is not recipient balance proof. The contract does not mark a transfer delivered from these browser observations.</p></section>}
    <section className="glass-card tx-list"><span className="eyebrow">ON-CHAIN PROGRAM HISTORY</span>{history.length === 0 ? <p>No history records are stored yet.</p> : history.map((item, index) => <div key={`${String(item.kind)}-${index}`}><Clock3 size={14}/><span>{String(item.kind).replaceAll("_", " ")} · stage {String(item.milestone ?? "—")} · {item.result ? `result ${String(item.result)} · ` : ""}{item.purpose ? `purpose ${String(item.purpose)} · ` : ""}{item.amount_wei ? `${formatGen(String(item.amount_wei))} GEN · ` : ""}{item.evidence_root ? `evidence ${String(item.evidence_root)} · ` : ""}{item.bond_owner ? `bond owner ${String(item.bond_owner)} · ` : ""}{item.time ? new Date(Number(item.time) * 1000).toLocaleString() : ""}</span></div>)}</section>
  </main>;
}
