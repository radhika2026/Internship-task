const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/home", (req, res) =>{
    res.render("home");
});

app.get("/", (req, res) =>{
    res.render("index");
});

app.get("/register", (req, res) =>{
    res.render("register"); 
});

app.post("/register", async (req, res) =>{
    const name =  req.body.name ;
    const email = req.body.email ;
    const mobile = req.body.number ;
    const password = req.body.password;
    const conPassword = req.body.conPassword;

    if(!name || !email || !mobile || !password || !conPassword){
        res.render("register", {
            error: "Please Fill All The Fields"
        });
    }

    try {
        if(password === conPassword){
            const registerEmployee = new Register({
        
                name: name ,
                email: email ,
                mobile: mobile ,
                password: password ,
                confirmPassword: conPassword

            });

            const registered = await registerEmployee.save();
            res.status(201).render("home");
        }else{
            res.render("register", {
                error: "Password Didn't match"
            });
        }

    }catch(err){
        res.render("register", {
            error: "error"
        });
    }
});

app.get("/login", (req, res) =>{
    res.render("login"); 
});

app.post("/login", async (req, res) =>{
    try{
        const userEmail = req.body.email;
        const userPassword = req.body.password;
        if(!userEmail || !userPassword){
            res.render("login", {
                error: "Please enter all the details"
            });
        }
        const userDetails = await Register.findOne({email: userEmail});
        if(userDetails){
            const isMatch = await bcrypt.compare(userPassword, userDetails.password);
            if (!isMatch){
                res.render("login", {
                    error: "Please Fill the correct data"
                });
            }else{
                res.render("home");
            }
        }
        else{
            res.render("login", {
                error: "Record Not Found"
            });
        }

    }catch(error){
        res.status(400).send(error);
    }
});
app.listen(3000, ()=> {
    console.log('Server running');
});