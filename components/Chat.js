import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, where, orderBy, Timestamp } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Chat({ route, navigation, database, isConnected }) {
    const name = route.params.name;
    const backgroundColor = route.params.selectedColor;
    const uid = route.params.userID;
    const [messages, setMessages] = React.useState([]);
    const onSend = (newMessages) => addDoc(collection(database, 'messages'), newMessages[0]);
    React.useEffect(() => {
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
    React.useEffect(() => {
        if (name && navigation) navigation.setOptions({
            title: name,
            backgroundColor: backgroundColor
        });
    }, [navigation, name, backgroundColor]);

    const renderInputToolbar = (props) => {
        return isConnected ? <InputToolbar {...props} /> : null;
    };

    const renderBubble = (props) => {
        return (
            <Bubble {...props} wrapperStyle={{
                right: {
                    backgroundColor: '#000'
                },
                left: {
                    backgroundColor: '#fff'
                }
            }} />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <GiftedChat
                messages={messages}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
                onSend={onSend}
                user={{ _id: uid, name: name }}
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