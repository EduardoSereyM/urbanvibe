import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../api/types';
import { useReplyToReview, useReportReview, useReactToReview } from '../../hooks/useVenueReviews';

interface ReviewItemProps {
    review: Review;
    venueId: string;
}

export function ReviewItem({ review, venueId }: ReviewItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);


    const replyMutation = useReplyToReview();
    const reactMutation = useReactToReview();
    const reportMutation = useReportReview();

    const handleReaction = async () => {
        try {
            const result = await reactMutation.mutateAsync({
                reviewId: review.id,
                reactionType: 'helpful'
            });
            // Result should contain new count or we toggle locally
            if (result && typeof result.helpful_count === 'number') {
                setHelpfulCount(result.helpful_count);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReply = async () => {
        if (!responseText.trim()) return;

        try {
            await replyMutation.mutateAsync({
                venueId,
                reviewId: review.id,
                response: responseText
            });
            setIsReplying(false);
            setResponseText('');
            Alert.alert('Éxito', 'Respuesta enviada correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la respuesta');
        }
    };

    const handleReport = () => {
        Alert.alert(
            'Reportar Reseña',
            '¿Por qué quieres reportar esta reseña?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Spam',
                    onPress: () => submitReport('spam')
                },
                {
                    text: 'Acoso',
                    onPress: () => submitReport('harassment')
                },
                {
                    text: 'Contenido Falso',
                    onPress: () => submitReport('fake')
                }
            ]
        );
    };

    const submitReport = async (reason: string) => {
        try {
            await reportMutation.mutateAsync({
                reviewId: review.id,
                reason
            });
            Alert.alert('Reporte Enviado', 'Gracias por ayudarnos a mantener la comunidad segura.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar el reporte');
        }
    };

    return (
        <View className="bg-surface rounded-xl p-4 mb-4 border border-surface-active">
            {/* Header: User Info & Score */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-surface-active rounded-full items-center justify-center">
                        <Text className="text-foreground font-brand text-lg">
                            {review.user_display_name?.[0] || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-foreground font-body-bold">
                            {review.user_display_name || 'Usuario'}
                        </Text>
                        <Text className="text-foreground-muted text-xs">
                            {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-primary font-brand-bold">
                        {review.general_score.toFixed(1)} ★
                    </Text>
                </View>
            </View>

            {/* Comment */}
            {review.comment && (
                <Text className="text-foreground font-body mb-4 leading-5">
                    {review.comment}
                </Text>
            )}

            {/* Owner Response Section */}
            {review.owner_response ? (
                <View className="bg-surface-deep p-3 rounded-lg border-l-2 border-primary mt-2">
                    <Text className="text-primary font-body-bold text-xs mb-1">
                        Tu respuesta • {review.owner_responded_at ? new Date(review.owner_responded_at).toLocaleDateString() : ''}
                    </Text>
                    <Text className="text-foreground-muted font-body text-sm">
                        {review.owner_response}
                    </Text>
                </View>
            ) : (
                <View className="mt-2">
                    {isReplying ? (
                        <View>
                            <TextInput
                                className="bg-surface-deep text-foreground p-3 rounded-lg border border-surface-active mb-3 min-h-[80px]"
                                multiline
                                placeholder="Escribe tu respuesta..."
                                placeholderTextColor="#6B7280"
                                value={responseText}
                                onChangeText={setResponseText}
                            />
                            <View className="flex-row justify-end gap-3">
                                <TouchableOpacity
                                    onPress={() => setIsReplying(false)}
                                    className="px-4 py-2"
                                >
                                    <Text className="text-foreground-muted font-body">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleReply}
                                    disabled={replyMutation.isPending}
                                    className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
                                >
                                    {replyMutation.isPending && <ActivityIndicator size="small" color="white" />}
                                    <Text className="text-white font-body-bold">Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row justify-between items-center pt-2 border-t border-surface-active">
                            <TouchableOpacity
                                onPress={() => setIsReplying(true)}
                                className="flex-row items-center gap-2"
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#00E0FF" />
                                <Text className="text-accent-cyber font-body-bold text-sm">Responder</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleReaction}
                                className="flex-row items-center gap-2 mr-4"
                            >
                                <Ionicons name="thumbs-up-outline" size={18} color="#6B7280" />
                                <Text className="text-foreground-muted font-body text-xs">{helpfulCount} Útil</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleReport}
                                className="flex-row items-center gap-2"
                            >
                                <Ionicons name="flag-outline" size={16} color="#6B7280" />
                                <Text className="text-foreground-muted font-body text-xs">Reportar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
