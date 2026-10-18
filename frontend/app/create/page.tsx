"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { formatGen, matchesCreatedProgram, parseGen, prepareWrite, readProgram, readProgramCounter, submissionErrorMessage, submitPreparedWrite, PreparedWrite } from "@/lib/genlayer";
import { getActiveProvider } from "@/lib/wallet-store";
import { validateCreationPreflight } from "@/lib/preflight";

type AuthorityRole = "PRIMARY" | "CORROBORATING" | "OFFICIAL";
type StageAuthority = { prefix: string; role: AuthorityRole; required: boolean };
type Stage = { tranche: string; criteria: string[]; authorities: StageAuthority[] };
type FrozenMilestone = { tranche_wei: string; deadline: number; criteria: string[]; authorities: StageAuthority[] };
const PROGRAM_POLICY = {
  acceptance_window: 7 * 24 * 60 * 60,
  challenge_window: 7 * 24 * 60 * 60,
  retry_spacing: 60 * 60,
  retry_grace: 2 * 24 * 60 * 60,
  max_retries: 1,
  challenge_bond_wei: parseGen("0.01").toString(),
};
const blankStage = (): Stage => ({ tranche: "", criteria: [""], authorities: [
  { prefix: "", role: "PRIMARY", required: true },
  { prefix: "", role: "CORROBORATING", required: true },
] });

function buildMilestones(stages: Stage[], tranches: bigint[], now = Math.floor(Date.now() / 1000)): FrozenMilestone[] {
  return stages.map((stage, index) => ({
    tranche_wei: tranches[index].toString(),
    deadline: now + (index + 1) * 14 * 24 * 60 * 60,
    criteria: stage.criteria.map((criterion) => criterion.trim()),
    authorities: stage.authorities.map((authority) => ({ ...authority, prefix: authority.prefix.trim() })),
  }));
}

export default function Create() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [stages, setStages] = useState<Stage[]>([blankStage(), blankStage()]);
  const [reviewMilestones, setReviewMilestones] = useState<FrozenMilestone[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState<PreparedWrite | null>(null);
  const [hash, setHash] = useState("");
  const [notice, setNotice] = useState("");
  const [counterBefore, setCounterBefore] = useState<bigint | null>(null);

  const invalidatePrepared = useCallback(() => setPrepared(null), []);

  useEffect(() => {
    let provider = getActiveProvider();
    const invalidate = () => invalidatePrepared();
    const reconnect = () => {
      provider?.removeListener?.("accountsChanged", invalidate);
      provider?.removeListener?.("chainChanged", invalidate);
      provider = getActiveProvider();
      provider?.on?.("accountsChanged", invalidate);
      provider?.on?.("chainChanged", invalidate);
      invalidate();
    };
    provider?.on?.("accountsChanged", invalidate);
    provider?.on?.("chainChanged", invalidate);
    window.addEventListener("ascende:wallet-provider-changed", reconnect);
    return () => {
      provider?.removeListener?.("accountsChanged", invalidate);
      provider?.removeListener?.("chainChanged", invalidate);
      window.removeEventListener("ascende:wallet-provider-changed", reconnect);
    };
  }, [invalidatePrepared]);

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
      if (!title.trim() || title.trim().length > 120 || !purpose.trim() || purpose.trim().length > 1000 || !/^0x[0-9a-fA-F]{40}$/.test(recipient) || /^0x0{40}$/i.test(recipient)) throw new Error("Enter a program title, purpose, and valid nonzero recipient address.");
    }
    if (step === 1) {
      if (stages.length < 2 || stages.length > 5) throw new Error("Programs need 2–5 milestones.");
      for (const [index, stage] of stages.entries()) {
        if (parseGen(stage.tranche) <= 0n || stage.criteria.length < 1 || stage.criteria.length > 3 || stage.criteria.some((criterion) => criterion.trim().length < 10 || criterion.trim().length > 1000)) throw new Error(`Complete the tranche and 1–3 measurable criteria for milestone ${index + 1}.`);
      }
    }
    if (step === 2) {
      for (const [index, stage] of stages.entries()) {
        if (stage.authorities.length < 2 || stage.authorities.length > 4 || stage.authorities.some(({ prefix }) => !prefix.startsWith("https://") || !prefix.endsWith("/")) || stage.authorities.filter(({ required }) => required).length < 2 || new Set(stage.authorities.map(({ prefix }) => { try { return new URL(prefix).hostname; } catch { return ""; } })).size !== stage.authorities.length) throw new Error(`Milestone ${index + 1} needs 2–4 distinct HTTPS authorities with at least two required sources.`);
      }
      validateCreationPreflight({ recipient, funder: "", tranches, authorities: stages.map((item) => item.authorities.map((authority) => ({ ...authority, prefix: authority.prefix.trim() }))) });
    }
  }

  function next() {
    try {
      validateStep();
      if (step === 2) setReviewMilestones(buildMilestones(stages, tranches));
      setStep((current) => Math.min(3, current + 1));
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Check the form fields."); }
  }

  async function estimate() {
    try {
      if (hash) return;
      setBusy(true); setError(""); setNotice("");
      const provider = getActiveProvider();
      if (!provider) throw new Error("Connect an injected wallet before funding a program.");
      const chain = await provider.request({ method: "eth_chainId" });
      if (typeof chain !== "string" || BigInt(chain) !== 61999n) throw new Error("Switch the connected wallet to Studionet 61999 first.");
      validateStep();
      const milestones = reviewMilestones ?? buildMilestones(stages, tranches);
      const request = {
        functionName: "create_program",
        args: [recipient, title, purpose, JSON.stringify(milestones), JSON.stringify(PROGRAM_POLICY)],
      };
      const accounts = await provider.request({ method: "eth_accounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string") throw new Error("Connect a wallet account before estimating fees.");
      validateCreationPreflight({ recipient, funder: accounts[0], tranches, authorities: stages.map((item) => item.authorities.map((authority) => ({ ...authority, prefix: authority.prefix.trim() }))) });
      if (title.trim().length < 1 || title.trim().length > 120 || purpose.trim().length < 1 || purpose.trim().length > 1000) throw new Error("Program title or purpose is outside the contract's size limits.");
      const before = await readProgramCounter();
      const result = await prepareWrite(accounts[0], provider, request);
      const [freshChain, freshAccounts] = await Promise.all([provider.request({ method: "eth_chainId" }), provider.request({ method: "eth_accounts" })]);
      if (getActiveProvider() !== provider || typeof freshChain !== "string" || BigInt(freshChain) !== 61999n || !Array.isArray(freshAccounts) || String(freshAccounts[0]).toLowerCase() !== String(accounts[0]).toLowerCase()) throw new Error("Wallet account or network changed during preparation; prepare again.");
      setPrepared(result);
      setCounterBefore(before);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to prepare this transaction."); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!prepared || hash) return;
    try {
      setBusy(true); setError("");
      const result = await submitPreparedWrite(prepared, (tx) => { setHash(tx); invalidatePrepared(); });
      const after = await readProgramCounter();
      const before = counterBefore ?? after;
      const candidates = await Promise.all(Array.from({ length: Number(after - before) }, (_, index) => readProgram(Number(before) + index + 1)));
      const created = candidates.find((program) => matchesCreatedProgram(program, {
        funder: prepared.account, recipient, title: title.trim(), budgetWei: total,
      }));
      if (!created) {
        if (!result.successful) throw new Error(`Transaction ${result.hash} finalized with an unsuccessful execution result and no matching program exists.`);
        throw new Error(`Transaction ${result.hash} finalized successfully, but no matching draft was found on-chain.`);
      }
      setNotice(`Draft #${created.id} was read back from finalized contract state. The recipient must accept the frozen terms before the funder can activate it · ${result.hash}`);
      router.push(`/programs/${created.id}`);
    } catch (cause) { setError(submissionErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  return <main className="wrap subpage builder-page">
    <span className="eyebrow">PROGRAM BUILDER · STEP {step + 1} OF 4</span><h1>Propose a milestone program.</h1><p className="sub-lead">Freeze the schedule, evidence authorities and acceptance rules. The recipient accepts before any GEN is funded.</p>
    <div className="wizard-steps" aria-label="Builder progress">{["Program", "Milestones", "Evidence", "Review"].map((label, index) => <div key={label} data-active={index === step} data-done={index < step}><span>{String(index + 1).padStart(2, "0")}</span>{label}</div>)}</div>
    <section className="glass-card wizard-card">
      {step === 0 && <div className="form-grid"><label>Program title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required /></label><label>Recipient EVM address<input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x…" spellCheck={false} required /></label><label className="wide-field">Purpose<textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={1000} rows={4} required /></label></div>}
      {step === 1 && <div className="stage-editor">{stages.map((stage, index) => <article className="stage-edit glass-card" key={index}><div className="program-card-top"><span className="overline">MILESTONE {String(index + 1).padStart(2, "0")}</span>{stages.length > 2 && <button className="icon-btn" type="button" onClick={() => setStages((current) => current.filter((_, i) => i !== index))} aria-label={`Remove milestone ${index + 1}`}><Trash2 size={16}/></button>}</div><div className="form-grid"><label>Frozen tranche (GEN)<input inputMode="decimal" value={stage.tranche} onChange={(e) => updateStage(index, { tranche: e.target.value })} placeholder="0.00" required /></label>{stage.criteria.map((criterion, criterionIndex) => <label className="wide-field" key={criterionIndex}>Acceptance clause for criterion {criterionIndex + 1}<textarea value={criterion} onChange={(e) => updateStage(index, { criteria: stage.criteria.map((item, i) => i === criterionIndex ? e.target.value : item) })} rows={3} maxLength={1000} required /></label>)}{stage.criteria.length < 3 && <button className="action secondary wide-field" type="button" onClick={() => updateStage(index, { criteria: [...stage.criteria, ""] })}><Plus size={15}/>Add criterion</button>}{stage.criteria.length > 1 && <button className="action secondary wide-field" type="button" onClick={() => updateStage(index, { criteria: stage.criteria.slice(0, -1) })}><Trash2 size={15}/>Remove last criterion</button>}</div></article>)}{stages.length < 5 && <button className="action secondary" type="button" onClick={() => setStages((current) => [...current, blankStage()])}><Plus size={16}/>Add milestone</button>}<p className="calc-line">Total program budget <strong>{formatGen(total)} GEN</strong></p></div>}
      {step === 2 && <div className="stage-editor">{stages.map((stage, index) => <article key={index} className="glass-card"><strong>Milestone {index + 1} · independent source policy</strong>{stage.authorities.map((authority, sourceIndex) => <fieldset className="wide-field" key={sourceIndex}><legend>Authority {sourceIndex + 1}</legend><label>Evidence authority hostname and HTTPS path<input value={authority.prefix} onChange={(e) => updateStage(index, { authorities: stage.authorities.map((item, i) => i === sourceIndex ? { ...item, prefix: e.target.value } : item) })} placeholder={sourceIndex === 0 ? "https://source-one.example/project/" : "https://source-two.example/records/"} spellCheck={false} required /></label><label>Authority role<select value={authority.role} onChange={(e) => updateStage(index, { authorities: stage.authorities.map((item, i) => i === sourceIndex ? { ...item, role: e.target.value as AuthorityRole } : item) })}><option value="PRIMARY">Primary</option><option value="CORROBORATING">Corroborating</option><option value="OFFICIAL">Official</option></select></label><label><input type="checkbox" checked={authority.required} onChange={(e) => updateStage(index, { authorities: stage.authorities.map((item, i) => i === sourceIndex ? { ...item, required: e.target.checked } : item) })} /> Required for evaluation</label><small>A hostname and its declared role are frozen assertions; distinct hostnames do not prove independent ownership.</small></fieldset>)}{stage.authorities.length < 4 && <button className="action secondary" type="button" onClick={() => updateStage(index, { authorities: [...stage.authorities, { prefix: "", role: "OFFICIAL", required: false }] })}><Plus size={15}/>Add source</button>}{stage.authorities.length > 2 && <button className="action secondary" type="button" onClick={() => updateStage(index, { authorities: stage.authorities.slice(0, -1) })}><Trash2 size={15}/>Remove last source</button>}</article>)}</div>}
      {step === 3 && <div className="review-grid">
        <div><span className="overline">FROZEN PROGRAM TERMS</span><h2>{title || "Untitled program"}</h2><p>{purpose}</p><p>Recipient <code>{recipient}</code></p><p>The recipient has seven days to accept. The funder then has until that same deadline to activate with the exact total budget. Unaccepted or unfunded drafts expire without holding GEN.</p></div>
        <div className="review-budget"><span>Budget after acceptance</span><strong>{formatGen(total)} GEN</strong><span>{stages.length} sequential tranches</span>{stages.map((stage, index) => <div key={index}>Stage {index + 1}<strong>{stage.tranche || "0"} GEN</strong></div>)}</div>
        <section className="review-frozen wide-field" aria-label="Frozen milestone criteria and authorities"><h3>Milestone criteria and evidence authorities</h3><p>These deadlines and source prefixes are frozen into the creation call.</p>{(reviewMilestones ?? buildMilestones(stages, tranches)).map((milestone, index) => <article className="review-milestone glass-card" key={index}><div className="program-card-top"><strong>Milestone {index + 1}</strong><strong>{formatGen(milestone.tranche_wei)} GEN</strong></div><p>Evidence deadline (UTC): <time dateTime={new Date(milestone.deadline * 1000).toISOString()}>{new Date(milestone.deadline * 1000).toISOString()}</time></p><h4>Acceptance criteria</h4><ol>{milestone.criteria.map((criterion, criterionIndex) => <li key={criterionIndex}>{criterion}</li>)}</ol><h4>Allowed evidence authorities</h4><ul>{milestone.authorities.map((authority, sourceIndex) => <li key={sourceIndex}><code>{authority.prefix}</code> · {authority.role} · {authority.required ? "Required" : "Optional"}</li>)}</ul></article>)}</section>
        <section className="review-policy wide-field" aria-label="Frozen review and challenge policy"><h3>Frozen review policy</h3><ul><li>Acceptance window: 7 days; challenge window: 7 days.</li><li>Evaluation retry spacing: 1 hour; retry grace: 2 days; maximum retries: 1.</li><li>Challenge bond: {formatGen(PROGRAM_POLICY.challenge_bond_wei)} GEN, accounted under contract challenge rules.</li></ul></section>
        <p className="wide-field tx-truth">Creating this draft sends no GEN. After the recipient accepts the immutable terms, the funder separately signs a payable activation. Withdrawals remain one-shot native child transfers whose delivery the contract cannot authenticate.</p>
        {prepared && <div className="fee-panel wide-field"><strong>Draft creation · zero GEN value</strong><span>Review the recipient and complete frozen schedule before signing.</span></div>}
      </div>}
      {error && <div className="form-alert" role="alert">{error}</div>}{hash && <p className="tx-truth">Submitted transaction: <a href={`${"https://explorer-studio.genlayer.com"}/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a></p>}{notice && <div className="form-success" role="status">{notice}</div>}
      <div className="wizard-actions">{step > 0 && <button className="action secondary" type="button" onClick={() => {setStep((current) => current - 1);setReviewMilestones(null);invalidatePrepared();}} disabled={busy}><ArrowLeft size={16}/>Back</button>}{step < 3 ? <button className="action primary" type="button" onClick={next}>Continue <ArrowRight size={16}/></button> : hash ? <button className="action primary" type="button" disabled>{busy ? "Waiting for finality…" : "Transaction submitted — check status"}</button> : !prepared ? <button className="action primary" type="button" onClick={() => void estimate()} disabled={busy}>{busy ? "Preparing…" : "Prepare transaction"}</button> : <button className="action primary" type="button" onClick={() => void submit()} disabled={busy}>{busy ? (hash ? "Waiting for finality…" : "Waiting for wallet confirmation…") : "Create frozen draft"}</button>}</div>
    </section>
  </main>;
}
