"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { formatGen, parseGen, prepareWrite, readRejectedPayableCredit, readRejectedPayableLedger, RejectedPayableCredit, RejectedPayableLedger, submitPreparedWrite } from "@/lib/genlayer";
import { getActiveProvider } from "@/lib/wallet-store";

export function RejectedPayableCreditPanel() {
  const [account, setAccount] = useState("");
  const [onTargetChain, setOnTargetChain] = useState(false);
  const [credit, setCredit] = useState<RejectedPayableCredit | null>(null);
  const [ledger, setLedger] = useState<RejectedPayableLedger | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async (owner = account) => {
    if (!owner || !onTargetChain) { setCredit(null); setLedger(null); return; }
    setError("");
    try {
      const [nextCredit, nextLedger] = await Promise.all([readRejectedPayableCredit(owner), readRejectedPayableLedger(owner)]);
      setCredit(nextCredit); setLedger(nextLedger);
      if (!amount && BigInt(nextCredit.available_wei) > 0n) setAmount(formatGen(nextCredit.available_wei));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not read this wallet's rejected-payment credit."); }
  }, [account, amount, onTargetChain]);

  useEffect(() => {
    let provider = getActiveProvider();
    let live = true;
    const inspect = async () => {
      provider = getActiveProvider();
      if (!provider) { setAccount(""); setOnTargetChain(false); return; }
      try {
        const [accounts, chain] = await Promise.all([provider.request({ method: "eth_accounts" }), provider.request({ method: "eth_chainId" })]);
        if (!live) return;
        setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : "");
        setOnTargetChain(typeof chain === "string" && BigInt(chain) === 61999n);
      } catch { if (live) { setAccount(""); setOnTargetChain(false); } }
    };
    const changed = () => { void inspect(); };
    const providerChanged = () => {
      provider?.removeListener?.("accountsChanged", changed);
      provider?.removeListener?.("chainChanged", changed);
      provider = getActiveProvider();
      provider?.on?.("accountsChanged", changed);
      provider?.on?.("chainChanged", changed);
      void inspect();
    };
    provider?.on?.("accountsChanged", changed);
    provider?.on?.("chainChanged", changed);
    window.addEventListener("ascende:wallet-provider-changed", providerChanged);
    void inspect();
    return () => {
      live = false;
      provider?.removeListener?.("accountsChanged", changed);
      provider?.removeListener?.("chainChanged", changed);
      window.removeEventListener("ascende:wallet-provider-changed", providerChanged);
    };
  }, []);

  useEffect(() => { void Promise.resolve().then(() => refresh()); }, [refresh]);

  async function run(operation: "request_rejected_payable_refund" | "submit_rejected_payable_refund", operationId = "") {
    const provider = getActiveProvider();
    if (!provider || !account || !onTargetChain) { setError("Connect an injected wallet on Studionet 61999 before signing."); return; }
    try {
      setBusy(true); setError(""); setNotice("");
      const args = operation === "request_rejected_payable_refund"
        ? [parseGen(amount).toString()]
        : [operationId];
      if (operation === "request_rejected_payable_refund" && parseGen(amount) <= 0n) throw new Error("Enter a positive refund amount.");
      const prepared = await prepareWrite(account, provider, { functionName: operation, args });
      const result = await submitPreparedWrite(prepared, () => undefined);
      if (!result.successful) throw new Error(`Transaction ${result.hash} finalized with an unsuccessful execution result.`);
      setNotice(operation === "request_rejected_payable_refund"
        ? `Refund amount reserved by the contract. Review its authorized operation below before submitting the transfer. ${result.hash}`
        : `One transfer submission finalized. The contract cannot confirm child delivery and will not automatically retry. ${result.hash}`);
      await refresh(account);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet transaction did not complete. Reconcile its original hash before retrying."); }
    finally { setBusy(false); }
  }

  return <section className="glass-card rejected-credit-panel" aria-live="polite">
    <div className="registry-toolbar"><div><span className="eyebrow">SENDER-ATTRIBUTED PAYABLE REJECTIONS</span><h2>Rejected-payment credit</h2></div><button className="action secondary" type="button" disabled={busy} onClick={() => void refresh()}><RefreshCw size={15}/>{busy ? "Working…" : "Refresh"}</button></div>
    {!account && <p>Connect an injected wallet to inspect any credit assigned to that account.</p>}
    {account && !onTargetChain && <p className="form-alert" role="status">Switch the wallet to Studionet 61999 to read or submit credit operations.</p>}
    {credit && <>
      <div className="treasury-buckets">
        {[["Available to reserve", credit.available_wei], ["Transfer authorized", credit.authorized_wei], ["Submitted · delivery unverified", credit.pending_wei]].map(([label, value]) => <article className="glass-card treasury-bucket" key={label}><span className="overline">{label}</span><strong>{formatGen(String(value))} GEN</strong></article>)}
      </div>
      <p className="treasury-caveat">Recorded total: {formatGen(credit.credited_wei)} GEN. Submitted transfers remain unresolved; child delivery has not been contract-confirmed.</p>
      {BigInt(credit.available_wei) > 0n && <div className="form-grid compact-form"><label>Amount to reserve (GEN)<input inputMode="decimal" value={amount} disabled={busy} onChange={(event) => setAmount(event.target.value)} /></label><button className="action secondary" type="button" disabled={busy || !onTargetChain} onClick={() => void run("request_rejected_payable_refund")}>{busy ? "Waiting…" : "Reserve refund"} <ArrowUpRight size={16}/></button></div>}
      {ledger?.rejections?.length ? <div className="treasury-operations"><span className="overline">REJECTION HISTORY</span>{ledger.rejections.map((item) => <p key={item.id}>{item.call.replaceAll("_", " ")} · {item.reason.replaceAll("_", " ")} · {formatGen(item.amount_wei)} GEN · {new Date(item.time * 1000).toLocaleString()}</p>)}</div> : <p>No rejected payable calls are recorded for this wallet.</p>}
      {ledger?.operations?.filter((item) => item.status === "AUTHORIZED").map((item) => <div className="fee-panel" key={item.id}><strong>Authorized operation #{item.id}</strong><span>{formatGen(item.amount_wei)} GEN · destination {item.destination}</span><span>This emits exactly one child transfer. It cannot be safely retried if delivery is ambiguous.</span><button className="action primary" type="button" disabled={busy || !onTargetChain} onClick={() => void run("submit_rejected_payable_refund", item.id)}>{busy ? "Waiting…" : "Submit transfer once"}</button></div>)}
    </>}
    {error && <div className="form-alert" role="alert">{error}</div>}{notice && <div className="form-success" role="status">{notice}</div>}
  </section>;
}
