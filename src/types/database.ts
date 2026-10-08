export interface MySQLConnectionConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl?: boolean;
  prefix?: string;
  charset?: string;
  connectionTimeout?: number;
}

export interface DBTableStatus {
  tableName: string;
  displayName: string;
  description: string;
  rowCount: number;
  status: 'ready' | 'missing' | 'error' | 'syncing';
  lastSync?: string;
  primaryKey: string;
}

export interface DBSetupStatus {
  isConfigured: boolean;
  isConnected: boolean;
  isInstalled: boolean;
  serverVersion?: string;
  latencyMs?: number;
  tables: DBTableStatus[];
  totalRecords: number;
  lastTestedAt?: string;
  error?: string;
}

export interface DBMigrationResult {
  success: boolean;
  installedTables: string[];
  errors?: string[];
  message: string;
}
