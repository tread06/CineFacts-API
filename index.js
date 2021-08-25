const express = require('express');
const morgan = require('morgan');

const app = express();

//console log
app.use(morgan('common'));

//access static files
app.use(express.static('public'));


//Get all movies
app.get('/movies',(req, res) => {
    //to do, get list from db
    res.json({
        movies: [
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
            {title: "title", description: "description", genre: "genre", director: "director", imageUrl: "imageUrl"},
        ]
    });
});

//get a movie by id
app.get('/movies/:title',(req, res) => {
    //to do: get movie by title from db
    movie = {
        title: "title",
        description: "description",
        genre: "genre",
        director: "director",
        imageUrl: "imageUrl"
    }
    res.json(movie);
});

//get a genre by name
app.get('/genres/:name',(req, res) => {
    //to do: get genre by name from db
    genre = {
        name: "name",
        description: "description"
    }
    res.json(genre);
});

//get a genre by name
app.get('/directors/:name',(req, res) => {
    //to do: get director by name from db
    director = {
        name: "name",
        bio: "bio",
        birthYear: "birthYear",
        deathYear: "deathYear"
    }
    res.json(director);
});

//create new user
app.post('/users',(req, res) => {
    //to do: create user using body data
    res.send("user created");
});

//update user name (name only)
app.put('/users/:user/:name',(req, res) => {
    //to do: get user from db
    //update name only
    res.send("user name was changed from " + req.params.user + " to " +req.params.name);
});

//add movie to user list
//This may use a url param if the books are chosen from a list.
//Assuming book data is in the body for now.
app.post('/users/:user/movies',(req, res) => {
    //to do: get list from db using user id
    //update list
    res.send("Book added to "+ req.params.user +"'s book list.");
});

//remove movie from user list
//assuming that the movie is chosen from a list 
app.delete('/users/:user/movies/:index',(req, res) => {
    //to do: get list from db using user id
    //remove at index
    res.send("Book at index: "+ req.params.index +" was removed from "+ req.params.user +"'s book list.");
});

//delete user
app.delete('/users/:user',(req, res) => {
    //to do: delete user
    res.send("User: "+req.params.user+ " was deleted");
});

//documentation
app.get('/documentation',(req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});

//home
app.get('/n',(req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//error handing
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured.');
});

app.listen(8080);