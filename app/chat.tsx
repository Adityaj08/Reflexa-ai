import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/ThemeContext';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { generateGeminiResponse } from '@/services/aiPrompts';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Reflexa, your AI companion. I'm here to chat, help you process your thoughts, and provide support. How are you feeling today?",
      sender: 'bot',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add temporary loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingId,
      text: '',
      sender: 'bot',
      timestamp: Date.now() + 1,
    }]);

    try {
      const response = await generateGeminiResponse(
        `You are Reflexa, an empathetic AI companion focused on emotional support and mental well-being. 
         Previous conversation: ${messages.map(m => `${m.sender}: ${m.text}`).join('\n')}
         User's message: ${userMessage.text}
         
         Respond in a supportive, empathetic way while maintaining a natural conversation flow. Keep the response concise and focused on the user's emotional well-being.`
      );
      
      // Replace loading message with actual response
      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: (Date.now() + 2).toString(),
        text: response,
        sender: 'bot',
        timestamp: Date.now() + 2,
      }));
    } catch (error) {
      // Replace loading message with error message
      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: (Date.now() + 2).toString(),
        text: "I apologize, but I'm having trouble responding right now. Could you try rephrasing your message?",
        sender: 'bot',
        timestamp: Date.now() + 2,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.botMessage,
      { backgroundColor: item.sender === 'user' ? theme.primary : theme.card }
    ]}>
      {item.text ? (
        <Text style={[styles.messageText, { color: theme.text }]}>{item.text}</Text>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.text} size="small" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Reflexa is typing...</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <SafeAreaView edges={['top']} style={styles.container}>
            <View style={[styles.header, { backgroundColor: theme.cardDark }]}>
              <Pressable 
                onPress={() => router.back()} 
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && { opacity: 0.7 }
                ]}
              >
                <ArrowLeft size={24} color={theme.text} />
              </Pressable>
              <Text style={[styles.title, { color: theme.text }]}>Chat with Reflexa</Text>
            </View>

            <View style={{ flex: 1 }}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.cardDark }]}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <Pressable
                onPress={handleSend}
                disabled={isLoading || !inputText.trim()}
                style={({ pressed }) => [
                  styles.sendButton,
                  { backgroundColor: theme.primary },
                  (isLoading || !inputText.trim()) && { opacity: 0.5 },
                  pressed && { opacity: 0.7 }
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.text} size="small" />
                ) : (
                  <Send size={20} color={theme.text} />
                )}
              </Pressable>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 