import app from './app.js';
import http from 'http';
import { initSocket } from './socket.js';

const port = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});