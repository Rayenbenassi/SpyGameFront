// src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  CreateSession: undefined;
  GameLobby: { sessionId: number }; // NEW: Added GameLobby screen
  Game: { session: any };
  RevealRole: { round: any; players: any[]; session: any }; 
  RoundSummary: { round: any; session: any };
  Discussion: { round: any; session: any };
  Vote: { round: any; session: any };
    GameCompleted: { session: any }; 

};