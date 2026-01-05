@echo off
echo ============================
echo Initialiserer Git repo
echo ============================

git init
git branch -M main
git add .
git commit -m "Initial commit - pizza app"

git remote add origin https://github.com/DIT_GITHUB_NAVN/pizza-app.git
git push -u origin main

echo.
echo ✅ Repo initialiseret og pushed!
pause
