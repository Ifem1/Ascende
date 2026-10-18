"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleDot, Clock3, RefreshCw } from "lucide-react";
import { Eip1193Provider, formatGen, prepareWrite, ProgramRecord, readProgram, readProgramAccounting, readProgramCapabilities, readProgramHistory, readRejectedPayableCredit, readTransaction, PreparedWrite, submitPreparedWrite } from "@/lib/genlayer";
import { getActiveProvider } from "@/lib/wallet-store";
import { recoveryActions } from "@/lib/capabilities";
import { parsePositiveGen, validateEvidenceManifest } from "@/lib/preflight";

type EvidenceItem = { url: string; sha256: string; byte_length: number };
type DecisionLineage = { id: number; kind: string; evidence_root?: string; previous_evidence_root?: string; result?: string; prior_result?: string; attempt?: number; challenger?: string; time: number; packet?: { findings: Array<{ criterion_index: number; finding: string; source_findings: Array<{ source_index: number; finding: string; byte_start: number; byte_end: number; quote: string }> }> } | null };
type ChallengeRecord = { challenger: string; manifest: EvidenceItem[]; root: string; prior_manifest: EvidenceItem[]; prior_manifest_root: string; prior_result: string; opened_at: number; resolution?: { result: string; flipped: boolean; bond_owner: string; bond_wei: string; time: number } | null };
type Milestone = { status: string; tranche_wei: string; deadline: number; terminal_reason?: string; terminal_time?: number; review_deadline?: number; criteria: string[]; authorities: Array<{ prefix: string; role: string; required: boolean }>; manifest: EvidenceItem[]; manifest_root: string; result: string; provisional_until: number; retry_after: number; challenge_used: boolean; challenge?: ChallengeRecord | null; decision_history?: DecisionLineage[] };
type Program = ProgramRecord & { policy: { challenge_bond_wei: string }; milestones: Milestone[]; operations: Array<{ id: string; status: string; purpose: string; destination: string; amount_wei: string; child_tx: string }> };
type Action = "accept_program" | "fund_program" | "expire_unaccepted_program" | "expire_unfunded_program" | "submit_evidence" | "evaluate_milestone" | "challenge_milestone" | "resolve_challenge" | "finalize_milestone" | "finalize_unresolved" | "expire_milestone" | "close_program" | "request_withdrawal" | "request_refund" | "request_bond_withdrawal" | "submit_payment";
type TransactionSnapshot = Awaited<ReturnType<typeof readTransaction>>;
const EXPLORER = "https://explorer-studio.genlayer.com";

export function ProgramDetail({ id }: { id: number }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [accounting, setAccounting] = useState<Record<string, string | number> | null>(null);
  const [capabilities, setCapabilities] = useState<Record<string, boolean> | null>(null);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [account, setAccount] = useState("");
  const [stage, setStage] = useState(0);
  const [evidenceInputs, setEvidenceInputs] = useState<Array<{ url: string; sha256: string; byteLength: string }>>([]);
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<Action | "">("");
  const [prepared, setPrepared] = useState<PreparedWrite | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hash, setHash] = useState("");
  const [lastTransactions, setLastTransactions] = useState<string[]>([]);
  const [transactionSnapshots, setTransactionSnapshots] = useState<Array<{ hash: string; snapshot?: TransactionSnapshot; error?: string }>>([]);
  const invalidatePrepared = useCallback(() => setPrepared(null), []);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [record, acct, events, caps] = await Promise.all([readProgram(id), readProgramAccounting(id), readProgramHistory(id), readProgramCapabilities(id, account)]);
      if (!record) throw new Error("Program ID not found in the configured contract.");
      setProgram(record as Program); setAccounting(acct); setHistory(events); setCapabilities(caps);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Contract read failed"); }
  }, [id, account]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(`ascende:program:${id}:tx`);
    if (saved) void Promise.resolve().then(() => setLastTransactions(saved.split(",").filter(Boolean)));
    const updateAccount = () => {
      const ethereum = getActiveProvider();
      if (!ethereum) { invalidatePrepared(); setAccount(""); return; }
      void ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        invalidatePrepared(); setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : "");
      }).catch(() => setAccount(""));
    };
    let ethereum = getActiveProvider();
    const changed = (accounts: unknown) => { invalidatePrepared(); setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : ""); };
    const changedChain = () => invalidatePrepared();
    const providerChanged = () => {
      ethereum?.removeListener?.("accountsChanged", changed);
      ethereum?.removeListener?.("chainChanged", changedChain);
      ethereum = getActiveProvider();
      ethereum?.on?.("accountsChanged", changed);
      ethereum?.on?.("chainChanged", changedChain);
      updateAccount();
    };
    ethereum?.on?.("accountsChanged", changed);
    ethereum?.on?.("chainChanged", changedChain);
    window.addEventListener("ascende:wallet-provider-changed", providerChanged);
    updateAccount();
    return () => { ethereum?.removeListener?.("accountsChanged", changed); ethereum?.removeListener?.("chainChanged", changedChain); window.removeEventListener("ascende:wallet-provider-changed", providerChanged); };
  }, [id, refresh, invalidatePrepared]);

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

  function updateEvidence(index: number, patch: Partial<{ url: string; sha256: string; byteLength: string }>) {
    setEvidenceInputs((current) => {
      const next = [...current];
      next[index] = { ...(next[index] ?? { url: "", sha256: "", byteLength: "" }), ...patch };
      return next;
    });
  }

  function requestFor(next: Action, operationId = "") {
    if (!program) throw new Error("Program data is not loaded.");
    if (next === "fund_program") return { functionName: next, args: [BigInt(id)], value: BigInt(program.budget_wei) };
    if (next === "accept_program" || next === "expire_unaccepted_program" || next === "expire_unfunded_program") return { functionName: next, args: [BigInt(id)] };
    if (next === "submit_evidence" || next === "challenge_milestone") {
      if (!current) throw new Error("Milestone data is not loaded.");
      const entry = validateEvidenceManifest(evidenceInputs, current.authorities);
      return { functionName: next, args: [BigInt(id), BigInt(stage), JSON.stringify(entry)], ...(next === "challenge_milestone" ? { value: BigInt(program.policy.challenge_bond_wei) } : {}) };
    }
    if (next === "evaluate_milestone" || next === "resolve_challenge" || next === "finalize_milestone" || next === "finalize_unresolved" || next === "expire_milestone") return { functionName: next, args: [BigInt(id), BigInt(stage)] };
    if (next === "close_program") return { functionName: next, args: [BigInt(id)] };
    if (next === "submit_payment") return { functionName: next, args: [BigInt(id), operationId] };
    if (next === "request_withdrawal" || next === "request_refund" || next === "request_bond_withdrawal") return { functionName: next, args: [BigInt(id), parsePositiveGen(amount).toString()] };
    throw new Error("Unsupported action");
  }

  async function prepare(next: Action, operationId?: string) {
    try {
      setBusy(true); setError(""); setPrepared(null);
      const provider = getActiveProvider() as Eip1193Provider | undefined;
      if (!provider) throw new Error("Connect an injected wallet before submitting a transaction.");
      const accounts = await provider.request({ method: "eth_accounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string") throw new Error("Connect a wallet account first.");
      const request = requestFor(next, operationId);
      if (next === "request_withdrawal" || next === "request_refund" || next === "request_bond_withdrawal") {
        const key = next === "request_withdrawal" ? "earned_claimable_wei" : next === "request_refund" ? "refund_claimable_wei" : role === "FUNDER" ? "bond_funder_claimable_wei" : "bond_recipient_claimable_wei";
        if (parsePositiveGen(amount) > BigInt(String(accounting?.[key] ?? 0))) throw new Error("Amount exceeds the claimable balance recorded by the contract.");
      }
      const result = await prepareWrite(accounts[0], provider, request);
      const [freshChain, freshAccounts] = await Promise.all([provider.request({ method: "eth_chainId" }), provider.request({ method: "eth_accounts" })]);
      if (getActiveProvider() !== provider || typeof freshChain !== "string" || BigInt(freshChain) !== 61999n || !Array.isArray(freshAccounts) || String(freshAccounts[0]).toLowerCase() !== String(accounts[0]).toLowerCase()) throw new Error("Wallet account or network changed during preparation; prepare again.");
      setPrepared(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not prepare this transaction."); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!prepared) return;
    try {
      setBusy(true); setError("");
      const result = await submitPreparedWrite(prepared, (tx) => {
        invalidatePrepared();
        setHash(tx); setLastTransactions((current) => { const next = [...current, tx]; localStorage.setItem(`ascende:program:${id}:tx`, next.join(",")); return next; });
      });
      if (!result.successful) throw new Error(`Transaction ${result.hash} finalized but its execution failed.`);
      if (action === "challenge_milestone") {
        const refreshed = await readProgram(id);
        const challenge = refreshed?.milestones[stage]?.challenge;
        if (!challenge || challenge.challenger.toLowerCase() !== prepared.account.toLowerCase()) {
          const credit = await readRejectedPayableCredit(prepared.account);
          setAction(""); setPrepared(null);
          setNotice(`The challenge transaction finalized, but no challenge was recorded. The contract records ${formatGen(credit.available_wei)} GEN as refundable credit for this wallet. Child transfer delivery is unverified. Transaction: ${result.hash}`);
          await refresh();
          return;
        }
        setNotice(`Challenge state verified on-chain · ${result.hash}`);
      } else {
        if (["accept_program", "fund_program", "expire_unaccepted_program", "expire_unfunded_program"].includes(action)) {
          const refreshed = await readProgram(id);
          const expected = action === "accept_program" ? "ACCEPTED_UNFUNDED" : action === "fund_program" ? "ACTIVE" : action === "expire_unaccepted_program" ? "CANCELED_UNACCEPTED" : "EXPIRED_UNFUNDED";
          if (refreshed?.status !== expected) {
            if (action === "fund_program") {
              const credit = await readRejectedPayableCredit(prepared.account);
              setNotice(`Programme activation was not recorded. The contract lists ${formatGen(credit.available_wei)} GEN as refundable credit for this wallet; transfer delivery is unverified. Check the original transaction before retrying · ${result.hash}`);
              setPrepared(null); setAction(""); await refresh(); return;
            }
            throw new Error(`Transaction ${result.hash} finalized, but the contract readback did not show ${expected}.`);
          }
        }
        setNotice(`Execution finalized · ${result.hash}`);
      }
      setPrepared(null); setAction("");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Transaction failed. Reconcile the original hash before retrying."); }
    finally { setBusy(false); }
  }
  const [notice, setNotice] = useState("");

  function eligibleActions(): Array<{ action: Action; label: string }> {
    if (!program || !current) return [];
    const actions: Array<{ action: Action; label: string }> = [];
    if (capabilities?.can_accept_program) actions.push({ action: "accept_program", label: "Accept frozen terms" });
    if (capabilities?.can_fund_program) actions.push({ action: "fund_program", label: `Fund and activate · ${formatGen(program.budget_wei)} GEN` });
    if (capabilities?.can_expire_unaccepted) actions.push({ action: "expire_unaccepted_program", label: "Expire unaccepted draft" });
    if (capabilities?.can_expire_unfunded) actions.push({ action: "expire_unfunded_program", label: "Expire unfunded programme" });
    const recovery = recoveryActions(current.status, capabilities as { can_expire: boolean; can_finalize_unresolved: boolean; can_close: boolean } | null);
    if (current.status === "OPEN" && role === "RECIPIENT" && capabilities?.can_submit_evidence) actions.push({ action: "submit_evidence", label: "Seal evidence" });
    if (recovery.expire) actions.push({ action: "expire_milestone", label: "Expire missed evidence deadline" });
    if (["EVIDENCE_SEALED", "RETRYABLE"].includes(current.status) && capabilities?.can_evaluate) actions.push({ action: "evaluate_milestone", label: current.status === "RETRYABLE" ? "Retry evaluation" : "Evaluate evidence" });
    if (current.status.startsWith("PROVISIONAL_") && capabilities?.can_challenge && !current.challenge_used) actions.push({ action: "challenge_milestone", label: "Challenge · bond required" });
    if (["CHALLENGED", "CHALLENGE_RETRYABLE"].includes(current.status) && capabilities?.can_resolve_challenge) actions.push({ action: "resolve_challenge", label: "Resolve challenge" });
    if (current.status.startsWith("PROVISIONAL_") && capabilities?.can_finalize) actions.push({ action: "finalize_milestone", label: "Finalize decision" });
    if (recovery.finalizeUnresolved) actions.push({ action: "finalize_unresolved", label: "Close unresolved review · return any locked bond" });
    if (recovery.close) actions.push({ action: "close_program", label: "Close program" });
    if (role === "RECIPIENT" && BigInt(String(accounting?.earned_claimable_wei ?? 0)) > 0n) actions.push({ action: "request_withdrawal", label: "Request earned withdrawal" });
    if (role === "FUNDER" && BigInt(String(accounting?.refund_claimable_wei ?? 0)) > 0n) actions.push({ action: "request_refund", label: "Request unused-fund refund" });
    if ((role === "FUNDER" && BigInt(String(accounting?.bond_funder_claimable_wei ?? 0)) > 0n) || (role === "RECIPIENT" && BigInt(String(accounting?.bond_recipient_claimable_wei ?? 0)) > 0n)) actions.push({ action: "request_bond_withdrawal", label: "Request challenge-bond withdrawal" });
    return actions;
  }

  if (error && !program) return <main className="wrap subpage"><Link className="text-link" href="/programs">← Programs</Link><h1>Program unavailable</h1><p className="sub-lead">{error}</p></main>;
  if (!program) return <main className="wrap subpage"><p className="registry-state">Loading finalized program state…</p></main>;
  return <main className="wrap subpage detail-page">
    {current?.terminal_reason && <p className="form-alert" role="status">Terminal state: {current.status.replaceAll("_", " ")} · {current.terminal_reason.replaceAll("_", " ")} · {current.terminal_time ? new Date(current.terminal_time * 1000).toLocaleString() : ""}</p>}
    <Link className="text-link" href="/programs">← All programs</Link><div className="detail-title"><div><span className="eyebrow">PROGRAM #{program.id} · {program.status.replaceAll("_", " ")}</span><h1>{program.title}</h1><p className="sub-lead">{program.purpose}</p><div className="detail-workflow-links"><Link className="text-link" href={`/programs/${program.id}/evidence`}>Milestone evidence</Link><Link className="text-link" href={`/programs/${program.id}/challenges`}>Challenges</Link></div></div><button className="action secondary" type="button" onClick={() => void refresh()}><RefreshCw size={15}/>Refresh chain state</button></div>
    <div className="detail-overview glass-card"><div><span className="overline">{program.funded_wei === "0" ? "PROPOSED BUDGET · NOT FUNDED" : "FUNDED BUDGET"}</span><strong>{formatGen(program.funded_wei === "0" ? program.budget_wei : program.funded_wei)} GEN</strong></div><div><span className="overline">FUNDER</span><code>{address}</code></div><div><span className="overline">YOUR ROLE</span><strong>{role || "PUBLIC"}</strong></div><div><span className="overline">RECIPIENT</span><code>{program.recipient.slice(0, 8)}…{program.recipient.slice(-6)}</code></div></div>
    {!["ACTIVE", "CLOSED_COMPLETE", "CLOSED_STOPPED"].includes(program.status) && <p className="tx-truth">Frozen terms expire {new Date(program.accept_deadline * 1000).toLocaleString()}. Creation holds no funds. Only the named recipient can accept; only the original funder can activate with the exact proposed amount.</p>}
    <div className="detail-layout"><section className="milestone-list"><span className="eyebrow">SEQUENTIAL PROGRESSION</span>{program.milestones.map((milestone, index) => <button type="button" key={index} disabled={busy} className="milestone-detail glass-card" data-active={stage === index} onClick={() => {setStage(index);invalidatePrepared();setAction("");setEvidenceInputs([]);}}><div className="milestone-marker">{milestone.status.startsWith("FINAL_QUALIFIED") ? <CheckCircle2 size={18}/> : <CircleDot size={18}/>}</div><div><span className="overline">STAGE {String(index + 1).padStart(2, "0")} · {milestone.status.replaceAll("_", " ")}</span><h2>{formatGen(milestone.tranche_wei)} GEN</h2><p>{milestone.criteria.join(" · ")}</p><small>Deadline {new Date(milestone.deadline * 1000).toLocaleString()}</small><div className="authority-list">{milestone.authorities.map((authority) => <code key={authority.prefix}>{authority.role}{authority.required ? " · REQUIRED" : ""} · {authority.prefix}</code>)}</div>{milestone.manifest_root && <small>Evidence root <code>{milestone.manifest_root}</code></small>}{milestone.result && <small>Validator classification <strong>{milestone.result}</strong></small>}{(milestone.challenge || (milestone.decision_history?.length ?? 0) > 0) && <div className="evidence-lineage"><small>Decision and challenge lineage · {milestone.decision_history?.length ?? 0} records</small>{milestone.challenge && <div><strong>Challenge evidence · {milestone.challenge.root}</strong><small>Prior decision: {milestone.challenge.prior_result} · prior evidence root: {milestone.challenge.prior_manifest_root}</small><small>Challenger: <code>{milestone.challenge.challenger}</code> · bond {formatGen(milestone.challenge.bond_wei ?? program.policy.challenge_bond_wei)} GEN</small>{milestone.challenge.resolution && <small>Resolution: {milestone.challenge.resolution.result} · flipped: {String(milestone.challenge.resolution.flipped)} · bond owner: <code>{milestone.challenge.resolution.bond_owner}</code></small>}<div className="authority-list">{[...milestone.challenge.prior_manifest.map((item) => ({ version: "SUBMISSION", item })), ...milestone.challenge.manifest.map((item) => ({ version: "CHALLENGE", item }))].map(({ version, item }) => <code key={`${version}-${item.url}`}>{version} · {item.url} · SHA-256 {item.sha256} · {item.byte_length} bytes</code>)}</div></div>}{milestone.decision_history?.map((decision) => <div key={decision.id}><small>#{decision.id} {decision.kind.replaceAll("_", " ")} · {decision.result ?? decision.prior_result ?? "—"} · evidence {decision.evidence_root ?? decision.previous_evidence_root ?? "—"} · {new Date(decision.time * 1000).toLocaleString()}</small>{decision.packet?.findings.map((finding) => <small key={finding.criterion_index}>Criterion {finding.criterion_index + 1}: {finding.finding} · {finding.source_findings.map((source) => `source #${source.source_index + 1} ${source.finding} · bytes ${source.byte_start}–${source.byte_end} · “${source.quote}”`).join(" / ")}</small>)}</div>)}</div>}</div></button>)}</section>
      <aside className="detail-side"><section className="glass-card action-card"><span className="eyebrow">AVAILABLE ACTIONS · {role}</span>{current && <>
        {(["submit_evidence", "challenge_milestone"] as const).includes(action as "submit_evidence" | "challenge_milestone") && <><div className="form-grid compact-form">{current.authorities.map((authority) => { const sourceIndex = current.authorities.indexOf(authority); const input = evidenceInputs[sourceIndex] ?? { url: "", sha256: "", byteLength: "" }; return <fieldset className="wide-field glass-card" key={authority.prefix}><legend>{authority.role} · {authority.required ? "REQUIRED" : "OPTIONAL"} source · {authority.prefix}</legend><label>Evidence URL<input value={input.url} disabled={busy} onChange={(event) => {updateEvidence(sourceIndex, { url: event.target.value });invalidatePrepared();}} /></label><label>SHA-256<input value={input.sha256} disabled={busy} onChange={(event) => {updateEvidence(sourceIndex, { sha256: event.target.value });invalidatePrepared();}} maxLength={64} /></label><label>Exact byte length<input inputMode="numeric" value={input.byteLength} disabled={busy} onChange={(event) => {updateEvidence(sourceIndex, { byteLength: event.target.value });invalidatePrepared();}} /></label></fieldset>; })}</div><p>Every required authority needs its own committed URL, exact byte length and SHA-256. Optional authorities may be included or left blank. A distinct hostname is useful source separation, but does not prove independent ownership.</p><button className="action secondary full-action" type="button" disabled={busy || !account} onClick={() => void prepare(action as Action)}>{busy ? "Validating…" : "Prepare Transaction"} <ArrowUpRight size={16}/></button></>}
        {(["request_withdrawal", "request_refund", "request_bond_withdrawal"] as const).includes(action as "request_withdrawal" | "request_refund" | "request_bond_withdrawal") && <><label>Amount (GEN)<input inputMode="decimal" value={amount} disabled={busy} onChange={(event) => {setAmount(event.target.value);invalidatePrepared();}} /></label><button className="action secondary full-action" type="button" disabled={busy || !account} onClick={() => void prepare(action as Action)}>{busy ? "Validating…" : "Prepare Transaction"} <ArrowUpRight size={16}/></button></>}
        {!(["submit_evidence", "challenge_milestone", "request_withdrawal", "request_refund", "request_bond_withdrawal"] as const).includes(action as "submit_evidence" | "challenge_milestone" | "request_withdrawal" | "request_refund" | "request_bond_withdrawal") && eligibleActions().map((item) => <button className="action primary full-action" key={item.action} disabled={busy || !account} type="button" onClick={() => {setPrepared(null);setError("");setNotice("");setHash("");setAction(item.action);if(item.action === "submit_evidence" || item.action === "challenge_milestone"){setEvidenceInputs([]);}else if(item.action === "request_withdrawal" || item.action === "request_refund" || item.action === "request_bond_withdrawal"){setAmount("");}else{void prepare(item.action);}}}>{item.label} <ArrowUpRight size={16}/></button>)}
        {program.operations.filter((operation) => operation.status === "AUTHORIZED").map((operation) => <button className="action secondary full-action" key={operation.id} disabled={busy || !account} type="button" onClick={() => {setPrepared(null);setError("");setNotice("");setHash("");setAction("submit_payment");void prepare("submit_payment", operation.id);}}>Submit authorized transfer #{operation.id} · {formatGen(operation.amount_wei)} GEN <ArrowUpRight size={16}/></button>)}
        {!eligibleActions().length && !action && <p>No action is available for this wallet and finalized state.</p>}
        {action === "challenge_milestone" && <small>Frozen challenge bond: {formatGen(program.policy.challenge_bond_wei)} GEN. Payable calls cannot be value-simulated by the pinned SDK. Expected validation rejections are recorded as sender-attributed refundable credit; confirm the finalized challenge state after signing. Unexpected VM failures may still leave value without a credit. Never retry an ambiguous transaction.</small>}
        {prepared && <div className="fee-panel"><strong>{prepared.simulated ? "Simulation passed · confirm transaction" : "Payable call not simulated · review carefully"}</strong><span>Contract call: {prepared.call.functionName}({prepared.call.args.map((argument) => String(argument)).join(", ")})</span><span>Payable value: {formatGen(prepared.call.value ?? 0n)} GEN</span><span>SDK preflight cannot simulate value or guarantee execution. Do not retry if the wallet result is ambiguous; reconcile the original hash.</span><button type="button" className="action primary full-action" disabled={busy} onClick={() => void submit()}>{busy ? "Waiting for finality…" : "Sign and submit"}</button></div>}
      </>}</section>
      <section className="glass-card treasury-card"><span className="eyebrow">TREASURY OBLIGATIONS</span>{accounting && Object.entries(accounting).filter(([key]) => key.endsWith("_wei")).map(([key, value]) => <div key={key}><span>{key.replaceAll("_wei", "").replaceAll("_", " ")}</span><strong>{formatGen(String(value))} GEN</strong></div>)}<p>Transfer submitted and delivery verified are separate states. A submitted child transfer remains pending until a contract-authenticated delivery status exists.</p></section>
      <section className="glass-card treasury-card"><span className="eyebrow">SETTLEMENT OPERATIONS</span>{program.operations.length === 0 ? <p>No payout or refund operation is authorized yet.</p> : program.operations.map((operation) => <div key={operation.id}><span>#{operation.id} · {operation.purpose.replaceAll("_", " ")} · {operation.status.replaceAll("_", " ")}</span><strong>{formatGen(operation.amount_wei)} GEN · {operation.destination.slice(0, 8)}…{operation.destination.slice(-6)}</strong>{operation.status !== "AUTHORIZED" && <small>Submitted once. Delivery remains unresolved in contract state; do not retry.</small>}{operation.child_tx && <a href={`${EXPLORER}/tx/${operation.child_tx}`} target="_blank" rel="noreferrer">Observed child receipt ↗</a>}</div>)}<p>Only AUTHORIZED operations can be submitted. Each is one-shot; the contract cannot authenticate or safely retry ambiguous child delivery.</p></section>
      </aside></div>
    {error && <div className="form-alert" role="alert">{error}</div>}{notice && <div className="form-success" role="status">{notice}</div>}{hash && <p className="tx-truth">Latest parent: <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a></p>}
    {transactionSnapshots.length > 0 && <section className="glass-card tx-list"><span className="eyebrow">PARENT AND TRIGGERED CHILD RECEIPTS · OBSERVATIONAL</span>{transactionSnapshots.map(({ hash: tx, snapshot, error: lookupError }) => <article key={tx}><div><Clock3 size={14}/><a href={`${EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer">Parent {tx}</a><span>{lookupError ?? `${String((snapshot?.receipt as { statusName?: string } | undefined)?.statusName ?? "UNKNOWN")} · ${snapshot?.successful ? "execution succeeded" : "execution result unverified or unsuccessful"}`}</span></div>{snapshot?.children.map((child) => <div className="child-transaction" key={String(child.hash)}><ArrowUpRight size={14}/><a href={`${EXPLORER}/tx/${String(child.hash)}`} target="_blank" rel="noreferrer">Child {String(child.hash)}</a><span>{String(child.status)} · {String(child.execution)}</span></div>)}{snapshot && snapshot.children.length === 0 && <p>No triggered child is visible yet. This is not evidence of recipient credit.</p>}</article>)}<p>Receipt status is not recipient balance proof. The contract does not mark a transfer delivered from these browser observations.</p></section>}
    <section className="glass-card tx-list"><span className="eyebrow">ON-CHAIN PROGRAM HISTORY</span>{history.length === 0 ? <p>No history records are stored yet.</p> : history.map((item, index) => <div key={`${String(item.kind)}-${index}`}><Clock3 size={14}/><span>{String(item.kind).replaceAll("_", " ")} · stage {String(item.milestone ?? "—")} · {item.result ? `result ${String(item.result)} · ` : ""}{item.purpose ? `purpose ${String(item.purpose)} · ` : ""}{item.amount_wei ? `${formatGen(String(item.amount_wei))} GEN · ` : ""}{item.evidence_root ? `evidence ${String(item.evidence_root)} · ` : ""}{item.bond_owner ? `bond owner ${String(item.bond_owner)} · ` : ""}{item.time ? new Date(Number(item.time) * 1000).toLocaleString() : ""}</span></div>)}</section>
  </main>;
}
