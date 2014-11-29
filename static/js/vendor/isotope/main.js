// Product Filter

$(window).load(function() {
    "use strict"; 

    var portfolio_ctn = $(".portfolio-items");

    portfolio_ctn.isotope({
        // options
        itemSelector: '.item',
        layoutMode: 'fitRows',
    });


    function setCols() {
        var winWidth = $(window).width(),
            colNum = getColNum(),
            colWidth = Math.floor(winWidth / colNum) + 'px';
        portfolio_ctn.find('.item').each(function() {
            $(this).css("width", colWidth);
        });
    }

    function reLayoutItems() {
        setCols();
        portfolio_ctn.isotope('reLayout');
    }

    $(window).bind('resize', function() {
        reLayoutItems();
    });

    $('#filters a').click(function() {
        var selector = $(this).attr('data-filter');
        $('a.active').removeClass('active');
        $(this).addClass('active');

        portfolio_ctn.isotope({
            filter: selector
        });
        return false;
    });
});