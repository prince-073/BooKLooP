import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import BookDetails from './pages/BookDetails';
import AddBook from './pages/AddBook';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="library" element={<Library />} />
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<Profile />} />
          <Route path="book/:id" element={<BookDetails />} />
          <Route path="add" element={<AddBook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
