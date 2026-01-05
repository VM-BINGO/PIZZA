@echo off
echo ============================
echo Initialiserer Git repo
echo ============================

git init
git branch -M main
git add .
git commit -m "Initial commit - pizza app"

git remote add origin https://vm-bingo.github.io/PIZZA/.git
git push -u origin main

echo.
echo ✅ Repo initialiseret og pushed!
pause
