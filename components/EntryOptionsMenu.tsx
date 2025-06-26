import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Bookmark, Link2, Eye, Printer, LucideIcon, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

interface EntryOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onPrivate: () => void;
  onPDF: () => void;
  onDelete: () => void;
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  textColor?: string;
  iconColor?: string;
}

export default function EntryOptionsMenu({
  visible,
  onClose,
  onBookmark,
  onShare,
  onPrivate,
  onPDF,
  onDelete,
}: EntryOptionsMenuProps) {
  const { theme } = useTheme();

  const MenuItem = ({ icon: Icon, label, onPress, textColor = theme.text, iconColor = theme.text }: MenuItemProps) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && [styles.menuItemPressed, { backgroundColor: theme.card }]
      ]}
      onPress={() => {
        onPress();
        onClose();
      }}
    >
      <Icon size={24} color={iconColor} />
      <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menuContainer, { backgroundColor: theme.cardDark }]}>
          <MenuItem icon={Bookmark} label="Bookmark" onPress={onBookmark} />
          <MenuItem icon={Link2} label="Share" onPress={onShare} />
          <MenuItem icon={Eye} label="Private" onPress={onPrivate} />
          <MenuItem icon={Printer} label="PDF" onPress={onPDF} />
          <View style={[styles.divider, { backgroundColor: theme.card }]} />
          <MenuItem 
            icon={Trash2} 
            label="Delete Entry" 
            onPress={onDelete}
            textColor="#ff4444"
            iconColor="#ff4444"
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 16,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  menuItemPressed: {
    opacity: 0.8,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
}); 