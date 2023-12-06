import React, {useEffect, useState} from 'react'
import {View, Text, ImageBackground, StyleSheet, TextInput, FlatList, Pressable, Image, Alert, BackHandler} from 'react-native'
import PlataformaBox from '../components/PlataformaBox'
import Buscador from '../components/Buscador'
import axios from 'axios'
import DtBox from '../components/DtBox'
import { useNavigation } from '@react-navigation/native';
import SlideButton from 'rn-slide-button';


const Inicio = (
  props
) => {
     //console.log(props.route.params.data[1].ubicacion_id)
     //Array de almacen de dts
     const [dts,setDts] = useState([]);
     //Filtros
     const [busqueda, setBusqueda] = useState('');
     const [plataforma, setPlataforma] = useState(1);
     const [ubicacion, setUbicacion] = useState(null);
     //
     const navigate  = useNavigation();
    //Variable para guardal al usuario
    const [usuario, setUsuario] = useState(null);
    const [nameUser, setNameUser] = useState('');
    const [plataformas, setPlataformas] = useState([]);
     useEffect(() => 
     {
        if(props.route.params)
        {
          axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/dtsApi', {
            params:
            {
              search: busqueda,
              plataforma_id: plataforma,
              ubicacion_id:ubicacion
            }
           }).then(response=>
           {
                 //console.log(response.data)
    
                  //console.log(response.data.dts)
              let dtsFromBD = response.data.dts;
    
              let newDts = [];
              let citaAnterior = null;
              for (let index = 0; index < dtsFromBD.length; index++) 
              {
               const dt = dtsFromBD[index];
               //console.log(dt.cita)
               let newCita = dt.cita.substring(0,10)
               if(dtsFromBD[index] == dtsFromBD[0])
               {
                let newObjFechaDts = 
                {
                  fecha:newCita,
                  viajes:[]
                 }
                 newObjFechaDts.viajes.push(dt)
                 newDts.push(newObjFechaDts);
                 citaAnterior = newObjFechaDts
               }
               else
               {
                 //console.log(citaAnterior)
                 if(citaAnterior.fecha == newCita)
                 {
                   citaAnterior.viajes.push(dt)
                 }
                 else
                 {
                  let newObjFechaDts = 
                  {
                    fecha:newCita,
                    viajes:[]
                   }
                   newObjFechaDts.viajes.push(dt)
                   newDts.push(newObjFechaDts);
                   citaAnterior = newObjFechaDts
                 }
               }
              }
    
              //console.log(newDts)
             
             setDts(newDts)

             //setDts(response.data.dts)
             setPlataformas(response.data.plataformas)
           }).catch(error => {
    
           })
          //console.log(props.route.params.data[1].id)
          setUsuario(props.route.params.data[1].id);
          setNameUser(props.route.params.data[1].name);
          setUbicacion(props.route.params.data[1].ubicacion_id);
          setBusqueda('');

        }
        else
        {
          setUbicacion(1)
          setBusqueda('');
        }
     },[props])

     useEffect(()=>
     {
       axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/dtsApi', {
        params:
        {
          search: busqueda,
          plataforma_id: plataforma,
          ubicacion_id:ubicacion
        }
       }).then(response=>
       {
          //console.log(response.data.dts)
          let dtsFromBD = response.data.dts;

          let newDts = [];
          let citaAnterior = null;
          for (let index = 0; index < dtsFromBD.length; index++) 
          {
           const dt = dtsFromBD[index];
           //console.log(dt.cita)
           let newCita = dt.cita.substring(0,10)
           if(dtsFromBD[index] == dtsFromBD[0])
           {
            let newObjFechaDts = 
            {
              fecha:newCita,
              viajes:[]
             }
             newObjFechaDts.viajes.push(dt)
             newDts.push(newObjFechaDts);
             citaAnterior = newObjFechaDts
           }
           else
           {
             //console.log(citaAnterior)
             if(citaAnterior.fecha == newCita)
             {
               citaAnterior.viajes.push(dt)
             }
             else
             {
              let newObjFechaDts = 
              {
                fecha:newCita,
                viajes:[]
               }
               newObjFechaDts.viajes.push(dt)
               newDts.push(newObjFechaDts);
               citaAnterior = newObjFechaDts
             }
           }
          }

          //console.log(newDts)
         
         setDts(newDts)
         setPlataformas(response.data.plataformas)
       }).catch(error => {

       })
     },[busqueda, plataforma, ubicacion]);

     //Navegar to Llegada
     const navigateTo = (viaje) =>
     {
       //console.log(viaje)
       //console.log(usuario)
       //console.log(dt);
       switch (viaje.status_id) 
       {
           case 4:
                navigate.navigate('Llegada', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
            break;
           case 5:
             navigate.navigate('Llegada', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
             break;
           case 6:
             navigate.navigate('Documentacion', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
            break;
           case 7:
            navigate.navigate('Enrrampar', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
            break;
           case 8:
              navigate.navigate('Enrrampar', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
            break;
           case 9:
              navigate.navigate('Desenrrampe', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
            break;
           case 10:
               //console.log(viaje)
              if(viaje.cerrado ==0)
              {
                //console.log(viaje)
                navigate.navigate('Liberacion', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
              }
              else
              {
                Alert.alert('Advertencia', 'Viaje cerrado, pongase en contacto con el administrador',
                [
                 {text:'Aceptar'}
                ])   
              }
            break;
           case 11:
              if(viaje.cerrado ==0)
              {
                navigate.navigate('Liberacion', {dt:viaje, usuario:usuario, ubicacion:ubicacion, nameUser:nameUser})
              }
              else
              {
                Alert.alert('Advertencia', 'Viaje cerrado, pongase en contacto con el administrador',
                [
                 {text:'Aceptar'}
                ])   
              }
           break;
            default:
               break;
       }
     }
    
     const [showLogin, setShowLogin] = useState(false);
     const mostrarLogo = () => 
     {
        setShowLogin(!showLogin)
     }

     const logOut = () => 
     {
      try 
      {
         navigate.navigate('Login');
         setShowLogin(false);
         setDts([]);
      } catch (error) 
      {
        
      }
     }


   useEffect(() => {
      const backAction = () => {
        Alert.alert('Alerta', '¿Seguro desea salir de la app?', [
          {
            text: 'Cancelar',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'Si', onPress: () => logOut()},
        ]);
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
  
      return () => backHandler.remove();
    }, []);
  

  return (
  <ImageBackground source={require('../assets/img/fondo-azul.png')} style={styles.contenedor} >
    <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:20, marginHorizontal:15, alignItems:'center'}}>
      <Text style={{color:'white', marginHorizontal:10}}>{props.route.params.data[1].name}</Text>
      <Pressable onPress={()=> {
         mostrarLogo()
      }}>
        <Image style={{width:36, height:36}} source={require('../assets/img/perfil.png')} />
      </Pressable>
    </View>
    {
      showLogin ? 
        <View style={{marginTop:5, padding:4, flexDirection:'row', justifyContent:'flex-end', marginHorizontal:15}}>
         <Pressable onPress={()=>{logOut()}} style={{backgroundColor:'white', paddingHorizontal:15, paddingVertical:5}}>
           <Text style={{color:'black'}}>Salir</Text>
         </Pressable>
       </View>
       :
       null
    }
    <View style={{marginTop:50}}>
       <View>
         <PlataformaBox setPlataforma={setPlataforma} plataformas={plataformas} />
       </View>
       <View style={{marginTop:30}}>
         <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />
       </View>
    </View>
    <View style={styles.contenedorTotal}>
       {
         dts.length > 0 ? 
         <View>
            <FlatList 
               scrollEnabled
               data={dts ? dts : [] }
               keyExtractor={(item) => item.fecha }
               renderItem={({item}) =>             
               {
                 return (
                   <View style={{marginVertical:10}}>
                      <Text style={{textAlign:'center', fontSize:25, color:'black'}}>{item.fecha}</Text>
                      <FlatList 
                        scrollEnabled
                        data={item.viajes}
                        keyExtractor={(item) => item.id }
                        renderItem={({item}) =>             
                        {
                          return (
                            <View style={{marginHorizontal:25, marginVertical:5}}>
                                <Pressable onPress={()=> 
                               {
                                 navigateTo(item)
                               }} style={styles.contenedorDt} >
                                   <View style={styles.childContenedor}>
                                     <View>
                                       <Text style={styles.text}>DT</Text>
                                       <Text style={[[styles.text, styles.infoDt]]} >{item.referencia_dt}</Text>
                                     </View>
                                     <View>
                                       {
                                         item.color !==null
                                         ?
                                           <View style={{backgroundColor:item.color, paddingVertical:4, paddingHorizontal:15,borderRadius:15}}>
                                             <Text style={{color:'white', fontWeight:'700'}}>{item.status}</Text>
                                           </View>
                                         :
                                          <View style={{backgroundColor:item.color, paddingVertical:4, paddingHorizontal:15,borderRadius:15}}>
                                             <Text style={{color:'black', fontWeight:'700'}}>{item.status}</Text>
                                          </View>
                                       }
                                       <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end'}}>
                                         <Image style={{width:15, height:15, marginTop:10, marginHorizontal:5}} source={require('../assets/img/calendario.png')} />
                                         <Text style={{color:'#9b9b9b', marginTop:10, fontSize:14}}>{item.cita.substring(5,7)} / {item.cita.substring(8,10)} </Text>
                                       </View>
                                       <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end'}}>
                                         <Image style={{width:15, height:15, marginTop:10}} source={require('../assets/img/reloj.png')} />
                                         <Text style={{color:'black', marginTop:10, fontSize:14}}>{item.cita.substring(10,16)} hrs</Text>
                                       </View>
                                     </View>
                                   </View>
                                </Pressable>
                              </View>
                          )
                        }}
                      />
                   </View>
                 )
               }}
            />
         </View>
         : <View style={{alignItems:'center', marginTop:10}}>
              <Text style={{color:'black', fontSize:20}}>No hay DTS disponibles</Text>
           </View>
       }

    </View>
  </ImageBackground>
  )
}

const styles = StyleSheet.create(
    {
        contenedor:{
            flex:1,
            width:'auto'
        },
        contenedorTotal:
        {
            marginTop:45,
            backgroundColor:'#F5F5F5',
            borderTopStartRadius:15,
            borderTopEndRadius:15,
            flex:1
        },
        contenedorDt:
        {
           backgroundColor:'white',
           padding:10,
           borderRadius:5,
        },
        childContenedor:
        {
          flexDirection:'row',
          justifyContent:'space-between'
        },
        text:
        {
          color:'black'
        },
        infoDt:
        {
         fontSize:30
        }
    }
)

export default Inicio
