# Ditto Quest - Telegram Mini App Frontend

A high-performance React-based Telegram Mini App (TMA) client for Ditto Quest, featuring real-time Socket.IO communication, optimized mobile performance, and seamless Telegram ecosystem integration.

## 🎮 Live Demo

**Play Now:** [Ditto Quest on Telegram](https://t.me/ditto_quest_bot/dqgame)

Experience the full TMA directly in Telegram across web and desktop platforms.

## 🌟 Project Overview

This repository contains the frontend client for Ditto Quest, built as a Telegram Mini App using React and TypeScript. The application provides a seamless cross-platform gaming experience with real-time communication, optimized performance, and deep Telegram integration.

### Frontend-Specific Features

📱 **Telegram Mini App Integration**
- Native TMA implementation using @twa-dev/sdk
- Seamless Telegram authentication flow
- WebApp API integration for native Telegram experience across all platforms
- Telegram Stars payment processing from client-side

⚡ **Performance Optimizations**
- Intelligent image preloading and caching system
- Memory-efficient state management with Redux Toolkit
- Lazy loading for game assets and components
- Optimized bundle splitting for fast loading times

🎨 **Cross-Platform UI/UX**
- Responsive design optimized for all Telegram platforms (web, desktop)
- Touch and click-friendly interface with multi-input support
- Smooth animations using Framer Motion
- Progressive loading states and shimmer effects

🔄 **Real-time Communication**
- Socket.IO client for instant game updates
- WebSocket reconnection handling with state persistence
- Event-driven architecture for responsive gameplay
- Optimized data synchronization with backend

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Redux Toolkit** for predictable state management
- **Socket.IO Client** for real-time server communication
- **Framer Motion** for smooth animations and transitions
- **Bootstrap** for responsive UI framework

### State Management Architecture
```typescript
// Multi-context architecture for different game systems
- LoginContext: Authentication and session management
- UserContext: Player data and progression
- CombatContext: Real-time battle state
- GachaContext: Slime gacha and inventory mechanics
- IdleContext: Background progression tracking
```

### Real-time Features
- WebSocket-based live updates for all game activities
- Persistent connection management with auto-reconnection
- Event queue system for handling offline/online transitions
- Optimistic UI updates with server reconciliation

### Performance Engineering
- **Preload Manager**: Intelligent asset loading with progress tracking
- **Image Caching**: Memory-efficient image cache with fallbacks
- **Component Optimization**: Memoization and lazy loading strategies
- **Bundle Analysis**: Code splitting for optimal loading performance

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- yarn package manager
- Access to Ditto Quest Socket Adapter backend

### Installation Steps

1. **Clone and setup**
```bash
git clone https://github.com/ditto-dao/ditto-quest-tma-vite.git
cd ditto-quest-tma-vite
yarn install
```

2. **Development server**
```bash
yarn dev
# Access at http://localhost:5173
```

3. **Production build**
```bash
yarn build
yarn preview
```

### Available Scripts

```bash
# Development
yarn dev          # Start dev server with hot reload
yarn build        # Create production build
yarn preview      # Preview production build locally

# Code Quality
yarn type-check   # TypeScript type checking
yarn lint         # ESLint code analysis

# Testing
yarn test         # Run test suite
```

## 📱 Telegram Mini App Implementation

### Authentication Flow
```typescript
// Telegram WebApp authentication
WebApp.ready();
const initData = WebApp.initData;
const user = WebApp.initDataUnsafe.user;

// Socket validation with Telegram data
socket.emit('validate-login', {
  telegramId: user.id,
  username: user.username,
  initData: initData
});
```

### Native TMA Features
- **WebApp API Integration**: Theme detection and platform compatibility
- **Telegram Authentication**: Secure login using Telegram's initData
- **Stars Payments**: Client-side payment initiation and handling
- **Share Functionality**: Deep linking for social features

## 🎨 UI/UX Implementation

### Design System
- **Animation System**: Framer Motion for smooth transitions
- **Loading States**: Shimmer effects and progressive loading
- **Error Boundaries**: Graceful error handling with user feedback

### Performance Features
- **Image Optimization**: WebP support with fallbacks
- **Lazy Loading**: Route-based code splitting
- **Memory Management**: Cleanup on component unmount

## 🔄 Real-time Communication

### Socket.IO Integration
```typescript
// Event-driven communication with backend
const socket = io(SOCKET_ORIGIN, {
  path: SOCKET_PATH,
  transports: ['websocket', 'polling']
});

// Real-time game events
socket.on('combat-update', handleCombatUpdate);
socket.on('slime-gacha-update', handleGachaResult);
socket.on('mission-update', handleMissionProgress);
```

### State Synchronization
- **Optimistic Updates**: Immediate UI feedback with server confirmation
- **Conflict Resolution**: Handling state conflicts during reconnection
- **Event Queuing**: Buffering events during network interruptions
- **Delta Updates**: Efficient partial state updates

## 🚀 Performance Optimizations

### Loading Strategy
```typescript
// Intelligent preloading system
class PreloadManager {
  async preloadEverything(userData?: any) {
    await this.preloadStaticAssets();
    if (userData) {
      await this.preloadDynamicUserData(userData);
    }
    await this.preloadGameAssets();
  }
}
```

### Memory Management
- **Image Caching**: LRU cache for game images
- **Component Cleanup**: Proper event listener cleanup
- **State Optimization**: Normalized state structure
- **Bundle Splitting**: Dynamic imports for route-based loading

### Cross-Platform Performance
- **60fps Animations**: Hardware-accelerated CSS animations
- **Input Optimization**: Debounced touch and click events
- **Efficient Rendering**: Optimized render cycles across devices
- **Network Efficiency**: Request batching and caching

## 🔧 Development Features

### Type Safety
```typescript
// Comprehensive TypeScript definitions
interface User {
  telegramId: string;
  level: number;
  goldBalance: number;
  inventory: Inventory[];
  // ... detailed type definitions
}
```

### Error Handling
- **Error Boundaries**: Component-level error isolation
- **Network Resilience**: Automatic retry with exponential backoff
- **User Feedback**: Toast notifications for errors and success states
- **Debug Tools**: Development-only debugging utilities

### Development Tools
- **Hot Reload**: Instant development feedback
- **Redux DevTools**: State inspection and time-travel debugging
- **Network Monitoring**: Socket.IO connection status and events
- **Performance Profiling**: React DevTools integration

## 🏗️ Build & Deployment

### Production Build
```bash
# Optimized production bundle
yarn build

# Bundle analysis
yarn build --analyze
```

### Deployment Options
- **GitHub Pages**: Static hosting with GitHub Actions
- **Vercel**: Zero-config deployment with preview branches
- **Netlify**: Continuous deployment with form handling
- **AWS S3**: Static hosting with CloudFront CDN