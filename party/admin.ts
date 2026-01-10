import type * as Party from "partykit/server";
import type { RoomStats, AdminStats, AdminClientMessage, AdminServerMessage } from "../src/types/admin";

// Senha padrão para admin
const ADMIN_PASSWORD = "8533";

export default class AdminRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Stats de todas as salas
  stats: AdminStats = {
    rooms: {},
    totalRooms: 0,
    totalPlayers: 0,
    lastUpdate: Date.now(),
  };

  // Conexões autenticadas
  authenticatedConnections: Set<string> = new Set();

  async onStart() {
    // Carrega stats persistidos
    const stored = await this.room.storage.get<AdminStats>("stats");
    if (stored) {
      this.stats = stored;
      // Limpa salas antigas (mais de 25h sem atividade)
      const cutoff = Date.now() - 25 * 60 * 60 * 1000;
      for (const [pin, room] of Object.entries(this.stats.rooms)) {
        if (room.lastActivity < cutoff) {
          delete this.stats.rooms[pin];
        }
      }
      this.recalculateTotals();
    }
  }

  async onConnect(conn: Party.Connection) {
    // Novo admin conectado - precisa autenticar
    console.log("[ADMIN] New connection:", conn.id);
  }

  async onClose(conn: Party.Connection) {
    this.authenticatedConnections.delete(conn.id);
    console.log("[ADMIN] Connection closed:", conn.id);
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data: AdminClientMessage = JSON.parse(message);

      switch (data.type) {
        case "AUTHENTICATE":
          if (data.payload.password === ADMIN_PASSWORD) {
            this.authenticatedConnections.add(sender.id);
            this.send(sender, { type: "AUTH_SUCCESS" });
            // Envia stats atuais
            this.send(sender, { type: "STATS_UPDATE", payload: this.stats });
            console.log("[ADMIN] Client authenticated:", sender.id);
          } else {
            this.send(sender, {
              type: "AUTH_FAILED",
              payload: { message: "Senha incorreta" }
            });
            console.log("[ADMIN] Auth failed for:", sender.id);
          }
          break;

        case "REQUEST_STATS":
          if (this.authenticatedConnections.has(sender.id)) {
            this.send(sender, { type: "STATS_UPDATE", payload: this.stats });
          }
          break;
      }
    } catch (error) {
      console.error("[ADMIN] Error processing message:", error);
    }
  }

  // HTTP endpoint para receber updates das salas de jogo
  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await req.json() as { type: string; payload: RoomStats | { pin: string } };

      switch (body.type) {
        case "REGISTER_ROOM":
        case "UPDATE_ROOM": {
          const roomStats = body.payload as RoomStats;
          this.stats.rooms[roomStats.pin] = roomStats;
          this.recalculateTotals();
          await this.saveStats();
          this.broadcastToAuthenticated({
            type: body.type === "REGISTER_ROOM" ? "ROOM_REGISTERED" : "ROOM_UPDATED",
            payload: roomStats
          });
          console.log(`[ADMIN] Room ${body.type}:`, roomStats.pin, "players:", roomStats.playerCount);
          break;
        }

        case "REMOVE_ROOM": {
          const { pin } = body.payload as { pin: string };
          delete this.stats.rooms[pin];
          this.recalculateTotals();
          await this.saveStats();
          this.broadcastToAuthenticated({ type: "ROOM_REMOVED", payload: { pin } });
          console.log("[ADMIN] Room removed:", pin);
          break;
        }
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[ADMIN] Error processing request:", error);
      return new Response("Error", { status: 500 });
    }
  }

  private recalculateTotals() {
    const rooms = Object.values(this.stats.rooms);
    this.stats.totalRooms = rooms.length;
    this.stats.totalPlayers = rooms.reduce((sum, r) => sum + r.connectedCount, 0);
    this.stats.lastUpdate = Date.now();
  }

  private send(conn: Party.Connection, message: AdminServerMessage) {
    conn.send(JSON.stringify(message));
  }

  private broadcastToAuthenticated(message: AdminServerMessage) {
    const messageStr = JSON.stringify(message);
    for (const conn of this.room.getConnections()) {
      if (this.authenticatedConnections.has(conn.id)) {
        conn.send(messageStr);
      }
    }
  }

  private async saveStats() {
    await this.room.storage.put("stats", this.stats);
  }
}
