# Configuração de Variáveis de Ambiente no Vercel

## Problema
O app funciona localmente mas não funciona no Vercel porque as variáveis de ambiente do Firebase não foram configuradas no dashboard do Vercel.

## Solução: Adicionar Variáveis no Vercel

### Passo 1: Acessar o Dashboard do Vercel
1. Vá para https://vercel.com
2. Faça login com sua conta
3. Clique no projeto `hora_extra_central`

### Passo 2: Abrir Configurações de Variáveis
1. No menu superior, clique em **Settings** (ou **Configurações**)
2. No menu lateral esquerdo, clique em **Environment Variables**

### Passo 3: Adicionar as Variáveis do Firebase
Para cada variável abaixo, clique em **Add** (ou **Adicionar**) e preencha:

| Variável | Valor |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCyO8lf2V62X_PBR6kdQZ8zhxvEfVJndPs` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `hora-extra-central.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `hora-extra-central` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `hora-extra-central.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `855086040858` |
| `VITE_FIREBASE_APP_ID` | `1:855086040858:web:667a290e5dfda37bce8ea3` |

### Passo 4: Selecionar Ambientes
Para cada variável, certifique-se de que está marcado:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development** (opcional)

### Passo 5: Confirmar e Redeployar
1. Clique em **Save** (ou **Salvar**)
2. Volte para **Deployments**
3. Clique no último deploy → Clique em **Redeploy** (botão superior)
4. Aguarde o deploy completar (~2-3 minutos)
5. Acesse seu site e verifique se a página de login aparece

## Alternativa: Se Preferir Usar o Vercel CLI
Se você tiver o Vercel CLI instalado:

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel deploy --prod
```

## Verificação
Após o redeploy, você deveria ver:
- ✅ Página de login aparecendo normalmente
- ✅ Possibilidade de fazer login com suas credenciais
- ✅ Dashboard carregando após login bem-sucedido

## Troubleshooting
Se ainda tiver problemas:
1. Abra o site no navegador
2. Pressione F12 (DevTools)
3. Vá em **Console**
4. Procure por erros como `Firebase is not configured...` ou `auth/invalid-api-key`
5. Se houver erro, compartilhe a mensagem exata

---

**Status**: As variáveis de ambiente foram **adicionadas ao `.env.example`** para referência. Agora você precisa adicioná-las ao Vercel manualmente.
