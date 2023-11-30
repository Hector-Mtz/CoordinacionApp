import React,{useState} from 'react'
import { View,Text } from 'react-native'

function CantidadIncidencias(
    incidencias
) {
    const [suma, setSuma] = useState(0);
    let newSuma = 0;
    for (let index = 0; index < incidencias.incidencias.length; index++) 
    {
        const incidencia = incidencias.incidencias[index];
        newSuma = suma +incidencia.cantidad;
    }
   

  return (
    <View>
       <Text>
          {newSuma}
       </Text>
    </View>
  )
}

export default CantidadIncidencias
