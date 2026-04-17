# Product Requirements Document (PRD)

## Product Name
BooKLooP - Library System

## Product Overview
BooKLooP is a library management and book exchange platform that allows users to interact, view activity logs, check user profiles, and use an integrated chat interface. It is designed to be a fully responsive Progressive Web App (PWA) with mobile support.

## Key Features
1. **Authentication (Passwordless)**: 
   - Users log in securely via an OTP (One-Time Password) system.
   
2. **User Profiles & Activity**: 
   - Dedicated User Profile pages identifying individual users.
   - Global or personal Activity Log feed where clicking on a user profile navigates to their profile page.

3. **Communication (Chat)**:
   - An integrated real-time chat interface that works seamlessly on both desktop and mobile views.

4. **Library System & Book Exchange**:
   - Capabilities to exchange or log activity related to book interactions. 
   - A robust frontend management layer designed for BookLoop library functions.

5. **Progressive Web App (PWA)**:
   - Capable of being installed as a PWA, storing persistent user sessions so users do not get automatically logged out across visits.

## Technical Scope for Testing
- **Frontend**: React-based UI (Vite) running on Port 3000. Tests should cover responsive design (mobile/desktop scaling), PWA stability functionality, chat rendering, activity log navigation, and error boundaries (ensuring pages do not crash on undefined props).
- **Backend**: Express-based Node.js service managing the OTP, user data, activity logs, and chat API.
