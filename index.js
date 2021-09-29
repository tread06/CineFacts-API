require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult, body } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const app = express();

// mongoose.connect('mongodb://localhost:27017/cinefactsDB', { useNewUrlParser: true, useUnifiedTopology: true })
// .then(() => {
//     console.log("Connected");
// }).catch((err) =>{
//     console.log(err);
// });

mongoose
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected');
  })
  .catch((err) => {
    console.log(err);
  });

//log requests
app.use(morgan('common'));

//body parsing
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//cors
const cors = require('cors');
//app.use(cors());

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

//auth (must be placed after body parsing)
let auth = require('./auth')(app);
const passport = require('passport');

//passport strategies
require('./passport');

//access static files
app.use(express.static('public'));

//Get all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        return res.status(200).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

//get a movie by title
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        if (movie) {
          return res.status(200).send(movie);
        } else {
          return res.status(404).send('movie not found.');
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

//update image genre
// app.patch(
//   '/movies/:title',
//   //passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     Movies.findOneAndUpdate(
//       { Title: req.params.title },
//       { Genre: req.body.Genre },
//       { overwrite: false, new: true }
//     )
//       .then((movie) => {
//         if (movie) {
//           console.log(req.body.ImageURL);
//           return res.status(200).send(movie);
//         } else {
//           return res.status(404).send('movie not found.');
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//         res.status(500).send('Error: ' + error);
//       });
//   }
// );

//create new user
/* Body JSON format
{
    Username: String,   UserName
    Password: String,   Password
    Email: String,      Email
    Birthday: Date      Birthday
}*/
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 3 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find({}, 'Username Email Birthday FavoriteMovies')
      .then((users) => {
        res.status(201).json({ users });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne(
      { Username: req.params.Username },
      'Username Email Birthday FavoriteMovies'
    )
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Update a user's info, by username (issue: not a unique identifier)
/* We’ll expect JSON in this format
{
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
}*/
app.put(
  '/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 3 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  //passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // check to make sure the token user === the using being updated
    // if (req.user.Username !== req.params.Username) {
    //   console.log('Token.Username does not match Params.Username.');
    //   return res.status(401).send('Unauth');
    // }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }, // return the updated document
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Add a movie to a user's list of favorites
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // check to make sure the token user === the using being updated
    if (req.user.Username !== req.params.Username) {
      console.log('Token.Username does not match Params.Username.');
      return res.status(401).send('Unauthorized');
    }

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // Return updated document
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//remove movie from user list
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // check to make sure the token user === the using being updated
    if (req.user.Username !== req.params.Username) {
      console.log('Token.Username does not match Params.Username.');
      return res.status(401).send('Unauthorized');
    }

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // Return updated document
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Delete a user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // check to make sure the token user === the using being updated
    if (req.user.Username !== req.params.Username) {
      console.log('Token.Username does not match Params.Username.');
      return res.status(401).send('Unauthorized');
    }

    Users.findOneAndRemove({ Username: req.params.Username })
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
  }
);

//documentation
app.get('/documentation', (req, res) => {
  res.sendFile(__dirname + '/Public/documentation.html');
});

//home
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Public/documentation.html');
});

//error handing
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.stack);
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
