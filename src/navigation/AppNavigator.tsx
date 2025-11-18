import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import GameScreen from "../screens/GameScreen";
import CreateSessionScreen from "../screens/CreateSessionScreen";
import RevealRoleScreen from "../screens/RevealRoleScreen";
import { RootStackParamList } from "./types";
import DiscussionScreen from "../screens/DiscussionScreen";
import RoundSummaryScreen from "../screens/RoundSummaryScreen";
import VoteScreen from "../screens/VoteScreen";
import { playBackgroundMusic, stopBackgroundMusic } from "../utils/BackgroundMusic";
import GameLobbyScreen from "../screens/GameLobbyScreen";
import GameCompletedScreen from "../screens/GameCompletedScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  useEffect(() => {
  console.log("🔊 App mounted → starting background music");
  playBackgroundMusic();

  return () => {
    console.log("🔇 App unmounted → stopping music");
    stopBackgroundMusic();
  };
}, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="RevealRole" component={RevealRoleScreen} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} />
        <Stack.Screen name="RoundSummary" component={RoundSummaryScreen}/>
        <Stack.Screen name="Vote" component={VoteScreen} />
        <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
        <Stack.Screen name="GameCompleted" component={GameCompletedScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
