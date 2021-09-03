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
mongoose.set('debug', true);



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
/* Body JSON format
{
    ID: Integer,        _id
    Username: String,   UserName
    Password: String,   Password
    Email: String,      Email
    Birthday: Date      Birthday
}*/
app.post('/users',(req, res) => {
/* using postman, sending this body:
{
    "ID": 1234,
    "Username": "Jerry",
    "Password": "password1234",
    "Email": "Jerry@test.com",
    "Birthday": "1999-03-10"
}*/
    
    // logs "Jerry" as expected
    let params = {'UserName': req.body.Username};
    console.log("query: " + params);

    Users.findOne(params) //note: in the DB, Username is UserName.
    .then((user) => {
        if (user) {            
            console.log(user);            
            /* always returns true and logs the first user, which is...
            {
                _id: new ObjectId("612da4b8b3c42b60d761ae9b"),
                UserName: 'John',
                Password: 'password1234',
                Birthday: 1985-02-19T00:00:00.000Z,
                FavoriteMovies: [
                    new ObjectId("612d75bb7e144b08d5a5e4c6"),
                    new ObjectId("612d75e97e144b08d5a5e4c7"),
                    new ObjectId("612d88207e144b08d5a5e4d4")
                ],
                Email: 'John@test.com'
            }*/
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users
            .create({
                UserName: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{
                console.log("User: "+user.UserName+ " was added");
                res.status(201).json(user)})
            .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
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