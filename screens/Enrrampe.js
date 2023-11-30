import React, {useEffect, useState} from 'react'
import {Text, View, StyleSheet, Pressable, Image, Alert, FlatList, Modal} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Switch } from 'react-native-gesture-handler';
import DocumentPicker from 'react-native-document-picker'
import axios from 'axios';
import { WebView } from 'react-native-webview';
import SignatureScreen from 'react-native-signature-canvas';
import { RNCamera } from 'react-native-camera';
import SlideButton from 'rn-slide-button';

const Enrrampe = (props) => {
  const navigate = useNavigation();
  const goBack = () => 
  {
    navigate.navigate('Inicio', {data:[{},{id:props.route.params.usuario, ubicacion_id:props.route.params.ubicacion}]});
  }
  //Variable de almacenaje de campos dinamicos
  const [campos, setCampos] = useState([]);
  //funcion para el switch
  const [isEnabled, setIsEnabled] = useState(false);
  const changeToDescarga = () => 
  {
    setIsEnabled(isEnabled => !isEnabled);
  }

  useEffect(()=> 
  {
   if(isEnabled) //si se cambia a activo pasara a status de espera
   {
      axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changeToDescarga',{params:{id:props.route.params.dt.id}}).then(response=>{
       //console.log(response)
      }).catch(err => 
       {
         console.log(err)
       });
   }
   else //sino al de documentacion
   {
     axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/changeEnrrampado',{params:{id:props.route.params.dt.id}}).then(response=>{
       //console.log(response)
      }).catch(err => 
       {
         console.log(err)
       });
   }
  },[isEnabled])

     //Consulta de campos
     useEffect(() => 
     {
       if(props.route.params.dt.status_id == 11)
       {
          setIsEnabled(true)
       }
       else
       {
         setIsEnabled(false)
       }
   
        if(props.route.params.dt)
        {
          //console.log(props.route.params.dt)
          axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/camposApi',{
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
              console.log(err)
            })
        }
      },[props.route.params.dt]);

    const [tipo_campo_id, setTipoCampoId] = useState(null);

    //Documentos
    const [documento, setDocumento] = useState(null);
    const selectDocument = async (id) => 
    {
        setTipoCampoId(id);
        try 
        {
            const file = await DocumentPicker.pick({
                type:[DocumentPicker.types.csv, DocumentPicker.types.docx, DocumentPicker.types.pdf],
                copyTo:'documentDirectory',
            });
            setDocumento(file[0]);
        } 
        catch (error) 
        {
            if(DocumentPicker.isCancel(error))
            {
              
            }
            else
            {
                throw error;
            }
        }
    }
    //Camara
     const [camera, setCamera] = useState(null);
     const [modalVisibleCam, setModalVisibleCam] = useState(false); 
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
   

    //Modal para firmas
    const [modalVisible, setModalVisible] = useState(false);
    const handleOK = async (signature) =>  //funcion para guardardo de firma como img
    {
      const firma = signature; //es una img base64
      //console.log(firma);
      const formData = new FormData();

      //1 solo mandamos los datos, faltan las fotos
      formData.append('tipo_campo_file', tipo_campo_id);
      formData.append('file',{
        uri:documento.fileCopyUri,
        type:documento.type,
        name:documento.name,
      });
      formData.append('firma', firma); //la firma no ocupa un tipo de campo
      formData.append('dt',props.route.params.dt.dt_id);
      formData.append('usuario',props.route.params.usuario);
      formData.append('confirmacion',props.route.params.dt.confirmacion);

       if(documento !== null || photosObject.fotos.fotos.length > 1 || tipo_campo_id !== null)
       {
          try 
          {
            //axios para las fotos
            await axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/fotosEnrrampe',{params:{
              fotos:photosObject,
              dt:props.route.params.dt.dt_id,
              usuario:props.route.params.usuario,
              confirmacion: props.route.params.dt.confirmacion
             }}).then(response => 
              {
                console.log(response.data);
              }).catch(err=>{
                console.log(err)
              });
              
            //axios para los datos
           await axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/valoresEnrrampe',formData,{
            headers:{
              'Content-Type': 'multipart/form-data'
            }
            }).then(response => 
            {
              console.log(response.data)
              //Reseteamos
              setModalVisible(false);
              setPhotos([]);
              setPhotosObject({
                campo_id: null,
                fotos:null
              });
              setContador(1);
              setFotoTemp({id:0, photo:null});
              setDocumento(null);
              setTipoCampoId(null);
              goBack();
            }).catch(err => {
               console.log(err);
            });
          } 
           catch (error) 
          {
             
          }
       }
       else
       {
          Alert.alert('ERROR', 'Los campos son requeridos',
          [
           {text:'Aceptar'}
          ])
       }
    };
    //Funcion de guardado
    /*
    const siguiente = async (tipo) => 
    {
      const formData = new FormData();
      formData.append('file',{
        uri:documento.fileCopyUri,
        type:documento.type,
        name:documento.name
      });

      axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/valoresEnrrampe',formData,{
        headers:{
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => 
        {
          console.log(response.data)
        })
    }
    */
  return (
    <View style={styles.container}>
       <View style={{flexDirection:'row', alignItems:'center', marginBottom:10,alignContent:'center'}}>
         <Pressable style={{marginLeft:15}}  onPress={()=>{goBack()}}>
           <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
         </Pressable>
         <Text style={styles.title}></Text>
       </View>
       <View style={{flexDirection:'row', alignItems:'center', marginBottom:10, marginHorizontal:25}} >
        {
          /*
          <Text style={{color:'#9B9B9B'}}>Descarga</Text>
           <Switch 
           trackColor={{false: '#767577', true: '#3D8980'}}
           thumbColor={isEnabled ? '#56D0C1' : '#f4f3f4'}
           onValueChange={changeToDescarga}
             value={isEnabled}
            /> 
          */
        }
        <SlideButton
            onReachedToEnd={()=> 
            {
              
           }} 
           containerStyle={styles.timerButton}
           title="Enrrampe"
           reverseSlideEnabled={true}
            />
       </View>
       <View>
          <FlatList 
          scrollEnabled
          data={campos}
          keyExtractor={(item) => item.id }
          renderItem={({item}) =>             
          {
            return (
              <View style={{marginVertical:10, marginHorizontal:20}}>
                 <Text style={styles.text}>{item.nombre}</Text>
                 {
                  item.tipo_campo == 'image' ?
                  <View>
                    <Pressable
                     style={styles.documentButton}
                     onPress={()=>{setModalVisibleCam(true)}}
                     >
                      <Text style={{color:'white'}}> Tomar fotografia</Text>
                     </Pressable>
                    <Modal animationType="slide"
                          visible={modalVisibleCam}>
                          <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
                              <Pressable onPress={()=>{setModalVisibleCam(false);
                                  setPhotosObject({
                                    ...photosObject,
                                    fotos: {fotos:photos}
                                   });
                              }}>
                                  <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
                              </Pressable>
                           </View>
                          <View style={{marginTop:200}}>
                            <RNCamera
                                ref={cam => {
                                  setCamera(cam)
                                }}
                                type={RNCamera.Constants.Type.back}
                                style={{paddingTop:10, paddingBottom:10}}
                             >
                                <View>
                                  <Pressable style={{ flex: 0,
                                     backgroundColor: '#fff',
                                     borderRadius: 5,
                                     padding: 15,
                                     paddingHorizontal: 20,
                                     alignSelf: 'center',
                                     margin: 20, }}
                                     onPress={()=>{takePicture(item.id)}}
                                     >
                                    <Text style={{color:'black'}}>Tomar foto</Text>
                                  </Pressable>
                                </View>
                            </RNCamera>
                          </View>
                          <View style={{marginTop:166}}>
                             {
                                photos.length == 0 ?
                                <View>
                                  <Text>Aun No hay Evidencias</Text>
                                </View>
                                :
                                <View style={{marginTop:20}}>
                                  <FlatList
                                  scrollEnabled
                                  data={photos}
                                  keyExtractor={(item) => item.id}
                                  horizontal={true}
                                  renderItem={({item}) =>             
                                  {
                                    return (
                                      <View>
                                          {
                                            item.id !== 0 ?
                                            <View>
                                              <Pressable style={{position:'absolute', zIndex:10, marginHorizontal:15, marginTop:10, backgroundColor:'white', padding:2, borderRadius:50, paddingHorizontal:8}}  onPress={()=> { 
                                               borrarFoto(item.id)
                                              }}>
                                                  <Text style={{color:'red', fontWeight:'900'}} >X</Text>
                                              </Pressable>
                                              <Image  source={{uri:item.photo}} style={{  width: 200, height: 200, marginHorizontal:10}} />  
                                            </View>
                                            :null
                                          }  
                                      </View>
                                    )
                                  }}
                                  />
                                </View>
                             }
                          </View>
                    </Modal>
                  </View>
                  : null
                 }
                                  {
                  item.tipo_campo == 'file' ?
                  <View>
                    <Pressable
                     style={styles.documentButton}
                     onPress={()=>{selectDocument(item.id)}}
                     >
                      <Text style={{color:'white'}}> Seleccionar 📑</Text>
                     </Pressable>
                     {
                       documento !== null ?
                       <View style={{flexDirection:'row', justifyContent:'center'}}>
                          <Text style={styles.text}>{documento.name}</Text>
                       </View> 
                       : null
                     }
                  </View>
                  : null
                 }
                                  {
                  item.tipo_campo == 'firma' ?
                  <View>
                    <Pressable
                     style={styles.documentButton}
                     onPress={()=>{setModalVisible(true)}}
                     >
                      <Text style={{color:'white'}}> Firmar</Text>
                     </Pressable>
                     <Modal  animationType="slide"
                       visible={modalVisible}>
                         <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
                           <Pressable onPress={()=>{setModalVisible(false)
                           }}>
                               <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
                           </Pressable>
                         </View>
                         <View style={{width:'100%', height:'100%'}}>
                           <SignatureScreen 
                              onOK={handleOK}
                              backgroundColor='#FFFFFF'
                              bgWidth={500}
                              bgHeight={500}
                              autoClear={true}
                              descriptionText={'Digita tu firma'}
                              confirmText="Guardar Firma"
                              clearText="Limpiar"
                              webStyle={`.m-signature-pad--footer
                              .button {
                                background-color: #249DF2;
                                color: #FFF;
                                }`}
                               />
                         </View>
                      </Modal>
                  </View>
                  : null
                 }
              </View>
            )
          }}
          />
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

export default Enrrampe
