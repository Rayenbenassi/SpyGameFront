// src/services/gameAPI.ts

// Match your SessionConfigDto exactly
export interface SessionConfigDto {
  totalRounds: number;
  categoryId: number;
}

// Match your GameSession model
export interface GameSession {
  id: number;
  currentRound: number;
  finished: boolean;
  numberOfRounds: number;
  category: Category;
  players: Player[];
  rounds: Round[];
}

// Match your Category model
export interface Category {
  id: number;
  name: string;
  logoUrl?: string;
}

// Match your Player model
export interface Player {
  id: number;
  name: string;
  score: number;
  session?: GameSession;
}

// Match your Round model
export interface Round {
  id: number;
  roundNumber: number;
  completed: boolean;
  spy: Player;
  question: Question;
  session?: GameSession;
  votes?: Vote[];
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

const API_BASE_URL = 'https://spyback.onrender.com/api/game';

// Test backend connectivity
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerNames: ['Test1', 'Test2', 'Test3'],
        sessionConfigDto: {
          categoryId: 1,
          totalRounds: 3
        }
      }),
    });
    
    console.log('🔗 Backend connection test - Status:', response.status);
    return true;
  } catch (error) {
    console.error('🔗 Backend connection failed:', error);
    return false;
  }
};

export const gameAPI = {
  // Create new game session with configuration
  createSession: async (playerNames: string[], sessionConfig: SessionConfigDto): Promise<GameSession> => {
    console.log('📡 Sending create session request:', {
      playerNames,
      sessionConfigDto: sessionConfig
    });

    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
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
    const response = await fetch(`${API_BASE_URL}/${sessionId}/round`, {
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
    const response = await fetch(`${API_BASE_URL}/${sessionId}/status`);
    
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
    const response = await fetch(`${API_BASE_URL}/round/${roundId}/finish`, {
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
    const response = await fetch(`${API_BASE_URL}/${sessionId}/next-round/${currentRoundId}`, {
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
    const response = await fetch(`${API_BASE_URL}/${sessionId}/end`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to end session:', errorText);
      throw new Error(`Failed to end session: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Session finished successfully');
  },

  // NEW: Get votes for a round
  getVotesForRound: async (roundId: number): Promise<Vote[]> => {
    console.log('📡 Getting votes for round:', roundId);
    const response = await fetch(`${API_BASE_URL.replace('/game', '')}/votes/round/${roundId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get votes:', errorText);
      throw new Error(`Failed to get votes: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Votes retrieved:', data);
    return data;
  },

  // NEW: Cast a vote
  castVote: async (roundId: number, voterId: number, votedForId: number): Promise<Vote> => {
    console.log('📡 Casting vote:', { roundId, voterId, votedForId });
    const response = await fetch(`${API_BASE_URL.replace('/game', '')}/votes/cast`, {
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

  // NEW: Get all categories
  getCategories: async (): Promise<Category[]> => {
    console.log('📡 Getting categories');
    const response = await fetch(`${API_BASE_URL.replace('/game', '')}/categories`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get categories:', errorText);
      throw new Error(`Failed to get categories: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Categories retrieved:', data);
    return data;
  },

  // NEW: Get player votes for a round
  getPlayerVote: async (roundId: number, playerId: number): Promise<Vote | null> => {
    console.log('📡 Getting player vote:', { roundId, playerId });
    const response = await fetch(`${API_BASE_URL.replace('/game', '')}/votes/round/${roundId}/player/${playerId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get player vote:', errorText);
      throw new Error(`Failed to get player vote: ${response.status} - ${errorText}`);
    }
    
    // If player hasn't voted yet, this might return 404 or empty
    try {
      const data = await response.json();
      console.log('✅ Player vote retrieved:', data);
      return data;
    } catch (error) {
      console.log('✅ No vote found for player');
      return null;
    }
  },

  // NEW: Check if all players have voted
  haveAllPlayersVoted: async (roundId: number, totalPlayers: number): Promise<boolean> => {
    console.log('📡 Checking if all players voted:', roundId);
    const response = await fetch(`${API_BASE_URL.replace('/game', '')}/votes/round/${roundId}/count`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to check vote count:', errorText);
      throw new Error(`Failed to check vote count: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Vote count:', data, 'Total players:', totalPlayers);
    return data >= totalPlayers;
  },
};