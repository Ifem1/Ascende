# Contract implementation

`ascende.py` is the single Ascende Intelligent Contract. It stores ordered milestone programs, freezes terms and authorities at funding, seals evidence manifests, and evaluates exact response bytes through independent GenLayer nondeterministic execution and validator comparison.

Payment operations are two-step: a party authorizes a fixed destination and amount, then `submit_payment` emits one native EOA child transfer for the immutable operation ID. The result remains `TRANSFER_SUBMITTED`; a caller may mark the operation `DELIVERY_UNRESOLVED`, but there is no method to claim delivery or reissue a payment. The contract intentionally makes no lossless recovery claim.

The executable Direct Mode suite is `tests/test_contract.py`; see `docs/TESTING.md` for its tested transitions and remaining limits. Direct Mode does not prove live Studionet transfer behavior or production deployment compatibility.
