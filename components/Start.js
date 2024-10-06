import { View, StyleSheet, Text, TextInput, SafeAreaView, TouchableHighlight, Animated, ImageBackground } from 'react-native';
import React from 'react';

export default function Start({ navigation }) {
    const [selectedColor, setSelectedColor] = React.useState(colors[2]);
    const [name, setName] = React.useState('');

    return (
        <ImageBackground source={require(
            // @ts-ignore
            '../assets/backgroundImage.png')} style={styles.container}>
            <SafeAreaView>
                <Text style={styles.appTitle}>App Title</Text>
            </SafeAreaView>
            <SafeAreaView style={styles.inputContainer}>
                <TextInput style={styles.textInput} placeholder='Enter your name' value={name} onChangeText={setName} />
                <View style={styles.backgroundColorContainer}>
                    <Text style={styles.backgroundColorLabel}>Choose your background color</Text>
                    <View style={styles.backgroundColorCircleContainer}>
                        {colors.map((color, index) => {
                            return (
                                <TouchableHighlight key={index} underlayColor='white' onPress={() => setSelectedColor(color)}>
                                    <Circle style={[styles.circle, { backgroundColor: color }]} touched={selectedColor === color} />
                                </TouchableHighlight>
                            );
                        })}
                    </View>
                </View>
                <TouchableHighlight style={styles.startChattingContainer} onPress={() => navigation.navigate('Chat', { name, selectedColor })}>
                    <Text style={styles.startChatting}>Start Chatting</Text>
                </TouchableHighlight>
            </SafeAreaView>
        </ImageBackground>
    );
}

function Circle({ style, touched }) {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
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
        <View style={style}>
            {touched && <Animated.View style={[styles.innerCircle, { opacity: fadeAnim }]} />}
        </View>
    );
}

const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        width: '88%',
        height: '44%',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: '6%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    appTitle: {
        fontSize: 45,
        fontWeight: '600',
        color: '#fff',
        marginTop: '24%',
    },
    textInput: {
        width: '88%',
        borderWidth: 1,
        borderColor: '#757083',
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
        alignItems: 'center'
    },
    startChatting: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center'
    },
    circle: {
        flexDirection: 'row',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    innerCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white'
    }
});