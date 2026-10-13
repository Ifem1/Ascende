import { TreasuryDashboard } from "@/components/treasury-dashboard";

export default function Treasury() {
  return <main className="wrap subpage"><span className="eyebrow">OBLIGATIONS · AUTHORIZATION · DELIVERY</span><h1>Every unit accounted for.</h1><p className="sub-lead">Read protocol and program-level GEN buckets directly from the configured contract. Entitlements, authorized transfers, pending delivery and recorded delivery remain separate.</p><TreasuryDashboard/></main>;
}
