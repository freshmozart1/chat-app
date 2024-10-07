import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, where, orderBy, Timestamp } from "firebase/firestore";

export default function Chat({ route, navigation, database }) {
    const name = route.params.name;
    const backgroundColor = route.params.selectedColor;
    const uid = route.params.userID;
    const [messages, setMessages] = React.useState([]);
    const onSend = (newMessages) => addDoc(collection(database, 'messages'), newMessages[0]);
    React.useEffect(() => {
        const unsubscribeMessages = onSnapshot(query(collection(database, 'messages'), orderBy("createdAt", "desc")), messagesSnapshot => {
            let newMessages = [];
            messagesSnapshot.forEach(message => {
                const messageData = message.data();
                messageData.createdAt = new Timestamp(messageData.createdAt.seconds, messageData.createdAt.nanoseconds).toDate();
                newMessages.push({ id: message.id, ...messageData });
            });
            setMessages(newMessages);
            return () => { if (unsubscribeMessages) unsubscribeMessages() };
        });
    }, []);
    React.useEffect(() => {
        if (name && navigation) navigation.setOptions({
            title: name,
            backgroundColor: backgroundColor
        });
    }, [navigation, name, backgroundColor]);
    return (
        <View style={[styles.container, { backgroundColor }]}>
            <GiftedChat messages={messages} renderBubble={renderBubble} onSend={onSend} user={{ _id: uid, name: name }} />
            {Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height' /> : null}
        </View>
    );
}

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

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});