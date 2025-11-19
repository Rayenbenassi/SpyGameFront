// src/services/gameAPI.ts

// Match your SessionConfigDto exactly with Multi-Spy support
export interface SessionConfigDto {
  totalRounds: number;
  categoryId: number;
  gameMode?: GameMode;
  spiesCount?: number; // Make sure this exists
}

export type GameMode = 'CLASSIC' | 'MULTI_SPY';

// Match your updated GameSession model with Multi-Spy fields
export interface GameSession {
  id: number;
  currentRound: number;
  finished: boolean;
  numberOfRounds: number;
  category: Category;
  players: Player[];
  rounds: Round[];
  gameMode: GameMode;
  spiesCount: number;
  spiesWon?: boolean;
}

// Match your updated Player model with elimination fields
export interface Player {
  id: number;
  name: string;
  score: number;
  session?: GameSession;
  isEliminated: boolean; // ADD THIS - make it required
  eliminatedInRoundId?: number;
  isSpy?: boolean;
}

// Match your updated Round model with spyData
export interface Round {
  id: number;
  roundNumber: number;
  completed: boolean;
  spy: Player;
  question: Question;
  session?: GameSession;
  votes?: Vote[];
  spyData?: string; // JSON storing spy IDs for both modes
}

// Match your Category model
export interface Category {
  id: number;
  name: string;
  logoUrl?: string;
}

// Match your Question model
export interface Question {
  id: number;
  text: string;
  altText?: string;
  locale?: string;
  category: Category;
}

export interface Vote {
  id: number;
  voter: Player;
  votedFor: Player;
  round: Round;
}

// Multi-Spy specific interfaces
export interface EliminationResult {
  eliminatedPlayer: Player;
  sessionStatus: GameSession;
  gameContinues: boolean;
  message?: string;
}

const API_BASE_URL = 'http://192.168.100.37:8080/api';

// Test backend connectivity
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/random`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('🔗 Backend connection test - Status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('🔗 Backend connection failed:', error);
    return false;
  }
};

export const gameAPI = {
  // Create new game session with configuration including game mode
  createSession: async (playerNames: string[], sessionConfig: SessionConfigDto): Promise<GameSession> => {
    console.log('📡 Sending create session request:', {
      playerNames,
      sessionConfigDto: sessionConfig
    });

    try {
      const response = await fetch(`${API_BASE_URL}/game/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerNames,
          sessionConfigDto: sessionConfig
        }),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Failed to create session: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Session created successfully:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Network error:', error);
      throw error;
    }
  },

  // Start first round
  startRound: async (sessionId: number): Promise<Round> => {
    console.log('📡 Starting round for session:', sessionId);
    const response = await fetch(`${API_BASE_URL}/game/${sessionId}/round`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to start round:', errorText);
      throw new Error(`Failed to start round: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Round started successfully:', data);
    return data;
  },

  // Get session status
  getSessionStatus: async (sessionId: number): Promise<GameSession> => {
    console.log('📡 Getting session status:', sessionId);
    const response = await fetch(`${API_BASE_URL}/game/${sessionId}/status`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get session status:', errorText);
      throw new Error(`Failed to get session status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Session status retrieved:', data);
    return data;
  },

  // Finish current round
  finishRound: async (roundId: number): Promise<void> => {
    console.log('📡 Finishing round:', roundId);
    const response = await fetch(`${API_BASE_URL}/game/round/${roundId}/finish`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to finish round:', errorText);
      throw new Error(`Failed to finish round: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Round finished successfully');
  },

  // Move to next round
  nextRound: async (sessionId: number, currentRoundId: number): Promise<Round> => {
    console.log('📡 Starting next round:', { sessionId, currentRoundId });
    const response = await fetch(`${API_BASE_URL}/game/${sessionId}/next-round/${currentRoundId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to start next round:', errorText);
      throw new Error(`Failed to start next round: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Next round started:', data);
    return data;
  },

  // End game session
  finishSession: async (sessionId: number): Promise<void> => {
    console.log('📡 Finishing session:', sessionId);
    const response = await fetch(`${API_BASE_URL}/game/${sessionId}/end`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to end session:', errorText);
      throw new Error(`Failed to end session: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Session finished successfully');
  },

eliminatePlayer: async (roundId: number, playerId: number): Promise<EliminationResult> => {
    console.log('📡 Eliminating player:', { roundId, playerId });
    const response = await fetch(`${API_BASE_URL}/player/round/${roundId}/eliminate/${playerId}`, {  // Changed to /player/round
        method: 'POST',
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to eliminate player:', errorText);
        throw new Error(`Failed to eliminate player: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Player eliminated successfully:', data);
    return data;
},

  // NEW: Get active players (non-eliminated)
  getActivePlayers: async (sessionId: number): Promise<Player[]> => {
    console.log('📡 Getting active players for session:', sessionId);
    const response = await fetch(`${API_BASE_URL}/game/${sessionId}/active-players`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get active players:', errorText);
      throw new Error(`Failed to get active players: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Active players retrieved:', data);
    return data;
  },

  // NEW: Get eliminated player for a round
  getEliminatedPlayer: async (roundId: number): Promise<Player> => {
    console.log('📡 Getting eliminated player for round:', roundId);
    const response = await fetch(`${API_BASE_URL}/game/round/${roundId}/eliminated-player`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get eliminated player:', errorText);
      throw new Error(`Failed to get eliminated player: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Eliminated player retrieved:', data);
    return data;
  },

  // Get votes for a round
  getVotesForRound: async (roundId: number): Promise<Vote[]> => {
    console.log('📡 Getting votes for round:', roundId);
    const response = await fetch(`${API_BASE_URL}/votes/round/${roundId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get votes:', errorText);
      throw new Error(`Failed to get votes: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Votes retrieved:', data);
    return data;
  },

  // Cast a vote
  castVote: async (roundId: number, voterId: number, votedForId: number): Promise<Vote> => {
    console.log('📡 Casting vote:', { roundId, voterId, votedForId });
    const response = await fetch(`${API_BASE_URL}/votes/cast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId, voterId, votedForId }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to cast vote:', errorText);
      throw new Error(`Failed to cast vote: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Vote cast successfully:', data);
    return data;
  },

  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    console.log('📡 Getting categories');
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get categories:', errorText);
      throw new Error(`Failed to get categories: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Categories retrieved:', data);
    return data;
  },

  // Get player votes for a round
  getPlayerVote: async (roundId: number, playerId: number): Promise<Vote | null> => {
    console.log('📡 Getting player vote:', { roundId, playerId });
    const response = await fetch(`${API_BASE_URL}/votes/round/${roundId}/player/${playerId}`);
    
    if (!response.ok) {
      // If player hasn't voted yet, return null instead of throwing
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.error('❌ Failed to get player vote:', errorText);
      throw new Error(`Failed to get player vote: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Player vote retrieved:', data);
    return data;
  },

  // Check if all players have voted
  haveAllPlayersVoted: async (roundId: number, totalPlayers: number): Promise<boolean> => {
    console.log('📡 Checking if all players voted:', roundId);
    const response = await fetch(`${API_BASE_URL}/votes/round/${roundId}/count`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to check vote count:', errorText);
      throw new Error(`Failed to check vote count: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Vote count:', data, 'Total players:', totalPlayers);
    return data >= totalPlayers;
  },

  // NEW: Get random question
  getRandomQuestion: async (): Promise<Question> => {
    console.log('📡 Getting random question');
    const response = await fetch(`${API_BASE_URL}/questions/random`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get random question:', errorText);
      throw new Error(`Failed to get random question: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Random question retrieved:', data);
    return data;
  },

  // Export testBackendConnection as part of gameAPI
  testBackendConnection,
};

// Export the test function directly (remove this duplicate export)
// Remove this line: export { testBackendConnection };