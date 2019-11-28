document.addEventListener("DOMContentLoaded", function(){
 var id = getUrlParameter('id'); // (gets me URL parameters)
 var lang = getUrlParameter('lang'); // (gets me URL parameters)

 // get the URL aprameters for ID and Lang then return API JSON
 var jsonfromhc = getRecall(id, lang);
 console.log(id);
 console.log(lang);
});

function getRecall(id, lang) {
   var base = 'http://healthycanadians.gc.ca/recall-alert-rappel-avis';
   var uri = base + '/api/' + id + '/' + lang;

   $.ajax({
       url:uri,
       type:'GET',
       Accept:"application/json",
       dataType: 'json',
       success:function(data){

         // check if title is weird CFIA thing
         //if (data.title).indexOf("title=") >0) {

         //} else {
        //   console.log(data.title);
        //   $("#toptitle").text(data.title);
         //}

         //set products array
         var products = [];
         console.log(products);
         console.log(data);
         productsCount = 0;
         descriptionText = "";
         var imagePan = [];
         //set panels...
         $.each(data.panels, function() {
           //get image array
           if (this.panelName === "images") {
             imagePan = (this.data);
             //var imagePanNum = this.index;
           } else if (this.panelName.substring(0, 7) === "product") {
             //get products
             products[productsCount] = (this);
             productsCount = productsCount + 1;
           } else if (this.panelName === "details") {
             //2 different patterns (so far) for description
             descriptionText = this.text;
             //remove the date???
           } else if (this.panelName === "cms_who_what_consumer") {
             $("#whattodo").append($.trim(this.text.substring(1, this.text.length - 2)).replace(/[\r\n|\r|\n]+/g, "<br /><br />"));
           } else if (this.panelName === "cms_reason_reason_recall") {
             console.log(this.text);
             descriptionText = this.text;
           }
         });
         //get all categories
         categoryname = data.panels[0].text.substr(data.panels[0].text.indexOf("Category")+14,data.panels[0].text.indexOf("<",data.panels[0].text.indexOf("Category")+14)-(data.panels[0].text.indexOf("Category")+14));

         //Remap the categories, get the number of them, get the URLs for breadcrumbs
         //if 2 category names, make 2 tags, with comma separation
         var categories = categoryname.split(', ');
         //var categoryout = '<span style="text-decoration:none;">ᐸ </span>';
         console.log(categoryname);
         var pCat = [];
         var pCatURL = [];
         var pSCat = [];
         var pSCatURL = [];
         q = 0;
         $.each(categories, function() {
           if (this.substr(0, 8) === "Allergen") {
             pCat[q] = "Allergen";
             pCatURL[q] = '';
             pSCat[q] = 'Undeclared ' + this.substr(11, this.length-11).toLowerCase();
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Microbiological") {
             if (this.indexOf("E. coli") > 1) {
               pCat[q] = "Microbiological";
               pCatURL[q] = '';
               pSCat[q] = 'E. Coli';
               pSCatURL[q] = '';
             } else {
               pCat[q] = "Microbiological";
               pCatURL[q] = '';
               pSCat[q] = this.substr(18, this.length-18);
               pSCatURL[q] = '';
             }
           } else if (this.substr(0, 3) === "Car") {
             pCat[q] = "Car";
             pCatURL[q] = '';
             pSCat[q] = 'Other';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "3 Wheel Car") {
             pCat[q] = "Car";
             pCatURL[q] = '';
             pSCat[q] = '3 Wheel Car';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "SUV") {
             pCat[q] = "Car";
             pCatURL[q] = '';
             pSCat[q] = 'SUV';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Med. & H.D.") {
             pCat[q] = "Truck";
             pCatURL[q] = '';
             pSCat[q] = 'Medium and heavy duty vehicle';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Light Truck & Van") {
             pCat[q] = "Truck";
             pCatURL[q] = '';
             pSCat[q] = 'Light truck or van';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "RV Chassis") {
             pCat[q] = "Truck";
             pCatURL[q] = '';
             pSCat[q] = 'RV chassis';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Chassis Cab") {
             pCat[q] = "Truck";
             pCatURL[q] = '';
             pSCat[q] = 'Chassis cab';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Motorhome") {
             pCat[q] = "Trailer/RV";
             pCatURL[q] = '';
             pSCat[q] = 'Motorhome';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Travel Trailer") {
             pCat[q] = "Trailer/RV";
             pCatURL[q] = '';
             pSCat[q] = 'Travel trailer';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Light Trailer") {
             pCat[q] = "Trailer/RV";
             pCatURL[q] = '';
             pSCat[q] = 'Light trailer';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Heavy Trailer") {
             pCat[q] = "Trailer/RV";
             pCatURL[q] = '';
             pSCat[q] = 'Heavy trailer';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Bus") {
             pCat[q] = "Bus";
             pCatURL[q] = '';
             pSCat[q] = 'Other';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Snowmobile") {
             pCat[q] = "Snowmobile";
             pCatURL[q] = '';
             pSCat[q] = 'Other';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Snowmobile Cutter") {
             pCat[q] = "Snowmobile";
             pCatURL[q] = '';
             pSCat[q] = 'Snowmobile cutter';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Child Car Seat") {
             pCat[q] = "Car seat";
             pCatURL[q] = '';
             pSCat[q] = 'Child car seat';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Booster Seat") {
             pCat[q] = "Car seat";
             pCatURL[q] = '';
             pSCat[q] = 'Booster seat';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Motorcycle") {
             pCat[q] = "Motorcycle";
             pCatURL[q] = '';
             pSCat[q] = 'Other';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Minibike/ Moped /Scooter") {
             pCat[q] = "Motorcycle";
             pCatURL[q] = '';
             pSCat[q] = 'Minibike, moped or scooter';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "Low Speed Motorcycle") {
             pCat[q] = "Motorcycle";
             pCatURL[q] = '';
             pSCat[q] = 'Low speed motorcycle';
             pSCatURL[q] = '';
           } else if (this.substr(0, 15) === "3 Wheel Motorcycle") {
             pCat[q] = "Motorcycle";
             pCatURL[q] = '';
             pSCat[q] = '3 wheel motorcycle';
             pSCatURL[q] = '';
           } else {
             pCat[q] = titleCase(categoryname);
             pCatURL[q] = '';
           }
           q++;
         });
         console.log(categoryout);
         $("#category-tag").append(categoryout);
         //add the car subcategories to the if clauses...


         //Modify metadata title
         // console.log(data.title);
         // $("#toptitle").append(data.title);
         document.getElementsByTagName("title")[0].text(data.title+' - Canada.ca');
         //Modify page title + category sub-title
         // $("#page-title").text(data.title + " - Canada.ca");
         document.getElementsByTagName("h1")[0].text('<span class="stacked"> <span>'+data.title+'</span>: <span>'+[facets]+'</span></span>';

         pCat =
         pCatURL =
         pSCat =
         pSCatURL =
         $('.breadcrumb').text('<li class="hidden-xs hidden-sm"><a href="">Home</a></li><li class="hidden-xs hidden-sm"><a href="">Recalls and safety alerts</a></li><li class="hidden-xs hidden-sm"><a href="'+pCatURL+'">'+pCat+'</a></li><li class="no-break-breadcrumb"><a href="'+pSCatURL+'">'+pSCat+'</a></li>');


           //if "brand name" section in product array, use threatening
           //else "companies" else "distributors"

           console.log(products);
           brandCount = 0;
           var brands = [];

           //Do the brand labels here match the search filter brands?
           //Do a similar search string replacement as in the categories


            $.each(products, function() {
              console.log(this.text.indexOf("Distributor"));
              if (this.text.indexOf("Brand name:") >-1) {
                //if this does not match a previously added brand, then include
                if (jQuery.inArray($.trim(this.text.substr(this.text.indexOf("Brand name:")+16, this.text.indexOf("<", this.text.indexOf("Brand name:")+16) - (this.text.indexOf("Brand name:")+16))), brands) === -1) {
                  brands[brandCount] = ($.trim(this.text.substr(this.text.indexOf("Brand name:")+16, this.text.indexOf("<", this.text.indexOf("Brand name:")+16) - (this.text.indexOf("Brand name:")+16))));
                  brandCount = brandCount + 1;
                }
              } else if (this.text.indexOf("Distributor") >-1) {
                if (jQuery.inArray($.trim(this.text.substr(this.text.indexOf("Distributor")+20, this.text.indexOf("<", this.text.indexOf("Distributor")+20) - (this.text.indexOf("Distributor:")+20))), brands) === -1) {
                  brands[brandCount] = ($.trim(this.text.substr(this.text.indexOf("Distributor")+20, this.text.indexOf("<", this.text.indexOf("Distributor")+20) - (this.text.indexOf("Distributor")+20))));
                  brandCount = brandCount + 1;
                }
              } else if (this.text.indexOf("Manufacturer") >-1) {
                if (jQuery.inArray($.trim(this.text.substr(this.text.indexOf("Manufacturer")+21, this.text.indexOf("<", this.text.indexOf("Manufacturer")+21) - (this.text.indexOf("Manufacturer:")+21))), brands) === -1) {
                  brands[brandCount] = ($.trim(this.text.substr(this.text.indexOf("Manufacturer")+21, this.text.indexOf("<", this.text.indexOf("Manufacturer")+21) - (this.text.indexOf("Manufacturer")+21))));
                  brandCount = brandCount + 1;
                }
              }
            });
            console.log(brands.length);

            //Brands under title - only if less than 5 of them, else blank
            newbrand = "";
            if (brands.length < 5) {
              $.each(brands, function(index, value) {
                if (value != null && value != "") {
                  newbrand = newbrand + value + ", "; // get this from the products array (brand name)
                }
              });
              newbrand = newbrand.substr(0, newbrand.length - 2);
              console.log(newbrand);
              $("#brand-link").append(newbrand);
            }

           //Start date
           //console.log(data.start_date.getFullYear()); //1527552000 1526601600
           console.log(Date(data.start_date).indexOf("201") + 1);
           // date if true
           console.log((Date(data.start_date).substr(4, Date(data.date_published).indexOf("201")-5) + ", " + Date(data.date_published).substr(Date(data.date_published).indexOf("201"), 4)));
           // date if not true
           console.log((Date(data.start_date).substr(4, Date(data.date_published).indexOf("200")-5) + ", " + Date(data.date_published).substr(Date(data.date_published).indexOf("200"), 4)));
           //console.log(data.panels[4].data["0"] != null);


           const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
           var startdate = new Date(data.start_date * 1000);
           console.log(startdate.getFullYear());
           console.log(monthNames[startdate.getMonth()]);
           displaydate = monthNames[startdate.getMonth()] + " " + startdate.getDate() + ", " + startdate.getFullYear();
           //if (Date(data.date_published).indexOf("201") >0) {
            $("#recall-date").text(displaydate);
           /*} else if (Date(data.date_published).indexOf("200") >0) {
             $("#recall-date").text(Date(data.date_published).substr(4, Date(data.date_published).indexOf("200")-5) + ", " + Date(data.date_published).substr(Date(data.date_published).indexOf("200"), 4));
           } else if (Date(data.date_published).indexOf("199") >0) {
             $("#recall-date").text(Date(data.date_published).substr(4, Date(data.date_published).indexOf("199")-5) + ", " + Date(data.date_published).substr(Date(data.date_published).indexOf("199"), 4));
           }*/

           //Add carousel if > 1 image, else just image
           if (imagePan["0"] != null) {
             /*if (imagePan["1"] != null) {
               //$("#carousel-images").data('owlCarousel').destroy()
               //$('#carousel-images').empty();
               //for each image array in imagePan
                carouselImages = "";
                $.each(imagePan, function() {
                  carouselImages = carouselImages + '<div class="item"><img src="http://healthycanadians.gc.ca' + this.fullUrl  + '" ></div>';
                });

               $("#carousel-images").append('<div id="carousel" class="owl-carousel">' + carouselImages + '</div>');
              } else {*/
               $("#carousel-images").append('<img id="identifying-image" style="max-width: 250px;" src="' + 'http://healthycanadians.gc.ca' + imagePan["0"].fullUrl  + '" />');
              //}
            }
            //initializeOwlCarousel();

           //description
           console.log(descriptionText === "" && products["0"].text.substring(0, 1) != "<");
           console.log(products["0"].text != null);
           if (descriptionText === "" && products["0"].text.substring(0, 1) != "<") {
             descriptionText = products["0"].text.substr(products["0"].text.indexOf("Product description:")+25, (products["0"].text.indexOf("Hazard identified:")-8) - (products["0"].text.indexOf("Product description:")+25));
           } else if (descriptionText === "") {
             //no description
             $("#descriptionheader").remove();
           }
           console.log($.trim(descriptionText.substring(0, 1)));
           if ($.trim(descriptionText.substring(0, 1)) === "<") {
             $("#description").append($.trim(descriptionText.substring(descriptionText.indexOf(">", descriptionText.indexOf(">") + 1) + 1, descriptionText.length - descriptionText.indexOf(">", descriptionText.indexOf(">") + 1))));
           } else {
             $("#description").append($.trim(descriptionText));
           }

           if (products.length > 1) {
             //many products - make table


/*Brand name:</b> Love Child Organics<BR/>
Common name:</b> Vegetarian Chili with Sweet Potato + Kale<BR/>
Size:</b> <span class="nowrap">128 <abbr title="millilitres">ml</abbr></span><BR/>
Code(s) on product:</b> All Best Before  dates up to and including 2019<abbr title="May">MA</abbr>25<BR/>
UPC:</b> 85886000170<BR/>"
*/

             //for each <b> in product_1
             console.log(products);
             var tableHead = products["0"].text.split('<b>');
             productTable = '<p>Look up your serial number to see if your product is affected:</p><table id="myTable" text-align=Top><thead><tr>';
             $.each(tableHead, function(index) {
               if (tableHead[index] !== "") {
                 productTable = productTable + '<th scope="col">' + tableHead[index].substr(0, tableHead[index].indexOf("<")-1) + '</th>';
               }
             });
             productTable = productTable + '</tr></thead><tbody>';
             var productText = {}
             $.each(products, function(index) {
               productText[index] = products[index].text.split('<b>');
               productTable = productTable + '<tr valign="top">';
               $.each(productText[index], function(name) {
                 if (productText[index][name] !== "") {
                   productTable = productTable + '<td data-label="' + tableHead[name].substr(0, tableHead[name].indexOf("<")-1) + '">' + productText[index][name].substr(productText[index][name].indexOf("<")+4, productText[index][name].length - productText[index][name].indexOf("<")+4) + '</td>';
                 }
               });
               productTable = productTable + '</tr>';
             });
             productTable = productTable + '</tbody></table>';
             console.log(productTable);
             //for each product
              //add product details to table

             //append
             $("#affected").append(productTable);
             //$("#myTable").append(tableHead + tableBody);
             makeTable();



           } else {
             //only 1 product - add each as section?
             var tableHead = products["0"].text.split('<b>');
             $.each(tableHead, function(name) {
               if (tableHead[name] !== "") {
                 console.log(tableHead[name]);
                 $("#affected").append('<h3>' + tableHead[name].substr(0, tableHead[name].indexOf("<")-1).replace(/[\r\n|\r|\n]+/g, "<br /><br />") + '</h3>');
                 console.log($.trim(tableHead[name].substr(tableHead[name].indexOf("<")+4, 1)));
                 if ($.trim(tableHead[name].substr(tableHead[name].indexOf("<")+4, 1)) === "<") { ///[\r\n|\r|\n]/
                   $("#affected").append('<p>' + $.trim(tableHead[name].substr(tableHead[name].indexOf("<")+9, tableHead[name].length - tableHead[name].indexOf("<")+7)).replace(/[\r\n|\r|\n]+/g, "<br /><br />") + '</p>');
                 } else if (tableHead[name].indexOf("<table>") > -1) {
                   //add mobile table headings
                   tableHead[name] = tableHead[name].replace("<table>", "<div>").replace("</table>", "</div>")

                   $("#affected").append('<p>' + $.trim(tableHead[name].substr(tableHead[name].indexOf("<")+5, tableHead[name].length - tableHead[name].indexOf("<")+3)) + '</p>');
                 } else {
                   $("#affected").append('<p>' + $.trim(tableHead[name].substr(tableHead[name].indexOf("<")+5, tableHead[name].length - tableHead[name].indexOf("<")+3)).replace(/[\r\n|\r|\n]+/g, "<br /><br />") + '</p>');
                 }
               }
             });
           }



            //what you should do (includes contact???)

          //do we put anything else? - delete rest

       },
       error:function(error){
       },
   });
   return;
};

function titleCase(string) {
  var sentence = string.toLowerCase().split(" ");
  for(var i = 0; i< sentence.length; i++){
     sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
document.write(sentence.join(" "));
return sentence;
};

var getUrlParameter = function getUrlParameter(sParam) {
   var sPageURL = decodeURIComponent(window.location.search.substring(1)),
       sURLVariables = sPageURL.split('&'),
       sParameterName,
       i;
   for (i = 0; i < sURLVariables.length; i++) {
       sParameterName = sURLVariables[i].split('=');
       if (sParameterName[0] === sParam) {
           return sParameterName[1] === undefined ? true : sParameterName[1];
       }
   }
};

function initializeOwlCarousel() {
  $('.owl-carousel').owlCarousel({
    margin: 20,
    loop: true,
    items: 1,
    stagePadding: 50
  });
};
function makeTable() {
    $.noConflict();
    var table = $('#myTable').DataTable();
};
