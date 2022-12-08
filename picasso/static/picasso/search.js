function searchByKeyword() {
    let keyword = document.getElementById('search_by_keyword').value
    keyword = keyword.toLowerCase()
    let x = document.getElementById("posts-go-here").querySelectorAll(".post-flex")

    for (i = 0; i < x.length; i++) {
        if (!x[i].children[2].innerHTML.toLowerCase().includes(keyword)) {
            x[i].style.display = "none";
        } else {
            x[i].style.display = ""
        }
    }
}