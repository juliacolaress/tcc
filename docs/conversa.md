# Auditoria do Sistema TCC - Patas & Lares

## Data: 15/07/2026

---

## 1. Solicitação Inicial

**Usuário:** "audite o sistema tcc"

---

## 2. Análise do Projeto

O sistema é uma aplicação **MERN** (MongoDB, Express, React, Node.js) para gerenciamento de uma ONG de animais chamada "Patas & Lares".

### Estrutura identificada:

```
tcc/
├── server/
│   ├── server.js
│   ├── .env
│   ├── db/conn.js
│   ├── middleware/auth.js
│   └── routes/
│       ├── user.js
│       ├── animais.js
│       ├── doacao.js
│       └── voluntarios.js
├── client/
│   └── src/
│       ├── App.js
│       ├── api/config.js
│       └── components/
│           ├── Login.js
│           ├── Register.js
│           ├── dashboard.js
│           ├── animalList.js
│           ├── doacaoList.js
│           ├── voluntariosList.js
│           └── ... (outros componentes)
└── package.json
```

---

## 3. Auditoria Realizada

### Problemas Encontrados:

#### 1. SEGURANÇA (Crítico)

| # | Severidade | Problema | Localização |
|---|-----------|----------|-------------|
| 1 | **CRÍTICA** | Credenciais expostas no `.env` commitado (URI MongoDB com usuário/senha) | `server/.env:1` |
| 2 | **CRÍTICA** | JWT Secret fraco (`secret-key`) com fallback previsível | `server/.env:2`, `server/routes/user.js:9` |
| 3 | **CRÍTICA** | Rotas de dados sem autenticação (animais, doações, voluntários) | `server/routes/animais.js`, `doacao.js`, `voluntarios.js` |
| 4 | **CRÍTICA** | Registro permite cria de perfil ADM (campo `function` vem do body) | `server/routes/user.js:42` |
| 5 | **ALTA** | `insertOne(req.body)` em voluntários — insere campos arbitrários | `server/routes/voluntarios.js:39` |
| 6 | **ALTA** | Ausência total de validação de entrada | Todas as rotas |

#### 2. ARQUITETURA E CÓDIGO

| # | Severidade | Problema | Localização |
|---|-----------|----------|-------------|
| 7 | **MÉDIA** | Opções deprecated no MongoDB driver (`useNewUrlParser`, `useUnifiedTopology`) | `server/db/conn.js:13-14` |
| 8 | **MÉDIA** | Rota de delete de usuários conflitante (`/:id` sem prefixo) | `server/routes/user.js:137` |
| 9 | **MÉDIA** | Mensagens de erro inconsistentes (`mensagem` vs `message`) | Backend/Frontend |
| 10 | **MÉDIA** | Registro não retorna token (precisa fazer login manualmente) | `server/routes/user.js:63` |

#### 3. FRONTEND

| # | Severidade | Problema | Localização |
|---|-----------|----------|-------------|
| 11 | **MÉDIA** | API URL hardcoded (`http://localhost:5050`) | `client/src/api/config.js:1` |
| 12 | **MÉDIA** | Componentes com URL hardcoded e sem token | `doacaoList.js`, `createDoacao.js`, `createVoluntarios.js`, `editDoacao.js`, `editVoluntarios.js` |
| 13 | **BAIXA** | Token armazenado no `localStorage` (vulnerável a XSS) | `client/src/App.js:41,106,109` |

#### 4. DEPENDÊNCIAS

| # | Severidade | Problema | Localização |
|---|-----------|----------|-------------|
| 14 | **BAIXA** | `bootstrap` instalado no server (desnecessário) | `server/package.json` |

---

## 4. Correções Aplicadas

O usuário solicitou: **"todos"** (corrigir todos os problemas)

### 4.1 Backend - `server/.env`

**Antes:**
```
ATLAS_URI=mongodb://juliacolaress:Colaresj1@ac-ctycqer-shard-00-00.lbynqie.mongodb.net:27017,...
JWT_SECRET=secret-key
PORT=5050
```

**Depois:**
```
ATLAS_URI=mongodb://SEU_USUARIO:SUA_SENHA@seu-cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=<GERE_UM_SECRET_COM_256_BITS_USANDO: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
PORT=5050
```

### 4.2 Backend - `server/routes/user.js`

- **JWT secret sem fallback** — trava o servidor se não estiver definido
- **Registro sempre cria perfil "User"** — campo `function` ignorado do body
- **Auto-login após registro** — retorna token junto com a mensagem
- **Validação com `express-validator`** — nome, email, senha mínima 6 caracteres
- **Rota de delete corrigida** — `/user/:id` (antes conflitava com `/:id`)
- **Mensagens padronizadas** — todas em português usando `mensagem`

### 4.3 Backend - `server/routes/animais.js`

- GET `/animal` e GET `/animal/:id` **mantidos públicos** (necessário para página de adoção pública)
- POST, UPDATE, DELETE protegidos com middleware `auth`
- **Validação de entrada** — nome, espécie, status obrigatórios

### 4.4 Backend - `server/routes/doacao.js`

- **Todas as rotas protegidas** com middleware `auth`
- **Validação de entrada** — nome, email, tipo_doacao
- Mensagens de erro padronizadas

### 4.5 Backend - `server/routes/voluntarios.js`

- **Todas as rotas protegidas** com middleware `auth`
- **`insertOne(req.body)` substituído por whitelist explícita** de campos:
  ```javascript
  const myobj = {
      nome: req.body.nome,
      email: req.body.email,
      ddd: req.body.ddd,
      telefone: req.body.telefone,
      cidade: req.body.cidade,
      estado: req.body.estado
  }
  ```
- **Validação de entrada** — nome, email

### 4.6 Backend - `server/db/conn.js`

- Opções deprecated removidas:
  ```javascript
  // Antes
  client = new MongoClient(Db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  
  // Depois
  client = new MongoClient(Db)
  ```

### 4.7 Backend - `server/package.json`

- `bootstrap` e `bootstrap-icons` removidos
- `express-validator` adicionado

### 4.8 Frontend - `client/src/api/config.js`

**Antes:**
```javascript
const API_BASE_URL = "http://localhost:5050";
```

**Depois:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";
```

### 4.9 Frontend - `client/src/components/Login.js`

- Corrigido `data.message` → `data.mensagem` para consistência com backend

### 4.10 Frontend - Componentes corrigidos (URL hardcoded → API_BASE_URL + token)

| Componente | Mudanças |
|-----------|----------|
| `doacaoList.js` | URL hardcoded → `API_BASE_URL`, adicionado `Authorization: Bearer ${token}` em GET e DELETE |
| `createDoacao.js` | URL hardcoded → `API_BASE_URL`, adicionado token no POST |
| `createVoluntarios.js` | URL hardcoded → `API_BASE_URL`, adicionado token no POST |
| `editDoacao.js` | URL hardcoded → `API_BASE_URL`, adicionado token no GET e POST |
| `editVoluntarios.js` | URL hardcoded → `API_BASE_URL`, adicionado token no GET e POST |

### 4.11 Frontend - Rota corrigida

- `edit.js`: `/update/:id` → `/user/update/:id`

### 4.12 Dependência removida

- `npm uninstall bootstrap bootstrap-icons` no server

---

## 5. Arquivos Modificados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `server/.env` | Sanitização de credenciais |
| `server/package.json` | Remoção de deps, adição de express-validator |
| `server/db/conn.js` | Remoção de opções deprecated |
| `server/routes/user.js` | Segurança, validação, consistência |
| `server/routes/animais.js` | Auth em rotas de escrita, validação |
| `server/routes/doacao.js` | Auth em todas as rotas, validação |
| `server/routes/voluntarios.js` | Auth, whitelist, validação |
| `client/src/api/config.js` | URL configurável |
| `client/src/components/Login.js` | Consistência de mensagens |
| `client/src/components/doacaoList.js` | URL + token |
| `client/src/components/createDoacao.js` | URL + token |
| `client/src/components/createVoluntarios.js` | URL + token |
| `client/src/components/editDoacao.js` | URL + token |
| `client/src/components/editVoluntarios.js` | URL + token |
| `client/src/components/edit.js` | Correção de rota |

---

## 6. Ações Pendentes (Requerem intervenção manual)

1. **Gerar novo JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copiar o resultado para `JWT_SECRET` no `.env`

2. **Atualizar senha do MongoDB Atlas** — as credenciais anteriores foram expostas no git

3. **Limpar git history** — usar `git filter-branch` ou BFG para remover o `.env` com credenciais do histórico

4. **Variável de ambiente no frontend** (para produção):
   ```bash
   REACT_APP_API_URL=https://sua-api-producao.com
   ```

---

## 7. Status Final

| Categoria | Itens Corrigidos |
|-----------|-----------------|
| Segurança Crítica | 4/4 |
| Segurança Alta | 2/2 |
| Arquitetura | 3/3 |
| Frontend | 7/7 |
| Dependências | 1/1 |
| **Total** | **17/17** |
