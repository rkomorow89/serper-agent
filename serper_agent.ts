#!/usr/bin/env tsx
/**
 * KI-Suchagent mit echter Websuche (Serper API)
 * Verwendet Google Search für aktuelle, relevante Ergebnisse
 */
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as fs from "fs";
import { config } from "dotenv";

// Lade Environment-Variablen
config();

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SearchResult {
  title: string;
  url: string;
  description: string;
  source: string;
  relevance: number;
  position?: number;
}

// ─── Setup ─────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const RESP_DIR   = join(__dirname, "responses");

// Stelle sicher, dass responses-Verzeichnis existiert
try {
  if (!fs.existsSync(RESP_DIR)) {
    fs.mkdirSync(RESP_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Warnung: Konnte responses-Verzeichnis nicht erstellen:", error.message);
}

const PROMPT = globalThis.process?.argv[2] ?? "Aktuelle Forschung und Entwicklungen";
const MAX_RESULTS = Number.parseInt(globalThis.process?.argv[3] ?? "3", 10);

console.log(`\n>>> Universeller Recherche-Agent (Mit echter Websuche)`);
console.log(`${"=".repeat(60)}`);
console.log(`Suchanfrage: ${PROMPT}`);
console.log(`Gewünschte Quellen: ${MAX_RESULTS}\n`);

// ─── Serper API (Google Search) ───────────────────────────────────────────────
async function searchWithSerperAPI(query: string, maxResults: number = 5) {
  const SERPER_API_KEY = globalThis.process?.env.SERPER_API_KEY;
  
  if (!SERPER_API_KEY) {
    console.log("WARNUNG: SERPER_API_KEY nicht in .env gesetzt - verwende Fallback-Ergebnisse");
    return null;
  }

  try {
    console.log(">>> Führe echte Google-Suche durch (Serper API)...");
    
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(maxResults * 2, 20), // Mehr Ergebnisse für bessere Auswahl
        gl: "de", // Deutschland
        hl: "de"  // Deutsch
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.organic && data.organic.length > 0) {
        console.log(`   [OK] ${data.organic.length} echte Google-Ergebnisse gefunden`);
        
        return data.organic.slice(0, maxResults).map((result: any, index: number) => ({
          title: result.title || "Unbekannter Titel",
          url: result.link || "",
          description: result.snippet || "Keine Beschreibung verfügbar",
          source: new URL(result.link || "").hostname || "Unbekannt",
          relevance: Math.max(0.95 - (index * 0.1), 0.5), // Hohe Relevanz für echte Ergebnisse
          position: index + 1
        }));
    }
    
    console.log("[WARNUNG] Keine Ergebnisse von Serper API erhalten");
    return null;
    
  } catch (error) {
    console.log(`[FEHLER] Serper API fehlgeschlagen: ${error.message}`);
    return null;
  }
}

// ─── LLM Setup ────────────────────────────────────────────────────────────────
const MODEL_NAME = globalThis.process?.env.MODEL_NAME ?? "llama3.2";
const OLLAMA_URL = globalThis.process?.env.OLLAMA_URL ?? "http://localhost:11434";

// Direkte Ollama API-Funktion
async function callOllamaAPI(prompt: string, model: string = MODEL_NAME): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.response) {
      return data.response;
    } else {
      throw new Error("Keine response im Ollama-Antwort-Objekt gefunden");
    }
  } catch (error) {
    throw error;
  }
}

// ─── Hauptfunktion ────────────────────────────────────────────────────────────
async function analyzeSearchResults(searchResults: SearchResult[], query: string) {
  const searchContext = searchResults.map((result, index) => 
    `${index + 1}. ${result.title}\n   Quelle: ${result.source}\n   Beschreibung: ${result.description}\n   URL: ${result.url}\n   Relevanz: ${(result.relevance * 100).toFixed(1)}%`
  ).join("\n\n");

  console.log("   [INFO] Generiere KI-Zusammenfassung mit Ollama...");
  
  const prompt = `Du bist ein deutscher Experte für die Analyse von Suchergebnissen. Analysiere die folgenden Suchergebnisse zum Thema "${query}" und erstelle eine umfassende, professionelle Zusammenfassung in hochwertigem Deutsch.

SUCHERGEBNISSE:
${searchContext}

Erstelle eine strukturierte Analyse mit folgenden Abschnitten:

## 1. EXECUTIVE SUMMARY
Schreibe 2-3 prägnante Sätze, die die wichtigsten Erkenntnisse zusammenfassen.

## 2. HAUPTERKENNTNISSE  
Liste 3-5 konkrete Bulletpoints mit den wichtigsten Informationen auf:
• [Erkenntnisse basierend auf den Suchergebnissen]

## 3. QUELLENANALYSE
Bewerte die Qualität und Vertrauenswürdigkeit der gefundenen Quellen.

## 4. EMPFEHLUNGEN
Gib konkrete nächste Schritte für weitere Recherchen an.

WICHTIG: 
- Verwende nur korrekte deutsche Grammatik und Rechtschreibung
- Schreibe professionell und verständlich
- Beziehe dich nur auf die tatsächlich vorliegenden Suchergebnisse
- Keine Spekulationen oder erfundenen Inhalte

Antworte ausschließlich auf Deutsch.`;

  try {
    const llmAnalysis = await callOllamaAPI(prompt, MODEL_NAME);
    
    if (!llmAnalysis || !llmAnalysis.trim()) {
      throw new Error("Leere Antwort von Ollama erhalten");
    }

    console.log(`   [OK] KI-Analyse erfolgreich generiert`);
    
    return `# RECHERCHE-REPORT: ${query}

${llmAnalysis}

---

## DETAILLIERTE QUELLENÜBERSICHT
${searchResults.map((result, index) => 
  `**${index + 1}. ${result.title}**
- Quelle: ${result.source}
- Relevanz: ${(result.relevance * 100).toFixed(1)}%
- Beschreibung: ${result.description}
- URL: ${result.url}`
).join('\n\n')}

---
*Report generiert am ${new Date().toLocaleString('de-DE')} | Quellen: ${searchResults.length} | KI-Model: ${MODEL_NAME} (Direkte Ollama API)*`;

  } catch (error) {
    console.log(`   [FEHLER] Ollama-Analyse fehlgeschlagen: ${error.message}`);
    
    // Prüfe ob Ollama läuft
    try {
      const healthResponse = await fetch(`${OLLAMA_URL}/api/tags`);
      if (healthResponse.ok) {
        console.log("   [INFO] Ollama läuft, aber Modell-Generierung fehlgeschlagen");
      } else {
        console.log("   [WARNUNG] Ollama ist nicht erreichbar - prüfen Sie ob Ollama läuft");
      }
    } catch (pingError) {
      console.log("   [WARNUNG] Ollama ist nicht erreichbar - starten Sie Ollama mit 'ollama serve'");
    }
    
    throw new Error(`KI-Analyse fehlgeschlagen: ${error.message}. Stellen Sie sicher, dass Ollama läuft und das Modell '${MODEL_NAME}' verfügbar ist. Für bessere deutsche Texte empfehlen wir: 'ollama pull llama3.2' oder 'ollama pull mistral'.`);
  }
}

// ─── Report-Export ────────────────────────────────────────────────────────────
function saveResults(analysis: string, searchResults: SearchResult[], query: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  
  const reportData = {
    query: query,
    timestamp: new Date().toISOString(),
    analysis: analysis,
    searchResults: searchResults,
    summary: {
      totalSources: searchResults.length,
      averageRelevance: (searchResults.reduce((sum, r) => sum + r.relevance, 0) / searchResults.length * 100).toFixed(1) + "%",
      topSource: searchResults[0]?.source || "Unbekannt"
    },
    apiUsed: "Serper API (Google)"
  };
  
  const urls = [...new Set(searchResults.map(r => r.url))];
  
  try {
    // Vollständiger Report
    const reportPath = join(RESP_DIR, `recherche_report_${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    // URLs separat
    const urlsPath = join(RESP_DIR, `gefundene_urls_${timestamp}.json`);
    fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
    
    return { reportPath, urlsPath };
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    return null;
  }
}

// ─── Hauptausführung ──────────────────────────────────────────────────────────
async function main() {
  try {
    console.log(">>> Starte universelle Websuche...");
    
    // Versuche echte Websuche
    let searchResults = await searchWithSerperAPI(PROMPT, MAX_RESULTS);
    let dataSource = "";
    
    if (searchResults && searchResults.length > 0) {
      // Behalte nur die Top-Ergebnisse
      const topResults = searchResults.slice(0, MAX_RESULTS);
      console.log(`[OK] ${topResults.length} echte Suchergebnisse erhalten\n`);
      searchResults = topResults;
      dataSource = "Echte Google-Suche (Serper API)";
    } else {
      throw new Error("Keine Suchergebnisse gefunden. Stellen Sie sicher, dass die SERPER_API_KEY korrekt konfiguriert ist.");
    }

    // Analysiere Ergebnisse
    console.log("[INFO] Erstelle KI-gestützte Zusammenfassung...\n");
    const analysis = await analyzeSearchResults(searchResults, PROMPT);
    
    // Zeige die generierte KI-Zusammenfassung prominent in der Konsole
    console.log("\n" + "=".repeat(80));
    console.log("KI-GENERIERTE ZUSAMMENFASSUNG");
    console.log("=".repeat(80));
    console.log(analysis);
    console.log("=".repeat(80) + "\n");
    
    console.log("ZUSAETZLICHE INFORMATIONEN:");
    console.log(`• Suchanfrage: "${PROMPT}"`);
    console.log(`• Anzahl Quellen: ${searchResults.length}`);
    console.log(`• Datenquelle: ${dataSource}`);
    console.log(`• Durchschnittliche Relevanz: ${(searchResults.reduce((sum, r) => sum + r.relevance, 0) / searchResults.length * 100).toFixed(1)}%`);
    console.log(`• Zeitstempel: ${new Date().toLocaleString('de-DE')}\n`);
    
    // Erstelle Report-Objekt für Speicherung
    const reportData = {
      query: PROMPT,
      timestamp: new Date().toISOString(),
      analysis: analysis,
      searchResults: searchResults,
      summary: {
        totalSources: searchResults.length,
        averageRelevance: (searchResults.reduce((sum, r) => sum + r.relevance, 0) / searchResults.length * 100).toFixed(1) + "%",
        topSource: searchResults[0]?.source || "Unbekannt"
      },
      apiUsed: dataSource
    };

    // Zeige Ergebnisse
    console.log("[INFO] RECHERCHE-ERGEBNISSE");
    console.log("=".repeat(40));
    console.log(`Thema: ${PROMPT}`);
    console.log(`Datenquelle: ${dataSource}`);
    console.log(`API: ${reportData.apiUsed}\n`);

    searchResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   Quelle: ${result.source || 'Unbekannt'}`);
      if (result.relevance) {
        console.log(`   Relevanz: ${(result.relevance * 100).toFixed(1)}%`);
      }
      console.log(`   URL: ${result.url}`);
    });

    // Zeige Zusammenfassung
    console.log(`\n[INFO] ZUSAMMENFASSUNG`);
    console.log("=".repeat(40));
    console.log(`[OK] Gefundene Quellen: ${reportData.summary.totalSources}`);
    console.log(`Durchschnittliche Relevanz: ${reportData.summary.averageRelevance}`);
    console.log(`Verwendete API: ${reportData.apiUsed}`);

    // Speichere Ergebnisse
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const urls = [...new Set(searchResults.map(r => r.url))];
    
    try {
      const reportPath = join(RESP_DIR, `recherche_report_${timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`\n[SAVE] Vollständiger Report gespeichert: ${reportPath}`);

      const urlsPath = join(RESP_DIR, `gefundene_urls_${timestamp}.json`);
      fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
      console.log(`[SAVE] URLs gespeichert: ${urlsPath}`);
    } catch (saveError) {
      console.log(`[WARNUNG] Konnte Dateien nicht speichern: ${saveError.message}`);
    }

    console.log(`\n[SUCCESS] Universelle Recherche erfolgreich abgeschlossen!`);
    console.log(`Zeitstempel: ${new Date().toLocaleString('de-DE')}`);
    console.log(`Echte Websuche: ${searchResults.length > 0 ? '[OK] Erfolg' : '[INFO] Fallback verwendet'}`);
    
  } catch (error) {
    console.error(`[FEHLER] Hauptfehler: ${error.message}`);
    throw error; // Let the error bubble up instead of using process.exit
  }
}

// Führe das Programm aus
main().catch(console.error);
