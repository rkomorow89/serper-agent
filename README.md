# Recherche-Agent für Websuche mit LLM-Analyse

Ein intelligenter Recherche-Agent, der echte Google-Suchergebnisse über die Serper API abruft und mit Hilfe von Ollama/LLM analysiert und zusammenfasst.

## 🚀 Schnellstart

### Schritt 1: Batch-Datei ausführen

```bash
start_agent.bat
```

Dann wählen Sie eine Option:

- **[1]** Agent mit Standardparametern starten (Suche: "KI Nachhaltigkeit", 3 Ergebnisse)
- **[2]** Agent mit eigenen Parametern starten (eigene Suchanfrage und Anzahl)
- **[3]** Beenden

### Schritt 2: Ergebnisse prüfen

Die Ergebnisse werden im `responses/` Ordner gespeichert.

## 📋 Voraussetzungen

### 1. Node.js und npm

- **Node.js** (Version 18 oder höher)
- **npm** (wird mit Node.js installiert)

**Installation:** Laden Sie Node.js von [nodejs.org](https://nodejs.org/) herunter.

### 2. TSX (TypeScript Executor)

```bash
npm install -g tsx
```

### 3. Benötigte Node-Pakete

```bash
npm install dotenv
```

### 4. Ollama (Local LLM)

- **Ollama** muss installiert und gestartet sein
- **Installation:** [ollama.com](https://ollama.com/)
- **Empfohlenes Modell:** `llama3.2` (beste Qualität für deutsche Texte)
- **Konfiguration:** Das Modell kann über die `.env`-Datei angepasst werden

```bash
# Ollama installieren und Modell laden
ollama pull llama3.2

# Weitere empfohlene Modelle für deutsche Texte:
ollama pull mistral
ollama pull llama3
```

### 5. Serper API Key

- Kostenlosen API-Key von [serper.dev](https://serper.dev/) erhalten
- Der Key ist bereits in der `.env` Datei konfiguriert
- **Wichtig:** Halten Sie Ihren API-Key geheim!

## 🔧 Konfiguration

### Environment-Variablen (.env)

Die `.env` Datei enthält bereits die notwendigen Konfigurationen:

```env
# Serper API Configuration  
SERPER_API_KEY=ihr_api_key_hier

# Agent Configuration
MODEL_NAME=llama3.2
```

**Konfigurierbare Optionen:**

- `SERPER_API_KEY`: Ihr API-Schlüssel für die Serper-API
- `MODEL_NAME`: Das zu verwendende Ollama-Modell (Standard: `llama3.2`)

### Modell-Wechsel

Sie können einfach das verwendete LLM-Modell ändern, ohne den Code zu modifizieren:

```env
# Beispiele für verschiedene Modelle:
MODEL_NAME=llama3.2        # Beste Qualität für deutsche Texte (empfohlen)
MODEL_NAME=mistral         # Gute Balance zwischen Geschwindigkeit und Qualität
MODEL_NAME=llama3          # Leistungsstarkes Allround-Modell
```

**Hinweis:** Stellen Sie sicher, dass das gewählte Modell mit `ollama pull <model-name>` heruntergeladen wurde.

## 🛠️ Manuelle Ausführung

Falls Sie den Agent direkt über die Kommandozeile starten möchten:

```bash
# Mit Standardparametern
npx tsx serper_agent.ts "KI Nachhaltigkeit" 3

# Mit eigenen Parametern
npx tsx serper_agent.ts "Ihre Suchanfrage" 5
```

**Parameter:**

- `Argument 1`: Suchanfrage (String)
- `Argument 2`: Anzahl der Ergebnisse (Zahl)

## 📂 Projektstruktur

```text
search-agent-bee-framework/
├── serper_agent.ts     # Hauptskript des Recherche-Agents
├── start_agent.bat     # Windows Batch-Datei zum einfachen Starten
├── .env               # Environment-Variablen (API-Keys)
├── README.md          # Diese Dokumentation
└── responses/         # Ordner für Suchergebnisse (wird automatisch erstellt)
    ├── recherche_report_YYYY-MM-DDTHH-MM-SS-SSSZ.json  # Vollständiger Recherche-Report
    └── gefundene_urls_YYYY-MM-DDTHH-MM-SS-SSSZ.json    # Liste der gefundenen URLs
```

**Beispiel der generierten Dateien:**

- `recherche_report_2025-06-30T12-56-40-566Z.json` - Enthält Suchergebnisse, Analyse und Metadaten
- `gefundene_urls_2025-06-30T12-56-40-566Z.json` - Enthält nur die URLs der gefundenen Quellen

## 🔍 Funktionsweise

1. **Websuche**: Der Agent nutzt die Serper API für echte Google-Suchergebnisse
2. **KI-Analyse**: Das LLM (llama3.2) über Ollama analysiert und strukturiert die gefundenen Informationen
3. **Zusammenfassung**: Erstellt eine professionelle deutsche Zusammenfassung der Recherche-Ergebnisse
4. **Speicherung**: Alle Ergebnisse werden im `responses/` Ordner gespeichert

**Der Agent orchestriert verschiedene Tools:**

- **Serper API** → Echte Google-Suche
- **Ollama** → LLM-Hosting (llama3.2)  
- **LLM** → Textanalyse und Zusammenfassung
- **File System** → Datenpeicherung

## ⚠️ Fehlerbehebung

### Häufige Probleme und Lösungen

#### "npx tsx nicht gefunden"

```bash
npm install -g tsx
```

#### "dotenv nicht gefunden"

```bash
npm install dotenv
```

#### "Ollama Verbindungsfehler"

1. Stellen Sie sicher, dass Ollama läuft:

   ```bash
   ollama serve
   ```

2. Prüfen Sie, ob das Modell verfügbar ist:

   ```bash
   ollama list
   ```

#### "Serper API Fehler"

1. Prüfen Sie Ihren API-Key in der `.env` Datei
2. Stellen Sie sicher, dass Sie noch API-Guthaben haben
3. Prüfen Sie Ihre Internetverbindung

#### "Keine Ergebnisse gefunden"

- Prüfen Sie Ihre Suchanfrage auf Tippfehler
- Versuchen Sie andere Suchbegriffe
- Stellen Sie sicher, dass Ihr Serper API-Key gültig ist

## 🔒 Sicherheit

- **Niemals** Ihren API-Key in öffentlichen Repositories teilen
- Die `.env` Datei sollte nicht in Git committed werden
- Überwachen Sie Ihre API-Nutzung regelmäßig

## 📖 Verwendungsbeispiele

### Beispiel 1: Technologie-Recherche

```text
Suchanfrage: "Künstliche Intelligenz 2024 Trends"
Ergebnisse: 5
```

### Beispiel 2: Wissenschaftliche Forschung

```text
Suchanfrage: "Klimawandel aktuelle Studien"
Ergebnisse: 3
```

### Beispiel 3: Marktanalyse

```text
Suchanfrage: "Elektroauto Markt Deutschland"
Ergebnisse: 4
```

## ✅ Funktionsstatus

**Vollständig funktionsfähig:**

- ✅ Echte Google-Suche über Serper API
- ✅ LLM-basierte Analyse mit Ollama (llama3.2)
- ✅ Professionelle deutsche Zusammenfassungen
- ✅ Strukturierte JSON-Ausgabe
- ✅ Automatische Datenspeicherung
- ✅ Saubere, übersichtliche Konsolen-Ausgabe

**Architektur:**

- **Agent-Code:** TypeScript (`serper_agent.ts`) - orchestriert alle Tools
- **LLM:** llama3.2 über Ollama - reine Textverarbeitung, keine Tools
- **Web-API:** Serper (Google Search) - Datenquelle
- **Storage:** Lokales File System - Ergebnisspeicherung
