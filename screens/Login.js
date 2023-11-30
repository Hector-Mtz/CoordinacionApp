import React, {useState, useEffect} from 'react'
import {View, Text, StyleSheet, Pressable, Alert, ImageBackground, Image, ActivityIndicator, BackHandler} from 'react-native'
import { TextInput } from 'react-native-gesture-handler';
import axios from 'axios'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Login = (
  
) => {
  const navigate = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => 
  {
    const obtenerDatosStorage = async () => 
    {
      const emailStorage = await AsyncStorage.getItem('email')
      //console.log(emailStorage)
      const passStorage = await AsyncStorage.getItem('password')
      //console.log(passStorage)
      //Recupera lo del storage
      if(emailStorage !== '' || passStorage !== '' )
      {
        setEmail(emailStorage)
        setPassword(passStorage)
      }
    }
    obtenerDatosStorage()
  },[])

  const [clicked, setClicked] = useState(false);
  const login = async () => 
  {
    setClicked(true);
    if(email === '' ||  password === '')
    {
      Alert.alert('ERROR', 'Los campos son requeridos', [
       {text:'Aceptar'}
      ])
      setClicked(false)
    }
    else
    {
      axios.post('https://coordinaciondestinoweb-4mklxuo4da-uc.a.run.app/api/sanctum/token',{
        email: email,
        password:password,
        device_name:'movil'
       }).then((response) =>
       {
          navigate.navigate('Inicio',{data:response.data});
          saveEmailStorage(email)
          savePassStorage(password)
          setClicked(false)
       }).catch((error) => 
       {
          console.log(error)
          Alert.alert('ERROR', 'Las credenciales son erroneas o no tiene acceso a internet' , [{
            text:'OK'
          }])
          setClicked(false)
       })
    }
  }

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Alerta', '¿Desea cerrar la aplicación?', [
        {
          text: 'Cancelar',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'Salir', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);


  const saveEmailStorage = async (email) => 
  {
    try 
    {
      await AsyncStorage.setItem('email', email);
    } catch (e) 
    {
      // saving error
    }
  }

  const savePassStorage = async (password) => 
  {
    try 
    {
      await AsyncStorage.setItem('password', password);
    } catch (e) 
    {
      // saving error
    }
  } 
  return (
  <ImageBackground source={require('../assets/img/login.png')} style={{flex:1}}>
    <View style={styles.container}>
      <View style={{justifyContent:'center', alignItems:'center', marginTop:25}}>
        <Image style={{width:140, height:40}} source={require('../assets/img/logo_coorsa.png')} />
      </View> 
      <View style={{alignItems:'center'}}>
         <Text style={{color:'#A1DEFC', textTransform:'uppercase', letterSpacing:2, fontSize:20}}>Plataforma</Text>
         <View>
           <Text style={{textAlign:'center', color:'white', textTransform:'uppercase', fontWeight:'bold', fontSize:35}}>
              Coordinador
           </Text>
           <Text style={{textAlign:'center', color:'white', textTransform:'uppercase',fontWeight:'bold', fontSize:35}}>
            De Plataforma
           </Text>
         </View>
      </View>
      <View style={{backgroundColor: 'white', borderTopRightRadius:20, borderTopLeftRadius:20}}>
          <Text style={{textAlign:'center', paddingVertical:35, textTransform:'uppercase', color:'#1A1E3A', fontSize:25, letterSpacing:2}}>Bienvenido</Text>
          <TextInput placeholder='USUARIO' keyboardType='email-address' value={email} placeholderTextColor={'#1A1E3A'} style={styles.input} onChangeText={(newText)=> {setEmail(newText)}} />
          <TextInput secureTextEntry={true} value={password} placeholder='CONTRASEÑA' placeholderTextColor={'#1A1E3A'} style={styles.input} onChangeText={(newText)=> {setPassword(newText)}} />
          <Pressable onPress={()=>{login()}} style={styles.button}>
             <Text style={[styles.text,{color:'white', fontSize:15}]}>Iniciar sesión</Text>
             {
               clicked ? 
               <View>
                  <ActivityIndicator size="large" color="white" style={{ transform: [{ scaleX: 0.5 }, { scaleY: 0.5 }] }} />
               </View>
               :null
             }
          </Pressable>
      </View>
    </View>
  </ImageBackground>
  )
}

const styles = StyleSheet.create({
   container:
   {
     flex:1,
     justifyContent:'space-between',
   },
   input:
   {
     textAlign:'justify',
     borderColor:'white',
     borderWidth:1,
     margin:5,
     borderRadius:15,
     color:'#1A1E3A',
     backgroundColor:'#F5F7F8',
     marginHorizontal:35,
   },
   button:
   {
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#1D96F1',
    marginHorizontal:35,
    borderRadius:15,
    paddingVertical:18,
    paddingHorizontal:5,
    marginVertical:20,
   },
   text:
   {
    textAlign:'center',
    color:'black'
   }
});

export default Login
