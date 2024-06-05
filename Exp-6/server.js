const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace 'localhost' and '27017' with your MongoDB server details
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

async function onRequest(req, res) {
    const path = url.parse(req.url).pathname;
    console.log('Request for ' + path + ' received');

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const postData = querystring.parse(body);
            if (path === '/insert') {
                await insertData(req, res, postData);
            } else if (path === '/delete') {
                await deleteData(req, res, postData.regno);
            } else if (path === '/update') {
                await updateData(req, res, postData.regno, postData.mobile);
            } else if (path === '/display') {
                await displayTable(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
}

async function insertData(req, res, postData) {
    try {
        const database = client.db('Exp-6');
        const collection = database.collection('student');

        const result = await collection.insertOne(postData);
        console.log(`${result.insertedCount} document inserted`);

        // Respond with success message
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Document inserted successfully');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function deleteData(req, res, regno) {
    try {
        const database = client.db('Exp-6');
        const collection = database.collection('student');

        const result = await collection.deleteOne({ regno: regno });
        console.log(`${result.deletedCount} document deleted`);

        // Respond with appropriate message
        if (result.deletedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Document deleted successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Document not found');
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function updateData(req, res, regno, newMobile) {
    try {
        const database = client.db('Exp-6');
        const collection = database.collection('student');

        const result = await collection.updateOne({ regno: regno }, { $set: { mobile: newMobile } });
        console.log(`${result.modifiedCount} document updated`);

        // Respond with appropriate message
        if (result.modifiedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Mobile number updated successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Student Register Number not found');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function displayTable(req, res) {
    try {
        const database = client.db('Exp-6');
        const collection = database.collection('student');

        const students = await collection.find({}).toArray();

        // Generate HTML table dynamically based on retrieved documents
        let tableHtml = `
            <html>
                <head>
                    <title>Student Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>Student Details</h2>
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Register Number</th>
                            <th>Date of Birth</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Address</th>
                            <th>Mobile</th>
                            <th>Email</th>
                        </tr>
        `;
        students.forEach(student => {
            tableHtml += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.regno}</td>
                    <td>${student.dob}</td>
                    <td>${student.age}</td>
                    <td>${student.gender}</td>
                    <td>${student.address}</td>
                    <td>${student.mobile}</td>
                    <td>${student.email}</td>
                </tr>
            `;
        });
        tableHtml += `
                    </table>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(tableHtml);
        res.end();
    } catch (error) {
        console.error('Error displaying table:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

// Create HTTP server
http.createServer(onRequest).listen(7050);
console.log('Server is running...');
