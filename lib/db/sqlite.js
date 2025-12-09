/**
 * SQLite Database Client
 * 
 * Cache pour les données de ticker activity
 * Évite les appels API répétés et les chargements infinis
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), ".data", "ticker-activity.db");

// Créer le dossier .data s'il n'existe pas
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

/**
 * Initialiser la connexion DB
 */
function getDB() {
  if (db) return db;

  db = new Database(DB_PATH);
  
  // Activer les clés étrangères
  db.pragma("foreign_keys = ON");

  // Créer les tables
  initializeTables();

  return db;
}

/**
 * Créer les tables nécessaires
 */
function initializeTables() {
  const db = getDB();

  // Table pour le cache des quotes
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      ticker TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour le cache de l'ownership institutionnel
  db.exec(`
    CREATE TABLE IF NOT EXISTS institutional_ownership (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      shares REAL,
      units REAL,
      value REAL,
      is_hedge_fund INTEGER DEFAULT 0,
      report_date TEXT,
      filing_date TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ticker, institution_name, report_date)
    )
  `);

  // Table pour le cache des transactions institutionnelles
  db.exec(`
    CREATE TABLE IF NOT EXISTS institutional_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      institution_name TEXT,
      units_change REAL,
      change REAL,
      avg_price REAL,
      buy_price REAL,
      sell_price REAL,
      filing_date TEXT,
      report_date TEXT,
      price_on_filing REAL,
      price_on_report REAL,
      close REAL,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour le cache des hedge funds holdings
  db.exec(`
    CREATE TABLE IF NOT EXISTS hedge_fund_holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      hedge_fund_name TEXT NOT NULL,
      shares REAL,
      units REAL,
      value REAL,
      report_date TEXT,
      filing_date TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ticker, hedge_fund_name, report_date)
    )
  `);

  // Table pour le cache des transactions insiders
  db.exec(`
    CREATE TABLE IF NOT EXISTS insider_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      owner_name TEXT,
      officer_title TEXT,
      transaction_code TEXT,
      acquisitionOrDisposition TEXT,
      amount REAL,
      transaction_date TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour le cache des transactions du Congrès
  db.exec(`
    CREATE TABLE IF NOT EXISTS congress_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      name TEXT,
      member_type TEXT,
      txn_type TEXT,
      amounts TEXT,
      transaction_date TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour le cache des options flow
  db.exec(`
    CREATE TABLE IF NOT EXISTS options_flow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      type TEXT,
      strike REAL,
      total_premium REAL,
      premium REAL,
      volume INTEGER,
      expiry TEXT,
      created_at TEXT,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour le cache des dark pool trades
  db.exec(`
    CREATE TABLE IF NOT EXISTS dark_pool_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      date TEXT,
      volume REAL,
      size REAL,
      price REAL,
      value REAL,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Index pour améliorer les performances
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ownership_ticker ON institutional_ownership(ticker);
    CREATE INDEX IF NOT EXISTS idx_activity_ticker ON institutional_activity(ticker);
    CREATE INDEX IF NOT EXISTS idx_hedge_funds_ticker ON hedge_fund_holdings(ticker);
    CREATE INDEX IF NOT EXISTS idx_insiders_ticker ON insider_trades(ticker);
    CREATE INDEX IF NOT EXISTS idx_congress_ticker ON congress_trades(ticker);
    CREATE INDEX IF NOT EXISTS idx_options_ticker ON options_flow(ticker);
    CREATE INDEX IF NOT EXISTS idx_darkpool_ticker ON dark_pool_trades(ticker);
  `);
}

/**
 * Vérifier si les données sont fraîches (TTL en heures)
 */
function isDataFresh(updatedAt, ttlHours = 24) {
  if (!updatedAt) return false;
  
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffHours = (now - updated) / (1000 * 60 * 60);
  
  return diffHours < ttlHours;
}

/**
 * Cache des quotes
 */
export const quoteCache = {
  get(ticker) {
    const db = getDB();
    const row = db.prepare("SELECT data, updated_at FROM quotes WHERE ticker = ?").get(ticker);
    
    if (!row) return null;
    if (!isDataFresh(row.updated_at, 1)) return null; // TTL de 1 heure pour les quotes
    
    return JSON.parse(row.data);
  },

  set(ticker, data) {
    const db = getDB();
    db.prepare("INSERT OR REPLACE INTO quotes (ticker, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
      .run(ticker, JSON.stringify(data));
  },
};

/**
 * Cache de l'ownership institutionnel
 */
export const ownershipCache = {
  get(ticker) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM institutional_ownership 
      WHERE ticker = ?
      ORDER BY shares DESC
    `).all(ticker);
    
    if (rows.length === 0) return null;
    
    // Vérifier si les données sont fraîches
    const firstRow = rows[0];
    if (!isDataFresh(firstRow.updated_at, 24)) {
      return null; // Données expirées
    }
    
    return rows.map(row => ({
      name: row.institution_name,
      shares: row.shares,
      units: row.units,
      value: row.value,
      is_hedge_fund: row.is_hedge_fund === 1,
      report_date: row.report_date,
      filing_date: row.filing_date,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT OR REPLACE INTO institutional_ownership 
      (ticker, institution_name, shares, units, value, is_hedge_fund, report_date, filing_date, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.name || item.institution_name,
          item.shares || item.units || 0,
          item.units || item.shares || 0,
          item.value || 0,
          item.is_hedge_fund ? 1 : 0,
          item.report_date,
          item.filing_date,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Cache des transactions institutionnelles
 */
export const activityCache = {
  get(ticker, limit = 100) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM institutional_activity 
      WHERE ticker = ? 
      ORDER BY filing_date DESC 
      LIMIT ?
    `).all(ticker, limit);
    
    if (rows.length === 0) return null;
    
    return rows.map(row => ({
      institution_name: row.institution_name,
      units_change: row.units_change || row.change,
      change: row.change || row.units_change,
      avg_price: row.avg_price,
      buy_price: row.buy_price,
      sell_price: row.sell_price,
      filing_date: row.filing_date,
      report_date: row.report_date,
      price_on_filing: row.price_on_filing,
      price_on_report: row.price_on_report,
      close: row.close,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT OR REPLACE INTO institutional_activity 
      (ticker, institution_name, units_change, change, avg_price, buy_price, sell_price, 
       filing_date, report_date, price_on_filing, price_on_report, close, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.institution_name || item.name,
          item.units_change || item.change || 0,
          item.change || item.units_change || 0,
          item.avg_price,
          item.buy_price,
          item.sell_price,
          item.filing_date,
          item.report_date,
          item.price_on_filing,
          item.price_on_report,
          item.close,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Cache des hedge funds
 */
export const hedgeFundCache = {
  get(ticker) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM hedge_fund_holdings 
      WHERE ticker = ?
      ORDER BY shares DESC
    `).all(ticker);
    
    if (rows.length === 0) return null;
    
    return rows.map(row => ({
      name: row.hedge_fund_name,
      shares: row.shares || row.units,
      units: row.units || row.shares,
      value: row.value,
      report_date: row.report_date,
      filing_date: row.filing_date,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT OR REPLACE INTO hedge_fund_holdings 
      (ticker, hedge_fund_name, shares, units, value, report_date, filing_date, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.name || item.hedge_fund_name,
          item.shares || item.units || 0,
          item.units || item.shares || 0,
          item.value || 0,
          item.report_date,
          item.filing_date,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Cache des insiders
 */
export const insiderCache = {
  get(ticker, limit = 100) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM insider_trades 
      WHERE ticker = ?
      ORDER BY transaction_date DESC
      LIMIT ?
    `).all(ticker, limit);
    
    if (rows.length === 0) return null;
    
    return rows.map(row => ({
      owner_name: row.owner_name,
      officer_title: row.officer_title,
      transaction_code: row.transaction_code,
      acquisitionOrDisposition: row.acquisitionOrDisposition,
      amount: row.amount,
      transaction_date: row.transaction_date,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT INTO insider_trades 
      (ticker, owner_name, officer_title, transaction_code, acquisitionOrDisposition, amount, transaction_date, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.owner_name,
          item.officer_title,
          item.transaction_code,
          item.acquisitionOrDisposition,
          item.amount,
          item.transaction_date,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Cache des transactions du Congrès
 */
export const congressCache = {
  get(ticker, limit = 100) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM congress_trades 
      WHERE ticker = ?
      ORDER BY transaction_date DESC
      LIMIT ?
    `).all(ticker, limit);
    
    if (rows.length === 0) return null;
    
    return rows.map(row => ({
      name: row.name,
      member_type: row.member_type,
      txn_type: row.txn_type,
      amounts: row.amounts,
      transaction_date: row.transaction_date,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT INTO congress_trades 
      (ticker, name, member_type, txn_type, amounts, transaction_date, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.name,
          item.member_type,
          item.txn_type,
          item.amounts,
          item.transaction_date,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Cache des options flow
 */
export const optionsCache = {
  get(ticker, limit = 100) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM options_flow 
      WHERE ticker = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(ticker, limit);
    
    if (rows.length === 0) return null;
    
    return rows.map(row => ({
      type: row.type,
      strike: row.strike,
      total_premium: row.total_premium || row.premium,
      premium: row.premium || row.total_premium,
      volume: row.volume,
      expiry: row.expiry,
      created_at: row.created_at,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT INTO options_flow 
      (ticker, type, strike, total_premium, premium, volume, expiry, created_at, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.type,
          item.strike,
          item.total_premium || item.premium,
          item.premium || item.total_premium,
          item.volume,
          item.expiry,
          item.created_at,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Cache des dark pool trades
 */
export const darkPoolCache = {
  get(ticker, limit = 100) {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM dark_pool_trades 
      WHERE ticker = ?
      ORDER BY date DESC
      LIMIT ?
    `).all(ticker, limit);
    
    if (rows.length === 0) return null;
    
    return rows.map(row => ({
      date: row.date,
      volume: row.volume || row.size,
      size: row.size || row.volume,
      price: row.price,
      value: row.value,
      ...(row.data ? JSON.parse(row.data) : {}),
    }));
  },

  set(ticker, data) {
    const db = getDB();
    const insert = db.prepare(`
      INSERT INTO dark_pool_trades 
      (ticker, date, volume, size, price, value, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          ticker,
          item.date,
          item.volume || item.size || 0,
          item.size || item.volume || 0,
          item.price,
          item.value,
          JSON.stringify(item)
        );
      }
    });

    transaction(data);
  },
};

/**
 * Nettoyer les données expirées (TTL > 7 jours)
 */
export function cleanupExpiredData() {
  const db = getDB();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  db.prepare("DELETE FROM quotes WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM institutional_ownership WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM institutional_activity WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM hedge_fund_holdings WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM insider_trades WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM congress_trades WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM options_flow WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
  db.prepare("DELETE FROM dark_pool_trades WHERE updated_at < ?").run(sevenDaysAgo.toISOString());
}

