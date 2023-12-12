import React, {useState, useEffect} from 'react'
import {View, Text, StyleSheet, Pressable, Alert, ImageBackground, Image, ActivityIndicator, BackHandler} from 'react-native'
//import { TextInput } from 'react-native-gesture-handler';
import axios from 'axios'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HelperText, TextInput, Button } from 'react-native-paper';
import { fromLeft } from 'react-navigation-transitions';

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
    console.log('hola')
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

  const hasErrorsUser = () =>  //errores de retorno para el input de usuarios
  {
    if(!email.includes('@'))
    {
      return true;
    }
    else
    {
      return false
    }
  };

  const hasErrorsPass = () => 
  {
    if(password.length <= 4)
    {
      return true
    }
    else
    {
      return false
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
          <TextInput label='Usuario' keyboardType='email-address' value={email} selectionColor='#1D96F1'  activeUnderlineColor='#1D96F1' style={styles.input} onChangeText={(newText)=> {setEmail(newText)}} />
          <HelperText type="error" style={{marginHorizontal:25}} visible={hasErrorsUser()}>
             Email no valido, requiere "@".
          </HelperText>
          <TextInput secureTextEntry={true} value={password} label='Contraseña' selectionColor='#1D96F1' activeUnderlineColor='#1D96F1'  style={styles.input} onChangeText={(newText)=> {setPassword(newText)}} />
          <HelperText type="error" style={{marginHorizontal:25}} visible={hasErrorsPass()}>
             La contraseña debe ser mayor a 4 carácteres.
          </HelperText>
          <Button mode="contained"  onPress={()=>{login()}} buttonColor="#1D96F1" loading={clicked} icon='login' style={styles.button}>
             Iniciar sesión
          </Button>
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
     backgroundColor:'transparent',
     marginHorizontal:35,
   },
   button:
   {
    marginHorizontal:30,
    borderRadius:50,
    paddingVertical:8,
    paddingHorizontal:5,
    marginVertical:10,
   },
   text:
   {
    textAlign:'center',
    color:'black'
   }
});

export default Login
