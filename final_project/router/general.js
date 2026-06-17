const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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

// Async route: Get books by title using Axios

const filterByTitle = (books, title) => {
    let result = [];

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
            result.push(books[isbn]);
        }
    });

    return result;
};

public_users.post("/register", (req,res) => {
        return res.status(200).send(JSON.stringify(books, null, 4));
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

    return res.status(200).json(filteredBooks);

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

    return res.status(200).json(filteredBooks);

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    return res.status(200).json(books[isbn].reviews);

});

// POST /register
public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

     // Validate input: ensure both username and password are provided
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

    // Add new user to the users array
    users.push({
        username: username,
        password: password
    });

    // Return success response
    return res.status(201).json({
        message: "User successfully registered. Now you can login"
    });
});


// Async route: Get books by author using Axios and async/await pattern
public_users.get('/async/author/:author', function (req, res) {

    const author = req.params.author;

    axios.get('http://localhost:5000/')
        .then(response => {

            // Filter books by author
            const filteredBooks = filterByAuthor(response.data, author);

            // If books exist, return them
            if (filteredBooks.length > 0) {
                return res.status(200).json(filteredBooks);
            }

            // If no books found, return 404
            return res.status(404).json({
                message: "Author not found"
            });

        })
        .catch(error => {
            // Handle server or network errors
            return res.status(500).json({
                message: error.message
            });
        });
});

// Async route: Get book details by ISBN using async/await and Axios// Async route: Get book details by ISBN using async/await and Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {

    try {
        const isbn = req.params.isbn;

        const books = await getAllBooks();

        if (books[isbn]) {
            return res.status(200).json(books[isbn]);
        }

        return res.status(404).json({
            message: "ISBN not found"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});

public_users.get('/async/title/:title', function (req, res) {

    const title = req.params.title;

    axios.get('http://localhost:5000/')
        .then(response => {

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

module.exports.general = public_users;