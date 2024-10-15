import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, View, StyleSheet, Text, TextInput, SafeAreaView, TouchableHighlight, Animated, ImageBackground } from 'react-native';
import { getAuth, signInAnonymously } from "firebase/auth";
import React, { useEffect, useState, useRef } from 'react';

export default function Start({ navigation, fbApp }) {
    const auth = getAuth(fbApp);
    const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];
    const [selectedColor, setSelectedColor] = useState(colors[2]);
    const [name, setName] = useState('');
    const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
    const animateHeaderHeight = useRef(new Animated.Value(screenHeight / 2)).current;
    const animateInputContainerHeight = useRef(new Animated.Value(screenHeight / 100 * 44)).current;
    const animateInputContainerWidth = useRef(new Animated.Value(screenWidth / 100 * 88)).current;
    const animateInputContainerMargin = useRef(new Animated.Value(screenHeight / 100 * 3)).current;
    const animateTitleFontSize = useRef(new Animated.Value(45)).current;

    const styles = StyleSheet.create({
        container: {
            height: '100%',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        header: {
            width: '88%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        inputContainer: {
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'space-around',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            borderRadius: 3.84
        },
        appTitle: {
            fontWeight: '600',
            color: '#fff'
        },
        textInput: {
            width: '88%',
            borderWidth: 1,
            borderColor: '#757083',
            borderRadius: 3.84,
            height: 50,
            padding: 10,
            fontSize: 16,
            fontWeight: '300',
            color: '#757083',
            opacity: 50
        },
        backgroundColorContainer: {
            gap: 8
        },
        backgroundColorLabel: {
            fontSize: 16,
            fontWeight: '300',
            color: '#757083',
            opacity: 100
        },
        backgroundColorCircleContainer: {
            flexDirection: 'row',
            width: '88%',
            height: 50,
            alignItems: 'center',
            justifyContent: 'space-around'
        },
        startChattingContainer: {
            width: '88%',
            height: 50,
            backgroundColor: '#757083',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3.84
        },
        startChatting: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            textAlign: 'center'
        }
    });

    const startAnimations = (animations = []) => {
        for (let { animatedValue, toValue } of animations) {
            Animated.timing(animatedValue, {
                toValue: toValue,
                duration: 50,
                useNativeDriver: false
            }).start();
        }
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            startAnimations([
                { animatedValue: animateHeaderHeight, toValue: 0 },
                { animatedValue: animateInputContainerHeight, toValue: screenHeight - e.endCoordinates.height },
                { animatedValue: animateInputContainerWidth, toValue: screenWidth },
                { animatedValue: animateInputContainerMargin, toValue: 0 },
                { animatedValue: animateTitleFontSize, toValue: 0 }
            ]);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            startAnimations([
                { animatedValue: animateHeaderHeight, toValue: screenHeight / 2 },
                { animatedValue: animateInputContainerHeight, toValue: screenHeight / 100 * 44 },
                { animatedValue: animateInputContainerWidth, toValue: screenWidth / 100 * 88 },
                { animatedValue: animateInputContainerMargin, toValue: screenHeight / 100 * 3 },
                { animatedValue: animateTitleFontSize, toValue: 45 }
            ]);
        });
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        }
    }, []);

    return (
        <ImageBackground source={require(
            // @ts-ignore
            '../assets/backgroundImage.png')} style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <Animated.View style={[styles.header, { height: animateHeaderHeight }]}>
                    <Animated.Text style={[styles.appTitle, { fontSize: animateTitleFontSize }]}>Talk with everyone</Animated.Text>
                </Animated.View>
                <Animated.View style={[styles.inputContainer, { height: animateInputContainerHeight, width: animateInputContainerWidth, marginBottom: animateInputContainerMargin }]}>
                    <TextInput style={styles.textInput} placeholder='Enter your name' value={name} onChangeText={setName} />
                    <View style={styles.backgroundColorContainer}>
                        <Text style={styles.backgroundColorLabel}>Choose your background color</Text>
                        <View style={styles.backgroundColorCircleContainer}>
                            {colors.map((color, index) => {
                                return (
                                    <TouchableHighlight key={index} underlayColor='white' onPress={() => setSelectedColor(color)}>
                                        <Circle style={{ backgroundColor: color }} touched={selectedColor === color} />
                                    </TouchableHighlight>
                                );
                            })}
                        </View>
                    </View>
                    <TouchableHighlight style={styles.startChattingContainer} onPress={navigateToChat}>
                        <Text style={styles.startChatting}>Start Chatting</Text>
                    </TouchableHighlight>
                </Animated.View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );

    function navigateToChat(event) {
        signInAnonymously(auth).then(result => navigation.navigate('Chat', {
            userID: result.user.uid,
            name: name,
            selectedColor: selectedColor
        })).catch(error => console.error('Error signing in anonymously', error));
    }
}

function Circle({ style, touched }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (touched) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [touched, fadeAnim]);

    return (
        <View style={{
            flexDirection: 'row',
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            ...style
        }}>
            {touched && <Animated.View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: 'white',
                opacity: fadeAnim
            }} />}
        </View>
    );
}