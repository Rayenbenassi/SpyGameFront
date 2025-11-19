export type RootStackParamList = {
  Home: undefined;
  CreateSession: undefined;
  GameLobby: { sessionId: number };
  Game: { session: any };
  RevealRole: { round: any; players: any[]; session: any }; 
  RoundSummary: { round: any; session: any };
  Discussion: { round: any; session: any };
  Vote: { round: any; session: any };
  Elimination: { round: any; session: any };
  GameCompleted: { 
    session: any; 
    round?: any; 
    winners?: string; 
    message?: string 
  }; // Updated with optional params
};