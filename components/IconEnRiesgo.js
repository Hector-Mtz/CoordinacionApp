import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

const IconEnRiesgo = () => {
  return (
    <View style={styles.contenedor}>
      <Image style={{width:18, height:15, marginHorizontal:10}} source={require('../assets/img/advertencia.png')}/>
       <Text style={{color:'white', fontSize:13.5}}>En riesgo</Text>
    </View>
  )
}

const styles = StyleSheet.create(
    {
        contenedor:
        {
          flexDirection:'row', 
          justifyContent:'center',
          alignItems:'center'
        }
    }
)

export default IconEnRiesgo
