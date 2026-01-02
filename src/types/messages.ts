// Tipos de mensagens WebSocket entre cliente e servidor

import type { Player, RoomState } from './room';
import type { BingoCard, BingoBall, RankingEntry } from './game';

// ============ CLIENT -> SERVER ============

export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  payload: {
    playerName: string;
    avatarId: string;
    isHost?: boolean;
  };
}

export interface SelectAvatarMessage {
  type: 'SELECT_AVATAR';
  payload: {
    avatarId: string;
  };
}

export interface StartGameMessage {
  type: 'START_GAME';
}

export interface DrawBallMessage {
  type: 'DRAW_BALL';
}

export interface MarkNumberMessage {
  type: 'MARK_NUMBER';
  payload: {
    number: number;
    position: { row: number; col: number };
  };
}

export interface ClaimLineMessage {
  type: 'CLAIM_LINE';
  payload: {
    lineType: 'row' | 'column' | 'diagonal';
    lineIndex: number;
  };
}

export interface ClaimBingoMessage {
  type: 'CLAIM_BINGO';
}

export interface LeaveRoomMessage {
  type: 'LEAVE_ROOM';
}

export interface ClaimHostMessage {
  type: 'CLAIM_HOST';
}

export interface RejoinGameMessage {
  type: 'REJOIN_GAME';
  payload: {
    oldPlayerId: string;
  };
}

export type ClientMessage =
  | JoinRoomMessage
  | SelectAvatarMessage
  | StartGameMessage
  | DrawBallMessage
  | MarkNumberMessage
  | ClaimLineMessage
  | ClaimBingoMessage
  | LeaveRoomMessage
  | ClaimHostMessage
  | RejoinGameMessage;

// ============ SERVER -> CLIENT ============

export interface RoomStateMessage {
  type: 'ROOM_STATE';
  payload: RoomState;
}

export interface PlayerJoinedMessage {
  type: 'PLAYER_JOINED';
  payload: {
    player: Player;
    isLateJoin?: boolean;  // true se entrou após o jogo iniciar
  };
}

export interface PlayerLeftMessage {
  type: 'PLAYER_LEFT';
  payload: {
    playerId: string;
    playerName: string;
  };
}

export interface AvatarChangedMessage {
  type: 'AVATAR_CHANGED';
  payload: {
    playerId: string;
    avatarId: string;
  };
}

export interface GameStartedMessage {
  type: 'GAME_STARTED';
  payload: {
    cards: Record<string, BingoCard>;
  };
}

export interface BallDrawnMessage {
  type: 'BALL_DRAWN';
  payload: {
    ball: BingoBall;
    drawnBalls: BingoBall[];
  };
}

export interface NumberMarkedMessage {
  type: 'NUMBER_MARKED';
  payload: {
    playerId: string;
    playerName: string;
    number: number;
    valid: boolean;
    newScore: number;
  };
}

export interface LineCompletedMessage {
  type: 'LINE_COMPLETED';
  payload: {
    playerId: string;
    playerName: string;
    avatarId: string;
    lineType: 'row' | 'column' | 'diagonal';
    newScore: number;
  };
}

export interface BingoWonMessage {
  type: 'BINGO_WON';
  payload: {
    winnerId: string;
    winnerName: string;
    winnerAvatarId: string;
    finalScores: RankingEntry[];
    isFirstWinner?: boolean;    // true se é o primeiro a completar
    completedCount?: number;    // quantos já completaram
    totalPlayers?: number;      // total de jogadores
  };
}

export interface GameEndedMessage {
  type: 'GAME_ENDED';
  payload: {
    reason: 'all_completed' | 'host_ended' | 'no_balls_left';
    finalScores: RankingEntry[];
  };
}

export interface RankingUpdateMessage {
  type: 'RANKING_UPDATE';
  payload: {
    ranking: RankingEntry[];
  };
}

export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    code: string;
    message: string;
  };
}

export interface HostConnectedMessage {
  type: 'HOST_CONNECTED';
  payload: {
    hostId: string;
  };
}

export interface RejoinSuccessMessage {
  type: 'REJOIN_SUCCESS';
  payload: {
    playerId: string;
    card: BingoCard;
    markedNumbers: number[];
    drawnBalls: BingoBall[];
    currentBall: BingoBall | null;
  };
}

export interface LateJoinSuccessMessage {
  type: 'LATE_JOIN_SUCCESS';
  payload: {
    card: BingoCard;
    drawnBalls: BingoBall[];
    currentBall: BingoBall | null;
    ranking: RankingEntry[];
  };
}

export type ServerMessage =
  | RoomStateMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | AvatarChangedMessage
  | GameStartedMessage
  | BallDrawnMessage
  | NumberMarkedMessage
  | LineCompletedMessage
  | BingoWonMessage
  | GameEndedMessage
  | RankingUpdateMessage
  | ErrorMessage
  | HostConnectedMessage
  | RejoinSuccessMessage
  | LateJoinSuccessMessage;
