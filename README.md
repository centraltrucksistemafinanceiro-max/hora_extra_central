# Sistema de Gerenciamento de Horas Extras

Sistema web para gerenciamento de horas extras com autenticação Firebase e interface moderna.

## 🚀 Deploy no Vercel

### Opção 1: Deploy via CLI

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login no Vercel:
```bash
vercel login
```

3. Execute o deploy:
```bash
vercel
```

4. Para deploy em produção:
```bash
vercel --prod
```

### Opção 2: Deploy via GitHub

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project"
4. Selecione seu repositório
5. O Vercel detectará automaticamente as configurações do Vite
6. Clique em "Deploy"

### Configuração de Variáveis de Ambiente no Vercel

Se você precisar usar variáveis de ambiente (como `GEMINI_API_KEY`):

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:
   - `GEMINI_API_KEY`: Sua chave da API Gemini (se necessário)

## 🛠️ Desenvolvimento Local

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse: http://localhost:3000

## 📦 Build de Produção

```bash
npm run build
```

O build será gerado na pasta `dist/`.

## 🔥 Firebase

O projeto já está configurado com Firebase. As credenciais estão em `firebase.ts`.

**Importante**: Para produção, considere mover as credenciais do Firebase para variáveis de ambiente por segurança.

## 📋 Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Firebase** - Autenticação e Database
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção

## 🔒 Segurança

⚠️ **Atenção**: As credenciais do Firebase estão atualmente hardcoded no arquivo `firebase.ts`. Para maior segurança em produção:

1. Mova as credenciais para variáveis de ambiente
2. Configure as regras de segurança do Firebase
3. Ative o domínio autorizado no Firebase Console

## 📞 Suporte

Para questões ou problemas, abra uma issue no repositório.
