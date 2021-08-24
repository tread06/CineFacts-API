const express = require('express');
const morgan = require('morgan');

const app = express();

//console log
app.use(morgan('common'));

//access static files
app.use(express.static('public'));

//error handing
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured.');
});

//top 10 movies
app.get('/movies',(req, res) => {
    res.json({
        movies: [
            {title: "movie_01", description: "movie description"},
            {title: "movie_02", description: "movie description"},
            {title: "movie_03", description: "movie description"},
            {title: "movie_04", description: "movie description"},
            {title: "movie_05", description: "movie description"},
            {title: "movie_06", description: "movie description"},
            {title: "movie_07", description: "movie description"},
            {title: "movie_08", description: "movie description"},
            {title: "movie_09", description: "movie description"},
            {title: "movie_10", description: "movie description"}
        ]
    });
});

//documentation
app.get('/documentation',(req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});

//home
app.get('/n',(req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080);