# ⚠️ ERRO NO VERCEL - Configurar Variáveis de Ambiente

## Qual é o Problema?
```
Error: (auth/invalid-api-key)
FirebaseError: collection() expects valid Firestore instance
```

**Causa**: As variáveis do Firebase não foram adicionadas no Vercel Dashboard.

---

## ✅ SOLUÇÃO (Faça Agora - 5 minutos)

### 1️⃣ Abrir Vercel
- Vá em: https://vercel.com
- Faça login
- Clique no projeto **hora_extra_central**

### 2️⃣ Ir em Settings
- Clique em **Settings** (canto superior)
- Clique em **Environment Variables** (menu à esquerda)

### 3️⃣ Adicionar as 6 Variáveis do Firebase

Clique em **Add New** e preencha com esses valores (copie e cole):

#### Variável 1:
```
Nome: VITE_FIREBASE_API_KEY
Valor: AIzaSyCyO8lf2V62X_PBR6kdQZ8zhxvEfVJndPs
```

#### Variável 2:
```
Nome: VITE_FIREBASE_AUTH_DOMAIN
Valor: hora-extra-central.firebaseapp.com
```

#### Variável 3:
```
Nome: VITE_FIREBASE_PROJECT_ID
Valor: hora-extra-central
```

#### Variável 4:
```
Nome: VITE_FIREBASE_STORAGE_BUCKET
Valor: hora-extra-central.firebasestorage.app
```

#### Variável 5:
```
Nome: VITE_FIREBASE_MESSAGING_SENDER_ID
Valor: 855086040858
```

#### Variável 6:
```
Nome: VITE_FIREBASE_APP_ID
Valor: 1:855086040858:web:667a290e5dfda37bce8ea3
```

### 4️⃣ Para Cada Variável - Marcar Ambientes
Depois de preencher, marque:
- ✅ **Production**
- ✅ **Preview**

Clique em **Save**

### 5️⃣ Redeploiar
1. Clique em **Deployments**
2. Clique no **último deploy**
3. Clique em **Redeploy** (botão superior direito)
4. Aguarde 2-3 minutos

### 6️⃣ Testar
- Abra seu site
- Deve aparecer a página de login ✅

---

## Se Não Funcionar
1. Pressione **F12** (DevTools)
2. Vá em **Console**
3. Copie a mensagem de erro
4. Envie para análise
