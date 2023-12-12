import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
//Pantallas finales
import Login from './screens/Login';
import Inicio from './screens/Inicio';
import Llegada from './screens/Llegada';
import Documentacion from './screens/Documentacion';
import Enrrampar from './screens/Enrrampar';
import Desenrrampe from './screens/Desenrrampe';
import Liberacion from './screens/Liberacion';
import Animated from 'react-native-reanimated';

const Drawer = createDrawerNavigator();

const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

function App(): JSX.Element {

  return (
   <NavigationContainer>
      <Drawer.Navigator initialRouteName='Login'  screenOptions={{
        headerShown:false,
       drawerStyle:{
        backgroundColor:'white',
       },
       drawerInactiveTintColor:'#1D96F1',  
       headerTintColor:'white' ,
      }} >
        <Drawer.Group screenOptions={
         {
          drawerStatusBarAnimation:'slide',
          presentation: 'modal',
         }
        }>
          <Drawer.Screen  options={{
            headerShown:false,
            transitionSpec: {
              open: config,
              close: config,
            },
            }} name='Login' component={Login}  />

           <Drawer.Screen options={{
              headerShown:false,
               title:'',
               headerTransparent: true,
               drawerActiveTintColor:'#1D96F1',  
               transitionSpec: {
                open: config,
                close: config,
              },
             }} name='Inicio' component={Inicio}    />

            <Drawer.Screen options={{
              headerShown:false,
               title:'',
               headerStyle:
               {
                 backgroundColor:'white'
               },
               headerTintColor:'#0A0F2C',
             }} name='Llegada' component={Llegada}    />
           <Drawer.Screen options={{
               headerShown:false,
               title:'',
               headerStyle:
               {
                 backgroundColor:'white'
               },
               headerTintColor:'#0A0F2C',
             }} name='Documentacion' component={Documentacion}/>
           <Drawer.Screen options={{
               headerShown:false,
               title:'',
               headerStyle:
               {
                 backgroundColor:'white'
               },
               headerTintColor:'#0A0F2C',
             }} name='Enrrampar' component={Enrrampar}    />
   
             <Drawer.Screen options={{
               headerShown:false,
               title:'',
               headerStyle:
               {
                 backgroundColor:'white'
               },
               headerTintColor:'#0A0F2C',
             }} name='Desenrrampe' component={Desenrrampe}    />
   
             <Drawer.Screen options={{
               headerShown:false,
               title:'',
               headerStyle:
               {
                 backgroundColor:'white'
               },
               headerTintColor:'#0A0F2C',
             }} name='Liberacion' component={Liberacion}    />
          </Drawer.Group>
      </Drawer.Navigator>
   </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});

export default App;
