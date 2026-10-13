"""Pin Direct Mode to the cached stable GenVM bundle used for compatibility checks."""

from pathlib import Path

import gltest.direct.sdk_loader as sdk_loader
import gltest.direct.loader as contract_loader
from gltest.direct.vm import VMContext


STABLE_DIRECT_RUNNER = "v0.2.16"
STABLE_ARCHIVE = Path.home() / ".cache" / "gltest-direct" / f"genvm-universal-{STABLE_DIRECT_RUNNER}.tar.xz"


def pytest_configure():
    if not STABLE_ARCHIVE.exists():
        raise RuntimeError(f"Pinned Direct Mode artifact is not cached: {STABLE_ARCHIVE}")
    sdk_loader.list_cached_versions = lambda: [STABLE_DIRECT_RUNNER]
    sdk_loader.get_latest_version = lambda: STABLE_DIRECT_RUNNER

    # genlayer-test 0.29.2 unlinks the fd-0 temp file immediately after dup2.
    # Windows keeps the duplicated handle open, so defer only that unlink until
    # VM cleanup has restored stdin. This is a test-runner compatibility shim.
    def inject_stdin_windows(vm):
        import os
        import tempfile
        from genlayer.py import calldata
        from genlayer.py.types import Address

        sender = Address(vm.sender) if isinstance(vm.sender, bytes) else vm.sender
        contract_address = Address(vm._contract_address) if isinstance(vm._contract_address, bytes) else vm._contract_address
        origin = Address(vm.origin) if isinstance(vm.origin, bytes) else vm.origin
        encoded = calldata.encode({
            "contract_address": contract_address,
            "sender_address": sender,
            "origin_address": origin,
            "stack": [],
            "value": vm._value,
            "datetime": vm._datetime,
            "is_init": False,
            "chain_id": vm._chain_id,
            "entry_kind": 0,
            "entry_data": b"",
            "entry_stage_data": None,
        })
        fd, path = tempfile.mkstemp()
        os.write(fd, encoded)
        os.lseek(fd, 0, os.SEEK_SET)
        vm._original_stdin_fd = os.dup(0)
        os.dup2(fd, 0)
        os.close(fd)
        paths = getattr(vm, "_ascende_temp_stdin_paths", [])
        paths.append(path)
        vm._ascende_temp_stdin_paths = paths

    contract_loader._inject_message_to_fd0 = inject_stdin_windows
    original_cleanup = VMContext._cleanup_after_deactivate

    def cleanup_windows(vm):
        original_cleanup(vm)
        import os
        for path in getattr(vm, "_ascende_temp_stdin_paths", []):
            try:
                os.unlink(path)
            except FileNotFoundError:
                pass
        vm._ascende_temp_stdin_paths = []

    VMContext._cleanup_after_deactivate = cleanup_windows
