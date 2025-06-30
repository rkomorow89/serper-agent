@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Recherche-Agent

echo ==============================================
echo Recherche-Agent
echo ==============================================
echo.

:start_menu
echo [1] Agent mit Standardparametern starten
echo [2] Agent mit eigenen Parametern starten  
echo [3] Beenden
echo.
set /p choice="Ihre Wahl (1-3): "

if "%choice%"=="1" goto :standard_run
if "%choice%"=="2" goto :custom_run
if "%choice%"=="3" goto :end
echo Ungültige Eingabe. Bitte 1-3 wählen.
goto :start_menu

:standard_run
echo.
echo Starte Agent mit Standardparametern...
echo Kommando: npx tsx serper_agent.ts "KI Nachhaltigkeit" 3
echo.
echo Bitte warten - Agent wird gestartet...
echo.

call npx tsx serper_agent.ts "KI Nachhaltigkeit" 3
set AGENT_EXIT_CODE=%ERRORLEVEL%

echo.
echo ==============================================
if %AGENT_EXIT_CODE% neq 0 (
    echo [FEHLER] Agent beendet mit Fehlercode: %AGENT_EXIT_CODE%
    echo.
    echo Mögliche Ursachen:
    echo - TypeScript-Fehler in serper_agent.ts
    echo - Fehlende npm-Pakete
    echo.
    echo LÖSUNGSVORSCHLÄGE:
    echo 1. Führen Sie 'npm install' aus
) else (
    echo [ERFOLG] Agent erfolgreich ausgeführt!
    echo Überprüfen Sie den responses/ Ordner für Ergebnisse.
)
echo ==============================================
echo.
pause
goto :start_menu

:custom_run
echo.
set /p search_query="Geben Sie Ihre Suchanfrage ein: "
if "!search_query!"=="" set search_query=Aktuelle Forschung

set /p num_results="Anzahl der Ergebnisse (Standard 3): "
if "!num_results!"=="" set num_results=3

echo.
echo Starte Agent...
echo Kommando: npx tsx serper_agent.ts "!search_query!" !num_results!
echo.
echo Bitte warten - Agent wird gestartet...
echo.

REM Führe Kommando aus und fange Fehler ab
call npx tsx serper_agent.ts "!search_query!" !num_results!
set AGENT_EXIT_CODE=%ERRORLEVEL%

echo.
echo ==============================================
if %AGENT_EXIT_CODE% neq 0 (
    echo [FEHLER] Agent beendet mit Fehlercode: %AGENT_EXIT_CODE%
    echo.
    echo Mögliche Ursachen:
    echo - TypeScript-Fehler in serper_agent.ts
    echo - Fehlende npm-Pakete
    echo - Netzwerk-Probleme
    echo.
    echo LÖSUNGSVORSCHLÄGE:
    echo 1. Führen Sie 'npm install' aus
    echo 2. Prüfen Sie serper_agent.ts auf Syntaxfehler
) else (
    echo [ERFOLG] Agent erfolgreich ausgeführt!
    echo Überprüfen Sie den responses/ Ordner für Ergebnisse.
)
echo ==============================================
echo.
pause
goto :start_menu

:end
echo.
echo Auf Wiedersehen!
echo.
pause
