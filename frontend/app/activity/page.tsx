import { ActivityFeed } from "@/components/activity-feed";

export default function Activity() {
  return <main className="wrap subpage"><span className="eyebrow">VERIFIABLE RECORD</span><h1>Progress, in sequence.</h1><p className="sub-lead">Activity below comes from program history stored by the configured Studionet contract. Wallet-submitted parent hashes are shown separately on program detail pages.</p><ActivityFeed/></main>;
}
