import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Props {
    images: { uri: string; name?: string }[];
    initialIndex: number;
    visible: boolean;
    onClose: () => void;
}

export default function ImageViewerModal({ images, initialIndex, visible, onClose }: Props) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Zoom State
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // Check local update
    React.useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            scale.value = 1;
            savedScale.value = 1;
        }
    }, [initialIndex, visible]);

    const handleNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetZoom();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            resetZoom();
        }
    };

    const resetZoom = () => {
        scale.value = withTiming(1);
        savedScale.value = 1;
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withTiming(1);
                savedScale.value = 1;
            } else {
                savedScale.value = scale.value;
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (!visible) return null;

    const currentImage = images[currentIndex];

    // Ensure we handle invalid image data gracefully
    if (!currentImage) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
                <StatusBar barStyle="light-content" backgroundColor="black" />

                {/* Close Button */}
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>

                {/* Counter */}
                <View style={styles.counter}>
                    <Text style={styles.counterText}>
                        {currentIndex + 1} / {images.length}
                    </Text>
                </View>

                {/* Image Container */}
                <View style={styles.container}>
                    <GestureDetector gesture={pinchGesture}>
                        <Animated.Image
                            source={{ uri: currentImage.uri }}
                            style={[{ width: width, height: height * 0.8, resizeMode: 'contain' }, animatedStyle]}
                        />
                    </GestureDetector>
                </View>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <TouchableOpacity
                                onPress={handlePrev}
                                style={[styles.arrow, { left: 16 }]}
                            >
                                <Ionicons name="chevron-back" size={30} color="white" />
                            </TouchableOpacity>
                        )}

                        {currentIndex < images.length - 1 && (
                            <TouchableOpacity
                                onPress={handleNext}
                                style={[styles.arrow, { right: 16 }]}
                            >
                                <Ionicons name="chevron-forward" size={30} color="white" />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* Caption name */}
                {currentImage.name && (
                    <View style={styles.caption}>
                        <Text style={styles.captionText}>{currentImage.name}</Text>
                    </View>
                )}
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 48,
        right: 24,
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 25,
    },
    counter: {
        position: 'absolute',
        top: 56,
        left: 24,
        zIndex: 50,
    },
    counterText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrow: {
        position: 'absolute',
        top: '50%',
        marginTop: -24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 30,
        zIndex: 40,
    },
    caption: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    captionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
