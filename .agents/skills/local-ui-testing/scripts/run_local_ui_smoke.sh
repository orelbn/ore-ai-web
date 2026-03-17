#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SKILL_DIR}/../../.." && pwd)"
APP_URL="http://localhost:3000"
PORT="3000"
KEEP_ARTIFACTS=0
START_DEV_SERVER=0
MANIFEST_PATH=""
RUN_DIR=""
SESSION_NAME=""
DEV_PID=""
STARTED_DEV_SERVER=0

while (($# > 0)); do
	case "$1" in
		--keep-artifacts)
			KEEP_ARTIFACTS=1
			shift
			;;
		--start-dev-server)
			START_DEV_SERVER=1
			shift
			;;
		*)
			echo "Unknown argument: $1" >&2
			exit 1
			;;
	esac
done

cleanup() {
	set +e

	agent-browser --session "${SESSION_NAME}" close >/dev/null 2>&1 || true

	if [[ "${STARTED_DEV_SERVER}" == "1" && -n "${DEV_PID}" ]]; then
		kill "${DEV_PID}" >/dev/null 2>&1 || true
		wait "${DEV_PID}" >/dev/null 2>&1 || true
	fi

	if [[ -n "${MANIFEST_PATH}" ]]; then
		if [[ "${KEEP_ARTIFACTS}" == "1" ]]; then
			python3 "${SCRIPT_DIR}/restore_local_ui_test_env.py" \
				--manifest "${MANIFEST_PATH}" \
				--keep-run-dir >/dev/null
		else
			python3 "${SCRIPT_DIR}/restore_local_ui_test_env.py" \
				--manifest "${MANIFEST_PATH}" >/dev/null
		fi
	fi
}

trap cleanup EXIT

PREPARE_JSON="$(python3 "${SCRIPT_DIR}/prepare_local_ui_test_env.py" --repo-root "${REPO_ROOT}")"
MANIFEST_PATH="$(
	PREPARE_JSON="${PREPARE_JSON}" python3 - <<'PY'
import json
import os
print(json.loads(os.environ["PREPARE_JSON"])["manifestPath"])
PY
)"
RUN_DIR="$(
	PREPARE_JSON="${PREPARE_JSON}" python3 - <<'PY'
import json
import os
print(json.loads(os.environ["PREPARE_JSON"])["runDir"])
PY
)"
SESSION_NAME="ore-ai-local-ui-$(basename "${RUN_DIR}")"
ARTIFACT_DIR="${RUN_DIR}/artifacts"
mkdir -p "${ARTIFACT_DIR}"

if ! lsof -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
	if [[ "${START_DEV_SERVER}" != "1" ]]; then
		echo "No dev server is listening on port ${PORT}. Start bun dev separately or rerun with --start-dev-server." >&2
		exit 1
	fi

	(
		cd "${REPO_ROOT}"
		bun dev >"${RUN_DIR}/dev-server.log" 2>&1
	) &
	DEV_PID="$!"
	STARTED_DEV_SERVER=1

	for _ in $(seq 1 60); do
		if curl -fsS "${APP_URL}" >/dev/null 2>&1; then
			break
		fi
		sleep 1
	done
fi

curl -fsS "${APP_URL}" >/dev/null

agent-browser --session "${SESSION_NAME}" open "${APP_URL}" >/dev/null
agent-browser --session "${SESSION_NAME}" wait 2000 >/dev/null
agent-browser --session "${SESSION_NAME}" snapshot -i >"${ARTIFACT_DIR}/snapshot.txt"
agent-browser --session "${SESSION_NAME}" get text body >"${ARTIFACT_DIR}/body.txt"
agent-browser --session "${SESSION_NAME}" screenshot "${ARTIFACT_DIR}/page.png" >/dev/null

if [[ "${KEEP_ARTIFACTS}" == "1" ]]; then
	echo "Artifacts kept at ${ARTIFACT_DIR}"
else
	echo "Local UI smoke test completed successfully."
fi
