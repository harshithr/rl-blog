var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

var PORT = process.env.PORT || 3000;

//======== Express SETUP =============

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//====================================

//======== Mongoose SETUP ============

mongoose.connect("mongodb://localhost/blog_app");

var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    createdAt: {type: Date, default: Date.now()}
});

var Blog = mongoose.model("Blog", blogSchema);

//====================================

//======== REST Full routes ==========

app.get("/", function (req, res) {
    res.redirect("/blogs");
});

// INDEX route
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, data) {
        if(err) {
            console.log("Something went wrong while find data from the DB: " + err);
        }else {
            res.render("index.ejs", {blogsData: data});
        }
    });
});

// NEW route
app.get("/blogs/new", function(req, res) {
    res.render("newBlog.ejs");
});

// CREATE route
app.post("/blogs", function(req, res) {

    req.body.newBody = req.sanitize(req.body.newBody);

    var title = req.body.newTitle;
    var image = req.body.newImage;
    var body = req.body.newBody;

    Blog.create({
        title: title,
        image: image,
        body: body
    }, function(err, data) {
        if(err) {
            console.log("Something went wrong while posting data to DB: " + err);
        }else {
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, data){
        if(err) {
            console.log("Something went wrong while showing data by id: " + err);
            res.redirect("/blogs");
        }else {
            res.render("show.ejs", { blogData: data });
        }
    });
});

// EDIT route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, data) {
        if(err) {
            console.log("Something went wrong while getting info from DB while edit route: " + err);
        }else {
            res.render("edit.ejs", {blogData: data });
        }
    });
});

// UPDATE route
app.put("/blogs/:id", function(req, res){

    var title = req.body.editTitle;
    var image = req.body.editImage;
    var body = req.body.editBody;

    var blogData = {
        title: title,
        image: image,
        body: body
    };

    Blog.findByIdAndUpdate(req.params.id, blogData , function(err, data){
        if(err) {
            console.log("Something went wrong while updating data: " + err);
        }else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DESTROY route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            console.log("Something went wrong while deleting DB data: " + err);
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs");
        }
    });
});

//====================================

app.listen(PORT,  function() {
    console.log("Blog server up and running on port: " + PORT);
});