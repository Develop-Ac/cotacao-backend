# API de Contagem de Estoque

Este documento descreve o endpoint para registrar contagens de estoque realizadas pelos colaboradores.

## Endpoint

### POST /estoque/contagem

Registra uma nova contagem de estoque com os produtos verificados pelo colaborador.

#### Request Body

```json
{
    "colaborador": "DIOGO DA SILVA SANTOS",
    "contagem": 1,
    "produtos": [
        {
            "DATA": "2025-11-04T00:00:00.000Z",
            "COD_PRODUTO": 23251,
            "DESC_PRODUTO": "CAPA P/CHOQUE DIANT. S-10 12/16 PRETO LISO - DTS",
            "MAR_DESCRICAO": "DTS",
            "REF_FABRICANTE": null,
            "REF_FORNECEDOR": "056597",
            "LOCALIZACAO": "B1002A03",
            "UNIDADE": "UN",
            "QTDE_SAIDA": 1,
            "ESTOQUE": 8,
            "RESERVA": 2
        }
    ]
}
```

#### Campos obrigatórios
- `colaborador`: Nome do colaborador (deve existir na tabela `sis_usuarios`)
- `contagem`: Tipo da contagem (1, 2 ou 3)
- `produtos`: Array de produtos
  - `DATA`: Data do item (ISO string)
  - `COD_PRODUTO`: Código do produto (número)
  - `DESC_PRODUTO`: Descrição do produto (string)
  - `QTDE_SAIDA`: Quantidade de saída (número)
  - `ESTOQUE`: Quantidade em estoque (número)
  - `RESERVA`: Quantidade reservada (número)

#### Campos opcionais
- `MAR_DESCRICAO`: Descrição da marca
- `REF_FABRICANTE`: Referência do fabricante
- `REF_FORNECEDOR`: Referência do fornecedor
- `LOCALIZACAO`: Localização do produto
- `UNIDADE`: Unidade do produto

#### Response

```json
{
    "id": "clx1234567890abcdef",
    "colaborador": "clx0987654321fedcba",
    "contagem": 1,
    "created_at": "2025-11-04T14:30:00.000Z",
    "usuario": {
        "id": "clx0987654321fedcba",
        "nome": "DIOGO DA SILVA SANTOS",
        "codigo": "DS001"
    },
    "itens": [
        {
            "id": "clx1111222233334444",
            "contagem_id": "clx1234567890abcdef",
            "data": "2025-11-04T00:00:00.000Z",
            "cod_produto": 23251,
            "desc_produto": "CAPA P/CHOQUE DIANT. S-10 12/16 PRETO LISO - DTS",
            "mar_descricao": "DTS",
            "ref_fabricante": null,
            "ref_fornecedor": "056597",
            "localizacao": "B1002A03",
            "unidade": "UN",
            "qtde_saida": 1,
            "estoque": 8,
            "reserva": 2
        }
    ]
}
```

## Funcionamento

1. O endpoint recebe o nome do colaborador e busca o ID correspondente na tabela `sis_usuarios`
2. Se o colaborador não for encontrado, retorna erro 400
3. Cria uma nova entrada na tabela `est_contagem` com o ID do colaborador
4. Cria os itens da contagem na tabela `est_contagem_itens`
5. Retorna a contagem criada com os dados do usuário e itens

## Códigos de Resposta

- `201 Created`: Contagem criada com sucesso
- `400 Bad Request`: Dados inválidos ou colaborador não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Tabelas do Banco

### est_contagem
- `id`: CUID (chave primária)
- `colaborador`: ID do usuário (FK para sis_usuarios.id)
- `contagem`: Tipo da contagem (1, 2 ou 3)
- `created_at`: Data de criação

### est_contagem_itens
- `id`: CUID (chave primária)  
- `contagem_id`: ID da contagem (FK para est_contagem.id)
- `data`: Data do item
- `cod_produto`: Código do produto
- `desc_produto`: Descrição do produto
- `mar_descricao`: Descrição da marca (opcional)
- `ref_fabricante`: Referência do fabricante (opcional)
- `ref_fornecedor`: Referência do fornecedor (opcional)
- `localizacao`: Localização (opcional)
- `unidade`: Unidade (opcional)
- `qtde_saida`: Quantidade de saída
- `estoque`: Quantidade em estoque
- `reserva`: Quantidade reservada