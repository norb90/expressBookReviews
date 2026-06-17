const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

// Fetch all books from the local API using Axios
const getAllBooks = async () => {
    const response = await axios.get("http://localhost:5000/");
    return response.data;
};

// Filter books by author name
const filterByAuthor = (books, author) => {
    let result = [];

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
            result.push(books[isbn]);
        }
    });

    return result;
};

// Filter books by title name
const filterByTitle = (books, title) => {
    let result = [];

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
            result.push(books[isbn]);
        }
    });

    return result;
};

/* =========================================================
   AUTH / REGISTER ROUTES
   ========================================================= */

// NOTE: This route implementation is overridden below with correct logic

public_users.post("/register", (req,res) => {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

/* =========================================================
   BASIC BOOK ROUTES
   ========================================================= */

// Get all books in the system
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details using ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
});

// Get books by author (synchronous version)
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;

    let filteredBooks = [];

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
            filteredBooks.push(books[isbn]);
        }
    });

    return res.status(200).json(filteredBooks);
});

// Get books by title (synchronous version)
public_users.get('/title/:title', function (req, res) {

    const title = req.params.title;

    let filteredBooks = [];

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
            filteredBooks.push(books[isbn]);
        }
    });

    return res.status(200).json(filteredBooks);
});

// Get reviews for a specific book ISBN
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    return res.status(200).json(books[isbn].reviews);
});

/* =========================================================
   USER REGISTRATION ROUTE (FINAL VERSION)
   ========================================================= */

// Register a new user with validation and duplicate check
public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            message: "Unable to register user."
        });
    }

    // Check if user already exists
    if (doesExist(username)) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    // Add user to database
    users.push({
        username: username,
        password: password
    });

    // Success response
    return res.status(201).json({
        message: "User successfully registered. Now you can login"
    });
});

/* =========================================================
   ASYNC ROUTES (AXIOS + PROMISES / ASYNC-AWAIT)
   ========================================================= */

// Get books by author (ASYNC version using Axios + then/catch)
public_users.get('/async/author/:author', function (req, res) {

    const author = req.params.author;

      // Validate author parameter
      if (!author || author.trim() === "") {
        return res.status(400).json({
            message: "Author parameter is required"
        });
    }

    axios.get('http://localhost:5000/')
        .then(response => {

            // Filter books by author
            const filteredBooks = filterByAuthor(response.data, author);

            // Success case
            if (filteredBooks.length > 0) {
                return res.status(200).json(filteredBooks);
            }

            // Not found case
            return res.status(404).json({
                message: "Author not found"
            });

        })
        .catch(error => {

            // Server / network error
            return res.status(500).json({
                message: error.message
            });
        });
});

// Get book by ISBN (ASYNC + await)
public_users.get('/async/isbn/:isbn', async function (req, res) {

    try {

        const isbn = req.params.isbn;

        // Fetch all books
        const books = await getAllBooks();

        // Check if ISBN exists
        if (books[isbn]) {
            return res.status(200).json(books[isbn]);
        }

        // Not found
        return res.status(404).json({
            message: "ISBN not found"
        });

    } catch (error) {

        // Server error
        return res.status(500).json({
            message: error.message
        });
    }
});

// Get books by title (ASYNC version using Axios)
public_users.get('/async/title/:title', function (req, res) {

    const title = req.params.title;

    axios.get('http://localhost:5000/')
        .then(response => {

            // Filter by title
            const filtered = filterByTitle(response.data, title);

            if (filtered.length > 0) {
                return res.status(200).json(filtered);
            }

            return res.status(404).json({
                message: "Title not found"
            });

        })
        .catch(error => {

            return res.status(500).json({
                message: error.message
            });
        });
});

/* =========================================================
   EXPORT ROUTES
   ========================================================= */

module.exports.general = public_users;