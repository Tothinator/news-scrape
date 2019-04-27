var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var ejs = require("ejs");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsScrape", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://smashboards.com/news/").then(function(response) {

        // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
    var articles = [];

    // Select each element in the HTML body from which you want information.
    $(".block-body").each(function(i, element) {

      var title = $(element).children(".message-main").children("a").children(".porta-header-text").text().trim();
      var link = $(element).children(".message-main").children("a").attr("href");
      var summary = $(element).children(".message-main").children(".message-body").children(".bbWrapper").text();
      var imagePreprocessed = $(element).children(".porta-article-header").children(".porta-header-image").css("background-image");
      var image = imagePreprocessed.slice(5, -2);

      // Create a new Article using the `result` object built from scraping
      db.Article.findOrCreate({
        link: link
      },{
        title: title,
        link: link,
        summary: summary,
        image: image
      }, function(err, result) {
        console.log(articles);
        if (err) console.log(err);
        else articles.push(result);
      });

    });
    res.json({
      status: "ok"
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {

  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/saved", function(req, res) {
  res.render("saved");
})

app.get("/api/saved", function(req, res) {

  // Grab every saved document in the Articles collection
  db.Article.find({saved: true})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
})

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    .then(function(dbArticle) {
      console.log(dbArticle);
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/articles/save/:id", function(req, res) {

  db.Article.findOneAndUpdate(
    {
      _id: req.params.id
    }, {
      $set: {
        saved: true
      }
    }, function(err, results) {
      if (err) console.log(err);
      else res.json(results);
    })

});

app.post("/articles/unsave/:id", function(req, res) {

  db.Article.findOneAndUpdate(
    {
      _id: req.params.id
    }, {
      $set: {
        saved: false
      }
    }, function(err, results) {
      if (err) console.log(err);
      else res.json(results);
    })

});

app.delete("/api/notes/:id", function(req, res) {

  db.Note.remove({ _id: req.params.id }).then(function(results) {
    res.json(results);
  });
});

app.delete("/clear", function(req, res) {

  db.Article.remove({}).then(function(results){
    res.json(results);
  });
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
