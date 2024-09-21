@echo off
echo Select an option:
echo 1. Git Push
echo 2. git push and Deploy 
echo 3. only deploy
echo 4. set api key (run frist time only)

set /p choice=Enter your choice (1, 2, 3, 4): 

if "%choice%"=="1" goto git_push
if "%choice%"=="2" goto deploy
if "%choice%"=="3" goto run_last_script
if "%choice%"=="4" goto set_api_key

goto invalid_choice

:git_push
echo Running Git Push (first script only)...
node "C:\Users\ashis\Desktop\full-app\index1.js"
echo Git Push completed.
goto end

:deploy
echo Running Deploy (first and second script)...
node "C:\Users\ashis\Desktop\full-app\index1.js"
echo First command finished. Running second command...
node "C:\Users\ashis\Desktop\full-app\index2.js"
echo Deploy completed.
goto end

:run_last_script
echo Running Last Script (second script only)...
node "C:\Users\ashis\Desktop\full-app\index3.js"
echo Last Script completed.
goto end

:set_api_key
echo Setting API Key...
node "C:\Users\ashis\Desktop\full-app\set.js"
echo API Key set.
goto end

:invalid_choice
echo Invalid choice. Please run the script again and select 1, 2, 3, or 4.

:end
pause