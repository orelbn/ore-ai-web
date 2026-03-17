#!/usr/bin/env python3

import argparse
import json
import shutil
from pathlib import Path


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser()
	parser.add_argument("--manifest", required=True)
	parser.add_argument("--keep-run-dir", action="store_true")
	return parser.parse_args()


def restore_file(entry: dict) -> None:
	target_path = Path(entry["path"])
	backup_path = entry.get("backupPath")

	if backup_path:
		target_path.write_bytes(Path(backup_path).read_bytes())
		return

	if target_path.exists():
		target_path.unlink()


def main() -> None:
	args = parse_args()
	manifest_path = Path(args.manifest).resolve()
	manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

	for entry in manifest["files"]:
		restore_file(entry)

	run_dir = Path(manifest["runDir"])
	result = {
		"restored": [entry["path"] for entry in manifest["files"]],
		"runDir": str(run_dir),
	}

	if not args.keep_run_dir and run_dir.exists():
		shutil.rmtree(run_dir)
		result["runDirRemoved"] = True
	else:
		result["runDirRemoved"] = False

	print(json.dumps(result))


if __name__ == "__main__":
	main()
