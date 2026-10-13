"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { formatGen, parseGen, prepareWrite, submitPreparedWrite, PreparedWrite } from "@/lib/genlayer";
import { getActiveProvider } from "@/lib/wallet-store";

type Stage = { tranche: string; criteria: string; sourcePrefix: string };
const blankStage = (): Stage => ({ tranche: "", criteria: "", sourcePrefix: "" });

function buildMilestones(stages: Stage[], tranches: bigint[]) {
  const now = Math.floor(Date.now() / 1000);
  return stages.map((stage, index) => ({
    tranche_wei: tranches[index].toString(),
    deadline: now + (index + 1) * 14 * 24 * 60 * 60,
    criteria: [stage.criteria.trim()],
    authorities: [{ prefix: stage.sourcePrefix.trim(), role: "PRIMARY", required: true }],
  }));
}

export default function Create() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [stages, setStages] = useState<Stage[]>([blankStage(), blankStage()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState<PreparedWrite | null>(null);
  const [hash, setHash] = useState("");
  const [notice, setNotice] = useState("");

  const tranches = useMemo(() => stages.map((stage) => {
    try { return stage.tranche ? parseGen(stage.tranche) : 0n; }
    catch { return 0n; }
  }), [stages]);
  const total = tranches.reduce((sum, item) => sum + item, 0n);

  function updateStage(index: number, patch: Partial<Stage>) {
    setStages((current) => current.map((stage, i) => i === index ? { ...stage, ...patch } : stage));
  }

  function validateStep() {
    setError("");
    if (step === 0) {
      if (!title.trim() || !purpose.trim() || !/^0x[0-9a-fA-F]{40}$/.test(recipient)) throw new Error("Enter a program title, purpose, and valid recipient address.");
    }
    if (step === 1) {
      if (stages.length < 2 || stages.length > 5) throw new Error("Programs need 2–5 milestones.");
      for (const [index, stage] of stages.entries()) {
        if (parseGen(stage.tranche) <= 0n || stage.criteria.trim().length < 10) throw new Error(`Complete the tranche and acceptance clause for milestone ${index + 1}.`);
      }
    }
    if (step === 2) {
      for (const [index, stage] of stages.entries()) {
        if (!stage.sourcePrefix.startsWith("https://") || !stage.sourcePrefix.endsWith("/") || stage.sourcePrefix.includes("@")) throw new Error(`Milestone ${index + 1} needs a frozen HTTPS source path ending in /.`);
      }
    }
  }

  function next() {
    try { validateStep(); setStep((current) => Math.min(3, current + 1)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Check the form fields."); }
  }

  async function estimate() {
    try {
      setBusy(true); setError("");
      const provider = getActiveProvider();
      if (!provider) throw new Error("Connect an injected wallet before funding a program.");
      const chain = await provider.request({ method: "eth_chainId" });
      if (typeof chain !== "string" || BigInt(chain) !== 61999n) throw new Error("Switch the connected wallet to Studionet 61999 first.");
      validateStep();
      const milestones = buildMilestones(stages, tranches);
      const policy = { challenge_window: 7 * 24 * 60 * 60, retry_spacing: 60 * 60, retry_grace: 2 * 24 * 60 * 60, max_retries: 1, challenge_bond_wei: parseGen("0.01").toString() };
      const request = {
        functionName: "create_program",
        args: [recipient, title, purpose, JSON.stringify(milestones), JSON.stringify(policy)],
        value: total,
      };
      const accounts = await provider.request({ method: "eth_accounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string") throw new Error("Connect a wallet account before estimating fees.");
      const result = await prepareWrite(accounts[0], provider, request);
      setPrepared(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to prepare this transaction."); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!prepared) return;
    try {
      setBusy(true); setError("");
      const result = await submitPreparedWrite(prepared, setHash);
      if (!result.successful) throw new Error(`Transaction ${result.hash} finalized with an unsuccessful execution result.`);
      setNotice(`Program creation finalized successfully · ${result.hash}`);
      router.push("/programs");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Transaction failed. Check its original hash before taking another action."); }
    finally { setBusy(false); }
  }

  return <main className="wrap subpage builder-page">
    <span className="eyebrow">PROGRAM BUILDER · STEP {step + 1} OF 4</span><h1>Fund the next milestone.</h1><p className="sub-lead">Freeze the schedule, evidence authorities and acceptance rules before committing the full GEN budget.</p>
    <div className="wizard-steps" aria-label="Builder progress">{["Program", "Milestones", "Evidence", "Review"].map((label, index) => <div key={label} data-active={index === step} data-done={index < step}><span>{String(index + 1).padStart(2, "0")}</span>{label}</div>)}</div>
    <section className="glass-card wizard-card">
      {step === 0 && <div className="form-grid"><label>Program title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required /></label><label>Recipient EVM address<input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x…" spellCheck={false} required /></label><label className="wide-field">Purpose<textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={1000} rows={4} required /></label></div>}
      {step === 1 && <div className="stage-editor">{stages.map((stage, index) => <article className="stage-edit glass-card" key={index}><div className="program-card-top"><span className="overline">MILESTONE {String(index + 1).padStart(2, "0")}</span>{stages.length > 2 && <button className="icon-btn" type="button" onClick={() => setStages((current) => current.filter((_, i) => i !== index))} aria-label={`Remove milestone ${index + 1}`}><Trash2 size={16}/></button>}</div><div className="form-grid"><label>Frozen tranche (GEN)<input inputMode="decimal" value={stage.tranche} onChange={(e) => updateStage(index, { tranche: e.target.value })} placeholder="0.00" required /></label><label className="wide-field">Measurable acceptance clause<textarea value={stage.criteria} onChange={(e) => updateStage(index, { criteria: e.target.value })} rows={3} maxLength={1000} required /></label></div></article>)}{stages.length < 5 && <button className="action secondary" type="button" onClick={() => setStages((current) => [...current, blankStage()])}><Plus size={16}/>Add milestone</button>}<p className="calc-line">Total program budget <strong>{formatGen(total)} GEN</strong></p></div>}
      {step === 2 && <div className="stage-editor">{stages.map((stage, index) => <label key={index}>Milestone {index + 1} authorized HTTPS path prefix<input value={stage.sourcePrefix} onChange={(e) => updateStage(index, { sourcePrefix: e.target.value })} placeholder="https://example.org/project/" spellCheck={false} required /><small>Use a stable, public, immutable evidence path. Each authority is frozen at funding.</small></label>)}</div>}
      {step === 3 && <div className="review-grid"><div><span className="overline">FROZEN PROGRAM</span><h2>{title || "Untitled program"}</h2><p>{purpose}</p><p>Recipient <code>{recipient}</code></p></div><div className="review-budget"><span>Total payable budget</span><strong>{formatGen(total)} GEN</strong><span>{stages.length} sequential tranches</span>{stages.map((stage, index) => <div key={index}>Stage {index + 1}<strong>{stage.tranche || "0"} GEN</strong></div>)}</div><p className="wide-field tx-truth">Program creation funds the full budget. Later, each withdrawal is authorized once and submitted as a separate native child transfer. The contract cannot authenticate child delivery, so submitted transfers remain pending. If the wallet times out, reconcile the original transaction hash before trying again.</p>{prepared && <div className="fee-panel wide-field"><strong>Transaction review</strong><span>Escrow value: {formatGen(total)} GEN</span><span>The wallet shows the network fee before approval.</span></div>}</div>}
      {error && <div className="form-alert" role="alert">{error}</div>}{hash && <p className="tx-truth">Submitted transaction: <a href={`${"https://explorer-studio.genlayer.com"}/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a></p>}{notice && <div className="form-success" role="status">{notice}</div>}
      <div className="wizard-actions">{step > 0 && <button className="action secondary" type="button" onClick={() => {setStep((current) => current - 1);setPrepared(null);}} disabled={busy}><ArrowLeft size={16}/>Back</button>}{step < 3 ? <button className="action primary" type="button" onClick={next}>Continue <ArrowRight size={16}/></button> : !prepared ? <button className="action primary" type="button" onClick={() => void estimate()} disabled={busy}>{busy ? "Preparing…" : "Prepare transaction"}</button> : <button className="action primary" type="button" onClick={() => void submit()} disabled={busy}>{busy ? "Waiting for finality…" : "Sign and fund program"}</button>}</div>
    </section>
  </main>;
}
