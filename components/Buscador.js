import React, {useEffect, useState} from 'react'
import {View, TextInput, StyleSheet,Image, Animated, Text } from 'react-native'
const Buscador = (
    busqueda,
    setBusqueda
) => {
   const [show, setShow] = useState(false);
   const [animacion] = useState(new Animated.Value(0)) 
   const [animacion2] = useState(new Animated.Value(-150)) 
   const expander = () => 
   {
     //console.log('expandido')
     //coordinacionDestino
     setShow(true)
   }
   const compactar = () => 
   {
     //console.log('comprimido')
     setShow(false)
   }
   useEffect(() => 
   {
     if(show)
     {
        Animated.timing(
            animacion,{
                toValue:210,
                duration:100,
                useNativeDriver:false
            }
           ).start()

        Animated.timing(
         animacion2,{
             toValue:8,
             duration:100,
             useNativeDriver:false
         }
        ).start()
     }
     else
     {
        Animated.timing(
            animacion, {
                toValue:100,
                duration:100,
                useNativeDriver:false
            }
           ).start()

           Animated.timing(
            animacion2,{
                toValue:-110,
                duration:100,
                useNativeDriver:false
            }
           ).start() 
     }
   },[show])

   const estiloAnimacion = {
    transform:[
       {translateX:animacion2}
    ]
  }
  return  (
   <Animated.View style={[{width:animacion}]}>
        <Animated.Image style={[styles.iconSearch,estiloAnimacion]}  source={require('../assets/img/icono-busqueda.png')} />
       <TextInput onFocus={()=> {expander()} } onEndEditing={()=>{compactar()}} style={styles.buscador} onChangeText={(newText)=>{busqueda.setBusqueda(newText)}} />
   </Animated.View>
  )
}

const styles = StyleSheet.create({
    buscador:
    {
      backgroundColor:'#1983D6',
      color:'white', 
      borderBottomRightRadius:20,
      borderTopRightRadius:20
    },
    iconSearch:
    {
       height:20,
       width:20,
       position:'absolute',
       zIndex:2,
       marginTop:15,
       marginLeft:170
    },
})

export default Buscador
