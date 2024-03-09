#! /usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo 'usage: ./bin/version.sh <version>'
  echo 'This will update the version for @textbook/atlas-ip'
  exit 1
fi

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo 'Git working directory not clean.'
  exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/.."

commitAndTag() {
  git add \
    "$ROOT/package.json" \
    "$ROOT/package-lock.json" \
    "$ROOT/packages/*/package.json"
  git commit --message "@textbook/atlas-ip $1"
  git tag "npm-$1"
}

npmRun() {
  npm --prefix="$ROOT" "$@"
}

VERSION="$(npmRun version --no-git-tag-version "$1")"
npmRun --workspace "$ROOT/packages/atlas-ip" version "$VERSION"
npmRun install --package-lock-only
commitAndTag "$VERSION"
