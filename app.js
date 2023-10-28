import express from "express";
import bodyParser from "body-parser";
import connectDB from "./database/db/db.js";
import User from "./database/model/model.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// session-setup

app.use(
    session({
        secret: "Thisisourlittlesecret.",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// --------------app.get -------------

app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/public/html/homeAuth.html");
    } else {
        res.sendFile(__dirname + "/public/html/home.html");
    }
});
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/html/login.html");
});
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/html/register.html");
});
app.get("/profile", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/public/html/profile.html");
    } else {
        res.redirect("/login");
    }
});
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/public/html/secrets.html");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully loged-Out");
            res.redirect("/");
        }
    });
});

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
);
app.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
    "/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        res.redirect("/");
    }
);
app.get(
    "/auth/github/secrets",
    passport.authenticate("github", { failureRedirect: "/login" }),
    function (req, res) {
        res.redirect("/");
    }
);

// --------------app.post -------------

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.logIn(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function () {
                console.log("Successfully loged-In");
                res.redirect("/");
            });
        }
    });
});

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.register(
            new User({ username: email, provider: "local" }),
            password
        );

        if (user) {
            req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/login");
                } else {
                    console.log("Successfully loged-In");
                    res.redirect("/");
                }
            });
        } else {
            res.redirect("/register");
        }
    } catch (error) {
        if (error) {
            console.log(error.message);
            res.redirect("/register");
        }
    }
});

// --------------app.listen -------------

const PORT = 3000;
connectDB().then(() => {
    app.listen(PORT, console.log(`Server is up on port ${PORT}`));
});
