const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: { type: String, required: true },
  Director: {
    Name: String,
    Bio: String,
    BirthYear: Number,
    DeathYear: Number,
  },
  ImageURL: { type: String },
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

//password hashing
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

//important note: validate password is an instanced function that is called on individual documents.
//cannot use arrow functions because they bind "this" to the class and not the individual user document.
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
