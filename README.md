# Alvéa Odontologia — site

Site público da clínica com agendamento online. HTML, CSS e JavaScript puros, sem build.

## Estrutura

- `index.html` — página única (hero, especialidades, a clínica, agendamento, o dentista, contato)
- `styles.css` — estilos, animações e regras responsivas
- `script.js` — menu em ilha, efeitos de rolagem, parallax e lógica do agendamento
- `favicon.svg` — ícone com o monograma

## Rodar localmente

Abra `index.html` no navegador, ou sirva a pasta:

```bash
npx serve .
```

## Publicar na Vercel

Importe o repositório na Vercel como projeto estático (sem framework, sem comando de build).

## Próximos passos

- Trocar os textos entre colchetes (`[Nome]`, `[Endereço]` etc.) pelos dados reais
- Inserir as fotos nos espaços marcados
- Ligar o agendamento ao banco (Supabase) — hoje os horários são de exemplo (ver `TODO` em `script.js`)
