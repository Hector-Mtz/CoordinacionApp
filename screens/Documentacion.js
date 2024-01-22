import React, {useEffect, useState} from 'react'
import {StyleSheet, View, Pressable, Image, Text, FlatList, Modal, Alert, ActivityIndicator, Linking, BackHandler} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Switch, TextInput } from 'react-native-gesture-handler';
import { RNCamera } from 'react-native-camera';
import { PermissionsAndroid } from 'react-native';
//New camera
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
//
import SlideButton from 'rn-slide-button';
import LinearGradient from 'react-native-linear-gradient';
import SwipeButton from 'rn-swipe-button';
//importar img
import arrow_left from '../assets/img/arrow_left.png'
import axios from 'axios';
const Documentacion = (props) => 
{
  const navigate = useNavigation();
  const goBack = () => 
  {
    navigate.navigate('Inicio', {data:[{},{id:props.route.params.usuario, ubicacion_id:props.route.params.ubicacion}]});
    setCampos([]);
    setPhotos([]);
    setValores([]);
    setContador(1);
    setSelectedImage(null);
    setModalGuardando(false);
    guardarOcsSaveIt(false);
  }
   const [telefono, setTelefono] = useState(null);
   //Variable de almacenaje de campos dinamicos
   const [campos, setCampos] = useState([]);
  //Variable para almacenaje de los valores dinamicos
   const [valores, setValores] = useState([]);
   //Effect para cambio de status 
   /*
   useEffect(()=> 
   {
    if(isEnabled) //si se cambia a activo pasara a status de espera
    {
       axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changeToEnEspera',{params:{id:props.route.params.dt.id}}).then(response=>{
        //console.log(response)
       }).catch(err => 
        {
          console.log(err)
        });
    }
    else //sino al de documentacion
    {
      axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changeToEnDocumentacion',{params:{id:props.route.params.dt.id}}).then(response=>{
        //console.log(response)
       }).catch(err => 
        {
          console.log(err)
        });
    }
   },[isEnabled])
   */
   //Consulta de campos
   useEffect(() => 
  {
     if(props.route.params.dt)
     {
       //console.log(props.route.params.dt)
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
           console.log(err.response.data)
         });

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
            console.log('hola')
            console.log(err.response.data)
          });

     }
   },[props.route.params.dt]);


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

  //Camara
  const [contador, setContador] = useState(1);
  const [photos, setPhotos] = useState([]); 
  const [selectedImage, setSelectedImage] = useState(null);
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
  },[selectedImage])

  const  handleCameraLaunch = async (id) => 
  {
    setModalGuardando(false)
    try 
    {
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
        setModalGuardando(false);
      } else {
        console.log("Camera permission denied");
        setModalGuardando(false);
      }
    } catch (err) {
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
        setModalGuardando(false);
      } 
      else if (response.error) 
      {
        console.log('Camera Error: ', response.error);
        setModalGuardando(false);
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
        setModalGuardando(false);
        //console.log(selectedImage);
        //console.log(selectedImage);
        //console.log(imageUri);
      }
    });
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
        console.log('Ubo cambio de modal guardado en Documentacion')
      }
    }
    else
    {
      setModalGuardando(false)
    }
   
  },[modalGuardando]);

  //ocs
  const [ocsSaveIt, guardarOcsSaveIt] = useState(false); //bandera de ocs
  const [modalVisibleOcs, setModalVisibleOcs] = useState(false);
  const [ocs, setOcs] = useState([]);
  const [newOcs, setNewOcs] = useState([]);
  const consultarOcs = () => 
  {
    try 
    {
        //console.log(props.route.params.dt);
        axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/getOcsApi', {params:{
          id: props.route.params.dt.id,
         }}).then(response => 
          {
             //console.log(response.data);
             setOcs(response.data)
             try
             {
                  setModalVisibleOcs(true);
             } 
             catch (error) {
              
             }
          }).catch(err => 
          {
            console.log(err)
          });

    } 
    catch (error) 
    {
      
    }
  }

  const guardarOcs = () => 
  {
    //console.log(newOcs);
    console.log(ocs)
    if(ocs.length !== 0)
    {
       let arrayOcsFaltantes = [];
       for (let index = 0; index < ocs.length; index++) 
       {
         const confirmacion = ocs[index];
         if(confirmacion.ocs.length == 0)
         {
           arrayOcsFaltantes.push(confirmacion)
         }
       }

      if(arrayOcsFaltantes.length !== 0)
      {
        Alert.alert('ERROR', "Hay confirmaciones faltantes de OC's, favor de comunicarse con el administrador o el customer encargado.",
        [
         {text:'Aceptar'}
        ])
      }
      else
      {
        if(newOcs.length > 0 )
        {
           try 
           {
            axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/saveFacturados',{
              params:{
               ocs:newOcs
              }
            }).then(
              response => {
                //console.log(response.data)
                setModalVisibleOcs(false)
                Alert.alert('OK', 'OCS Guardadas',
                [
                 {text:'Aceptar'}
                ])
                guardarOcsSaveIt(true);
                setNewOcs([]);
              }
              ).catch(err => 
              {
                console.log(err)
              })
           } 
           catch (error) 
           {
            
           }
        }
        else
        {
          Alert.alert('ERROR', 'Las OCS deben tener su cantidad',
           [
            {text:'Aceptar'}
           ])
        }
      }
    }
    else
    {
      Alert.alert('ERROR', 'No hay OCS asociadas',
      [
       {text:'Aceptar'}
      ])
    }
  }


  const siguiente = async () => 
  {
    //console.log(valores)
    if(photos.length == 0)
    {
      Alert.alert('ERROR', 'Los campos son requeridos',
      [
       {text:'Aceptar'}
      ]);

      setChangeSlide(!changeSlide);
      setTitleSlide('¿Entregó documentación?')
      setColorsSlide(['#F5F7F8','#E0E0E0'])
      setTitleColor('#9B9B9B');
      //setModalGuardando(false);
    }
    else
    {
      if(ocs.length > 0 && ocsSaveIt == true)
      {
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
         
         //console.log(arratTemporal)

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

        //console.log(formData);
        //setModalGuardando(true);
        if(valores.length == 0)
        {
          setModalGuardando(true);
          axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/fotosDocumentacion', 
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
              setTitleSlide('¿Entregó documentación?')
              setColorsSlide(['#F5F7F8','#E0E0E0'])
              setTitleColor('#9B9B9B');
              goBack();
           }).catch(err => 
           {
             console.log(err.response.data);
             setChangeSlide(!changeSlide);
             setTitleSlide('¿Entregó documentación?')
             setColorsSlide(['#F5F7F8','#E0E0E0'])
             setTitleColor('#9B9B9B');
             setModalGuardando(false);
           });
        }
        else
        {
          setModalGuardando(true);
          await axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/valoresDeDocumentacion', 
          {params:
           {
            valores: valores,
            usuario: props.route.params.usuario,
            confirmacion: props.route.params.dt.confirmacion,
            confirmacion_id:props.route.params.dt.id,
          }})
         .then(res => 
           {
              axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/fotosDocumentacion', 
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
                  setTitleSlide('¿Entregó documentación?')
                  setColorsSlide(['#F5F7F8','#E0E0E0'])
                  setTitleColor('#9B9B9B');
                  goBack();
               }).catch(err => 
               {
                 console.log(err.response.data);
                 setChangeSlide(!changeSlide);
                 setTitleSlide('¿Entregó documentación?')
                 setColorsSlide(['#F5F7F8','#E0E0E0'])
                 setTitleColor('#9B9B9B');
                 setModalGuardando(false);
               });
           })
           .catch(err => {
             console.log(err.response);
             setChangeSlide(!changeSlide);
             setTitleSlide('¿Entregó documentación?')
             setColorsSlide(['#F5F7F8','#E0E0E0'])
             setTitleColor('#9B9B9B');
             setModalGuardando(false);
           });
        }
      }
      else
      {
        Alert.alert('ERROR', "Las OC's son requeridas, comuniquese con el administrador del sistema",
        [
         {text:'Aceptar'}
        ]);
        setChangeSlide(!changeSlide);
        setTitleSlide('¿Entregó documentación?')
        setColorsSlide(['#F5F7F8','#E0E0E0'])
        setTitleColor('#9B9B9B');
        setModalGuardando(false);
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
      guardarOcsSaveIt(true);
      setCampos([]);
      setPhotos([]);
      setValores([]);
      setContador(1);
      setSelectedImage(null);
      setModalGuardando(false);
   } catch (error) 
   {
     
   }
  }
  

  const [changeSlide, setChangeSlide] = useState(false);
  const [titleSlide, setTitleSlide]= useState('¿Entregó documentación?');
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
       <View style={{flexDirection:'row', alignItems:'center', marginBottom:10,alignContent:'center', marginHorizontal:10}}>
         <Pressable style={{marginLeft:15}}  onPress={()=>{goBack()}}>
           <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
         </Pressable>
         <Text style={styles.title}>Documentación</Text>
       </View>
       <View style={{marginVertical:10, marginHorizontal:35}}>
         <Text style={{color:'black', fontSize:15}}>
          <Text style={{fontWeight:'bold'}}>Confirmación: </Text>
          {props.route.params.dt.confirmacion} - {props.route.params.dt.plataforma}
         </Text>
       </View>
       <View style={{marginTop:-10, height:350}}>
         {
          campos.length > 0 ?
          <View>
            <FlatList 
               columnWrapperStyle={{justifyContent: 'center'}}
               scrollEnabled
               data={campos}
               keyExtractor={(item) => item.id }
               horizontal={false}
               numColumns={2}
               renderItem={({item}) =>             
               {
                 return (
                   <View >
                     {
                      item.tipo_campo == 'image' ?
                      <View style={{width:'100%', marginVertical:5, justifyContent:'center', alignItems:'center'}}>
                        {
                          item.nombre == 'YMS' ?
                           <View>
                            {
                              photos  ?
                              <View>
                                {
                                  (photos.filter(photo => photo.campo_id == item.id )).length > 0 ?
                                     <Pressable onPress={()=> 
                                      {
                                           setCampoFotoActual(item);
                                           setModalShowFotos(true);
                                      }} style={{backgroundColor:'#56D0C1', marginVertical:5, borderRadius:30,  paddingVertical:10, flexDirection:'row', alignItems:'center', paddingHorizontal:15, marginHorizontal:0, marginRight:15}}>
                                         <Image style={{width:37, height:25, marginHorizontal:15}} source={require('../assets/img/ver.png')} />
                                         <Text style={{color:'white', marginHorizontal:15, fontWeight:'500'}} >
                                            {item.nombre}
                                         </Text>
                                      </Pressable>
                                    :
                                    <Pressable onPress={()=> 
                                      {
                                           setCampoFotoActual(item);
                                           setModalShowFotos(true);
                                      }} style={{backgroundColor:'#44BFFC', marginVertical:5, borderRadius:30,  paddingVertical:10, flexDirection:'row', alignItems:'center', paddingHorizontal:15, marginHorizontal:0}}>
                                         <Image style={{width:32, height:25, marginHorizontal:15}} source={require('../assets/img/icono-foto.png')} />
                                         <Text style={{color:'white', marginHorizontal:15, fontWeight:'500'}} >
                                            {item.nombre}
                                         </Text>
                                      </Pressable>
                                }
                              </View>
                              :null
                            }
                           </View>
                          :
                          <View>
                            {
                              (photos.filter(photo => photo.campo_id == item.id )).length > 0 ?
                              <Pressable onPress={()=> 
                                {
                                     setCampoFotoActual(item);
                                     setModalShowFotos(true);
                                }} style={{backgroundColor:'#56D0C1', marginVertical:5, borderRadius:30,  paddingVertical:10, flexDirection:'row', alignItems:'center', paddingHorizontal:15, marginHorizontal:2}}>
                                   <Image style={{width:37, height:25, marginHorizontal:15}} source={require('../assets/img/ver.png')} />
                                   <Text style={{color:'white', marginHorizontal:15, fontWeight:'500'}} >
                                      {item.nombre}
                                   </Text>
                                </Pressable>
                                 :
                                 <Pressable onPress={()=> 
                                  { 
                                    setCampoFotoActual(item);
                                    setModalShowFotos(true);
                                  }} style={{backgroundColor:'#1D96F1', marginVertical:5, borderRadius:30, paddingVertical:10, flexDirection:'row',alignItems:'center',paddingHorizontal:15, marginHorizontal:2}}>
                                   <Image style={{width:32, height:25, marginHorizontal:15}} source={require('../assets/img/icono-foto.png')} />
                                   <Text style={{color:'white', marginHorizontal:15, fontWeight:'500'}} >
                                      {item.nombre}
                                   </Text>
                                </Pressable>
                            }
                          </View>
                        }
                       </View>
                      :null
                     }
                     {
                      item.tipo_campo == 'text' ||  item.tipo_campo == 'number' ? 
                      <View style={{width:350}}>
                          {
                            item.nombre == 'Notas' ? 
                            <View style={{marginHorizontal:0, backgroundColor:'#F5F5F5', marginVertical:5, borderRadius:15, padding:10, height:250}}>
                              <View style={{flexDirection:'row'}}>
                                 <Image style={{width:18, height:20, marginRight:5}} source={require('../assets/img/table.png')} />
                                 <Text style={{color:'#9B9B9B'}}>
                                   {item.nombre}
                                 </Text>
                              </View>
                               <TextInput style={{color:'black'}} multiline = {true}  onChangeText={(newText)=>
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
                            </View>
                            :
                            <View style={{marginHorizontal:15, backgroundColor:'#F5F5F5', marginVertical:5, borderRadius:15, padding:10, height:60}}>
                               <Text style={{color:'#9B9B9B'}}>
                                 {item.nombre}
                               </Text>
                            </View>
                          }
                          
                      </View>
                      :
                      null
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
         <View style={{marginVertical:15, marginHorizontal:15}}>
           <Pressable onPress={()=> 
          {
            consultarOcs()
          }} style={{paddingHorizontal:10, paddingVertical:10, backgroundColor:'#697FEA', borderRadius:20,flexDirection:'row', justifyContent:'center', alignItems:'center', marginHorizontal:5}}>
              <Image style={{width:26.2, height:18, marginRight:12}} source={require('../assets/img/ver.png')} />
              <Text style={{color:'white', textAlign:'center'}}>OC'S</Text>
           </Pressable>
         </View>
         <Modal  animationType="slide"
                visible={modalVisibleOcs}>
            <View>
              <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
                   <Pressable onPress={()=>{setModalVisibleOcs(false)
                   }}>
                       <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
                   </Pressable>
                   <View style={{marginTop:15}}>
                      <Text style={{color:'black', fontSize:20}}>OCS</Text>
                   </View>
                   <View> 
                    {
                      ocs.length > 0 ?
                      <View style={{height:520}}> 
                          <FlatList 
                          scrollEnabled
                          data={ocs ? ocs : [] }
                          keyExtractor={(item) => item.id }
                          renderItem={({item}) =>             
                          {
                            return (
                              <View style={{marginVertical:5,  borderBottomWidth:1, borderBottomColor:'#9B9B9B', paddingVertical:5}}>
                                <Text style={{color:'black', fontSize:22, textAlign:'center', marginVertical:10}}>Confirmación: {item.confirmacion}</Text>
                                <View style={{flexDirection:'row', justifyContent:'space-evenly', borderBottomWidth:1, paddingBottom:15, marginBottom:10, borderColor:'#1D96F1'}}>
                                  <Text style={{color:'black'}}>OC</Text>
                                  <Text style={{color:'black'}}>Cantidad cajas</Text>
                                </View>
                                <View>
                                  {
                                    item.ocs.length !== 0 ?
                                    <View>
                                      <FlatList 
                                       scrollEnabled
                                       data={item.ocs}
                                       keyExtractor={(item) => item.id }
                                       renderItem={({item}) =>             
                                       {
                                         return (
                                          <View style={{flexDirection:'row', justifyContent:'space-evenly', alignItems:'center', marginVertical:5}}>
                                            <Text style={{color:'black', fontSize:22}}>#{item.referencia}</Text>
                                            <TextInput  keyboardType='numeric' onChangeText={(newText)=> 
                                             {
                                               let newObj = {oc_id: item.id , value: newText}
                                                if(newOcs.length === 0)
                                                {
                                                // objetos.push(newObj)
                                                 setNewOcs([
                                                   ...newOcs, newObj
                                                 ])
                                                }
                                                else
                                                    {
                                                      let x = 0;
                                                      for (let index = 0; index < newOcs.length; index++) 
                                                      {
                                                       const element = newOcs[index];
                                                       //console.log(newObj)
                                                       // console.log(element)
                                                       if(element.oc_id === newObj.oc_id )
                                                       {
                                                           x = 1
                                                           element.value = newObj.value
                                                       }
                                                      }
                                                     
                                                      if(x==0)
                                                      { 
                                                        //console.log(newObj)
                                                        setNewOcs([
                                                          ...newOcs, newObj
                                                        ])
                                                      }
             
                                                      
                                                    }
                                                    //console.log(items)
                                                 }} style={{borderColor:'black', borderWidth:1,borderRadius:20, width:'30%', color:'black', borderColor:'#1D96F1' }}>
        
                                                 </TextInput>
                                              </View>
                                             )
                                           }}
                                      />
                                    </View>
                                    :
                                    <View>
                                       <Text style={{textAlign:'center', color:'#9B9B9B'}}>
                                         Esta confirmación no cuenta con OC´s asociadas, pongase en
                                         contacto con el customer encargado.
                                       </Text>
                                    </View>
                                  }
                                </View>
                              </View>
                            )
                           }
                          }
                          />
                         <Pressable onPress={()=> 
                         {
                           guardarOcs()
                         }} style={{backgroundColor:'#249DF2',
                            marginHorizontal:30,
                            marginVertical:10,
                            alignItems:'center',
                            borderRadius:15, 
                            paddingVertical:15}}>
                           <Text style={{color:'white', fontWeight:'900', fontSize:20}}>Guardar</Text>
                         </Pressable>
                      </View>
                      :
                      <View>
                        <Text>No hay OCS asociadas</Text>
                      </View> 
                    }
                   </View>
                </View>
            </View>
         </Modal>
          <View style={styles.contenedorSlide}>
            {
              /*
               <SlideButton
                 onReachedToStart={()=>{
                   
                }}
                 onReachedToEnd={()=> 
                 {
                   siguiente('siguiente')
                }} 
                title="¿Entregó documentación?"
                autoReset={true}
                 />
              */ 
            }
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

                  setTitleSlide('Documentación entregada')

                  setColorsSlide(['#1D96F1','#96DCFF'])

                  setTitleColor('white');
                  setIsSlide(true);
                  siguiente('siguiente'); 
               }}
               shouldResetAfterSuccess={true}
             />
          </LinearGradient>   
         </View>
         <View>
            <View>
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
         </View>
         <View style={{flexDirection:'row', justifyContent:'center', marginVertical:15}}>
           <Pressable onPress={()=>{llamar()}} style={{backgroundColor:'#56D0C1', padding:10, borderRadius:100}}>
              <Image source={require('../assets/img/telephone.png')} />
           </Pressable>
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
    marginHorizontal:15
  },
})

export default Documentacion
