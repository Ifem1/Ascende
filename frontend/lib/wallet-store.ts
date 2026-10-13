import type { InjectedProvider } from "@/lib/network";

let activeProvider: InjectedProvider | null | undefined;

export function setActiveProvider(provider: InjectedProvider | null | undefined) {
  activeProvider = provider;
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ascende:wallet-provider-changed"));
}

export function getActiveProvider(): InjectedProvider | undefined {
  if (activeProvider === null) return undefined;
  if (activeProvider) return activeProvider;
  return typeof window === "undefined" ? undefined : window.ethereum;
}
