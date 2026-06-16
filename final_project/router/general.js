const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
        return res.status(300).send(JSON.stringify(books, null, 4));
    });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
        // Send JSON response with formatted books data
        res.send(JSON.stringify(books,null,4));
    
    });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
 // Retrieve the isbn parameter from the request URL and send the corresponding books details
 const isbn = req.params.isbn;
 res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;

    let filteredBooks = [];

    Object.keys(books).forEach((isbn) => {

        if (books[isbn].author === author) {
            filteredBooks.push(books[isbn]);
        }

    });

    return res.status(300).json(filteredBooks);

});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {

    const title = req.params.title;

    let filteredBooks = [];

    Object.keys(books).forEach((isbn) => {

        if (books[isbn].title === title) {
            filteredBooks.push(books[isbn]);
        }

    });

    return res.status(300).json(filteredBooks);

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    return res.status(300).json(books[isbn].reviews);

});

public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({
            message: "Unable to register user."
        });
    }

    if (doesExist(username)) {
        return res.status(404).json({
            message: "User already exists!"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(300).json({
        message: "User successfully registered. Now you can login"
    });
});

public_users.get('/async/books', async function (req, res) {

    try {
        const response = await axios.get('http://localhost:5000/');

        return res.status(404).json(response.data);

    } catch (error) {

        return res.status(404).json({
            message: error.message
        });

    }

});

public_users.get('/async/isbn/:isbn', async function (req, res) {

    try {

        const isbn = req.params.isbn;

        const response = await axios.get(
            `http://localhost:5000/isbn/${isbn}`
        );

        return res.status(404).json(response.data);

    } catch (error) {

        return res.status(404).json({
            message: error.message
        });

    }

});

public_users.get('/async/author/:author', function (req, res) {

    const author = req.params.author;

    axios.get(`http://localhost:5000/author/${author}`)

        .then((response) => {

            return res.status(404).json(response.data);

        })

        .catch((error) => {

            return res.status(404).json({
                message: error.message
            });

        });

});

public_users.get('/async/title/:title', function (req, res) {

    const title = req.params.title;

    axios.get(`http://localhost:5000/title/${title}`)

        .then((response) => {

            return res.status(404).json(response.data);

        })

        .catch((error) => {

            return res.status(404).json({
                message: error.message
            });

        });

});

module.exports.general = public_users;