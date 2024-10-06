import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';

export default function Chat({ route, navigation }) {
    const name = route.params.name;
    const backgroundColor = route.params.selectedColor;
    const [messages, setMessages] = React.useState([]);
    const onSend = (newMessages) => setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    React.useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: 'Hello, world!',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Alan Turing',
                    avatar: 'https://placeimg.com/140/140/any'
                }
            },
            {
                _id: 2,
                text: 'This is a system message',
                createdAt: new Date(),
                system: true
            }
        ]);
    }, []);
    React.useEffect(() => {
        if (name && navigation) navigation.setOptions({
            title: name,
            backgroundColor: backgroundColor
        });
    }, [navigation, name, backgroundColor]);
    return (
        <View style={[styles.container, { backgroundColor }]}>
            <GiftedChat messages={messages} renderBubble={renderBubble} onSend={onSend} user={{ _id: 1 }} />
            {Platform.OS === 'android' && <KeyboardAvoidingView behavior='height' />}
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