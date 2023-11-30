import React,{useState, useEffect} from 'react'
import {View,Text, StyleSheet, Pressable, FlatList}  from 'react-native'

const PlataformaBox = (
  plataforma, 
  setPlataforma,
  plataformas
) => {
  const [activo, setActivo] = useState(1);
  useEffect(() => 
  {
      //console.log(activo)
  },[activo])

  //console.log(plataforma.plataformas)
  return (
     <View style={styles.contenedor}>
        {
          plataforma.plataformas.length > 0 ? 
          <View style={{paddingHorizontal:40}} >
              <FlatList 
               scrollEnabled
               contentContainerStyle={{flexDirection:'row'}}
               horizontal={true}
               data={plataforma.plataformas}
               keyExtractor={(item) => item.id }
               renderItem={({item}) =>             
               {
                 return (
                   <View style={{marginHorizontal:7}} >
                     {
                      activo == item.id ? 
                      <View>
                          <Pressable onPress={()=> {
                            plataforma.setPlataforma(item.id)
                            setActivo(item.id)
                             }} style={[styles.contadorBox,{backgroundColor:'white'}]}>
                              <Text style={[styles.textNumber,{color:'black'}]}>{JSON.stringify(item.confirmaciones_dts.length)}</Text>
                             <Text style={[styles.textBox,{color:'black'}]}>{item.nombre}</Text>
                          </Pressable>
                      </View>
                      :
                      <View>
                         <Pressable onPress={()=> {
                            plataforma.setPlataforma(item.id)
                            setActivo(item.id)
                             }} style={styles.contadorBox}>
                              <Text style={styles.textNumber}>{JSON.stringify(item.confirmaciones_dts.length)}</Text>
                             <Text style={styles.textBox}>{item.nombre}</Text>
                          </Pressable>
                      </View>
                     }
                   </View>
                 )
               }}
            />
          </View>
         : null
        }
     </View>
  )
}

const styles = StyleSheet.create({
    contenedor:
    {
      width:'100%'
    },
    contadorBox:
    {
      width:80,
      backgroundColor:'#4fadf4',
      padding:10,
      borderRadius:10,
      marginVertical:10,
      justifyContent:'center',
      alignItems:'center',
      shadowColor: "#000",
      shadowOffset: {
      	width: 0,
      	height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    textBox:
    {
        color:'white',
        fontSize:12
    },
    textNumber:
    {
      color:'white',
      fontSize:30
    }
})

export default PlataformaBox
