const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { json } = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;
const app = express();

mongoose.connect('mongodb://localhost:27017/cinefactsDB', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connected");
}).catch((err) =>{
    console.log(err);
});
//mongoose.set('debug', true);


//log request
app.use(morgan('common'));
//body parser
app.use(bodyParser.json());
//access static files
app.use(express.static('public'));

//Get all movies
app.get('/movies',(req, res) => {
    Movies.find()
    .then((movies) => {
        return res.status(200).json(movies);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
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

//create new user
/* Body JSON format
{
    Username: String,   UserName
    Password: String,   Password
    Email: String,      Email
    Birthday: Date      Birthday
}*/
app.post('/users',(req, res) => { 
    Users.findOne({ UserName: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users.create({
                UserName: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
        })
        .then((user) =>{
            res.status(201).json(user);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        })
    }})
    .catch((error) => { 
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
            res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ UserName: req.params.Username })
    .then((user) => {
            res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//update user name (name only)
app.put('/users/:user/:name',(req, res) => {
    //to do: get user from db
    //update name only
    res.send("user name was changed from " + req.params.user + " to " +req.params.name);
});

//add movie to user list
app.post('/users/:user/movies',(req, res) => {
    //to do: get list from db using user id
    //update list
    res.send("Book added to "+ req.params.user +"'s book list.");
});

//remove movie from user list
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