export type RootStackParamList = {
  Home: undefined;
  CreateSession: undefined;
  Game: { session: any };
  RevealRole: { round: any; players: any[]; session: any }; // ✅ added session
  Discussion: { round: any; session: any }; // ✅ added Discussion screen
  RoundSummary: { round: any; session: any };

};
