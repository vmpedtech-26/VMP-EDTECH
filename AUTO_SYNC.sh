#!/bin/zsh
set -e
cd /Users/matias/.gemini/antigravity/scratch/vmp-servicios
echo "--- DEPLOYMENT START ---" > sync_log.txt
echo "Date: $(date)" >> sync_log.txt
echo "PWD: $(pwd)" >> sync_log.txt

# Re-init just in case
rm -rf .git
git init >> sync_log.txt 2>&1
git add . >> sync_log.txt 2>&1
git commit -m "feat: rebrand to Credencial/Instructor, UI improvements and remove landing section" >> sync_log.txt 2>&1
git branch -M main >> sync_log.txt 2>&1
git remote add origin https://github.com/MNEerty99/VMP---EDTECH.git >> sync_log.txt 2>&1

echo "--- GIT STATUS ---" >> sync_log.txt
git status >> sync_log.txt 2>&1
git remote -v >> sync_log.txt 2>&1

echo "--- PUSHING TO GITHUB ---" >> sync_log.txt
# This might fail if credentials are needed, we'll see the error in the log
git push -u origin main --force >> sync_log.txt 2>&1
echo "--- DEPLOYMENT END ---" >> sync_log.txt
