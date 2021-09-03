const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const app = express();

mongoose.connect('mongodb://localhost:27017/cinefactsDB', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connected");
}).catch((err) =>{
    console.log(err);
});

//log requests
app.use(morgan('common'));

//body parsing
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

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

//get a movie by title
app.get('/movies/:title',(req, res) => {
    Movies.findOne({ Title: req.params.title })
    .then((movie) => {
        if (movie) {
            return res.status(200).send(movie);
        } else {
            return res.status(404).send("movie not found.");
        }
    })
    .catch((error) => { 
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
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

// Update a user's info, by username (issue: not a unique identifier)
/* We’ll expect JSON in this format
{
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ UserName: req.params.Username }, { $set:
        {
            UserName: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, // return the updated document
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ UserName: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, // Return updated document
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//remove movie from user list
app.delete('/users/:Username/movies/:MovieID',(req, res) => {
    Users.findOneAndUpdate({ UserName: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, // Return updated document
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ UserName: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//documentation
app.get('/documentation',(req, res) => {
    res.sendFile(__dirname + '/public/documentation.html');
});

//home
app.get('/',(req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

//error handing
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured.');
});
app.listen(8080);