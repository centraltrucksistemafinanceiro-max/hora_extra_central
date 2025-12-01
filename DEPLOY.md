# 🚀 Guia Rápido de Deploy no Vercel

## Método 1: Deploy Automático via GitHub (Recomendado)

### Passo 1: Preparar o Repositório
```bash
git add .
git commit -m "Preparado para deploy no Vercel"
git push origin main
```

### Passo 2: Conectar ao Vercel
1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `hora_extra_central`
5. O Vercel detectará automaticamente as configurações
6. Clique em **"Deploy"**

✅ **Pronto!** Seu site estará no ar em poucos minutos.

---

## Método 2: Deploy via CLI

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Fazer Login
```bash
vercel login
```

### Passo 3: Deploy
```bash
# Deploy de teste
vercel

# Deploy em produção
vercel --prod
```

---

## ⚙️ Configurações Importantes

### Variáveis de Ambiente (se necessário)
No dashboard do Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione: `GEMINI_API_KEY` (se estiver usando)

### Domínio Personalizado
1. No dashboard do Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

---

## 🔥 Configurar Firebase

Após o deploy, adicione o domínio do Vercel aos domínios autorizados:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `hora-extra-central`
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Adicione: `seu-projeto.vercel.app`

---

## ✅ Checklist de Deploy

- [x] Arquivo `vercel.json` criado
- [x] Build testado localmente (`npm run build`)
- [x] `.gitignore` atualizado
- [ ] Código enviado para GitHub
- [ ] Projeto importado no Vercel
- [ ] Domínio adicionado ao Firebase
- [ ] Variáveis de ambiente configuradas (se necessário)

---

## 🐛 Troubleshooting

### Build falha no Vercel
- Verifique se todas as dependências estão no `package.json`
- Confirme que o build funciona localmente: `npm run build`

### Erro de autenticação Firebase
- Adicione o domínio do Vercel aos domínios autorizados no Firebase Console

### Página em branco após deploy
- Verifique o console do navegador (F12)
- Confirme que o `vercel.json` está configurado corretamente

---

## 📞 Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Firebase](https://firebase.google.com/docs)
