#!/usr/bin/env bash
# =============================================================================
# Coach OS — PostgreSQL Backup Script
# Dumps the database, compresses, uploads to S3, and enforces retention.
# Logs are sent to stdout (for cron capture) and to Better Stack.
# =============================================================================
set -euo pipefail

# ── Load .env.backup if present ──────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.backup"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck source=/dev/null
  source "$ENV_FILE"
fi

# ── Defaults ─────────────────────────────────────────────────────────────────
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-coach-os-postgres-1}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
BACKUP_S3_PREFIX="${BACKUP_S3_PREFIX:-backups}"
BACKUP_AWS_REGION="${BACKUP_AWS_REGION:-us-east-1}"

# ── Logging ───────────────────────────────────────────────────────────────────
log() {
  local level="$1"
  shift
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] [$level] $*"
}

log_betterstack() {
  local level="$1"
  local message="$2"
  local extra="${3:-}"

  [[ -z "${BACKUP_BETTERSTACK_TOKEN:-}" ]] && return 0

  local payload
  payload=$(printf '{"level":"%s","message":"%s","service":"coach-os-backup"%s}' \
    "$level" "$message" "${extra:+,$extra}")

  curl -s -o /dev/null \
    -X POST "https://in.logs.betterstack.com" \
    -H "Authorization: Bearer $BACKUP_BETTERSTACK_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" || true
}

# ── Validate required env vars ────────────────────────────────────────────────
validate_env() {
  local required=(
    POSTGRES_DB
    POSTGRES_USER
    POSTGRES_PASSWORD
    BACKUP_AWS_ACCESS_KEY_ID
    BACKUP_AWS_SECRET_ACCESS_KEY
    BACKUP_S3_BUCKET
  )
  local missing=()
  for var in "${required[@]}"; do
    [[ -z "${!var:-}" ]] && missing+=("$var")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    log ERROR "Missing required env vars: ${missing[*]}"
    log_betterstack "error" "Backup aborted: missing env vars: ${missing[*]}"
    exit 1
  fi
}

# ── S3 helper (isolated credentials) ─────────────────────────────────────────
run_aws() {
  AWS_ACCESS_KEY_ID="$BACKUP_AWS_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$BACKUP_AWS_SECRET_ACCESS_KEY" \
  AWS_DEFAULT_REGION="$BACKUP_AWS_REGION" \
  aws "$@"
}

# ── Upload with retry (3 attempts, exponential backoff) ───────────────────────
upload_with_retry() {
  local src="$1"
  local s3_key="$2"
  local attempt=1
  local max_attempts=3
  local delays=(0 5 15)

  # Abort if object already exists (no-overwrite guarantee)
  if run_aws s3api head-object \
       --bucket "$BACKUP_S3_BUCKET" \
       --key "$s3_key" &>/dev/null; then
    log WARN "Object already exists, skipping upload: s3://$BACKUP_S3_BUCKET/$s3_key"
    return 0
  fi

  while [[ $attempt -le $max_attempts ]]; do
    if [[ ${delays[$((attempt - 1))]} -gt 0 ]]; then
      log INFO "Retrying upload in ${delays[$((attempt - 1))]}s (attempt $attempt/$max_attempts)..."
      sleep "${delays[$((attempt - 1))]}"
    fi

    if run_aws s3 cp "$src" "s3://$BACKUP_S3_BUCKET/$s3_key" \
         --storage-class STANDARD_IA; then
      log INFO "Upload successful: s3://$BACKUP_S3_BUCKET/$s3_key"
      return 0
    fi

    log WARN "Upload attempt $attempt/$max_attempts failed"
    ((attempt++))
  done

  log ERROR "Upload failed after $max_attempts attempts"
  log_betterstack "error" "S3 upload failed after $max_attempts attempts" \
    "\"s3_key\":\"$s3_key\""
  return 1
}

# ── Cleanup old backups (enforce retention) ───────────────────────────────────
cleanup_old_backups() {
  log INFO "Checking for backups older than $BACKUP_RETENTION_DAYS days..."

  local cutoff
  cutoff=$(date -u -d "-${BACKUP_RETENTION_DAYS} days" +"%Y-%m-%dT%H:%M:%SZ")

  local keys
  keys=$(run_aws s3api list-objects-v2 \
    --bucket "$BACKUP_S3_BUCKET" \
    --prefix "$BACKUP_S3_PREFIX/" \
    --query "Contents[?LastModified<\`$cutoff\`].Key" \
    --output text 2>/dev/null || echo "")

  if [[ -z "$keys" || "$keys" == "None" ]]; then
    log INFO "No old backups to remove."
    return 0
  fi

  local count=0
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    if run_aws s3 rm "s3://$BACKUP_S3_BUCKET/$key" &>/dev/null; then
      log INFO "Removed old backup: $key"
      ((count++))
    else
      log WARN "Failed to remove: $key"
    fi
  done <<< "$keys"

  log INFO "Retention cleanup complete. Removed $count old backup(s)."
  log_betterstack "info" "Retention cleanup complete" \
    "\"removed_count\":$count,\"retention_days\":$BACKUP_RETENTION_DAYS"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  local start_ts
  start_ts=$(date +%s)

  TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
  DATE_PATH=$(date -u +"%Y/%m/%d")
  FILENAME="${TIMESTAMP}.sql.gz"
  TMPFILE="/tmp/coach-os-backup-${FILENAME}"
  S3_KEY="${BACKUP_S3_PREFIX}/${DATE_PATH}/${FILENAME}"

  # Ensure temp file is always cleaned up
  trap 'rm -f "$TMPFILE"' EXIT

  log INFO "=========================================="
  log INFO "Coach OS backup started"
  log INFO "Database  : $POSTGRES_DB"
  log INFO "Container : $POSTGRES_CONTAINER"
  log INFO "S3 key    : s3://$BACKUP_S3_BUCKET/$S3_KEY"
  log INFO "=========================================="
  log_betterstack "info" "Backup started" \
    "\"database\":\"$POSTGRES_DB\",\"s3_key\":\"$S3_KEY\""

  # ── Step 1: Validate environment ────────────────────────────────────────
  validate_env

  # ── Step 2: Generate compressed dump ────────────────────────────────────
  log INFO "Generating PostgreSQL dump..."
  PGPASSWORD="$POSTGRES_PASSWORD" \
    docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" "$POSTGRES_CONTAINER" \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$TMPFILE"

  # ── Step 3: Validate dump integrity ─────────────────────────────────────
  log INFO "Validating dump..."
  if ! gzip --test "$TMPFILE"; then
    log ERROR "Dump file is corrupted (gzip validation failed)"
    log_betterstack "error" "Backup dump corrupted" "\"filename\":\"$FILENAME\""
    exit 1
  fi
  if [[ ! -s "$TMPFILE" ]]; then
    log ERROR "Dump file is empty"
    log_betterstack "error" "Backup dump is empty" "\"filename\":\"$FILENAME\""
    exit 1
  fi

  local file_size
  file_size=$(du -sh "$TMPFILE" | cut -f1)
  log INFO "Dump validated. Size: $file_size"

  # ── Step 4: Upload to S3 ─────────────────────────────────────────────────
  log INFO "Uploading to S3..."
  upload_with_retry "$TMPFILE" "$S3_KEY"

  # ── Step 5: Enforce retention ────────────────────────────────────────────
  cleanup_old_backups

  # ── Done ─────────────────────────────────────────────────────────────────
  local end_ts duration_ms
  end_ts=$(date +%s)
  duration_ms=$(( (end_ts - start_ts) * 1000 ))

  log INFO "=========================================="
  log INFO "Backup completed successfully in ${duration_ms}ms"
  log INFO "=========================================="
  log_betterstack "info" "Backup completed successfully" \
    "\"file_size\":\"$file_size\",\"s3_key\":\"$S3_KEY\",\"duration_ms\":$duration_ms"
}

main "$@"
