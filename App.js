import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import Start from './components/Start';
import Chat from './components/Chat';
import ImageView from './components/ImageView';
import { useNetInfo } from '@react-native-community/netinfo';

const Stack = createNativeStackNavigator(); // TODO: #8 Move this into the component

export default function App() {
    const firebaseConfig = { // TODO: #9 Move this to a .env file
        apiKey: "AIzaSyDRSxeQUA8YVYvnVHWJhot2qCQpCPKfFMk",
        authDomain: "chat-app-f2fc3.firebaseapp.com",
        projectId: "chat-app-f2fc3",
        storageBucket: "chat-app-f2fc3.appspot.com",
        messagingSenderId: "386183351873",
        appId: "1:386183351873:web:c61abc0b438bbf7aba00c0",
        measurementId: "G-H3W1V4E5M7"
    };
    const [analytics, setAnalytics] = React.useState(null);
    const [isConnected, setIsConnected] = React.useState(true);
    const connectionStatus = useNetInfo();
    let fbApp, fbAuth, fbMsgDb, fbStorage;

    React.useEffect(() => {
        setIsConnected(!!connectionStatus.isConnected);
        (!!connectionStatus.isConnected) && fbMsgDb ? enableNetwork(fbMsgDb) : disableNetwork(fbMsgDb);
    }, [connectionStatus.isConnected, fbMsgDb]);

    if (!getApps().length) {
        fbApp = initializeApp(firebaseConfig);
        fbAuth = initializeAuth(fbApp, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
        fbMsgDb = getFirestore(fbApp);
    } else {
        fbApp = getApps()[0];
        fbAuth = getAuth(fbApp);
        fbMsgDb = getFirestore(fbApp);
        fbStorage = getStorage(fbApp);
    }

    isSupported().then((supported) => {
        if (supported) {
            setAnalytics(getAnalytics());
        }
    }).catch((error) => {
        console.error('Error initializing Firebase Analytics', error);
    });

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Start'>
                <Stack.Screen name='Start' options={{ headerShown: false }}>
                    {props => <Start fbApp={fbApp} {...props} />}
                </Stack.Screen>
                <Stack.Screen name='Chat'>
                    {props => <Chat database={fbMsgDb} storage={fbStorage} isConnected={isConnected} {...props} />}
                </Stack.Screen>
                <Stack.Screen name='ImageView'>
                    {props => <ImageView {...props} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
