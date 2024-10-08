import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, where, orderBy, Timestamp } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

export default function Chat({ route, navigation, database, storage, isConnected }) {
    const { name, selectedColor: backgroundColor, userID } = route?.params,
        [messages, setMessages] = React.useState([]),

        onSend = (newMessages) => {
            addDoc(collection(database, 'messages'), newMessages[0]);
        },

        renderInputToolbar = (props) => {
            return isConnected ? <InputToolbar {...props} /> : null;
        },

        renderBubble = (props) => {
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
        },

        renderCustomActions = (props) => {
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
                        name: name,
                        avatar: 'https://placeimg.com/140/140/any' // TODO #13
                    }
                }
                messageId={messageId}
                storage={storage}
                {...props}
            />;
        },

        renderCustomView = (props) => {
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
        };


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
        if (name && navigation) navigation.setOptions({
            title: name
        });
    }, [navigation, name]);

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


const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});