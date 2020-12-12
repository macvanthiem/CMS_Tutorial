$(document).ready(function() {
    setTimeout(function() {
        $('.auto-hide').slideUp(300);
    }, 2000);    

    $('#create-category-btn').on('click', function (e) {
        e.preventDefault();
        var data = $('#category-title').val();
        $.ajax({
            url: '/admin/categories',
            method: 'POST',
            data: {name: data},
            success: function (response) {
                var html = `<tr>
                                <td>${response.title}</td>
                                <td class="d-flex justify-content-center">
                                    <a href="/admin/categories/edit/${response._id}" class="btn btn-sm btn-success mr-2"><i class="fa fa-fw fa-edit"></i></a>
                                    <form action="/admin/categories/delete/${response._id}?newMethod=DELETE" method="post">
                                        <button type="submit" class="btn btn-sm btn-danger"><i class="fa fa-fw fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>`;
                
                $('.category-list').append(html);
                $('#category-title').val('');
                $('#create-success-category').addClass('show');
                $('#create-success-category').addClass('auto-hide');
                setTimeout(function() {
                    $('.auto-hide').slideUp(300);
                }, 2000);
            },
            error: function (error) {
                $('#create-fail-category').addClass('show');
                $('#create-fail-category').addClass('auto-hide');
                setTimeout(function() {
                    $('.auto-hide').slideUp(300);
                }, 2000);
            },
        });
    });
}); 

var modal = document.getElementById("myModal");

// When the user clicks the button, open the modal 

function show (id, title) {
    modal.style.display = "block";
    document.getElementById('category-title-update').value = title;
    document.getElementById('category-id').value = id;
}

function cancle () {
    var cf = confirm('You want to cancle?');
    if (cf == true) {
        modal.style.display = "none";
    }
}

function update_category () {
    var new_category = document.getElementById("category-title-update").value;
    var _id = document.getElementById("category-id").value;

    console.log(new_category, _id);

    if (new_category == '') {
        alert('This field is required!');
    } else {
        modal.style.display = "none";
        var xmlhttp = new XMLHttpRequest();

        var data = {};
        data.title = new_category;
        var json = JSON.stringify(data);
        
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById('update-success-category').classList.add('show');
                document.getElementById('update-success-category').classList.add('auto-hide');
                setTimeout(function() {
                    $('.auto-hide').slideUp(300);
                }, 2000);
                document.getElementById('title'+_id).innerHTML = new_category;
            };
        };
        xmlhttp.open("PUT", "/admin/categories/update/" + _id, true);
        xmlhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
        xmlhttp.send(json);
    }
}

function imageUpload () {
    var fileSelected = document.getElementById('banner').files;
    if (fileSelected.length > 0) {
        var fileToLoad = fileSelected[0];
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoaderEvent) {
            var srcData = fileLoaderEvent.target.result;
            var image = document.getElementById('displayImage');
            image.src = srcData;
        }
        fileReader.readAsDataURL(fileToLoad);
    }
    document.getElementById('checkUpload').value = '0';

}

function addComment(post_id, name) {
    var content = document.getElementById("content-cmt").value;
    if (content != '') {
        var xmlhttp = new XMLHttpRequest();

        var data = {};
        data.content = content;
        data.post = post_id;
        var json = JSON.stringify(data);
        
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('ok');
                let data = JSON.parse(xmlhttp.response);
                let n = data.length;
                let html = ``;
                for (let i = n-1; i >= 0; i--) {
                    if (data[i].comment_is_approved) {
                        html += `<div class="media mb-4">
                                    <img class="d-flex mr-3 rounded-circle" width="50px" height="50px" src="/img/img_avatar1.png" alt="">
                                    <div class="media-body">
                                        <h5 class="mt-0">${data[i].user.first_name} ${data[i].user.last_name}</h5>
                                        ${data[i].content}
                                    </div>
                                </div>`
                    }
                }
                document.getElementById('cmt-area').innerHTML = html;
            };
        };
        xmlhttp.open("POST", "/comment", true);
        xmlhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
        xmlhttp.send(json);
    }
}

function turnOffCmt(_id, comment_is_approved) {
    var cf = confirm(`Do you want to change this comment's status ?`);

    if (cf == true) {
        const xmlhttp = new XMLHttpRequest();
        let data = {};
        data.comment_is_approved = comment_is_approved == 'true' ? false : true;
        let json = JSON.stringify(data);
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('ok');
                let data = JSON.parse(xmlhttp.response);
                let html = `<td>${data.user.first_name} ${data.user.last_name}</td>
                            <td>${data.content}</td>
                            <td>${data.created_at}</td>
                            <td>`;
                
                if (data.comment_is_approved) {
                    html += `<p><span class="badge badge-success">online</span></p>`
                } else {
                    html += `<p><span class="badge badge-danger">offline</span></p>`
                }
                            
                html +=`</td>
                        <td>
                            <button class="btn btn-info btn-sm" onclick="turnOffCmt('${data._id}', '${data.comment_is_approved}')">Change</button>
                        </td>`;
                document.getElementById(_id).innerHTML = html;
            };
        };
        xmlhttp.open("POST", "/admin/comments/update/"+_id, true);
        xmlhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
        xmlhttp.send(json);
    }
}

function updateRole(_id, role) {
    var cf = confirm(`Do you want to change this user's role ?`);
    if (cf == true) {
        const xmlhttp = new XMLHttpRequest();
        let data = {};
        data.role = role == 'true' ? false : true;
        let json = JSON.stringify(data);
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('ok');
                let data = JSON.parse(xmlhttp.response);
                let html = `<td>${data.first_name}</td>
                            <td>${data.last_name}</td>
                            <td>${data.email}</td>
                            <td>`;
                
                if (data.role) {
                    html += `<p><span class="badge badge-success">Admin</span></p>`
                } else {
                    html += `<p><span class="badge badge-warning">User</span></p>`
                }
                            
                html +=`</td>
                        <td>
                            <button class="btn btn-info btn-sm" onclick="updateRole('${data._id}', '${data.role}')">Change</button>
                        </td>`;
                document.getElementById(_id).innerHTML = html;
            };
        };
        xmlhttp.open("POST", "/admin/users/update/"+_id, true);
        xmlhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
        xmlhttp.send(json);
    }
}

function confirmDelete() {
    var cf = confirm('Do you want to delete this post?');
    if (cf == true) {
        return true;
    } else {
        return false;
    }
}