# 05 — Frontend and brand LOCK

## Product aesthetic

ASCENDE must NOT look like Redeem black/lime. Signature **Obsidian × Luminous Lavender**: background `#080714`, secondary background `#131022`, glossy card `#181328`, violet deep `#211532`, primary lavender `#C9A7FF`, light lilac `#DFC9FF`, near white `#F7F3FF`, muted `#BFB7CE`, border `#3C2A54`, semantic cyan `#57DDE4`, warm coral `#FFAE72`. Contrast-adjust state colors for accessible text. No flat/plain white sections, no large black dead zones, no electric green primary CTAs.

Typography: elegant modern display (e.g. Sora or Space Grotesk for headings), highly readable Inter/Space Grotesk body, IBM Plex Mono for IDs/chain data. Responsive 1.12–1.2 modular scale. Heading: "PROGRESS IS EARNED. / CAPITAL FOLLOWS PROOF." Bold enough to be instantly understood; avoid copying Redeem's condensed giant lettering.

## Visual assets

`frontend-starter/public/ascende-hero.png` is **original generated artwork cropped into a hero asset**: floating violet crystal platforms climbing to a luminous portal. It is decorative and not a claim of a deployed project. Use a softly fading right-column figure on desktop, beneath hero on mobile, meaningful `alt`, lazy or eager carefully. Asset may be converted to optimized WebP by Codex; never change the meaning to fake dashboard data.

`design/CONCEPT_ONLY-not-live-product.png` is a **moodboard that contains invented names, counts, TVL, dates and screenshots**. Absolutely never ship it as the real UI, marketing screenshot claiming live numbers, reviewer evidence, or sample chain state. It is strictly a visual composition reference.

## Routes and information hierarchy (Next.js App Router)

- `/` — premium hero, real aggregate statistics only when loaded from chain, empty/loading/error states, how it works, actual programs.
- `/programs` — filter/sort/pagination from canonical IDs; glass cards show real funder/recipient, tranches, states, deadlines and GEN.
- `/programs/[id]` — program overview, horizontal/vertical milestone rail, frozen terms, authority, evidence, validator manifest, challenge CTA, treasury, canonical tx drawer.
- `/create` — 4-step guided form: program/roles → 2–5 milestones → evidence policy and deadlines → exact funding review/submit. No placeholder funding amount.
- `/my-work` — role-aware funder and recipient actions, stage progression, withdrawals, claims.
- `/activity` — actual receipts/resolution history, no fake activity feed or pretend indexer.
- `/docs` — accurate user guide and explorer/deployment info.

Use polished cards, soft shadows, gloss gradient edges, layered backgrounds, low-amplitude aurora that respects reduced motion, animated milestone connectors, hover focus transitions, skeletons and meaningful empty states. On small screens no horizontal overflow, no mouse-only behavior, proper tab order.

## Wallet interaction

Top right disconnected: lavender `Connect wallet` opens provider chooser for supported injected EIP-1193 wallets. Connected: address pill `0x12...abcd`, network chip; clicking address toggles anchored popover: **Copy full address**, **View Explorer**, **Disconnect**. Copy gives toast, disconnect clears app state/listeners but must not claim wallet-level revocation. Account/chain changes invalidate stale signer and refetch role state. Wrong network chip is clickable and requests switch to Studionet 61999; if needed request supported `wallet_addEthereumChain` with verified config. Reject switch/rejection gracefully; never write on wrong network. No WalletConnect/Privy/private-key localStorage.

## Critical UI correctness

- Reads work without wallet; never gate browse on connect.
- All GEN inputs use precise string↔wei `BigInt` conversion; do not use JS Number for payouts.
- Contracts fields use exact generated schema, never `g[0]` or title-matched inferred IDs.
- Disable buttons based on true milestone status, sender permissions, deadline and payable bond, not purely text labels.
- Tx panel distinguishes submitted, accepted, finalized, executed-successful, child pending, child delivered, errored and undetermined; network FINALIZED does not equal business success.
- No mock programs or placeholder totals in production. Zero rows render a useful real empty state.
- The UI is not allowed to show "Paid" while delivery is ambiguous, and not "Final Qualified" until contract state confirms it.

## Components

SiteHeader, ProviderChooser, WalletPopover, NetworkSwitchPrompt, AuroraHero, LiveStatCards, ProgramCard, ProgramFormWizard, MilestoneRail, EvidenceSourceRules, EvidenceManifest, ReviewDecision, ChallengeDrawer, TreasuryBreakdown, TransactionDrawer, EmptyState, ErrorBoundary, CopyableAddress, ExplorerLink, responsive nav.

## Accessibility and quality

Keyboard navigable, dialogs escape and focus return, ARIA descriptions, min 44x44 touch targets, contrast, reduced motion. Desktop 1440, 1024 tablet, 390/430 mobile. Bundle conscious: CSS aurora instead of huge Three.js globally. Marketing copy original and concise.
