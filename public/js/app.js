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

function preview() {
    var x = document.getElementById('markdown').value;
    let data = {};
    data.content = x;
    var json = JSON.stringify(data);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(xmlhttp.responseText);
            document.getElementById('preview').innerHTML = res.data;
        };
    };
    xmlhttp.open("POST", "/preview", true);
    xmlhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
    xmlhttp.send(json);
}