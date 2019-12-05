/*jslint browser:true */
document.addEventListener("DOMContentLoaded", function () {
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
       // error: function(XMLHttpRequest, textStatus, errorThrown) {
       //   alert("Status: " + textStatus); alert("Error: " + errorThrown);

         //set products array
         var products = [];
         console.log(data);
         productsCount = 0;
         var descriptionText = "";
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
           } else if (this.panelName === "cms_who_what_consumer") {
             whatToDo = $.trim(this.text.substring(0, this.text.length - 2)).replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("<\/li>\n", 'g'), "<\/li>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(new RegExp("<ul>\n", 'g'), "<ul>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
             // whatToDo = whatToDo.replace(/[\r\n|\r|\n]+/g, "<br /><br />");
             // whatToDo = $.trim(this.text.substring(0, this.text.length - 2)).replace(/[\r\n|\r|\n]+/g, "<br /><br />");
           } else if (this.panelName === "cms_who_what_affected") {
             whoWasAfected = $.trim(this.text.substring(0, this.text.length - 2)).replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("<\/li>\n", 'g'), "<\/li>").replace(new RegExp("<ul>\n", 'g'), "<ul>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
           } else if (this.panelName === "summary") {
             s3Point = this.text;
             console.log(s3Point);
             descriptionText = "noneatall";
           } else if (this.panelName === "cms_reason_reason_recall" || this.panelName === "details" || this.panelName === "cms_issue_problem") {
             console.log(descriptionText);
             if (descriptionText == "") {
               console.log(this.text);
               console.log(this.text.indexOf("<table"))
               if (this.text.indexOf("<table") > -1) {
                 descriptionText = this.text.substr(0, this.text.indexOf("<table")).replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(/[\r\n|\r|\n]+/g, "<br /><br />") + this.text.substr(this.text.indexOf("<table"), this.text.length);
               } else {
                 descriptionText = this.text.replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
               }


               // console.log(this.text);
               // descriptionText = this.text;
             }
           } else {
             console.log(this.panelName);
           }
         });
         console.log(productsCount);

         //get all categories
         categoryname = data.panels[0].text.substr(data.panels[0].text.indexOf("Category")+14,data.panels[0].text.indexOf("<",data.panels[0].text.indexOf("Category")+14)-(data.panels[0].text.indexOf("Category")+14));

         //Remap the categories, get the number of them, get the URLs for breadcrumbs
         //if 2 category names, make 2 tags, with comma separation
         var categories = categoryname.split(', ');
         //var categoryout = '<span style="text-decoration:none;">ᐸ </span>';
         // console.log(categoryname);
         // console.log(categories[0]);

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
         // console.log(pCat[0]);

         //String together
         sAllCats = "";
         for (i = 0; i < q; i++) {
           if (pSCat[i] !== null) {
             sAllCats += pSCat[i] + ', ';
           } else {
             sAllCats += pCat[i] + ', ';
           }
         }
         //Remove last 2 characters ', '
         sAllCats = sAllCats.substring(0, sAllCats.length-2);

         //Make the title and h1 + categories
         document.getElementsByTagName("title")[0].innerHTML = data.title+' - Canada.ca';
         // document.getElementsByTagName("title").text(data.title+' - Canada.ca');
         document.getElementsByTagName("h1")[0].innerHTML = '<span class="stacked"> <span>'+data.title+'</span>: <span>'+sAllCats+'</span></span>';

         //Make the breadcrumb based on the first category

         if (pSCat[0] == null) {
           $('.breadcrumb')[0].innerHTML = '<li class="hidden-xs hidden-sm"><a href="">Home</a></li><li class="hidden-xs hidden-sm"><a href="">Recalls and safety alerts</a></li><li class="no-break-breadcrumb"><a href="'+pCatURL[0]+'">'+pCat[0]+'</a></li>';
         } else {
           $('.breadcrumb')[0].innerHTML = '<li class="hidden-xs hidden-sm"><a href="">Home</a></li><li class="hidden-xs hidden-sm"><a href="">Recalls and safety alerts</a></li><li class="hidden-xs hidden-sm"><a href="'+pCatURL[0]+'">'+pCat[0]+'</a></li><li class="no-break-breadcrumb"><a href="'+pSCatURL[0]+'">'+pSCat[0]+'</a></li>';
         }

         //Getting the recall date under title
         const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dececember"];
         var startdate = new Date(data.start_date * 1000);
         console.log(startdate.getFullYear());
         console.log(monthNames[startdate.getMonth()]);
         displaydate = monthNames[startdate.getMonth()] + " " + startdate.getDate() + ", " + startdate.getFullYear();
         $("#recall-date").html('<strong>Recall date:</strong> '+ displaydate);

         console.log(descriptionText);
         if (descriptionText !== "noneatall") {
           if ($.trim(descriptionText.substring(0, 1)) === "<") {
             s3Point = $.trim(descriptionText.substring(descriptionText.indexOf(">", descriptionText.indexOf(">") + 1) + 1, descriptionText.length - descriptionText.indexOf(">", descriptionText.indexOf(">") + 1)));
           } else {
             s3Point = $.trim(descriptionText);
           }
           if (s3Point.indexOf(" - ") < 30) {
              s3Point = $.trim(s3Point.substring(s3Point.indexOf(" - ") + 2), s3Point.length);
           }
         }

         console.log(products);

         if (products.length > 1) {
           //many products - make table

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
           // $("#affected").append(productTable);
           //$("#myTable").append(tableHead + tableBody);


         } else if (products.length == 1) {
           //only 1 product - add each as section?
           productTable = products[0].text;
         }

         outputText = '<div class="row"><section class="col-md-8"><h2>Summary</h2>'+s3Point+'</section></div>';


         if (imagePan.length != 0) {
           outputText += '<div class="row"><div class="col-md-12"><img src="http://healthycanadians.gc.ca'+imagePan["0"].fullUrl+ '" class="img-responsive"></div>';
         }

         if (productsCount > 1) {
           outputText += '<section><h2>Affected products</h2>'+ productTable +'</section></div><div class="clearfix"></div>';
         } else if (productsCount == 1) {
           outputText += '<section><h2>Affected products</h2>'+ productTable +'</section></div><div class="clearfix"></div>';
         }

         if (whatToDo !== null) {
           outputText += '<section class="col-md-8 row"><h2>What to do</h2>'+whatToDo+'</section><div class="clearfix"></div>'
         }


         $("#recall-content").append(outputText);
         makeTable();

         //Product sample
         /*Brand name:</b> Love Child Organics<BR/>
         Common name:</b> Vegetarian Chili with Sweet Potato + Kale<BR/>
         Size:</b> <span class="nowrap">128 <abbr title="millilitres">ml</abbr></span><BR/>
         Code(s) on product:</b> All Best Before  dates up to and including 2019<abbr title="May">MA</abbr>25<BR/>
         UPC:</b> 85886000170<BR/>"
         */



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
  var newSentence = sentence.join(" ");
  return newSentence;
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
