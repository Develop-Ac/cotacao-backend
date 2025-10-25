// src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import * as sql from 'mssql';

@Global()
@Module({
  providers: [
    {
      provide: 'MSSQL_POOL',
      useFactory: async () => {
        const {
          MSSQL_HOST = '192.168.1.145',
          MSSQL_PORT = '14333',
          MSSQL_DATABASE = 'Master',
          MSSQL_USER = 'sa',
          MSSQL_PASSWORD = 'Ac@2025acesso',
          MSSQL_ENCRYPT = 'false',
          MSSQL_TRUST_CERT = 'true',
        } = process.env;

        const config: sql.config = {
          server: MSSQL_HOST,
          port: parseInt(MSSQL_PORT, 10),
          database: MSSQL_DATABASE,
          user: MSSQL_USER,
          password: MSSQL_PASSWORD,
          options: {
            encrypt: MSSQL_ENCRYPT === 'true',
            trustServerCertificate: MSSQL_TRUST_CERT === 'true',
            enableArithAbort: true,
          },
          pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
        };

        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        return pool;
      },
    },
  ],
  exports: ['MSSQL_POOL'], // <<< importante
})
export class DatabaseModule {}
