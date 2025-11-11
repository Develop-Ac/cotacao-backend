import { Injectable } from '@nestjs/common';
import { OpenQueryService } from '../../../shared/database/openquery/openquery.service';

@Injectable()
export class NotaFiscalService {
  constructor(private readonly openQueryService: OpenQueryService) {}

  async getNfeDistribuicao() {
    const query = `
      SELECT * FROM NFE_DISTRIBUICAO NFD
      LEFT JOIN nf_entrada_xml XML
        ON (XML.empresa = NFD.EMPRESA)
        AND (XML.chave_nfe = NFD.chave_nfe)
      WHERE NFD.importada = 'N'
      AND NFD.situacao_nfe = 1
      AND NFD.EMPRESA = 1
    `;
    return this.openQueryService.query(query);
  }
}