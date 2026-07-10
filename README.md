Certifique-se de que o banco `ecommerce` (ou o nome que você escolher) já exista no seu Postgres, ou crie-o antes de continuar:
```bash
createdb ecommerce
```

### 4. Gere o Prisma Client
```bash
npx prisma generate
```

### 5. Rode as migrations (cria as tabelas no banco)
```bash
npx prisma migrate dev
```

### 6. Inicie o servidor em modo desenvolvimento (com hot reload)
```bash
npm run dev
```

Quando o log mostrar `Server listening on port 3000`, a API está pronta em:
- **API:** http://localhost:3000
- **Documentação Swagger:** http://localhost:3000/docs

---

## Migrations

As migrations do Prisma já estão versionadas no repositório em `prisma/migrations/`. Você não precisa criar novas — apenas aplicá-las ao seu banco:

| Comando | Quando usar |
|---|---|
| `npx prisma migrate dev` | Ambiente local de desenvolvimento (primeira vez ou após alterar o schema) |
| `npx prisma migrate deploy` | Ambientes de teste/CI/produção — apenas aplica as migrations existentes, nunca gera uma nova |

O Docker Compose já executa `prisma migrate deploy` automaticamente ao subir a API — você não precisa rodar nada manualmente nesse caso.

---

## Testes

Os testes de integração usam um **PostgreSQL real**, em um banco separado e isolado do banco de desenvolvimento — nunca mocks e nunca o mesmo banco onde estão seus dados de dev.

### 1. Configure o ambiente de teste
```bash
cp .env.test.example .env.test
```
Por padrão, o `.env.test.example` já aponta para o banco de teste do Docker Compose (`ecommerce_test`, porta `5433`).

### 2. Garanta que o banco de teste está de pé
- Se estiver usando Docker: `docker compose up -d db-test`
- Se estiver rodando localmente: crie um banco separado, ex. `createdb ecommerce_test`

### 3. Aplique as migrations no banco de teste
```bash
npx dotenv -e .env.test -- npx prisma migrate deploy
```

### 4. Rode os testes
```bash
npm run test:integration
```

> Por segurança, o próprio código de teste **recusa rodar** se a `DATABASE_URL` ativa não apontar para um banco de teste (verifica se o nome contém `_test` ou a porta é `5433`) — isso evita que a suíte apague dados de um banco de desenvolvimento por engano.

---

## Endpoints

### Categories
- `POST /categories`
- `GET /categories?page=1&limit=10`
- `GET /categories/:id`
- `PUT /categories/:id`
- `DELETE /categories/:id`

### Products
- `POST /products`
- `GET /products?page=1&limit=10&categoryId=&priceMin=&priceMax=&name=`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

## Exemplos de chamadas
```bash
curl -X POST http://localhost:3000/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Electronics"}'

curl http://localhost:3000/categories?page=1&limit=10

curl -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Laptop","price":999.99,"stock":10,"categoryId":"<category-id>"}'
```

## Observações
- O arquivo `.env` real não deve ser commitado — apenas `.env.example` e `.env.test.example`.
- Os testes não usam mocks do Prisma e tampouco o mesmo banco do ambiente de desenvolvimento.
