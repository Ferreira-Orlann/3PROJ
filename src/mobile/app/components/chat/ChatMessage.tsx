import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmojiPicker from './EmojiPicker';
import { UUID } from 'crypto';
import { Message as ApiMessage, Reaction as ApiReaction } from '../../services/api/endpoints/messages';
import userService from '../../services/api/endpoints/users';
import { Attachment as ApiAttachment } from '../../services/api/endpoints/attachments';

// Type pour les réactions regroupées dans l'UI (nécessaire pour l'affichage)
interface UIReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ChatMessageProps {
  message: ApiMessage;
  isCurrentUser: boolean;
  onAddReaction: (messageId: UUID, emoji: string) => void;
  onShowEmojiPicker: () => void;
  onDeleteMessage?: (messageId: UUID) => void;
  onReplyToMessage?: (messageId: UUID) => void;
  onCopyMessage?: (messageId: UUID) => void;
  onEditMessage?: (messageId: UUID) => void;
  onPinMessage?: (messageId: UUID) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  onAddReaction,
  onShowEmojiPicker,
  onDeleteMessage,
  onReplyToMessage,
  onCopyMessage,
  onEditMessage,
  onPinMessage
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [senderName, setSenderName] = useState<string>('Unknown');
  // Convertir les réactions API en réactions UI pour l'affichage
  const getUIReactions = (): UIReaction[] => {
    const groupedReactions: UIReaction[] = [];
    console.log('ChatMessage - getUIReactions - message:', message);
    console.log('ChatMessage - getUIReactions - message.createdReaction:', isCurrentUser);
    
    if (message.createdReaction && Array.isArray(message.createdReaction)) {
      message.createdReaction.forEach(reaction => {
        if (!reaction || !reaction.emoji || !reaction.user || !reaction.user.uuid) {
          return;
        }
        
        const existingReaction = groupedReactions.find(r => r.emoji === reaction.emoji);
        if (existingReaction) {
          existingReaction.count++;
          existingReaction.users.push(reaction.user.uuid);
        } else {
          groupedReactions.push({
            emoji: reaction.emoji,
            count: 1,
            users: [reaction.user.uuid]
          });
        }
      });
    }
    
    return groupedReactions;
  };
  
  const reactions = getUIReactions();
  const timestamp = new Date(message.date).toLocaleTimeString();
  
  // Fetch user information when the component mounts or when the message source changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await userService.getUserById(message.source as UUID);
        setSenderName(user.username);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setSenderName('Unknown');
      }
    };
    
    fetchUserInfo();
  }, [message.source]);
  
  return (
    <View style={[styles.messageContainer, isCurrentUser ? styles.myMessage : styles.otherMessage]}>
      <View style={[styles.messageHeader, isCurrentUser ? styles.myMessageHeader : styles.otherMessageHeader]}>
        <Text style={styles.sender}>{senderName}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
      
      <Text style={styles.messageText}>{message.message}</Text>
      
      {/* Attachments - À implémenter quand les pièces jointes seront disponibles */}
      
      {/* Reactions */}
      {reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {reactions.map((reaction, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.reaction}
              onPress={() => onAddReaction(message.uuid, reaction.emoji)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Message actions */}
      <View style={styles.messageActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Ionicons name="happy-outline" size={18} color="#8e9297" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowActionsModal(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#8e9297" />
        </TouchableOpacity>
      </View>
      
      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showEmojiPicker}
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer} 
            activeOpacity={1} 
            onPress={() => setShowEmojiPicker(false)}
          >
          <View style={styles.modalContainer}>
            <View style={styles.emojiPickerContainer}>
              <EmojiPicker 
                onEmojiSelected={(emoji) => {
                  onAddReaction(message.uuid, emoji);
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </View>
          </View>
          </TouchableOpacity>
        </Modal>
      )}
      
      {/* Actions Modal */}
      {showActionsModal && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showActionsModal}
          onRequestClose={() => setShowActionsModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer} 
            activeOpacity={1} 
            onPress={() => setShowActionsModal(false)}
          >
            <View style={[styles.actionsModalContent, isCurrentUser ? styles.actionsModalRight : styles.actionsModalLeft]}>
              {onReplyToMessage && (
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => {
                    onReplyToMessage(message.uuid);
                    setShowActionsModal(false);
                  }}
                >
                  <Ionicons name="return-down-back" size={20} color="#dcddde" />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
              )}
              
              {onCopyMessage && (
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => {
                    onCopyMessage(message.uuid);
                    setShowActionsModal(false);
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#dcddde" />
                  <Text style={styles.actionText}>Copy Text</Text>
                </TouchableOpacity>
              )}
              
              {isCurrentUser && onEditMessage && (
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => {
                    onEditMessage(message.uuid);
                    setShowActionsModal(false);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#dcddde" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
              
              {onPinMessage && (
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => {
                    onPinMessage(message.uuid);
                    setShowActionsModal(false);
                  }}
                >
                  <Ionicons name="pin" size={20} color="#0721f8" />
                  <Text style={styles.actionText}>Pin to Channel</Text>
                </TouchableOpacity>
              )}
              
              {isCurrentUser && onDeleteMessage && (
                <TouchableOpacity 
                  style={[styles.actionItem, styles.deleteAction]}
                  onPress={() => {
                    onDeleteMessage(message.uuid);
                    setShowActionsModal(false);
                  }}
                >
                  <Ionicons name="trash" size={20} color="#ed4245" />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 15,
    maxWidth: '85%',
    padding: 12,
    marginBottom: 50,
    borderRadius: 8,
    position: 'relative',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6f62a4',
    marginRight: 10,
    borderTopRightRadius: 4, // Smaller radius on the side where the message is aligned
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#373d49',
    marginLeft: 10,
    borderTopLeftRadius: 4, // Smaller radius on the side where the message is aligned
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  myMessageHeader: {
    justifyContent: 'flex-end', // Align to the right for current user's messages
  },
  otherMessageHeader: {
    justifyContent: 'flex-start', // Align to the left for other users' messages
  },
  sender: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    color: '#8e9297',
    fontSize: 12,
    marginLeft: 8,
  },
  messageText: {
    color: '#dcddde',
    fontSize: 15,
    lineHeight: 20,
  },
  attachmentsContainer: {
    marginTop: 10,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#494d55',
    borderRadius: 4,
    padding: 8,
    marginTop: 5,
  },
  attachmentInfo: {
    marginLeft: 5,
  },
  attachmentName: {
    color: '#dcddde',
    fontSize: 14,
  },
  attachmentSize: {
    color: '#8e9297',
    fontSize: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f3136',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    color: '#dcddde',
    fontSize: 12,
  },
  messageActions: {
    position: 'absolute',
    top: -30,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#36393f',
    borderRadius: 4,
    padding: 4,
    opacity: 0.9,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  emojiPickerContainer: {
    backgroundColor: '#2f3136',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  actionsModalContent: {
    position: 'absolute',
    width: 150,
    backgroundColor: '#36393f',
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionsModalRight: {
    right: 20,
    top: '40%',
  },
  actionsModalLeft: {
    left: 20,
    top: '40%',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#202225',
  },
  actionText: {
    marginLeft: 10,
    color: '#dcddde',
    fontSize: 14,
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: '#ed4245',
  },
  actionButton: {
    padding: 4,
    marginHorizontal: 2,
  },
});

export default ChatMessage;
