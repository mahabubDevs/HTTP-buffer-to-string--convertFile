const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const uploadDirectory = path.join(__dirname, 'upload');

// upload foler na thalke create korbe
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'POST' && parsedUrl.pathname === '/upload') {
        const boundary = req.headers["content-type"].split('=')[1];
        let bufferData = [];

        req.on('data', (chunk) => {
            // string store kore na ti array te store kore
            bufferData.push(chunk); 
        });

        req.on("end", () => {
            // array te store kora data ke string e convert kore
            let BufferConvertString = Buffer.concat(bufferData).toString('binary'); 
            const parts = BufferConvertString.split(`--${boundary}`);

            for (const part of parts) {
                if (part.includes('Content-Disposition')) {
                    const fileDataStart = part.indexOf('\r\n\r\n') + 4;
                    const fileDataEnd = part.lastIndexOf('\r\n');
                    const fileData = part.slice(fileDataStart, fileDataEnd);
                    const match = part.match(/filename="(.+?)"/);

                    if (match) {
                        const fileName = match[1].trim(); // trim kore faka space remove korse
                        const filePath = path.join(uploadDirectory, fileName);

                        console.log(`Saving file: ${filePath}`);
                        fs.writeFileSync(filePath, fileData, 'binary');

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'File uploaded successfully', filename: fileName }));
                    }
                }
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});



