import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Activity from './pages/Activity';
import { Requests } from './pages/Requests';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import BookDetails from './pages/BookDetails';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import { OtpLogin } from './pages/OtpLogin';
import SavedBooks from './pages/SavedBooks';
import { Messages } from './pages/Messages';
import { Toaster } from 'react-hot-toast';
import { getToken } from './lib/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#f2ece4',
            color: '#2b1d16',
            border: '1px solid #d9c5b2',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            fontFamily: '"Zilla Slab", serif',
            fontWeight: 600,
            letterSpacing: '0.05em'
          },
          success: {
            iconTheme: { primary: '#5c4033', secondary: '#eae0d5' },
          },
          error: {
            iconTheme: { primary: '#A83232', secondary: '#ffffff' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<OtpLogin />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="library" element={<Library />} />
          <Route path="saved" element={<SavedBooks />} />
          <Route path="activity" element={<Activity />} />
          <Route path="messages" element={<Messages />} />
          <Route path="requests" element={<Requests />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user/:id" element={<UserProfile />} />
          <Route path="book/:id" element={<BookDetails />} />
          <Route path="edit/:id" element={<EditBook />} />
          <Route path="add" element={<AddBook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
