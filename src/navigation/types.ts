export type RootStackParamList = {
  Home: undefined;
  CreateSession: undefined;
  Game: { session: any };
  RevealRole: { round: any; players: any[]; session: any }; 
  RoundSummary: { round: any; session: any };
  Discussion: { round: any; session: any };
  Vote: { round: any; session: any };

};
