
$("#clear").click(function() {
  $.ajax({
    url: "/clear",
    method: "DELETE"
  }).then(function(results){
    $("#article-container").empty();
    console.log(results);
    $("#article-container").append(
      `
      <div class="jumbotron text-center">
        <div class="overlay"></div>
        <div class="caption">
          <p>Sorry there are no articles to display right now</p>
        </div>
      </div>
      `
    )
  })
});

$("#scrape").click(function() {
  $.get("/scrape", function(data) {
    if (data.status === "ok") {
      $.getJSON("/articles", function(data){
        if (data.length > 0) displayArticles(data, "home-page");
      });
    }
  });
});

$("#article-container").on("click", ".save-article", function() {
  var that = $(this);
  $.post("/articles/save/" + $(this).data("id"), function(data) {
    that.parent().parent().parent().parent().remove();
  })
});

function displayArticles(data, page) {
  $("#article-container").empty();
  // For each one
  for (var i = 0; i < data.length; i++) {

    if(page === "home-page") {
      // Display the apropos information on the page
      if (!data[i].saved) {
        $("#article-container").append(
          `
          <div class="article card mb-3">
            <div class="row no-gutters">
              <div class="col-4">
                <img class="img-fluid" src=${data[i].image} alt="Article Image"/>
              </div>
              <div class="col-8">
                <div class="card-body">
                  <h3 class="card-title">
                    <a target="_blank" href="${data[i].link}">${data[i].title}</a>
                  </h3>
                  <p class="card-text">${data[i].summary}</p>
                  <button class="btn btn-success save-article" data-id="${data[i]._id}">Save Article</button>
                </div>
              </div>
            </div>
          </div>
          `
        )
      }
    } else {
      // Display the apropos information on the page
      $("#article-container").append(
        `
        <div class="article card mb-3">
          <div class="row no-gutters">
            <div class="col-4">
              <img class="img-fluid" src=${data[i].image} alt="Article Image"/>
            </div>
            <div class="col-8">
              <div class="card-body">
                <h3 class="card-title">
                  <a target="_blank" href="${data[i].link}">${data[i].title}</a>
                </h3>
                <p class="card-text">${data[i].summary}</p>
                <button class="btn btn-danger unsave-article" data-id="${data[i]._id}">Delete From Saved</button>
                <button class="btn btn-info article-notes" data-id="${data[i]._id}">Article Notes</button>
              </div>
            </div>
          </div>
        </div>
        `
      )
    }
  }
}