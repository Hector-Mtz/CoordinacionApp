import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
const DtBox = (
    dt,
    usuario,
) => 
{
 const navigate  = useNavigation();
  const navigateTo = () =>
  {

    /*
    switch (dt.status_id) 
    {
        case 7:
             navigate.navigate('Llegada', {dt:dt})
        break;
        case 6:
          navigate.navigate('Llegada', {dt:dt})
     break;
    
        default:
            break;
    }
    */
  }

  return (
    <Pressable onPress={()=> 
    {
        navigateTo(dt.dt)
    }} style={styles.contenedor} >
      {
        dt ? 
        <View style={styles.childContenedor}>
          <View>
            <Text>{JSON.stringify(usuario)}</Text>
            <Text style={styles.text}>DT</Text>
            <Text style={[[styles.text, styles.infoDt]]}>{dt.dt.referencia_dt}</Text>
          </View>
          <View>
            <View style={{backgroundColor:dt.dt.color, paddingVertical:4, paddingHorizontal:15,borderRadius:15}}>
                <Text style={{color:'white', fontWeight:'700'}}>{dt.dt.status}</Text>
            </View>
            <Text style={{color:'black', marginTop:10, fontSize:15}}>{dt.dt.cita.substring(10,16)}</Text>
          </View>
        </View>
      : null
      }
    </Pressable>
  )
}

const styles = StyleSheet.create({
    contenedor:
    {
       backgroundColor:'white',
       padding:10,
       borderRadius:5,
    },
    text:
    {
      color:'black'
    },
    infoDt:
    {
     fontSize:30
    },
    childContenedor:
    {
        flexDirection:'row',
        justifyContent:'space-between'
    }
})

export default DtBox
