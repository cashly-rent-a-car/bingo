import type * as Party from "partykit/server";
import { generateBingoCard } from "../src/lib/bingo/card-generator";
import { createBallPool, shuffleBalls, drawNextBall } from "../src/lib/bingo/ball-drawer";
import { findNewlyCompletedLines, isCardComplete, calculateTotalScore } from "../src/lib/bingo/scoring";
import type { RoomState, Player, SessionInfo } from "../src/types/room";
import type { ClientMessage, ServerMessage } from "../src/types/messages";
import type { BingoCard, RankingEntry, CompletedLine } from "../src/types/game";
import type { RoomStats } from "../src/types/admin";

// Gera token único para sessão
function generateSessionToken(): string {
  return crypto.randomUUID();
}

export default class BingoRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Timers para debounce de desconexão (evita notificação durante navegação)
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Estado da sala
  state: RoomState = {
    pin: "",
    magicLink: "",
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    hostId: "",
    hostName: "",
    players: {},
    gamePhase: "lobby",
    game: null,
    sessions: {},
  };

  // Conexões ativas
  connections: Map<string, Party.Connection> = new Map();

  async onStart() {
    // Carrega estado persistido se existir
    const stored = await this.room.storage.get<RoomState>("state");
    if (stored) {
      this.state = stored;
    } else {
      // Inicializa com o PIN da sala
      this.state.pin = this.room.id;
      this.state.magicLink = `${process.env.NEXT_PUBLIC_URL || ""}/sala/${this.room.id}`;
    }
    // Registra sala no admin
    await this.reportToAdmin('REGISTER_ROOM');
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.connections.set(conn.id, conn);

    // Envia estado atual para o novo conectado
    this.send(conn, {
      type: "ROOM_STATE",
      payload: this.state,
    });
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data: ClientMessage = JSON.parse(message);

      switch (data.type) {
        case "JOIN_ROOM":
          await this.handleJoinRoom(sender, data.payload);
          break;

        case "SELECT_AVATAR":
          await this.handleSelectAvatar(sender, data.payload);
          break;

        case "START_GAME":
          await this.handleStartGame(sender);
          break;

        case "DRAW_BALL":
          await this.handleDrawBall(sender);
          break;

        case "MARK_NUMBER":
          await this.handleMarkNumber(sender, data.payload);
          break;

        case "CLAIM_BINGO":
          await this.handleClaimBingo(sender);
          break;

        case "LEAVE_ROOM":
          await this.handleLeaveRoom(sender);
          break;

        case "CLAIM_HOST":
          await this.handleClaimHost(sender);
          break;

        case "REJOIN_GAME":
          await this.handleRejoinGame(sender, data.payload);
          break;

        case "IDENTIFY":
          await this.handleIdentify(sender, data.payload);
          break;

        case "RETURN_TO_LOBBY":
          await this.handleReturnToLobby(sender);
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
      this.send(sender, {
        type: "ERROR",
        payload: { code: "INVALID_MESSAGE", message: "Mensagem inválida" },
      });
    }
  }

  async onClose(conn: Party.Connection) {
    // Host não é jogador, apenas remove da conexão
    if (conn.id === this.state.hostId) {
      this.connections.delete(conn.id);
      // Atualiza admin quando host desconecta
      await this.reportToAdmin('UPDATE_ROOM');
      return;
    }

    const player = this.state.players[conn.id];
    if (player) {
      player.isConnected = false;
      await this.saveState();

      if (this.state.gamePhase === "lobby") {
        // No lobby, remove o jogador imediatamente
        delete this.state.players[conn.id];
        await this.saveState();
        this.broadcast({
          type: "PLAYER_LEFT",
          payload: { playerId: conn.id, playerName: player.name },
        });
        // Atualiza admin
        await this.reportToAdmin('UPDATE_ROOM');
      } else if (this.state.gamePhase === "playing" && this.state.game) {
        // Durante o jogo, usa debounce de 3 segundos antes de notificar
        // Isso permite tempo para reconexão durante navegação de página
        const existingTimer = this.disconnectTimers.get(conn.id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Atualiza admin imediatamente (connectedCount muda)
        await this.reportToAdmin('UPDATE_ROOM');

        const playerId = conn.id;
        const playerName = player.name;

        const timer = setTimeout(() => {
          // Verifica se o jogador ainda está desconectado
          const currentPlayer = this.state.players[playerId];
          if (currentPlayer && !currentPlayer.isConnected) {
            console.log("[DISCONNECT] Player", playerName, "still disconnected after debounce, notifying");
            this.broadcast({
              type: "PLAYER_DISCONNECTED",
              payload: { playerId, playerName },
            });
            // Atualiza ranking com status de conexão
            if (this.state.game) {
              this.state.game.ranking = this.calculateRanking();
              this.broadcast({
                type: "RANKING_UPDATE",
                payload: { ranking: this.state.game.ranking },
              });
            }
          }
          this.disconnectTimers.delete(playerId);
        }, 3000); // 3 segundos de debounce

        this.disconnectTimers.set(conn.id, timer);
      } else {
        // Fase ended ou outra - atualiza admin
        await this.reportToAdmin('UPDATE_ROOM');
      }
    }

    this.connections.delete(conn.id);
  }

  // ============ Handlers ============

  private async handleJoinRoom(
    conn: Party.Connection,
    payload: { playerName: string; avatarId: string; isHost?: boolean }
  ) {
    // Verifica se já existe um host registrado
    const hasHost = this.state.hostId !== '';
    // Só é host se explicitamente marcado como tal, OU se for o primeiro a entrar e não há host
    const isHost = payload.isHost === true || (!hasHost && Object.keys(this.state.players).length === 0);

    // Se é HOST, apenas registra como controlador (não como jogador)
    if (isHost) {
      this.state.hostId = conn.id;
      this.state.hostName = "Host";
      await this.saveState();

      // Notifica todos que o host conectou
      this.broadcast({
        type: "HOST_CONNECTED",
        payload: { hostId: conn.id },
      });
      return;
    }

    // Jogador normal
    const player: Player = {
      id: conn.id,
      name: payload.playerName,
      avatarId: payload.avatarId,
      joinedAt: Date.now(),
      isHost: false,
      isConnected: true,
      card: null,
      markedNumbers: [],
      score: 0,
      completedLines: [],
      hasBingo: false,
    };

    // Verifica se o jogo já está em andamento (jogador atrasado)
    const isLateJoin = this.state.gamePhase === "playing" && this.state.game !== null;

    if (isLateJoin) {
      // Gera cartela para jogador atrasado
      const card = generateBingoCard(conn.id);
      player.card = card;
      console.log("[LATE_JOIN] Player", payload.playerName, "joining late with new card");
    }

    this.state.players[conn.id] = player;

    await this.saveState();

    // Notifica todos sobre o novo jogador
    this.broadcast({
      type: "PLAYER_JOINED",
      payload: { player, isLateJoin },
    });

    // Atualiza admin
    await this.reportToAdmin('UPDATE_ROOM');

    // Se for entrada tardia, envia estado do jogo para o jogador atrasado
    if (isLateJoin && player.card) {
      this.send(conn, {
        type: "LATE_JOIN_SUCCESS",
        payload: {
          card: player.card,
          drawnBalls: this.state.game!.drawnBalls,
          currentBall: this.state.game!.currentBall,
          ranking: this.calculateRanking(),
        },
      });
    }
  }

  private async handleSelectAvatar(
    conn: Party.Connection,
    payload: { avatarId: string }
  ) {
    const player = this.state.players[conn.id];
    if (!player) return;

    player.avatarId = payload.avatarId;
    await this.saveState();

    this.broadcast({
      type: "AVATAR_CHANGED",
      payload: { playerId: conn.id, avatarId: payload.avatarId },
    });
  }

  private async handleStartGame(conn: Party.Connection) {
    // Verifica se é o host
    if (conn.id !== this.state.hostId) {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NOT_HOST", message: "Apenas o host pode iniciar o jogo" },
      });
      return;
    }

    // Verifica se há jogadores suficientes
    const playerCount = Object.keys(this.state.players).length;
    if (playerCount < 1) {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NOT_ENOUGH_PLAYERS", message: "Precisa de pelo menos 1 jogador" },
      });
      return;
    }

    // Gera cartelas para cada jogador
    const cards: Record<string, BingoCard> = {};
    for (const playerId of Object.keys(this.state.players)) {
      const card = generateBingoCard(playerId);
      cards[playerId] = card;
      this.state.players[playerId].card = card;
    }

    // Inicializa o jogo
    const balls = shuffleBalls(createBallPool());
    this.state.game = {
      drawnBalls: [],
      remainingBalls: balls,
      currentBall: null,
      ranking: this.calculateRanking(),
      startedAt: Date.now(),
      endedAt: null,
      winnerId: null,
    };
    this.state.gamePhase = "playing";

    await this.saveState();

    this.broadcast({
      type: "GAME_STARTED",
      payload: { cards },
    });

    // Atualiza admin
    await this.reportToAdmin('UPDATE_ROOM');
  }

  private async handleDrawBall(conn: Party.Connection) {
    // Verifica se é o host
    if (conn.id !== this.state.hostId) {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NOT_HOST", message: "Apenas o host pode sortear" },
      });
      return;
    }

    if (!this.state.game || this.state.gamePhase !== "playing") {
      return;
    }

    const result = drawNextBall(
      this.state.game.remainingBalls,
      this.state.game.drawnBalls.length
    );

    if (!result) {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NO_BALLS_LEFT", message: "Todas as bolas já foram sorteadas" },
      });
      return;
    }

    this.state.game.currentBall = result.ball;
    this.state.game.drawnBalls.push(result.ball);
    this.state.game.remainingBalls = result.remaining;

    await this.saveState();

    this.broadcast({
      type: "BALL_DRAWN",
      payload: {
        ball: result.ball,
        drawnBalls: this.state.game.drawnBalls,
      },
    });
  }

  private async handleMarkNumber(
    conn: Party.Connection,
    payload: { number: number; position: { row: number; col: number } }
  ) {
    console.log("[MARK] Attempting to mark number:", payload.number, "for conn:", conn.id);
    console.log("[MARK] Current players:", Object.keys(this.state.players));

    const player = this.state.players[conn.id];
    if (!player) {
      console.log("[MARK] Player not found for conn.id:", conn.id);
      this.send(conn, {
        type: "ERROR",
        payload: { code: "PLAYER_NOT_FOUND", message: "Jogador não encontrado" },
      });
      return;
    }
    if (!player.card) {
      console.log("[MARK] Player has no card");
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NO_CARD", message: "Jogador não tem cartela" },
      });
      return;
    }
    if (!this.state.game) {
      console.log("[MARK] Game not started");
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NO_GAME", message: "Jogo não iniciado" },
      });
      return;
    }

    // Verifica se o número foi sorteado
    const wasDrawn = this.state.game.drawnBalls.some(
      (b) => b.number === payload.number
    );

    console.log("[MARK] Number", payload.number, "wasDrawn:", wasDrawn);

    if (!wasDrawn) {
      // Número não foi sorteado - erro!
      this.send(conn, {
        type: "NUMBER_MARKED",
        payload: {
          playerId: conn.id,
          playerName: player.name,
          number: payload.number,
          valid: false,
          newScore: player.score,
        },
      });
      return;
    }

    // Marca o número na cartela
    const cell = player.card.cells[payload.position.row][payload.position.col];
    if (cell.number !== payload.number || cell.isMarked) {
      console.log("[MARK] Invalid position or already marked. Cell:", cell.number, "isMarked:", cell.isMarked);
      return; // Posição inválida ou já marcado
    }

    cell.isMarked = true;
    player.markedNumbers.push(payload.number);

    // Verifica linhas completadas
    const newLines = findNewlyCompletedLines(
      player.card,
      payload.position,
      player.completedLines
    );

    if (newLines.length > 0) {
      player.completedLines.push(...newLines);

      // Notifica sobre linha(s) completada(s)
      for (const line of newLines) {
        this.broadcast({
          type: "LINE_COMPLETED",
          payload: {
            playerId: conn.id,
            playerName: player.name,
            avatarId: player.avatarId,
            lineType: line.type,
            newScore: calculateTotalScore(player.markedNumbers.length, player.completedLines),
          },
        });
      }
    }

    // Atualiza pontuação
    player.score = calculateTotalScore(
      player.markedNumbers.length,
      player.completedLines
    );

    // Verifica BINGO
    if (isCardComplete(player.card)) {
      player.hasBingo = true;
    }

    await this.saveState();

    // Envia confirmação
    this.send(conn, {
      type: "NUMBER_MARKED",
      payload: {
        playerId: conn.id,
        playerName: player.name,
        number: payload.number,
        valid: true,
        newScore: player.score,
      },
    });

    // Atualiza ranking
    this.state.game.ranking = this.calculateRanking();
    this.broadcast({
      type: "RANKING_UPDATE",
      payload: { ranking: this.state.game.ranking },
    });
  }

  private async handleClaimBingo(conn: Party.Connection) {
    const player = this.state.players[conn.id];
    if (!player || !player.card || !this.state.game) return;

    if (!isCardComplete(player.card)) {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "INVALID_BINGO", message: "Cartela não está completa" },
      });
      return;
    }

    // Já completou antes? Ignora
    if (player.hasBingo) {
      return;
    }

    // Marca jogador como tendo completado
    player.hasBingo = true;
    player.bingoCompletedAt = Date.now();

    // Conta quantos jogadores completaram
    const playersWithBingo = Object.values(this.state.players).filter(p => p.hasBingo);
    const totalPlayers = Object.keys(this.state.players).length;
    const isFirstWinner = playersWithBingo.length === 1;

    // Define posição de conclusão
    player.bingoPosition = playersWithBingo.length;

    // Se é o primeiro vencedor, registra como winnerId
    if (isFirstWinner) {
      this.state.game.winnerId = conn.id;
    }

    await this.saveState();

    // Envia celebração de BINGO (sempre mostra para cada jogador que completa)
    this.broadcast({
      type: "BINGO_WON",
      payload: {
        winnerId: conn.id,
        winnerName: player.name,
        winnerAvatarId: player.avatarId,
        finalScores: this.calculateRanking(),
        isFirstWinner,
        completedCount: playersWithBingo.length,
        totalPlayers,
      },
    });

    // Verifica se todos os jogadores completaram
    if (playersWithBingo.length === totalPlayers) {
      // Jogo termina quando todos completaram
      this.state.game.endedAt = Date.now();
      this.state.gamePhase = "ended";
      await this.saveState();

      this.broadcast({
        type: "GAME_ENDED",
        payload: {
          reason: "all_completed",
          finalScores: this.calculateRanking(),
        },
      });

      // Atualiza admin
      await this.reportToAdmin('UPDATE_ROOM');
    }
  }

  private async handleLeaveRoom(conn: Party.Connection) {
    const player = this.state.players[conn.id];
    if (player) {
      delete this.state.players[conn.id];
      await this.saveState();

      this.broadcast({
        type: "PLAYER_LEFT",
        payload: { playerId: conn.id, playerName: player.name },
      });

      // Atualiza admin
      await this.reportToAdmin('UPDATE_ROOM');
    }
  }

  private async handleClaimHost(conn: Party.Connection) {
    // Só aceita claim se o jogo está em andamento (playing)
    // Isso evita que qualquer um se torne host
    if (this.state.gamePhase !== "playing") {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "INVALID_CLAIM", message: "Não é possível reivindicar host agora" },
      });
      return;
    }

    // Atualiza o hostId para a nova conexão
    // Host é apenas controlador, não precisa de dados de jogador
    this.state.hostId = conn.id;

    await this.saveState();

    // Envia estado atualizado para todos
    this.broadcast({
      type: "ROOM_STATE",
      payload: this.state,
    });
  }

  private async handleRejoinGame(
    conn: Party.Connection,
    payload: { oldPlayerId: string }
  ) {
    try {
      console.log("[REJOIN] Attempting rejoin for oldPlayerId:", payload.oldPlayerId);
      console.log("[REJOIN] Current players:", Object.keys(this.state.players));

      // Cancela timer de desconexão pendente (se existir)
      const pendingTimer = this.disconnectTimers.get(payload.oldPlayerId);
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        this.disconnectTimers.delete(payload.oldPlayerId);
        console.log("[REJOIN] Cancelled pending disconnect timer for:", payload.oldPlayerId);
      }

      // Busca o jogador pelo ID antigo
      const oldPlayer = this.state.players[payload.oldPlayerId];

      if (!oldPlayer) {
        console.log("[REJOIN] Player not found");
        this.send(conn, {
          type: "ERROR",
          payload: { code: "PLAYER_NOT_FOUND", message: "Jogador não encontrado" },
        });
        return;
      }

      if (!oldPlayer.card) {
        console.log("[REJOIN] Player has no card");
        this.send(conn, {
          type: "ERROR",
          payload: { code: "NO_CARD", message: "Jogador não tem cartela" },
        });
        return;
      }

      // Cria nova cartela com novo playerId (cópia explícita)
      const newCard: BingoCard = {
        id: oldPlayer.card.id,
        playerId: conn.id,
        cells: oldPlayer.card.cells,
        generatedAt: oldPlayer.card.generatedAt,
      };

      // Transfere o jogador para a nova conexão
      const newPlayer = {
        id: conn.id,
        name: oldPlayer.name,
        avatarId: oldPlayer.avatarId,
        joinedAt: oldPlayer.joinedAt,
        isHost: oldPlayer.isHost,
        isConnected: true,
        card: newCard,
        markedNumbers: oldPlayer.markedNumbers || [],
        score: oldPlayer.score || 0,
        completedLines: oldPlayer.completedLines || [],
        hasBingo: oldPlayer.hasBingo || false,
      };

      // Remove do ID antigo e adiciona no novo
      delete this.state.players[payload.oldPlayerId];
      this.state.players[conn.id] = newPlayer;

      await this.saveState();

      console.log("[REJOIN] Success! New playerId:", conn.id);

      // Envia confirmação com a cartela, números marcados e bolas sorteadas
      this.send(conn, {
        type: "REJOIN_SUCCESS",
        payload: {
          playerId: conn.id,
          card: newCard,
          markedNumbers: newPlayer.markedNumbers,
          drawnBalls: this.state.game?.drawnBalls || [],
          currentBall: this.state.game?.currentBall || null,
        },
      });

      // Atualiza ranking para refletir o novo ID
      if (this.state.game) {
        this.state.game.ranking = this.calculateRanking();
        this.broadcast({
          type: "RANKING_UPDATE",
          payload: { ranking: this.state.game.ranking },
        });
      }
    } catch (error) {
      console.error("[REJOIN] Error:", error);
      this.send(conn, {
        type: "ERROR",
        payload: { code: "REJOIN_ERROR", message: "Erro ao reconectar" },
      });
    }
  }

  private async handleIdentify(
    conn: Party.Connection,
    payload: {
      sessionToken: string | null;
      tabId: string;
      playerName?: string;
      avatarId?: string;
      isHost?: boolean;
    }
  ) {
    const { sessionToken, tabId, playerName, avatarId, isHost } = payload;

    console.log("[IDENTIFY] Received:", { sessionToken: sessionToken?.slice(0, 8), tabId: tabId.slice(0, 8), playerName, isHost });

    // CASO 1: Sessão existente - reconexão
    if (sessionToken && this.state.sessions[sessionToken]) {
      const session = this.state.sessions[sessionToken];
      const oldPlayerId = session.playerId;

      console.log("[IDENTIFY] Existing session found, reconnecting. oldPlayerId:", oldPlayerId);

      // Cancela timer de desconexão pendente (se existir)
      // Isso evita a notificação falsa de "desconectou" durante navegação
      const pendingTimer = this.disconnectTimers.get(oldPlayerId);
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        this.disconnectTimers.delete(oldPlayerId);
        console.log("[IDENTIFY] Cancelled pending disconnect timer for:", oldPlayerId);
      }

      // Atualiza sessão com nova conexão
      session.playerId = conn.id;
      session.lastSeenAt = Date.now();
      session.isConnected = true;

      if (!session.activeTabIds.includes(tabId)) {
        session.activeTabIds.push(tabId);
      }

      // Transfere dados do jogador para novo connection ID (se é jogador, não host)
      if (!session.isHost && this.state.players[oldPlayerId]) {
        const oldPlayer = this.state.players[oldPlayerId];

        // Cria novo player com novo ID
        const newPlayer: Player = {
          ...oldPlayer,
          id: conn.id,
          isConnected: true,
        };

        // Se tem cartela, atualiza playerId nela também
        if (newPlayer.card) {
          newPlayer.card = {
            ...newPlayer.card,
            playerId: conn.id,
          };
        }

        // Remove do ID antigo e adiciona no novo
        delete this.state.players[oldPlayerId];
        this.state.players[conn.id] = newPlayer;
      }

      // Se é host, atualiza hostId
      if (session.isHost) {
        this.state.hostId = conn.id;
      }

      await this.saveState();

      // Responde com dados restaurados
      const player = this.state.players[conn.id];
      this.send(conn, {
        type: "IDENTITY_CONFIRMED",
        payload: {
          sessionToken,
          playerId: conn.id,
          isReconnection: true,
          playerName: session.playerName,
          avatarId: session.avatarId,
          isHost: session.isHost,
          gamePhase: this.state.gamePhase,
          card: player?.card || undefined,
          markedNumbers: player?.markedNumbers,
          drawnBalls: this.state.game?.drawnBalls,
          currentBall: this.state.game?.currentBall,
          ranking: this.state.game?.ranking,
        },
      });

      // Envia ROOM_STATE também para sincronizar
      this.send(conn, {
        type: "ROOM_STATE",
        payload: this.state,
      });

      // Atualiza ranking para refletir reconexão
      if (this.state.game) {
        this.state.game.ranking = this.calculateRanking();
        this.broadcast({
          type: "RANKING_UPDATE",
          payload: { ranking: this.state.game.ranking },
        });
      }

      return;
    }

    // CASO 2: Token inválido ou expirado (enviou token mas não existe)
    if (sessionToken && !this.state.sessions[sessionToken]) {
      console.log("[IDENTIFY] Invalid/expired session token");
      this.send(conn, {
        type: "IDENTITY_REJECTED",
        payload: {
          reason: "session_expired",
          message: "Sessão expirada. Por favor, entre novamente.",
        },
      });
      return;
    }

    // CASO 3: Nova sessão (sessionToken é null)
    const newToken = generateSessionToken();
    const newSession: SessionInfo = {
      sessionToken: newToken,
      playerId: conn.id,
      playerName: playerName || "",
      avatarId: avatarId || "",
      isHost: isHost || false,
      activeTabIds: [tabId],
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      isConnected: true,
    };

    this.state.sessions[newToken] = newSession;

    console.log("[IDENTIFY] New session created:", newToken.slice(0, 8), "isHost:", isHost);

    // Processa como host ou jogador
    if (isHost) {
      this.state.hostId = conn.id;
      this.state.hostName = "Host";
    } else if (playerName) {
      const player: Player = {
        id: conn.id,
        name: playerName,
        avatarId: avatarId || "",
        joinedAt: Date.now(),
        isHost: false,
        isConnected: true,
        card: null,
        markedNumbers: [],
        score: 0,
        completedLines: [],
        hasBingo: false,
      };

      // Late join - gera cartela
      if (this.state.gamePhase === "playing" && this.state.game) {
        const card = generateBingoCard(conn.id);
        player.card = card;
        console.log("[IDENTIFY] Late join - generated card for", playerName);

        this.state.players[conn.id] = player;
        await this.saveState();

        // Notifica todos sobre jogador atrasado
        this.broadcast({
          type: "PLAYER_JOINED",
          payload: { player, isLateJoin: true },
        });

        // Envia confirmação com dados do jogo
        this.send(conn, {
          type: "IDENTITY_CONFIRMED",
          payload: {
            sessionToken: newToken,
            playerId: conn.id,
            isReconnection: false,
            playerName,
            avatarId: avatarId || "",
            isHost: false,
            gamePhase: this.state.gamePhase,
            card: player.card,
            drawnBalls: this.state.game.drawnBalls,
            currentBall: this.state.game.currentBall,
            ranking: this.calculateRanking(),
          },
        });

        this.send(conn, {
          type: "ROOM_STATE",
          payload: this.state,
        });

        return;
      }

      this.state.players[conn.id] = player;

      // Notifica todos sobre novo jogador
      this.broadcast({
        type: "PLAYER_JOINED",
        payload: { player, isLateJoin: false },
      });
    }

    await this.saveState();

    // Envia confirmação
    this.send(conn, {
      type: "IDENTITY_CONFIRMED",
      payload: {
        sessionToken: newToken,
        playerId: conn.id,
        isReconnection: false,
        playerName: playerName || "",
        avatarId: avatarId || "",
        isHost: isHost || false,
        gamePhase: this.state.gamePhase,
        card: this.state.players[conn.id]?.card || undefined,
        drawnBalls: this.state.game?.drawnBalls,
        currentBall: this.state.game?.currentBall,
      },
    });

    // Envia estado da sala
    this.send(conn, {
      type: "ROOM_STATE",
      payload: this.state,
    });
  }

  private async handleReturnToLobby(conn: Party.Connection) {
    // Apenas host pode fazer isso
    if (conn.id !== this.state.hostId) {
      this.send(conn, {
        type: "ERROR",
        payload: { code: "NOT_HOST", message: "Apenas o host pode voltar ao lobby" },
      });
      return;
    }

    console.log("[RETURN_TO_LOBBY] Resetting game state for new round");

    // Reseta estado do jogo
    this.state.gamePhase = "lobby";
    this.state.game = null;

    // Reseta dados dos jogadores (mantém jogadores na sala)
    for (const playerId in this.state.players) {
      const player = this.state.players[playerId];
      player.card = null;
      player.markedNumbers = [];
      player.score = 0;
      player.completedLines = [];
      player.hasBingo = false;
      player.bingoCompletedAt = undefined;
      player.bingoPosition = undefined;
    }

    // Limpa sessões para forçar re-identificação limpa
    this.state.sessions = {};

    await this.saveState();

    // Notifica todos
    this.broadcast({
      type: "RETURNED_TO_LOBBY",
      payload: { message: "Preparando nova rodada..." },
    });

    // Envia estado atualizado
    this.broadcast({
      type: "ROOM_STATE",
      payload: this.state,
    });

    // Atualiza admin
    await this.reportToAdmin('UPDATE_ROOM');
  }

  // ============ Helpers ============

  private calculateRanking(): RankingEntry[] {
    const players = Object.values(this.state.players);
    // Ordena: quem completou primeiro fica em primeiro, depois por pontuação
    const sorted = [...players].sort((a, b) => {
      // Quem completou tem prioridade
      if (a.hasBingo && !b.hasBingo) return -1;
      if (!a.hasBingo && b.hasBingo) return 1;
      // Se ambos completaram, ordena pela ordem de conclusão
      if (a.hasBingo && b.hasBingo) {
        return (a.bingoPosition || 999) - (b.bingoPosition || 999);
      }
      // Se nenhum completou, ordena por pontuação
      return b.score - a.score;
    });

    return sorted.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      avatarId: player.avatarId,
      score: player.score,
      linesCompleted: player.completedLines.length,
      position: index + 1,
      previousPosition: index + 1, // Simplificado
      isConnected: player.isConnected,
    }));
  }

  private send(conn: Party.Connection, message: ServerMessage) {
    conn.send(JSON.stringify(message));
  }

  private broadcast(message: ServerMessage) {
    this.room.broadcast(JSON.stringify(message));
  }

  private async saveState() {
    await this.room.storage.put("state", this.state);
  }

  // Reporta stats para o admin room
  private async reportToAdmin(type: 'REGISTER_ROOM' | 'UPDATE_ROOM' | 'REMOVE_ROOM') {
    try {
      const adminRoom = this.room.context.parties.admin.get("__admin__");

      if (type === 'REMOVE_ROOM') {
        await adminRoom.fetch({
          method: 'POST',
          body: JSON.stringify({
            type: 'REMOVE_ROOM',
            payload: { pin: this.state.pin }
          })
        });
      } else {
        const players = Object.values(this.state.players);
        const stats: RoomStats = {
          pin: this.state.pin,
          gamePhase: this.state.gamePhase,
          playerCount: players.length,
          connectedCount: players.filter(p => p.isConnected).length,
          createdAt: this.state.createdAt,
          lastActivity: Date.now(),
        };

        await adminRoom.fetch({
          method: 'POST',
          body: JSON.stringify({ type, payload: stats })
        });
      }
    } catch (error) {
      // Silently fail - admin reporting is not critical
      console.error("[ADMIN_REPORT] Error:", error);
    }
  }
}
