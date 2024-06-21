const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const Student = require('./students');
const Recruiter = require('./recruiters');
const Contact = require('./contact');

const app = express();

mongoose.connect('mongodb://localhost:27017/placement_cell', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

const userSchema = new mongoose.Schema({
    name: String,
    password: String
});
const User = mongoose.model("User", userSchema);

const templatePath = path.join(__dirname, "../templates");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.set("view engine", "hbs");
app.set("views", templatePath);

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const upload = multer({ dest: 'uploads/' });

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const { name, password } = req.body;

    try {
        const existingUser = await User.findOne({ name });

        if (existingUser) {
            return res.send({ error: "You have already signed up. Please login." });
        }

        const newUser = new User({ name, password });
        await newUser.save();

        res.send({ success: "Signup successful. You can now login." });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).send({ error: "Error during signup" });
    }
});

app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        const check = await User.findOne({ name });

        if (check && check.password === password) {
            req.session.user = { name: check.name };
            res.redirect('/home');
        } else {
            res.render("login", { error: "Wrong password or username" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.render("login", { error: "Wrong details" });
    }
});


app.get("/home", checkAuth, (req, res) => {
    res.render("home", { name: req.session.user.name, activeRoute: '/home' });
});

app.get("/about", checkAuth, (req, res) => {
    res.render("about", { activeRoute: '/about' });
});

app.get("/services", checkAuth, (req, res) => {
    res.render("services", { activeRoute: '/services' });
});

app.get("/students", checkAuth, async (req, res) => {
    const students = await Student.find();
    res.render("students", { students, activeRoute: '/students' });
});

app.post("/students", checkAuth, upload.single('resume'), async (req, res) => {
    const { fullName, email, phone, degree, year } = req.body;
    const resume = req.file ? req.file.path : null;

    console.log("Form data received:", req.body);
    console.log("Uploaded file:", req.file);

    try {
        const newStudent = new Student({ fullName, email, phone, degree, year, resume });
        const savedStudent = await newStudent.save();
        console.log("Saved student:", savedStudent);
        res.redirect('/students');
    } catch (err) {
        console.error("Error saving student data:", err);
        res.status(500).send({ error: "Error saving student data" });
    }
});

app.post("/students/update/:id", checkAuth, upload.single('resume'), async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phone, degree, year } = req.body;
    const resume = req.file ? req.file.path : null;

    console.log("Update request received for ID:", id);
    console.log("Received data:", req.body);
    console.log("Received file:", req.file);

    try {
        const updateData = { fullName, email, phone, degree, year };
        if (resume) {
            updateData.resume = resume;
        }

        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });
        console.log("Updated student:", updatedStudent);

        res.redirect('/students');
    } catch (err) {
        console.error("Error updating student data:", err);
        res.status(500).send({ error: "Error updating student data" });
    }
});

app.post("/students/delete/:id", checkAuth, async (req, res) => {
    const { id } = req.params;

    try {
        await Student.findByIdAndDelete(id);
        res.redirect('/students');
    } catch (err) {
        console.error("Error deleting student data:", err);
        res.status(500).send({ error: "Error deleting student data" });
    }
});

app.get("/recruiters", checkAuth, (req, res) => {
    res.render("recruiters", { activeRoute: '/recruiters' });
});

app.post("/recruiters", checkAuth, async (req, res) => {
    const { companyName, contactPerson, email, phone, jobPositions } = req.body;

    try {
        const newRecruiter = new Recruiter({
            companyName,
            contactPerson,
            email,
            phone,
            jobPositions
        });

        await newRecruiter.save();
        res.redirect('/recruiters');
    } catch (err) {
        console.error("Error saving recruiter data:", err);
        res.status(500).send({ error: "Error saving recruiter data" });
    }
});

app.get("/contact", checkAuth, (req, res) => {
    res.render("contact", { activeRoute: '/contact' });
});

app.post("/contact", checkAuth, async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.render('contact', { activeRoute: '/contact', success: "Thank you for contacting us. We'll get back to you soon." });
    } catch (err) {
        console.error("Error saving contact form data:", err);
        res.status(500).render('contact', { activeRoute: '/contact', error: "Error saving contact form data" });
    }
});


app.post("/signout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send({ error: "Error signing out" });
        } else {
            res.redirect('/');
        }
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
