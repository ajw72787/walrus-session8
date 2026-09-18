This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result. On the configured local network, the development app is also available at [http://192.168.69.135:3001](http://192.168.69.135:3001).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Architecture

```
Browser
  ↓
Next.js server
  ↓
Ollama
  ↓
Qwen 2.5 3B
```

The browser communicates only with the Next.js server; Ollama remains server-side. Walrus Memory integration will be added in a later phase.

## Canonical character data

[src/data/characters.json](src/data/characters.json) is the authoritative 32-character roster. Future artwork must match its visual fields and future game logic must use it for facts and deduction traits; an LLM must never invent or override those facts. The referenced `/characters/NN-name.png` paths are expected future asset locations, not artwork that exists today.

Run `npm run validate:data` to check roster integrity and `npm run analyze:data` to review deduction-trait distributions.

## Deterministic game truth

```
Natural language (future)
  ↓
structured question
  ↓
deterministic game engine
  ↓
canonical characters.json
```

The future LLM may translate player language into structured questions, but the TypeScript engine alone evaluates truth, chooses and protects the secret character, eliminates candidates, and resolves guesses.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
