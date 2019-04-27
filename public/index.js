$(function() {
    // Grab the articles as a json
    $.getJSON("/articles", function(data) {
        console.log(data);
        if (data.length > 0) displayArticles(data, "home-page");
    });
});