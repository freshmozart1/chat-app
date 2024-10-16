import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore, disableNetwork, enableNetwork, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import Start from './components/Start';
import Chat from './components/Chat';
import ImageView from './components/ImageView';
import { useNetInfo } from '@react-native-community/netinfo';

const Stack = createNativeStackNavigator(); // TODO: #8 Move this into the component

/**
 * The main application component that initializes Firebase, sets up network status monitoring,
 * and configures the navigation stack.
 *
 * @public
 * @function App
 * @returns {React.ReactElement} The main application component with navigation setup.
 */
export default function App() {
    /**
     * Firebase configuration object containing keys and identifiers for the app.
     * 
     * @private
     * @constant {import('firebase/app').FirebaseOptions} firebaseConfig
     */
    const firebaseConfig = {
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        projectId: process.env.FB_PROJECT_ID,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
        appId: process.env.FB_APP_ID,
        measurementId: process.env.FB_MEASUREMENT_ID
    };
    /**
     * @private
     * @typedef {import('firebase/analytics').Analytics} Analytics
     * @type {[Analytics|null, React.Dispatch<React.SetStateAction<Analytics>>]} analytics - The current state of analytics data and a function to update it.
     */
    const [analytics, setAnalytics] = React.useState(null);

    /**
     * @private
     * @constant {import('@react-native-community/netinfo').NetInfoState} connectionStatus - The current network connection status.
     */
    const connectionStatus = useNetInfo();


    /**
     * @private
     * @type {import('firebase/app').FirebaseApp} fbApp - The Firebase application instance.
     */
    let fbApp;

    /**
     * @private
     * @type {import('firebase/auth').Auth} fbAuth - The Firebase authentication instance.
     */
    let fbAuth;

    /**
     * A reference to the Firebase Realtime Database for messages.
     * This variable is used to interact with the messages stored in the Firebase database.
     * 
     * @private
     * @type {Firestore}
     */
    let fbMsgDb;


    /**
     * A variable to hold a reference to Firebase Storage.
     * 
     * @private
     * @type {import('firebase/storage').FirebaseStorage}
     */
    let fbStorage;

    React.useEffect(() => {
        connectionStatus.isConnected && connectionStatus.isInternetReachable && fbMsgDb ? enableNetwork(fbMsgDb) : disableNetwork(fbMsgDb);
    }, [connectionStatus.isConnected, connectionStatus.isInternetReachable, fbMsgDb]);

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

    /**
     * Opens the chat screen with the provided route and navigation props.
     *
     * @private
     * @function openChat
     * @param {Object} props - The parameters for the function.
     * @param {Object} props.route - The route object containing navigation information.
     * @param {any} props.navigation - The navigation object for navigating between screens.
     * @returns {React.JSX.Element} The Chat component with the provided props.
     */
    function openChat({ route, navigation }) {
        return (
            <Chat database={fbMsgDb} storage={fbStorage} isConnected={connectionStatus.isConnected && connectionStatus.isInternetReachable} route={route} navigation={navigation} />
        );
    }

    /**
     * Navigates to the Start component, passing the Firebase app instance and navigation object as props.
     *
     * @private
     * @function openStart
     * @param {Object} params - The parameters object.
     * @param {import('@react-navigation/native').NavigationProp<any>} params.navigation - The navigation object used for navigating between screens.
     * @returns {React.JSX.Element} The Start component with the provided props.
     */
    function openStart({ navigation }) {
        return (
            <Start fbApp={fbApp} navigation={navigation} />
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Start'>
                <Stack.Screen name='Start' options={{ headerShown: false }}>
                    {props => openStart(props)}
                </Stack.Screen>
                <Stack.Screen name='Chat'>
                    {props => openChat(props)}
                </Stack.Screen>
                <Stack.Screen name='ImageView'>
                    {props => <ImageView {...props} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
