# 🧩 API de Cotações — NestJS

API REST desenvolvida em **NestJS** para gerenciar **usuários**, **login**, **cotações** e **orçamentos de cotações**, com **validação de dados**, **boas práticas REST** e arquitetura modular.

---

## 🚀 Tecnologias

- **Node.js** (>= 18)
- **NestJS**
- **TypeScript**
- **class-validator** e **class-transformer**
- **Prisma** ou outro ORM

---

## ⚙️ Instalação e Execução

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/Develop-Ac/cotacao-backend
cd cotacao-backend
```

### 2️⃣ Instalar dependências
```bash
npm install
# ou
pnpm install
```

### 3️⃣ Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz com os valores adequados:
```
PORT=3000
SWAGGER_ENABLED=true
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
```

### 4️⃣ (Opcional) Gerar Prisma Client
```bash
npx prisma generate
```

### 5️⃣ Rodar em desenvolvimento
```bash
npm run start:dev
```

### 6️⃣ Build e Produção
```bash
npm run build
npm run start:prod
```

---

## 🔒 Validação

Todos os DTOs utilizam **ValidationPipe** com:

- `whitelist: true` → remove campos extras  
- `forbidNonWhitelisted: true` → rejeita propriedades não permitidas  
- `transform: true` → converte tipos automaticamente (ex.: `id` → `number`)  

Exemplo de erro de validação:
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "senha must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

## 📚 Endpoints

### 👤 Usuários

#### **GET** `/usuarios`
Retorna lista de usuários.

**Resposta 200**
```json
[
  { "usuario_id": 1, "nome": "Alice", "email": "alice@exemplo.com" }
]
```

#### **POST** `/usuarios`
Cria novo usuário.

**Body**
```json
{
  "nome": "Alice",
  "email": "alice@exemplo.com",
  "senha": "123456"
}
```

#### **DELETE** `/usuarios/:id`
Remove o usuário pelo ID.

---

### 🔐 Login

#### **POST** `/login`
Efetua autenticação de usuário.

**Body**
```json
{
  "email": "alice@exemplo.com",
  "senha": "123456"
}
```

**Resposta 200 (exemplo)**
```json
{
  "access_token": "jwt_gerado",
  "usuario": {
    "usuario_id": 1,
    "nome": "Alice",
    "email": "alice@exemplo.com"
  }
}
```

---

### 📦 Cotações

#### **GET** `/cotacoes`
Lista todas as cotações.

#### **POST** `/cotacoes`
Cria nova cotação.

**Body**
```json
{
  "key": "OC-2025-0001",
  "dados": [
    { "cod": "SKU1", "descricao": "Filtro de ar", "quantidade": 2 },
    { "cod": "SKU2", "descricao": "Pastilha freio", "quantidade": 1, "valor_unitario": 120.5 }
  ]
}
```

#### **GET** `/cotacoes/:id`
Retorna os detalhes de uma cotação específica.

#### **PUT** `/cotacoes/:id`
Atualiza cotação existente.

#### **DELETE** `/cotacoes/:id`
Remove a cotação pelo ID.

---

### 📋 Orçamentos de Cotação

#### **POST** `/orcamentos-cotacao`
Cria um novo orçamento vinculado a uma cotação.

**Body**
```json
{
  "id": 1,
  "fornecedor": "Fornecedor XPTO",
  "observacao": "Entrega em 7 dias",
  "dados": [
    { "descricao": "Filtro de ar", "quantidade": 2, "valor_unitario": 45.0 }
  ]
}
```

#### **GET** `/orcamentos-cotacao/:id`
Retorna a cotação com seus orçamentos associados.

#### **PATCH** `/orcamentos-cotacao/:id`
Atualiza o campo `selecionado` de um orçamento.

**Body**
```json
{ "selecionado": true }
```

---

## 🧱 Boas Práticas Adotadas

- Padrão **DTO + ValidationPipe**  
- Separação de **controller / service**  
- Estrutura modular e escalável  
- Tipagem forte com **TypeScript**  
- Uso de **async/await** e **promises seguras**

---

## 🧪 Teste Rápido (via cURL)

```bash
# Criar usuário
curl -X POST http://localhost:8000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Alice","email":"alice@exemplo.com","senha":"123456"}'

# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@exemplo.com","senha":"123456"}'
```

---
