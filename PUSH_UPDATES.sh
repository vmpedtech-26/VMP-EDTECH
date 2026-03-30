#!/bin/zsh
PROJECT_DIR="$(dirname "$0")"
cd "$PROJECT_DIR"
git add .
git commit -m "update: landing page and credential design" || echo "No changes to commit"
git push origin main --force

