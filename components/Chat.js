import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, Firestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

/**
 * @typedef {Object} ChatRouteParams
 * @property {String} name
 * @property {String} selectedColor
 * @property {String} userID
 * 
 * @typedef {import('@react-navigation/native').RouteProp<{ Chat: ChatRouteParams }, 'Chat'>} ChatRouteProp
 *
 * @typedef {import('firebase/storage').FirebaseStorage} Storage
 *
 * @typedef {import('react-native-gifted-chat').IMessage} Message
 *
 * @typedef {import('react-native-gifted-chat').BubbleProps<Message & CustomMessage>} BubbleProps
 *
 * @typedef {Object} CustomMessage
 * @property {Location} location?
 * @property {string} imageURL?
 *
 * @typedef {Object} Location
 * @property {number} latitude
 * @property {number} longitude
 *
 * @typedef {Object} ChatProps
 * @property {ChatRouteProp} route
 * @property {import('@react-navigation/native').NavigationProp<any>} navigation
 * @property {Firestore} database
 * @property {Storage} storage
 * @property {Boolean} isConnected
 *
 * @component
 * @param {ChatProps} props
 * 
 * @requires react
 * @requires react-native
 * @requires react-native-gifted-chat
 * @requires firebase/firestore
 * @requires @react-native-async-storage/async-storage
 * @requires react-native-maps
 * @requires ./CustomActions
 * 
 * @returns {React.JSX.Element}
 */
export default function Chat({ route, navigation, database, storage, isConnected }) {
    /**
     * Extracts the name, selectedColor as backgroundColor and userID from the route params
     * 
     * @type {ChatRouteParams}
     */
    const { name, selectedColor: backgroundColor, userID } = route?.params;

    /**
     * A state hook to  store chat messages
     * @type {[Message[], React.Dispatch<React.SetStateAction<Message[]>>]}
     */
    const [messages, setMessages] = React.useState([]);

    useEffect(() => {
        if (isConnected) {
            const unsubscribeMessages = onSnapshot(query(collection(database, 'messages'), orderBy("createdAt", "desc")), messagesSnapshot => {
                let newMessages = [];
                messagesSnapshot.forEach(message => {
                    const messageData = message.data();
                    messageData.createdAt = new Timestamp(messageData.createdAt.seconds, messageData.createdAt.nanoseconds).toDate();
                    newMessages.push({ id: message.id, ...messageData });
                });
                setMessages(newMessages);
                AsyncStorage.setItem('messages', JSON.stringify(newMessages))
                    .catch(error => console.error('Error saving messages to AsyncStorage', error));
                return () => { if (unsubscribeMessages) unsubscribeMessages() };
            });
        } else {

            AsyncStorage.getItem('messages').then(messages => {
                if (messages) setMessages(JSON.parse(messages));
            }).catch(error => console.error('Error retrieving messages from AsyncStorage', error));
        }
    }, []);

    useEffect(() => {
        if (!isConnected) {
            const systemMessage = {
                _id: 'system-message',
                text: 'You are offline, please check your network connection.',
                createdAt: new Date(),
                system: true,
                user: { _id: 0 }
            };
            setMessages(previousMessages => GiftedChat.append(previousMessages, [systemMessage]));
        }
    }, [isConnected]);

    useEffect(() => {
        if (name && navigation) navigation.setOptions({
            title: name
        });
    }, [navigation, name]);

    /**
     * 
     * @param {Readonly<BubbleProps>} props 
     * @returns {React.JSX.Element}
     */
    function renderBubble(props) {
        return (
            <Bubble {...props} wrapperStyle={{
                right: {
                    backgroundColor: '#000' // TODO #14
                },
                left: {
                    backgroundColor: '#fff' // TODO #14
                }
            }} />
        );
    }

    /**
     * 
     * @param {import('react-native-gifted-chat').InputToolbarProps<import('react-native-gifted-chat').IMessage>} props 
     * @returns {React.JSX.Element | null}
     */
    function renderInputToolbar(props) {
        return isConnected ? <InputToolbar {...props} /> : null;
    }

    /**
     * @function onSend
     * @param {Message[]} newMessages
     * @returns {void}
     */
    function onSend(newMessages) {
        addDoc(collection(database, 'messages'), newMessages[0]);
    }

    /**
     * 
     * @param {import('react-native-gifted-chat').ActionsProps} props
     * @returns {React.JSX.Element}
     */
    function renderCustomActions({ wrapperStyle, iconTextStyle }) {
        let messageId;
        do {
            messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        } while (messages.some(message => message._id === messageId)); // find a unique UUID
        return <CustomActions
            onSend={onSend}
            user={
                {
                    _id: userID,
                    name: name
                }
            }
            messageId={messageId}
            storage={storage}
            wrapperStyle={wrapperStyle}
            iconTextStyle={iconTextStyle}
        />;
    }

    /**
     * 
     * @param {BubbleProps} props 
     * @returns {React.JSX.Element}
     */
    function renderCustomView(props) {
        const { location, imageURL } = props?.currentMessage;
        if (location) {
            return (
                <MapView style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }} region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421
                }} />
            );
        }
        if (imageURL) { // The gifted chat image viewer is not working, so I decided to use a custom image viewer
            return (
                <TouchableOpacity onPress={() => navigation.navigate('ImageView', { imageURL: imageURL })}>
                    <Image source={{ uri: imageURL }} style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }} />
                </TouchableOpacity>
            );
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <GiftedChat
                messages={messages}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
                onSend={onSend}
                renderActions={renderCustomActions}
                renderCustomView={renderCustomView}
                user={{ _id: userID, name: name }}
            />
            {Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height' /> : null}
        </View>
    );
}