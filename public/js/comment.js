// capture the form submission
async function commentHandler(event) {
    event.preventDefault();

    const commentary = document.querySelector("#comment-body").value.trim();
    const post_id = window.location.toString().split("/")[window.location.toString().split("/").length - 1];

    if (commentary) {
        const response = await fetch("/api/comment", {
            method: "POST",
            body: JSON.stringify({
                post_id,
                commentary,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            document.location.reload();
        } else {
            alert(response.statusText);
        }
    }
}

commentForm = document.querySelector("#comment-form");
if (commentForm) {
    commentForm.addEventListener("submit", commentHandler);
}
