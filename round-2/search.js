/*
 * NOTE: Ideally you would want the API_URL variable to be configurable
 * (as opposed to hard-coded). For now though, it does not matter much.
 * Just update them to use appropriate values if need be.
 */
const API_URL = 'https://tbs.norconex.com/api';
//const API_URL = 'http://localhost:9191/api';
const MAX_DOCS_PER_PAGE = 10;
const MAX_PAGINATION_LINKS = 7;
var currentPage = 1;
var recallTypes = [];

function clearAjaxError() {
    $("#error").empty();
    $("#error").hide();
}
function showAjaxError(jqXHR, text, errorThrown) {
    // Format this how you want or maybe display a generic error msg instead:
    $("#error").html(
        "<b>jqXHR:</b> " + JSON.stringify(jqXHR) + "<br>"
      + "<b>text:</b> " + JSON.stringify(text) + "<br>"
      + "<b>errorThrown:</b> " + JSON.stringify(errorThrown)
    );
    $('#error').show();
}

/**
 * Formats a number to human-readable format.
 * @param x the number
 * @returns formatted number
 */
function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Hides results and show a "no results" message.
 * @param data JSON search response
 */
function noResults(data) {
    $('#noResults').show();
    $('#searchResponse').hide();
    updateSearchSpellCheck(data);
}

/**
 * Update entire search response. Triggered every time a search request is made.
 * @param data JSON search response
 */
function updateResponse(data) {
    $('#noResults').hide();
    updateSearchHeading(data);
    updateSearchResults(data);
    updateSearchFacets(data);
    updateSearchPagination(data);
    updateSearchSpellCheck(data);
    $('#searchResponse').show();
    // jennifer(data);
}

/**
 * Update search results.
 * @param data JSON search response
 */
function updateSearchResults(data) {
    var $searchResults = $('#searchResults');
    $searchResults.empty();
    $.each(data.recalls.results, function(i, recall) {
        var $el = clone('#template-recall');
        $el.find('.recall-link').attr('href', recall.url);
        setHtml($el, '.recall-title', recall.title);
        setHtml($el, '.recall-summary', recall.description);
        setHtml($el, '.recall-type', recall.type);
        setHtml($el, '.recall-date', recall.date);
        setHtml($el, '.recall-department', recall.department);
        setHtml($el, '.recall-url', recall.url);
        setHtml($el, '.recall-id', recall.id);
        setHtml($el, '.recall-recallNo', recall.recallNo);
        setHtml($el, '.recall-alertType', recall.alertType);

        if ('vehicles' === recall.type) {
            setHtml($el, '.recall-make', recall.make);
            setHtml($el, '.recall-model', recall.model);
            setHtml($el, '.recall-years', recall.years);
            setHtml($el, '.recall-numberAffected', recall.numberAffected);
            setHtml($el, '.recall-systemType', recall.systemType);
            setHtml($el, '.recall-notificationType', recall.notificationType);
            $searchResults.find('.recall-vehicle').show();
        } else {
            $searchResults.find('.recall-vehicle').hide();
        }

        $searchResults.append($el);
        $el.show();
    });
}

/**
 * Update search heading (e.g., 666 found, showing 1 to 10).
 * @param data JSON search response
 */
function updateSearchHeading(data) {
    var $searchHeading = $('#searchHeading');
    if (data.recalls.numFound > MAX_DOCS_PER_PAGE) {
        var from = ((currentPage - 1) * MAX_DOCS_PER_PAGE) + 1;
        var to = from + Math.min(MAX_DOCS_PER_PAGE, data.recalls.results.length) - 1;
        $searchHeading.find('.recall-from').text(from);
        $searchHeading.find('.recall-to').text(to);
        $searchHeading.find('.recall-showing').show();
    } else {
        $searchHeading.find('.recall-showing').hide();
    }
    $searchHeading.find('.recall-found').text(formatNumber(data.recalls.numFound));
}

/**
 * Update "Did You Mean" feature when few/no results are found.
 * @param data JSON search response
 */
function updateSearchSpellCheck(data) {
    $('#searchSpellCheck').hide();
    if (!data.spellCheck.empty) {
        var $link = $('#searchSpellCheck a');
        $link.html(data.spellCheck.markup);
        $link.off('click');
        $link.click(function () {
            currentPage = 1;
            $('#terms').val(data.spellCheck.query);
            search();
            return false;
        });
        $('#searchSpellCheck').show();
    }
}

/**
 * Update search facets
 * @param data JSON search response
 */
function updateSearchFacets(data) {
    //TODO Will need to be updated if we return more facets
//    var $searchFacetType =  $('#searchFacets .recall-facet-type');
//    $searchFacetType.empty();
    if (!data.facets.empty) {
        updateSearchFacetRecallTypes(data.facets.recallTypes);
/*        updateSearchFacet(
                data.facets.recallTypes,
                '#template-facet-entry-recallTypes',
                '#recall-types-filter',
                function($facetListItem, facetEntry, i) {
            $facetListItem.find('label').addClass(
                    'recalls-filter-' + (i + 1) + '-var-2');
        });
*/
    }
}

function updateSearchFacetRecallTypes(facetData) {
    var $container = $('#recall-types-filter');
    $('#recall-types-filter a').removeClass("active");
    $.each(facetData.values, function(index, entry) {
        var $link = $container.find("a[data-type='" + entry.value + "']");
        $link.find('.facet-count').text('(' + formatNumber(entry.count) + ')');
        if (recallTypes.includes(entry.value)) {
            $link.addClass("active");
        }
    });
}



/**
 * Update a single facet.
 * @param facetData data for a facet
 */
function updateSearchFacetGeneric(
        facetData, templateSelector, containerSelector, callback) {
    var $container = $(containerSelector);
    $container.empty();
    $.each(facetData.values, function(i, facetEntry) {
        var $facetListItem = clone(templateSelector);
        var $input = $facetListItem.find('.recall-facet-input');
        var $label = $facetListItem.find('.recall-facet-label');

        var inputId = 'facet-input-' + facetEntry.field + '-' + i;
        var labelId = 'facet-label-' + facetEntry.field + '-' + i;

        $input.attr('id', inputId);
        $input.val(facetEntry.value);
        $label.text(facetEntry.label);
        $label.attr('id', labelId);
        $label.attr('for', inputId);

        $facetListItem.find('.recall-facet-count').text(facetEntry.count);
        if (recallTypes.includes(facetEntry.value)) {
            $input.attr('checked', true);
            $label.addClass('active');
        }

        if (callback !== 'undefined') {
            callback($facetListItem, facetEntry, i);
        }

        $container.append($facetListItem);
        $facetListItem.show();
    });
}
/*
    var $link = $facetListItem.find('.recall-facet-link');
    if (recallTypes.includes(facetEntry.name)) {
        $link.addClass('active');
    }
    $link.click(function(e) {
        e.preventDefault();
        currentPage = 1;
        if (recallTypes.includes(facetEntry.name)) {
            recallTypes.splice(recallTypes.indexOf(facetEntry.name), 1);
        } else {
            recallTypes.push(facetEntry.name);
        }
        search();
        return false;
    });
*/
//}

/**
 * Update search pagination.
 * @param data JSON search response
 */
function updateSearchPagination(data) {
    var $searchPageLinks =  $('#searchPageLinks');

    var numOfPageLinks = Math.min(Math.ceil(
            data.recalls.numFound / MAX_DOCS_PER_PAGE), MAX_PAGINATION_LINKS);
    var first = Math.max(1, currentPage - Math.floor(numOfPageLinks / 2));
    var last = Math.min(numOfPageLinks, first + numOfPageLinks - 1);

    var prev = Math.max(1, currentPage - 1);
    var $prevLink = $('.recall-pagination-prev');
    updateSearchPaginationLink($prevLink, prev);

    var next = Math.min(numOfPageLinks, currentPage + 1);
    var $nextLink = $('.recall-pagination-next');
    updateSearchPaginationLink($nextLink.first(), next);

    $searchPageLinks.empty();
    $searchPageLinks.append($prevLink.parent());


    if (currentPage === 1) {
        $prevLink.parent().attr('style','display:none;');
    } else {
        $prevLink.parent().removeAttr('style');
    }

    for (var i = first; i <= last; i++) {
        var $li = clone('#template-pagination-li');
        var $link = $('.recall-page-link', $li);
        $link.text(i);
        updateSearchPaginationLink($link, i);
        $searchPageLinks.append($li);
        $li.show();
    }

    $searchPageLinks.append($nextLink.parent());

}
/**
 * Update an individual search pagination link.
 * @param data JSON search response
 */
function updateSearchPaginationLink($link, pageNumber) {
    if (pageNumber == currentPage) {
        $link.addClass('disabled');
        $link.removeAttr('href');
        if ($link.hasClass('recall-page-link')) {
            $link.addClass('active');
        }
    } else {
        $link.off('click');
        $link.attr('href', '#');
        $link.removeClass('disabled');
        $link.click(function() {
            currentPage = pageNumber;
            search();
            return false;
        });
    }
}

function setHtml($parent, childSelector, html) {
    var $child = $parent.find(childSelector);
    if ($child.length != 0) {
        if (html) {
            var h = html;
            if (Array.isArray(h)) {
                h = h.join(', ');
            }
            if (typeof h === 'string' || h instanceof String) {
                h = h.replace(/&lt;(\/?mark)&gt;/g, '<$1>');
            }
            $child.html(h);
        } else {
            $child.remove();
        }
    }
}

/**
 * Clones the element matching the given selector.
 * @param selector the element to clone
 * @returns the cloned element
 */
function clone(selector) {
    var $el = $(selector).clone();
    $el.removeAttr('id');
    return $el;
}

/**
 * Performs a new search by invoking the search REST API and updating
 * the page with the obtained response.
 */
function search() {
    $("#currentConcerns").addClass("wb-inv");
    $(".opening-game").addClass("wb-inv");
    $(".pagetag").addClass("wb-inv");
    $("#recall-facets").removeClass("wb-inv");

    $.ajax({
        url: API_URL + '/search',
        data: JSON.stringify({
            'terms': $("#terms").val(),
            'pageIndex': currentPage,
            'docsPerPage': MAX_DOCS_PER_PAGE,
            'recallTypes': recallTypes
        }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        type: "POST",
        success: function (data) {
            clearAjaxError();
            if (!data.recalls || data.recalls.length == 0 || data.recalls.numFound == 0) {
                noResults(data);
            } else {
                updateResponse(data);
            }
//            debug(data);
        },
        error: showAjaxError
    });
}

/**
 * Stringify an object (JSON).
 * @param obj
 * @returns string version
 */
function toString(obj) {
    return JSON.stringify(obj, null, 4);
}

/**
 * When debugging, this function will display the Ajax JSON response
 * in an HTML element with id "debug".
 * @param json JSON response
 */
function debug(json) {
    $('#debug').text(toString(json));
}

/*=============================================================================
 * ON DOM READY
 *----------------------------------------------------------------------------*/
$( document ).on( "wb-ready.wb", function() {

    /*
     * When developing, below allows to pass the search term to the URL
     * and submit the form.  Useful for refreshing the page without
     * re-entering the value and pressing search over and over.
     */
    var params = new window.URLSearchParams(window.location.search);
    var terms = params.get('terms');
    if (terms) {
        $('#terms').val(terms);
        $('#searchForm').submit();
    }


    //var checkTitle = "needs-to-pickup-right-value";
    // var checkTitle = $( '#label-for' ).first().text(); //  not populating when the label rename/populating happens
    /* make this recall-facet-label , would need to be switched to the subcategories when they become available */
    //var element = document.getElementById('label-id');
    //element.setAttribute('id', checkTitle);
    //var element = document.getElementById('label-for');
    //element.removeAttribute('id');
    //element.setAttribute('for', checkTitle);

    // run the initial search
    search();
    $("#currentConcerns").removeClass("wb-inv");
    $(".opening-game").removeClass("wb-inv");
    $(".pagetag").removeClass("wb-inv");
    $("#recall-facets").addClass("wb-inv");


    // Recall type tabs clicks
    $('#recall-types-filter a').click(function(e) {
        e.preventDefault();
        recallTypes.length = 0;
        if (!$(this).hasClass('active')) {
            recallTypes.push($(this).data('type'));
        }
        search();
        return false;
    });

    $(".btn-clear").click(function(e) {
        recallTypes.length = 0;
        search();
    });

    $('#searchForm').submit(function(e) {
        e.preventDefault();
        currentPage = 1;
        search();
        return false;
    });
});
