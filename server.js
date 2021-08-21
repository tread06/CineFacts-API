const http = require('http');
const fs = require('fs');

http.createServer((request, response) => {

//assign default path data to index.html
let filePath = __dirname + '/index.html';

//parse the request
const baseUrl = request.protocol + '://' + request.headers.host + '/';
const reqUrl = new URL(request.url, baseUrl);    

//log the request (ignore favicon requests)
if(reqUrl.pathname != '/favicon.ico'){
    fs.appendFile('log.txt', 'URL: ' + reqUrl.href +'\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log( reqUrl.href +' logged.');
        }
    });
}    

//assign documentation file path if requested
if(reqUrl.searchParams.has('documentation')){
    filePath = __dirname + '/documentation.html';
}

//return path data
fs.readFile(filePath, (err, data) => {
    if (err) {
        throw err;
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();
});

}).listen(8080);

console.log('CineFacts API server is running on port 8080.');