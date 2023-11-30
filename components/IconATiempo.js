import React from 'react'
import { Image, Text, View } from 'react-native'

const IconATiempo = () => {
  return (
    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
       <Image style={{width:15, height:15, marginHorizontal:10}} source={require('../assets/img/fcheck.png')}/>
       <Text style={{color:'white', fontSize:13.5}}>A tiempo </Text>
    </View>
  )
}

export default IconATiempo
