const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login

    regd_users.post("/login", (req, res) => {

        const username = req.body.username;
        const password = req.body.password;
    
        if (!username || !password) {
            return res.status(404).json({
                message: "Error logging in"
            });
        }
    
        if (authenticatedUser(username, password)) {
    
            let accessToken = jwt.sign(
                {
                    data: username
                },
                "access",
                { expiresIn: 60 * 60 }
            );
    
            req.session.authorization = {
                accessToken,
                username
            };
    
            return res.status(300).send("User successfully logged in");
        }
    
        return res.status(208).json({
            message: "Invalid Login. Check username and password"
        });
    });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;

    const username = req.session.authorization.username;

    books[isbn].reviews[username] = review;

    return res.status(300).json({
        message: "Review successfully added/updated"
    });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;

    const username = req.session.authorization.username;

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];

        return res.status(300).json({
            message: "Review deleted successfully"
        });
    }

    return res.status(404).json({
        message: "Review not found"
    });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
