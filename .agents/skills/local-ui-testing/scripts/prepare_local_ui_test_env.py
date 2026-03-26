#!/usr/bin/env python3

import argparse
import json
import os
import re
import stat
import tempfile
from pathlib import Path

TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=".")
    return parser.parse_args()


def ensure_repo_root(repo_root: Path) -> None:
    required_paths = [
        repo_root / "wrangler.jsonc.example",
        repo_root / ".dev.vars.example",
    ]
    for path in required_paths:
        if not path.exists():
            raise FileNotFoundError(f"Required file not found: {path}")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def backup_file(path: Path, backup_dir: Path) -> str | None:
    if not path.exists():
        return None

    backup_path = backup_dir / f"{path.name}.bak"
    backup_path.write_bytes(path.read_bytes())
    return str(backup_path)


def upsert_env_value(content: str, key: str, value: str) -> str:
    pattern = re.compile(rf"(?m)^(?P<key>{re.escape(key)})=.*$")
    line = f"{key}={value}"
    if pattern.search(content):
        return pattern.sub(line, content)

    if content and not content.endswith("\n"):
        content += "\n"
    return f"{content}{line}\n"


def read_existing_env_value(content: str, key: str) -> str | None:
    pattern = re.compile(rf"(?m)^{re.escape(key)}=(.*)$")
    match = pattern.search(content)
    return match.group(1) if match else None


def prepare_dev_vars(repo_root: Path, backup_dir: Path, warnings: list[str]) -> dict:
    target_path = repo_root / ".dev.vars"
    source_path = (
        target_path if target_path.exists() else repo_root / ".dev.vars.example"
    )
    content = read_text(source_path)

    content = upsert_env_value(content, "TURNSTILE_SECRET_KEY", TURNSTILE_SECRET_KEY)
    content = upsert_env_value(content, "TURNSTILE_SITE_KEY", TURNSTILE_SITE_KEY)

    backup_path = backup_file(target_path, backup_dir)
    write_text(target_path, content)
    os.chmod(target_path, stat.S_IRUSR | stat.S_IWUSR)

    return {
        "path": str(target_path),
        "backupPath": backup_path,
        "createdBySkill": backup_path is None,
    }


def replace_turnstile_site_key(content: str) -> tuple[str, bool]:
    pattern = re.compile(r'("TURNSTILE_SITE_KEY"\s*:\s*")([^"]*)(")')
    replaced_content, count = pattern.subn(rf"\g<1>{TURNSTILE_SITE_KEY}\g<3>", content)
    return replaced_content, count > 0


def replace_session_verify_metadata_checks(content: str) -> tuple[str, bool]:
    action_pattern = re.compile(
        r"^\s*expectedAction:\s*SESSION_ACCESS_TURNSTILE_ACTION,\n?",
        re.MULTILINE,
    )
    hostname_pattern = re.compile(
        r"^\s*expectedHostname:\s*new URL\(request\.url\)\.hostname,\n?",
        re.MULTILINE,
    )
    content, action_count = action_pattern.subn("", content)
    content, hostname_count = hostname_pattern.subn("", content)
    return content, action_count > 0 and hostname_count > 0


def prepare_turnstile_verification_target(
    repo_root: Path, backup_dir: Path, warnings: list[str]
) -> dict | None:
    target_path = repo_root / "src/modules/session/server/chat-access.ts"
    if not target_path.exists():
        warnings.append(
            "Could not find src/modules/session/server/chat-access.ts for local UI testing."
        )
        return None

    content = read_text(target_path)
    content, replaced = replace_session_verify_metadata_checks(content)
    if not replaced:
        warnings.append(
            "Could not relax local Turnstile metadata checks in src/modules/session/server/chat-access.ts."
        )
        return None

    backup_path = backup_file(target_path, backup_dir)
    write_text(target_path, content)

    return {
        "path": str(target_path),
        "backupPath": backup_path,
        "createdBySkill": backup_path is None,
    }


def prepare_wrangler_config(
    repo_root: Path, backup_dir: Path, warnings: list[str]
) -> dict:
    target_path = repo_root / "wrangler.jsonc"
    source_path = (
        target_path if target_path.exists() else repo_root / "wrangler.jsonc.example"
    )
    content = read_text(source_path)
    content, replaced = replace_turnstile_site_key(content)
    if not replaced:
        warnings.append("Could not find TURNSTILE_SITE_KEY in wrangler config.")

    if "replace-with-your-" in content and not target_path.exists():
        warnings.append(
            "Created wrangler.jsonc from the tracked example; placeholder Cloudflare bindings may still need manual setup."
        )

    backup_path = backup_file(target_path, backup_dir)
    write_text(target_path, content)

    return {
        "path": str(target_path),
        "backupPath": backup_path,
        "createdBySkill": backup_path is None,
    }


def main() -> None:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    ensure_repo_root(repo_root)

    run_dir = Path(tempfile.mkdtemp(prefix="local-ui-testing-"))
    warnings: list[str] = []
    files = [
        prepare_dev_vars(repo_root, run_dir, warnings),
        prepare_wrangler_config(repo_root, run_dir, warnings),
    ]
    verification_target = prepare_turnstile_verification_target(
        repo_root, run_dir, warnings
    )
    if verification_target:
        files.append(verification_target)

    manifest = {
        "repoRoot": str(repo_root),
        "runDir": str(run_dir),
        "files": files,
        "warnings": warnings,
    }
    manifest_path = run_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(
        json.dumps(
            {
                "manifestPath": str(manifest_path),
                "runDir": str(run_dir),
                "warnings": warnings,
            }
        )
    )


if __name__ == "__main__":
    main()
