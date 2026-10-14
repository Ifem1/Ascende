export type RecoveryCapabilities = {
  can_expire: boolean;
  can_finalize_unresolved: boolean;
  can_close: boolean;
};

const REVIEW_STATES = new Set(["EVIDENCE_SEALED", "RETRYABLE", "CHALLENGED", "CHALLENGE_RETRYABLE"]);

export function recoveryActions(status: string, capabilities: RecoveryCapabilities | null) {
  return {
    expire: status === "OPEN" && capabilities?.can_expire === true,
    finalizeUnresolved: REVIEW_STATES.has(status) && capabilities?.can_finalize_unresolved === true,
    close: capabilities?.can_close === true,
  };
}
