import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Keyboard,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextInputKeyPressEventData
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/store/ThemeContext';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { generateGeminiResponse } from '@/services/aiPrompts';
import { useJournalStore } from '@/store/journalStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const entries = useJournalStore(state => state.entries);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm LEXA, your AI companion. I'm here to chat, help you process your thoughts, and provide support. How are you feeling today?",
      sender: 'bot',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(40);

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated });
    }
  };

  // Scroll when messages change
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Add keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => scrollToBottom()
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => scrollToBottom()
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    scrollToBottom();

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
         
         Respond in a supportive, empathetic way while maintaining a natural conversation flow. Keep the response concise and focused on the user's emotional well-being.`,
        entries
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
  }, [inputText, isLoading, messages, entries]);

  const handleSubmit = useCallback((e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (Platform.OS === 'ios') {
      e.preventDefault(); // Prevent default behavior on iOS
    }
    handleSend();
  }, [handleSend]);

  const handleKeyPress = useCallback((e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter' && Platform.OS !== 'ios') {
      handleSend();
    }
  }, [handleSend]);

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
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.cardDark, paddingTop: insets.top }]}>
          <Pressable 
            onPress={() => router.back()} 
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.7 }
            ]}
          >
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Chat with LEXA</Text>
        </View>

        <KeyboardAvoidingView 
          style={styles.contentContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              { flexGrow: 1 }
            ]}
            style={{ flex: 1 }}
            onLayout={() => scrollToBottom(false)}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          />

          <View 
            style={[
              styles.inputContainer, 
              { 
                backgroundColor: theme.cardDark,
                position: 'absolute',
                bottom: 10,
                left: 0,
                right: 0
              }
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.input, 
                { 
                  color: theme.text,
                  height: Math.max(40, Math.min(120, inputHeight))
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
              onKeyPress={handleKeyPress}
              onContentSizeChange={(e) => {
                setInputHeight(e.nativeEvent.contentSize.height);
              }}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
            />
            <Pressable
              onPress={handleSend}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && { opacity: 0.7 },
                { opacity: (!inputText.trim() || isLoading) ? 0.5 : 1 }
              ]}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={25} color={theme.text} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: '85%',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 12,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    maxHeight: 100,
    minHeight: 40,
    borderRadius: 20,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
}); 