import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  TaskList: { volunteerId: string; volunteerData: any };
  TaskDetail: { task: any; volunteerId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TaskList" 
          component={TaskListScreen}
          options={{ title: 'My Tasks' }}
        />
        <Stack.Screen 
          name="TaskDetail" 
          component={TaskDetailScreen}
          options={{ title: 'Task Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}