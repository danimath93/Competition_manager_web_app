@echo off
echo ===============================================
echo   Martial Arts Competition Management
echo   Docker Setup Script
echo ===============================================
echo.

:MENU
echo Seleziona un'opzione:
echo 1. Avvia in modalita sviluppo (con hot-reload)
echo 2. Avvia in modalita produzione
echo 3. Ferma tutti i servizi
echo 4. Popola database con dati di esempio
echo 5. Visualizza logs
echo 6. Pulizia completa
echo 7. Rebuild completo (sviluppo)
echo 8. Mostra stato servizi
echo 0. Esci
echo.
set /p choice="Inserisci la tua scelta (0-8): "

if "%choice%"=="1" goto DEV_START
if "%choice%"=="2" goto PROD_START
if "%choice%"=="3" goto STOP
if "%choice%"=="4" goto SEED
if "%choice%"=="5" goto LOGS
if "%choice%"=="6" goto CLEAN
if "%choice%"=="7" goto REBUILD
if "%choice%"=="8" goto STATUS
if "%choice%"=="0" goto EXIT
echo Opzione non valida. Riprova.
goto MENU

:DEV_START
echo.
echo Avvio in modalita sviluppo...
docker-compose -f docker-compose.dev.yml up -d
echo.
echo Servizi avviati:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3050
echo.
pause
goto MENU

:PROD_START
echo.
echo Avvio in modalita produzione...
docker-compose up -d
echo.
echo Servizi avviati:
echo - Frontend: http://localhost
echo - Backend: http://localhost:3050
echo.
pause
goto MENU

:STOP
echo.
echo Fermando tutti i servizi...
docker-compose -f docker-compose.dev.yml down
docker-compose down
echo Servizi fermati.
pause
goto MENU

:SEED
echo.
echo Popolando il database con dati di esempio...
docker-compose -f docker-compose.dev.yml exec backend-dev npm run seed
echo Database popolato.
pause
goto MENU

:LOGS
echo.
echo Visualizzando logs (Ctrl+C per uscire)...
docker-compose -f docker-compose.dev.yml logs -f
pause
goto MENU

:CLEAN
echo.
echo ATTENZIONE: Questa operazione eliminera tutti i dati!
set /p confirm="Sei sicuro? (s/n): "
if /i "%confirm%"=="s" (
    echo Pulizia in corso...
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo Pulizia completata.
) else (
    echo Operazione annullata.
)
pause
goto MENU

:REBUILD
echo.
echo Rebuild completo in modalita sviluppo...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
echo Rebuild completato.
pause
goto MENU

:STATUS
echo.
echo Stato dei servizi:
docker-compose -f docker-compose.dev.yml ps
echo.
pause
goto MENU

:EXIT
echo.
echo Arrivederci!
pause
exit /b 0
