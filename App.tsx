import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
//Pantallas finales
import Login from './screens/Login';
import Inicio from './screens/Inicio';
import Llegada from './screens/Llegada';
import Documentacion from './screens/Documentacion';
import Enrrampar from './screens/Enrrampar';
import Desenrrampe from './screens/Desenrrampe';
import Liberacion from './screens/Liberacion';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function App(): JSX.Element {

  const config = {
    animation: 'spring',
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  return (
   <NavigationContainer>
      <Stack.Navigator initialRouteName='Login' 
      screenOptions={{
        headerShown:false,
        animationEnabled:true,
        animationTypeForReplace:'pop',
        presentation:'modal',
        transitionSpec:{
          open:config,
          close:config
        },
        gestureEnabled:true, 
        gestureDirection:'horizontal'
      }} >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name='Inicio' component={Inicio} />
        <Stack.Screen name='Llegada' component={Llegada} />
        <Stack.Screen name='Documentacion' component={Documentacion} />
        <Stack.Screen name='Enrrampar' component={Enrrampar} />
        <Stack.Screen name='Desenrrampe' component={Desenrrampe} />
        <Stack.Screen name='Liberacion' component={Liberacion} />
      </Stack.Navigator>
   </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});

export default App;