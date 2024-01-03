import React, {useEffect, useState} from 'react'
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, Pressable, Image, Modal, Alert, FlatList, TextInput, RefreshControl, ActivityIndicator, Linking, BackHandler } from 'react-native'
import axios from 'axios';
import SlideButton from 'rn-slide-button';
import DatePicker from 'react-native-date-picker'
import DropdownSelect from 'react-native-input-select'
import { RNCamera } from 'react-native-camera';
//New Camera
import { PermissionsAndroid } from 'react-native';
//New camera
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import CantidadIncidencias from '../components/CantidadIncidencias';
import DocumentPicker from 'react-native-document-picker';
import LinearGradient from 'react-native-linear-gradient';
import SwipeButton from 'rn-swipe-button';
//importar img
import arrow_rigth from '../assets/img/arrow_rigth.png';
import arrow_left from '../assets/img/arrow_left.png';
//
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

const Desenrrampe = (props) => 
{
    const [date, setDate] = useState(new Date()) //variable para el picker
    const navigate = useNavigation();
    const [cuadrado, setCuadrado] = useState(false);

    const [visibleFoto, setVisibleFoto] = useState(false);

    const goBack = () => 
    {
      setContador(1);
      setDate(new Date());
      setValores([]);
      setDocumento(null);
      setTipoCampoId(null);
      setSumaGlobalFacturado(1);
      setSumaGlobalPOD(0);
      setOcActual(null);
      setProductoFormodal(null);
      setRecolectoHrFolios(false);
      setChangeSlide2(false);
      setTitleSlide2('¿Liberó viaje?')
      setColorsSlide2(['#F5F7F8','#E0E0E0'])
      setTitleColor2('#9B9B9B');
      setModalGuardando(false);
      navigate.navigate('Inicio', {data:[{},{id:props.route.params.usuario, ubicacion_id:props.route.params.ubicacion}]});
    }

    //Constante para validacion de recoleccion de folios
    const [recolectoHrFolios, setRecolectoHrFolios] = useState(false);

    //Modal para hr
    const [horaDeImpresion, setHoraDeImpresion] = useState(false);
    //Variable de almacenaje de campos dinamicos
    const [campos, setCampos] = useState([]);
    const [telefono, setTelefono] = useState(null);
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
             console.log(err)
           })

           //
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
     },[props.route.params.dt]);

     //Variable para almacenaje de los valores dinamicos
     const [valores, setValores] = useState([]);
     //Funciones para modal de cuadre
     const [modalCuadre, setModalCuadre] = useState(false);
     const [ocs, setOcs] = useState([]);
     const [visible, setVisible] = useState(false);
     //Variables de las sumatorias de las facturados y pod par verificacr el cuadre
     const [sumaGlobalFacturado, setSumaGlobalFacturado] = useState(1);
     const [sumaGlobalPOD, setSumaGlobalPOD] = useState(0);
     //Variable para guardado local
     const [ocsTemporales,setOcsTemporales] = useState([]);
     //Variable de cargado
     const [modalCargando, setModalCargando] = useState(false);
     //Funcion para consultar ocs del cuadre
     const checkOcs = () => 
     {
        try 
        {
           //console.log(props.route.params.dt.confirmacion);
            axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/consultarOcs', {params:{
              confirmacion: props.route.params.dt.confirmacion,
             }}).then(response => 
              {
                 //console.log(response.data);
                 let sumaPOD = 0;
                 let sumaFacturado = 0;

                 for (let index = 0; index < response.data.length; index++) 
                 {
                    const oc = response.data[index];
                    let sumaIndividualPOD = 0;
                    let sumaIndividualFacturado = 0;
                    oc.pod = null;
                    oc.cuadrade = false;

                    if(ocsTemporales.length !== 0)
                    {
                      console.log(ocsTemporales)
                      for (let index2 = 0; index2 < ocsTemporales.length; index2++) 
                      {
                        const ocTemporal = ocsTemporales[index2];
                        if(ocTemporal.id == oc.id)
                        {
                          console.log(ocTemporal.pod)
                          oc.pod = ocTemporal.pod
                          sumaIndividualPOD += parseInt(ocTemporal.pod)
                        }
                      }
                    }

                    sumaIndividualFacturado = oc.facturado;

                    sumaFacturado += oc.facturado;
                    if(oc.enPOD !== null )
                    {
                      sumaPOD += oc.enPOD;
                      sumaIndividualPOD += oc.enPOD;
                      //oc.cuadrade = true;
                    }
                    else
                    {
                      sumaPOD += oc.enPOD;
                    }

                    if(oc.incidencias.length !== 0)
                    {
                      for (let index2 = 0; index2 < oc.incidencias.length; index2++)
                       {
                        const incidencia = oc.incidencias[index2];
                        //console.log(incidencia)
                        if(incidencia.tipo_incidencia_id == 4)
                        {
                           sumaPOD -=incidencia.cantidad;
                           //console.log(incidencia.cantidad);
                           sumaIndividualPOD = (sumaIndividualPOD - incidencia.cantidad)
                           //console.log(sumaIndividualPOD)
                        }
                        else
                        {
                          sumaPOD += incidencia.cantidad
                          sumaIndividualPOD = (sumaIndividualPOD + incidencia.cantidad)
                        }
                      }
                    }

                    //console.log(sumaIndividualFacturado)
                    //console.log(sumaIndividualPOD)

                    if(sumaIndividualFacturado == sumaIndividualPOD)
                    {
                      oc.cuadrade = true
                    }
                    //Recorremos INCIDENCIAS
                    //console.log('----------')
                    //console.log(oc.incidencias.length)
                 }
                 //console.log(sumaPOD)
                 //console.log(sumaFacturado)
                 //console.log(response.data)
                 setSumaGlobalFacturado(sumaFacturado);
                 setSumaGlobalPOD(sumaPOD);
                 setOcs(response.data)
                 setModalCargando(false);
                
                 if(sumaPOD == sumaFacturado)
                 {
                   setModalCuadre(false);
                 }
                 else
                 {
                  setModalCuadre(true);
                 }
              }).catch(err => 
              {
                console.log(err.response.data)
              });
        } 
        catch (error) 
        {
          
        }
     }

     const [modalComprobacion, setModalComprobacion] = useState(false);
     const [busquedaProducto, setBusquedaProducto] = useState(''); 
     const [productoSeleccionado, setProductoSeleccionado] = useState(null);
     const [modalVerificacion, setModalVerificacion] = useState(false);
     const [productos, setProductos] = useState([]);

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

     const consultarProductos = () =>
     {
        //console.log(busquedaProducto)
        if(busquedaProducto !== '')
        {
          try 
          {
                axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/indexProductos',
                 {params:{
                  busqueda: busquedaProducto,
                 }}).then(response => 
                  {
                     //console.log(busquedaProducto)
                     //console.log(response.data)
                     if(response.data.length > 0)
                     {
                      setProductoSeleccionado(response.data[0])
                      setModalVerificacion(true)
                     }
                     else
                     {
                      Alert.alert('OK', 'No coincide el SKU con ningun registro',
                      [
                        {text:'Aceptar'}
                      ])
                     }
                     
                  }).catch(err => 
                  {
                    console.log(err.response.data)
                  });
              
          } catch (error) {
              
          }
        }
        else
        {
          Alert.alert('Advertencia', 'Ingrese un SKU para buscar algun producto',
          [
            {text:'Aceptar'}
          ])
        }
     }

     const borrarProducto = (id) => 
     {
      if(productos.length !== 0)
      {
         let newProductos =  productos.filter(producto => producto.id !== id );
         setProductos(newProductos);
      }
     }

     const [tipoIncidencias, setTipoIncidencias] = useState([]);
     const [modalEvidencia, setModalEvidencia] = useState(false);
     const [productoForModal, setProductoFormodal] = useState(null);
     const [ocActual, setOcActual] = useState(null)
     useEffect(()=>
     {
        if(modalComprobacion == true) //cuando se abra el modal consultaremos los tipo de incidencia
        {
            axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/checkIncidencias').then(
                response => {
                  //console.log(response.data)
                  setTipoIncidencias(response.data);
                }
              ).catch(err => 
                {
                  console.log(err)
                })
        }
     },[modalComprobacion])

     //Funciones de camara
     const [contador, setContador] = useState(1);
     
     const takePicture = async (item) => 
     {
      setModalGuardando(false);
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
        } else {
          console.log("Camera permission denied");
        }
       } 
       catch (err) 
       {
        console.warn(err);
       }

       //Opciones
       const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 680,
        maxWidth: 440,
      };
  
        launchCamera(options, response => 
          {
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
            setContador(contador + 1);
            newFotoObj.id = contador;

            let localUri = newFotoObj.uri;
            //setPhotoShow(localUri);
            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            let foto = {uri: localUri, name: filename, type}

            item.evidencias.push(foto);
            //console.log(item)
            //setSelectedImage(newFotoObj);
            //console.log(selectedImage);
            //console.log(selectedImage);
            //console.log(imageUri);
            setModalGuardando(false);
          }
        });
     }

     const guardarIncidencias = () => 
     {
       console.log(ocs)
       setOcsTemporales(ocs);
       console.log(ocsTemporales)
      if(productos.length !== 0)
      {
        let evidenciasFaltantes = [];
        for (let index = 0; index < productos.length; index++) 
        {
          const producto = productos[index];
          if(producto.tipo_incidencia_id !== 1) //si es faltante no requiere la evidencia
          {
            if(producto.evidencias.length == 0)
            {
              evidenciasFaltantes.push(producto)
            }
          }
          //console.log(producto.evidencias.length)
        } 

        //console.log(evidenciasFaltantes)

        if(evidenciasFaltantes.length !== 0)
        {
          Alert.alert('Advertencia', 'Todos los campos son requeridos por producto',
          [
            {text:'Aceptar'}
          ])
        }
        else
        {
          let formData = new FormData();
          for (let index = 0; index < productos.length; index++) 
          {
            const producto = productos[index];
            formData.append('data['+index+'][id]', producto.id);
            formData.append('data['+index+'][oc_id]', producto.oc_id);
            formData.append('data['+index+'][tipo_incidencia_id]', producto.tipo_incidencia_id);
            formData.append('data['+index+'][cantidad]', producto.cantidad);
           
            for (let index2 = 0; index2 < producto.evidencias.length; index2++) 
            {
              const evidencia = producto.evidencias[index2];
              formData.append('data['+index+'][evidencias]['+index2+']', evidencia)
              //console.log(evidencia);
            }
          }
           axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/saveIncidencias',formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
           }).then(
            response => 
            {
              //console.log(response.data)
              setProductos([]);
              setContador(1);
              checkOcs();
              setModalComprobacion(false)
            }
            ).catch(err => 
            {
              console.log(err.response.data)
            })
          
        }
      }
     }

     //Borrar incidencia y evidencias
     const borrarIncidenciaFromBD = (id) => 
     {
      axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/eraseIncidenciasWithEvidencias', {params:{
        id: id ,
       }}).then(
        response => {
          setOcsTemporales(ocs)
          //setProductos([]);
          setContador(1);
          checkOcs();
          //console.log(response.data)
          setModalComprobacion(false)
          }
        ).catch(err => 
        {
          console.log(err.response.data)
        })
     }

     //Para guardar ya ocs cuadradas
     const guardarOcs = () => 
     {
        //ya una vex las ocs cuadradas las mandamos a la BD
        //console.log(ocs)
        setOcsTemporales(ocs);
        for (let index = 0; index < ocs.length; index++) 
        {
          const oc = ocs[index];
          if(oc.pod == undefined)
          { 
            oc.pod = null
          }
          //console.log(oc.pod)
        }
        try 
        {
          axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/saveCuadre',
          {params:{
           ocs: ocs,
          }}).then(response => 
           {
              //console.log(busquedaProducto)
              //console.log(response.data)
              if(response.data.length > 0)
              {
                
              }
              else
              {
               Alert.alert('OK', 'OCS cuadradas',
               [
                 {text:'Aceptar'}
               ])
               checkOcs();
               //console.log(ocs)
              }
              
           }).catch(err => 
           {
             console.log(err.response.data)
           });
        } 
        catch (error) 
        {

        }
     }

     //Variables para slide de enrrampe
     const [changeSlide, setChangeSlide] = useState(false);
     const [titleSlide, setTitleSlide]= useState('¿Recolectó folios?');
     const [colorsSlide, setColorsSlide] = useState(['#F5F7F8','#E0E0E0']);
     const [titleColor, setTitleColor] = useState('#9B9B9B');

     const saveHrHoraFolio = () => 
     {
       //console.log(props.route.params)
       try 
       {
          //console.log(props.route.params.dt.confirmacion);
           axios.get('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/savehrFolios', {params:{
             confirmacion: props.route.params.dt.confirmacion,
             status_id: props.route.params.dt.status_id
            }}).then(response => 
             {
               //console.log(response.data)
               Alert.alert('OK', 'Hora de recolección folios guardada',
               [
                 {text:'Aceptar'}
               ]);

               setRecolectoHrFolios(true);
             }).catch(err => 
             {
               console.log(err.response.data)
               setRecolectoHrFolios(false);
               setChangeSlide(!changeSlide);
               setColorsSlide(['#F5F7F8','#E0E0E0'])
               setTitleColor('#9B9B9B');
             });
       } 
       catch (error) 
       {
         
       }    
     }

     //Recibimiento de documentos externos
     const [documento, setDocumento] = useState(null);
     const [tipo_campo_id, setTipoCampoId] = useState(null);
     useEffect(()=> 
     {
      ReceiveSharingIntent.getReceivedFiles((data:any)=> 
      {
        console.log(data);
        setDocumento(data[0])
        setTipoCampoId(14) //el valor delc ampo
      },
      (err:any)=>
      {
        console.log(err);
      });
    
      /*
      return () => 
      {
        ReceiveSharingIntent.clearReceivedFiles();
      }
      */
      
     },[documento])

     //Select Documento
  
     const selectDocument = async (id) => 
     {
         setTipoCampoId(id);
         try 
         {
             const file = await DocumentPicker.pick({
                 type:[DocumentPicker.types.csv, DocumentPicker.types.docx, DocumentPicker.types.pdf],
                 copyTo:'documentDirectory',
             });

             console.log(file)
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
     const [changeSlide2, setChangeSlide2] = useState(false);
     const [titleSlide2, setTitleSlide2]= useState('¿Liberó el viaje?');
     const [colorsSlide2, setColorsSlide2] = useState(['#F5F7F8','#E0E0E0']);
     const [titleColor2, setTitleColor2] = useState('#9B9B9B');

     const liberar = () => 
     {
      if(recolectoHrFolios)
      {
        console.log(sumaGlobalPOD)
        console.log(sumaGlobalFacturado)
       if(sumaGlobalFacturado == sumaGlobalPOD)
       { 
         setModalGuardando(true);
         //console.log('se puede liberar')
         let hrs = date.getHours() 
         let min = date.getMinutes();
         if(hrs < 10)
         {
            hrs = '0' + hrs
         }
         let time = hrs+':'+min+':00'
         //Una vez la hr con el num
          const formData = new FormData();
          //añadimos la info a enviar al formadata
          formData.append('tipo_campo_file', tipo_campo_id);
          //Validacion para seccionar el documento dependiendo
          if(documento.fileCopyUri) //esto es si se selecciona dentro de la app
          {
            formData.append('file',{
              uri:documento.fileCopyUri,
              type:documento.type,
              name:documento.name,
            });
          }
          else //es externo
          {
            formData.append('file',{
              uri:documento.contentUri,
              type:documento.mimeType,
              name:documento.fileName,
            });
          }

          //formData.append('dt',props.route.params.dt.dt_id);
          formData.append('usuario',props.route.params.usuario);
          formData.append('confirmacion',props.route.params.dt.confirmacion);
          //formData.append('valores', valores);
          formData.append('horaImpresion', time);
          formData.append('status_id',props.route.params.dt.status_id);
          formData.append('confirmacion_id', props.route.params.dt.id);
          //console.log(valores)

          try 
          {
            axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/valoresLiberacion',
            {params:{
             valores: valores,
             horaImpresion: time,
             confirmacion: props.route.params.dt.confirmacion,
             confirmacion_id:props.route.params.dt.id,
             status_id: props.route.params.dt.status_id,
             usuario:props.route.params.usuario,
             dt:props.route.params.dt.dt_id
            }}).then(response => 
             {
                //console.log(busquedaProducto)
                //console.log(response.data)
                axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/saveDocEnrrampe',
                formData,{
                  headers:{
                    'Content-Type': 'multipart/form-data'
                  }
                  }).
                then(response => 
                {
                  console.log(response.data)
                  setContador(1);
                  setDate(new Date());
                  setValores([]);
                  setDocumento(null);
                  setTipoCampoId(null);
                  setSumaGlobalFacturado(1);
                  setSumaGlobalPOD(0);
                  setOcActual(null);
                  setProductoFormodal(null);
                  setRecolectoHrFolios(false);
                  setChangeSlide2(false);
                  setTitleSlide2('¿Liberó viaje?')
                  setColorsSlide2(['#F5F7F8','#E0E0E0'])
                  setTitleColor2('#9B9B9B');
                  setModalGuardando(false);
                  goBack();
                  setModalGuardando(false);
                })
             }).catch(err => 
             {
               setModalGuardando(false);
               setChangeSlide2(false);

               setTitleSlide2('¿Liberó viaje?')
     
               setColorsSlide2(['#F5F7F8','#E0E0E0'])
     
               setTitleColor2('#9B9B9B');
               console.log(err.response.data)
             });
          } 
          catch (error) 
          {
            console.log(err.response.data)
          }
         //console.log(valores) 
       }
       else
       {
        Alert.alert('ALERTA', 'NO SE HA HECHO EL CUADRE CORRECTAMENTE',
        [
          {text:'Aceptar'}
        ])
        setChangeSlide2(false);

        setTitleSlide2('¿Liberó viaje?')

        setColorsSlide2(['#F5F7F8','#E0E0E0'])

        setTitleColor2('#9B9B9B');
       }
      }
      else
      {
        Alert.alert('ALERTA', 'NO SE HA REGISTRADO LA HR DE FOLIOS',
        [
          {text:'Aceptar'}
        ]);
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

     const [horaImpresionShow, setHoraDeImpresionShow] = useState(false);

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
       <View style={{flexDirection:'row', alignItems:'center', marginBottom:10,alignContent:'center'}}>
          <Pressable style={{marginLeft:15}}  onPress={()=>{goBack()}}>
           <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
          </Pressable>
          <Text style={styles.title}>Desenrrampe</Text>
       </View>
       <View style={{marginVertical:10, marginHorizontal:15}}>
         <Text style={{color:'black', fontSize:15}}>
          <Text style={{fontWeight:'bold'}}>Confirmación: </Text>
          {props.route.params.dt.confirmacion} - {props.route.params.dt.plataforma}
         </Text>
       </View>
       <View style={{marginHorizontal:18}}> 
       {
        /*
          <SlideButton
            onReachedToEnd={()=> //al finalizar
              {
                saveHrHoraFolio();
             }} 
             onReachedToStart={()=>{ 
                
             }}
             reverseSlideEnabled={true}
             containerStyle={styles.timerButton}
             title="¿Recolecto folios?"
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
               thumbIconImageSource={arrow_rigth}
               enableReverseSwipe={false}
               railBackgroundColor='transparent'
               railFillBackgroundColor='transparent'
               railStyles={{borderWidth:0}}
               onSwipeSuccess={()=>
               {
                  setChangeSlide(true);

                  setColorsSlide(['#56D0C1','#48BFB1'])

                  setTitleColor('white');
  
                  saveHrHoraFolio();
               }}
               shouldResetAfterSuccess={false}
             />
        </LinearGradient>
       </View>
       <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
         <Pressable onPress={()=>{
             setHoraDeImpresion(true);
             setHoraDeImpresionShow(true);
           }} style={styles.impresionButton}>
            <Image style={{width:25, height:25}} source={require('../assets/img/reloj-de-pared.png')} />
             {
               horaImpresionShow ? 
               <View>
                  {
                    JSON.stringify(date.getUTCMinutes()).length == 2
                    ?
                    <View>
                      <Text style={{color:'white',marginHorizontal:10, fontWeight:'bold'}}>
                        {JSON.stringify(date.getHours())+ ':' +JSON.stringify(date.getUTCMinutes())}
                      </Text>
                    </View>
                    :
                    <View>
                      <Text style={{color:'white',marginHorizontal:10, fontWeight:'bold'}}>
                        {JSON.stringify(date.getHours()) + ':0'+JSON.stringify(date.getUTCMinutes())}
                        </Text>
                    </View>
                  }
               </View>
               :
               <View>
                <Text style={{color:'white', fontSize:12, marginHorizontal:5, fontWeight:'bold'}}>Hora de impresión</Text>
               </View>
             }
             
          </Pressable>
          <View>
            {
              sumaGlobalFacturado == sumaGlobalPOD ?
              <Pressable onPress={()=>{
                
              }} style={[styles.cuadrarButton,{backgroundColor:'#56D0C1'}]}>
                 <Text style={{textAlign:'center', color:'white', fontWeight:'bold'}}>Cuadrar viajes</Text>
              </Pressable>
              :
              <Pressable onPress={()=>{
                checkOcs()
                setModalCargando(true);
             }} style={styles.cuadrarButton}>
                  <Text style={{textAlign:'center', color:'white', fontWeight:'bold'}}>Cuadrar viajes</Text>
              </Pressable>
            }
          </View>
       </View>
       <Modal 
             visible={modalCargando}
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
                     Consultando...
                   </Text>  
                </View>
        </Modal>
       <Modal visible={modalCuadre} animationType="slide">
          <View style={{marginVertical:30}}>
            {
              /*
              <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
                <Pressable onPress={()=>{setModalCuadre(false)
                                      setVisible(false)
                       }}>
                    <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
                </Pressable>
              </View>
              */
            }
            <View>
                <View style={styles.row}>
                   <Text style={[styles.cell,{color:'#9B9B9B'}]}>OC</Text>
                   <Text style={[styles.cell,{color:'#9B9B9B'}]}>Facturado</Text>
                   <Text style={[styles.cell,{color:'#9B9B9B'}]}>En POD</Text>
                   <View style={[styles.cell,{color:'#9B9B9B'}]}>
                      <Pressable style={{backgroundColor:'#1bbf52', borderRadius:15, marginHorizontal:4}} onPress={()=>{
                         if(visible == true)
                         {
                            setVisible(false)

                         }
                         else
                         {
                            setVisible(true)
                         }
                         //console.log(visible)
                         setVisible(true)

                         //check ocs
                         if(ocs.length !== 0)
                         {
                           let sumaPOD = 0;
                           let sumaFacturado = 0;

                           for (let index = 0; index < ocs.length; index++) 
                           {
                             const oc   = ocs[index];
                             //console.log(oc)
                             if(oc.enPOD !== null)
                             {
                               sumaPOD += oc.enPOD
                             }
                             else
                             {
                               sumaPOD += parseInt(oc.pod);
                             }
                            
                             sumaFacturado += oc.facturado;
                             
                             if(oc.incidencias.length !== 0)
                             {
                              for (let index2 = 0; index2 < oc.incidencias.length; index2++) 
                              {
                               const incidencia = oc.incidencias[index2];
                               //console.log(incidencia)
                               //Si es una incidencia sobrante se resta
                               if(incidencia.tipo_incidencia_id == 4)
                               {
                                sumaPOD -= incidencia.cantidad;
                               }
                               else
                               {
                                sumaPOD += incidencia.cantidad;
                               }
                              }
                             }
                             
                           }

                           console.log(sumaPOD)
                           console.log(sumaFacturado)

                           if(sumaPOD == sumaFacturado)
                           {
                            //console.log('cuadra')
                             setCuadrado(true)
                           }
                           else
                           {
                           // console.log('no cuadra')
                            setCuadrado(false)
                           }
                         }

                        }}>
                        <Text style={{color:'white', textAlign:'center', paddingVertical:2}}>Verificar</Text>
                      </Pressable>
                   </View>
                </View>
                <FlatList 
                scrollEnabled
                data={ocs}
                keyExtractor={(item) => item.id }
                renderItem={({item}) =>             
                 {
                   return (
                     <View style={[styles.row,{borderBottomWidth:1, borderBottomColor:'#F0F0F0'}]}>
                      
                        <Text style={styles.cell}>{item.referencia}</Text>
                        <View style={styles.cell}>
                          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                            <Image style={{width:16, height:15, marginRight:10}} source={require('../assets/img/cajas.png')} />
                            <Text style={{color:'black'}}>
                             {item.facturado}
                            </Text> 
                          </View>
                        </View>
                        <View style={[styles.cell,{height:65, justifyContent:'center', alignItems:'center'}]}>
                          {
                            item.enPOD == null ? 
                            <View>
                               <TextInput 
                               keyboardType='numeric'
                               
                               onChangeText={(newText)=> 
                               {
                                 let cantidadIngresada = parseInt(newText)
                                 //console.log(cantidadIngresada)
                                 let totalFacturado = item.facturado;
                                 let totalEnPod = cantidadIngresada;
                                 if(item.incidencias.length !== 0)
                                 {
                                   for (let index = 0; index < item.incidencias.length; index++) 
                                   {
                                    const incidencia = item.incidencias[index];
                                    if(incidencia.tipo_incidencia_id == 4 )
                                    {
                                      totalEnPod -= incidencia.cantidad;
                                    }
                                    else
                                    {
                                     totalEnPod += incidencia.cantidad;
                                    }
                                   }
                                 }

                                 //Validamos la igualdad de cuadre
                                 //console.log(totalFacturado)
                                 //console.log(totalEnPod)
                                 if (totalFacturado == totalEnPod) 
                                 {
                                  item.cuadrade = true;
                                  item.pod = newText
                                 }
                                 else
                                 {
                                  item.cuadrade = false;
                                  item.pod = newText
                                 }
                                 setVisible(false)
                                 setOcsTemporales(ocs)
                               }}
                               style={{backgroundColor:'#F5F7F8', width:63, borderRadius:15, color:'black', fontSize:12}} /> 
                            </View>
                            : 
                            <View>
                               <Text style={{color:'black'}}>{item.enPOD}</Text>
                            </View>
                          }   
                        </View>
                        <View style={[styles.cell,{justifyContent:'center', alignContent:'center',marginTop:-15,marginRight:0, marginLeft:25}]}>
                          <View style={{flexDirection:'row', justifyContent:'center', alignContent:'space-between'}}>
                              {
                              visible == true ? 
                              <View > 
                                 {
                                    item.cuadrade == false  ?
                                    <Pressable onPress={()=>{
                                        setModalComprobacion(true)
                                        setOcActual(item.id)
                                    }} style={{backgroundColor:'#F25B77', borderRadius:30, justifyContent:'center', alignItems:'center', paddingVertical:10, paddingHorizontal:15 }}>  
                                      <Image style={{width:5, height:20}} source={require('../assets/img/signo_adv_white.png')} />                              
                                    </Pressable>
                                     :
                                    <View style={{backgroundColor:'#F5F7F8', borderRadius:30, justifyContent:'center', alignItems:'center', paddingVertical:10, paddingHorizontal:15 }}>
                                      <Image style={{width:5, height:20}} source={require('../assets/img/sign_adv_gris.png')} />
                                    </View>
                                 }
                              </View>
                              : null
                            }
                            <View style={{marginHorizontal:6}}>
                              {
                                item.incidencias !== null ?
                                <View>
                                  {
                                    /** 
                                     *    <CantidadIncidencias incidencias={item.incidencias} />
                                    */
                                  }
                                </View>
                                :
                                <View>
                                  <Text style={{color:'black'}}>0</Text>
                                </View>
                              }
                            
                            </View>
                          </View>
                       </View>
                     </View>
                   )
                   }
                 }
                />
                <Modal visible={modalComprobacion} animationType="slide">
                    <View>
                       <View style={{justifyContent:'center',alignContent:'center', margin:15}}>
                        <Pressable onPress={()=>{setModalComprobacion(false)
                                 setContador(1);
                                 setProductos([]);
                              }}>
                           <Image style={{width:30, height:20}} source={require('../assets/img/flecha_back.png')} />
                        </Pressable>
                        <View style={{flexDirection:'row', justifyContent:'space-evenly', borderBottomWidth:1, paddingVertical:5, borderColor:'#F5F5F5'}}>
                            <TextInput
                             onChangeText={(newText)=>{
                                 setBusquedaProducto(newText)
                             }}
                             placeholder='SKU' placeholderTextColor={'#9B9B9B'} keyboardType='numeric'  style={{width:150, borderRadius:20, backgroundColor:'#F5F5F5', color:'#9B9B9B'}}>
                            </TextInput>
                            <Pressable onPress={()=>{
                                consultarProductos()
                            }} style={{backgroundColor:'#249DF2', marginHorizontal:50, padding:10, borderRadius:15, flexDirection:'row', justifyContent:'center',alignItems:'center'}}>
                                <Text style={{textAlign:'center', color:'white', marginHorizontal:2}}>Buscar</Text>
                                <Image style={{width:18, height:20, marginHorizontal:5, marginTop:5}} source={require('../assets/img/icono-busqueda.png')} />
                            </Pressable>
                        </View>
                        <View style={{marginVertical:15}}>
                            <View style={[styles.row,{borderBottomWidth:1, borderColor:'#F5F5F5', paddingBottom:15,marginBottom:5}]}>
                               <Text style={[styles.cell, {color:'#9B9B9B'}]}>SKU</Text>
                               <Text style={[styles.cell, {color:'#9B9B9B'}]}>Tipo</Text>
                               <Text style={[styles.cell, {color:'#9B9B9B'}]}>Cantidad</Text>
                               <View style={[styles.cell, {color:'#9B9B9B'}]}>
                                  <Text style={{ textAlign: "center",fontSize: 12,color: "#9B9B9B",}} >
                                    Evidencia</Text>
                                  <Text style={{ textAlign: "center",fontSize: 12,color: "#9B9B9B",}} >Incidencia</Text>
                               </View>     
                            </View>
                               {
                                 productos.length > 0 ?
                                    <FlatList
                                       scrollEnabled
                                       data={productos}
                                       keyExtractor={(item) => item.id }
                                       renderItem={({item}) =>             
                                       {
                                         return (
                                            <View style={[styles.row,{borderBottomWidth:1, borderColor:'#F5F5F5', paddingVertical:30,marginBottom:5}]}>
                                              <View style={[styles.cell,{flexDirection:'row'}]}>
                                                  <Pressable style={{backgroundColor:'#E86881', justifyContent:'center', paddingHorizontal:6,  borderRadius:10, paddingVertical:18}} onPress={()=>{
                                                    borrarProducto(item.id)
                                                  }} >
                                                    <Image style={{width:16, height:19}} source={require('../assets/img/eliminar.png')} />
                                                  </Pressable>
                                                  <Text style={[styles.cell,{fontSize:14}]}>{item.SKU}</Text>
                                              </View>
                                               <View style={[styles.cell]}>
                                                   <DropdownSelect
                                                    placeholderStyle={{
                                                        fontSize:10,
                                                        margin:0,
                                                        padding:0
                                                    }}  
                                                    onValueChange={(itemValue) => 
                                                      {
                                                      item.tipo_incidencia_id = itemValue 
                                                      setVisibleFoto(!visibleFoto);
                                                       }  
                                                    }
                                                    placeholder="TODOS"
                                                    dropdownStyle={{
                                                      borderWidth: 0,
                                                      borderColor:'black',
                                                      width:'100%',
                                                      padding:0,                                                
                                                    }}
                                                    dropdownContainerStyle={{
                                                        marginTop:-20
                                                    }}
                                                    checkboxStyle={{
                                                      backgroundColor: '#1D96F1',
                                                      borderRadius: 30, // To get a circle - add the checkboxSize and the padding size
                                                      padding: 5,
                                                      borderColor:'white'
                                                    }}
                                                    optionLabel={'nombre'}
                                                    optionValue={'id'}
                                                    checkboxLabelStyle={{ color: 'black', fontSize: 15, fontFamily:'Montserrat-Medium' }}
                                                    options={tipoIncidencias}
                                                    selectedValue={item.tipo_incidencia_id}
                                                    listHeaderComponent={
                                                      <View style={{alignItems:'center'}}>
                                                        <Text style={{color:'black', fontSize:20, fontFamily:'Montserrat-Medium'}} >
                                                          Tipo de incidencias
                                                        </Text>      
                                                      </View>
                                                    }  
                                                    >
                                                  </DropdownSelect>
                                               </View>
                                               <View style={[styles.cell,{height:'100%', marginHorizontal:10}]}>
                                                  <TextInput onChangeText={(newText)=>{item.cantidad = newText}}  defaultValue='0' keyboardType='numeric' placeholder='Cantidad' placeholderTextColor={'black'} style={{backgroundColor:'#F9F9F9', borderRadius:15, color:'black'}} >      
                                                  </TextInput>
                                               </View>
                                               {
                                                item.tipo_incidencia_id !== 1 ?
                                                 <View style={styles.cell}>
                                                   <Pressable onPress={()=>{takePicture(item) }}  style={[{backgroundColor:'orange', justifyContent:'center', alignItems:'center',paddingVertical:15, borderRadius:30}]}>
                                                     <Image style={{width:26, height:20,}} source={require('../assets/img/icono-foto.png')} />
                                                   </Pressable>
                                                 </View>
                                                 : null
                                               }
                                              
                                            </View>
                                         )
                                       }}
                                    />
                                 :
                                 <View>
                                    <Text style={{color:'black', textAlign:'center'}}>No se han agregado elementos</Text>
                                 </View>
                               }
                              <Pressable onPress={()=>{
                               // console.log(productos)
                                guardarIncidencias()
                               }} style={{backgroundColor:'#249DF2', marginHorizontal:50, padding:10, borderRadius:15}}>
                                <Text style={{textAlign:'center', color:'white'}}>Guardar</Text>
                              </Pressable>
                               {
                                <View style={{marginVertical:15}}>
                                  <Text style={{color:'black', textAlign:'center', fontWeight:'bold', fontSize:15 ,marginVertical:10}}>Incidencias hechas</Text>
                                  <FlatList 
                                  scrollEnabled
                                  data={ocs}
                                  keyExtractor={(item) => item.id }
                                  renderItem={({item}) =>             
                                   {
                                     return (
                                      <View>
                                         {
                                           item.id == ocActual ?
                                           <View>
                                              <FlatList 
                                              scrollEnabled
                                              data={item.incidencias}
                                              keyExtractor={(item) => item.id }
                                              renderItem={({item}) =>             
                                               {
                                                 return (
                                                     <View style={styles.row}>
                                                      <View style={[styles.cell,{padding:0}]}>
                                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
                                                          <Pressable style={{backgroundColor:'#E86881', justifyContent:'center', paddingHorizontal:10,  borderRadius:10, paddingVertical:5}} 
                                                           onPress={()=>{borrarIncidenciaFromBD(item.id)}} >
                                                             <Image style={{width:13, height:17}} source={require('../assets/img/eliminar.png')} />
                                                         </Pressable>
                                                         <Text style={{color:'black'}}>{item.sku}</Text>
                                                        </View>
                                                      </View>
                                                      <Text style={[styles.cell,{fontSize:16}]}>{item.tipo_incidencia}</Text>
                                                      <Text style={[styles.cell,{fontSize:16}]}>{item.cantidad}</Text>
                                                     </View>
                                                 )
                                               }
                                              }
                                              />
                                           </View>
                                           :null
                                         }
                                      </View>
                                     )
                                   }
                                  }
                                  />
                                </View>
                               }

                        </View>
                      </View>
                    </View>
                </Modal>
                {
                    productoSeleccionado !== null ?
                    <View>
                       <Modal transparent animationType="fade" visible={modalVerificacion}> 
                          <View style={{backgroundColor:'white', height:250, width:250,  marginHorizontal:80, marginVertical:150, borderRadius:50, shadowColor: "#000",
                               shadowOffset: {
                               	width: 0,
                               	height: 2,
                               },
                               shadowOpacity: 0.25,
                               shadowRadius: 3.84,
                               
                               elevation: 5,}}> 
                              <View style={{marginVertical:10, justifyContent:'center'}} >
                                 <Text style={{color:'black', fontWeight:'bold', textAlign:'center'}}>Información del producto</Text>
                                 <Text style={{color:'#9B9B9B', textAlign:'center', marginVertical:5}}>SKU: {productoSeleccionado.SKU}</Text>
                                 <Text style={{color:'#9B9B9B', textAlign:'center', marginVertical:5}}>EAN: {productoSeleccionado.EAN}</Text>
                                 <Text style={{color:'#9B9B9B', textAlign:'center', marginVertical:5}}>Desc: {productoSeleccionado.descripcion}</Text>
                              </View>
                              <View style={{flexDirection:'row', justifyContent:'space-evenly', marginTop:35}}>
                                  <Pressable onPress={()=> 
                                {
                                     setModalVerificacion(false)
                                     setProductoSeleccionado(null);
                                }}>
                                      <Text style={{color:'black'}}>Cancelar</Text>
                                  </Pressable>
                                  <Pressable onPress={()=> {
                                       if(productos.length === 0)
                                       {
                                       // objetos.push(newObj)
                                       productoSeleccionado.evidencias = [];
                                       productoSeleccionado.oc_id = ocActual;
                                       productoSeleccionado.cantidad = 0;
                                       productoSeleccionado.tipo_incidencia_id= -1;
                                        setProductos([
                                          ...productos, productoSeleccionado
                                        ])
                                       }
                                       else
                                       {
                                         let x = 0;
                                         for (let index = 0; index < productos.length; index++) 
                                         {
                                          const element = productos[index];
                                          //console.log(element)
                                          if(element.SKU === productoSeleccionado.SKU )
                                          {
                                               x = 1
                                              element.SKU = productoSeleccionado.SKU
                                          }
                                         }
                                        

                                         if(x==0)
                                         { 
                                           //console.log(newObj)
                                           //objetos.push(newObj)
                                           productoSeleccionado.evidencias = [];
                                           productoSeleccionado.oc_id = ocActual;
                                           productoSeleccionado.cantidad = 0;
                                           productoSeleccionado.tipo_incidencia_id= -1;
                                           setProductos([
                                            ...productos, productoSeleccionado
                                           ])
                                         }
                                         
                                       }
                                     setModalVerificacion(false)
                                  }}>
                                      <Text style={{color:'black'}}>Agregar</Text>
                                  </Pressable>
                               </View>
                          </View>
                       </Modal>
                    </View>
                    : null
                }
                <View style={{justifyContent:'center'}}>
                    {
                        cuadrado == true ?
                        <View>
                            <Pressable onPress={()=>{
                               guardarOcs()
                            }} style={{backgroundColor:'#249DF2', marginHorizontal:50, padding:10, borderRadius:15}}>
                                <Text style={{textAlign:'center', color:'white'}}>Guardar OCS</Text>
                            </Pressable>
                        </View>
                        : null
                    }
                    
                </View>
            </View>
            
          </View>
       </Modal>
       <DatePicker
        title={'Marca la hr de folio'}
        modal
        open={horaDeImpresion}
        date={date}
        mode={'time'}
        onConfirm={(date) => {
          setHoraDeImpresion(false)
          setDate(date)
        }}
        onCancel={() => {
          setHoraDeImpresion(false)
        }}
      />
      {
        /*
              <Text>{JSON.stringify(date)}</Text>
        */ 
      }
       <View>
       <FlatList 
              scrollEnabled
              data={campos}
              keyExtractor={(item) => item.id }
              renderItem={({item}) =>    
              {
                return (
                    <View>
                        {
                          item.tipo_campo == 'text' ?
                            <View style={{marginHorizontal:15, backgroundColor:'#F5F5F5', marginVertical:5, borderRadius:15, padding:10, height:220}}>
                              <View style={{flexDirection:'row', alignItems:'center' }}>
                                <Image style={{width:20, height:18, marginHorizontal:5}} source={require('../assets/img/comentarios.png')} />
                                <Text style={{color:'#9B9B9B'}}>
                                    {item.nombre}
                                 </Text>
                              </View>
                               <TextInput style={{color:'black'}} multiline = {true}   onChangeText={(newText)=>
                               {
                                  let newObj = {campo_id: item.id , value: newText}
                                  //console.log(newObj)
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
                            :null
                        }
                        {
                           item.tipo_campo == 'file' ?
                           <View style={{marginHorizontal:15, backgroundColor:'#697FEA', marginVertical:5, borderRadius:15, padding:10,}}>
                              <Pressable style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}} onPress={()=>{selectDocument(item.id)}}>
                                 <Image style={{width:18, height:18, marginRight:10}} source={require('../assets/img/DOCS.png')} />
                                 <Text style={{color:'white', textAlign:'center'}}>
                                    {item.nombre} 
                                  </Text>
                              </Pressable>
                              {
                                documento !== null ?
                                <View style={{flexDirection:'row', justifyContent:'center'}}>
                                  {
                                    documento.name ? 
                                      <View>
                                        <Text style={[styles.text,{color:'white'}]}>{documento.name}</Text>
                                      </View>
                                    :
                                    <View>
                                      <Text style={[styles.text,{color:'white'}]}>{documento.fileName}</Text>
                                    </View>
                                  }
                                   
                                </View> 
                                : null
                              }
                           </View>
                           :null
                        }
                    </View>
                )
              }
             }
          />
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
       <View style={{marginHorizontal:10, marginVertical:8}}> 
       {
        /*
          <SlideButton
            onReachedToEnd={()=> 
             {
                liberar();
             }} 
             onReachedToStart={()=>{
                
             }}
             containerStyle={styles.timerButton}
             title="¿Liberar?"
             autoReset={true}
            />
        */ 
       }
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
                  if(recolectoHrFolios)
                  {
                    setChangeSlide2(!changeSlide2);
                    setTitleSlide2('Viaje liberado')
                    setColorsSlide2(['#1D96F1','#96DCFF'])
                    setTitleColor2('white');
                    setIsSlide(true)
                    liberar();
                  }
                  else
                  {
                    setChangeSlide2(!changeSlide2);
                    setTitleSlide2('¿Liberar viaje?');
                    setColorsSlide2(['#F5F7F8','#E0E0E0'])
                    setTitleColor2('#9B9B9B');
                    Alert.alert('ALERTA', 'NO SE HA REGISTRADO LA HR DE FOLIOS',
                    [
                      {text:'Aceptar'}
                    ]);
                  }  
                }}
                shouldResetAfterSuccess={true}
              />
          </LinearGradient>
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
   cuadrarButton:
    {
      backgroundColor:'#249DF2',
      marginVertical:10,
      alignItems:'center',
      borderRadius:30, 
      paddingVertical:15,
      paddingHorizontal:30,
      marginHorizontal:10
    },
   impresionButton:
   {
     backgroundColor:'#44BFFC',
     alignItems:'center',
     borderRadius:30, 
     width:150,
     paddingVertical:15,
     flexDirection:'row',
     justifyContent:'center',
     marginHorizontal:10
   },
   text:
   {
     textAlign:'center',
     color:'black'
   },
   row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
 },
  cell: {
    flex: 1,
    padding: 0,
    width: 15,
    height: 25,
    textAlign: "center",
    fontSize: 12,
    color: "black",
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
export default Desenrrampe

