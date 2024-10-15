import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import Start from './components/Start';
import Chat from './components/Chat';
import ImageView from './components/ImageView';
import { useNetInfo } from '@react-native-community/netinfo';

const Stack = createNativeStackNavigator(); // TODO: #8 Move this into the component

export default function App() {
    const firebaseConfig = { // TODO: #9 Move this to a .env file
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        projectId: process.env.FB_PROJECT_ID,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
        appId: process.env.FB_APP_ID,
        measurementId: process.env.FB_MEASUREMENT_ID
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
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
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
