import { Book, User, Activity, Conversation } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Prince E.',
  email: 'princee0391@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
  location: 'Main Campus, Block B',
  booksOwned: ['b1', 'b3', 'b5'],
  booksBorrowed: ['b2']
};

export const BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'The Republic',
    author: 'Plato',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    category: 'Philosophy',
    ownerName: 'Prince E.',
    location: 'Main Campus',
    status: 'available',
    description: 'A foundational work of Western philosophy.'
  },
  {
    id: 'b2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
    category: 'Computer Science',
    ownerName: 'Sarah J.',
    location: 'Engineering Block',
    status: 'borrowed',
    description: 'A handbook of agile software craftsmanship.'
  },
  {
    id: 'b3',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
    category: 'History',
    ownerName: 'Prince E.',
    location: 'Main Campus',
    status: 'available',
    description: 'A brief history of humankind.'
  },
  {
    id: 'b4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://images.unsplash.com/photo-1543005128-d1b210a2c03b?w=800&q=80',
    category: 'Literature',
    ownerName: 'Michael K.',
    location: 'Arts Quad',
    status: 'available',
    description: 'A classic of American literature.'
  },
  {
    id: 'b5',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
    category: 'Computer Science',
    ownerName: 'Prince E.',
    location: 'Science Center',
    status: 'available',
    description: 'The standard textbook for algorithms.'
  },
  {
    id: 'b6',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    category: 'Philosophy',
    ownerName: 'Elena R.',
    location: 'Graduate Lounge',
    status: 'available',
    description: 'The writings of the Roman Emperor Marcus Aurelius.'
  }
];

export const ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'borrow',
    userName: 'Sarah J.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bookTitle: 'The Republic',
    timestamp: '2 hours ago'
  },
  {
    id: 'a2',
    type: 'add',
    userName: 'Michael K.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bookTitle: 'The Great Gatsby',
    timestamp: '5 hours ago'
  },
  {
    id: 'a3',
    type: 'return',
    userName: 'Elena R.',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bookTitle: 'Meditations',
    timestamp: '1 day ago'
  }
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    participantName: 'Sarah J.',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    lastMessage: 'Is the book still available for borrowing?',
    lastTimestamp: '10:30 AM',
    unread: true
  }
];
