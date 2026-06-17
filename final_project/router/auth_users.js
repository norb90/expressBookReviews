const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = require("../users.js");

// FIX 1: validate user exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// FIX 2: authenticate user
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};

// LOGIN
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign(
            { data: username },
            "access",
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).json({
            message: "User successfully logged in"
        });
    }

    return res.status(401).json({
        message: "Invalid Login"
    });
});

// FIX 3: middleware (VERY IMPORTANT)
const auth = (req, res, next) => {
    if (req.session.authorization) {
        next();
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
};

// ADD REVIEW
regd_users.put("/review/:isbn", auth, (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added successfully",
        reviews: books[isbn].reviews
    });
});

// DELETE REVIEW
regd_users.delete("/review/:isbn", auth, (req, res) => {

    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            reviews: books[isbn].reviews
        });
    }

    return res.status(404).json({
        message: "Review not found"
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;