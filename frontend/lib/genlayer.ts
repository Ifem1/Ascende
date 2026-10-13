import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import { GENLAYER_RPC } from "./network";

export const CHAIN_ID = "0xf22f";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS ?? "";
export const EXPLORER_URL = "https://explorer-studio.genlayer.com";

export type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

function sdkHash(value: string) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) throw new Error("Invalid transaction hash");
  return value as never;
}

export type ProgramRecord = {
  id: number;
  funder: string;
  recipient: string;
  title: string;
  purpose: string;
  status: string;
  funded_wei: string;
  locked_wei: string;
  earned_claimable_wei: string;
  refund_claimable_wei: string;
  milestones: Array<{ status: string; tranche_wei: string; deadline: number; criteria: string[]; authorities: Array<{ prefix: string; role: string; required: boolean }>; manifest: Array<{ url: string; sha256: string; byte_length: number }>; manifest_root: string; result: string; provisional_until: number; retry_after: number; challenge_used: boolean; challenge?: { challenger: string; manifest: Array<{ url: string; sha256: string; byte_length: number }>; root: string; prior_manifest: Array<{ url: string; sha256: string; byte_length: number }>; prior_manifest_root: string; prior_result: string; bond_wei: string; resolution?: { result: string; flipped: boolean; bond_owner: string; bond_wei: string; time: number } | null } | null; decision_history?: Array<{ id: number; kind: string; evidence_root?: string; previous_evidence_root?: string; result?: string; prior_result?: string; time: number }> }>;
};

export function parseGen(value: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(value)) throw new Error("Enter a valid GEN amount with up to 18 decimals");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt((fraction + "0".repeat(18)).slice(0, 18));
}

export function formatGen(wei: string | bigint): string {
  const amount = BigInt(wei);
  const whole = amount / 10n ** 18n;
  const fraction = (amount % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function readClient() {
  return createClient({ chain: studionet, endpoint: GENLAYER_RPC });
}

export function writeClient(account: string, provider: Eip1193Provider) {
  return createClient({ chain: studionet, endpoint: GENLAYER_RPC, account: account as `0x${string}`, provider: provider as never });
}

export function requireDeployment() {
  if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)) {
    throw new Error("Ascende is not deployed: public on-chain reads and writes are unavailable.");
  }
  return CONTRACT_ADDRESS as `0x${string}`;
}

export async function readProgramCounter() {
  const client = readClient();
  return BigInt(await client.readContract({
    address: requireDeployment(),
    functionName: "get_program_counter",
    args: [],
  }) as string | number | bigint);
}

export async function readProgram(id: number): Promise<ProgramRecord | null> {
  const client = readClient();
  const raw = await client.readContract({
    address: requireDeployment(),
    functionName: "get_program",
    args: [BigInt(id)],
  });
  if (typeof raw !== "string" || raw.length === 0) return null;
  return JSON.parse(raw) as ProgramRecord;
}

export async function readProgramAccounting(id: number) {
  const client = readClient();
  const raw = await client.readContract({ address: requireDeployment(), functionName: "get_program_accounting", args: [BigInt(id)] });
  if (typeof raw !== "string") throw new Error("Unexpected accounting response from contract");
  return JSON.parse(raw) as Record<string, string | number>;
}

export async function readProtocolAccounting() {
  const client = readClient();
  const raw = await client.readContract({
    address: requireDeployment(),
    functionName: "get_protocol_accounting",
    args: [],
  });
  if (typeof raw !== "string") throw new Error("Unexpected protocol accounting response from contract");
  return JSON.parse(raw) as Record<string, string>;
}

export async function readProgramOperations(id: number) {
  const client = readClient();
  const raw = await client.readContract({ address: requireDeployment(), functionName: "get_program", args: [BigInt(id)] });
  if (typeof raw !== "string" || raw.length === 0) throw new Error(`Program ${id} is not available`);
  const program = JSON.parse(raw) as { operations?: Array<Record<string, unknown>> };
  return program.operations ?? [];
}

export async function readProgramHistory(id: number) {
  const client = readClient();
  const raw = await client.readContract({ address: requireDeployment(), functionName: "get_resolution_history", args: [BigInt(id), 0n, 100n] });
  if (typeof raw !== "string") throw new Error("Unexpected history response from contract");
  return JSON.parse(raw) as Array<Record<string, unknown>>;
}

export async function readProgramMilestones(id: number) {
  const client = readClient();
  const raw = await client.readContract({ address: requireDeployment(), functionName: "get_milestones", args: [BigInt(id)] });
  if (typeof raw !== "string") throw new Error("Unexpected milestones response from contract");
  return JSON.parse(raw) as Array<Record<string, unknown>>;
}

export async function listPrograms(limit = 50): Promise<ProgramRecord[]> {
  const client = readClient();
  const address = requireDeployment();
  const counter = BigInt(await client.readContract({ address, functionName: "get_program_counter", args: [] }) as string | number | bigint);
  const start = counter > BigInt(limit) ? counter - BigInt(limit) : 0n;
  const idsRaw = await client.readContract({ address, functionName: "list_program_ids", args: [start, BigInt(limit)] });
  if (typeof idsRaw !== "string") throw new Error("Unexpected program ID response from contract");
  const ids = JSON.parse(idsRaw) as number[];
  const rows = await Promise.all(ids.map((id) => readProgram(id)));
  return rows.filter((row): row is ProgramRecord => row !== null).reverse();
}

export type WriteRequest = { functionName: string; args: unknown[]; value?: bigint };
export type FinalizedWrite = { hash: `0x${string}`; successful: boolean; receipt: unknown };

export type PreparedWrite = {
  account: string;
  provider: Eip1193Provider;
  client: ReturnType<typeof writeClient>;
  call: { address: `0x${string}`; functionName: string; args: never[]; value?: bigint };
  simulated: boolean;
};

export async function prepareWrite(account: string, provider: Eip1193Provider, request: WriteRequest): Promise<PreparedWrite> {
  const chain = await provider.request({ method: "eth_chainId" });
  if (typeof chain !== "string" || BigInt(chain) !== 61999n) throw new Error("Switch the connected wallet to Studionet 61999 before signing.");
  const client = writeClient(account, provider);
  await client.connect("studionet");
  const call = { address: requireDeployment(), functionName: request.functionName, args: request.args as never[], ...(request.value !== undefined ? { value: request.value } : {}) };
  // This stable SDK version's simulation API cannot carry payable `value`.
  // Simulate zero-value actions only; payable calls are checked by the actual
  // contract execution after wallet approval.
  const simulated = request.value === undefined || request.value === 0n;
  if (simulated) await client.simulateWriteContract(call as never);
  return { account, provider, client, call, simulated };
}

export async function submitPreparedWrite(prepared: PreparedWrite, onHash: (hash: string) => void): Promise<FinalizedWrite> {
  const chain = await prepared.provider.request({ method: "eth_chainId" });
  const accounts = await prepared.provider.request({ method: "eth_accounts" });
  if (typeof chain !== "string" || BigInt(chain) !== 61999n) throw new Error("Wallet network changed. No transaction was sent.");
  if (!Array.isArray(accounts) || String(accounts[0]).toLowerCase() !== prepared.account.toLowerCase()) throw new Error("Wallet account changed. No transaction was sent.");
  const hash = await prepared.client.writeContract({
    ...prepared.call,
  } as never) as `0x${string}`;
  onHash(hash);
  const receipt = await prepared.client.waitForTransactionReceipt({ hash: sdkHash(hash), status: TransactionStatus.FINALIZED });
  return { hash, successful: receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN, receipt };
}

export async function submitWrite(
  account: string,
  provider: Eip1193Provider,
  request: WriteRequest,
  onHash: (hash: string) => void,
): Promise<FinalizedWrite> {
  return submitPreparedWrite(await prepareWrite(account, provider, request), onHash);
}

export async function readTransaction(hash: `0x${string}`) {
  const client = readClient();
  const txHash = sdkHash(hash);
  const receipt = await client.getTransaction({ hash: txHash });
  const children = await client.getTriggeredTransactionIds({ hash: txHash });
  const childTransactions = await Promise.all(children.map(async (childHash) => {
    try {
      const child = await client.getTransaction({ hash: childHash });
      return { hash: childHash, status: child.statusName ?? String(child.status ?? "UNKNOWN"), execution: child.txExecutionResultName ?? "UNKNOWN", recipient: child.recipient ?? "", value: child.data?.value ?? "" };
    } catch {
      return { hash: childHash, status: "UNAVAILABLE", execution: "UNRESOLVED", recipient: "", value: "" };
    }
  }));
  return { receipt, successful: receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN, children: childTransactions };
}
