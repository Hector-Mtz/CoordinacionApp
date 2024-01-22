import React, {useEffect, useState} from 'react'
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, Pressable, Image, Modal, Alert, Linking, ActivityIndicator, BackHandler } from 'react-native'
import axios from 'axios';
import { RNCamera } from 'react-native-camera';
import SlideButton from 'rn-slide-button';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import SwipeButton from 'rn-swipe-button';
import { PermissionsAndroid } from 'react-native';
//New camera
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
//importar img
import arrow_rigth from '../assets/img/arrow_rigth.png'
import arrow_left from '../assets/img/arrow_left.png'

const Enrrampar = (props) => {
    const navigate = useNavigation();
    const [enrrampado, setEnrrampado] = useState(false);
    const goBack = () => 
    {
      setPhotos([]);
      setContador(0);
      setCampos([]);
      setValores([]);
      setChangeSlide(false);
      setEnrrampado(false);
      navigate.navigate('Inicio', {data:[{},{id:props.route.params.usuario, ubicacion_id:props.route.params.ubicacion}]});
    }

    const saveHrEnrrampe = () => 
    {
        //console.log('hola')
        if(enrrampado == false)
        {
            try 
            {
                axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changeEnrrampado',{params:{id:props.route.params.dt.id}}).then(response=>{
                  console.log(response.data)
                  setEnrrampado(true);
                  Alert.alert('OK', 'Hora de enrrampe guardada',
                  [
                   {text:'Aceptar'}
                  ])
                 }).catch(err => 
                  {
                    console.log(err)
                    setChangeSlide(false);
  
                    setTitleSlide('Enrrampe')
  
                    setColorsSlide(['#F5F7F8','#E0E0E0'])
  
                    setTitleColor('#9B9B9B');
                  });    
            } 
            catch (error) 
            {
              setChangeSlide(false);
  
              setTitleSlide('Enrrampe')

              setColorsSlide(['#F5F7F8','#E0E0E0'])

              setTitleColor('#9B9B9B');
            }
        }
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


    //Variable de almacenaje de campos dinamicos
    const [campos, setCampos] = useState([]);
    const [telefono, setTelefono] = useState(null);
    //Consulta de campos
    useEffect(() => 
    {
      if(props.route.params.dt)
       {
        // console.log(props.route.params.dt.dt_id)
         axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/camposByStatus',{
           params:{
            status_id:props.route.params.dt.status_id
           }
         }).then(
           response => {
             //console.log(response.data)
             setCampos(response.data)
           }
         ).catch(err => 
           {
             console.log(err.response)
             console.log('aqui es error')
           })

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
            //console.log(err.response.data)
            setTelefono(null)
          });
       }
     },[props.route.params.dt]);

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
     
    //Variable para almacenaje de los valores dinamicos
    const [valores, setValores] = useState([]);
    //Camara
    const [photos, setPhotos] = useState([]); //esta es la foto que se almacena (hay que convertirlo a array)
    const [selectedImage, setSelectedImage] = useState(null);
    const [contador, setContador] = useState(0);
    //Variables para el modal de las fotos
    const [modalShowFotos, setModalShowFotos] = useState(false);
    const [campoFotoActual, setCampoFotoActual] = useState(null);

    useEffect(()=> 
  {
    if(selectedImage !== null)
    {
      setPhotos([
        ...photos, selectedImage
      ])
    }
  },[selectedImage]);

  const handleCameraLaunch = async (id) => 
  {
    const options = {
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      selectionLimit: 5
    };
    await launchImageLibrary(options, (response)=>
    {
      if (response.didCancel) 
      {
        console.log('User cancelled image picker');
      } 
      else if (response.error) 
      {
        console.log('ImagePicker Error: ', response.error);
      }
      else //si se seleccionaron fotos
      {
        let contadorTemp = 0;
        if(contador !== 0)
        {
           contadorTemp = contador;
        }

        for (let index = 0; index < response.assets.length; index++) 
        {
          const element = response.assets[index];
          contadorTemp++;

          let imageUri = element.uri;
          let newFotoObj = element;
          newFotoObj.campo_id = id
          newFotoObj.id = contadorTemp;

          setSelectedImage(newFotoObj);
          //console.log(newFotoObj);
        }

        setContador(contadorTemp);
      }
    });
    
    /*
    setModalGuardando(false);
    try {
      setModalGuardando(false);
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message:"App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission given");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      setModalGuardando(false);
      console.warn(err);
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 680, 
      maxWidth: 440,
    };


    launchCamera(options, response => 
      {
        setModalGuardando(false);
      //console.log(response);
      if (response.didCancel) 
      {
        console.log('User cancelled camera');
      } 
      else if (response.error) 
      {
        console.log('Camera Error: ', response.error);
      } 
      else 
      {
        // Process the captured image
        let imageUri = response.uri || response.assets?.[0]?.uri;
        //console.log(response.assets?.[0])
        let newFotoObj = response.assets?.[0];
        newFotoObj.campo_id = id
        setContador(contador + 1);
        newFotoObj.id = contador;
        setSelectedImage(newFotoObj);
        //console.log(selectedImage);
        //console.log(selectedImage);
        //console.log(imageUri);
      }
    });
    */
  }

    const borrarFoto = (id) => 
    {
     setPhotos(photos.filter(photo => photo.id !== id ));
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

    const siguiente = async () => 
        {
          setModalGuardando(true);
          /*
          if(enrrampado)
          {
            */
            if(valores.length > 0 && photos.length > 0 ) 
            {
               // console.log(valores)
                //console.log(photosObject.fotos)
                try 
                {
                  //Hay que fomar el array correcto
                  let arrayFotos = [];
                  let arratTemporal = []
                  for (let index = 0; index < photos.length; index++) 
                  {
                    const fotoActual = photos[index];
                    let localUri = fotoActual.uri;
                    //setPhotoShow(localUri);
                    let filename = localUri.split('/').pop();
                    let match = /\.(\w+)$/.exec(filename);
                    let type = match ? `image/${match[1]}` : `image`;
                    let foto = {uri: localUri, name: filename, type}
                    let newObjFoto = {campo_id: fotoActual.campo_id, foto:foto}
                    arratTemporal.push(newObjFoto)
                   }

                   for (let index2 = 0; index2 < arratTemporal.length; index2++) 
                    {
                      //console.log("vuelata en lista de imagenes" + index2)
                     const element = arratTemporal[index2];
                     if(arrayFotos.length == 0)
                     {
                      
                         let newObje = {campo_id:element.campo_id, fotos:[]}
                         arrayFotos.push(newObje) 
                         arrayFotos[0].fotos.push(element.foto)
                         //console.log(arrayFotos[0].fotos)
                     }
                     else
                     { 
                       
                       let x = 0;
                       
                         for (let index3 = 0; index3 < arrayFotos.length; index3++) 
                         {
                           if(x == 0){
                             
                           const objFoto = arrayFotos[index3];
                           //console.log("conmaracion de id "+objFoto.campo_id+" "+element.campo_id)
                           if(objFoto.campo_id == element.campo_id && x == 0) //pushea
                           {
                             //console.log("entra a la comparacion")
                             objFoto.fotos.push(element.foto)
                              x = 1
                             //console.log(arrayFotos[index3].fotos)
                           }
                           else
                           {
                              //console.log("entra a cuando no son iguales")
                               //console.log("tamaño de las que se envian "+arrayFotos.length +" index de recorrido" + (index3 + 1) )
                              if(arrayFotos.length == (index3 + 1)  && x==0)
                              {
                               let newObje = {campo_id:element.campo_id, fotos:[]}
                                   arrayFotos.push(newObje) 
                                   arrayFotos[index3 + 1].fotos.push(element.foto) 
                                   //console.log(arrayFotos[index3 + 1].fotos)
                                   x=1
                              }
                           }
                         }
                       }
                     }
                    }

                    let formData = new FormData();
                    let newArrayObjcs= []
                    for (let index3 = 0; index3 < arrayFotos.length; index3++) 
                    {
                      const fotoObject = arrayFotos[index3];
                      let campo_id = fotoObject.campo_id;             
                      for (let index4 = 0; index4 < fotoObject.fotos.length; index4++)
                      {
                       const foto = fotoObject.fotos[index4];
                       let localUri = foto.uri;
                       let filename = localUri.split('/').pop();
                       let match = /\.(\w+)$/.exec(filename);
                       let type = match ? `image/${match[1]}` : `image`;
                       let newFoto = { uri: localUri, name: filename, type };
                       formData.append('fotos[]', newFoto);
                       let newObjecto = {
                         campo_id:campo_id,
                         nombre_foto:filename
                       }
                       newArrayObjcs.push(newObjecto)
                      }
                    }
                  
                    //console.log(JSON.stringify(newArrayObjcs))   
                    for (let index5 = 0; index5 < newArrayObjcs.length; index5++) 
                    {
                         let ObjcActual =  newArrayObjcs[index5];      
                         formData.append('fotosNames['+index5+'][campo_id]',ObjcActual.campo_id)
                         formData.append('fotosNames['+index5+'][nombre_foto]',ObjcActual.nombre_foto)
                    }

                    //añadimos lo demas
                    formData.append('confirmacion_id', props.route.params.dt.id);
                    formData.append('confirmacion',props.route.params.dt.confirmacion);
                    formData.append('usuario',props.route.params.usuario);
                    formData.append('dt', props.route.params.dt.dt_id);
                    //Primer peticion
                    await axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/valoresEnrrampado', 
                    {params:
                     {
                      valores: valores,
                      usuario: props.route.params.usuario,
                      confirmacion: props.route.params.dt.confirmacion,
                      confirmacion_id:props.route.params.dt.id,
                      dt:props.route.params.dt.dt_id
                    }})
                   .then(res => 
                     {
                      axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/fotosEnrrampe', 
                      formData,
                     {
                       headers: { 'Content-Type': 'multipart/form-data' },
                      }).then(res => 
                       {
                          console.log(res.data)  
                          setContador(1);
                          setCampos([]);
                          setValores([]);
                          setPhotos([]);
                          setModalGuardando(false);
                          setChangeSlide(!changeSlide);
                          setTitleSlide('Enrampado')
                          setColorsSlide(['#F5F7F8','#E0E0E0'])
                          setTitleColor('#9B9B9B');
                          goBack();
                       }).catch(err => 
                       {
                         console.log(err.response.data);
                         setChangeSlide(!changeSlide);
                         setTitleSlide('Enrampado')
                         setColorsSlide(['#F5F7F8','#E0E0E0'])
                         setTitleColor('#9B9B9B');
                         setModalGuardando(false);
                       });
                     }
                   ).catch(err => 
                    {
                      setChangeSlide2(!changeSlide2);

                      setTitleSlide2('Enrampado')
      
                      setColorsSlide2(['#F5F7F8','#E0E0E0'])
      
                      setTitleColor2('#9B9B9B');
                      
                      setModalGuardando(false);
                    });
                } 
                catch (error) 
                {
                  setChangeSlide2(!changeSlide2);

                  setTitleSlide2('Enrampado')
  
                  setColorsSlide2(['#F5F7F8','#E0E0E0'])
  
                  setTitleColor2('#9B9B9B');
                  
                  setModalGuardando(false);
                }
            }
            else
            {
                Alert.alert('ERROR', 'Completar todos los campos',
                 [
                  {text:'Aceptar'}
                 ]);

                 setChangeSlide2(!changeSlide2);

                 setTitleSlide2('¿Se desenrampó?')
 
                 setColorsSlide2(['#F5F7F8','#E0E0E0'])
 
                 setTitleColor2('#9B9B9B');
                 
                 setModalGuardando(false);
            }
            /*
          }
          else
          {
                Alert.alert('ERROR', 'Debe primero enrramparse',
                 [
                  {text:'Aceptar'}
                 ]);

                 setChangeSlide2(!changeSlide2);

                 setTitleSlide2('¿Se desenrampó?')
 
                 setColorsSlide2(['#F5F7F8','#E0E0E0'])
 
                 setTitleColor2('#9B9B9B');
                 
                 setModalGuardando(false);
          }
          */
    }


    
    //Variables para slide de enrrampe
    const [changeSlide, setChangeSlide] = useState(false);
    const [titleSlide, setTitleSlide]= useState('Enrampe');
    const [colorsSlide, setColorsSlide] = useState(['#F5F7F8','#E0E0E0']);
    const [titleColor, setTitleColor] = useState('#9B9B9B');
    //Variables para slide de desenrrampe
    const [changeSlide2, setChangeSlide2] = useState(false);
    const [titleSlide2, setTitleSlide2]= useState('Enrampar');
    const [colorsSlide2, setColorsSlide2] = useState(['#F5F7F8','#E0E0E0']);
    const [titleColor2, setTitleColor2] = useState('#9B9B9B');
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
            setContador(0);
            setShowLogin(false);
         } catch (error) 
         {
           
         }
         
  }
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
       <View style={{flexDirection:'row', alignItems:'center', marginBottom:0,alignContent:'center'}}>
         <Pressable style={{marginLeft:15}}  onPress={()=>{goBack()}}>
           <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
         </Pressable>
         <Text style={styles.title}>Enrrampe</Text>
       </View>
       <View style={{marginVertical:10, marginHorizontal:15}}>
         <Text style={{color:'black', fontSize:15}}>
          <Text style={{fontWeight:'bold'}}>Confirmación: </Text>
          {props.route.params.dt.confirmacion} - {props.route.params.dt.plataforma}
         </Text>
      </View>
       <View style={{marginHorizontal:18, marginBottom:3}} >
        {
          /*
            <SlideButton
            onReachedToEnd={()=> 
              {
                saveHrEnrrampe()
             }} 
             onReachedToStart={()=>{
                
             }}
             containerStyle={styles.timerButton}
             title="Enrrampe"
             reverseSlideEnabled={!enrrampado}
            />

            <LinearGradient style={{borderRadius:100}} colors={colorsSlide}  start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
             <SwipeButton  
                    title={titleSlide}
                    titleColor={titleColor}
                    containerStyles={{borderWidth: 0,
                     backgroundColor:'transparent'
                   }}
                    thumbIconBackgroundColor='white'
                    thumbIconBorderColor='white'
                    thumbIconImageSource={arrow_rigth}
                    enableReverseSwipe={false}
                    railBackgroundColor='transparent'
                    railFillBackgroundColor='transparent'
                    railStyles={{borderWidth:0}}
                    disableResetOnTap
                    onSwipeSuccess={()=>
                    {
                       setChangeSlide(true);

                       setTitleSlide('Enrrampe')

                       setColorsSlide(['#56D0C1','#48BFB1'])

                       setTitleColor('white');
                       saveHrEnrrampe()
                    }}
                    shouldResetAfterSuccess={false}
                  />
             </LinearGradient>
          */ 
        }
       </View>
       <View style={{height:350, marginTop:0, marginHorizontal:5, marginBottom:0}}>
          <FlatList 
              scrollEnabled
              data={campos}
              keyExtractor={(item) => item.id }
              horizontal={false}
              numColumns={1}
              renderItem={({item}) =>    
              {
                return (
              <View >
                    {
                      item.tipo_campo == 'text' ?
                      <View>
                         <View style={{marginHorizontal:15, backgroundColor:'#F5F5F5', marginVertical:5, borderRadius:15, padding:10, height:60}}>
                              <View style={{flexDirection:'row', alignItems:'center'}}>
                               {
                                     item.nombre == 'Rampa' ? 
                                     <View>
                                        <Image  style={{width:15, height:12, marginHorizontal:8}} source={require('../assets/img/rampa.png')} />
                                     </View>
                                     :null
                                   }
                                    <Text style={{color:'#9B9B9B'}}>
                                       {item.nombre}
                                    </Text>
                               </View>
                               <TextInput style={{color:'black'}} keyboardType='numeric'  onEndEditing={(newText)=>
                               {
                                  let newObj = {campo_id: item.id , value: newText.nativeEvent.text}
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
                        </View>
                      </View>
                        :null
                     }

               </View>
                )
              }
             }
          />
         <View style={{marginHorizontal:5, marginTop:-20, alignItems:'center'}}>
         <FlatList
              style={{}}
              data={campos}
              keyExtractor={(item) => item.id }
              numColumns={3}
              horizontal={false}
              renderItem={({item}) =>    
              {
                return (
               <View >
                  
                  {
                     item.tipo_campo == 'image' ?
                     <View style={{marginHorizontal:5, marginTop:5}}>
                        <Text style={{color:'#9B9B9B', marginLeft:20, marginTop:5, marginBottom:5}}>{item.nombre}</Text>
                        {
                          photos.length > 0 ? 
                          <View>
                              {
                                (photos.filter(photo => photo.campo_id == item.id )).length > 0 ?
                                <View>
                                  <Pressable onPress={()=>
                                   {
                                    setCampoFotoActual(item);
                                    setModalShowFotos(true);
                                   }} style={{backgroundColor:'#1D96F1',paddingVertical:31, paddingHorizontal:50, 
                                       borderRadius:30, marginHorizontal:10, marginTop:0}}>
                                       <Image style={{width:40, height:40}}  source={require('../assets/img/img_ok.png')} />
                                   </Pressable>
                                </View>
                                : 
                                <View>
                                  <Pressable onPress={()=>
                                   {
                                    setCampoFotoActual(item);
                                    setModalShowFotos(true);
                                   }} style={{backgroundColor:'#F5F7F8',paddingVertical:31, paddingHorizontal:50, 
                                       borderRadius:30, marginHorizontal:10, marginTop:0}}>
                                       <Image style={{width:40, height:40}}  source={require('../assets/img/img.png')} />
                                   </Pressable>
                                </View>
                              }
                          </View>
                          :
                          <View>
                          <Pressable onPress={()=>
                           {
                            setCampoFotoActual(item);
                            setModalShowFotos(true);
                           }} style={{backgroundColor:'#F5F7F8',paddingVertical:31, paddingHorizontal:50, 
                               borderRadius:30, marginHorizontal:10, marginTop:0}}>
                               <Image style={{width:40, height:40}}  source={require('../assets/img/img.png')} />
                           </Pressable>
                        </View>
                        }
                     </View>
                     : null
                    }
               </View>
                )
              }}
            />
         </View>
       </View>
       <Modal animationType="slide" visible={modalShowFotos}>
            <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
               <Pressable style={{marginTop:15}} onPress={()=>{setModalShowFotos(false)
               }}>
                   <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
               </Pressable>
               <View style={{marginTop:15}}>
                   {
                     campoFotoActual !== null ? 
                     <View>
                         <Text style={styles.title}>{campoFotoActual.nombre}</Text>
                         <Pressable style={{flex: 0,
                           backgroundColor: '#697FEA',
                           borderRadius: 30,
                           paddingVertical: 12,
                           paddingHorizontal: 45,
                           alignSelf: 'center',
                           margin: 20}} 
                         onPress={()=>{handleCameraLaunch(campoFotoActual.id)}}>
                           <Image style={{width:35, height:27}} source={require('../assets/img/icono-foto.png')} />
                         </Pressable>
                         <View>
                            {
                              photos.length !== 0 ?
                              <View style={{marginTop:50}}>
                                  <FlatList 
                                   scrollEnabled
                                   data={photos}
                                   keyExtractor={(item) => item.id }
                                   horizontal={true}
                                   renderItem={({item}) =>             
                                   {
                                     return (
                                      <View>
                                         {
                                           item.campo_id == campoFotoActual.id ?
                                           <View style={{marginHorizontal:5}}>
                                              <Pressable onPress={()=>{borrarFoto(item.id)}}
                                              style={{backgroundColor:'#F25B77', 
                                              borderRadius:100, padding:8, position:'absolute',
                                              zIndex:2
                                              }}>
                                                 <Image style={{width:15, height:18}} source={require('../assets/img/eliminar.png')} />
                                              </Pressable>
                                              <Image style={{width:300, height:300}} source={{ uri: item.uri }}/>
                                           </View>
                                           : null
                                         }
                                      </View>
                                     )
                                   }
                                  }
                                  />
                              </View>
                              : 
                              <View>
                                <Text style={{textAlign:'center', color:'black', fontSize:15}}>No hay fotos aun</Text>
                              </View>
                            }
                         </View>
                     </View>
                     :
                     null
                   }
                 </View>
               </View>
         </Modal>
       <View style={{marginVertical:15}}>
       <LinearGradient style={{borderRadius:100}} colors={colorsSlide2}  start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
       <SwipeButton  
               title={titleSlide2}
               titleColor={titleColor2}
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
                setChangeSlide2(!changeSlide2);

                setTitleSlide2('Enrampado')

                setColorsSlide2(['#1D96F1','#96DCFF'])

                setTitleColor2('white');
                setIsSlide(true);
                siguiente('siguiente'); 
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
               siguiente()
            }} 
            title="¿Se desenrrampo?"
            autoReset={true}
             />
           */
        }
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
       </View>
       <View style={{flexDirection:'row', justifyContent:'center', marginVertical:5}}>
           <Pressable onPress={()=>{
             llamar()
           }} style={{backgroundColor:'#56D0C1', padding:10, borderRadius:100}}>
              <Image source={require('../assets/img/telephone.png')} />
           </Pressable>
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
    siguienteButton:
    {
      backgroundColor:'#249DF2',
      marginHorizontal:30,
      marginVertical:10,
      alignItems:'center',
      borderRadius:15, 
      paddingVertical:15
    },
    documentButton:
    {
        backgroundColor:'#249DF2',
        marginHorizontal:30,
        marginVertical:10,
        alignItems:'center',
        borderRadius:15, 
        paddingVertical:15
    },
    text:
    {
      color:'#9B9B9B'
    },
    timerButton:
    {
      backgroundColor:'#697FEA'
    }
})


export default Enrrampar