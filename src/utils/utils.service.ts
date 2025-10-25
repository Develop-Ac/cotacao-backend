import { Inject, Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';

@Injectable()
export class UtilsService {
  private readonly logger = new Logger(UtilsService.name);

  constructor(@Inject('MSSQL_POOL') private readonly mssql: sql.ConnectionPool) {}

  /** Lista APENAS os nomes das tabelas (sem schema) e imprime no console. */
  async listAllTableNames(): Promise<string[]> {
    const req = new sql.Request(this.mssql);

    const query = `
      SELECT t.[name] AS table_name
      FROM sys.tables AS t
      ORDER BY t.[name];
    `;

    const res = await req.query<{ table_name: string }>(query);

    this.logger.log(`Total de tabelas: ${res.recordset.length}`);
    const names = res.recordset.map(r => r.table_name);
    names.forEach(n => console.log(n)); // imprime só o nome

    return names;
  }
}
