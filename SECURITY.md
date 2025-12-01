**Segurança — Checklist e recomendações**

- **Variáveis de ambiente**: mantenha segredos (ex.: chaves privadas, tokens) em um backend; somente exponha no cliente valores não sensíveis como `VITE_` públicos quando necessário. Nunca comite `.env`.
- **Bundle**: evite usar `define` em `vite.config.ts` para embutir segredos (removido). Use `import.meta.env.VITE_*` para valores públicos ou faça chamadas à sua API segura.
- **Regras do Firestore (exemplo)**: restrinja leituras/escritas por autenticação e permissões por papel.

Exemplo mínimo de regras do Firestore (suba e ajuste no Console Firebase):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários: cada usuário pode ler/escrever seu próprio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Funcionários: leitura para usuários autenticados; escrita somente para admin
    match /employees/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && isAdmin();
      allow update, delete: if request.auth != null && isAdmin();
    }

    // Registros de horas: leitura para usuários autenticados; criação por usuários autenticados;
    // deletar/alterar apenas por admin
    match /overtimeRecords/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isAdmin();
    }

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

- **App Check**: habilite Firebase App Check para reduzir abuso de APIs públicas.
- **Dependências**: prefira instalar bibliotecas via `npm` em vez de depender de CDNs. Se usar CDN, fixe versões e, quando possível, adicione SRI/CSP.
- **Logging**: não exponha stacks ou segredos em mensagens visíveis ao usuário. Use serviços de monitoramento (Sentry) com redaction.
- **Rotação de chaves**: se qualquer chave foi exposta em commits, rotacione-a imediatamente pelo console do provedor.
- **CSP**: configure Content Security Policy para mitigar injeção de scripts (especialmente se usar importmap/CDNs).
- **Pipeline**: adicione checagens automáticas (pre-commit hooks) para impedir commits com `.env` ou padrões comuns de segredos (ex.: detector de API keys).

Se quiser, eu posso:
- migrar dependências do `index.html` (SheetJS/importmap) para `npm` e atualizar imports;
- rodar `npm audit fix` e abrir PR com atualizações de dependências;
- gerar um `rules.firestore` pronto para subir via CLI.

---
Arquivo gerado automaticamente pelo assistente — ajuste conforme necessário antes do deploy.
