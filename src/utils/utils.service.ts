import { Inject, Injectable, Logger } from '@nestjs/common';
import { UtilsRepository } from './utils.repository';

@Injectable()
export class UtilsService {
  private readonly logger = new Logger(UtilsService.name);

  constructor(private readonly repo: UtilsRepository) {}

  /** Lista APENAS os nomes das tabelas (sem schema) e imprime no console. */
  async listAllTableNames(): Promise<string[]> {
    const names = await this.repo.listAllTableNames();
    this.logger.log(`Total de tabelas: ${names.length}`);
    names.forEach((n) => console.log(n));
    return names;
  }
}
