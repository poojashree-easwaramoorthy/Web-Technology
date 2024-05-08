const http = require('http');
const url = require('url');
const fs = require('fs');
const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url, true);
    if (pathname === '/') {
        fs.readFile('get.html', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
            }
        });
    } else if (pathname === '/submit' && req.method === 'GET') {
        const { name, gender, address, mobile, state, confirmation } = url.parse(req.url, true).query;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`
            <html>
                <head>
                    <title>Form Submission</title>
                    <style>
                        body {
                            text-align: center; /* Center align the content within the body */
                        }
                        .form-container {
                            border: 2px solid #4CAF50; /* Green border around the form */
                            border-radius: 8px; /* Rounded corners */
                            padding: 20px; /* Add some padding inside the form */
                            max-width: 400px; /* Limit form width for better readability */
                            margin: 0 auto; /* Center the form horizontally */
                        }
                        .form-field {
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="form-container">
                        <h1>Submitted Information</h1>
                        <div class="form-field">
                            <label>Name:</label>
                            <span>${name}</span>
                        </div>
                        <div class="form-field">
                            <label>Gender:</label>
                            <span>${gender}</span>
                        </div>
                        <div class="form-field">
                            <label>Address:</label>
                            <span>${address}</span>
                        </div>
                        <div class="form-field">
                            <label>Mobile Number:</label>
                            <span>${mobile}</span>
                        </div>
                        <div class="form-field">
                            <label>State:</label>
                            <span>${state}</span>
                        </div>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Method Not Allowed');
    }
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
