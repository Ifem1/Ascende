"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { WalletControl } from "@/components/wallet-control";

const links = [
  ["Programs", "/programs"], ["Create", "/create"], ["My Work", "/my-work"],
  ["Treasury", "/treasury"], ["History", "/activity"], ["Docs", "/docs"],
];
export function SiteHeader() {
  const pathname = usePathname();
  return <header className="topbar">
    <Link href="/" className="brand" aria-label="Ascende home">
      <Image src="/ascende-mark.svg" alt="" width={33} height={33} />
      <span>ASCENDE</span><i aria-hidden="true">.</i>
    </Link>
    <nav className="mainnav" aria-label="Primary navigation">
      {links.map(([label,href]) => <Link key={href} href={href} className={pathname===href ? "nav-active" : ""}>{label}</Link>)}
    </nav>
    <WalletControl />
  </header>;
}
