/* LOOK HERE : use filters and page limits and skips */

 // Fire to backend
var getDressUrl = './api/dress/filter';
var getUserUrl= './api/user/get';
var postUploadUrl = './api/dress/upload';
var postDeleteUrl = './api/dress/delete';

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function logOut () {
    eraseCookie("isPrincetonAuthorized", null);
    location.reload(true)
}

function deleteImage (imageId) {
    var r = confirm("Are you sure you want to delete this post?")
console.log({dressId: imageId});
    if (r == true) {
         $.ajax({
            url: postDeleteUrl,  //Server script to process data
            type: 'POST',
            data: {dressId: imageId},
            dataType: 'json',
            success: function() {
                alert('Delete successful!');
                location.reload(true);
            },
            error: function () {
                alert('Delete unsuccessful. Please try again.')
            }
        });
    } 
}


$(document).ready(function() {

    var urlVarls = getUrlVars();
    var skip = 0;
    if (!isNaN(parseInt(urlVarls.skip)))
        skip = parseInt(urlVarls.skip);

    // Cache data
    var __data = {
        imageGrid: [],
        userInfo: {},
        currentEmail: readCookie("isPrincetonAuthorized"),
        currentLimit: 24,
        currentSkip: skip
    }

    // Custom Select
    "use strict"; 
    $('#sm-size').fancySelect();
    $('#sm-color').fancySelect();
    $('#sm-quantity').fancySelect();
    $('#si-size').fancySelect().on('change.fs', regenGrid);
    $('#si-color').fancySelect().on('change.fs', regenGrid);
    $('#si-length').fancySelect().on('change.fs', regenGrid);

    // Quantity Number
    "use strict"; 
    $(".numbers-row").append('<div class="inc button">+</div><div class="dec button">-</div>');
    $(".button").on("click", function() {

        var $button = $(this);
        var oldValue = $button.parent().find("input").val();

        if ($button.text() == "+") {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }

        $button.parent().find("input").val(newVal);
    });

    function getFilterOptions () {
        return {
            size: $('#si-size').val(),
            length: $('#si-length').val(),
            color: $('#si-color').val(),
            limit: __data.currentLimit,
            skip: __data.currentSkip,
            email: getEmailForProfile()
        }
    }

    function getEmailForProfile() {
        if (window.location.pathname == "/profile.html") {
            return __data.currentEmail
        } else {
            return ""
        }
    }

    $('#previous-page').click(routeToPreviousPage);
    $('#next-page').click(routeToNextPage);

    function routeToNextPage() {
        window.location = window.location.origin + window.location.pathname + '?' + $.param({
            skip: __data.currentSkip + __data.currentLimit
        })
    }

    function routeToPreviousPage() {
        var currSkip = __data.currentSkip - __data.currentLimit
        var skip
        if (currSkip < 0) skip = 0
        else skip = currSkip

        window.location = window.location.origin + window.location.pathname + '?' + $.param({
            skip: skip
        })
    }

    function regenGrid () {
        $('#list').empty();

        $.ajax(getDressUrl, {
            data: getFilterOptions(),
            dataType: 'json',
            complete: function (res) {
                __data.imageGrid = res.responseJSON || [];

                __data.imageGrid.forEach(function (i) {
                    //console.log(imageHtmlFactory(i));
                    $('#list').append(imageHtmlFactory(i));
                })
            }
        })
    }
    regenGrid();

    function getUser () {
        $.ajax(getUserUrl, {
            data: {},
            dataType: 'json',
            complete: function (res) {
                __data.userInfo = res.responseJSON || {};

                $('#dressUploadForm').append(uploadFormGenerator(res.responseJSON));
                $('#profileBodyHeader').prepend('<h4 class=product-name>Hi ' + (__data.userInfo.name || __data.currentEmail) + '! Welcome to your closet.</h4>')

                $('#upload-button').click(function(){
                    var formData = new FormData($('#upload-form')[0]);
                    console.log(formData);
                    $.ajax({
                        url: postUploadUrl,  //Server script to process data
                        type: 'POST',
                        dataType: 'json',
                        success: uploadSuccess,
                        error: function () {
                            alert('Please fill out all fields and try again!')
                        },
                        // Form data
                        data: formData,
                        //Options to tell jQuery not to process data or worry about content-type.
                        cache: false,
                        contentType: false,
                        processData: false
                    });
                });    
                
            }

        })
    }
    getUser();

    function uploadFormGenerator (user) {

        var formstring = '<form id="upload-form" enctype="multipart/form-data">'

        if (!user.name) {
            formstring += '<input name="name" placeholder="Name">';
            formstring += '<input name="phone" placeholder="Phone">';
        }

        formstring += '<input name="dorm" placeholder="Dorm">' +
                '<select id="si-size" name="size">' +
                    '<option value="">Size</option>' +
                    '<option value="00">00</option>' +
                    '<option value="0">0</option>' +
                    '<option value="2">2</option>' +
                    '<option value="4">4</option>' +
                    '<option value="6">6</option>' +
                    '<option value="8">8</option>' +
                    '<option value="10">10</option>' +
                    '<option value="12">12</option>' +
                '</select>' +

                '<select id="si-color" name="color">' +
                    '<option value="">Color</option>' +
                    '<option value="black">Black</option>' +
                    '<option value="blue">Blue</option>' +
                    '<option value="white">White</option>' +
                    '<option value="pink">Pink</option>' +
                    '<option value="red">Red</option>' +
                    '<option value="green">Green</option>' +
                    '<option value="grey">Grey</option>' +
                    '<option value="other">Other</option>' +
                '</select>' +

                '<select id="si-length" name="length">' +
                    '<option value="">Length</option>' +
                    '<option value="mini">Mini</option>' +
                    '<option value="midi">Midi</option>' +
                    '<option value="maxi">Maxi</option>' +
                '</select>' +

                '<input name="brand" placeholder="Brand">' +
                '<input name="description" placeholder="Description">' +
                '<input type="file" name="file">' +
                '<div class="clearfix space40"></div>' +
                '<button id="upload-button" class="btn2 btn-center" type="button">Upload!</button>' +
                '<div class="clearfix space40"></div>'  +
        '</form>';

        return formstring;
    }

    function imageHtmlFactory (i) {

        var imagesrc = "data:" + i.contenttype + ";base64," + i.imagedata;
        var imageString = '<li>' +
            '<div class="product-image">' + 
                '<div class="f1_container" style="height:250px;width:190px">' + 
                '<div class="f1_card" >' +
                    '<div class="front face" style="background-image: url(\'' + imagesrc +'\');background-position:center;background-size:cover;">' +
                        //'<div style="background-image: url("' + imagesrc +'")"></div>' +
                        //'<img src="' + imagesrc + '" class="img-responsive" alt="" style="max-width:none; width:auto; height:100%" />' + 
                    '</div>' + 
                    '<div class="back face">' +
                        '<img src="' + imagesrc + '" class="img-responsive" alt="" style="width:auto: height:100%" />' +
                    '</div>' +
                '</div>' +
                '</div>' +
            '</div>' +
            '<div class="product-info" >' + '<div class="centre">' +
                '<h4 class="product-name"><a>' + i.brand + ', ' + i.size + '</a></h4>' +
                '<span>' + i.user.name + '<br>' +
                i.user.email + '<br>' +
                '<em><b>Phone:</b></em> ' + i.user.phone + '<br>' +
                '<em><b>Dorm:</b></em> ' + i.user.dorm  + '</span>' ;
        

        if (getEmailForProfile()) {
            imageString+= '<h4 class=product-name><a onclick="deleteImage(\'' + i._id + '\')" href="#">DELETE POST</a></h4>'
        }

        imageString+= '</div>' +
        '</li>';

        return imageString
    }

    function uploadSuccess (res) {
        alert('Your dress was successfully uploaded!')

        window.location = window.location.origin;
    }

    // Lookbook Sort
    "use strict"; 
    $(".sort1").on("click", function() {
        $('#sort1').css('opacity', '1');
        $('#sort2 , #sort3 , #sort4').css('opacity', '0.3');
        $(this).addClass('active');
        $('.sort2, .sort3, .sort4, .sort-all').removeClass('active');
    });

    "use strict"; 
    $(".sort2").on("click", function() {
        $('#sort1 , #sort3 , #sort4').css('opacity', '0.3');
        $('#sort2').css('opacity', '1');
        $(this).addClass('active');
        $('.sort1, .sort3, .sort4, .sort-all').removeClass('active');
    });

    "use strict"; 
    $(".sort3").on("click", function() {
        $('#sort1 , #sort2 , #sort4').css('opacity', '0.3');
        $('#sort3').css('opacity', '1');
        $(this).addClass('active');
        $('.sort1, .sort2, .sort4, .sort-all').removeClass('active');
    });

    "use strict"; 
    $(".sort4").on("click", function() {
        $('#sort1 , #sort2 , #sort3').css('opacity', '0.3');
        $('#sort4').css('opacity', '1');
        $(this).addClass('active');
        $('.sort1, .sort2, .sort3, .sort-all').removeClass('active');
    });

    "use strict"; 
    $(".sort-all").on("click", function() {
        $('#sort1 , #sort2 , #sort3 , #sort4').css('opacity', '1');
        $(this).addClass('active');
        $('.sort1, .sort2, .sort3, .sort4').removeClass('active');
    });

    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars() {   
        var vars = {}, hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
        }
        console.log(vars);
        return vars;
    }

    // Owl news
    "use strict"; 
    var owl = $("#owl-news");

    owl.owlCarousel({
        itemsCustom: [
            [0, 1],
            [450, 2],
            [600, 3],
            [700, 3],
            [1000, 4],
            [1200, 4],
            [1400, 4],
            [1600, 4]
        ],
        navigation: true,
        pagination: false

    });

    // Slider Revolution
    "use strict"; 
    jQuery('.tp-banner').show().revolution({
        dottedOverlay: "none",
        delay: 16000,
        startwidth: 1280,
        startheight: 655,
        hideThumbs: 200,
        thumbWidth: 100,
        thumbHeight: 50,
        thumbAmount: 5,
        navigationType: "bullet",
        navigationArrows: "solo",
        navigationStyle: "preview4",
        touchenabled: "on",
        onHoverStop: "on",
        swipe_velocity: 0.7,
        swipe_min_touches: 1,
        swipe_max_touches: 1,
        drag_block_vertical: false,
        parallax: "mouse",
        parallaxBgFreeze: "on",
        parallaxLevels: [7, 4, 3, 2, 5, 4, 3, 2, 1, 0],
        keyboardNavigation: "off",
        navigationHAlign: "center",
        navigationVAlign: "bottom",
        navigationHOffset: 0,
        navigationVOffset: 20,
        soloArrowLeftHalign: "left",
        soloArrowLeftValign: "center",
        soloArrowLeftHOffset: 20,
        soloArrowLeftVOffset: 0,
        soloArrowRightHalign: "right",
        soloArrowRightValign: "center",
        soloArrowRightHOffset: 20,
        soloArrowRightVOffset: 0,
        shadow: 0,
        fullWidth: "on",
        fullScreen: "off",
        spinner: "spinner4",
        stopLoop: "off",
        stopAfterLoops: -1,
        stopAtSlide: -1,
        shuffle: "off",
        autoHeight: "off",
        forceFullWidth: "off",
        hideThumbsOnMobile: "off",
        hideNavDelayOnMobile: 1500,
        hideBulletsOnMobile: "off",
        hideArrowsOnMobile: "off",
        hideThumbsUnderResolution: 0,
        hideSliderAtLimit: 0,
        hideCaptionAtLimit: 0,
        hideAllCaptionAtLilmit: 0,
        startWithSlide: 0
    });

    // Custom tabs
    "use strict"; 
    $(".tabs-menu a").click(function(event) {
        event.preventDefault();
        $(this).parent().addClass("current");
        $(this).parent().siblings().removeClass("current");
        var tab = $(this).attr("href");
        $(".tab-content").not(tab).css("display", "none");
        $(tab).fadeIn();
    });

    // Shop Single Slider
    "use strict"; 
    $("#owl-demo").owlCarousel({
        navigation: true, 
        slideSpeed: 300,
        pagination: false,
        paginationSpeed: 400,
        singleItem: true
    });

});

// Sticky Header
$(window).load(function() {
"use strict"; 
    $(".header-wrap").sticky({
        topSpacing: 0
    });
});

