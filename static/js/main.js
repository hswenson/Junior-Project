$(document).ready(function() {

    // Custom Select

    "use strict"; 
    $('#cart-country').fancySelect();
    $('#cart-town').fancySelect();
    $('#sm-size').fancySelect();
    $('#sm-color').fancySelect();
    $('#sm-quantity').fancySelect();
    $('#si-sort').fancySelect();
    $('#si-cat').fancySelect();
    $('#si-size').fancySelect();
    $('#si-color').fancySelect();
    $('#si-price').fancySelect();

    // Slide Menu
    "use strict"; 
    $('.menu-trigger').on('click', function() {
        if ($('nav').hasClass('nav-active')) {
            $('nav').removeClass('nav-active')
            $(this).removeClass('menu-trigger-active')

        } else {
            $('nav').addClass('nav-active')
            $(this).addClass('menu-trigger-active')

        }
    });

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

    // Close Cart table
    "use strict"; 
    $(".close-cart").on("click", function() {
        $(this).parent().parent().hide();
    });

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

