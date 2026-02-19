import app from './app.js';
import http from 'http';

const port = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});