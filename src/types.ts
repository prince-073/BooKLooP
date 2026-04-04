export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  ownerName: string;
  location: string;
  status: 'available' | 'borrowed';
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  location: string;
  booksOwned: string[]; // IDs of books owned
  booksBorrowed: string[]; // IDs of books currently borrowed
}

export interface Activity {
  id: string;
  type: 'borrow' | 'return' | 'add';
  userName: string;
  userAvatar: string;
  bookTitle: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unread?: boolean;
}
