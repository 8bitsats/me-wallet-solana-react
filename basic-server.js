const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    
    res.end('Basic server is working!');
});

server.listen(5001, '0.0.0.0', () => {
    console.log('Server running at http://127.0.0.1:5001/');
    console.log('Server details:', server.address());
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
