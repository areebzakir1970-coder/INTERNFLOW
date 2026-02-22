import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './utils/db.js';
import userRoutes from './routes/user.route.js';
import jobRoutes from './routes/job.route.js';
import companyRoutes from './routes/company.route.js';
import applicationRoutes from './routes/application.route.js';
import jobHuntRoutes from './routes/jobHunt.route.js';
import chatRoutes from './routes/chat.route.js';
import path from 'path';
dotenv.config({});
const app = express();
const httpServer = createServer(app);

const _dirname = path.resolve();

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://jobportal-xi-two.vercel.app",
      "https://jobportal-oysq599u5-m-areebs-projects.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Health check endpoint (keep a simple backend response under /api)
app.get('/api/health', (req, res) => {
  res.send('Welcome to the InternshipPortal Backend!');
});
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://jobportal-xi-two.vercel.app',
    'https://jobportal-oysq599u5-m-areebs-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Socket.IO connection handling
io.on('connection', (socket) => {
  
  
  // Join chat room based on application
  socket.on('join-chat', (applicationId) => {
    socket.join(`chat-${applicationId}`);
  });
  
  // Handle incoming messages
  socket.on('send-message', async (data) => {
    const { chatId, senderId, content, applicationId } = data;
    
    // Broadcast to all users in the chat room
    io.to(`chat-${applicationId}`).emit('new-message', {
      chatId,
      senderId,
      content,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    
  });
});

const PORT = process.env.PORT || 8000;

// Serve built frontend assets (only in local development)
// In production, frontend is deployed separately on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(_dirname, "/frontend/dist")));
  // Express 5-safe catch-all: serve SPA for non-API routes
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(_dirname, 'frontend', 'dist', 'index.html'));
  });
}

// API routes
app.use('/api/v1/user', userRoutes);
//http://localhost:8000/api/v1/user/register
//http://localhost:8000/api/v1/user/login
//http://localhost:8000/api/v1/user/profile/update
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/job', jobRoutes);
app.use('/api/v1/application', applicationRoutes);
app.use('/api/v1/job-hunt', jobHuntRoutes);
app.use('/api/v1/chat', chatRoutes);
//http://localhost:8000/api/v1/application/apply/:id
//http://localhost:8000/api/v1/application/get
//http://localhost:8000/api/v1/application/:id/applicants
//http://localhost:8000/api/v1/application/status/:id/update
//http://localhost:8000/api/v1/job/get

// Note: static + SPA catch-all are registered above to ensure '/' serves the frontend

httpServer.listen(PORT, () => {
    connectDB();
  
});