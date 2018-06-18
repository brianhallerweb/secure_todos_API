const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
  tokens: [
    {
      access: {
        type: String
      },
      token: {
        type: String
      }
    }
  ]
});

// .pre is mongoose middleware. The callback function hashes
// and salts the password before saving to the db.
// "this" is bound to the user instance
userSchema.pre("save", function(next) {
  if (this.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err, hash) => {
        this.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// toJSON seems to run behind the scenes. It limits the response
// object to only include _id and email.
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return {
    _id: userObject._id,
    email: userObject.email
  };
};

// .methods is a mongoose object for user instance methods
// therefore, "this" is bound to the user instance
userSchema.methods.generateAuthToken = function() {
  const access = "auth";
  const token = jwt
    .sign({ _id: this._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();

  this.tokens.push({ access, token });

  return this.save().then(() => {
    return token;
  });
};

userSchema.methods.removeToken = function(token) {
  return this.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

// .statics is a mongoose object for User model methods
// therefore, "this" is bound to the User model
userSchema.statics.findByToken = function(token) {
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

userSchema.statics.findByCredentials = function(email, password) {
  return this.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) {
          reject(err);
        }
        if (!res) {
          reject();
        }
        resolve(user);
      });
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
