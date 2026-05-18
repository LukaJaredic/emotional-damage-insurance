#!/usr/bin/env sh

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
CYAN='\033[36m'
RESET='\033[0m'

log_info() {
  printf "${CYAN}%s${RESET}\n" "$1"
}

log_success() {
  printf "${GREEN}%s${RESET}\n" "$1"
}

log_warning() {
  printf "${YELLOW}%s${RESET}\n" "$1"
}

log_error() {
  printf "${RED}%s${RESET}\n" "$1"
}

run_step() {
  label="$1"
  command="$2"

  log_info "Running ${label}..."

  if sh -c "$command"; then
    log_success "${label} passed."
  else
    log_error "${label} failed."
    exit 1
  fi
}