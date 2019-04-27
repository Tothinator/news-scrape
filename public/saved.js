$(function() {
    // Grab the articles as a json
    $.getJSON("/api/saved", function(data) {
        console.log(data);
        if (data.length > 0) displayArticles(data, "saved-page");
    });

    $("#article-container").on("click", ".article-notes", function(){

        var id = $(this).data("id");
        // console.log(id);

        $.get("/articles/" + id).then(function(data) {

            var modalText = $("<div class='container-fluid text-center'>").append(
                `
                <h4>Notes for article ${id}
                <hr>
                <ul class="list-group note-container"></ul>
                <textarea placeholder="New Note" rows="5" style='width: 100%; margin: 10px 0'></textarea>
                <button data-id="${id}" class="btn btn-success save-note">Save Note</button>
                `
            );
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: id,
                notes: data || []
            };
            // Adding some information about the article and article notes to the save button for easy access
            // When trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
            renderNotesList(noteData);
        });
    });

    $("#article-container").on("click", ".unsave-article", function() {
        var that = $(this);
        $.post("/articles/unsave/" + $(this).data("id"), function(data) {
            that.parents(".card").remove();
        });
    });

    $(document).on("click", ".save-note", function() {

        var id = $(this).data("id");
        // console.log(id);

        var newNote = {
            body: $(".bootbox-body textarea").val().trim()
        }

        if (newNote.body !== "") {
            
            $.post("/articles/" + id, newNote).then(function(results) {
                bootbox.hideAll();
            });
            
        }
    });

    function renderNotesList(data) {
        // console.log(data);
        var notes = data.notes.notes;
        var notesToRender = [];
        var currentNote;

        if (!notes.length) {
            console.log(notes.length);
            currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
            for (var i = 0; i < notes.length; i++) {
            currentNote = $("<li class='list-group-item note'>")
                .text(notes[i].body)
                .append($("<button class='btn btn-danger note-delete'>x</button>"));
            currentNote.children("button").data("id", notes[i]._id);
            notesToRender.push(currentNote);
            }
        }

        $(".note-container").append(notesToRender);
        
    }

    $(document).on("click", ".note-delete", function() {

        var noteToDelete = $(this).data("id");

        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function() {
            // When done, hide the modal
            bootbox.hideAll();
        });
    });
});