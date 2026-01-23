"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  File, 
  Image, 
  Video, 
  FileText,
  Download,
  Eye,
  Lock,
  Unlock,
  User,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  Search,
  Filter,
  MoreHorizontal,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  StarOff,
  Phone,
  Mail,
  Calendar,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Message, MessageAttachment, Provider } from './interfaces/patient';

interface SecureMessagingProps {
  patientId: string;
  providers: Provider[];
  onSendMessage: (message: Partial<Message>) => void;
  onMarkAsRead: (messageId: string) => void;
}

interface MessageThread {
  id: string;
  subject: string;
  messages: Message[];
  participants: string[];
  lastMessage: string;
  unreadCount: number;
}

export default function SecureMessaging({ 
  patientId, 
  providers, 
  onSendMessage, 
  onMarkAsRead 
}: SecureMessagingProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipientId: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sender'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock message threads data
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([
    {
      id: '1',
      subject: 'Follow-up on Blood Test Results',
      messages: [
        {
          id: '1',
          patientId,
          providerId: '1',
          subject: 'Follow-up on Blood Test Results',
          content: 'Hello, I wanted to discuss your recent blood test results. Your cholesterol levels have improved significantly with the medication. However, I noticed your vitamin D levels are still low. I recommend increasing your daily vitamin D supplement to 2000 IU. Please let me know if you have any questions.',
          timestamp: '2024-03-15T10:30:00Z',
          status: 'read',
          priority: 'normal',
          attachments: []
        },
        {
          id: '2',
          patientId,
          providerId: '1',
          subject: 'Re: Follow-up on Blood Test Results',
          content: 'Thank you for the update, Dr. Smith. I\'ll increase my vitamin D supplement as recommended. Should I schedule another blood test in a few months to check the levels?',
          timestamp: '2024-03-15T14:45:00Z',
          status: 'read',
          priority: 'normal',
          attachments: []
        },
        {
          id: '3',
          patientId,
          providerId: '1',
          subject: 'Re: Follow-up on Blood Test Results',
          content: 'Yes, that would be a good idea. Let\'s schedule a follow-up blood test in 3 months to monitor your vitamin D levels. I\'ll send you a lab order through the portal.',
          timestamp: '2024-03-16T09:15:00Z',
          status: 'unread',
          priority: 'normal',
          attachments: []
        }
      ],
      participants: ['Dr. Sarah Smith'],
      lastMessage: '2024-03-16T09:15:00Z',
      unreadCount: 1
    },
    {
      id: '2',
      subject: 'Appointment Reminder',
      messages: [
        {
          id: '4',
          patientId,
          providerId: '1',
          subject: 'Appointment Reminder',
          content: 'This is a reminder that you have an appointment scheduled for tomorrow at 10:00 AM. Please arrive 15 minutes early and bring your insurance card and a list of current medications.',
          timestamp: '2024-03-19T08:00:00Z',
          status: 'unread',
          priority: 'normal',
          attachments: []
        }
      ],
      participants: ['Dr. Sarah Smith'],
      lastMessage: '2024-03-19T08:00:00Z',
      unreadCount: 1
    },
    {
      id: '3',
      subject: 'Medication Refill Request',
      messages: [
        {
          id: '5',
          patientId,
          providerId: '1',
          subject: 'Medication Refill Request',
          content: 'I\'ve approved your refill request for Lisinopril. The prescription has been sent to your preferred pharmacy. You should receive a notification when it\'s ready for pickup.',
          timestamp: '2024-03-18T16:30:00Z',
          status: 'read',
          priority: 'normal',
          attachments: []
        }
      ],
      participants: ['Dr. Sarah Smith'],
      lastMessage: '2024-03-18T16:30:00Z',
      unreadCount: 0
    }
  ]);

  const currentThread = messageThreads.find(thread => thread.id === selectedThread);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentThread?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content || !newMessage.recipientId) {
      return;
    }

    const message: Partial<Message> = {
      patientId,
      providerId: newMessage.recipientId,
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      status: 'unread',
      priority: newMessage.priority,
      attachments: attachments.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }))
    };

    onSendMessage(message);
    
    // Reset form
    setNewMessage({
      subject: '',
      content: '',
      recipientId: '',
      priority: 'normal'
    });
    setAttachments([]);
    setComposeMode(false);
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredThreads = messageThreads
    .filter(thread => {
      const matchesSearch = thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterStatus === 'unread') {
        return matchesSearch && thread.unreadCount > 0;
      }
      if (filterStatus === 'read') {
        return matchesSearch && thread.unreadCount === 0;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime();
      }
      if (sortBy === 'priority') {
        return b.unreadCount - a.unreadCount;
      }
      return a.participants[0].localeCompare(b.participants[0]);
    });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Secure Messages</h2>
          <p className="text-sm text-gray-600">Encrypted communication with your healthcare team</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          <Button onClick={() => setComposeMode(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="sender">Sender</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Message Threads List */}
        <div className="w-1/3 border-r">
          <div className="p-4">
            <h3 className="font-medium mb-4">Conversations</h3>
            <div className="space-y-2">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedThread === thread.id
                      ? 'bg-blue-50 border-blue-200 border'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedThread(thread.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{thread.subject}</h4>
                      <p className="text-xs text-gray-600 truncate">
                        {thread.participants.join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(thread.lastMessage)}
                      </p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 flex flex-col">
          {currentThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentThread.subject}</h3>
                    <p className="text-sm text-gray-600">
                      {currentThread.participants.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.providerId ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-3/4 ${message.providerId ? 'bg-gray-100' : 'bg-blue-600 text-white'} rounded-lg p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {message.providerId ? 'Provider' : 'You'}
                          </span>
                          <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <Clock className="w-3 h-3" />
                          {formatDate(message.timestamp)}
                          {message.status === 'read' && (
                            <CheckCheck className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded"
                            >
                              {getFileIcon(attachment.type)}
                              <span className="text-sm flex-1">{attachment.name}</span>
                              <span className="text-xs opacity-75">
                                {formatFileSize(attachment.size)}
                              </span>
                              <Button variant="ghost" size="sm">
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t">
                <div className="flex items-start gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    className="flex-1"
                    rows={3}
                  />
                  <Button>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose New Message Modal */}
      {composeMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">New Message</h2>
                <Button variant="ghost" size="sm" onClick={() => setComposeMode(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <Select value={newMessage.recipientId} onValueChange={(value) => setNewMessage(prev => ({ ...prev, recipientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-gray-500">{provider.specialty}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <Select value={newMessage.priority} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message..."
                  rows={6}
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileAttach}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-3"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach Files
                </Button>
                
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {getFileIcon(file.type)}
                        <span className="text-sm flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Secure Communication</p>
                    <p>This message will be encrypted and securely transmitted to your healthcare provider. Only authorized personnel can access these messages.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setComposeMode(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.subject || !newMessage.content || !newMessage.recipientId}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 