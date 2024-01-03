import React, {useState, useEffect, useRef} from 'react'
import { View, Text, StyleSheet, Image, TextInput, Pressable, ScrollView, FlatList, Alert, Modal, Linking, ActivityIndicator, BackHandler } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Switch } from 'react-native-gesture-handler';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toggle from "react-native-toggle-element";
import SlideButton from 'rn-slide-button';
import SwipeButton from 'rn-swipe-button';
import axios from 'axios'
import IconEnRiesgo from '../components/IconEnRiesgo';
import IconATiempo from '../components/IconATiempo';
import LinearGradient from 'react-native-linear-gradient';
import { HelperText } from 'react-native-paper';


//importar img
import arrow_left from '../assets/img/arrow_left.png'
//ES LA PANTALLA DE A TIEMPO
const Llegada = (props) => {
  //Variable de almacenaje de campos dinamicos
  const [campos, setCampos] = useState([]);
  //Variable para almacenaje de los valores dinamicos
  const [valores, setValores] = useState([]);
   //funcion para el switch
  const [isEnabled, setIsEnabled] = useState(null);
  const todoInput = useRef();
  /*
  const changeToRiesgo = () => 
  {
    console.log('hola')
    setIsEnabled(isEnabled => !isEnabled);
  }
  */
  const navigate = useNavigation();
  const goBack = () => 
  {
    navigate.navigate('Inicio', {data:[{},{id:props.route.params.usuario, ubicacion_id:props.route.params.ubicacion}]});
    //navigate.goBack()
    setIsClicked(false)
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

  const [clicked, setIsClicked] = useState(false);
  useEffect(() => 
  {
    //console.log(props.route.params.dt)
    if(props.route.params.dt.status_id == 5)
    {
       setIsEnabled(true)
    }
    else
    {
      setIsEnabled(false)
    }
    
    //Consulta de campos
    //console.log(props.route.params)
    if(props.route.params.dt) //recibimos todo el oobjeto de confirmacion_dt
    {
      axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/camposApi',{
        params:{
         status_id:4
        }
      }).then(
        response => {
          //console.log(response.data)
          setCampos(response.data)
        }
      ).catch(err => 
        {
          console.log(err)
        })
    }
  },[props.route.params.dt])

  useEffect(()=> 
  {
    console.log(isEnabled)

    if(clicked)
    {
      if(isEnabled !== null)
      {
        if(isEnabled)
        {
           axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changeToRiesgo',{params:{id:props.route.params.dt.id}}).then(response=>{
            //console.log(response)
           }).catch(err =>  
            {
              console.log(err.response.data)
            });
        }
        else
        {
           axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changePorRecibir',{params:{id:props.route.params.dt.id}}).then(response=>{
            //console.log(response)
           }).catch(err => 
            {
              console.log(err.response.data)
            })
        }
      }
    }
  },[isEnabled])
  
  //Camara
  const [camera, setCamera] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [photos, setPhotos] = useState([]); //esta es la foto que se almacena (hay que convertirlo a array)
  const [photosObject, setPhotosObject] = useState({
    campo_id: null,
    fotos:null
  });
  const [fotoTemp, setFotoTemp] = useState({id:0, photo:null})
  const [contador, setContador] = useState(1);
  const takePicture = async  (id) => 
  {
    if(photosObject.campo_id == null)
    {
      setPhotosObject({
        ...photosObject.fotos,
        campo_id: id
      });
    }
    const options = { quality: 0.5, base64: true };
    const newPhoto = await camera.takePictureAsync(options);
    //console.log(newPhoto);
    let base64img= 'data:image/jpeg;base64,' + newPhoto.base64;
    setContador(contador + 1);
    setFotoTemp({id:contador, campo_id:id , photo:newPhoto.uri,  base64: base64img, })
  }
  
  const borrarFoto = (id) => 
  {
    setPhotos(photos.filter(photo => photo.id !== id ))
  }

  useEffect(() => 
  {
    setPhotos([
      ...photos, fotoTemp
    ])
  },[fotoTemp])

  //Funcion para mandar la data
  const [telefono, setTelefono] = useState(null);
  const llamar = () => 
  {
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

  const siguiente = async (tipo) => 
  {
    setModalGuardando(true);
    if(valores.length == 0)
    {
     Alert.alert('ERROR', 'Los campos son requeridos',
      [
       {text:'Aceptar'}
      ])

      setChangeSlide(!changeSlide);
 
      setTitleSlide('¿Ya llegó la unidad?')

      setColorsSlide(['#F5F7F8','#E0E0E0'])

      setTitleColor('#9B9B9B');
      setModalGuardando(false);
    }
    else
    {  
        try 
        {
         setPhotosObject({
           ...photosObject,
           fotos: {fotos:photos}
          });

          
         await axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/valoresDeLlegada', {params:{
           //fotos:photosObject,
           data: valores,
           confirmacion_id:props.route.params.dt.id, //es el id de la confirmacion no del id
           tipo:tipo,
           usuario:props.route.params.usuario,
           confirmacion: props.route.params.dt.confirmacion,
           dt: props.route.params.dt.dt_id
          }}).then(response => 
           {
              //console.log(response.data);
              //Seteamos todo nuevamente como el inicio y redireccionamos a el inicio.js
              setValores([]);
              setFotoTemp({id:0, photo:null});
              setContador(1);
              setCampos([]);
              setPhotos([]);
              goBack();
              setChangeSlide(!changeSlide);
              setTitleSlide('¿Ya llegó la unidad?')
              setColorsSlide(['#F5F7F8','#E0E0E0'])
              setTitleColor('#9B9B9B');
              setIsClicked(false)
           }).catch(err => 
           {
             console.log(err.response.data)
             setChangeSlide(!changeSlide);
             setTitleSlide('¿Ya llegó la unidad?')
             setColorsSlide(['#F5F7F8','#E0E0E0'])
             setTitleColor('#9B9B9B');
             setModalGuardando(false);
             todoInput.current.clear()

             Alert.alert('ERROR', 'Error por parte del servidor, contacte al administrador' ,
             [
              {text:'Aceptar'}
             ])
           });
         
        } catch (err)
        {
         Alert.alert('ERROR', err ,
         [
          {text:'Aceptar'}
         ])
         setModalGuardando(false);
         setChangeSlide(!changeSlide);
         setTitleSlide('¿Ya llegó la unidad?')
         setColorsSlide(['#F5F7F8','#E0E0E0'])
         setTitleColor('#9B9B9B');
        }
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
     } catch (error) 
     {
       
     }
    }


    const [changeSlide, setChangeSlide] = useState(false);
    const [titleSlide, setTitleSlide]= useState('¿Ya llegó la unidad?');
    const [colorsSlide, setColorsSlide] = useState(['#F5F7F8','#E0E0E0']);
    const [titleColor, setTitleColor] = useState('#9B9B9B');
  return (
    <View style={styles.container}>
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
      <View  style={{flexDirection:'row', alignItems:'center', marginBottom:10,alignContent:'center'}}>
        <Pressable style={{marginLeft:15}} onPress={()=>{goBack()}}>
             <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
          </Pressable>
          <Text style={styles.title}>Tránsito</Text>
      </View>
      <View style={{marginVertical:10, marginHorizontal:15}}>
         <Text style={{color:'black', fontSize:15}}>
          <Text style={{fontWeight:'bold'}}>Confirmación: </Text>
           {props.route.params.dt.confirmacion} - {props.route.params.dt.plataforma}
         </Text>
      </View>
      <View style={{ flexDirection:'row', justifyContent:'center', marginBottom:10, marginHorizontal:25}} >
      <Toggle value={isEnabled} onPress={(val) => 
        {
          //console.log(val)
          setIsClicked(true)
          setIsEnabled(val)
        }}
            thumbActiveComponent={
              <IconEnRiesgo width="80" height="80" fill={"#FFAE3F"}  />
            }
            thumbInActiveComponent={
              <IconATiempo width="80" height="80" fill={"#56D0C1"}  />
            }
            trackBar={{
              activeBackgroundColor: "#E8E8E8",
              inActiveBackgroundColor: "#E8E8E8",
              borderActiveColor: "#E8E8E8",
              borderInActiveColor: "#E8E8E8",
              borderWidth: 0,
              width: 305,
              height:50,
            
            }}
            thumbButton={{
              width: 150,
              height: 40,
              radius: 100,
              activeBackgroundColor: '#FFAE3F',
              inActiveBackgroundColor: '#56D0C1'
            }}
          />

        {
          /*
          Solo es el switch anterior
          <Switch 
          trackColor={{false: '#767577', true: '#AA7832'}}
          thumbColor={isEnabled ? '#FFAE3F' : '#f4f3f4'}
          onValueChange={changeToRiesgo}
          value={isEnabled}     
          />
        */ 
        }
       </View>
       <View style={{marginTop:10, height:350}}>
         {
           campos.length > 0 ?
           <View >
              <FlatList 
             
               scrollEnabled
               data={campos}
               horizontal={false}
               numColumns={2}
               keyExtractor={(item) => item.id }
               renderItem={({item}) =>             
               {
                 return (
                   <View  style={{width:'40%', marginHorizontal:20, marginVertical:10}}  >
                     {
                       item.tipo_campo == 'text' ?
                       <View style={{marginHorizontal:0, backgroundColor:'#F5F5F5', marginVertical:0, borderRadius:15, padding:10, height:60, flexDirection:'row', alignItems:'center'}}>
                          {
                            item.nombre == 'Cajas' ?
                            <View>
                              <Image style={{width:18, height:18, marginRight:5}} source={require('../assets/img/cajas.png')} />
                            </View>
                            :null
                          }
                          {
                            item.nombre == 'Tracto' ?
                            <View>
                              <Image style={{width:28, height:15, marginRight:5}} source={require('../assets/img/tracto.png')} />
                            </View>
                            :null
                          }
                          {
                            item.nombre == 'Remolque' ?
                            <View>
                              <Image style={{width:26, height:16, marginRight:5}} source={require('../assets/img/remolque.png')} />
                            </View>
                            :null
                          }
                          {
                            item.nombre == 'Nombre operador' ?
                            <View>
                              <Image style={{width:16, height:18, marginRight:5}} source={require('../assets/img/user_perfil.png')} />
                            </View>
                            :null
                          }
                          {
                            /*INPUTS*/
                            item.nombre == 'Cajas' ?
                                <TextInput ref={todoInput} style={{color:'black'}} 
                                placeholder={item.nombre} 
                                keyboardType='numeric'
                                placeholderTextColor={'#9B9B9B'}  
                                clearButtonMode={'always'}
                                onChangeText={(newText)=>
                                {
                                   let newObj = {campo_id: item.id , value: newText}
                                   if(valores.length === 0)
                                   {
                                   // objetos.push(newObj)
                                    setValores([
                                      ...valores, newObj
                                    ])
                                   }
                                   else
                                   {
                                     let x = 0;
                                     for (let index = 0; index < valores.length; index++) 
                                     {
                                      const element = valores[index];
                                      //console.log(element)
                                      if(element.campo_id === newObj.campo_id )
                                      {
                                           x = 1
                                          element.value = newObj.value
                                      }
                                     }
                                    
  
                                     if(x==0)
                                     { 
                                       //console.log(newObj)
                                       //objetos.push(newObj)
                                       setValores([
                                        ...valores, newObj
                                       ])
                                     }
                                     
                                   }
                                   //console.log(items)
                                   
                                }} />
                            :null
                          }
                          {
                            item.nombre == 'Tracto' ?
                                <TextInput ref={todoInput} style={{color:'black'}} 
                                placeholder={item.nombre} 
                                keyboardType='numeric'
                                placeholderTextColor={'#9B9B9B'}  
                                clearButtonMode={'always'}
                                onChangeText={(newText)=>
                                {
                                   let newObj = {campo_id: item.id , value: newText}
                                   if(valores.length === 0)
                                   {
                                   // objetos.push(newObj)
                                    setValores([
                                      ...valores, newObj
                                    ])
                                   }
                                   else
                                   {
                                     let x = 0;
                                     for (let index = 0; index < valores.length; index++) 
                                     {
                                      const element = valores[index];
                                      //console.log(element)
                                      if(element.campo_id === newObj.campo_id )
                                      {
                                           x = 1
                                          element.value = newObj.value
                                      }
                                     }
                                    
  
                                     if(x==0)
                                     { 
                                       //console.log(newObj)
                                       //objetos.push(newObj)
                                       setValores([
                                        ...valores, newObj
                                       ])
                                     }
                                     
                                   }
                                   //console.log(items)
                                   
                                }} />
                            :null
                          }
                          {
                            item.nombre == 'Remolque' ?
                                <TextInput ref={todoInput} style={{color:'black'}} 
                                placeholder={item.nombre} 
                                keyboardType='numeric'
                                placeholderTextColor={'#9B9B9B'}  
                                clearButtonMode={'always'}
                                onChangeText={(newText)=>
                                {
                                   let newObj = {campo_id: item.id , value: newText}
                                   if(valores.length === 0)
                                   {
                                   // objetos.push(newObj)
                                    setValores([
                                      ...valores, newObj
                                    ])
                                   }
                                   else
                                   {
                                     let x = 0;
                                     for (let index = 0; index < valores.length; index++) 
                                     {
                                      const element = valores[index];
                                      //console.log(element)
                                      if(element.campo_id === newObj.campo_id )
                                      {
                                           x = 1
                                          element.value = newObj.value
                                      }
                                     }
                                    
  
                                     if(x==0)
                                     { 
                                       //console.log(newObj)
                                       //objetos.push(newObj)
                                       setValores([
                                        ...valores, newObj
                                       ])
                                     }
                                     
                                   }
                                   //console.log(items)
                                   
                                }} />
                            :null
                          }
                          {
                            item.nombre == 'Nombre operador' ?
                                <TextInput ref={todoInput} style={{color:'black'}} 
                                placeholder={item.nombre} 
                                placeholderTextColor={'#9B9B9B'}  
                                clearButtonMode={'always'}
                                onChangeText={(newText)=>
                                {
                                   let newObj = {campo_id: item.id , value: newText}
                                   if(valores.length === 0)
                                   {
                                   // objetos.push(newObj)
                                    setValores([
                                      ...valores, newObj
                                    ])
                                   }
                                   else
                                   {
                                     let x = 0;
                                     for (let index = 0; index < valores.length; index++) 
                                     {
                                      const element = valores[index];
                                      //console.log(element)
                                      if(element.campo_id === newObj.campo_id )
                                      {
                                           x = 1
                                          element.value = newObj.value
                                      }
                                     }
                                    
  
                                     if(x==0)
                                     { 
                                       //console.log(newObj)
                                       //objetos.push(newObj)
                                       setValores([
                                        ...valores, newObj
                                       ])
                                     }
                                     
                                   }
                                   //console.log(items)
                                   
                                }} />
                            :null
                          }
                       </View>
                       :null
                     }
                     {
                       item.nombre == 'Teléfono' ?
                       <View style={{backgroundColor:'#F5F5F5', borderRadius:15, padding:10, marginHorizontal:0, position:'relative', height:70, width:'220%'}}>
                          <View style={{flexDirection:'row', alignItems:'center'}}>
                             {
                               item.nombre == 'Teléfono' ?
                               <View>
                                 <Image style={{width:20, height:20, marginRight:5}} source={require('../assets/img/telephone_2.png')} />
                               </View>
                               :null
                             }
                             <TextInput ref={todoInput} placeholder={item.nombre} style={{color:'black'}} placeholderTextColor={'#9B9B9B'} keyboardType='numeric' onChangeText={(newText)=>{
                                let newObj = {campo_id: item.id , value: newText}
                                setTelefono(newText)
                                if(valores.length === 0)
                                {
                                  setValores([
                                    ...valores, newObj
                                  ])
                                }
                                else
                                {
                                  let x = 0;
                                  for (let index = 0; index < valores.length; index++) 
                                  {
                                   const element = valores[index];
                                   //console.log(element)
                                   if(element.campo_id === newObj.campo_id )
                                   {
                                        x = 1
                                       element.value = newObj.value
                                   }
                                  }
                                 
   
                                  if(x==0)
                                  { 
                                    //console.log(newObj)
                                    setValores([
                                      ...valores, newObj
                                    ])
                                  }
                                  
                                }
                                //console.log(items)
                             }} />
                             
                             {
                              /*
                                <Pressable style={styles.buttonPhone} onPress={() => {
                                   llamar(item.id)
                                  }}>
                                  <Image source={require('../assets/img/telephone.png')} />
                                </Pressable>
                              */ 
                             }
                          </View>
                       </View>
                       
                       :null
                     }
                   </View>
                 )
               }}
             />
           </View>
           : 
           <View>
              <Text style={{color:'black', fontSize:25}}> 
                No hay campos que llenar
              </Text>
           </View>
         }

          {
            /*
              <View>
                <Pressable onPress={()=>{siguiente('siguiente')}} style={styles.siguienteButton}>
                    <Text style={{color:'white'}}>Siguiente</Text>
                </Pressable>
             </View>
             <View>
               <Pressable onPress={()=>{siguiente('guardar')}} style={styles.siguienteButton}>
                 <Text style={{color:'white'}}>Guardar</Text>
               </Pressable>
             </View>
            */ 
          }
          {
            /*
             <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:25}}>
               <Pressable style={{borderRadius:100, borderColor:'#1D96F1', borderWidth:1.2, paddingHorizontal:50, paddingVertical:10}}>
                  <Text style={{color:'#1D96F1'}}>Borrar</Text>
               </Pressable>
               <Pressable style={{borderRadius:100, backgroundColor:'#1D96F1', borderColor:'#1D96F1', borderWidth:2, paddingHorizontal:50, paddingVertical:10}}>
                  <Text style={{color:'white'}}>Guardar</Text>
               </Pressable>
             </View>
            */ 
          }
          <View style={styles.contenedorSlide} >
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
                 resetAfterSuccessAnimDelay={1000}
                 onSwipeSuccess={()=>
                 {
                    setChangeSlide(!changeSlide);

                    setTitleSlide('Unidad dentro')

                    setColorsSlide(['#1D96F1','#96DCFF'])

                    setTitleColor('white');
                    setIsSlide(true);
                    siguiente('siguiente'); 
                 }}
                 shouldResetAfterSuccess={true}
               />
            </LinearGradient>
          </View>
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
          <View style={{justifyContent:'center', alignItems:'center'}}>
            <Pressable onPress={()=>{llamar()}} style={{backgroundColor:'#56D0C1', padding:10, borderRadius:100}}>
               <Image source={require('../assets/img/telephone.png')} />
            </Pressable>
          </View>
       </View>
    </View>
  )
}

const styles = StyleSheet.create(
    {
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
        containerFirstInputs:
        {
         paddingRight:60,
         paddingLeft:10,
         backgroundColor:'#F5F5F5',
         marginHorizontal:30,
         borderRadius:15,
         height:60,
        },
        buttonPhone:
        {
           backgroundColor:'#56D0C1',
           padding:8,
           borderRadius:50,
           position:'absolute',
           justifyContent:'center',
           //paddingHorizontal:20,
           marginLeft:250
        },
        siguienteButton:
        {
          backgroundColor:'#249DF2',
          marginHorizontal:30,
          marginVertical:10,
          alignItems:'center',
          borderRadius:15, 
          paddingVertical:15
        },
        contenedorSlide:
        {
          marginHorizontal:10,
          marginVertical:20
        },
        containerGrid:{
          flex: 1,
          justifyContent: 'center',
        }
    }
)

export default Llegada
