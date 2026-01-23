import { useState } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  type: 'email' | 'sms' | 'in_app' | 'notification';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
  tags?: string[];
}

export function useMessageData() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, ] = useState(false);

  const sendMessage = async (messageData: Partial<Message>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: messageData.senderId || '',
      senderName: messageData.senderName || '',
      recipientId: messageData.recipientId || '',
      recipientName: messageData.recipientName || '',
      subject: messageData.subject || '',
      content: messageData.content || '',
      timestamp: messageData.timestamp || new Date().toISOString(),
      type: messageData.type || 'email',
      status: messageData.status || 'sent',
      priority: messageData.priority || 'medium',
      attachments: messageData.attachments,
      tags: messageData.tags
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id ? { ...message, ...updates } : message
      )
    );
  };

  const deleteMessage = async (id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  };

  const getMessagesByRecipient = (recipientId: string) => {
    return messages.filter(message => message.recipientId === recipientId);
  };

  const getMessagesByType = (type: string) => {
    return messages.filter(message => message.type === type);
  };

  const getUnreadMessages = () => {
    return messages.filter(message => message.status !== 'read');
  };

  return {
    messages,
    loading,
    sendMessage,
    updateMessage,
    deleteMessage,
    getMessagesByRecipient,
    getMessagesByType,
    getUnreadMessages
  };
} 