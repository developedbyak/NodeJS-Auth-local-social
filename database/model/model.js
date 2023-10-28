import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as GitHubStrategy } from 'passport-github2';

const userSchema = new Schema({
    username: String,
    googleId: String,
    githubId: String,
    password: String,
    provider: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use any method both are working !
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.serializeUser(function (user, cb) {
//     process.nextTick(function () {
//         cb(null, { id: user.id, username: user.username });
//     });
// });

// passport.deserializeUser(function (user, cb) {
//     process.nextTick(function () {
//         return cb(null, user);
//     });
// });

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/secrets",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },

        function (accessToken, refreshToken, profile, cb) {
            console.log(profile);
            User.findOne({ googleId: profile.id })
                .then((user) => {
                    if (!user) {
                        user = new User({
                            username: profile.displayName,
                            googleId: profile.id,
                            provider: profile.provider,
                        });
                        user.save()
                            .then((savedUser) => {
                                cb(null, savedUser);
                            })
                            .catch((err) => {
                                cb(err);
                            });
                    } else {
                        cb(null, user);
                    }
                })
                .catch((err) => {
                    cb(err);
                });
        }
    )
);

// todo: if you want to use github login use code below.
// todo: make sure to uncomment import for GitHubStrategy.

// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRET,
//   callbackURL: "http://localhost:3000/auth/github/secrets"
// },
//   function (accessToken, refreshToken, profile, done) {
//     console.log(profile);
//     User.findOne({ githubId: profile.id })
//       .then((user) => {
//         if (!user) {
//           user = new User({
//             username: profile.displayName,
//             githubId: profile.id,
//             provider: profile.provider,
//           });
//           user.save()
//             .then((savedUser) => {
//               done(null, savedUser);
//             })
//             .catch((err) => {
//               done(err);
//             });
//         } else {
//           done(null, user);
//         }
//       })
//       .catch((err) => {
//         done(err);
//       });
//   }
// ));

export default User;
