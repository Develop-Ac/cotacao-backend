# AC Entregas API — Compras/Cotações (NestJS + Prisma)

API REST construída com NestJS e Prisma para gerir:
- Usuários e login
- Cotações de compra e itens da cotação
- Orçamentos de cotação (propostas por fornecedor) e seleção de proposta

Inclui validação com class-validator, CORS configurável, Swagger opcional e Dockerfile.

---

## Requisitos
- Node.js >= 20
- npm ou pnpm
- Banco via Prisma (padrão: SQLite)

---

## Começando

1) Clonar e instalar dependências
```bash
git clone <seu-repo>
cd cotacao-backend
npm ci
# ou: pnpm install
```

2) Configurar variáveis de ambiente (arquivo `.env` na raiz)
```ini
# Porta do servidor HTTP (padrão: 8000)
PORT=8000

# Habilita Swagger em /docs (recomendado em dev)
SWAGGER_ENABLED=true

# Lista de origens permitidas no CORS (separadas por vírgula). Use true para liberar tudo em dev.
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# URL pública usada no Swagger para exibir servidor
PUBLIC_URL=http://localhost:8000

# Banco de dados (SQLite padrão no repo)
DATABASE_URL="file:./prisma/banco.db"

# Opcional: token de aplicação (middleware disponível, desabilitado por padrão)
APP_TOKEN=
```

3) Gerar Prisma Client e aplicar migrações
```bash
npx prisma generate
npx prisma migrate deploy
```

4) Executar
```bash
# Desenvolvimento (watch)
npm run dev

# Produção (build + start)
npm run build
npm start
# ou garantindo migrações:
npm run start:migrate
```

---

## Scripts úteis (package.json)
- `dev`: Nest em modo watch
- `build`: compila para `dist/`
- `start`: sobe `dist/main.js`
- `start:migrate`: `prisma migrate deploy` e inicia app
- `prisma:generate`: gera Prisma Client
- `prisma:migrate:deploy`: aplica migrações pendentes

---

## Executar com Docker
```bash
# build
docker build -t cotacao-backend:latest .
# run (ajuste o mount se quiser persistir o banco local)
docker run --rm -p 8000:8000 \
  -e DATABASE_URL="file:./prisma/banco.db" \
  -e SWAGGER_ENABLED=true \
  cotacao-backend:latest
```
O container aplica `prisma migrate deploy` na inicialização e expõe a API em `http://localhost:8000`.

---

## Estrutura de pastas
- `src/main.ts`: bootstrap do Nest, CORS, Helmet e Swagger (opcional)
- `src/app.module.ts`: módulos principais e prefixo `/compras` para módulos de compras
- `src/common/middlewares/app-token.middleware.ts`: middleware opcional para validar `APP_TOKEN`
- `src/prisma/`: `PrismaService` global e cliente Prisma
- `src/usuario/`: CRUD básico de usuários
- `src/login/`: endpoint de login (validação de credenciais)
- `src/compras/cotacao/`: endpoints de cotação e itens
- `src/compras/orcamentoCotacao/`: endpoints de orçamentos de cotação (propostas)
- `prisma/schema.prisma`: schema do banco (SQLite por padrão)
- `prisma/migrations/`: migração inicial

---

## Banco de Dados (Prisma)
Modelos principais (resumo):
- `Usuario`: `usuario_id`, `nome`, `email` (único), `senha` (hash), `trash`
- `Cotacao`: `id`, `cotacao_id?` (id de negócio opcional, único), `orcamento_compra?`
- `ItemCotacao`: itens vinculados a uma `Cotacao`
- `OrcamentoCotacao`: propostas de fornecedores para uma `Cotacao`, com campo `selecionado`

Provider padrão: SQLite (mude `DATABASE_URL` para outro provider se desejar).

---

## Swagger
- Habilite com `SWAGGER_ENABLED=true`
- UI: `GET /docs`
- JSON: `GET /docs-json`
- Respeita `PUBLIC_URL` para exibir servidores

Observação: alguns exemplos no Swagger podem não refletir 100% o payload real; os exemplos abaixo seguem o comportamento atual do código.

---

## CORS
- Controlado por `CORS_ORIGIN` (lista separada por vírgula). Em branco usa `true` (liberadão) em dev.

---

## Autorização por Token (opcional)
Existe o middleware `AppTokenMiddleware` para validar um `token` no `query` ou no `body` contra `APP_TOKEN`. Por padrão não está registrado. Para habilitar globalmente, registre no `AppModule`:

```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppTokenMiddleware } from './common/middlewares/app-token.middleware';

@Module({ /* ... */ })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppTokenMiddleware)
      .exclude('docs', 'docs-json', 'health')
      .forRoutes('*');
  }
}
```

Ao habilitar, adicione `?token=SEU_APP_TOKEN` nas requisições (ou envie em `body.token`).

---

## Rotas da API (resumo com exemplos)

Base: `http://localhost:8000`

- Raiz
  - `GET /` → "Hello World!"

- Login
  - `POST /login`
    - Body:
      ```json
      { "email": "usuario@empresa.com", "senha": "SenhaF0rte!" }
      ```
    - Resposta 200:
      ```json
      {
        "success": true,
        "message": "Login realizado com sucesso",
        "usuario": { "usuario_id": 1, "nome": "Giovana", "email": "usuario@empresa.com", "trash": 0 }
      }
      ```

- Usuários
  - `GET /usuarios`
    - Resposta 200:
      ```json
      [ { "usuario_id": 1, "nome": "Giovana", "email": "giovana@empresa.com" } ]
      ```
  - `POST /usuarios`
    - Body:
      ```json
      { "nome": "Giovana", "email": "giovana@empresa.com", "senha": "SenhaF0rte!" }
      ```
    - Resposta 201:
      ```json
      {
        "message": "Usuário criado com sucesso!",
        "data": { "usuario_id": 123, "nome": "Giovana", "email": "giovana@empresa.com" }
      }
      ```
  - `DELETE /usuarios/:id` → 204 (No Content) em sucesso

- Compras — Cotações
  - Observação: além de `/cotacoes`, também está disponível sob `/compras/cotacoes` devido ao prefixo configurado.
  - `GET /cotacoes`
    - Resposta 200 (resumo):
      ```json
      [ { "id": 101, "orcamento_compra": "ORC-2025-001234" } ]
      ```
  - `POST /cotacoes`
    - Body:
      ```json
      {
        "key": "ORC-2025-001234",
        "dados": [
          { "cod": "HLX-2016-BP", "descricao": "Grade frontal...", "quantidade": 2, "valor_unitario": 499.9 }
        ]
      }
      ```
    - Resposta 201:
      ```json
      { "message": "Cotação e itens salvos com sucesso.", "cotacao_id": 101 }
      ```
  - `GET /cotacoes/:id`
    - Resposta 200 (com itens):
      ```json
      {
        "id": 101,
        "cotacao_id": null,
        "orcamento_compra": "ORC-2025-001234",
        "itens": [
          {
            "id": 1,
            "cotacao_id": 101,
            "cod": "HLX-2016-BP",
            "descricao": "Grade frontal...",
            "marca": "ACRART",
            "ref_fornecedor": "AR-7789",
            "unidade": "PC",
            "quantidade": 2,
            "valor_unitario": 499.9,
            "selecionado": false,
            "item_id": null
          }
        ]
      }
      ```
  - `PUT /cotacoes/:id`
    - Body: mesma estrutura do `POST /cotacoes`
    - Resposta 200:
      ```json
      { "message": "Cotação atualizada com sucesso.", "cotacao_id": 101 }
      ```
  - `DELETE /cotacoes/:id`
    - Resposta 200:
      ```json
      { "message": "Cotação e itens associados removidos com sucesso." }
      ```

- Compras — Orçamentos de Cotação
  - Observação: além de `/orcamentos-cotacao`, também disponível sob `/compras/orcamentos-cotacao`.
  - `POST /orcamentos-cotacao`
    - Body:
      ```json
      {
        "id": 101,
        "fornecedor": "Fornecedor X",
        "observacao": "Entrega em 7 dias",
        "dados": [ { "descricao": "Lâmpada LED H7 Ultra", "quantidade": 4, "valor_unitario": "129,90" } ]
      }
      ```
    - Resposta 201:
      ```json
      { "message": "Cotação e itens salvos com sucesso." }
      ```
  - `GET /orcamentos-cotacao/:id` (id = cotacao_id)
    - Resposta 200:
      ```json
      {
        "id": 101,
        "orcamentos": [
          {
            "id": 555,
            "orcamento_id": 123456,
            "cotacao_id": 101,
            "descricao": "Lâmpada LED H7 Ultra",
            "quantidade": 4,
            "valor_unitario": 129.9,
            "fornecedor": "Fornecedor X",
            "observacao": "Entrega em 7 dias",
            "selecionado": false
          }
        ]
      }
      ```
  - `PATCH /orcamentos-cotacao/:id` (id = orcamento_cotacao.id)
    - Body:
      ```json
      { "selecionado": true }
      ```
    - Resposta 200:
      ```json
      { "message": "Status atualizado com sucesso.", "orcamento": { "id": 555, "selecionado": true /* ... */ } }
      ```

Validação
- DTOs usam `ValidationPipe` com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Exemplos de erro seguem o padrão NestJS (statusCode, message[], error).

---

## Testes
Existe um teste E2E de amostra em `test/app.e2e-spec.ts` (GET `/`). Para rodar testes é necessário configurar Jest/ts-jest no projeto (devDependencies podem ser necessárias).

---

## Observações
- Em produção, defina corretamente `CORS_ORIGIN`, `SWAGGER_ENABLED=false` (se desejar) e um provider de banco adequado (`DATABASE_URL`).
- O middleware de `APP_TOKEN` está disponível, porém não registrado por padrão.
- Os módulos de compras também são expostos sob o prefixo `/compras` via `RouterModule`.

