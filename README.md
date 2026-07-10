# E-commerce Backend API

API REST para gerenciamento de categorias e produtos, construída com Node.js 18+, TypeScript, Express, Prisma ORM e PostgreSQL.

## Tecnologias
Node.js 18+ · TypeScript · Express · Prisma ORM · PostgreSQL · Zod · Vitest + Supertest · Swagger/OpenAPI · Docker Compose

## Arquitetura
`routes` → `controllers` → `services` → `repositories`, com validação via `schemas` (Zod) e tratamento de erro centralizado em `middlewares`. O `repository` é o único ponto de acesso ao Prisma.

## Regras de negócio
- Categoria: nome obrigatório e único, soft delete.
- Produto: preço > 0, estoque ≥ 0, categoria obrigatória e existente.
- Categoria com produtos ativos vinculados não pode ser excluída.
- Registros com `deletedAt` preenchido são ignorados nas listagens/buscas.

---

## Como rodar

### Opção A — Docker (recomendado)

```bash
cp .env.example .env
docker compose up --build
```

Esse comando sobe o Postgres de desenvolvimento, o Postgres de teste, aplica as migrations e inicia a API — tudo em um passo.

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

Para parar: `docker compose down` (adicione `-v` para também apagar os dados).

### Opção B — Local, sem Docker

Pré-requisito: PostgreSQL rodando na máquina.

```bash
npm install
cp .env.example .env          # ajuste a DATABASE_URL se necessário
createdb ecommerce            # se o banco ainda não existir
npx prisma generate
npx prisma migrate dev
npm run dev
```


---

## Migrations

As migrations já estão versionadas em `prisma/migrations/` — não é preciso criar novas.

- `npx prisma migrate dev` → uso local
- `npx prisma migrate deploy` → teste/CI/produção (só aplica migrations existentes; o Docker Compose já faz isso automaticamente)

---

## Testes

Testes de integração rodam contra um **Postgres real**, isolado do banco de desenvolvimento (porta `5433`, banco `ecommerce_test`).

```bash
cp .env.test.example .env.test
docker compose up -d db-test  # ou crie o banco manualmente se estiver sem Docker
npx dotenv -e .env.test -- npx prisma migrate deploy
npm run test:integration
```


> O código de teste recusa rodar se a `DATABASE_URL` não apontar para um banco de teste — proteção contra apagar dados de desenvolvimento por engano.

---

## Endpoints

**Categories:** `POST` `/categories` · `GET` `/categories?page=&limit=` · `GET` `/categories/:id` · `PUT` `/categories/:id` · `DELETE` `/categories/:id`

**Products:** `POST` `/products` · `GET` `/products?page=&limit=&categoryId=&priceMin=&priceMax=&name=` · `GET` `/products/:id` · `PUT` `/products/:id` · `DELETE` `/products/:id`

## Exemplos

```bash
curl -X POST http://localhost:3000/categories -H 'Content-Type: application/json' -d '{"name":"Electronics"}'
```

```bash
curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
  -d '{"name":"Laptop","price":999.99,"stock":10,"categoryId":"<category-id>"}'
```

## Comandos úteis

Instalar dependências e gerar cliente Prisma:

```bash
npm install
npx prisma generate
```

Rodar a aplicação localmente (assumindo `DATABASE_URL` configurada em `.env`):

```bash
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Rodar a stack completa com Docker (aplica migrations automaticamente):

```bash
docker compose up --build
```

Preparar banco de teste e aplicar migrations (usa `.env.test`):

```bash
cp .env.test.example .env.test
dotenv -e .env.test -- npx prisma migrate deploy
```

Executar testes de integração contra o banco de teste:

```bash
dotenv -e .env.test -- npm run test:integration
```

Observação: os scripts acima usam `dotenv-cli` para carregar `.env.test`; instale com `npm i -D dotenv-cli` se necessário.

## Observações
- O `.env` real nunca é commitado — só `.env.example` e `.env.test.example`.
- Testes usam banco real, sem mocks, e nunca o mesmo banco de desenvolvimento.
