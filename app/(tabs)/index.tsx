import { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // pede permissão assim que o app inicia
    (async () => {
      if (!Device.isDevice) {
        Alert.alert('Use um dispositivo real para notificações push');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permissão negada para notificações!');
        return;
      }

      setHasPermission(true);

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log('Expo Push Token:', token);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    })();
  }, []);

  const showToken = () => {
    if (expoPushToken) {
      Alert.alert('Expo Push Token', expoPushToken);
    } else {
      Alert.alert('Token ainda não disponível');
    }
  };

  const triggerLocalNotification = async () => {
    if (!hasPermission) {
      Alert.alert('Não há permissão para notificações');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação Local',
        body: 'Esta é uma notificação local de teste!',
      },
      trigger: null, // dispara imediatamente
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Mostrar Token" onPress={showToken} />
      <View style={{ height: 20 }} />
      <Button title="Notificação Local" onPress={triggerLocalNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
