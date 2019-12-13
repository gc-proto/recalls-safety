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
   var base = 'https://cors-anywhere.herokuapp.com/http://healthycanadians.gc.ca/recall-alert-rappel-avis';
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
             whatToDo = $.trim(this.text.substring(0, this.text.length - 2)).replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("</p>\n", 'g'), "</p>").replace(new RegExp("<p>\n", 'g'), "<p>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(new RegExp("<\/li>\n", 'g'), "<\/li>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(new RegExp("<ul>\n", 'g'), "<ul>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
             // whatToDo = whatToDo.replace(/[\r\n|\r|\n]+/g, "<br /><br />");
             // whatToDo = $.trim(this.text.substring(0, this.text.length - 2)).replace(/[\r\n|\r|\n]+/g, "<br /><br />");
           } else if (this.panelName === "cms_who_what_affected") {
             whoWasAfected = $.trim(this.text.substring(0, this.text.length - 2)).replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("</p>\n", 'g'), "</p>").replace(new RegExp("<p>\n", 'g'), "<p>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(new RegExp("<\/li>\n", 'g'), "<\/li>").replace(new RegExp("<ul>\n", 'g'), "<ul>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
           } else if (this.panelName === "cms_reason_reason_recall") {
             issueOutOfSummary = descriptionText = this.text.replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(new RegExp("</p>\n", 'g'), "</p>").replace(new RegExp("<p>\n", 'g'), "<p>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
           } else if (this.panelName === "summary") {
             s3Point = this.text;
             console.log(s3Point);
             descriptionText = "noneatall";
           } else if (this.panelName === "details" || this.panelName === "cms_issue_problem") {
             console.log(descriptionText);
             if (descriptionText == "") {
               console.log(this.text);
               console.log(this.text.indexOf("<table"))
               if (this.text.indexOf("<table") > -1) {
                 descriptionText = this.text.substr(0, this.text.indexOf("<table")).replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("</p>\n", 'g'), "</p>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(new RegExp("<p>\n", 'g'), "<p>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
                 descriptionTextTable = this.text.substr(this.text.indexOf("<table"), this.text.length);
               } else {
                 descriptionText = this.text.replace(new RegExp("\n<h2>", 'g'), "<h2>").replace(new RegExp("<\/h2>\n", 'g'), "<\/h2>").replace(new RegExp("<\/h3>\n", 'g'), "<\/h3>").replace(new RegExp("<p>\n", 'g'), "<p>").replace(new RegExp("</p>\n", 'g'), "</p>").replace(new RegExp("<li>\n", 'g'), "<li>").replace(/[\r\n|\r|\n]+/g, "<br /><br />");
               }
               console.log(descriptionText);
               if (descriptionText.length < 15){
                 descriptionText = "";
               }
               // console.log(this.text);
               // descriptionText = this.text;
             }
           } else {
             console.log(this.panelName);
           }
         });

         //get all categories
         categoryname = data.panels[0].text.substr(data.panels[0].text.indexOf("Category")+14,data.panels[0].text.indexOf("<",data.panels[0].text.indexOf("Category")+14)-(data.panels[0].text.indexOf("Category")+14));

         //Remap the categories, get the number of them, get the URLs for breadcrumbs
         //if 2 category names, make 2 tags, with comma separation
         var categories = categoryname.split(', ');
         //var categoryout = '<span style="text-decoration:none;">ᐸ </span>';
         // console.log(categories[0]);

         var pPCat = [];
         var pPCatURL = [];
         var pCat = [];
         var pCatURL = [];
         var pSCat = [];
         var pSCatURL = [];
         q = 0;
         $.each(categories, function() {
           if (this.substr(0, 8) === "Allergen") {
             pPCat[q] = "food";
             pPCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r=Food';
             pCat[q] = "Allergen";
             pSCat[q] = 'Undeclared ' + this.substr(11, this.length-11).toLowerCase();
             pCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q]);
             pSCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q])+'|'+encodeURI(sentenceCase(this.substr(11, this.length-11).toLowerCase()));
           } else if (this.substr(0, 15) === "Microbiological") {
             if (this.indexOf("E. coli") > 1) {
               pPCat[q] = "food";
               pPCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r=Food';
               pCat[q] = "microbiological";
               pSCat[q] = 'E. coli';
               pCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q]);
               pSCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q])+'|'+encodeURI(pSCat[q]);
             } else {
               pPCat[q] = "food";
               pPCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r=Food';
               pCat[q] = "Microbiological";
               pSCat[q] = this.substr(18, this.length-18);
               pCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q]);
               pSCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q])+'|'+encodeURI(pSCat[q]);
             }
           } else {
             if (data.category = "1") {
               pPCat[q] = "food";
               pPCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r=Food';
               pCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q]);
             } else if (data.category = "3") {
               pPCat[q] = "health";
               pPCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r=Health';
               pCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q]);
             } else if (data.category = "4") {
               pPCat[q] = "consumer";
               pPCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r=Consumer%20products';
               pCatURL[q] = 'http://test.canada.ca/recalls-safety/round-2/search-page.html?r='+encodeURI(pPCat[q])+'&c='+encodeURI(pPCat[q])+'|'+encodeURI(pCat[q]);
             }
             pCat[q] = sentenceCase(categoryname);
           }
           q++;
         });
         //String together
         sAllCats = "";
         for (i = 0; i < q; i++) {
           if (typeof(pSCat[i]) !== "undefined") {
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
           $('.breadcrumb')[0].innerHTML = '<li class="hidden-xs hidden-sm"><a href="https://tbs-proto1.openplus.ca/en">Home</a></li><li class="hidden-xs hidden-sm"><a href="http://test.canada.ca/recalls-safety/round-2/search-page.html">Recalls and safety alerts</a></li><li class="hidden-xs hidden-sm"><a href="'+pPCatURL[0]+'">'+pPCat[0]+'</a></li><li class="no-break-breadcrumb"><a href="'+pCatURL[0]+'">'+pCat[0]+'</a></li>';
         } else {
           $('.breadcrumb')[0].innerHTML = '<li class="hidden-xs hidden-sm"><a href="https://tbs-proto1.openplus.ca/en">Home</a></li><li class="hidden-xs hidden-sm"><a href="http://test.canada.ca/recalls-safety/round-2/search-page.html">Recalls and safety alerts</a></li><li class="hidden-xs hidden-sm"><a href="'+pPCatURL[0]+'">'+pPCat[0]+'</a></li><li class="hidden-xs hidden-sm"><a href="'+pCatURL[0]+'">'+pCat[0]+'</a></li><li class="no-break-breadcrumb"><a href="'+pSCatURL[0]+'">'+pSCat[0]+'</a></li>';
         }

         //Getting the recall date under title
         const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dececember"];
         var startdate = new Date(data.start_date * 1000);
         displaydate = monthNames[startdate.getMonth()] + " " + startdate.getDate() + ", " + startdate.getFullYear();
         $("#recall-date").html('<strong>Recall date:</strong> '+ displaydate);

         if (descriptionText !== "noneatall") {
           if ($.trim(descriptionText.substring(0, 1)) === "<") {
             s3Point = $.trim(descriptionText.substring(descriptionText.indexOf(">", descriptionText.indexOf(">") + 1) + 1, descriptionText.length - descriptionText.indexOf(">", descriptionText.indexOf(">") + 1)));
           } else {
             s3Point = $.trim(descriptionText);
           }
           if (s3Point.indexOf(" - ") < 30 && s3Point.indexOf(" - ") > -1) {
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

         if (typeof(issueOutOfSummary) !== "undefined") {
           outputText += '<div class="row"><section class="col-md-8">'+issueOutOfSummary+'</section></div>';
         }

         if (typeof(descriptionTextTable) !== "undefined") {
           outputText += '<div class="row"><section class="col-md-12">'+descriptionTextTable+'</section></div>';
         }

         if (imagePan.length != 0) {
           outputText += '<div class="row"><div class="col-md-12"><img src="http://healthycanadians.gc.ca'+imagePan["0"].fullUrl+ '" class="img-responsive"></div></div>';
         }

         if (productsCount > 1) {
           outputText += '<div class="row"><section class="col-md-12"><h2>Affected products</h2>'+ productTable +'</section></div>';
         } else if (productsCount == 1) {
           outputText += '<div class="row"><section class="col-md-8"><h2>Affected products</h2>'+ productTable +'</section></div>';
         }

         if (typeof(whatToDo) !== "undefined") {
           outputText += '<div class="row"><section class="col-md-8"><h2>What to do</h2>'+whatToDo+'</section></div>';
         }

         if (typeof(whoWasAffected) !== "undefined") {
           outputText += '<div class="row"><section class="col-md-8"><h2>Who was affected</h2>'+whoWasAffected+'</section><div>';
         }

         outputText += '<div class="row"><div class="col-md-8"><h2>Media enquiries</h2> <details><summary class="text-primary">Contact details</summary> <dl> <dt class="h3">Public enquiries</dt> <dd>Toll-free: 1-800-442-2342 (Canada and U.S.)<br>Telephone: 1-613-773-2342 (local or international)<br>Email: <a href="mailto:cfia.enquiries-demandederenseignements.acia@canada.ca">cfia.enquiries-demandederenseignements.acia@canada.ca</a></dd> <dt class="h3">Media relations</dt> <dd>Telephone: 613-773-6600<br>Email: <a href="mailto:cfia.media.acia@canada.ca">cfia.media.acia@canada.ca</a></dd> </dl> </details> </section> <div class="clearfix"></div><section> <h2>Tell us about side effects, injuries and other safety concerns</h2> <details> <summary class="text-primary">Report an incident</summary> <div class="form-group"> <label for="submitter_personName" class="required" aria-required="true"><span class="field-name">Name (first name and last name)</span> <strong class="required" aria-required="true">(required)</strong></label> <textarea class="form-control word-wrap hidden-print ng-pristine ng-invalid ng-invalid-required ng-valid-maxlength ng-touched" msd-elastic="" id="submitter_personName" name="submitter_personName" ng-model="submitter.personName" required="" placeholder="Name" rows="1" cols="60" maxlength="50" ng-change="copyText(submitter.personName, \'submitter_personName\')" style="overflow: hidden; word-wrap: break-word; resize: horizontal; height: 36px;" aria-required="true"> </textarea> <div class="panel panel-default visible-print"> <div class="panel-body"> <p id="submitter_personName_txt" class="visible-print ng-binding"></p> </div> </div> </div> <div class="form-group"><label for="submitter_email" class="required" aria-required="true"><span class="field-name">Email</span><br> <strong class="required" aria-required="true">(Email OR Telephone is required)</strong>, both are preferred </label> <textarea class="form-control word-wrap hidden-print emailValidation required_group ng-pristine ng-untouched ng-valid ng-valid-maxlength" msd-elastic="" id="submitter_email" name="submitter_email" ng-model="submitter.email" placeholder="email@example.com" rows="1" cols="60" maxlength="50" ng-change="copyText(submitter.email, \'submitter_email\')" style="overflow: hidden; word-wrap: break-word; resize: horizontal; height: 36px;"> </textarea> <div class="panel panel-default visible-print"> <div class="panel-body"> <p id="submitter_email_txt" class="visible-print ng-binding"></p> </div> </div> </div> <div class="form-group"><label for="affectedPerson_incidentExperiencedDate_0" class="required" aria-required="true"><span class="field-name">Date of the Incident </span><span class="datepicker-format">(<abbr title="Four digits year, dash, two digits month, dash, two digits day">YYYY-MM-DD</abbr>)</span> <strong class="required" aria-required="true">(required)</strong> </label> <input class="form-control ng-pristine ng-untouched ng-invalid ng-invalid-required" id="affectedPerson_incidentExperiencedDate_0" name="affectedPerson_incidentExperiencedDate_0" ng-model="affectedPerson.incidentExperiencedDate" hcform-datepicker="" type="date" data-rule-dateiso="true" required="" onkeypress="return noEnter(event)" aria-required="true"> </div> <div class="row"> <div class="col-md-6 pull-left"> <div class="form-group"><label for="affectedPerson_lkpIncidentTypeId_0" class="required" aria-required="true"><span class="field-name">Incident Type</span> <strong class="required" aria-required="true">(required)</strong> </label> <select class="form-control ng-pristine ng-invalid ng-invalid-required ng-touched" id="affectedPerson_lkpIncidentTypeId_0" name="affectedPerson_lkpIncidentTypeId_0" ng-model="affectedPerson.lkpIncidentTypeId" ng-options="obj.id as obj.name for obj in lstIncidentType" ng-change="populateObjectPropertyByValue(affectedPerson.lkpIncidentTypeId, \'submission.lkpCaseSubtypeId\', $index)" required="" aria-required="true"><option value="" class="">Select Incident Type</option><option value="0" label="Death">Death</option><option value="1" label="Serious Injury">Serious Injury</option><option value="2" label="Injury">Injury</option><option value="3" label="Product Defect">Product Defect</option><option value="4" label="Incorrect/Insufficient Information">Incorrect/Insufficient Information</option><option value="5" label="Recall">Recall</option><option value="6" label="Property Damage">Property Damage</option><option value="7" label="Incident, No Injury">Incident, No Injury</option><option value="8" label="Other">Other</option></select> </div> </div> <div class="col-md-6 pull-right"> <div class="form-group"><label for="affectedPerson_lkpInjuryTypeId_0" class="required" aria-required="true"><span class="field-name">Injury Type</span> <strong class="required" aria-required="true">(required)</strong> </label> <select class="form-control ng-pristine ng-invalid ng-invalid-required ng-touched" id="affectedPerson_lkpInjuryTypeId_0" name="affectedPerson_lkpInjuryTypeId_0" ng-model="affectedPerson.lkpInjuryTypeId" ng-options="obj.id as obj.name for obj in lstInjury" required="" aria-required="true"><option value="" class="">Select Injury Type</option><option value="0" label="No Injury">No Injury</option><option value="1" label="Amputation">Amputation</option><option value="2" label="Bruise/Abrasion/Contusion/Pinching">Bruise/Abrasion/Contusion/Pinching</option><option value="3" label="Burn/Scald">Burn/Scald</option><option value="4" label="Choking">Choking</option><option value="5" label="Concussion">Concussion</option><option value="6" label="Cut/Laceration">Cut/Laceration</option><option value="7" label="Dislocation">Dislocation</option><option value="8" label="Drowning">Drowning</option><option value="9" label="Electric Shock">Electric Shock</option><option value="10" label="Fracture">Fracture</option><option value="11" label="Inflammation/Irritation/Dermatitis">Inflammation/Irritation/Dermatitis</option><option value="12" label="Ingested Object">Ingested Object</option><option value="13" label="Internal Organ Injury">Internal Organ Injury</option><option value="14" label="Piercing/puncturing/penetration">Piercing/puncturing/penetration</option><option value="15" label="Poisoning">Poisoning</option><option value="16" label="Strain / Sprain">Strain / Sprain</option><option value="17" label="Strangulation">Strangulation</option><option value="18" label="Suffocation">Suffocation</option><option value="19" label="Other/Not Stated">Other/Not Stated</option></select> </div> </div> </div> <div class="form-group"><label for="affectedPerson_lkpTreatmentTypeId_0" class="required" aria-required="true"><span class="field-name">Treatment</span> <strong class="required" aria-required="true">(required)</strong> </label> <select class="form-control ng-pristine ng-invalid ng-invalid-required ng-touched" id="affectedPerson_lkpTreatmentTypeId_0" name="affectedPerson_lkpTreatmentTypeId_0" ng-model="affectedPerson.lkpTreatmentTypeId" ng-options="obj.id as obj.name for obj in lstTreatment" required="" aria-required="true"><option value="" class="">Select Treatment</option><option value="0" label="None">None</option><option value="1" label="First Aid">First Aid</option><option value="2" label="Provincial Health Care Info Service">Provincial Health Care Info Service</option><option value="3" label="Poison Control Centre">Poison Control Centre</option><option value="4" label="Family Doctor">Family Doctor</option><option value="5" label="Hospital-Emergency Room">Hospital-Emergency Room</option><option value="6" label="Hospital-Other">Hospital-Other</option><option value="7" label="Other Medical Professional">Other Medical Professional</option><option value="8" label="Other">Other</option><option value="9" label="Unknown">Unknown</option></select> </div> <div class="form-group"><label for="incident_incidentDescription" class="required" aria-required="true"><span class="field-name">Describe the Incident</span> <strong class="required" aria-required="true">(required)</strong> </label><br> <div id="characterRemaining"><small>Characters remaining: <span class="ng-binding">2000</span></small></div> <textarea class="form-control word-wrap hidden-print ng-pristine ng-untouched ng-invalid ng-invalid-required ng-valid-maxlength" msd-elastic="" id="incident_incidentDescription" name="incident_incidentDescription" ng-model="incident.incidentDescription" ng-trim="false" placeholder="Describe the Incident" required="" aria-multiline="true" rows="5" cols="150" maxlength="2000" ng-change="copyText(incident.incidentDescription, \'incident_incidentDescription\')" style="overflow: hidden; word-wrap: break-word; resize: horizontal; height: 126px;" aria-required="true"> </textarea> <div class="panel panel-default visible-print"> <div class="panel-body"> <p id="incident_incidentDescription_txt" class="visible-print ng-binding"></p> </div> </div> </div> <div class="form-group"><label for="product_productBrandName" class="required" aria-required="true"><span class="field-name">Product Brand and Name</span> <strong class="required" aria-required="true">(required)</strong> </label> <textarea class="form-control word-wrap hidden-print ng-pristine ng-invalid ng-invalid-required ng-valid-maxlength ng-touched" msd-elastic="" id="product_productBrandName" name="product_productBrandName" ng-model="product.productBrandName" required="" placeholder="Product Brand and Name" rows="1" cols="60" maxlength="100" ng-change="copyText(product.productBrandName, \'product_productBrandName\')" style="overflow: hidden; word-wrap: break-word; resize: horizontal; height: 36px;" aria-required="true"> </textarea> <div class="panel panel-default visible-print"> <div class="panel-body"> <p id="product_productBrandName_txt" class="visible-print ng-binding"></p> </div> </div> </div> <div class="form-group"><label for="product_productDescription" class="required" aria-required="true"><span class="field-name">Product Description (for example: colour, packaging, warnings on the label)</span> <strong class="required" aria-required="true">(required)</strong> </label><br> <div id="characterRemaining"><small>Characters remaining: <span class="ng-binding">1500</span></small></div> <textarea class="form-control word-wrap hidden-print ng-pristine ng-untouched ng-invalid ng-invalid-required ng-valid-maxlength" msd-elastic="" id="product_productDescription" name="product_productDescription" ng-model="product.productDescription" ng-trim="false" required="" placeholder="Product description" rows="5" cols="150" maxlength="1500" ng-change="copyText(product.productDescription, \'product_productDescription\')" style="overflow: hidden; word-wrap: break-word; resize: horizontal; height: 126px;" aria-required="true"> </textarea> <div class="panel panel-default visible-print"> <div class="panel-body"> <p id="product_productDescription_txt" class="visible-print ng-binding"></p> </div> </div> </div> <div class="form-group"><label for="whereGotPrdct_lkpContactContextId" class="required" aria-required="true"><span class="field-name">From whom did you get the product</span><br><strong class="required" aria-required="true">(required when this section is completed)</strong> </label> <select class="form-control ng-pristine ng-untouched ng-valid" id="whereGotPrdct_lkpContactContextId" name="whereGotPrdct_lkpContactContextId" ng-model="whereGotPrdct.lkpContactContextId"> <option value="">Select From whom did you get the product</option> <!-- ngRepeat: obj in lstPrdctFrmWhmConsumer --><option ng-repeat="obj in lstPrdctFrmWhmConsumer" value="52401" class="ng-binding ng-scope">Gift</option><!-- end ngRepeat: obj in lstPrdctFrmWhmConsumer --><option ng-repeat="obj in lstPrdctFrmWhmConsumer" value="52400" class="ng-binding ng-scope">Promotional Item</option><!-- end ngRepeat: obj in lstPrdctFrmWhmConsumer --><option ng-repeat="obj in lstPrdctFrmWhmConsumer" value="52397" class="ng-binding ng-scope">Purchased New</option><!-- end ngRepeat: obj in lstPrdctFrmWhmConsumer --><option ng-repeat="obj in lstPrdctFrmWhmConsumer" value="52399" class="ng-binding ng-scope">Purchased Used From Person e.g. Yard Sale</option><!-- end ngRepeat: obj in lstPrdctFrmWhmConsumer --><option ng-repeat="obj in lstPrdctFrmWhmConsumer" value="52398" class="ng-binding ng-scope">Purchased Used From Retailer</option><!-- end ngRepeat: obj in lstPrdctFrmWhmConsumer --><option ng-repeat="obj in lstPrdctFrmWhmConsumer" value="52402" class="ng-binding ng-scope">Other</option><!-- end ngRepeat: obj in lstPrdctFrmWhmConsumer --> </select> </div> <div id="submit" col-md-3="" pull-left=""> <input type="submit" ng-disabled="isAutoFill" value="Proceed to Submit" class="btn btn-primary"> </div> </details> </section> <div class="clearfix"></div> <section class="followus btn-default mrgn-bttm-md recall-share btn col-md-4 col-sm-12 col-xs-12 mrgn-tp-lg">Receive email updates:</a> <ul> <li style="margin-top: 0px; margin-bottom: 0px;"> <img src="http://backgroundcheckall.com/wp-content/uploads/2017/12/white-email-icon-transparent-background-3.png" style="max-width:20px; padding-bottom: 5px;"> </li> </ul> </section> <section class="followus btn-default mrgn-bttm-md recall-share pull-right btn col-md-6 col-sm-12 col-xs-12"> <a href="" style="text-decoration:none;">Follow recalls on social media:</a> <ul> <li style="margin-top: 0px; margin-bottom: 0px;"> <a rel="external" class="facebook gl-follow" href="#"> <span class="wb-inv">Facebook</span> </a> </li> <li style="margin-top: 0px; margin-bottom: 0px;"> <a rel="external" class="twitter gl-follow" href="#"> <span class="wb-inv">Twitter</span></a></li> </ul> </section> <div class="clearfix"></div> <div class="row pagedetails"> <details class="brdr-0 col-sm-6 col-lg-4 mrgn-tp-sm"><summary class="btn btn-default text-center">Report a problem or mistake on this page</summary><div class="clearfix"></div><div class="well row"> <div><div class="gc-rprt-prblm"> <div class="gc-rprt-prblm-frm gc-rprt-prblm-tggl"> <section id="privacy" class="mfp-hide modal-dialog modal-content overlay-def"> <header class="modal-header"> <h2 class="modal-title">Privacy statement</h2> </header> <div class="modal-body"> <p>The information you provide through this survey is collected under the authority of the <em><a href="http://laws-lois.justice.gc.ca/eng/acts/H-5.7/page-1.html">Department of Employment and Social Development Act (DESDA)</a></em> for the purpose of measuring the performance of Canada.ca and continually improving the website. Your participation is voluntary.</p><p>Please do not include sensitive personal information in the message box, such as your name, address, Social Insurance Number, personal finances, medical or work history or any other information by which you or anyone else can be identified by your comments or views.</p><p>Any personal information collected will be administered in accordance with the <em><a href="http://laws-lois.justice.gc.ca/eng/acts/H-5.7/page-1.html">Department of Employment and Social Development Act</a></em>, the <em><a href="http://laws-lois.justice.gc.ca/eng/acts/P-21/index.html">Privacy Act</a></em> and other applicable privacy laws governing the protection of personal information under the control of the Department of Employment and Social Development. Survey responses will not be attributed to individuals.</p><p>If you wish to obtain information related to this survey, you may submit a request to the Department of Employment and Social Development pursuant to the <em><a href="http://laws-lois.justice.gc.ca/eng/acts/A-1/FullText.html">Access to Information Act</a></em>. Instructions for making a request are provided in the publication <a href="https://www.canada.ca/en/treasury-board-secretariat/services/access-information-privacy/access-information/request-information.html">InfoSource</a>, copies of which are located in local Service Canada Centres.</p><p>You have the right to file a complaint with the Privacy Commissioner of Canada regarding the institution’s handling of your personal information at: <a href="https://www.priv.gc.ca/en/report-a-concern/file-a-formal-privacy-complaint/">How to file a complaint</a>.</p><p>When making a request, please refer to the name of this survey: Report a Problem or Mistake on This Page.</p> </div> </section> <form id="gc-rprt-prblm-form" method="post" action="/gc/services/generateemail"> <input type="hidden" name="pageTitle" value="Family Caregiver Benefit for Children – Eligibility"> <input type="hidden" name="submissionPage" value="/content/canadasite/en/services/benefits/ei/family-caregiver-children/eligibility.html"> <input type="hidden" name="lang" value="eng"> <input type="hidden" name="pageOwner" value="gc:institutions/service-canada"> <input id="emailTemplate" name="emailTemplate" type="hidden" value="reportaproblem/rap"> <input name="subject" type="hidden" value="Report a problem or mistake on this page"> <fieldset> <legend><span class="field-name">Please select all that apply: </span></legend> <div class="checkbox"> <label for="problem1"><input type="checkbox" data-reveal="#broken" name="problem1" value="Yes" id="problem1">Something is broken</label> <input type="hidden" name="problem1" value="No" /> </div> <div class="checkbox"> <label for="problem2"><input type="checkbox" data-reveal="#spelling" name="problem2" value="Yes" id="problem2">It has a spelling or grammar mistake</label> <input type="hidden" name="problem2" value="No" /> </div> <div class="checkbox"> <label for="problem3"><input type="checkbox" data-reveal="#wrong" name="problem3" value="Yes" id="problem3">The information is wrong</label> <input type="hidden" name="problem3" value="No" /> </div> <div class="checkbox"> <label for="problem4"><input type="checkbox" data-reveal="#outdated" name="problem4" value="Yes" id="problem4">The information is outdated</label> <input type="hidden" name="problem4" value="No" /> </div> <div class="checkbox"> <label for="problem5"><input type="checkbox" data-reveal="#find" name="problem5" value="Yes" id="problem5">I can’t find what I’m looking for</label> <input type="hidden" name="problem5" value="No" /> </div> </fieldset> <p><a href="#privacy" class="wb-lbx lbx-modal" role="button">Privacy statement</a></p> <button data-wb5-click="postback@#gc-rprt-prblm-form@" type="submit" class="btn btn-primary wb-toggle" data-toggle=\'{"stateOff": "hide", "stateOn": "show", "selector": ".gc-rprt-prblm-tggl"}\'>Submit</button> </form> </div> <div class="gc-rprt-prblm-thnk gc-rprt-prblm-tggl hide"> <h3>Thank you for your help!</h3><p>You will not receive a reply. For enquiries,&nbsp;<a href="https://www.canada.ca/en/contact/index.html">contact us</a>.</p> </div></div></div></div> </details> <div class="col-sm-3 mrgn-tp-sm pull-right"> <div class="wb-share" data-wb-share=\'{&#34;lnkClass&#34;: &#34;btn btn-default btn-block&#34;}\'></div> </div> <div class="datemod col-xs-12 mrgn-tp-lg"> <dl id="wb-dtmd"> <dt>Date modified:</dt> <dd><time property="dateModified">2017-12-01</time></dd></dl> </div></div></div>'


         outputText += '</div>';


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

function sentenceCase(string) {
  newSentence = string[0].toUpperCase() + string.slice(1).toLowerCase();
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
