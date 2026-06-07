// Importing necessary libraries and modules
const mongoose = require('mongoose');            // MongoDB ODM library
const Customers = require('./customer');         // Imported MongoDB model for 'customers'
const express = require('express');              // Express.js web framework
const bodyParser = require('body-parser');       // Middleware for parsing JSON requests
const path = require('path');                    // Node.js path module for working with file and directory paths

//Custom errors
const { ValidationError, InvalidUserError, AuthenticationFailed } = require('./errors/CustomError');

// Creating an instance of the Express application
const app = express();

// Setting the port number for the server
const port = 3000;

// MongoDB connection URI and database name
const uri =  "mongodb://root:your_password@localhost:27017";
mongoose.connect(uri, {'dbName': 'customerDB'});

// Middleware to parse JSON requests
app.use("*", bodyParser.json());

// Serving static files from the 'frontend' directory under the '/static' route
app.use('/static', express.static(path.join(".", 'frontend')));

// Middleware to handle URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// POST endpoint for user login
app.post('/api/login', async (req, res) => {
    const data = req.body;
    console.log(data);
    let user_name = data['user_name'];
    let password = data['password'];

    // Querying the MongoDB 'customers' collection for matching user_name and password
    const documents = await Customers.find({ user_name: user_name, password: password });

    // If a matching user is found, set the session username and serve the home page
   try {
        const user = await Customers.findOne({ user_name: user_name });
        if (!user) {
            throw new InvalidUserError("No such user in database");
        }
        if (user.password !== password) {
            throw new AuthenticationFailed("Passwords don't match");
        }
        res.send("User Logged In");
    } catch (error) {
        next(error);
    }
});

// POST endpoint for adding a new customer
app.post('/api/add_customer', async (req, res) => {
    const data = req.body;
    console.log(data);
    const documents = await Customers.find({ user_name: data['user_name']});
    if (documents.length > 0) {
        res.send("User already exists");
    }

    const age = parseInt(data['age']);
    try {
        if (age < 21) {
            throw new ValidationError("Customer Under required age limit");
        }
 
        const customer = new Customers({
            "user_name": data['user_name'],
            "age": age,
            "password": data['password'],
            "email": data['email']
        });

        await customer.save();
 
        res.send("Customer added successfully");
    } catch (error) {
        next(error);
    }
   
    
    // Creating a new instance of the Customers model with data from the request

    // Saving the new customer to the MongoDB 'customers' collection
    await customer.save();

    res.send("Customer added successfully")
});

// GET endpoint for the root URL, serving the home page
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

app.get('/api/logout', async (req, res) => {
	res.cookie('username', '', { expires: new Date(0) });
	res.redirect('/');
});

app.all("*",(req,res,next)=>{
	const err = new Error(`Cannot find the URL ${req.originalUrl} in this application. Please check.`);
	err.status = "Endpoint Failure";
	err.statusCode = 404;
	next(err);
})



app.use((err,req,res,next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "Error";
    console.log(err.stack);
	res.status(err.statusCode).json({
		status: err.statusCode,
		message: err.message,
	});
})


// Starting the server and listening on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
