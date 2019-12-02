$( document ).on( "wb-ready.wb", function( event ) {
    const API_URL = 'https://tbs.norconex.com/api';
    //const API_URL = 'http://localhost:9191/api';
    const MAX_DOCS_PER_PAGE = 10;
    const MAX_PAGINATION_LINKS = 7;
    var CURRENT_PAGE = 1;
    var RECALL_TYPES = [];

    
    var params = new window.URLSearchParams(window.location.search);
    // When debugging, below allows to pass the search term to the URL
    // and submit the form.  Useful for refreshing the page without
    // re-entering the value and pressing search over and over.
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

    $("#recall-categories-filter a").click(function() {
        // remove classes from all
        $("a").removeClass("active");
        // add class to the one we clicked
        $(this).addClass("active");
     });

    // run the initial search
    search();
    $("#currentConcerns").removeClass("wb-inv");
    $(".opening-game").removeClass("wb-inv");
    $(".pagetag").removeClass("wb-inv");
    $("#recall-facets").addClass("wb-inv");

    function debug(json) {
        $('#debug').text(JSON.stringify(json, null, 4));
    }
  
    
    $('#food-link').click(function() {
        RECALL_TYPES.length = 0;
        RECALL_TYPES.push("food");
        search();
    });

    $('#vehicles-link').click(function() {
        RECALL_TYPES.length = 0;
        RECALL_TYPES.push("vehicles");
        search();
    });

    function clearAjaxError() {
        $("#error").empty();
        $("#error").hide();
    }
    function noResults(data) {
        $('#noResults').show();
        $('#searchResponse').hide();
        updateSearchSpellCheck(data);
    }
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
    
    function updateSearchResults(data) {
        $searchResults = $('#searchResults');
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
    
    function updateSearchHeading(data) {
        $searchHeading = $('#searchHeading');
        if (data.recalls.numFound > MAX_DOCS_PER_PAGE) {
            var from = ((CURRENT_PAGE - 1) * MAX_DOCS_PER_PAGE) + 1;
            var to = from + Math.min(MAX_DOCS_PER_PAGE, data.recalls.results.length) - 1;
            $searchHeading.find('.recall-from').text(from);
            $searchHeading.find('.recall-to').text(to);
            $searchHeading.find('.recall-showing').show();
        } else {
            $searchHeading.find('.recall-showing').hide();
        }
        $searchHeading.find('.recall-found').text(data.recalls.numFound);
    }
    
    function updateSearchSpellCheck(data) {
        $('#searchSpellCheck').hide();
        if (!data.spellCheck.empty) {
            $link = $('#searchSpellCheck a');
            $link.html(data.spellCheck.markup);
            $link.off('click');
            $link.click(function () {
                CURRENT_PAGE = 1;
                $('#terms').val(data.spellCheck.query);
                search();
                return false;
            });
            $('#searchSpellCheck').show();
        }
    }

    $(".btn-clear").click(function(e) {
        RECALL_TYPES.length = 0;
        search();
    });
    
    function updateSearchFacets(data) {
        //TODO Will need to be updated if we return more facets
        $searchFacetType =  $('#searchFacets .recall-facet-type');
        $searchFacetType.empty();
        if (!data.facets.empty) {
            $.each(data.facets[0].values, function(i, value) {
                // Pascal should fix this
                if (value.name !== 'undefined') {
                /*
                <li id="template-facet-entry" style="display: none;" class="checkbox checkbox-small">
                    <input class="recall-facet-link" type="checkbox" id="label-id"> <!-- Note: need this ID to match the label -->
                    <label id="label-for" for="" class="recall-facet-label">Food</label><span class="recall-facet-count badge pull-right">111</span>  <!-- Note: need this ID to match the label -->
                </li>
                */
                var $facetEntry = clone('#template-facet-entry');
                $facetEntry.find('.recall-facet-label').text(value.name);
                $facetEntry.find('.recall-facet-label').attr('for',value.name);
                $facetEntry.find('.recall-facet-count').text(value.count);
                $facetEntry.find('.recall-facet-link').attr('id',value.name);
                if (RECALL_TYPES.includes(value.name)) {
                    $facetEntry.find('.recall-facet-link').attr('checked',true);
                }
                

                $link = $facetEntry.find('.recall-facet-link');
                if (RECALL_TYPES.includes(value.name)) {
                    $link.addClass('active');
                }
                $link.click(function(e) {
                    e.preventDefault();
                    CURRENT_PAGE = 1;
                    if (RECALL_TYPES.includes(value.name)) {
                        RECALL_TYPES.splice(RECALL_TYPES.indexOf(value.name), 1);
                    } else {
                        RECALL_TYPES.push(value.name);
                    }
                    search();
                    return false;
                });
    
                $searchFacetType.append($facetEntry);
                $facetEntry.show();
            }
            });
        }
    }
    
    function updateSearchPagination(data) {
        $searchPageLinks =  $('#searchPageLinks');
        
        var numOfPageLinks = Math.min(Math.ceil(
                data.recalls.numFound / MAX_DOCS_PER_PAGE), MAX_PAGINATION_LINKS);
        var first = Math.max(1, CURRENT_PAGE - Math.floor(numOfPageLinks / 2));
        var last = Math.min(numOfPageLinks, first + numOfPageLinks - 1);
    
        var prev = Math.max(1, CURRENT_PAGE - 1);
        var $prevLink = $('.recall-pagination-prev');
        updateSearchPaginationLink($prevLink, prev);
    
        var next = Math.min(numOfPageLinks, CURRENT_PAGE + 1);
        var $nextLink = $('.recall-pagination-next');
        updateSearchPaginationLink($nextLink.first(), next);
    
        $searchPageLinks.empty();
        $searchPageLinks.append($prevLink.parent()); 


        if (CURRENT_PAGE === 1) {
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
    function updateSearchPaginationLink($link, pageNumber) {
        if (pageNumber == CURRENT_PAGE) {
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
                CURRENT_PAGE = pageNumber;
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
    
    function clone(selector) {
        var $el = $(selector).clone();
        $el.removeAttr('id');
        return $el;
    }
    
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
       
    function updateSearchResults(data) {
        $searchResults = $('#searchResults');
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
    
    function updateSearchHeading(data) {
        $searchHeading = $('#searchHeading');
        if (data.recalls.numFound > MAX_DOCS_PER_PAGE) {
            var from = ((CURRENT_PAGE - 1) * MAX_DOCS_PER_PAGE) + 1;
            var to = from + Math.min(MAX_DOCS_PER_PAGE, data.recalls.results.length) - 1;
            $searchHeading.find('.recall-from').text(from);
            $searchHeading.find('.recall-to').text(to);
            $searchHeading.find('.recall-showing').show();
        } else {
            $searchHeading.find('.recall-showing').hide();
        }
        $searchHeading.find('.recall-found').text(data.recalls.numFound);
    }
    
    function updateSearchSpellCheck(data) {
        $('#searchSpellCheck').hide();
        if (!data.spellCheck.empty) {
            $link = $('#searchSpellCheck a');
            $link.html(data.spellCheck.markup);
            $link.off('click');
            $link.click(function () {
                CURRENT_PAGE = 1;
                $('#terms').val(data.spellCheck.query);
                search();
                return false;
            });
            $('#searchSpellCheck').show();
        }
    }
    
       
    
    
    
    
    
    function search() {
        $("#currentConcerns").addClass("wb-inv");
        $(".opening-game").addClass("wb-inv");
        $(".pagetag").addClass("wb-inv");
        $("#recall-facets").removeClass("wb-inv");

        $.ajax({
            url: API_URL + '/search',
            data: JSON.stringify({
                'terms': $("#terms").val(),
                'pageIndex': CURRENT_PAGE,
                'docsPerPage': MAX_DOCS_PER_PAGE,
                'recallTypes': RECALL_TYPES
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
    
    
    $('#searchForm').submit(function(e) {
        e.preventDefault();
        CURRENT_PAGE = 1;
        search();
        return false;
    });

  
    
   
});