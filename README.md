# 🎱 Bingo Online

Jogo de Bingo multiplayer em tempo real com salas privadas. Visual moderno, divertido e 100% responsivo.

## Visão Geral do Projeto

Este é um sistema de Bingo Online onde um Host cria salas privadas e jogadores entram via PIN (4 dígitos) ou Magic Link. Utiliza PartyKit (Cloudflare Durable Objects) para comunicação em tempo real, sem necessidade de backend tradicional ou autenticação.

## Funcionalidades Implementadas

| Feature | Status | Descrição |
|---------|--------|-----------|
| Landing Page | ✅ | Visual impactante com cartela estilizada e gradientes |
| PIN 4 dígitos | ✅ | Geração e validação de PIN para salas |
| Magic Link | ✅ | URL direta para entrar na sala |
| Avatares | ✅ | 30 avatares temáticos (emojis) em 5 categorias |
| Lobby em tempo real | ✅ | Lista de jogadores com entrada animada |
| Globo giratório | ✅ | Animação CSS do globo de bingo |
| Cartela 5x5 | ✅ | Clicável com estrela no centro (FREE space) |
| Feedback de erro | ✅ | Shake + som quando clica número não sorteado |
| Sistema de pontos | ✅ | +1/número, +10/linha |
| Ranking ao vivo | ✅ | Ordenado por pontuação com animações |
| Celebração linha | ✅ | Confetti + toast quando faz linha |
| Celebração BINGO | ✅ | Fogos + modal épico para vencedor |
| Responsividade | ✅ | Mobile-first, funciona em todos os dispositivos |
| Persistência 24h | ✅ | Salas duram 24h via Durable Objects |

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Realtime**: PartyKit (Cloudflare Durable Objects)
- **Styling**: Tailwind CSS 4, Framer Motion
- **Estado**: Zustand
- **Validação**: Zod (preparado)
- **Deploy**: Vercel (frontend) + Cloudflare (PartyKit)

## Como Rodar Localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar em desenvolvimento

**Opção A - Dois terminais:**
```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - PartyKit
npm run dev:party
```

**Opção B - Comando único:**
```bash
npm run dev:all
```

### 3. Acessar
- Frontend: http://localhost:3000
- PartyKit: http://localhost:1999

## Estrutura Completa do Projeto

```
bingo/
├── .env.local                 # Variáveis de ambiente
├── .env.example               # Template de variáveis
├── partykit.json              # Config do PartyKit
├── package.json               # Scripts e dependências
│
├── public/
│   ├── sounds/                # [A CRIAR] Arquivos MP3
│   │   ├── ball-draw.mp3
│   │   ├── number-marked.mp3
│   │   ├── error-shake.mp3
│   │   ├── player-joined.mp3
│   │   ├── line-complete.mp3
│   │   ├── bingo-win.mp3
│   │   └── button-click.mp3
│   │
│   ├── animations/            # [A CRIAR] Lottie JSON
│   │   ├── confetti.json
│   │   ├── fireworks.json
│   │   └── globe-spinning.json
│   │
│   └── avatars/               # [OPCIONAL] Imagens de avatar
│
├── src/
│   ├── app/                   # Páginas Next.js (App Router)
│   │   ├── layout.tsx         # Layout raiz com ToastContainer
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── globals.css        # Estilos globais + animações
│   │   ├── criar/
│   │   │   └── page.tsx       # Criar sala (/criar)
│   │   ├── entrar/
│   │   │   └── page.tsx       # Entrar com PIN (/entrar)
│   │   └── sala/[pin]/
│   │       ├── page.tsx       # Lobby (/sala/:pin)
│   │       ├── host/
│   │       │   └── page.tsx   # Tela do Host durante jogo
│   │       └── jogar/
│   │           └── page.tsx   # Tela do Jogador durante jogo
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   │   ├── Button.tsx     # Botão com variantes
│   │   │   ├── Input.tsx      # Input estilizado
│   │   │   ├── Card.tsx       # Card com glass effect
│   │   │   ├── Modal.tsx      # Modal com backdrop
│   │   │   └── Toast.tsx      # Sistema de notificações
│   │   │
│   │   ├── home/
│   │   │   └── BingoCardDecoration.tsx  # Cartela decorativa animada
│   │   │
│   │   ├── lobby/
│   │   │   ├── AvatarPicker.tsx   # Galeria de avatares
│   │   │   ├── PlayerList.tsx     # Lista de jogadores
│   │   │   └── ShareRoom.tsx      # PIN e Magic Link
│   │   │
│   │   ├── game/
│   │   │   ├── BingoCard.tsx      # Cartela 5x5 interativa
│   │   │   ├── DrawnNumbers.tsx   # Gabarito B-I-N-G-O
│   │   │   ├── GlobeSpinner.tsx   # Globo giratório + botão
│   │   │   └── Ranking.tsx        # Ranking ao vivo
│   │   │
│   │   └── celebrations/
│   │       ├── LineComplete.tsx   # Celebração de linha
│   │       └── BingoWin.tsx       # Celebração de BINGO
│   │
│   ├── hooks/
│   │   ├── usePartySocket.ts      # Conexão WebSocket
│   │   └── useSound.ts            # Controle de áudio
│   │
│   ├── lib/
│   │   ├── bingo/
│   │   │   ├── card-generator.ts  # Gera cartelas válidas
│   │   │   ├── ball-drawer.ts     # Sorteio de bolas
│   │   │   ├── scoring.ts         # Sistema de pontuação
│   │   │   └── validators.ts      # Validações do jogo
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts              # Tailwind class merge
│   │   │   ├── pin-generator.ts   # Gera PIN 4 dígitos
│   │   │   └── magic-link.ts      # Gera/copia links
│   │   │
│   │   └── constants/
│   │       └── avatars.ts         # Lista de 30 avatares
│   │
│   ├── stores/
│   │   ├── game-store.ts          # Estado do jogo (Zustand)
│   │   └── sound-store.ts         # Config de som
│   │
│   └── types/
│       ├── game.ts                # Tipos do jogo
│       ├── room.ts                # Tipos da sala
│       └── messages.ts            # Tipos de mensagens WS
│
└── party/
    └── index.ts                   # Servidor PartyKit completo
```

## Arquivos Críticos

| Arquivo | Função |
|---------|--------|
| `party/index.ts` | Servidor PartyKit - toda lógica de WebSocket, estado da sala, sorteio, validação |
| `src/hooks/usePartySocket.ts` | Hook que conecta cliente ao PartyKit e sincroniza estado |
| `src/lib/bingo/card-generator.ts` | Gera cartelas válidas seguindo regras do Bingo 75 |
| `src/stores/game-store.ts` | Estado global do jogo com Zustand |
| `src/types/messages.ts` | Tipos de todas as mensagens cliente-servidor |

## Regras do Bingo 75

- **75 bolas** divididas em 5 colunas:
  - B: 1-15
  - I: 16-30
  - N: 31-45
  - G: 46-60
  - O: 61-75
- **Cartela 5x5** com estrela no centro (FREE space, já marcado)
- **Pontuação**:
  - +1 ponto por número marcado corretamente
  - +10 pontos de bônus ao completar linha/coluna/diagonal
  - Cartela cheia = BINGO = Vencedor final

## Fluxo do Jogo

1. **Host cria sala** → Recebe PIN 4 dígitos + Magic Link
2. **Jogadores entram** → Via PIN ou Magic Link, escolhem avatar
3. **Lobby** → Host vê jogadores entrando em tempo real
4. **Host inicia** → Todos recebem cartela única
5. **Sorteio** → Host clica GIRAR, número aparece para todos
6. **Marcação** → Jogadores clicam números na cartela
   - Se correto: marca + som + pontos
   - Se errado: shake + som de erro
7. **Linha** → Ao completar, celebração + 10 pts bônus
8. **BINGO** → Cartela completa = vitória + celebração épica

## Mensagens WebSocket

### Cliente → Servidor
- `JOIN_ROOM` - Entrar na sala com nome e avatar
- `SELECT_AVATAR` - Mudar avatar
- `START_GAME` - Iniciar jogo (só host)
- `DRAW_BALL` - Sortear bola (só host)
- `MARK_NUMBER` - Marcar número na cartela
- `CLAIM_BINGO` - Clamar vitória

### Servidor → Cliente
- `ROOM_STATE` - Estado completo da sala
- `PLAYER_JOINED` - Jogador entrou
- `PLAYER_LEFT` - Jogador saiu
- `GAME_STARTED` - Jogo iniciou + cartelas
- `BALL_DRAWN` - Nova bola sorteada
- `NUMBER_MARKED` - Confirmação de marcação
- `LINE_COMPLETED` - Alguém fez linha
- `RANKING_UPDATE` - Ranking atualizado
- `BINGO_WON` - Alguém ganhou

## Deploy

### Vercel (Frontend)
```bash
vercel deploy
```

### PartyKit (Realtime)
```bash
npm run party:deploy
```

Após deploy, atualizar `.env.local`:
```
NEXT_PUBLIC_PARTYKIT_HOST=bingo-party.seu-usuario.partykit.dev
NEXT_PUBLIC_URL=https://seu-dominio.com
```

## O Que Falta Implementar

### Prioridade Alta
- [ ] Adicionar arquivos de som em `/public/sounds/`
- [ ] Testar multiplayer real com 2+ dispositivos
- [ ] Implementar reconexão automática

### Prioridade Média
- [ ] Adicionar animações Lottie (opcional - já funciona com CSS)
- [ ] Implementar "Jogar Novamente" no fim do jogo
- [ ] Vibração haptic no mobile

### Prioridade Baixa
- [ ] Monetização (>5 jogadores = cobrança)
- [ ] PWA (manifest.json, service worker)
- [ ] Temas customizados

## Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999  # Dev
NEXT_PUBLIC_URL=http://localhost:3000      # Dev

# Produção
# NEXT_PUBLIC_PARTYKIT_HOST=bingo-party.usuario.partykit.dev
# NEXT_PUBLIC_URL=https://bingo.seudominio.com
```

## Scripts Disponíveis

```bash
npm run dev        # Next.js dev server
npm run dev:party  # PartyKit dev server
npm run dev:all    # Ambos em paralelo
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run party:deploy  # Deploy do PartyKit
```

## Licença

MIT
