import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';

@Injectable()
export class UtilsRepository {
  private readonly logger = new Logger(UtilsRepository.name);

  constructor(private readonly mssql: sql.ConnectionPool) {}

  async listAllTableNames(): Promise<string[]> {
    const req = new sql.Request(this.mssql);
    const query = `
      SELECT t.[name] AS table_name
      FROM sys.tables AS t
      ORDER BY t.[name];
    `;
    const res = await req.query<{ table_name: string }>(query);
    const names = res.recordset.map((r) => r.table_name);
    return names;
  }
}
