import React, {useEffect, useState, useRef} from 'react'
import {StyleSheet, View, Pressable, Image, Text, FlatList, Modal, Alert, Animated, Linking, ActivityIndicator, BackHandler} from 'react-native'
import { RNCamera } from 'react-native-camera';
import SlideButton from 'rn-slide-button';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import SignatureScreen from 'react-native-signature-canvas';
import LinearGradient from 'react-native-linear-gradient';
import SwipeButton from 'rn-swipe-button';

import arrow_left from '../assets/img/arrow_left.png';

const Liberacion = (props) => 
{
  const ref = useRef();
  const todoInput = useRef();
  const navigate = useNavigation();
  const [telefono, setTelefono] = useState(null);
  const [modalGuardando, setModalGuardando] = useState(false);
  const [isSlide, setIsSlide] = useState(false);
  useEffect(()=> 
  {
    if(isSlide)
    {
      if(modalGuardando)
      {
        console.log('Ubo cambio de modal guardado en Llegada')
      }
    }
    else
    {
      setModalGuardando(false)
    }
   
  },[modalGuardando])

  useEffect(()=>
  {
     if(props.route.params.dt)
     {
         //solicitamos el telefono dependiendo el dt que tengamos
         axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/getTelephone',{
           params:{
             confirmacion: props.route.params.dt.confirmacion,
           }
         }).then(
           response => {
             //console.log(response.data)
             setTelefono(response.data.valor)
           }
         ).catch(err => 
           {
             console.log(err)
           });
     }
  },[props.route.params.dt])

  const goBack = () => 
  {
    navigate.navigate('Inicio', {data:[{},{id:props.route.params.usuario, ubicacion_id:props.route.params.ubicacion}]});
  }

   //useffect para retornar con botones defaults
   useEffect(() => 
   {
    const backAction = () => {
      goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
       backAction,
    );

    return () => backHandler.remove();

   },[])

  const [firmas, setFirmas] = useState([]);
  const [firma, setFirma] = useState(null);
  const [foto, setFoto] = useState(null);
  const [nombre, setNombre] = useState('');
  const [contador, setContador] = useState(1);

  const handleOK = (signature) => {
    //console.log(signature);
    setFirma(signature);
  };

  const handleEnd = async (signature) =>  //funcion para guardardo de firma como img
  {
    ref.current.clearSignature()
  }

  //Modal para la camara
  const [modalVisible, setModalVisible] = useState(false);
  //Funciones de camara
  const [camera, setCamera] = useState(null);
  const takePicture = async  () => 
  {
     ref.current.readSignature();
     const options = { quality: 0.5, base64: true };
     const newPhoto = await camera.takePictureAsync(options);
     //console.log(newPhoto);
     let base64img= 'data:image/jpeg;base64,' + newPhoto.base64;
     setFoto(base64img);
  }

  const guardarFoto = () => 
  {
    ref.current.readSignature();
    if(foto !== null)
    {
      setModalVisible(false);
      Alert.alert('OK', 'Foto guardada',
      [
       {text:'Aceptar'}
      ])
    }
  }

  const saveFirmaFoto = (signature) => 
  {
     ref.current.readSignature();
     console.log(nombre)
     let newObj = {};
     if(nombre !== '')
     {
       if(foto !== null)
       {
         if(firma !== null)
         {
            newObj = {
                id:contador,
                foto:foto,
                firma:firma,
                nombre:nombre
             }
      
             setFirmas([
              ...firmas, newObj
             ]);  
      
             setContador(contador + 1);
         }
         else
         {
            Alert.alert('ERROR', 'Falta la firma',
            [
             {text:'Aceptar'}
            ])
         }
       }
       else
       {
         Alert.alert('ERROR', 'Falta la foto',
         [
          {text:'Aceptar'}
         ])
       }
     }
     else
     {
        Alert.alert('ERROR', 'Falta el nombre',
        [
         {text:'Aceptar'}
        ])
     }
  
     setFoto(null);
     setNombre('');
     todoInput.current.clear();
     ref.current.clearSignature()
     newObj = {};
  }

  const borrarFirma = (id) => 
  {
    setFirmas(firmas.filter(firma => firma.id !== id ))
  }

  //Animacion para mostrar
  let [show, setShow] = useState(false);
  const [animacion] = useState(new Animated.Value(0)) 

  useEffect(()=>
  {
    if(!show) //ocultamos
    {
      Animated.timing(
       animacion, {
           toValue:0,
           duration:100,
           useNativeDriver:false
       }
      ).start()
    } 
    else
    {
        Animated.timing(
            animacion,{
               toValue:80,
               duration:100,
               useNativeDriver:false
             }
           ).start()
    }
  },[show])

  //Variables para slide de enrrampe
  const [changeSlide, setChangeSlide] = useState(false);
  const [titleSlide, setTitleSlide]= useState('¿Finalizó el viaje?');
  const [colorsSlide, setColorsSlide] = useState(['#F5F7F8','#E0E0E0']);
  const [titleColor, setTitleColor] = useState('#9B9B9B');

  const guardarFirmas = () => 
  {
    setModalGuardando(true);
    if(firmas.length !== 0)
    {
       //console.log(props.route.params.dt.confirmacion);
       //console.log(props.route.params.dt.dt_id);
        try {
            axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/firmasLiberacion', {params:{
              firmas: firmas,
              status:props.route.params.dt.status_id,
              usuario:props.route.params.usuario,
              confirmacion: props.route.params.dt.confirmacion,
              dt:props.route.params.dt.dt_id
             }}).then(
              response => {
                console.log(response.data)
                setNombre('');
                setFirma(null);
                setFoto(null);
                setFirmas([]);
                goBack();
                setModalGuardando(false);
                setChangeSlide(false);
                setTitleSlide('¿Finalizó viaje?')
                setColorsSlide(['#F5F7F8','#E0E0E0'])
                setTitleColor('#9B9B9B');
              }
             ).catch(err => 
              {
                setModalGuardando(false);
                setChangeSlide(false);
                setTitleSlide('¿Finalizó viaje?')
                setColorsSlide(['#F5F7F8','#E0E0E0'])
                setTitleColor('#9B9B9B');
                console.log(err.response.data)
              })
        } 
        catch (error) 
        {
            setModalGuardando(false);

            Alert.alert('ERROR', 'No hay firmas agregadas',
            [
             {text:'Aceptar'}
            ])   

            setChangeSlide(false);
            setTitleSlide('¿Finalizó viaje?')
            setColorsSlide(['#F5F7F8','#E0E0E0'])
            setTitleColor('#9B9B9B');
        }
    }
    else
    {
      setModalGuardando(false);
      setChangeSlide(false);
      setTitleSlide('¿Finalizó viaje?')
      setColorsSlide(['#F5F7F8','#E0E0E0'])
      setTitleColor('#9B9B9B');
      Alert.alert('ERROR', 'No hay firmas agregadas',
      [
       {text:'Aceptar'}
      ])  
    }
  }

     //Variable para el login
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
      } catch (error) 
      {
        
      }
     }

     const llamar = () => 
     {
       //console.log(telefono)
       if(telefono !== null || telefono !== '')
       {
         Linking.openURL('tel:+52'+telefono)
       }
       else
       {
         Alert.alert('ERROR', 'No se pudo contactar',
         [
          {text:'Aceptar'}
         ])
       }
     }
  
  return (
    <View  style={styles.container}>
    <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:20, marginHorizontal:15, alignItems:'center'}}>
       <Text style={{color:'#0A0F2C', marginHorizontal:10}}>{props.route.params.nameUser}</Text>
       <Pressable onPress={()=> {
          mostrarLogo()
       }}>
         <Image style={{width:36, height:36}} source={require('../assets/img/perfil_2.png')} />
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
    <View style={{flexDirection:'row', alignItems:'center', marginBottom:10,alignContent:'center'}}>
       <Pressable style={{marginLeft:15}}  onPress={()=>{goBack()}}>
         <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
       </Pressable>
       <Text style={styles.title}>Liberación</Text>
     </View>
     <View style={{marginVertical:10, marginHorizontal:15}}>
       <Text style={{color:'black', fontSize:15}}>
        <Text style={{fontWeight:'bold'}}>Confirmación: </Text>
        {props.route.params.dt.confirmacion} - {props.route.params.dt.plataforma}
       </Text>
     </View>
     <View> 
          <View style={{flexDirection:'row',alignItems:'center', marginHorizontal:15, backgroundColor:'#F5F7F8',paddingHorizontal:10, borderRadius:15}}>
              <Image style={{width:22, height:25}} source={require('../assets/img/user_perfil.png')} />
              <TextInput onChangeText={(newText)=>
               {
                setNombre(newText)
                }} placeholder='Nombre' 
                 placeholderTextColor={'#9B9B9B'}
                 style={{color:'#9B9B9B', width:'100%'}} 
                 clearButtonMode="always" 
                 ref={todoInput}
                 />
                <Text style={{color:'black'}}>{nombre}</Text>
          </View>
          <View style={{width:'100%', height:'80%', marginTop:10}}>
             <View style={{flexDirection:'row',alignItems:'center', position:'absolute', zIndex:1, marginHorizontal:28, marginVertical:15}}>
               <Image style={{width:22, height:25}} source={require('../assets/img/table.png')} />
               <Text style={{color:'#9B9B9B', marginHorizontal:10}}>Firma</Text>
             </View>
             <SignatureScreen 
                 ref={ref}
                 onOK={handleOK}
                 backgroundColor='#F5F7F8'
                 bgWidth={100}
                 bgHeight={100}
                 autoClear={false}
                 descriptionText={'Digita tu firma'}
                 confirmText="Guardar Firma"
                 clearText="Limpiar"
                 webStyle={`
                 .m-signature-pad {position: fixed;
                   margin:auto;             
                   top: 0;              
                   left: 5%;             
                   width:90%;             
                   height:30%;             
                   alignment: center;  
                   border         
                  }           
                  body,html {              
                      position:relative;            
                  }
                  .m-signature-pad--footer {display: none; margin: 0px;}
                 `}
                  />
                  <View style={{position:'absolute', marginTop:10, marginLeft:290}}>
                      <Pressable onPress={()=>{handleEnd()}} style={{backgroundColor:'gray', padding:8, margin:5, borderRadius:10}}>
                         <Image style={{width:15, height:18}} source={require('../assets/img/eliminar.png')} />
                      </Pressable>
                  </View>
              <View style={{marginHorizontal:40, marginVertical:170 ,position:'absolute', flexDirection:'row'}}>
                  {
                      foto !== null ?
                      <Pressable onPress={()=> {
                          setModalVisible(true)
                          
                          }} style={{backgroundColor:'#29AD6F',flexDirection:'row', padding:10, justifyContent:'center', alignItems:'center', borderRadius:25, marginHorizontal:5}}>
                          <Image style={{width:25, height:20}} source={require('../assets/img/icono-foto.png')} />
                          <Text style={{color:'white', marginHorizontal:10}}>Licencia Operador</Text>
                      </Pressable>
                      :
                      <Pressable onPress={()=> {
                          setModalVisible(true)
                          
                          }} style={{backgroundColor:'#44BFFC',flexDirection:'row', padding:10, justifyContent:'center', alignItems:'center', borderRadius:25, marginHorizontal:5}}>
                          <Image style={{width:25, height:20}} source={require('../assets/img/icono-foto.png')} />
                          <Text style={{color:'white', marginHorizontal:10}}>Licencia Operador</Text>
                      </Pressable>
                  }
                  <Pressable onPress={()=> {saveFirmaFoto()}} style={{backgroundColor:'#1D96F1',flexDirection:'row', padding:10, justifyContent:'center', alignItems:'center', borderRadius:25, marginHorizontal:0, paddingHorizontal:25}}>
                      <Text style={{color:'white', marginHorizontal:0}}>Guardar</Text>
                  </Pressable>
              </View>
              <Modal animationType="slide"
                  visible={modalVisible}>
                  <View>
                     <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
                      <Pressable style={{marginLeft:5, marginVertical:0, marginBottom:12}}  onPress={()=>{setModalVisible(false)}}>
                         <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
                      </Pressable>
                     </View>
                     <View style={{marginTop:200}}>
                       <View>
                         <RNCamera
                            ref={cam => {
                              setCamera(cam)
                            }}
                            type={RNCamera.Constants.Type.back}
                            style={{paddingTop:10, paddingBottom:10}}
                         >
                            <View>
                              <Pressable style={{ flex: 0,
                                         backgroundColor: '#697FEA',
                                         borderRadius: 30,
                                         paddingVertical: 12,
                                         paddingHorizontal: 45,
                                         alignSelf: 'center',
                                         margin: 20,}} onPress={()=>{takePicture()}}>
                               <Image style={{width:35, height:27}} source={require('../assets/img/icono-foto.png')} />
                              </Pressable>
                            </View>
                        </RNCamera>
                       </View>
                     </View>
                     {
                       foto !== null ?
                       <View style={{marginTop:40}}>
                          <Image source={{uri:foto}} style={{  width: 200, height: 200, marginHorizontal:10}}  />
                          <View style={{justifyContent:'center', marginHorizontal:50, marginTop:15}}>
                              <Pressable onPress={()=>{guardarFoto()}} style={{backgroundColor:'#1D96F1', padding:10, borderRadius:20}}>
                                  <Text style={{color:'white', textAlign:'center'}}>
                                      Guardar
                                  </Text>
                              </Pressable>
                          </View>
                       </View>
                       :null
                     }
                  </View>
              </Modal>
          </View>
          <View style={{marginVertical:280, position:'absolute', marginHorizontal:30}}>
              <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                  <Text style={{color:'black', fontSize:20, marginHorizontal:15, marginRight:10}}>Firmas</Text>
                  {
                      !show ? 
                      <View style={{flexDirection:'row',alignItems:'center', justifyContent:'center'}}>
                         <Text style={{color:'black', marginHorizontal:15,fontSize:20, }}>{firmas.length}</Text>
                        <Pressable onPress={() => {setShow(!show)}}>
                          <Image style={{transform: [{ rotate: '90deg' }]}} source={require('../assets/img/arrow_rigth.png')} />
                        </Pressable>
                      </View>
                      :
                      <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center',marginRight:15}}>
                          <Text style={{color:'black', marginHorizontal:12,fontSize:20, }}>{firmas.length}</Text>
                          <Pressable onPress={() => {setShow(!show)}}>
                            <Image style={{transform: [{ rotate: '270deg' }]}} source={require('../assets/img/arrow_rigth.png')} />
                          </Pressable>
                      </View>
                  }
                  
              </View>
              <Animated.View style={[{height:animacion, marginTop:0}]}>
                {
                    firmas.length > 0 && show ? 
                    <View style={{height:130}}>
                       <FlatList 
                       scrollEnabled
                       data={firmas}
                       keyExtractor={(item) => item.id }
                       renderItem={({item}) =>             
                       {
                         return (
                           <View style={{}}>
                                 <View style={{flexDirection:'row',marginHorizontal:10, marginVertical:8, justifyContent:'space-between'}}>
                                   <Text style={{color:'black',marginHorizontal:15,marginVertical:2, fontSize:17}}>{item.nombre}</Text>
                                   <Pressable onPress={()=>{borrarFirma(item.id)}} style={{backgroundColor:'#F25B77', borderRadius:100, padding:10}}>
                                     <Image style={{width:15, height:18}} source={require('../assets/img/eliminar.png')} />
                                   </Pressable>
                                 </View>
                                 <View style={{flexDirection:'row'}}>
                                    <Image style={{  width: 120, height: 120, marginHorizontal:20, marginLeft:20, borderRadius:15}}  source={{uri:item.firma}} />
                                    <Image style={{  width: 120, height: 120, marginHorizontal:20, borderRadius:15}}  source={{uri:item.foto}} />
                                 </View> 
                           </View>
                         )
                       }}
                       />
                    </View>
                    :
                    <View style={{justifyContent:'center', marginVertical:15}}>
                        <Text style={{color:'black', textAlign:'center'}}>No hay firmas registradas</Text>
                    </View>
                }
              </Animated.View>
              <Modal 
                  visible={modalGuardando}
                  transparent animationType="fade">
                     <View style={{backgroundColor:'white', height:300, width:300,  marginHorizontal:30, marginVertical:230, borderRadius:50, shadowColor: "#000",
                                    shadowOffset: {
                                      width: 0,
                                      height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    flexDirection:'column',
                                    justifyContent:'center',
                                    alignItems:'center'
                                   }}>
                        <View style={{borderColor:'#F2F2F2', borderWidth:5, borderRadius:30, flexDirection:'row', justifyContent:'center', alignItems:'center', padding:7}}>
                          <ActivityIndicator size="large" color="#1D96F1" style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} />
                        </View>
                        <Text style={{color:'#9B9B9B', textAlign:'center', marginBottom:-70,marginTop:70, fontSize:21}}>
                          Guardando...
                        </Text>  
                        <Pressable style={{borderRadius:15, padding:10}} onPress={()=>{ setModalGuardando(false);}}>
                           <Text style={{color:'#9B9B9B'}}>
                              Cerrar
                           </Text>
                        </Pressable>
                     </View>
             </Modal>
              <View style={{marginTop:55}}>
                <LinearGradient style={{borderRadius:100}} colors={colorsSlide}  start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                  <SwipeButton  
                         title={titleSlide}
                         titleColor={titleColor}
                         containerStyles={{borderWidth: 0,
                          backgroundColor:'transparent'
                        }}
                         thumbIconBackgroundColor='white'
                         thumbIconBorderColor='white'
                         thumbIconImageSource={arrow_left}
                         enableReverseSwipe={true}
                         railBackgroundColor='transparent'
                         railFillBackgroundColor='transparent'
                         railStyles={{borderWidth:0}}
                         onSwipeSuccess={()=>
                         {
                          setChangeSlide(true);

                          setColorsSlide(['#1D96F1','#96DCFF'])

                          setTitleColor('white');
                          setIsSlide(true);
                          guardarFirmas();
                         }}
                         shouldResetAfterSuccess={true}
                       />
                  </LinearGradient>
                {
                  /*
                  <SlideButton
                    onReachedToStart={()=>{
                      
                   }}
                    onReachedToEnd={()=> 
                    {
                      guardarFirmas()
                   }} 
                   title="¿Finalizó el viaje?"
                   autoReset={true}
                    /> 
                  */ 
                }
              </View>
              <View style={{flexDirection:'row', justifyContent:'center', marginVertical:10, alignItems:'center',marginHorizontal:140}}>
                 <Pressable onPress={()=>{
                   llamar()
                 }} style={{backgroundColor:'#56D0C1', padding:10, borderRadius:100}}>
                    <Image source={require('../assets/img/telephone.png')} />
                 </Pressable>
              </View>
          </View>
     </View>
  </View>
  )
}

const styles = StyleSheet.create({
    container:
    {
        backgroundColor:'white',
        flex:1
    },
    title:
    {
       fontSize:25,
       color:'black',
       marginTop:15, 
       marginBottom:10,
       marginLeft:15
    },
})

export default Liberacion
