"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, LogOut, Wallet, X, AlertTriangle } from "lucide-react";
import { EXPLORER, GENLAYER_RPC, InjectedProvider, TARGET_CHAIN_ID, normalizedChainId, shortAddress } from "@/lib/network";
import { setActiveProvider } from "@/lib/wallet-store";

function getProvider(): InjectedProvider | undefined { return typeof window === "undefined" ? undefined : window.ethereum; }
function getErrorMessage(error: unknown) { return error instanceof Error ? error.message : "Wallet request was rejected or could not complete"; }
function isUnknownChain(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === 4902; }
type DiscoveredWallet = { info: { uuid: string; name: string; icon: string; rdns: string }; provider: InjectedProvider };

export function WalletControl() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("");
  const [menu, setMenu] = useState(false);
  const [selector, setSelector] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [provider, setProvider] = useState<InjectedProvider>();
  const [disconnected, setDisconnected] = useState(false);
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const popup = useRef<HTMLDivElement>(null);
  const correct = chain === TARGET_CHAIN_ID;
  useEffect(() => {
    const active = provider ?? (disconnected ? undefined : getProvider());
    if (!active) return;
    let live = true;
    const refresh = async () => {
      try {
        const [accounts, activeChain] = await Promise.all([active.request({method:"eth_accounts"}),active.request({method:"eth_chainId"})]);
        if (!live) return;
        setAddress(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "");
        setChain(normalizedChainId(activeChain));
      } catch { if (live) setNote("Wallet state could not be read"); }
    };
    const changedAccounts = (...args: unknown[]) => { const value=args[0]; setAddress(Array.isArray(value) && typeof value[0]==="string" ? value[0] : ""); setMenu(false); };
    const changedChain = (...args: unknown[]) => { setChain(normalizedChainId(args[0])); setMenu(false); };
    const handleDisconnect = () => { setDisconnected(true); setAddress(""); setMenu(false); setProvider(undefined); setActiveProvider(null); };
    active.on?.("accountsChanged", changedAccounts);
    active.on?.("chainChanged", changedChain);
    active.on?.("disconnect", handleDisconnect);
    void refresh();
    return () => { live=false; active.removeListener?.("accountsChanged",changedAccounts); active.removeListener?.("chainChanged",changedChain); active.removeListener?.("disconnect",handleDisconnect); };
  },[provider, disconnected]);
  useEffect(() => {
    const found = new Map<string, DiscoveredWallet>();
    const announce = (event: Event) => {
      const detail = (event as CustomEvent<DiscoveredWallet>).detail;
      if (!detail?.info?.uuid || !detail.info.name || !detail.provider?.request) return;
      found.set(detail.info.uuid, detail);
      setWallets(Array.from(found.values()));
    };
    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const timer = window.setTimeout(() => {
      if (found.size === 0 && getProvider()) setWallets([{ info: { uuid: "injected", name: "Browser wallet", icon: "", rdns: "injected" }, provider: getProvider()! }]);
    }, 250);
    return () => { window.removeEventListener("eip6963:announceProvider", announce); window.clearTimeout(timer); };
  },[]);
  useEffect(() => {
    if (!menu && !selector) return;
    function esc(e: KeyboardEvent) { if(e.key === "Escape") { setMenu(false); setSelector(false); } }
    function click(e: MouseEvent) { if (popup.current && e.target instanceof Node && !popup.current.contains(e.target)) setMenu(false); }
    document.addEventListener("keydown",esc);document.addEventListener("mousedown",click);
    return () => {document.removeEventListener("keydown",esc);document.removeEventListener("mousedown",click);};
  },[menu,selector]);
  async function connect(selected: InjectedProvider) {
    setBusy(true);setNote("");
    try {
      const acc = await selected.request({method:"eth_requestAccounts"});
      const cid = await selected.request({method:"eth_chainId"});
      setDisconnected(false);
      setProvider(selected);setActiveProvider(selected);
      setAddress(Array.isArray(acc) && typeof acc[0]==="string" ? acc[0] : "");
      setChain(normalizedChainId(cid));setSelector(false);
    } catch(e) {setNote(getErrorMessage(e));} finally {setBusy(false);}
  }
  async function switchNetwork() {
    const active = provider ?? getProvider();if(!active){setNote("No injected wallet detected");return;}
    setBusy(true);setNote("");
    try {
      try {await active.request({method:"wallet_switchEthereumChain",params:[{chainId:TARGET_CHAIN_ID}]});}
      catch(e) {
        if(!isUnknownChain(e)) throw e;
        await active.request({method:"wallet_addEthereumChain",params:[{chainId:TARGET_CHAIN_ID,chainName:"GenLayer Studionet",rpcUrls:[GENLAYER_RPC],nativeCurrency:{name:"GEN",symbol:"GEN",decimals:18},blockExplorerUrls:[EXPLORER]}]});
        await active.request({method:"wallet_switchEthereumChain",params:[{chainId:TARGET_CHAIN_ID}]});
      }
      setChain(normalizedChainId(await active.request({method:"eth_chainId"})));
    } catch(e) {setNote(getErrorMessage(e));} finally{setBusy(false);}
  }
  async function copyAddress(){
    try{await navigator.clipboard.writeText(address);setNote("Address copied");}
    catch{setNote("Clipboard access failed. Copy from your wallet instead.");}
  }
  return <div className="wallet-zone" ref={popup}>
    <div className="wallet-row">
      {address && <button type="button" className={correct ? "chain-chip" : "chain-chip wrong"} disabled={busy} onClick={correct ? undefined : switchNetwork} title={correct?"Connected to Studionet":"Switch to Studionet 61999"}>
        <span className="chain-dot" />{correct ? "STUDIONET · 61999" : "WRONG NETWORK · SWITCH"}
      </button>}
      <button type="button" className="wallet-btn" onClick={()=>address ? setMenu(!menu):setSelector(true)} aria-expanded={address ? menu:selector} aria-haspopup="dialog">
        <Wallet size={17}/>{address ? shortAddress(address) : "Connect wallet"}{address && <ChevronDown size={15}/>}
      </button>
    </div>
    {menu && address && <div className="wallet-popover" role="dialog" aria-label="Connected wallet actions">
      <div className="pop-header"><div><small>CONNECTED WALLET</small><strong>{shortAddress(address)}</strong></div><button type="button" className="icon-btn" onClick={()=>setMenu(false)} aria-label="Close wallet menu"><X size={17}/></button></div>
      <button type="button" className="menu-action" onClick={()=>void copyAddress()}><Copy size={16}/>Copy full address</button>
      <a className="menu-action" href={`${EXPLORER}/address/${address}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/>View in Explorer</a>
      <button type="button" className="menu-action menu-danger" onClick={()=>{setDisconnected(true);setAddress("");setMenu(false);setProvider(undefined);setActiveProvider(null);setNote("Disconnected from Ascende (wallet authorization remains managed by your wallet)");}}><LogOut size={16}/>Disconnect</button>
    </div>}
    {selector && <div className="wallet-modal-layer" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelector(false);}}><div className="wallet-modal" role="dialog" aria-modal="true" aria-label="Connect an injected wallet">
      <div className="pop-header"><div><small>SECURE CONNECTION</small><h2>Connect wallet</h2></div><button type="button" className="icon-btn" aria-label="Close dialog" onClick={()=>setSelector(false)}><X size={18}/></button></div>
      <p>Connect an injected EVM wallet. Ascende never requests private keys.</p>
      {wallets.length ? wallets.map((wallet) => <button className="provider-option" key={wallet.info.uuid} type="button" disabled={busy} onClick={()=>void connect(wallet.provider)}><Wallet size={21}/> {wallet.info.name} <span>{busy?"Connecting…":"Connect →"}</span></button>) : <p>Looking for injected wallets…</p>}
      <small>Only your wallet handles approvals and keys. Ascende does not request private keys.</small>
    </div></div>}
    {note && <div className="wallet-toast" role="status"><span>{note.startsWith("Address copied")?<Check size={14}/>:<AlertTriangle size={14}/>}</span>{note}<button type="button" onClick={()=>setNote("")} aria-label="Dismiss notification"><X size={14}/></button></div>}
  </div>;
}
