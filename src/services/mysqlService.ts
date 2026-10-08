import { MySQLConnectionConfig, DBSetupStatus, DBMigrationResult } from '../types/database';
import { getFullMySQLSchemaSQL, getMySQLSeedDataSQL } from './mysqlSchema';

const MYSQL_CONFIG_KEY = 'jiguli_mysql_connection_v1';

export const DEFAULT_DEMO_MYSQL_CONFIG: MySQLConnectionConfig = {
  host: '127.0.0.1',
  port: 3306,
  database: 'jiguli_db',
  user: 'root',
  password: '',
  ssl: false,
  prefix: 'jiguli_',
  charset: 'utf8mb4'
};

class MySQLClientService {
  private config: MySQLConnectionConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public loadConfig(): MySQLConnectionConfig {
    try {
      const stored = localStorage.getItem(MYSQL_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return { ...DEFAULT_DEMO_MYSQL_CONFIG };
  }

  public saveConfig(config: MySQLConnectionConfig): void {
    this.config = { ...config };
    try {
      localStorage.setItem(MYSQL_CONFIG_KEY, JSON.stringify(config));
    } catch {}
  }

  public getConfig(): MySQLConnectionConfig {
    return { ...this.config };
  }

  public async testConnection(customConfig?: MySQLConnectionConfig): Promise<{
    success: boolean;
    latencyMs?: number;
    serverVersion?: string;
    message: string;
    details?: any;
  }> {
    const targetConfig = customConfig || this.config;
    try {
      const res = await fetch('/api/mysql/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetConfig)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: `Sunucu API isteği başarısız: ${err?.message || err}`
      };
    }
  }

  public async installSchema(customConfig?: MySQLConnectionConfig): Promise<DBMigrationResult> {
    const targetConfig = customConfig || this.config;
    try {
      const res = await fetch('/api/mysql/install-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetConfig)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        installedTables: [],
        message: `Veritabanı kurulum isteği başarısız: ${err?.message || err}`
      };
    }
  }

  public async getDatabaseStatus(customConfig?: MySQLConnectionConfig): Promise<DBSetupStatus> {
    const targetConfig = customConfig || this.config;
    try {
      const res = await fetch('/api/mysql/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetConfig)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        isConfigured: !!targetConfig.host && !!targetConfig.database,
        isConnected: false,
        isInstalled: false,
        tables: [],
        totalRecords: 0,
        error: err?.message || 'Durum alınamadı'
      };
    }
  }

  public async syncAllData(allData: any, customConfig?: MySQLConnectionConfig): Promise<{
    success: boolean;
    syncedCounts: Record<string, number>;
    message: string;
  }> {
    const targetConfig = customConfig || this.config;
    try {
      const res = await fetch('/api/mysql/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: targetConfig, data: allData })
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        syncedCounts: {},
        message: `Senkronizasyon hatası: ${err?.message || err}`
      };
    }
  }

  public async fetchRemoteData(customConfig?: MySQLConnectionConfig): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    const targetConfig = customConfig || this.config;
    try {
      const res = await fetch('/api/mysql/pull-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetConfig)
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: `Veri çekme hatası: ${err?.message || err}`
      };
    }
  }

  public generateFullSQLScript(prefix?: string): string {
    const p = prefix || this.config.prefix || 'jiguli_';
    return `${getFullMySQLSchemaSQL(p)}\n\n${getMySQLSeedDataSQL(p)}`;
  }

  public downloadSQLDump(prefix?: string): void {
    const sql = this.generateFullSQLScript(prefix);
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jiguli_mysql_schema_${new Date().toISOString().slice(0, 10)}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const mysqlService = new MySQLClientService();
