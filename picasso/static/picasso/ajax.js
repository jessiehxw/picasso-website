function getMyPic() {
    $.ajax( {
        url: "/get-work",
        dataType: "json",
        success: insertPic,
        error: updateError,
    })
}

function getMyPosts() {
    $.ajax( {
        url: "/get-my-posts",
        dataType: "json",
        success: insertMyPosts,
        error: updateError,
    })
}

function getGlobalPicWithFilter(sort_by_options, order_option) {
    $.ajax({
        url: "/get-global",
        type: "get",
        data: {
            sort_by_options: sort_by_options,
            order_option: order_option
        },
        success: insertGlobal,
        error: updateError,
    })
}

function orderGlobalPic(sort_by_options, order_option) {

    // getGlobalPicWithFilter(sort_by_options, order_option)

    var $post = $(".post-flex")
	var an, bn

    if($.trim(sort_by_options) === 'popularity') {
        if ($.trim(order_option) === 'ascending') {
            $post.sort(function (a, b) {
                cn = a.getAttribute("dislike_count")
                dn = b.getAttribute("dislike_count");
                if (cn > dn) {
                    return 1;
                }
                if (cn < dn) {
                    return -1;
                }
                an = a.getAttribute("like_count")
                bn = b.getAttribute("like_count");
                if (an < bn) {
                    return 1;
                }
                if (an >= bn) {
                    return -1;
                }
                return 0;
            });
        }
        else if ($.trim(order_option) === 'descending') {
            $post.sort(function (a, b) {
                cn = a.getAttribute("like_count")
                dn = b.getAttribute("like_count");
                if (cn > dn) {
                    return 1;
                }
                if (cn < dn) {
                    return -1;
                }
                an = a.getAttribute("dislike_count")
                bn = b.getAttribute("dislike_count");
                if (an < bn) {
                    return 1;
                }
                if (an > bn) {
                    return -1;
                }
                return 0;
            });
        }
    }
    else if($.trim(sort_by_options) === 'creation_time') {
        if ($.trim(order_option) === "ascending") {
            $post.sort(function (a, b) {
                an = new Date(a.getAttribute("time"))
                bn = new Date(b.getAttribute("time"));
                if (an < bn) {
                    return 1;
                }
                if (an >= bn) {
                    return -1;
                }
                return 0;
            });
        }
        else if ($.trim(order_option) === 'descending') {
            $post.sort(function (a, b) {
                an = new Date(a.getAttribute("time"))
                bn = new Date(b.getAttribute("time"));
                if (an > bn) {
                    return 1;
                }
                if (an <= bn) {
                    return -1;
                }
            });
        }
    }

    $post.detach();

    var div = document.getElementById("posts-go-here")
    $post.each(function() {
        div.insertBefore(this, div.firstChild)
        }
    )
}

// add posts to the Platform page
function insertGlobal(response) {
    // Removes post if they are not in Post model
    $(".post-flex").each(function () {
        let existing_post_id = this.id
        let delete_it = true
        $(response["posts"]).each(function () {
            let new_post_id = "post_div_" + this.id
            if (new_post_id == existing_post_id) delete_it = false
        })
        if (delete_it) this.remove()
    })

    // Adds each new post item (only if it's not already here)
    $(response["posts"]).each(function () {
        let my_id = "post_div_" + this.id
        if (document.getElementById(my_id) == null) {
            console.log("do again")
            makeGlobalHTML(this)
        }
        else {
            var change_div = document.getElementById(my_id)
            change_div.setAttribute("like_count", this.like_count)
            change_div.setAttribute("dislike_count", this.dislike_count)
        }
    })

    var sort_by_options = $("#sort_by_options").val()
    if (document.querySelector('input[name="radio_button"]:checked'))
        var order_option = document.querySelector('input[name="radio_button"]:checked').value;
    console.log(sort_by_options)
    console.log(order_option)
    orderGlobalPic(sort_by_options, order_option)

    // Removes comment if they not in comments
    $(".comment").each(function() {
        let existing_comment_id = this.id
        let delete_it = true
        $(response["comments"]).each(function() {
            let new_comment_id = "comment_div_" + this.id
            if (new_comment_id == existing_comment_id) delete_it = false
        })
        if (delete_it) this.remove()
    })

    // Adds each new comment (only if it's not already here)
    $(response["comments"]).each(function() {
        let my_id = "comment_div_" + this.id
        if (document.getElementById(my_id) == null) {
            makeCommentHTML(this)
        }
    })
}

// add posts to the Platform page
function insertMyPosts(response) {
    // Removes post if they are not in Post model
    $(".post-flex").each(function () {
        let existing_post_id = this.id
        let delete_it = true
        $(response["my_posts"]).each(function () {
            let new_post_id = "post_div_" + this.id
            if (new_post_id == existing_post_id) delete_it = false
        })
        if (delete_it) this.remove()
    })

    // Adds each new post item (only if it's not already here)
    $(response["my_posts"]).each(function () {
        let my_id = "post_div_" + this.id
        if (document.getElementById(my_id) == null) {
            console.log("do again")
            makeMyPostsHTML(this)
        }
    })

    // Removes comment if they not in comments
    $(".comment_div").each(function() {
        let existing_comment_id = this.id
        let delete_it = true
        $(response["comments"]).each(function() {
            let new_comment_id = "comment_div_" + this.id
            if (new_comment_id == existing_comment_id) delete_it = false
        })
        if (delete_it) this.remove()
    })

    // Adds each new comment (only if it's not already here)
    $(response["comments"]).each(function() {
        let my_id = "comment_div_" + this.id
        if (document.getElementById(my_id) == null) {
            makeCommentHTML(this)
        }
    })

}

// create the HTML for each post
function makeGlobalHTML(post) {
    // create div for each post
    var item_div = document.createElement("div")
    item_div.className = "post-flex"
    item_div.id = "post_div_" + post.id

    // add the post div into the bigger div
    var div = document.getElementById("posts-go-here")
    // div.insertBefore(item_div, div.firstChild)
    div.insertBefore(item_div, div.firstChild)

    //  create a popup div
    var popup_div = document.createElement("div")
    popup_div.className = "popup_div"
    popup_div.id = "popup_" + post.id
    var content = document.getElementById("posts-go-here")
    content.appendChild(popup_div)

    // create a close button
    var close_button = document.createElement("button")
    let popup_item = document.getElementById("popup_" + post.id)
    close_button.addEventListener("click", function closePopup() {
            popup_item.classList.remove("open-popup")
        })

    close_button.className = "close_button"
    popup_div.appendChild(close_button)

    // create a div for image
    var image_div = document.createElement("div")
    image_div.className = "image_div"
    popup_div.appendChild(image_div)

    // add image to popup
    var image = document.createElement("img")
    image.className = "popup_image"
    image.src = "picture/" + post.picture_id
    image_div.appendChild(image)

    // create a div for posts and comments
    var info_div = document.createElement("div")
    info_div.className = "info_div"
    info_div.id = "info_div_" + post.id
    popup_div.appendChild(info_div)

    var popup_user_div = document.createElement("div")
    popup_user_div.className = "popup_user_div"
    info_div.appendChild(popup_user_div)

    // add popup user avatar
    var popup_user_image = document.createElement("img")
    popup_user_image.className = "popup_user_avatar"
    popup_user_image.src = post.creator_avatar
    popup_user_div.appendChild(popup_user_image)

    // add popup post creator
    var popup_creator = document.createElement("p")
    popup_creator.className = "popup_post_creator"
    popup_creator.innerHTML = post.creator
    popup_user_div.appendChild(popup_creator)

    // add popup description
    var description = document.createElement("p")
    description.className = "description"
    description.innerHTML = post.text
    info_div.appendChild(description)

    // add comment input box
    var input_box = document.createElement("input")
    input_box.className = "input_box"
    input_box.id = "comment_input_text_" + post.id
    input_box.placeholder = "Add a comment..."
    info_div.appendChild(input_box)

    //  add comment button
    var comment_button = document.createElement("button")
    comment_button.className = "comment_button"
    comment_button.innerHTML = "Post"
    comment_button.onclick = function() {addComment(post.id)}
    info_div.appendChild(comment_button)

    // create a div for comments
    var comment_div = document.createElement("div")
    comment_div.className = "comment_box_div"
    comment_div.id = "comment_box_div_" + post.id
    info_div.appendChild(comment_div)

    // create a div for user avatar and username
    var user_div = document.createElement("div")
    user_div.className = "user_div"
    item_div.appendChild(user_div)

    // add user avatar
    var user_image = document.createElement("img")
    user_image.className = "user_avatar"
    user_image.src = post.creator_avatar
    user_div.appendChild(user_image)

    // add post creator
    var creator = document.createElement("p")
    creator.className = "post_creator"
    creator.innerHTML = post.creator
    user_div.appendChild(creator)

    // add image
    var image = document.createElement("img")
    image.className = "post_image"

    let popup = document.getElementById("popup_" + post.id)
    image.addEventListener("click", function openPopup() {
            popup.classList.add("open-popup")
        })

    image.src = "picture/" + post.picture_id
    item_div.appendChild(image)

    // add image title
    var title = document.createElement("p")
    title.className = "image_title"
    title.innerHTML = post.picture_title
    item_div.appendChild(title)

    // add image creation time
    var time = document.createElement("p")
    time.className = "post_time"
    time.innerHTML = post.time
    item_div.appendChild(time)
    item_div.setAttribute("time", post.time)

    // create a div for like/dislike buttons
    var like_div = document.createElement("div")
    like_div.className = "like_div"
    item_div.appendChild(like_div)

    // add like/dislike buttons
    var like_button = document.createElement("button")
    if (post.like_check == 0) {
        like_button.onclick = function() {like(post.id)}
        like_button.className = "like_button"
    }
    else if (post.like_check == 1) {
        like_button.className = "orange_like"
    }
    else {
        like_button.className = "like_button"
    }
    like_button.id = "like_button_" + post.id
    like_div.appendChild(like_button)

    var like_label = document.createElement("p")
    if (post.like_check == 0) {
        like_label.className = "like_label"
    }
    else if (post.like_check == 1) {
        like_label.className = "orange_label"
    }
    else {
        like_label.className = "like_label"
    }
    like_label.id = "like_label_" + post.id
    like_label.innerHTML = "Like"
    like_div.appendChild(like_label)
    item_div.setAttribute("like_count", post.like_count)

    // add like/dislike buttons
    var dislike_button = document.createElement("button")
    if (post.like_check == 0) {
        dislike_button.onclick = function() {dislike(post.id)}
        dislike_button.className = "dislike_button"
        dislike_button.classList.add("hover_dislike")
        like_button.classList.add("hover_like")
    }
    else if (post.like_check == 2) {
        dislike_button.className = "orange_dislike"
    }
    else {
        dislike_button.className = "dislike_button"
    }
    dislike_button.id = "dislike_button_" + post.id
    like_div.appendChild(dislike_button)

    var dislike_label = document.createElement("p")
    if (post.like_check == 0) {
        dislike_label.className = "dislike_label"
    }
    else if (post.like_check == 2) {
        dislike_label.className = "orange_dislike_label"
    }
    else {
        dislike_label.className = "dislike_label"
    }
    dislike_label.id = "dislike_label_" + post.id
    dislike_label.innerHTML = "Dislike"
    like_div.appendChild(dislike_label)
    item_div.setAttribute("dislike_count", post.dislike_count)
}

function like(post_id) {
    $.ajax({
        url: likeURL,
        type: "POST",
        data: "post_id="+ post_id + "&csrfmiddlewaretoken=" + getCSRFToken(),
        dataType : "json",
        success: updateButton,
        error: updateError
    });
}

function dislike(post_id) {
    $.ajax({
        url: dislikeURL,
        type: "POST",
        data: "post_id="+ post_id + "&csrfmiddlewaretoken=" + getCSRFToken(),
        dataType : "json",
        success: updateDislikeButton,
        error: updateError
    });
}

function updateButton(response) {
    var like_button = document.getElementById("like_button_" + response)
    like_button.classList.remove("like_button")
    like_button.classList.add("orange_like")

    var like_label = document.getElementById("like_label_" + response)
    like_label.classList.add("orange_label")
}

function updateDislikeButton(response) {
    var dislike_button = document.getElementById("dislike_button_" + response)
    dislike_button.classList.remove("dislike_button")
    dislike_button.classList.add("orange_dislike")

    var dislike_label = document.getElementById("dislike_label_" + response)
    dislike_label.classList.add("orange_dislike_label")

}

function insertPic(response) {
    // Removes pic if they are not in Picture model
    $(".box-flex").each(function () {
        let existing_pic_id = this.id
        let delete_it = true
        $(response["pictures"]).each(function () {
            let new_pic_id = "picture_div_" + this.id
            if (new_pic_id == existing_pic_id) delete_it = false
        })
        if (delete_it) this.remove()
    })

    // Adds each new image item (only if it's not already here)
    $(response["pictures"]).each(function () {
        let my_id = "picture_div_" + this.id
        if (document.getElementById(my_id) == null) {
            makePictureHTML(this)
        }
    })
}

function makeMyPostsHTML(post) {
    // create div for each post
    var item_div = document.createElement("div")
    item_div.className = "post-flex"
    item_div.id = "post_div_" + post.id

    // add the post div into the bigger div
    var div = document.getElementById("my-posts-go-here")
    div.insertBefore(item_div, div.firstChild)

    //  create a popup div
    var popup_div = document.createElement("div")
    popup_div.className = "popup_div"
    popup_div.id = "popup_" + post.id
    var content = document.getElementById("my-posts-go-here")
    content.appendChild(popup_div)

    // create a close button
    var close_button = document.createElement("button")
    let popup_item = document.getElementById("popup_" + post.id)
    close_button.addEventListener("click", function closePopup() {
            popup_item.classList.remove("open-popup")
        })

    close_button.className = "close_button"
    popup_div.appendChild(close_button)

    // create a div for image
    var image_div = document.createElement("div")
    image_div.className = "image_div"
    popup_div.appendChild(image_div)

    // add image to popup
    var image = document.createElement("img")
    image.className = "popup_image"
    image.src = "picture/" + post.picture_id
    image_div.appendChild(image)

    // create a div for posts and comments
    var info_div = document.createElement("div")
    info_div.className = "info_div"
    info_div.id = "info_div_" + post.id
    popup_div.appendChild(info_div)

    var popup_user_div = document.createElement("div")
    popup_user_div.className = "popup_user_div"
    info_div.appendChild(popup_user_div)

    // add popup user avatar
    var popup_user_image = document.createElement("img")
    popup_user_image.className = "popup_user_avatar"
    popup_user_image.src = post.creator_avatar
    popup_user_div.appendChild(popup_user_image)

    // add popup post creator
    var popup_creator = document.createElement("p")
    popup_creator.className = "popup_post_creator"
    popup_creator.innerHTML = post.creator
    popup_user_div.appendChild(popup_creator)

    // add popup description
    var description = document.createElement("p")
    description.className = "description"
    description.innerHTML = post.text
    info_div.appendChild(description)

    // add comment input box
    var input_box = document.createElement("input")
    input_box.className = "input_box"
    input_box.id = "comment_input_text_" + post.id
    input_box.placeholder = "Add a comment..."
    info_div.appendChild(input_box)

    //  add comment button
    var comment_button = document.createElement("button")
    comment_button.className = "comment_button"
    comment_button.innerHTML = "Post"
    comment_button.onclick = function() {addComment(post.id)}
    info_div.appendChild(comment_button)

    // create a div for comments
    var comment_div = document.createElement("div")
    comment_div.className = "comment_box_div"
    comment_div.id = "comment_box_div_" + post.id
    info_div.appendChild(comment_div)

    // create a div for user avatar and username
    var user_div = document.createElement("div")
    user_div.className = "user_div"
    item_div.appendChild(user_div)

    // add user avatar
    var user_image = document.createElement("img")
    user_image.className = "user_avatar"
    user_image.src = post.creator_avatar
    user_div.appendChild(user_image)

    // add post creator
    var creator = document.createElement("p")
    creator.className = "post_creator"
    creator.innerHTML = post.creator
    user_div.appendChild(creator)

    // add image
    var image = document.createElement("img")
    image.className = "post_image"

    let popup = document.getElementById("popup_" + post.id)
    image.addEventListener("click", function openPopup() {
            popup.classList.add("open-popup")
        })

    image.src = "picture/" + post.picture_id
    item_div.appendChild(image)

    // add image title
    var title = document.createElement("p")
    title.className = "image_title"
    title.innerHTML = post.picture_title
    item_div.appendChild(title)

    // add image creation time
    var time = document.createElement("p")
    time.className = "post_time"
    time.innerHTML = post.time
    item_div.appendChild(time)

    // create a div for like/dislike buttons
    var like_div = document.createElement("div")
    like_div.className = "like_div"
    item_div.appendChild(like_div)

    // add like/dislike buttons
    var like_button = document.createElement("button")
    like_button.className = "orange_like"
    like_button.id = "like_button_" + post.id
    like_div.appendChild(like_button)

    var like_label = document.createElement("p")
    like_label.className = "orange_label"
    like_label.id = "like_label_" + post.id
    like_label.innerHTML = post.like_count + " like"
    like_div.appendChild(like_label)

    // add like/dislike buttons
    var dislike_button = document.createElement("button")
    dislike_button.className = "orange_dislike"
    dislike_button.id = "dislike_button_" + post.id
    like_div.appendChild(dislike_button)

    var dislike_label = document.createElement("p")
    dislike_label.className = "orange_dislike_label"
    dislike_label.id = "dislike_label_" + post.id
    dislike_label.innerHTML = post.dislike_count + " dislike"
    like_div.appendChild(dislike_label)
}

function makePictureHTML(picture) {
    // create div for each picture
    var item_div = document.createElement("div")
    item_div.className = "box-flex"
    item_div.id = "picture_div_" + picture.id

    // add the picture div into the bigger div
    var div = document.getElementById("my-pics-go-here")
    div.insertBefore(item_div, div.firstChild)

    // add image
    var image = document.createElement("img")
    image.src = "picture/" + picture.id
    item_div.appendChild(image)

    // add image title
    var title = document.createElement("p")
    title.className = "image_title"
    title.innerHTML = picture.title
    item_div.appendChild(title)

    // add image creation time
    var time = document.createElement("p")
    time.className = "creation_time"
    time.innerHTML = picture.time
    item_div.appendChild(time)
}

function addComment(post_id) {
    let commentTextElement = document.getElementById("comment_input_text_" + post_id)
    let commentTextValue = commentTextElement.value
    if(commentTextValue) {
        // Clear input box and old error message (if any)
        commentTextElement.value = ''

        $.ajax({
            url: addCommentURL,
            type: "POST",
            data: "comment_text=" + commentTextValue + "&post_id=" + post_id + "&csrfmiddlewaretoken=" + getCSRFToken(),
            dataType: "json",
            success: updatePage,
            error: updateError
        });
    } else {
        alert("Please input some comments")
    }
}

function updatePage(comments) {
    // Removes comment if they not in comments
    $(".comment").each(function() {
        let existing_comment_id = this.id
        let delete_it = true
        $(comments).each(function() {
            let new_comment_id = "comment_div_" + this.id
            if (new_comment_id == existing_comment_id) delete_it = false
        })
        if (delete_it) this.remove()
    })

    // Adds each new comment (only if it's not already here)
    $(comments).each(function() {
        let my_id = "comment_div_" + this.id
        if (document.getElementById(my_id) == null) {
            makeCommentHTML(this)
        }
    })
}

function makeCommentHTML(comment) {
    var comment_box_div = document.getElementById("comment_box_div_" + comment.post_id)

    // add comment to comment_div
    var comment_div = document.createElement("div")
    comment_div.className = "comment_div"
    comment_div.id = "comment_div_" + comment.id
    comment_box_div.appendChild(comment_div)

    // add user avatar and username
    var comment_user_avatar = document.createElement("img")
    comment_user_avatar.className = "comment_user_avatar"
    comment_user_avatar.src = comment.creator_avatar
    comment_div.appendChild(comment_user_avatar)

    var comment_username = document.createElement("p")
    comment_username.className = "comment_username"
    comment_username.innerHTML = comment.creator + ":"
    comment_div.appendChild(comment_username)

    // add comment text
    var comment_text = document.createElement("p")
    comment_text.className = "comment_text"
    comment_text.innerHTML = comment.text
    comment_div.appendChild(comment_text)
    comment_box_div.insertBefore(comment_div, comment_box_div.firstChild)
}

function updateError(xhr) {
    if (xhr.status == 0) {
        displayError("Cannot connect to server")
        return
    }

    if (!xhr.getResponseHeader('content-type') == 'application/json') {
        displayError("Received status=" + xhr.status)
        return
    }

    let response = JSON.parse(xhr.responseText)
    if (response.hasOwnProperty('error')) {
        displayError(response.error)
        return
    }

    displayError(response)
}
function validateFormComponent() {
    if (document.getElementById("id_picture_title_text") == null) {
        document.getElementById("id_add_picture_button").style.display = "none"
    }
}

function refreshGlobalPage() {
    window.location.reload();
}


function getCSRFToken() {
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim()
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length)
        }
    }
    return "unknown"
}

function sanitize(s) {
    // Be sure to replace ampersand first
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
}

function displayError(message) {
    // let errorElement = document.getElementById("error")
    // errorElement.innerHTML = message
    return
}