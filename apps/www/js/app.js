/*DEFINE ALL VARIABLES*/
var ajax_request = {};
var ajax_url= merchantapp_config.ApiUrl
var dialog_title = merchantapp_config.AppTitle

var cart=[];
var cart_count = 0;

var onsenNavigator ;
var toast_handler;

var push_handle;

var translator;
var dict = {};

var device_id   = 'device_01231';
var device_uiid = 'uiid_012345610';
var device_platform = 'android';
var code_version = 1.0; // don't change this value

var timer = {};
var ajax_timeout = 50000;

var paginate = 0;
var accept_order;

//var new_order_interval = 5000;
var new_order_interval = 10000;
var delayed_splash_screen = 100; //3000
var $handle_incoming;
var $handle_outgoing;
var $handle_ready;
var $handle_refresh_order;

var $handle_todays_booking;
var $handle_refresh_booking;
var $handle_cancel_booking;
var $handle_refresh_cancel_booking;
var $handle_refresh_cancel_order;
var $handle_push_list;

var $enabled_cron = true;

var $media_handle;

var exit_cout = 0;
var timenow;

var $order_list_need_refresh = 0;
var $item_added_addon = [];

jQuery.fn.exists = function(){return this.length>0;}

dump = function(data) {
	console.log(data);
}

dump2 = function(data) {
	alert(JSON.stringify(data));	
};

empty = function(data) {
	if (typeof data === "undefined" || data==null || data=="" || data=="null" || data=="undefined" ) {	
		return true;
	}
	return false;
}

setStorage = function(key,value)
{
	localStorage.setItem(key,value);
}

getStorage = function(key)
{
	return localStorage.getItem(key);
}

removeStorage = function(key)
{
	localStorage.removeItem(key);
}
isdebug = function(){
	if (merchantapp_config.debug){
		return true;
	}
	return false;
};

q = function(data){
	return "'" + addslashes(data) + "'";
};

var addslashes = function(str)
{
	return (str + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0')
};

/*END DEFINE BASIC FUNCTIONS*/

ons.platform.select('ios');

ons.ready(function() {
	
	if (ons.platform.isIPhoneX()) {		
	    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
	    $('head').append('<link rel="stylesheet" href="css/app_ios.css?ver=1.0" type="text/css" />'); 	     
	}
	
	// fix to autocomplete search address bar
	$(document).on({
	"DOMNodeInserted": function(e){	  
	$(".pac-item span",this).addClass("needsclick");
	}
	}, ".pac-container");
	
	onsenNavigator = document.getElementById('onsenNavigator');
	
	//RESET DATA
	//localStorage.clear();
		
	ons.setDefaultDeviceBackButtonListener(function(event) {
		dump("Back event");
		current_page = document.querySelector('ons-navigator').topPage.id;
		dump("current_page=>"+ current_page);
		switch (current_page){
			case "page_login":
			case "enter_pin":
			case "homepage":
			
			  if ( current_page=="homepage"){
			  	 $active_tabbar = document.querySelector('ons-tabbar').getActiveTabIndex();
			  	 if($active_tabbar!=0){
			  	 	document.querySelector('ons-tabbar').setActiveTab(0);			  	 
			  	 	return;
			  	 }			  
			  }		
			
			  exit_cout++;
			  if(exit_cout<=1){
			  	showToast( t("Press once again to exit!") );	
				 setTimeout(function(){ 
				 	 exit_cout=0;
				 }, 3000);
			  } else {
			  	 if (navigator.app) {
				   navigator.app.exitApp();
				 } else if (navigator.device) {
				   navigator.device.exitApp();
				 } else {
				   window.close();
				 }
			  }
			break;
		}	
	});
	
	$( document ).on( "keyup", ".numeric_only", function() {
       this.value = this.value.replace(/[^0-9\.]/g,'');
    });	 
    
});
/*END ONSEN*/


/*CORDOVA DEVICE READY*/
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
	try {
						
		navigator.splashscreen.hide();	
		device_uiid = device.uuid;
		device_platform = device.platform;		
					
		initFirebasex();
				
	} catch(err) {
       dump(err.message);
    } 
};
/*END CORDOVA DEVICE READY*/

document.addEventListener("offline", function(){
   showDialog(true,'dialog_no_connection');
}, false);

document.addEventListener("online", function(){
   showDialog(false,'dialog_no_connection');	
}, false);

document.addEventListener("resume", function(){	
	
	try {
		if(cordova.platformId == "ios"){
			window.FirebasePlugin.getBadgeNumber(function(n) {		   	       
		       total_badge = parseInt(n);	       
		       if(total_badge>0){
		       	   window.FirebasePlugin.setBadgeNumber(0);
		       }
		    });
		}
    } catch(err) {
       //alert(err.message);
    } 
    
}, false);


/*ONSEN LISTINER*/
document.addEventListener('show', function(event) {
	dump('show page');
    var page = event.target;
    var page_id = event.target.id; 
    dump("page_id = "+page_id);     
    switch(page_id){
    	case "todays_order":  
    	case "outgoing_order":  
    	case "ready_order":	     	  
    	  if($order_list_need_refresh==1){  	 
		  	  setTimeout(function(){
				 load_all_order_tab();
				 $order_list_need_refresh = 0;
	    	  }, 100); 
		  }
    	break;
    	
    	case "settings":
    	  if( isdebug() ){	
    	     $(".app_version").html("1.0.0");
    	  } else {    	  	 
    	  	 $(".app_version").html( BuildInfo.version );
    	  }
    	      	  
    	  displayAppAwake();
    	  processAjax( "GetAlertSettings" ,'','POST',1,'silent');    	  
    	break;
    	
    }
});
/*END SHOW PAGE*/

document.addEventListener('init', function(event) {
	dump('init page');
	var page = event.target;
    var page_id = event.target.id;   
    dump("page_id = "+page_id); 
    
    paginate = 0;
    translatePage();
    
    $settings = getMerchantSettings(); 
   
    switch(page_id){
    	case "page_settings":    	  
    	    processAjax("getsettings",'','POST',2,'silent');    	  
    	break;
    	
    	case "page_login":    	    	        	 
    	  $_fields = [
    	    {'field_name':"username", "label":t("User name") },
    	    {'field_name':"password", "label":t("Password") },
    	  ];
    	  translateForm(page_id,$_fields);    	      	     	 
    	break;
    	
    	case "forgot_password":
    	  $_fields = [
    	    {'field_name':"email_address", "label":t("Email") },    	    
    	  ];
    	  translateForm(page_id,$_fields);    	      	     	 
    	break;
    	
    	case "homepage":
    	 moment_trans();     	
    	 setMerchantHeader();   
    	break;
    	
    	case "dashboard":    	    	     	      	  
    	  //setTimeout(function(){	
		      setDashboardMenu( $settings.dashboard_menu );
		   //}, 1000);    	   
    	break;
    	
    	case "info":
    	    	  
    	  fields = [    	      
			  {'field_name':"restaurant_slug", "label": "Restaurant Slug", "type":"text","required":1},
			  {'field_name':"restaurant_name", "label": "Restaurant name", "type":"text","required":1},
			  {'field_name':"restaurant_phone", "label": "Restaurant phone", "type":"text","required":1},
			  {'field_name':"contact_name", "label": "Contact name", "type":"text","required":1},
			  {'field_name':"contact_phone", "label": "Contact phone", "type":"text","required":1},
			  {'field_name':"contact_email", "label": "Contact email", "type":"text","required":1},			  
			  {'field_name':"", "label": "Address", "type":"h3"},
			  {'field_name':"street", "label": "Street address", "type":"text","required":1},
			  {'field_name':"city", "label": "City", "type":"text","required":1},			  
			  {'field_name':"post_code", "label": "Post code/Zip code", "type":"text","required":1},
			  {'field_name':"state", "label": "State/Region", "type":"text","required":1},
			  
			  {'field_name':"is_ready", "label": "Published Merchant", "type":"checkbox","value": 2},
			  
			  {'field_name':"", "label": "Services", "type":"h3"},
			  
			  {'field_name':"cuisine_list", "label": "Cuisine", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'getCuisineList','list':'cuisine_list','field':'cuisine','page_title':'Select cuisine'} )","required":1 },
			  
			  {'field_name':"service", "label": "Services", "type":"select", "data": $settings.services},
			  
			  {'field_name':"", "label": "Information", "type":"h3"},
			  
			  {'field_name':"merchant_information", "label": "Information", "type":"textarea", "value" : '' },
			  			  			  
			  {'field_name':"", "label": "Google map", "type":"h3"},
			  
			  {'field_name':"latitude", "label": "Latitude", "type":"text","required":0 , "readonly":1,
			   "onclick" : "showPage('map.html','',{'map_title':'Select location','action':'merchant_location'} )" },
			  {'field_name':"lontitude", "label": "Longitude", "type":"text","required":0, "readonly":1,
			  "onclick" : "showPage('map.html','',{'map_title':'Select location','action':'merchant_location'})"},
			  
			];
			
    	  setFormFields(fields);
    	  processAjax("getMerchantinformation",'','POST',3);
    	break;
    	    	    	
    	case "selection_list":    	  
    	  list_action = page.data.list_action;    
    	  list_type = page.data.list_type	  
    	  if(empty(list_type)){
    	  	list_type = 'multiple';
    	  }    	  
    	  current_page_id = getCurrentPage();
    	  $("#"+ current_page_id + " .list").val( page.data.list );
    	  $("#"+ current_page_id + " .field").val( page.data.field );
    	  $("#"+ current_page_id + " .page_title").html( t(page.data.page_title) );
    	  $("#"+ current_page_id + " .list_type").val( list_type );
    	  
    	  multiple = !empty(page.data.multiple)?page.data.multiple:'';
    	  processAjax(list_action,'field='+ page.data.field + "&multiple="+multiple ,'POST',4); 
    	  infinitePage(page,list_action);
    	  initPullHook(list_action); 	  
    	break;
    	
    	case "merchant_settings":
    	  
    	  fields = [
    	  
    	      {'field_name':"merchant_photo", "label": "Merchant Logo", "type":"upload_image", 
				"upload_option_name" : 'merchant_photo', "upload_next_action":"display_image", "upload_type":1, "thumbnail": '', "value": ''  },
				
			{'field_name':"merchant_photo_bg", "label": "Merchant Header", "type":"upload_image2", 
				"upload_option_name" : 'merchant_photo_bg', "upload_next_action":"display_image", "upload_type":1, "thumbnail": '', "value": ''  },	

			  {'field_name':"", "label": "Order Options", "type":"h3"},
			  {'field_name':"order_verification", "label": "Enabled Order SMS Verification", "type":"checkbox","value": 2},
			  {'field_name':"order_sms_code_waiting", "label": "Customer can request sms code every", "type":"number"},			  
			  {'field_name':"", "label": "Food Item Options", "type":"h3"},
			  
			  {'field_name':"", "label": "If item is not available do the following actions", "type":"h4"},
			  {'field_name':"food_option_not_available", "label": "Hide", "type":"radio","value": 1},
			  {'field_name':"food_option_not_available", "label": "Disabled", "type":"radio","value": 2},
			  
			  {'field_name':"disabled_food_gallery", "label": "Disabled food gallery", "type":"checkbox","value": 2},
			  {'field_name':"food_viewing_private", "label": "Make menu private", "type":"checkbox","value": 2},
			  
			  {'field_name':"", "label": "Two Flavor Options", "type":"h3"},			  
			  {'field_name':"merchant_two_flavor_option", "label": "Choose option", "type":"select", "data": $settings.two_flavor_options },
			  
			  {'field_name':"", "label": "Receipt Options", "type":"h3"},			  
			  {'field_name':"merchant_tax_number", "label": "Tax number", "type":"text"},
			  
			  {'field_name':"", "label": "Printing Options", "type":"h3"},			  
			  {'field_name':"printing_receipt_width", "label": "Receipt Width", "type":"text"},
			  {'field_name':"printing_receipt_size", "label": "Font size", "type":"text"},
			  
			  {'field_name':"", "label": "Free Delivery Options", "type":"h3"},			  
			  {'field_name':"free_delivery_above_price", "label": "Free delivery above Sub Total Order", "type":"number"},
			  
			  {'field_name':"", "label": "Merchant Open/Close", "type":"h3"},
			  {'field_name':"merchant_close_store", "label": "Close Store", "type":"checkbox","value": "yes"},
			  {'field_name':"merchant_show_time", "label": "Show Merchant Current Time", "type":"checkbox","value": "yes"},
			  {'field_name':"merchant_disabled_ordering", "label": "Disabled Ordering", "type":"checkbox","value": "yes"},
			  
			  {'field_name':"", "label": "External Website", "type":"h3"},
			  {'field_name':"merchant_extenal", "label": "Website address", "type":"text"},
			  {'field_name':"merchant_enabled_voucher", "label": "Enabled Voucher", "type":"checkbox","value": "yes"},
			  {'field_name':"merchant_required_delivery_time", "label": "Make Delivery Time Required", "type":"checkbox","value": "yes"},
			  
			  {'field_name':"", "label": "Delivery", "type":"h3"},
			  {'field_name':"merchant_minimum_order", "label": "Minimum purchase amount", "type":"number"},			  
			  {'field_name':"merchant_maximum_order", "label": "Maximum purchase amount", "type":"number"},			  
			  
			  {'field_name':"", "label": "Pickup", "type":"h3"},
			  {'field_name':"merchant_minimum_order_pickup", "label": "Minimum purchase amount", "type":"number"},			  
			  {'field_name':"merchant_maximum_order_pickup", "label": "Maximum purchase amount", "type":"number"},			  
			  
			  {'field_name':"", "label": "Dine in", "type":"h3"},
			  {'field_name':"merchant_minimum_order_dinein", "label": "Minimum purchase amount", "type":"number"},			  
			  {'field_name':"merchant_maximum_order_dinein", "label": "Maximum purchase amount", "type":"number"},			  
			  
			  {'field_name':"", "label": "Packaging Charge", "type":"h3"},
			  {'field_name':"", "label": "When this is enabled packaging charge will be use is what you set in food item", "type":"h4"},
			  {'field_name':"merchant_packaging_wise", "label": "Enabled Packaging Wise", "type":"checkbox","value": 1},
			  
			  {'field_name':"merchant_packaging_charge", "label": "Packaging Charge", "type":"number"},			  
			  {'field_name':"merchant_packaging_increment", "label": "Packaging Incremental", "type":"checkbox","value": 2},
			  
			  {'field_name':"", "label": "Tax & Delivery Charges", "type":"h3"},
			  {'field_name':"merchant_tax", "label": "Tax", "type":"number"},	
			  {'field_name':"merchant_delivery_charges", "label": "Delivery Charges", "type":"number"},
			  {'field_name':"merchant_tax_charges", "label": "Do not apply tax to delivery charges", "type":"checkbox","value": 2},
			  
			  {'field_name':"merchant_opt_contact_delivery", "label": "Enabled Opt in for no contact delivery", "type":"checkbox","value": 1},
			  
			  {'field_name':"merchant_delivery_estimation", "label": "Delivery Estimation", "type":"text"},
			  
			  {'field_name':"merchant_delivery_miles", "label": "Delivery Distance Covered", "type":"number"},
			  
			  {'field_name':"merchant_distance_type", "label": "Unit", "type":"select", "data":  $settings.distance_unit },
			  
			  {'field_name':"", "label": "Tips", "type":"h3"},
			  {'field_name':"merchant_enabled_tip", "label": "Enabled", "type":"checkbox","value": 2},
			  {'field_name':"merchant_tip_default", "label": "Default Tip", "type":"select", "data": $settings.tip_list },
			  
			  {'field_name':"", "label": "Store Hours", "type":"h3"},
			  {'field_name':"merchant_timezone", "label": "Time Zone", "type":"select", "data": $settings.timezone_list },
			  {'field_name':"website_merchant_time_picker_interval", "label": "Time picker list interval", "type":"number"},
			  
			];
    	  setFormFields(fields);
    	  processAjax("getMerchantSettings",'','POST',5);
    	break;
    	
    	
    	/*LIST ALL*/
    	case "category":    	  
    	case "addon_list":
    	case "addon_item_list":
    	case "ingredients_list":
    	case "cooking_list":
    	case "item_list":
    	case "size_list":
    	case "shipping_list":
    	case "offers_list":
    	case "voucher_list":
    	case "mintable_list":
    	case "scheduler_list":
    	case "obd_receive_list":
    	case "gallery_settings":
    	case "banner_settings":
    	case "reviews":
    	case "orders_status_list":
    	
    	  $_fields = [
    	    {'field_name':"s", "label":t("Search") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		
    	  
    	  current_page_id = getCurrentPage();
    	  list_action = $("#"+ current_page_id + " .list_action").val();    	  
    	  processAjax(list_action,'','POST',6); 
    	  infinitePage(page,list_action);
    	  initPullHook(list_action); 	  
    	  
    	  if(page_id=="orders_status_list"){    	  	 
    	  	 if($settings.options.merchant_status_disabled==2){
    	  	    $("#"+ page_id + " ons-fab.add").attr("disabled",true);
    	  	 }
    	  }
    	  
    	break;
    	
    	case "category_form":
    	    	  
    	  category_name=''; description=''; status=''; id=''; thumbnail =''; $value='';
    	  if(!empty(page.data.cat_id)){
    	  	 id = page.data.cat_id;
    	  	 category_name = page.data.category_name;
    	  	 description = page.data.category_description;
    	  	 status = page.data.status;
    	  	 thumbnail = page.data.thumbnail;
    	  	 $value = page.data.photo;
    	  }
    	  
    	      	 
    	  fields = [
    	    {'field_name':"category_name", "label": "Food Category Name", "type":"text", "value" : category_name ,"required":1 },
    	    {'field_name':"category_description", "label": "Description", "type":"textarea", "value" : description },
    	    
    	    {'field_name':"photo", "label": "Upload image", "type":"upload_image", 
    	    "upload_option_name" : 'photo', "upload_next_action":"display_image", "upload_type":1, "thumbnail": thumbnail, "value": $value  },
    	    
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "cat id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);
    	  
    	  setFocus('category_name');  
    	      	  
    	break;
    	
    	case "addon_form":    	  
    	 
    	  name =''; description=''; status=''; id='';
    	  if(!empty(page.data.subcat_id)){
    	  	 id = page.data.subcat_id;
    	  	 name = page.data.subcategory_name;
    	  	 description = page.data.subcategory_description;
    	  	 status = page.data.status;
    	  }
    	  
    	  fields = [
    	    {'field_name':"subcategory_name", "label": "AddOn Name", "type":"text", "value" : name ,"required":1 },
    	    {'field_name':"subcategory_description", "label": "Description", "type":"textarea", "value" : description },
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);    	      	  
    	  setFocus('subcategory_name');
    	  
    	break;
    	
    	case "addon_item_form":
    	
    	  
    	  name =''; description=''; status='';  price=0; selected_count=''; id=''; thumbnail =''; $value='';
    	  
    	  if(!empty(page.data.sub_item_id)){    	  	 
    	  	 id = page.data.sub_item_id;
    	  	 name = page.data.sub_item_name;
    	  	 description = page.data.item_description;
    	  	 status = page.data.status;
    	  	 price = page.data.price;
    	  	 selected_count = page.data.category.length + " " + t("selected");
    	  	 thumbnail = page.data.thumbnail;
    	  	 $value = page.data.photo;
    	  }
    	      	  
    	  fields = [
    	    {'field_name':"sub_item_name", "label": "AddOn Item", "type":"text", "value" : name ,"required":1 },
    	    {'field_name':"item_description", "label": "Description", "type":"textarea", "value" : description },
    	    {'field_name':"price", "label": "Price", "type":"number", "value" : price },
    	        	    
    	     {'field_name':"addoncat_list", "label": "AddOn Category", "type":"text", "readonly":1,"required":1,
			  "onclick":"showPage('selection_list.html','',{'list_action':'AddonCategoryList','list':'addoncat_list','field':'category','page_title':'Select AddOn Category'} )","required":1,"value":selected_count },
    	     
			  {'field_name':"photo", "label": "Upload image", "type":"upload_image", 
"upload_option_name" : 'photo', "upload_next_action":"display_image", "upload_type":1, "thumbnail": thumbnail, "value": $value  },
			  
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  
    	  if(!empty(selected_count)){
    	  	 if(page.data.category.length>0){
	    	  	 $.each( page.data.category  , function( key, val ) {
	    	  	 	 new_fields = {'field_name':"category[]", "label": "category",
	    	  	 	 "type":"hidden2", "value" : val , "class_name":"selected_added category" };	 
	    	  	 	 fields.push(new_fields);
	    	  	 });
    	  	 }
    	  }    	      	  
    	      	  
    	  setFormFields(fields);
    	  
    	  setFocus('sub_item_name');  
    	      	  
    	break;
    	
    	case "item_form":
    	    	  
    	   $item_added_addon = [];
    	   $size_data = getSizeList();
    	   
    	   value=''; item_id=''; selected_count='';
    	   item_name = ''; item_description = ''; status=''; not_available='';
    	   category_selected=''; discount ='';  two_flavors='';
    	   two_flavors_position=''; non_taxable=''; packaging_fee='';
    	   packaging_incremental=''; cooking_ref=''; dish=''; ingredients='';
    	   thumbnail =''; $value='';
    	   
    	   if(!empty(page.data.item_id)){
    	   	   item_id = page.data.item_id;
    	   	   item_name = page.data.item_name;
    	   	   item_description = page.data.item_description;
    	   	   status = page.data.status;
    	   	   not_available = page.data.not_available==2?1:0;
    	   	   category_selected = page.data.category.length>0? page.data.category.length + " " + t("selected") :'';
    	   	   cooking_ref = page.data.cooking_ref.length>0? page.data.cooking_ref.length + " " + t("selected") :'';
    	   	   ingredients = page.data.ingredients.length>0? page.data.ingredients.length + " " + t("selected") :'';
    	   	   dish = page.data.dish.length>0? page.data.dish.length + " " + t("selected") :'';
    	   	   
    	   	   discount = page.data.discount;    	   	   
    	   	   two_flavors = page.data.two_flavors==2?1:0;
    	   	   //two_flavors_position = page.data.two_flavors_position==2?1:0;
    	   	   non_taxable = page.data.non_taxable==2?1:0;
    	   	   packaging_fee = page.data.packaging_fee;
    	   	   packaging_incremental = page.data.packaging_incremental==1?1:0;
    	   	   
    	   	   thumbnail = page.data.thumbnail;
    	  	   $value = page.data.photo;
    	   }
    	       	   
    	   fields = [
    	      {'field_name':"item_name", "label": "Item name", "type":"text", "value" : item_name ,"required":1 },
    	      {'field_name':"item_description", "label": "Description", "type":"textarea", "value" : item_description ,},
    	          	          	      
			  {'field_name':"photo", "label": "Upload image", "type":"upload_image", 
				"upload_option_name" : 'photo', "upload_next_action":"display_image", "upload_type":1, "thumbnail": thumbnail, "value": $value  },


    	      {'field_name':"not_available", "label": "Not available", "type":"checkbox","value": 2 , "checked" : not_available },
    	      
    	      {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	      
    	      {'field_name':"", "label": "Category", "type":"h3"},
    	      
    	      {'field_name':"category_list", "label": "Category", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'CategoryList','list':'category_list','field':'category','page_title':'Select Category'} )","required":1,"value": category_selected },
    	     
			  {'field_name':"", "label": "Price", "type":"h3"},
			  
			  {'field_name':"price[]", "label": "Price", "type":"item_size" , "maxlength":14 , "required":1,
			  'field_name2':'size[]' , "size_data" : $size_data },
			  
			  {'field_name':"", "label": "Discount", "type":"h3"},			  
			  {'field_name':"discount", "label": "Fixed Amount", "type":"number", "value" : discount  },
			  
			  {'field_name':"", "label": "Cooking Reference", "type":"h3"},			  
			  {'field_name':"cooking_ref_list", "label": "Cooking Reference", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'CookingRefList','list':'cooking_ref_list','field':'cooking_ref','page_title':'Select Cooking reference'} )","required":0,"value": cooking_ref },
			  
			  {'field_name':"", "label": "Ingredients", "type":"h3"},			  			  
			  {'field_name':"ingredient_list", "label": "Ingredients", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'IngredList','list':'ingredient_list','field':'ingredients','page_title':'Select Ingredients'} )","required":0,"value":ingredients },
			  
			  {'field_name':"", "label": "Dish", "type":"h3"},			  			  
			  {'field_name':"dish_list", "label": "Dish", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DishList','list':'dish_list','field':'dish','page_title':'Select dish'} )","required":0,"value":dish },
			  
			  {'field_name':"", "label": "Tax", "type":"h3"},			  			
			  {'field_name':"non_taxable", "label": "Non taxable", "type":"checkbox","value": 2 , "checked": non_taxable },
			  
			  {'field_name':"", "label": "Packaging Wise", "type":"h3"},			  			
			  {'field_name':"packaging_fee", "label": "Packaging fee", "type":"number", "value" : packaging_fee  },
			  {'field_name':"packaging_incremental", "label": "Incremental", "type":"checkbox","value": 1 , "checked": packaging_incremental},
			  
			  {'field_name':"", "label": "Two Flavors", "type":"h3"},			  			
			  {'field_name':"two_flavors", "label": "Enabled", "type":"checkbox","value": 2 , "checked" : two_flavors , "onclick" : "showHideTwoFlavor();"},

			  
			  {'field_name':"", "label": "Addon item", "type":"h3"},	
			  
			  {'field_name':"addon_select", "label": "Addon item", "type":"select", "data": ''},
			  
			  {'field_name':"add_addon", "label": "Add new addon", "type":"button_for_item"},
			  		  
    	      {'field_name':"id", "label": "id", "type":"hidden", "value" : item_id  },
    	   ];
    	   
    	   
    	   processAjax("ListAddon",'','POST');
    	   
    	   if(!empty(page.data.item_id)){
    	     if(page.data.category.length>0){
	    	  	 $.each( page.data.category  , function( key, val ) {
	    	  	 	 new_fields = {'field_name':"category[]", "label": "category",
	    	  	 	 "type":"hidden2", "value" : val , "class_name":"category selected_added" };	 
	    	  	 	 fields.push(new_fields);
	    	  	 });
    	  	 }
    	  	 
    	  	 if(page.data.cooking_ref.length>0){
	    	  	 $.each( page.data.cooking_ref  , function( key, val ) {
	    	  	 	 new_fields = {'field_name':"cooking_ref[]", "label": "cooking_ref",
	    	  	 	 "type":"hidden2", "value" : val , "class_name":"cooking_ref selected_added" };	 
	    	  	 	 fields.push(new_fields);
	    	  	 });
    	  	 }
    	  	 
    	  	 if(page.data.ingredients.length>0){
	    	  	 $.each( page.data.ingredients  , function( key, val ) {
	    	  	 	 new_fields = {'field_name':"ingredients[]", "label": "ingredients",
	    	  	 	 "type":"hidden2", "value" : val , "class_name":"ingredients selected_added" };	 
	    	  	 	 fields.push(new_fields);
	    	  	 });
    	  	 }
    	  	 
    	  	 if(page.data.dish.length>0){
	    	  	 $.each( page.data.dish  , function( key, val ) {
	    	  	 	 new_fields = {'field_name':"dish[]", "label": "dish",
	    	  	 	 "type":"hidden2", "value" : val , "class_name":"dish selected_added" };	 
	    	  	 	 fields.push(new_fields);
	    	  	 });
    	  	 }    	  	
    	  	 
    	   }
    	   
    	   setFormFields(fields);
    	   setFocus('item_name');  
    	   
    	    if(!empty(page.data.price)){    	    	 
		  	 	 $xprice = []; $x=0;
	    	  	 $.each( page.data.price  , function( key, val ) {
	    	  	 	 if($x==0){	    	  	 	 	
	    	  	 	 	$(".size").val( key );
	    	  	 	 	$(".price").val( val );
	    	  	 	 } else {		    	  	 	 	 	 	   
	    	  	 	    priceNewRow(key,val);
	    	  	 	 }  	  	 
	    	  	 	 $x++;
	    	  	 });	    	  	 
    	  	 }
    	break;
    	
    	case "ingredients_form":
    	  name =''; description=''; status='';  price=0; selected_count=''; id='';    	      	  
    	  if(!empty(page.data.ingredients_id)){    	  	 
    	  	 id = page.data.ingredients_id;
    	  	 name = page.data.ingredients_name;    	  	
    	  	 status = page.data.status;    	  	 
    	  }
    	  fields = [
    	    {'field_name':"ingredients_name", "label": "Ingredients name", "type":"text", "value" : name ,"required":1 },
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);
    	  setFocus('ingredients_name');  
    	break;
    	
    	case "cooking_form":
    	  name =''; description=''; status='';  price=0;  id='';    	      	  
    	  if(!empty(page.data.cook_id)){    	  	 
    	  	 id = page.data.cook_id;
    	  	 name = page.data.cooking_name;    	  	
    	  	 status = page.data.status;    	  	 
    	  }
    	  fields = [
    	    {'field_name':"cooking_name", "label": "Cooking reference name", "type":"text", "value" : name ,"required":1 },
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);
    	  setFocus('cooking_name'); 
    	break;
    	
    	case "size_form":
    	  name ='';  id='';    	      	  
    	  if(!empty(page.data.size_id)){    	  	 
    	  	 id = page.data.size_id;
    	  	 name = page.data.size_name;    	  	
    	  	 status = page.data.status;    	  	 
    	  }
    	  fields = [
    	    {'field_name':"size_name", "label": "Name", "type":"text", "value" : name ,"required":1 },
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);
    	  setFocus('size_name'); 
    	break;
    	
    	case "shipping_form":
    	  id=''; distance_from='';distance_to='';shipping_units='';distance_price='';
    	  if(!empty(page.data.id)){    	  	 
    	  	 id = page.data.id;
    	  	 distance_from = page.data.distance_from;    	  	
    	  	 distance_to = page.data.distance_to;
    	  	 shipping_units = page.data.shipping_units;
    	  	 distance_price = page.data.distance_price;
    	  }
    	  fields = [
    	    {'field_name':"distance_from", "label": "From", "type":"number", "value" : distance_from ,"required":1 },
    	    {'field_name':"distance_to", "label": "To", "type":"number", "value" : distance_to ,"required":1 },
    	    {'field_name':"distance_price", "label": "Fee", "type":"number", "value" : distance_price ,"required":1 },
    	    {'field_name':"shipping_units", "label": "Unit", "type":"select", "data": $settings.distance_unit , 'selected': shipping_units },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);
    	  setFocus('distance_from'); 
    	break;
    	
    	case "offers_form":
    	
    	id='';offer_percentage = 0; offer_price = 0; valid_from=''; valid_to=0;
    	selected_count=0; valid_from=0;
    	
    	if(!empty(page.data.id)){
    		id = page.data.id;
    		offer_percentage = page.data.offer_percentage;
    		offer_price = page.data.offer_price;
    		valid_from = page.data.valid_from;
    		valid_to = page.data.valid_to;
    		valid_from = page.data.valid_from;
    		selected_count  = page.data.applicable_to.length + " " + t("selected");    		
    	}
    	    	
    	fields = [
    	    {'field_name':"offer_percentage", "label": "Offer Percentage", "type":"number", "value" : offer_percentage ,"required":1 },
    	    {'field_name':"offer_price", "label": "Orders Over", "type":"number", "value" : offer_price ,"required":1 },
    	    
    	    {'field_name':"valid_from", "label": "Valid From", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DateList','list':'valid_from','field':'valid_from','page_title':'Select Date','list_type':'single'} )","required":1,"value":valid_from },
			  
			  {'field_name':"valid_to", "label": "Valid To", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DateList','list':'valid_to','field':'valid_to','page_title':'Select Date','list_type':'single'} )","required":1,"value":valid_to },
    	    
    	    {'field_name':"applicable_list", "label": "Applicable to", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'TransactionList','list':'applicable_list','field':'applicable_to','page_title':'Select transaction'} )","required":1,"value":selected_count },
    	    
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  
    	  if(!empty(selected_count)){
		  	 if(page.data.applicable_to.length>0){
	    	  	 $.each( page.data.applicable_to  , function( key, val ) {
	    	  	 	 new_fields = {'field_name':"applicable_to[]", "label": "applicable_to",
	    	  	 	 "type":"hidden2", "value" : val , "class_name":"applicable_to selected_added" };	 
	    	  	 	 fields.push(new_fields);
	    	  	 });
		  	 }
	    }    	 
	    
    	  setFormFields(fields);
    	  setFocus('offer_percentage'); 
    	break;
    	
    	case "voucher_form":
    	  id=''; voucher_name=''; voucher_type=''; amount=0; expiration=''; status='';
    	  $is_checked = false;
    	  
    	  if(!empty(page.data.id)){
    		id = page.data.id;    	
    		voucher_name = page.data.voucher_name;
    		voucher_type = page.data.voucher_type;
    		amount = page.data.amount;
    		expiration = page.data.expiration;
    		status = page.data.status;
    		if(page.data.used_once==2){
    			$is_checked = true;
    		}
    	  }
    	  
    	  fields = [
    	    {'field_name':"voucher_name", "label": "Name", "type":"text", "value" : voucher_name ,"required":1 },
    	    {'field_name':"voucher_type", "label": "Type", "type":"select", "data": $settings.voucher_type , 'selected': voucher_type },
    	    {'field_name':"amount", "label": "Discount", "type":"number", "value" : amount ,"required":1 },
    	    
    	    {'field_name':"expiration", "label": "Expiration", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DateList','list':'expiration','field':'expiration','page_title':'Select Date','list_type':'single'} )","required":1,"value":expiration },
			  
    	    {'field_name':"used_once", "label": "Used only once", "type":"checkbox","value": 2, "checked":$is_checked},
    	    
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields(fields);
    	  setFocus('voucher_name'); 
    	break;
    	
    	case "mintable_form": 
    	   id='';distance_from = 0; distance_to=0; min_order=0; shipping_units='';
    	   if(!empty(page.data.id)){
    		  id = page.data.id; 
    		  distance_from = page.data.distance_from; 
    		  distance_to = page.data.distance_to; 
    		  min_order = page.data.min_order; 
    		  shipping_units = page.data.shipping_units; 
    	   }
    	   
    	   fields = [
    	    {'field_name':"distance_from", "label": "From", "type":"number", "value" : distance_from ,"required":1 },
    	    {'field_name':"distance_to", "label": "To", "type":"number", "value" : distance_to ,"required":1 },
    	    {'field_name':"min_order", "label": "Minimum Order", "type":"number", "value" : distance_to ,"required":1 },
    	    {'field_name':"shipping_units", "label": "Unit", "type":"select", "data": $settings.distance_unit , 'selected': shipping_units },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	   ];
    	   setFormFields(fields);
    	   setFocus('distance_from'); 
    	break;
    	
    	case "scheduler_form":
    	  id=0; category_name='';
    	  var days = [
    	    'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
    	  ];
    	  
    	  if(!empty(page.data.cat_id)){
    	  	 id = page.data.cat_id;
    	  	 category_name = page.data.category_name;
    	  }
    	  fields = [
    	    {'field_name':"category_name", "label": "Category name", "type":"text", "value" : category_name ,"required":1, "readonly":1 },    	        	    
    	    
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  
    	  $.each( days  , function( key, val ) {
    	  	 $checked = 0;    	  	 
    	  	 if(page.data[val]==1){
    	  	 	$checked=1;
    	  	 }
	  	 	 new_fields = {'field_name':""+val+"", "label": val, 
	  	 	 "type":"checkbox","value": 1 , "checked": $checked};
	  	 	 fields.push(new_fields);
	  	 });
    	  
    	  setFormFields(fields);
    	  setFocus('category_name'); 
    	break;
    	
    	case "payment_list":
    	  processAjax("getPaymentList",'','POST',7);
    	break;
    	
    	case "payment_settings":    	 
    	   current_page_id = getCurrentPage();
    	   payment_code  = page.data.code;
    	   $("#"+ current_page_id + " h3").html( page.data.name  );    	 
    	   fillPaymentForm(payment_code, page.data.data);
    	break;
    	
    	case "social_settings":
    	fields = [
    	    {'field_name':"facebook_page", "label": "Facebook Page", "type":"text" },
    	    {'field_name':"twitter_page", "label": "Twitter Page", "type":"text" },
    	    {'field_name':"google_page", "label": "Google Page", "type":"text" },    	       	   
    	  ];
    	  
    	  setFormFields(fields);
    	  processAjax("getSocialSettings",'','POST',8);
    	  setFocus('facebook_page'); 
    	break;
    	
    	case "alert_settings":
    	  $lable = 'Email address of the person who will receive if there is new order. Multiple email must be separated by comma.';    	   
    	  fields = [    	    
    	    {'field_name':"", "label": $lable , "type":"h4"},
    	    
    	    {'field_name':"merchant_notify_email", "label": "Email address", "type":"text" },
    	    
    	    {'field_name':"", "label": "Email address that will receive invoice", "type":"h4"},
    	    {'field_name':"merchant_invoice_email", "label": "Email address", "type":"text" },    	       	   
    	    
    	    {'field_name':"", "label": "Email address that will receive order request cancelation", "type":"h4"},
    	    {'field_name':"merchant_cancel_order_email", "label": "Email address", "type":"text" },    	       	   
    	    
    	    {'field_name':"", "label": "Phone number that will receive order request cancelation", "type":"h4"},
    	    {'field_name':"merchant_cancel_order_phone", "label": "Phone number", "type":"text" }, 
    	    
    	  ];
    	  
    	  setFormFields(fields);
    	  processAjax("getAlertNotification",'','POST',9);
    	  setFocus('merchant_notify_email'); 
    	break;
    	
    	case "profile_data":   	
    	   $_fields = [
    	    {'field_name':"username", "label":t("Username") },    	    
    	    {'field_name':"mobile_number", "label":t("Mobile number") },
    	    {'field_name':"email_address", "label":t("Email") },
    	   ];
    	   
    	   translateForm(page_id,$_fields);  		
    	   
    	   setLast_tab();   
    	   setAppAwake(); 
    	   
    	   setTimeout(function(){	
		      notifyMediaSounds();
		   }, 1000);    	   
    	   
    	break;    
    	
    	case "todays_order":    
    	  $order_list_need_refresh = 0;
    	  	      	  
    	  list_action = "order_list";
    	  params = 'new=1&page_id='+page_id+'&order_type=incoming';
    	  processAjax(list_action,params,'POST',10, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );
   	  
    	  if($enabled_cron){
    	  $handle_incoming =  setInterval(function(){runCron('unattented','todays_order')}, new_order_interval );
    	  $handle_outgoing =  setInterval(function(){runCron('unattented','outgoing_order')}, new_order_interval+1000 );
    	  
    	  $handle_ready =  setInterval(function(){runCron('ready_order','ready_order')}, new_order_interval+2000 );
    	      	  
    	      	  
    	  $interval_new = !isNaN($settings.options.refresh_order)?$settings.options.refresh_order:3;	
    	  $interval_cancel = !isNaN($settings.options.refresh_cancel_order)?$settings.options.refresh_cancel_order:3;	
    	  
    	  $interval_new = parseInt($interval_new)*60000;
    	  $interval_cancel = parseInt($interval_cancel)*60000;
    	  
    	  $handle_refresh_order = setInterval(function(){runCron('refresh_order','todays_order')}, $interval_new );    	  
    	  $handle_refresh_cancel_order = setInterval(function(){runCron('refresh_cancel_order','cancel_orders')}, $interval_cancel );
    	  }
    	  
    	break;
    	
    	case "outgoing_order":
    	  list_action = "order_list";    	  
    	  params = 'page_id='+page_id+'&order_type=outgoing';
    	  processAjax(list_action,params,'POST',11, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );
    	break;
    	
    	case "ready_order":
    	  list_action = "order_list";
    	  params = 'page_id='+page_id+'&order_type=ready';
    	  processAjax(list_action,params,'POST',12, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );    	      	      	  
    	break;
    	
    	case "all_orders":
    	
    	  $order_list_need_refresh = 0;
    	  
          $_fields = [
    	    {'field_name':"s", "label":t("Search for order no. or name") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  
		  
    	
    	  list_action = "order_list";
    	  params = 'page_id='+page_id+'&order_type=all';
    	  processAjax(list_action,params,'POST',13, 'paginate_loader');
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );
    	break;
    	
    	case "cancel_orders":
    	
    	  
         $_fields = [
    	    {'field_name':"s", "label":t("Search for order no. or name") },    	   
    	  ];
    	  translateForm(page_id,$_fields);  
		  
    	
    	  list_action = "order_list";
    	  params = 'page_id='+page_id+'&order_type=cancel_order';
    	  processAjax(list_action,params,'POST',14, 'paginate_loader');
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );    	      	  
    	break;
    	
    	case "order_details":               
    	   processAjax( "OrderDetails" , "order_id="+ page.data.order_id ,'POST',15 );
    	   initPullHook('OrderDetails',page_id, "order_id="+ page.data.order_id  ); 
    	break;
    	
    	case "set_pin":
    	  fields = [
    	    {'field_name':"pin", "label": "PIN", "type":"password" ,
    	     "required":1 , "maxlength":4 , "class_name": "pin numeric_only" },
    	    {'field_name':"confirm_pin", "label": "Confirm PIN", "type":"password",
    	     "required":1, "maxlength":4 , "class_name": "pin numeric_only"  },    	    
    	  ];    	      	  
    	  setFormFields(fields);
    	  setFocus('pin'); 
    	break;
    	
    	case "remove_pin":    	  
    	  displayPin(page.data.pin);
    	break;
    	    
    	case "language":
    	  processAjax("getLanguageList",'','POST', 16);     	      	      	  
    	  initPullHook('getLanguageList',page_id, '' ); 
    	break;
    	
    	case "device_info":
    	  setDeviceInfo();
    	break;
    	
    	case "forgot_change_pass":    	  
    	  current_page_id = getCurrentPage();
    	  $("#"+  current_page_id + " .email_address").val(  page.data.email_address );
    	      	  
          $_fields = [
    	    {'field_name':"code", "label":t("Code") },
    	    {'field_name':"new_password", "label":t("New password") },
    	    {'field_name':"confirm_password", "label":t("Confirm password") },
    	  ];    	  
    	  translateForm(page_id,$_fields);  
		  
    	break;
    	
    	case "enter_pin":    	  
    	  $_fields = [
    	    {'field_name':"pin", "label":t("Enter your PIN") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		
    	  setFocus('pin');    	  
    	break;
    	
    	case "forgot_pin":    	
    	  $_fields = [
    	    {'field_name':"email_address", "label":t("Email") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		
    	  setFocus('email_address');    	  
    	break;
    	
    	case "todays_booking":
    	  list_action = "booking_list";
    	  params = 'page_id='+page_id+'&booking_type=incoming';
    	  processAjax(list_action,params,'POST',17, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );   
    	  
    	  if($enabled_cron){
    	  $handle_todays_booking =  setInterval(function(){runCron('todays_booking',page_id)}, new_order_interval+3000 ); 
    	  
    	  $booking_new = !isNaN($settings.options.refresh_booking)?$settings.options.refresh_booking:3;    	  
    	  $booking_new = parseInt($booking_new)*60000;    	      	  
    	  $handle_refresh_booking = setInterval(function(){runCron('refresh_booking',page_id)}, $booking_new );    	  
    	  
    	  
    	  $booking_cancel = !isNaN($settings.options.refresh_cancel_booking)?$settings.options.refresh_cancel_booking:3;    	  
    	  $booking_cancel = parseInt($booking_cancel)*60000;    	  
    	  $handle_refresh_cancel_booking = setInterval(function(){runCron('refresh_cancel_booking','cancel_booking')}, $booking_cancel );    	  
    	  }
    	break;
    	
    	
    	case "cancel_booking":
    	  list_action = "booking_list";
    	  params = 'page_id='+page_id+'&booking_type=cancel_booking';
    	  processAjax(list_action,params,'POST',18, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );      	  
    	  
    	  if($enabled_cron){
    	  $handle_cancel_booking =  setInterval(function(){runCron('cancel_booking',page_id)}, new_order_interval+4000 );  
    	  }
    	break;
    	
    	case "past_booking":
    	  list_action = "booking_list";
    	  params = 'page_id='+page_id+'&booking_type=done_booking';
    	  processAjax(list_action,params,'POST',19, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );      	  
    	break;
    	
    	case "all_booking":
    	  
    	  $_fields = [
    	    {'field_name':"s", "label":t("Search for booking no. or name") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  
    	  
    	  list_action = "booking_list";
    	  params = 'page_id='+page_id+'&booking_type=all';
    	  processAjax(list_action,params,'POST',20, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );      	  
    	break;
    	    	
    	case "booking_details":
    	  $("#"+ page_id + " h3").html( page.data.booking_number );    	  
    	  
    	  processAjax( "BookingDetails" , "booking_id="+ page.data.booking_id,'',21 );
    	  initPullHook('BookingDetails',page_id, "booking_id="+ page.data.booking_id  ); 
    	break;
    	
    	case "push_list":    	 

    	  $_fields = [
    	    {'field_name':"s", "label":t("Search") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		
    	 	  
    	  list_action = "notificationList";
    	  params = 'page_id='+page_id+'&list_type=unread';
    	  processAjax(list_action,params,'POST',22, 'paginate_loader');     	      	  
    	  infinitePage(page,list_action, params );
    	  initPullHook(list_action,page_id, params );      	
    	  
    	  
    	  if($enabled_cron){
    	  	 $handle_push_list =  setInterval(function(){runCron('push_list','push_list')}, new_order_interval+3000 );
    	  }
    	    
    	break;
    	
    	case "change_password":
    	  $_fields = [
    	    {'field_name':"old_password", "label":t("Old password") },    	    
    	    {'field_name':"new_password", "label":t("New password") },    	    
    	    {'field_name':"repeat_password", "label":t("Repeat password") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		
    	break;
    	
    	case "store_hours":
    	  
    	   var days = [
    	     {"value":"monday","label":"Monday"},
    	     {"value":"tuesday","label":"Tuesday"},
    	     {"value":"wednesday","label":"Wednesday"},
    	     {"value":"thursday","label":"Thursday"},
    	     {"value":"friday","label":"Friday"},
    	     {"value":"saturday","label":"Saturday"},
    	     {"value":"sunday","label":"Sunday"},
    	   ];
    	   
    	   $field_list = [];    	       	   
    	   $.each( days  , function( days_key, days_val ) {    	   	    
	    	    fields = {
	    	      'field_name':"stores_open_day[]", "label": days_val.label, "type":"checkbox2","value": days_val.value,
	    	      'class_name' : "stores_open_day_"+days_val.value
	    	    };
				$field_list.push(fields);
				
				/*AM*/
				fields = {'field_name':"stores_open_starts["+days_val.value+"]","label":"Start", "id": "", "readonly":1,
				  "class_name":"stores_open_starts_"+days_val.value,			  
				  "onclick":"showTimePicker(true,'time_picker','stores_open_starts_"+days_val.value+"')",	
				  		  			 
				  "onclick2":"showTimePicker(true,'time_picker','stores_open_ends_"+days_val.value+"')",			  
				  "class_name2":"stores_open_ends_"+days_val.value,
				  "type":"hours", "field_name2": "stores_open_ends["+days_val.value+"]", "label2":"End", "id2": "" };
				$field_list.push(fields);
				
				/*PM*/
				fields = {'field_name':"stores_open_pm_start["+days_val.value+"]","label":"Start", "id": "", "readonly":1,
				  "class_name":"stores_open_pm_start_"+days_val.value,			  
				  "onclick":"showTimePicker(true,'time_picker','stores_open_pm_start_"+days_val.value+"')",	
				  		  			 
				  "onclick2":"showTimePicker(true,'time_picker','stores_open_pm_ends_"+days_val.value+"')",			  
				  "class_name2":"stores_open_pm_ends_"+days_val.value,
				  "type":"hours", "field_name2": "stores_open_pm_ends["+days_val.value+"]", "label2":"End", "id2": "" };
				$field_list.push(fields);
				
				fields =  {'field_name':"stores_open_custom_text["+days_val.value+"]", "label": "Custom text", "type":"text2",
				"class_name": "stores_open_custom_text_"+ days_val.value  };
				$field_list.push(fields);
				
				fields = {'field_name':"", "label": "&nbsp;" , "type":"h4"};
				$field_list.push(fields);
				
    	    });        	   
    	   
    	    fields = {'field_name':"merchant_preorder", "label": "Accept Pre-orders", "type":"checkbox","value": 1, "checked":0};
    	    $field_list.push(fields);
    	    
    	    fields = {'field_name':"merchant_holiday", "label": "Date of holiday", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DateList','list':'merchant_holiday','field':'merchant_holiday','page_title':'Select Date', 'multiple':1} )","required":0};
    	    $field_list.push(fields);
    	    
    	    fields = {'field_name':"merchant_close_msg", "label": "Close Message", "type":"textarea", "value" : '' };
    	    $field_list.push(fields);
    	    
    	    fields = {'field_name':"merchant_close_msg_holiday", "label": "Holiday Close Message", "type":"textarea", "value" : '' };
    	    $field_list.push(fields);
    	    
    	    
    	   setFormFields($field_list);    	      
    	   processAjax("geTimeOpening",'','POST',23);     	
    	break;
    	
    	case "map":    	      	  
    	  $(".map_title").html( t(page.data.map_title) );
    	  $(".map_action").val( page.data.action );    	  
    	  latitude = $("#info .latitude").val();
    	  lontitude = $("#info .lontitude").val();
    	  initMapSelectLocation('map_wrap', latitude , lontitude );
    	break;
    	
    	case "review_form":
    	   id='';  review = ''; status='';
    	   if(!empty(page.data.id)){
    	   	  id = page.data.id;
    	   	  review = page.data.review;
    	   	  status = page.data.status;
    	   }
    	   $field_list = [
    	    {'field_name':"review", "label": "Customer reviews", "type":"textarea", "value" : review },
    	    {'field_name':"status", "label": "Status", "type":"select", "data": $settings.status_list , 'selected': status },
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields($field_list);   
    	break;
    	
    	case "order_status_form":
    	
    	  var description,id;    	  
    	  if(!empty(page.data.id)){
    	  	 id = page.data.id;
    	  	 description = page.data.description;
    	  }
    	
    	  $field_list = [
    	    {'field_name':"description", "label": "Status", "type":"text", "value" : description, "required":1 },    	    
    	    {'field_name':"id", "label": "id", "type":"hidden", "value" : id  },
    	  ];
    	  setFormFields($field_list);   
    	
    	break;
    	
    	case "order_status_settings":
    	  
    	  $field_list = [
    	    {'field_name':"default_order_status", "label": "Default Status", "type":"select", "data": ''},
    	  ];
    	  setFormFields($field_list);   
    	  processAjax("getOrderStatusList",'','POST');    
    	break;
    	
    	case "reports_menu":
    	  setMenuReport();
    	break;
    	
    	case "reports":
    	  
    	  $field_list = [];
    	  
    	  fields = {'field_name':"start_date", "label": "Start Date", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DateList','list':'start_date','field':'start_date','page_title':'Select Date', 'list_type':'single'} )","required":0};
    	  $field_list.push(fields);
    	  
    	  fields = {'field_name':"end_date", "label": "End Date", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'DateList','list':'end_date','field':'end_date','page_title':'Select Date', 'list_type':'single'} )","required":0};
    	  $field_list.push(fields);
    	  
    	  if(page.data.list_action!="booking_report"){
    	  fields = {'field_name':"order_status", "label": "Order Status", "type":"text", "readonly":1, 
			  "onclick":"showPage('selection_list.html','',{'list_action':'OrderStatusList','list':'order_status','field':'order_status','page_title':'Select Status', 'multiple':1} )","required":0};
    	  $field_list.push(fields);
    	  }
    	  
    	  fields = {'field_name':"search", "label": "Filter",
    	   "type":"report_button","onclick":"submitForm('.frm_reports','"+page.data.list_action+"')"};
    	  $field_list.push(fields);
    	    
    	  setFormFields($field_list);   
    	  
    	  current_page_id = getCurrentPage();
    	  $("#"+ current_page_id + " h3.title" ).html( page.data.title  );
    	  $("#"+ current_page_id + " .list_action" ).val( page.data.list_action  );
    	  
    	  dump(page);
    	  
    	  current_page_id = getCurrentPage();
    	  list_action = page.data.list_action;
    	  processAjax(list_action,'','POST',6); 
    	  infinitePage(page,list_action);
    	  initPullHook(list_action); 	  
    	  
    	break;
    	
    	case "sms_alert":
    	  $field_list = [
    	    {'field_name':"sms_notify_number", "label": "Notify Mobile Number", "type":"text"  },
    	  ];
    	  setFormFields($field_list);     
    	  processAjax("getSMSAlertSettings",'','POST');      	  
    	break;
    	
    	default:
    	  //
    	break;
    }
    
});
/*END INIT PAGE*/


$time_list_loaded = false;


showTimePicker = function(show,dialog_id,target){
	d = document.getElementById(dialog_id);   
	if(d){
	   if(show){	   	 
	     d.show({
	     	 callback : function(){ 
	          	 	
	          	   $(".target_object").val( target );      		      		          		            
	      		   setTimePickerOptions('time_picker', 'time_hour_segment', 's_time_hour', timeList(0) ,15);
	      		   setTimePickerOptions('time_picker', 'time_minutes_segment', 's_time_mins', timeList(1) ,15);
	      		   $time_list_loaded = true;		            
	          	 	
	          	 }
	     });
	   } else {
	   	 d.hide();
	   }
	} else {
	   if(show){
		   ons.createElement( dialog_id + '.html', { append: true }).then(function(dialog) {       	
	          dialog.show({
	          	 callback : function(){ 
	          	 	
	          	   $(".target_object").val( target );      		      		          		            
	      		   setTimePickerOptions('time_picker', 'time_hour_segment', 's_time_hour', timeList(0) ,15);
	      		   setTimePickerOptions('time_picker', 'time_minutes_segment', 's_time_mins', timeList(1) ,15);
	      		   $time_list_loaded = true;		            
	          	 	
	          	 }
	          });
	       });
	   } 
	}
};

showTimePickerValue = function(){
	time_hour = $(".s_time_hour").val();
	time_mins = $(".s_time_mins").val();
	if(empty(time_hour)){
		showToast( t("Select hours"), 'danger');
		return;
	}
	if(empty(time_mins)){
		showToast( t("Select minutes"), 'danger');
		return;
	}
	
	combined_hour = time_hour+":"+time_mins;
	target_object = $(".target_object").val();
	$("."+target_object ).val( combined_hour );
	document.getElementById('time_picker').hide();
};


var infinitePage = function(page, action, params){
	
	current_page_id = getCurrentPage();
	
	if(empty(params)){
	 	params='';
	} else {
	 	params='&'+params ;
	}
		
	page.onInfiniteScroll = function(done) {    	  	
	  	 paginate++;    	  	    	  	    	  	    	 
	     end_of_list = $("#"+ current_page_id + " .end_of_list").val();
	     end_of_list = parseInt(end_of_list);    	    
	     if(end_of_list>0){
	     	dump("list done");
	    	done();
	     } else {    	  			  	
		  	$.when( processAjax(action,"page="+ paginate + params ,'POST','','paginate_loader') ).then(function(){
	      	  	dump("DONE INFINITE"); 
	      	  	setTimeout(function(){	
				  	 done();
				}, 1000);
	      	 }, function(){
	      	  	dump("failed");
	      	});
	     }    	  	    	  	
   };
};

initPullHook = function(action, page_id , params ){
	 if(!empty(page_id)){
	 	 current_page_id = page_id;
	 } else {
	     current_page_id = getCurrentPage();
	 }
	 
	 if(empty(params)){
	 	params='';
	 } else {
	 	params='&'+params ;
	 }
	 	 	 
	 dump("=>"+current_page_id);
	 var object = $("#"+ current_page_id + " ons-pull-hook" );    	  
     var pullHook = object[0];	
     pullHook.onAction = function(done) {	      		      	 
     	
     	  $("#"+ current_page_id + " #s").val('');    	       	  
     	  $("#"+ current_page_id + " #start_date").val(''); 
     	  $("#"+ current_page_id + " #end_date").val(''); 
     	  $("#"+ current_page_id + " #order_status").val(''); 
     	  $("#"+ current_page_id + " .selected_added").remove();
     	
      	  $.when( processAjax(action,"refresh=1&pull_hook=1" + params ,'POST',24, 'refresh_loader') ).then(function(){
      	  	 dump("DONE"); 
      	  	 done();
      	  }, function(){
      	  	 dump("failed");
      	  });
     };
};

document.addEventListener('reactive', function(event) {
	dump("reactive");
	dump(event);
});

document.addEventListener('postpop', function(event) {
	dump("postpop");
	current_page = document.querySelector('ons-navigator').topPage.id
	dump("=>"+ current_page);	
	
	switch(current_page)
	{
		case "category":
		case "addon_list":
		case "addon_item_list":
		case "ingredients_list":
		case "cooking_list":
		case "size_list":
		case "shipping_list":
		case "offers_list":
		case "voucher_list":
		case "mintable_list":
		case "scheduler_list":
		case "item_list":
		case "reviews":
		case "orders_status_list":
		 current_page_id = getCurrentPage();  
		 list_action = $("#"+ current_page_id + " .list_action" ).val();
		 
		 $timenow_1 = getTimeNow();		 
		 processAjax(list_action,"refresh=1" ,'POST',$timenow_1 ); 
		break;

		case "all_orders":		  
		  if($order_list_need_refresh==1){  	 
		  	  setTimeout(function(){
				  params = 'page_id=all_orders&order_type=all&refresh=1';
		    	  processAjax(list_action,params,'POST',13, 'paginate_loader');
		    	  $order_list_need_refresh = 0;
	    	  }, 500); 
		  }
		break;
		
	}
	
});
/*END postpop*/	

document.addEventListener('preopen', function(event) {
	dump("preopen");
});	
/*end preopen*/

document.addEventListener('postchange', function(event) {
	dump("postchange");			
	current_page = document.querySelector('ons-navigator').topPage.id
	dump("=>"+ current_page);
	
	index = event.activeIndex;	
	dump("index=>"+index);
	switch(current_page){
		case "homepage":
		  setStorage("last_active_tab",index);
		  if(index==4){
		  	 processAjax("getProfile",'','POST','','silent'); 
		  } else if ( index==1){
		  	 $(".new_order_badge").html('');
		  } else if ( index==2){
		  	 $(".new_booking_badge").html('');	 
		  } else if ( index==3){
		  	 $(".new_push_message").html('');
		  }
		break;
	}
});
/*end postchange*/


document.addEventListener('preshow', function(event) {
	dump("preshow");
	var page = event.target;
	var page_id = event.target.id;   
	dump("pre show : "+ page_id);	
	translatePage();

	switch(page_id){
		case "order_options":
		  $("#order_options .notes").val('');
		break;
		
		default:		
		break;
	}
});
/*end preshow*/

document.addEventListener('postshow', function(event) {
	dump("postshow");
	var page = event.target;
	var page_id = event.target.id;   
	dump("postshow : "+ page_id);
	
	switch(page_id){
		
		case "order_options":	
		  $_fields = [
    	    {'field_name':"notes", "label":t("Additional comments") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		  	  
		break;
		
		case "booking_options":	
		  $_fields = [
    	    {'field_name':"notes", "label":t("Additional comments") },    	    
    	  ];
    	  translateForm(page_id,$_fields);  		  	  
		break;
		
		default:		
		break;
	}
});
/*end postshow*/

document.addEventListener('prehide', function(event) {
	dump("prehide");
	var page = event.target;
	var page_id = event.target.id;   
	dump("prehide : "+ page_id);
	
    switch(page_id){
    	case "order_options":    	 
    	   clearOrderOptions();    	   
    	break;
    	
    	case "booking_options":
    	   clearBookingOptions();
    	break;
    }
});
/*end prehide*/	

/*END ONSEN LISTINER*/

translatePage = function(){
	dump("TRANSLATE PAGE");	
	lang = getLanguageCode();		
	dump("lang=>"+ lang);	
	translator = $('body').translate({lang:  lang , t: dict});		
	jQuery.extend(jQuery.validator.messages, {
	   required: t("This field is required."),
	   email: t("Please enter a valid email address."),
	   number : t("Please enter a valid number")
	});
};

getLanguageCode = function(){
	lang='';
	if($settings = getMerchantSettings()){
	   lang = $settings.set_language;
	}	
	$merchant_set_lang = getStorage("merchant_set_lang");
	if(!empty($merchant_set_lang)){
		lang = $merchant_set_lang;
	}
	
	return lang;
};

t = function(data){
	return translator.get(data);
};

showLoader = function(show, loader_id) {			
	dump("loader_id=>"+ loader_id);
	if(!empty(loader_id)){
		var modal = document.querySelector('#'+ loader_id);
	} else {
		var modal = document.querySelector('#default_loader');	
	}
	
	if(empty(modal)){
		return ;
	}
		
	if(show){
	  modal.show();
	} else {	  
	  modal.hide();
	}		  
};

var showPaginateLoader = function(show){
	if(show){
	  $(".paginate_loader").show();
	} else {	  
	  $(".paginate_loader").hide();
	}		  
};

showToast = function(data, modifier) {

  if (empty(data)){
  	  data=' ';
  }	  
  if (empty(modifier)){
  	  modifier=' ';
  }	  
  is_animation = '';
  
  if(modifier=="danger"){
  	is_animation='fall';
  }
  
  toast_handler  = ons.notification.toast(data, {
     timeout: 2500, //
     animation: is_animation ,
     modifier: modifier+ ' thick',
  });
   
};

showAlert = function(data) {  
  if (empty(data)){
  	  data='';
  }  
  ons.notification.alert({
  	  message: t(data) ,
      title: merchantapp_config.AppTitle,
      buttonLabels : [ t("OK") ]
  });
};


var getTimeNow = function(){
	var d = new Date();
    var n = d.getTime();    
    n = parseInt(n) + parseInt(d.getMilliseconds());
    
    return n;
};	

/*Mycall*/
processAjax = function(action, data , method, single_call, loader_type ){
	
	if(empty(method)){
		method='POST';
	}	
	
	timenow = getTimeNow();
	dump("timenow=>"+ timenow);
	if(!empty(single_call)){			
		timenow = single_call;
	}	
	
	data+=requestParams();	
	var ajax_uri = ajax_url+"/"+action;
		
	ajax_request[timenow] = $.ajax({
	  url: ajax_uri,
	  method: method ,
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {                 
         clearTimeout( timer[timenow] );              
         if( ajax_request[timenow]  != null) {	
         	ajax_request[timenow].abort();            
         } else {         	         	
         	if ((typeof loader_type !== "undefined") && (loader_type !== null)) {	 
         		// silent   
         		if(loader_type=="silent"){
         			//silent
         			dump("loader silent");
         		} else if( loader_type=="paginate_loader" ){
         			dump("show paginate_loader");   
         			showPaginateLoader(true);
         		} else if( loader_type=="refresh_loader" ){
         			showLoader(true,loader_type);      
         		}
         	} else {	
         	   showLoader(true);         	
         	}
         	         	         
         	timer[timenow] = setTimeout(function() {		
         		if( ajax_request[timenow] != null) {		
				   ajax_request[timenow].abort();
				   showLoader(false,'default_loader');
				   showLoader(false,'refresh_loader');
				   showToast( t('Request taking lot of time. Please try again') ,'danger' );
         		}         		         		
	        }, ajax_timeout ); 
	        
         }
      }
    });
    
    ajax_request[timenow].done(function( data ) {
    	dump("done ajax");
    	
    	next_action='';
    	if(!empty(data.details.next_action)){
    	   next_action = data.details.next_action;
    	}    	
    	
    	if( data.code==1){
    		switch (next_action){
    			case "show_login":       	
    			   dict = data.details.dictionary;
    			   setStorage("merchant_settings", JSON.stringify(data.details) );		
    			   removeStorage("merchant_info");
			       removeStorage("merchant_token");
    			   setTimeout(function(){     			   	  	    			   	  
					   resetToPage('page_login.html','fade');
				   }, delayed_splash_screen); 
    			break;
    			
    			case "already_login":    		
    			  if(!empty(data.details.dictionary)){
    			     dict = data.details.dictionary;
    			  }
    			   
    			  setStorage("merchant_settings", JSON.stringify(data.details) );
    			  setStorage("merchant_info", JSON.stringify(data.details.merchant_info));
    			  setStorage("merchant_token",data.details.merchant_info.merchant_token);
    			      			      
    			  setStorage("device_alert_settings", JSON.stringify(data.details.device_info));			  
    			  subscribeDevice();    			      			  
    			  setTimeout(function(){     			   	  	    			   	  
					   resetToPage('homepage.html','fade');
				   }, delayed_splash_screen); 
				   
				   
				   setTimeout(function(){ 
				      processAjax("registerDevice",'','POST',100,'silent'); 
				   }, 2000);
				   
    			break;
    			
    			case "enter_pin": 
    			   if(!empty(data.details.dictionary)){
    			     dict = data.details.dictionary;
    			   }
    			   setStorage("merchant_settings", JSON.stringify(data.details) );
    			   setStorage("merchant_info", JSON.stringify(data.details.merchant_info));
    			   setStorage("merchant_token",data.details.merchant_info.merchant_token);
    			       			       		
    			   setStorage("device_alert_settings", JSON.stringify(data.details.device_info));	   
    			   subscribeDevice();    			       			   
    			   setTimeout(function(){     			   	  	    			   	  
					   resetToPage('enter_pin.html','fade');
				   }, delayed_splash_screen); 
				   
				   setTimeout(function(){ 
				      processAjax("registerDevice",'','POST',100,'silent'); 
				   }, 2000);
				   
    			break;
    			
    			case "show_homepage":
    			  if(!empty(data.details.dictionary)){
    			     dict = data.details.dictionary;
    			  }
    			  setStorage("merchant_info", JSON.stringify(data.details.merchant_info));
    			  setStorage("merchant_token",data.details.merchant_info.merchant_token);
    			  
    			  setStorage("device_alert_settings", JSON.stringify(data.details.device_info));
    			  subscribeDevice();
    			  
    			  resetToPage('homepage.html','fade');
    			break;
    			    			
    			case "display_selected":
    			  
    			  current_page_id = getCurrentPage(); 
    			  clearNoList(current_page_id);   
    			  
    			  if ( data.details.refresh==1){
    			  	  paginate = 0;    			  	     			  	  
    			  	  $("#"+ current_page_id + " ons-list" ).html('');
    			  	  $("#"+ current_page_id + " .end_of_list").val(0);
    			  }
    			  
    			  var seleted_data = [];
    			  
    			  $field = ''; $selected_added = '.selected_added';
    			  if(!empty(data.details.field)){
    			  	$field = data.details.field;
    			  }    			      			  
    			  if(!empty($field)){
    			  	 $selected_added = "."+$field + $selected_added;
    			  }
    			      			  
    			  //$.each( $(".selected_added")  , function( cuisine_added_key, cuisine_added_val ) {    			  	  
    			  $.each( $( $selected_added )  , function( cuisine_added_key, cuisine_added_val ) {    			  	  
    			  	  seleted_data.push( $(this).val() );
    			  });    			      			  
    			      			  
    			  setSelectedList(data.details.data, seleted_data);
    			break;
    			
    			case "display_single_selected":
    			
    			  if ( data.details.refresh==1){
    			  	  paginate = 0;
    			  	  current_page_id = getCurrentPage();    			  	  
    			  	  $("#"+ current_page_id + " ons-list" ).html('');
    			  	  $("#"+ current_page_id + " .end_of_list").val(0);
    			  }
    			  
    			  setSelectedSingleList(data.details.data);
    			break;
    			
    			case "end_of_list":
    			  current_page_id = getCurrentPage();
    			  $("#"+ current_page_id + " .end_of_list").val(1);
    			break;    			
    			
    			case "set_merchant_info":        			   
    			   html='';
    			   current_page_id = getCurrentPage(); 
    			   $.each( data.details.data  , function( key, val ) {
    			   	   if(key=="cuisine"){
    			   	   	  $("#"+current_page +  " .selected_added").remove();
    			   	   	  if(val.length>0){
    			   	   	  	 $(".cuisine_list").val( val.length + " " + t("selected") );
    			   	   	  	 $.each( val , function( cuisine_key,cuisine_id ) {
    			   	   	  	 	html+='<input type="hidden" name="cuisine[]" class="selected_added cuisine" value="'+ cuisine_id +'" >';
    			   	   	  	 });    			   	   	  	     			   	   	  	 
	                         $("#"+current_page +  " form").append( html );
    			   	   	  }
    			   	   } else if ( key=="is_ready"){
    			   	   	   $("input[name="+key+"][value=" + val + "]").prop('checked', true); 
    			   	   } else {
    			   	      $("."+ key).val( val );
    			   	   }
    			   });
    			break;
    			
    			case "set_form_options":      		    			 
    			 $.each( data.details.data  , function( key, val ) {    			 	
    			 	$field_type = $("."+val.option_name).attr("type");    			 	    			 	
    			 	if(empty($field_type)){
    			 		$field_type = "select";
    			 	}    			
    			 	
    			 	if(val.option_name=="merchant_photo"){
    			 		$field_type="logo";
    			 	}
    			 	if(val.option_name=="merchant_photo_bg"){
    			 		$field_type="banner";
    			 	}
    			 	 	
    			 	switch ($field_type){
    			 		case "checkbox":    			 		
    			 		  if(val.option_value==1 || val.option_value==2 || val.option_value=="yes"){
    			 		  	$("."+val.option_name).attr("checked",true);
    			 		  }
    			 		break;
    			 		
    			 		case "radio":
    			 		  if(!empty(val.option_value)){
    			 		     $("input[name="+val.option_name+"][value=" + val.option_value + "]").prop('checked', true); 
    			 		  }
    			 		break;
    			 		
    			 		case "text":
    			 		case "number":
    			 		case "select":
    			 		  if(!empty(val.option_value)){
    			 		     $("."+val.option_name).val( val.option_value );
    			 		  }
    			 		break;
    			 		
    			 		case "logo":
    			 		  $curr_page = getCurrentPage(); 
    			 		  if(!empty(val.option_value)){
    			 		  	 $logo_url = data.details.site_url+"/upload/"+ val.option_value;
    			 		     $("#" + $curr_page +  " .avatar_wrap .upload_image1").html( '<img src="'+  $logo_url  +'" />' ); 
    			 		     
    			 		     $field_name = $("#"+ $curr_page + " .upload_option_name").val();
			    		     $photo='<input type="hidden" name="'+ $field_name +'" value="'+ val.option_value +'" class="added_photo" >';
			    		     $("#"+$curr_page +  " .added_photo").remove();
			    		     $("#"+$curr_page +  " form").append( $photo );
    			 		     
    			 		  }
    			 		break;
    			 		
    			 		case "banner":
    			 		  $curr_page = getCurrentPage(); 
    			 		  if(!empty(val.option_value)){
    			 		  	 $logo_url = data.details.site_url+"/upload/"+ val.option_value;
    			 		     $("#" + $curr_page +  " .avatar_wrap .upload_image2").html( '<img src="'+  $logo_url  +'" />' ); 
    			 		     
    			 		     $field_name = $("#"+ $curr_page + " .upload_option_name2").val();
			    		     $photo='<input type="hidden" name="'+ $field_name +'" value="'+ val.option_value +'" class="added_photo2" >';
			    		     $("#"+$curr_page +  " .added_photo2").remove();
			    		     $("#"+$curr_page +  " form").append( $photo );
    			 		     
    			 		  }
    			 		break;
    			 		
    			 	}
    			 });
    			break;
    			
    			case "set_list_column":
 
    			 current_page_id = getCurrentPage();  
    			 clearNoList(current_page_id);   		  			 
    			 
    			 if ( data.details.refresh==1){
    			  	  paginate = 0;    			  	  
    			  	  $("#"+ current_page_id + " ons-list" ).html('');
    			  	  $("#"+ current_page_id + " .end_of_list").val(0);
    			  }
    			  setListColumn(data.details.data);    			  
    			  
    			  if(!empty(data.details.shipping_enabled)){
    			  	  $shipping_enabled = data.details.shipping_enabled==2?true:false;
    			  	  $("#shipping_list .shipping_enabled").attr("checked",$shipping_enabled);
    			  } 
    			  
    			  if(!empty(data.details.min_tables_enabled)){
    			  	  $min_tables_enabled = data.details.min_tables_enabled==1?true:false;    			  	  
    			  	  $("#mintable_list .min_tables_enabled").attr("checked",$min_tables_enabled);
    			  } 
    			  
    			  if(!empty(data.details.enabled_category_sked)){
    			  	  $enabled_category_sked = data.details.enabled_category_sked==1?true:false;        			  	 
    			  	  $("#scheduler_list .enabled_category_sked").attr("checked",$enabled_category_sked);
    			  } 
    			  
    			  if(!empty(data.details.enabled_gallery)){
    			  	  $enabled_gallery = data.details.enabled_gallery==1?true:false;    			  	  		  	  
    			  	  $("#gallery_settings .enabled_gallery").attr("checked", $enabled_gallery );
    			  } 
    			      			  
    			  if(!empty(data.details.banner_enabled)){    	
    			  	  $banner_enabled = data.details.banner_enabled==1?true:false;    			  	  		  	  
    			  	  $("#banner_settings .banner_enabled").attr("checked",$banner_enabled );
    			  } 
    			  
    			break;
    			
    			case "list_reload":
    			  current_page_id = getCurrentPage(); 
    			  list_action = $("#"+ current_page_id + " .list_action" ).val();
    			  processAjax(list_action,'refresh=1','POST',27); 
    			break;
    			
    			case "fill_form":    			  
    			  showPage(data.details.form_id,'lift',data.details.data);
    			  
    			  /*FOOD ITEM*/
    			  if(!empty(data.details.form_id)){
	    			  if( data.details.form_id=="item_form.html"){
	    			  	 if(!empty(data.details.size)){
	    			  	    setStorage("size_list_json", JSON.stringify(data.details.size) );		
	    			  	 }	   
	    			  	 
	    			  	 if(!empty(data.details.data.addon_item)){
	    			  	 	$.each( data.details.data.addon_item  , function( addon_id, $val ) {
	    			  	 		setTimeout(function(){     			  	      			  	
	    			  	 		   $timenow_2 = getTimeNow();
	    			  	 		   $params = 'addon_id='+ addon_id + "&item_id="+ data.details.data.item_id ;
	    			  	 		   processAjax( "GetAddonDetails" , $params,'POST' , $timenow_2 , 'silent');    	  
	    			  	 		}, 100);    	
	    			  	 	});
	    			  	 }
	    			  	 	    			  	  			  
	    			  }
    			  }
    			break;
    			
    			case "pop_form":
    			showToast( data.msg ,'success' );
    			 popPage();
    			break;
    			
    			case "pop_form2":
    			 popPage();
    			 showToast( data.msg ,'success' );
    			break;
    			
    			case "pop_dialog_order":
    			  accept_order = document.getElementById('accept_order');
    			  if(!empty(accept_order)){
    			     accept_order.hide();    	
    			  }		      			  
    			  
    			  order_options = document.getElementById('order_options');
    			  if(!empty(order_options)){
    			     order_options.hide();    	
    			  }		      			  
    			  
    			  current_page_id = getCurrentPage();     			     			  
    			  if(current_page_id=="all_orders"){
    			  	list_action = "order_list";	                
	                params = 'page_id='+current_page_id+'&order_type=all&refresh=1';
	                processAjax(list_action,params,'POST',28, 'paginate_loader');	                	                
    			  } else if ( current_page_id=="cancel_orders" ) {
    			  	list_action = "order_list";	                
	                params = 'page_id='+current_page_id+'&order_type=cancel_order&refresh=1';
	                processAjax(list_action,params,'POST',29, 'paginate_loader');	                	                
	              } else if ( current_page_id=="order_details" ) { 
	              	 $("#"+ current_page_id + " ons-list" ).html('');
	              	 $order_id = !empty(data.details.order_id)?data.details.order_id:'';
	              	 if(!empty($order_id)){
	              	    processAjax( "OrderDetails" , "order_id="+ $order_id ,'POST',15 );
	              	    $order_list_need_refresh = 1;
	              	 }
    			  } else {
    			     load_all_order_tab();    			  
    			  }
    			  
    			  $(".new_cancel_order_badge").html('');
    			break;
    			
    			case "clear_list":
    			  
    			  current_page_id = getCurrentPage(); 
    			  clearNoList(current_page_id);   		
    			  
    			  setNoList(current_page_id, data.msg );
    			  	  	  
    			  $("#"+ current_page_id + " ons-list" ).html('');
    			  $("#"+ current_page_id + " .end_of_list").val(0);
    			  
    			  
    			  if(data.details.is_search){
    			  	 setNoList(current_page_id, t("Search no results found") );
    			  } else {
    			     setNoList(current_page_id, t("No current data") );
    			  }
    			  
    			  if(!empty(data.details.shipping_enabled)){
    			  	  $shipping_enabled = data.details.shipping_enabled==2?true:false;
    			  	  $("#shipping_list .shipping_enabled").attr("checked",$shipping_enabled);
    			  } 
    			  
    			  if(!empty(data.details.min_tables_enabled)){
    			  	  $min_tables_enabled = data.details.min_tables_enabled==1?true:false;    			  	  
    			  	  $("#mintable_list .min_tables_enabled").attr("checked",$min_tables_enabled);
    			  } 
    			      			  
    			  if(!empty(data.details.enabled_category_sked)){
    			  	  $enabled_category_sked = data.details.enabled_category_sked==1?true:false;        			  	 
    			  	  $("#scheduler_list .enabled_category_sked").attr("checked",$enabled_category_sked);
    			  } 
    			  
    			  if(!empty(data.details.enabled_gallery)){
    			  	  $("#gallery_settings .enabled_gallery").attr("checked",data.details.enabled_gallery);
    			  } 
    			  
    			break;
    			
    			
    			case "fill_payment_list":    			 
    			  setPaymentList(data.details.data);
    			break;
    			
    			case "fill_payment_info":
    			  showPage("payment_settings.html",'', data.details);
    			break;
    			
    			case "obd_receive_list":  
    			  showPage("obd_receive_list.html");
    			break;
    			
    			case "set_order_list":    			      			  
    			  current_page_id = data.details.page_id;   
    			  clearNoList(current_page_id);
    			  if ( data.details.refresh==1){
    			  	  paginate = 0;    			  	  
    			  	  $("#"+ current_page_id + " ons-list" ).html('');
    			  	  $("#"+ current_page_id + " .end_of_list").val(0);
    			  }    			      			      			  
    			  
    			  $settings = getMerchantSettings();
    			  setOrderList(current_page_id, data.details , $settings);
    			break;
    			
    			case "clear_list_no_order":    	        			  
    			  current_page_id = data.details.page_id;    	
    			  
    			  setOrderCount(current_page_id,0);
    			  		  
    			  $("#"+current_page_id  + " ons-list" ).html('');
    			  $("#" + current_page_id + " .end_of_list").val(0);
    			  
    			  $messages = '';
    			  if (current_page_id=="todays_order"){
    			  	 $messages = t("There are no incoming order");
    			  } else if ( current_page_id=="outgoing_order" ) {
    			  	 $messages = t("There are no outgoing order");
    			  } else if ( current_page_id=="all_orders" ) {	 
    			  	 $messages = t("There are no new order");
    			  } else if ( current_page_id=="cancel_orders" ) {
    			  	 $messages = t("There are no cancel order");
    			  } else if ( current_page_id=="ready_order" ) {
    			  	 $messages = t("There are no ready order");
    			  }
    			  
    			  if(data.details.is_search){
    			  	 setNoList(current_page_id, t("Search no results found") );
    			  } else {
    			     setNoList(current_page_id, $messages );
    			  }
    			  
    			break;
    			
    			case "display_order_details":   
    			  current_page_id = getCurrentPage(); 			  
    			  if(data.details.refresh==1){
    			     $("#"+ current_page_id + " ons-list" ).html('');
    			  }
    			  
    			  setOrderDetails( data.details.data, data.details.history );
    			  setTimeout(function(){     			  	  
    			  	  runCron("order_details",'order_details');
    			  }, 100);    		 
    			break;
    			
    			case "refresh_oder":
    			   playMedia('neworder');
    			   load_all_order_tab();
    			break;
    			
    			case "new_cancel_order":
    			   playMedia('neworder');
    			   showToast(data.msg,'success');
    			   $(".new_cancel_order_badge").html(1);
    			   
    			   current_page_id = getCurrentPage(); 
    			   if(current_page_id=="cancel_orders"){    			     
	                 params = 'page_id='+current_page_id+'&order_type=cancel_order&refresh=1';
	                 processAjax("order_list",params,'POST',30, 'paginate_loader');	                	                
    			   }    			       			   
    			   load_all_order_tab();
    			break;
    			
    			case "fill_profile":
    			   fillForm('profile_data',data.details.data);
    			break;
    			
    			case "show_pin":
    			  showPage("set_pin.html",'', data.details.data);
    			break;
    			
    			case "remove_pin":    			
    			  showPage("remove_pin.html",'', data.details.data);
    			break;
    			
    			case "set_language":
    			  current_page_id = getCurrentPage(); 			  
    			  clearNoList(current_page_id);
    			  if(data.details.refresh==1){
    			     $("#"+ current_page_id + " ons-list" ).html('');
    			  }    			  
    			  setLanguageList(data.details.data);
    			break;
    			
    			case "clear_list_language":
    			   current_page_id = getCurrentPage(); 	
    			  $("#"+current_page_id  + " ons-list" ).html('');
    			  setNoList(current_page_id, data.msg ,'empty_flag.png' );
    			break;
    			
    			case "set_alert_settings":    			  
    			  $push_enabled = data.details.data.push_enabled==1?true:false;
    			  $subscribe_topic = data.details.data.subscribe_topic==1?true:false;
    			  $("#settings .push_enabled").attr("checked",$push_enabled);
    			  $("#settings .push_alert").attr("checked", $subscribe_topic);
    			break;
    			
    			case "silent":
    			  break;
    			
    			
    			case "show_forgot_change_pass":
    			   showToast( data.msg ,'success');
    			   replacePage("forgot_change_pass.html",'fade',{
    			   	 'email_address': data.details.email_address
    			   });
    			break;
    			
    			case "back_to_login":
    			  showToast( data.msg ,'success');
    			  resetToPage('page_login.html','fade');
    			break;
    			
    			case "back_to_pin":
    			   showToast( data.msg ,'success');
    			   resetToPage('enter_pin.html','fade');
    			break;
    			
    			case "set_booking_list":
    			  current_page_id = data.details.page_id;   
    			  clearNoList(current_page_id);
    			  if ( data.details.refresh==1){
    			  	  paginate = 0;    			  	  
    			  	  $("#"+ current_page_id + " ons-list" ).html('');
    			  	  $("#"+ current_page_id + " .end_of_list").val(0);
    			  }    			      			      			  
    			  setBookingList(current_page_id, data.details);
    			break;
    			
    			case "clear_list_no_booking":    	        			  
    			  current_page_id = data.details.page_id;    	    			  
    			  setBookingCount(current_page_id,0);
    			      			  		      			  
    			  $("#"+current_page_id  + " ons-list" ).html('');
    			  $("#" + current_page_id + " .end_of_list").val(0);
    			      			  
    			  if (current_page_id=="todays_booking"){
    			  	 setNoList(current_page_id, t("There are no incoming booking") );    			 
    			  } else if ( current_page_id=="cancel_booking" ){
    			  	setNoList(current_page_id, t("There are no request cancel booking") );    			 
    			  } else {
    			  	 if (data.details.is_search){
    			  	 	setNoList(current_page_id, t("Search no results found") );
    			  	 } else {
    			  	    setNoList(current_page_id, t("There are no booking") );
    			  	 }
    			  }
    			break;
    			
    			case "pop_dialog_booking":
    			  
    			  booking_options = document.getElementById('booking_options');
    			  if(!empty(booking_options)){
    			     booking_options.hide();    	
    			  }		      			  
    			  
    			  current_page_id = getCurrentPage();     			 
    			  if(current_page_id=="all_booking"){
    			  	list_action = "booking_list";	                
	                params = 'page_id='+current_page_id+'&booking_type=all&refresh=1';
	                processAjax(list_action,params,'POST',31, 'paginate_loader');	                	                
    			  } else {
    			     load_all_booking_tab();    			  
    			  }
    			break;
    			    			
    			case "display_booking_details":   
    			  current_page_id = getCurrentPage(); 			  
    			  if(data.details.refresh==1){
    			     $("#"+ current_page_id + " ons-list" ).html('');
    			  }    			  
    			  setBookingDetails( data.details.data, data.details.history );    			  
    			break;
    			
    			case "refresh_booking":
    			   playMedia('neworder');    			   
    			   load_all_booking_tab();
    			break;
    			
    			case "clear_booking_details":
    			  showToast( data.msg ,'danger');
    			  $("#"+current_page_id  + " ons-list" ).html('');   
    			  setTimeout(function(){ 
    			     popPage(); 			 
    			  }, 1000); 
    			break;
    			
    			case "set_notification_list":
    			  page_id_push = data.details.page_id;   
    			  clearNoList(page_id_push);
    			  if ( data.details.refresh==1){
    			  	  paginate = 0;    			  	  
    			  	  $("#"+ page_id_push + " ons-list" ).html('');
    			  	  $("#"+ page_id_push + " .end_of_list").val(0);
    			  }    			      			      			  
    			  setNotificationList(page_id_push, data.details);
    			break;
    			
    			case "clear_list_no_push":
    			  page_id_push = data.details.page_id;   
    			  $("#"+page_id_push  + " ons-list" ).html('');
    			  $("#" + page_id_push + " .end_of_list").val(0);
    			  if (data.details.is_search){
    			     setNoList(page_id_push, t("Search no results found") );
    			  } else {
    			  	 setNoList(page_id_push, t("No new notifications") );
    			  }
    			break;
    			
    			case "refresh_push_list":
    			  page_id_push = data.details.page_id;   
    			  clearNoList(page_id_push);
    			  
    			  paginate = 0;    			  	  
    			  $("#"+ page_id_push + " ons-list" ).html('');
    			  $("#"+ page_id_push + " .end_of_list").val(0);
    			  
    			  list_action = "notificationList";
		    	  params = 'page_id='+page_id_push+'&list_type=unread';
		    	  processAjax(list_action,params,'POST',32, 'paginate_loader'); 		    	  
    			break;
    			
    			case "mark_push_list":    			  
    			   $modifer_list = {
						1:"read",
						2:"unread"
				   };
				   my_modifier = 'read';
				   $object = $(".row_"+ parseInt(data.details.row_id) );	
				   $object.data("status","read");
				   $object.find(".actions_wrap").remove();
				   changeModifier($object[0],my_modifier,$modifer_list);		  
					
    			break;
    			
    			case "remove_push_list":
    			  $object = $(".row_"+ parseInt(data.details.row_id) );	    			  
    			  $object.fadeOut( "slow", function() {
    			  	//
				  });
				  
				  setTimeout(function(){    		
				  	  page_id_push = data.details.page_id;  
					  list_action = "notificationList";
			    	  params = 'page_id='+page_id_push+'&list_type=unread&refresh=1';
			    	  processAjax(list_action,params,'POST',33, 'paginate_loader');		    	    		    
    	          }, 1000);    		 
    			break;
    			
    			case "show_add_item_form":    			   
    			   setStorage("size_list_json", JSON.stringify(data.details.size) );		
    			   showPage('item_form.html');
    			break;
    			
    			case "reget_getsettings":
    			   setStorage("merchant_settings", JSON.stringify(data.details) );
    			   resetToPage('homepage.html','fade');
    			break;
    			
    			case "fill_opening_hours":
    			  $.each( data.details.data  , function( key, $timeval ) {    			  	  
    			  	  $(".stores_open_day_"+$timeval.id).attr("checked", $timeval.status==1?true:false );
    			  	  $(".stores_open_starts_"+$timeval.id).val( $timeval.start_time );
    			  	  $(".stores_open_ends_"+$timeval.id).val( $timeval.end_time );
    			  	  
    			  	  $(".stores_open_pm_start_"+$timeval.id).val( $timeval.start_time_pm );
    			  	  $(".stores_open_pm_ends_"+$timeval.id).val( $timeval.end_time_pm );
    			  	      			  	  
    			  	  $(".stores_open_custom_text_"+ $timeval.id ).val( $timeval.custom_text );
    			  });
    			  
    			  $(".merchant_preorder").attr("checked", data.details.merchant_preorder==1?true:false );
    			  $(".merchant_close_msg").val( data.details.merchant_close_msg );
    			  $(".merchant_close_msg_holiday").val( data.details.merchant_close_msg_holiday );
    			  
    			  if(!empty(data.details.merchant_holiday)){       			  	 
    			  	 	$curr_page = getCurrentPage(); 
    			  	 	
    			  	 	$("#"+$curr_page +  " .selected_added").remove(); 
    			  	 	$("#"+$curr_page + " .merchant_holiday").val( data.details.merchant_holiday.length + " " + t("selected") );
    			  	 	h_html='';
    			  	 	$.each( data.details.merchant_holiday  , function( $hkey, $hval ) {
    			  	 		h_html+='<input type="hidden" name="merchant_holiday[]" class="selected_added merchant_holiday" value="'+ $hval +'" >';
    			  	 	});
    			  	 	$("#"+$curr_page +  " form").append( h_html );    			  	 
    			  }    		    			  
    			  
    			break;
    			
    			case "fill_status_list":
    			  list_html = ''; selected = data.details.selected;    			  
    			  $.each( data.details.data  , function( key, val ) {
    			  	is_selected = "";    			  	
				    if(selected==val.value){
				    	is_selected = "selected";
				    }			    	
    			  	list_html+='<option value="'+ val.value +'" '+ is_selected+' >'+ val.label +'</option>';
    			  });    			  
    			  $("select").html( list_html );
    			break;
    			
    			case "fill_addon_list":
    			 list_html = ''; selected = data.details.selected;    			  
    			  $.each( data.details.data  , function( key, val ) {    			  	
    			  	list_html+='<option value="'+ key +'" >'+ val +'</option>';
    			  });    			  
    			  $(".addon_select select").html( list_html );
    			break;
    			
    			case "addon_details":
    			    setAddondetails(  data.details );
    			break;
    			
    			case "set_report":
	    			 current_page_id = getCurrentPage();  
	    			 clearNoList(current_page_id);   		  			 
	    			 
	    			  if ( data.details.refresh==1){
	    			  	  paginate = 0;    			  	  
	    			  	  $("#"+ current_page_id + " ons-list" ).html('');
	    			  	  $("#"+ current_page_id + " .end_of_list").val(0);
	    			  }
	    			  
	    			  if ( data.details.pull_hook==1){	    			  	  
	    			  	  $object = $("#"+current_page_id);		
		                  $list_action = $("#"+ current_page_id + " .list_action").val();		
		                  infinitePage($object[0] , $list_action , '' );
	    			  }
	    			  
	    			  setListReport(data.details.data , data.details.report_type );    			  
    			break;
    			    			
    			default:
    			  showToast( data.msg ,'success');
    			break;
    			   			
    			
    		} /*END SWITCH*/
    	} else if ( data.code==3){
    		 // TOKEN IS EXPIRED
    		 showAlert( data.msg );
    		 removeStorage("merchant_token");
    		 stopAllCron();
    		 setTimeout(function(){	
			    stopAllCron();
			 }, 100);
    		 setTimeout(function(){    		
    		    resetToPage('page_login.html','lift');
    	     }, 1000);    		 
    	} else {
    		/*FAILED*/    	
    		switch (next_action){
    			
    			case "clear_list":    			  
    			  break;
    			 
    			case "silent":
    			  break;
    			      			
    			case "clear_new_cancel_badge": 
    			 $(".new_cancel_order_badge").html('');
    			break;
    			 
    			default:
    			showToast( data.msg ,'danger');
    			break;
    		}    		
    	}
    });
    /*done*/
    
    ajax_request[timenow].always(function() {
        dump("ajax always");
        showLoader(false,loader_type); showPaginateLoader(false);
        ajax_request[timenow] = null;  
        clearTimeout( timer[timenow] );
    });
          
    /*FAIL*/
    ajax_request[timenow].fail(function( jqXHR, textStatus ) {
    	clearTimeout( timer[timenow] );        	
    	showToast( t("Failed") + ": " + textStatus + "\n" + JSON.stringify(jqXHR.responseText) ,'danger' );
        dump("failed ajax " + textStatus );        
    });     
};
/*end mycall*/

requestParams = function(action){
	data ='';
	data+="&device_id=" + device_id;
	data+="&device_platform=" + device_platform;
	data+="&device_uiid=" + device_uiid;
	data+="&code_version=" + code_version;
	
	token = getStorage("merchant_token");
	if (!empty(token)){
		data+="&merchant_token=" + token;
	} else {
		data+="&merchant_token=";
	}
			
	if(!empty(merchantapp_config.ApiKey)){
		data+="&api_key=" + merchantapp_config.ApiKey;
	}	
	data+="&lang="+ getLanguageCode();	
	dump("requestParams=>"+action);
	return data;
};

showPage = function(page_id, animation, data){
	
   if(empty(page_id)){
   	  return;
   }
   	
   if(empty(animation)){
   	  animation='lift';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.pushPage(page_id,{
  	   animation : animation , 
  	   data : data 	
   });  
};

resetToPage = function(page_id, animation , data ){
   if(empty(animation)){
   	  animation='lift';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.resetToPage(page_id,{
  	   animation : animation ,  	
  	   data : data
   });  
};

replacePage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='lift';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.replacePage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

bringPageTop = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.bringPageTop(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

insertPage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.insertPage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

var popPage = function(){
	try {
		onsenNavigator.popPage({
		 animation :"none"	
		});		
	} catch(err) {
      dump(err.message);
   } 
};


submitForm = function(form_name, action_name , method ){	
	
	current_page_id = getCurrentPage();		
	if(current_page_id=="reports"){
		$object = $("#"+current_page_id);		
		$list_action = $("#"+ current_page_id + " .list_action").val();
		$new_params = $( form_name ).serialize(); 
		$new_params = $new_params.replace("refresh=1&","");		
		infinitePage($object[0] , $list_action , $new_params );
	}
	
	$(form_name).validate({
   	    submitHandler: function(form) {
   	    	 var params = $( form_name ).serialize();   	    	    	    	 
		     processAjax(action_name, params , method  ); //34
		}
   	});
	$(form_name).submit();	
};

var isLogin = function(){
	var merchant_token = getStorage("merchant_token");
	if(!empty(merchant_token)){
		return merchant_token;
	}
	return false;
};

var getMerchantSettings = function(){
	 merchant_settings = getStorage("merchant_settings");	 
	 if(!empty(merchant_settings)){
	    merchant_settings = JSON.parse( merchant_settings );	 
	    return merchant_settings;
	 }
	 return false;
};

var getAppSettings = function(){
	return getMerchantSettings();
};

var getMerchantInfo = function(){
	 merchant_info = getStorage("merchant_info");	 
	 if(!empty(merchant_info)){
	    merchant_info = JSON.parse( merchant_info );	 
	    return merchant_info;
	 }
	 return false;
};

editDelete = function(id){ 

  current_page_id = getCurrentPage();
  delete_action = $("#"+ current_page_id + " .delete_action").val();	
  get_action = $("#"+ current_page_id + " .get_action").val();	
	
 ons.openActionSheet({
    title: t('What do you want to do?'),
    modifier : "material",
    cancelable: true,
    buttons: [      
      {
        label: t('Edit'),
        modifier: 'material'
      },
      {
        label: t('Delete'),        
        modifier: 'material'
      }
    ]
  }).then(function (index) { 
   	  console.log('index: ', index);
   	  
   	  if(index==0){
   	  	 processAjax( get_action , "id="+ id ,'', 35 );
   	  } else if (index==1) {
   	  	
		ons.notification.confirm( t("Are you sure?"),{
			title: t("Delete this records") ,		
			id : "dialog_order_options",
			modifier: " ",			
			buttonLabels : [ t("Yes") , t("Cancel") ]
		}).then(function(input) {				
			if (input==0){
				processAjax( delete_action , "id="+ id ,'',36);
			}
	   }); 
   	  	
   	  }//endif
   	  
  });
};

changePasswordField = function(){
	current_page = document.querySelector('ons-navigator').topPage.id;
	field_type = $("#"+current_page +" #password").attr("type");	
	switch(field_type)
	{
		case "password":
		  $("#"+current_page +" #password").attr("type","text");
		  $("#"+current_page +" .field_with_icon ons-button").html( '<ons-icon icon="md-eye-off"></ons-icon>' );
		break;
		
		case "text":
		  $("#"+current_page +" #password").attr("type","password");
		  $("#"+current_page +" .field_with_icon ons-button").html( '<ons-icon icon="md-eye"></ons-icon>' );
		break;
	}	
};

changePassField = function(object){	
	parent = object.parent();	
	field_type = parent.find("input").attr("type");	
	switch(field_type)
	{
		case "password":
		  parent.find("input").attr("type","text");		  
		  parent.find("ons-button").html( '<ons-icon icon="md-eye-off"></ons-icon>' );
		break;
		
		case "text":		  
		  parent.find("input").attr("type","password");		  
		  parent.find("ons-button").html( '<ons-icon icon="md-eye"></ons-icon>' );
		break;
	}	
};

setSelection = function(){
	var params = $( ".frm_selection" ).serializeArray();   
	
	current_page = document.querySelector('ons-navigator').topPage.id;   
	list = $("#"+ current_page + " .list").val();
	field = $("#"+ current_page + " .field").val();
	list_type = $("#"+ current_page + " .list_type").val();
	
	onsenNavigator.popPage();	
	
	setTimeout(function(){    		
         		
		if(list_type=="single"){
			$.each( params  , function( key, val ) {	        	
	        	$("#"+current_page +  " ."+field).val( val.value );
	        });
		} else {
	        $("#"+ current_page + " ."+ list).val( params.length + " " + t("selected") );
	        
	        html='';
	        $.each( params  , function( key, val ) {
	        	html+='<input type="hidden" name="'+field+'[]" class="selected_added '+ field +' " value="'+ val.value +'" >';
	        });
	                
	        current_page = document.querySelector('ons-navigator').topPage.id;           
	        //$("#"+current_page +  " .selected_added").remove();
	        $("#"+current_page + " ."+field + ".selected_added").remove();
		    $("#"+current_page +  " form").append( html );
		}
        
    }, 1000);
};

placeholder = function(field, value){
	$(field).attr("placeholder", t(value) );
};

getCurrentPage = function(){
	return document.querySelector('ons-navigator').topPage.id;
};

order_action = function(actions, order_id, trans_type){
	dump("order_action=>"+actions+"=>"+order_id);
	
	$settings = getMerchantSettings(); 		
	order_options = document.getElementById('order_options');		
	
	switch(actions){
		case "order_details":
		  showPage("order_details.html",'',{
		  	"order_id":order_id
		  });		  
		break;
		
		case "accept":	
		   		
		  $trans_type = trans_type;
		  		  
		  $trans_type = t("estimated food ready in");
		
		  accept_order = document.getElementById('accept_order');
		  
		  if (accept_order) {
		    accept_order.show({
		    	callback : function(){		    	
		    		$("#accept_order"+ ' .transtype').html( $trans_type );
		    		$("#accept_order"+ ' .order_id').val( order_id );
		    	}
		    });
		  } else {
		    ons.createElement('accept_order.html', { append: true })
		      .then(function(accept_order) {
		        accept_order.show({
		        	callback : function(){		        		
		        		setCarouselOptions('accept_order', $settings.time_list_ready ,25);
			    		$("#accept_order"+ ' .transtype').html( $trans_type );
			    		$("#accept_order"+ ' .order_id').val( order_id );
			    	}
		        });
		      });
		  }
		break;
		
		case "decline":
		case "cancel_order":
				   		   		   
		   if(actions=="decline"){
			   $trans_type = t('Decline order');
			   $info = {
			   	 "trans_type":$trans_type,
			   	 "order_id":order_id,
			   	 "cancel_action":actions,
			   	 "sub_reason": t("Reason for declining?")
			   };
		   } else if ( actions == "cancel_order"){
		   	   $trans_type = t('Cancel order');
			   $info = {
			   	 "trans_type":$trans_type,
			   	 "order_id":order_id,
			   	 "cancel_action":actions,
			   	 "sub_reason":t("Reason for cancelling?")
			   };
		   }
		   
		  if (order_options) {
		    order_options.show({
		    	callback : function(){
		    		setCarouselOptions('order_options', $settings.reason_decline,45);
		    		setCancelInfo($info);
		    	}
		    });
		  } else {
		    ons.createElement('order_options.html', { append: true })
		      .then(function(dialog) {
		        dialog.show({
		        	callback : function(){		  
		        		setCarouselOptions('order_options', $settings.reason_decline,45);
		        		setCancelInfo($info);
			    	}
		        });
		      });
		  } 
		   
		break;
		
		case "delay_order":		  
		  $trans_type = t('Delay order');
		   $info = {
		   	 "trans_type":$trans_type,
		   	 "order_id":order_id,
		   	 "cancel_action":actions,
		   	 "sub_reason":t("How much additional time do you need? we will notify the customer about the delay")
		   };
		   
		  if (order_options) {
		    order_options.show({
		    	callback : function(){
		    		setCarouselOptions('order_options', $settings.time_list_ready,25);
		    		setCancelInfo($info);
		    	}
		    });
		  } else {
		    ons.createElement('order_options.html', { append: true })
		      .then(function(dialog) {
		        dialog.show({
		        	callback : function(){		  
		        		setCarouselOptions('order_options', $settings.time_list_ready,25);
		        		setCancelInfo($info);
			    	}
		        });
		      });
		  } 
		   
		break;
		
		case "food_is_done":		
		  
		  $trans_type = t('Food is done');
		  
		  $sub_reason ='';
		  if(trans_type=="delivery"){
		  	 $sub_reason = t("We will notify customer and driver that food is ready");
		  } else {
		  	 $sub_reason = t("We will notify customer that food is ready");
		  }
		  
		   $info = {
		   	 "trans_type":$trans_type,
		   	 "order_id":order_id,
		   	 "cancel_action":actions,
		   	 "sub_reason": $sub_reason
		   };
		   
		  if (order_options) {
		    order_options.show({
		    	callback : function(){		    		
		    		clearCarouselOptions('order_options');
		    		setCancelInfo($info);
		    	}
		    });
		  } else {
		    ons.createElement('order_options.html', { append: true })
		      .then(function(dialog) {
		        dialog.show({
		        	callback : function(){		
		        		clearCarouselOptions('order_options');  		        		
		        		setCancelInfo($info);
			    	}
		        });
		      });
		  } 		  
		break;				
		
		case "manual_change_status":
		  
			$trans_type = t('Change order status');
			   $info = {
			   	 "trans_type":$trans_type,
			   	 "order_id":order_id,
			   	 "cancel_action":actions,
			   	 "sub_reason": t("manually change the order status")
			   };
			   
			  if (order_options) {
			    order_options.show({
			    	callback : function(){		    		
			    		setCarouselOptions('order_options', $settings.order_status_list,45);
			    		setCancelInfo($info);
			    	}
			    });
			  } else {
			    ons.createElement('order_options.html', { append: true })
			      .then(function(dialog) {
			        dialog.show({
			        	callback : function(){		
			        		setCarouselOptions('order_options', $settings.order_status_list,45);
			        		setCancelInfo($info);
				    	}
			        });
			      });
			  } 		  
		  
		break;
		
		case "complete_order":
		    ons.notification.confirm( t("This will set the order to complete"),{
				title: t("Complete order") ,		
				id : "dialog",
				modifier: " ",			
				buttonLabels : [ t("Ok") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "OrderOptions" , "order_id="+ order_id+ "&cancel_action=complete_order" ,'' , 37 );
				}
		   }); 
		break;
				
		
		case "approved_cancel_order":		  
		  $trans_type = 'Approved';
		   $info = {
		   	 "trans_type":$trans_type,
		   	 "order_id":order_id,
		   	 "cancel_action":actions,
		   	 "sub_reason": t("you are about to approved the cancellation")
		   };
		   
		  if (order_options) {
		    order_options.show({
		    	callback : function(){		    		
		    		setCancelInfo($info);
		    	}
		    });
		  } else {
		    ons.createElement('order_options.html', { append: true })
		      .then(function(dialog) {
		        dialog.show({
		        	callback : function(){		        		
		        		setCancelInfo($info);
			    	}
		        });
		      });
		  } 		   
		break;
		
		case "decline_cancel_order":
		  $trans_type = 'Decline';
		   $info = {
		   	 "trans_type":$trans_type,
		   	 "order_id":order_id,
		   	 "cancel_action":actions,
		   	 "sub_reason": t("Reason for declining?")
		   };
		   
		  if (order_options) {
		    order_options.show({
		    	callback : function(){		    
		    		setCarouselOptions('order_options', $settings.reason_decline,45);		
		    		setCancelInfo($info);
		    	}
		    });
		  } else {
		    ons.createElement('order_options.html', { append: true })
		      .then(function(dialog) {
		        dialog.show({
		        	callback : function(){		
		        		setCarouselOptions('order_options', $settings.reason_decline,45);        		
		        		setCancelInfo($info);
			    	}
		        });
		      });
		  } 		   
		break;
		
				
	}
};

load_all_order_tab = function(){
	
	$_timenow = getTimeNow();
	
	setTimeout(function(){	
		list_action = "order_list";
		params = 'new=1&page_id=todays_order&refresh=1&order_type=incoming';
		processAjax(list_action,params,'POST',$_timenow, 'paginate_loader');
	}, 100);
	
	setTimeout(function(){	
		$_timenow = getTimeNow();
		list_action = "order_list";
		params = 'new=1&page_id=outgoing_order&refresh=1&order_type=outgoing';
		processAjax(list_action,params,'POST',$_timenow, 'paginate_loader');     	      	  
	}, 200);
	
	setTimeout(function(){	
		$_timenow = getTimeNow();
		list_action = "order_list";
		params = 'new=1&page_id=ready_order&refresh=1&order_type=ready';
		processAjax(list_action,params,'POST',$_timenow, 'paginate_loader');     	      	  
	}, 300);
    			  
};

setReason = function(dialog_id, object, value){	
	object2 = $("#"+dialog_id + " ons-carousel ons-carousel-item");
	dump(object2);
	object2.removeClass("active");
	object.addClass("active");	
	
	$("#"+dialog_id + " .reason").val( value );
};

setCancelInfo = function(data){	
	$("#order_options"+ ' .transtype').html( data.trans_type );
	$("#order_options"+ ' .order_id').val( data.order_id );
	$("#order_options"+ ' .cancel_action').val( data.cancel_action );
	$("#order_options"+ ' .sub_reason').html( data.sub_reason );
};

clearOrderOptions = function(){
	$("#order_options"+ ' .transtype').html( '' );
	$("#order_options"+ ' .segment').html( '' );
	$("#order_options"+ ' .order_id').val( '' );
	$("#order_options"+ ' .cancel_action').val( '');
	$("#order_options"+ ' .sub_reason').html( '' );
	$("#order_options"+ ' .reason').val( '' );
};

CloseDialog = function(dialog_id){
	dialog = document.getElementById(dialog_id);
	dialog.hide();
};

moment_trans = function(){
	moment.locale('myen', {
	    months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
	        '_'
	    ),
	    monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
	        '_'
	    ),
	    weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	    weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	    longDateFormat: {
	        LT: 'h:mm A',
	        LTS: 'h:mm:ss A',
	        L: 'YYYY-MM-DD',
	        LL: 'MMMM D, YYYY',
	        LLL: 'MMMM D, YYYY h:mm A',
	        LLLL: 'dddd, MMMM D, YYYY h:mm A',
	    },
	    calendar: {
	        sameDay: '[Today at] LT',
	        nextDay: '[Tomorrow at] LT',
	        nextWeek: 'dddd [at] LT',
	        lastDay: '[Yesterday at] LT',
	        lastWeek: '[Last] dddd [at] LT',
	        sameElse: 'L',
	    },
	    relativeTime: {
	        future: t('in %s'),
	        past: t('%s ago'),
	        s: t('a few seconds'),
	        ss: t('%d seconds'),
	        m: t('a minute'),
	        mm: t('%d minutes'),
	        h: t('an hour'),
	        hh: t('%d hours'),
	        d: t('a day'),
	        dd: t('%d days'),
	        M: t('a month'),
	        MM: t('%d months'),
	        y: t('a year'),
	        yy: t('%d years'),
	    },
	    dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
	    ordinal: function (number) {
	        var b = number % 10,
	            output =
	                ~~((number % 100) / 10) === 1
	                    ? 'th'
	                    : b === 1
	                    ? 'st'
	                    : b === 2
	                    ? 'nd'
	                    : b === 3
	                    ? 'rd'
	                    : 'th';
	        return number + output;
	    },
	});
}

runCron = function($type, $page_id){
	dump("runCron =>" + $type +" page_id=>"+ $page_id);				
	
	//moment_trans();
	moment.locale('myen');
	
	$minutes = 5;
	$settings = getMerchantSettings(); 
	
	$order_unattended_minutes =  !isNaN($settings.options.order_unattended_minutes)?$settings.options.order_unattended_minutes:$minutes;		
	$ready_outgoing_minutes =  !isNaN($settings.options.ready_outgoing_minutes)?$settings.options.ready_outgoing_minutes:$minutes;
	
	$ready_unattended_minutes =  !isNaN($settings.options.ready_unattended_minutes)?$settings.options.ready_unattended_minutes:30;
	
	$booking_incoming_unattended_minutes =  !isNaN($settings.options.booking_incoming_unattended_minutes)?$settings.options.booking_incoming_unattended_minutes:$minutes;
	
	$booking_cancel_unattended_minutes =  !isNaN($settings.options.booking_cancel_unattended_minutes)?$settings.options.booking_cancel_unattended_minutes:$minutes;
	
	
	switch($type){	
		case "unattented":				 		 
		 var $object = $("#" + $page_id + " ons-list ons-list-item" );		 
		 
		 if($object.length>0){
		 	 $current_pageid  = getCurrentPage();		 	
		 	 dump("$current_pageid=>"+ $current_pageid) ;
		 	 
		 	 if($current_pageid=="homepage"){
			 	 $active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
			 	 dump("$active_index=>"+ $active_index) ;
			 	 if($active_index!=1){
			 	 	if($page_id=="todays_order"){
			 	 	  $(".new_order_badge").html( $object.length );
			 	 	}
			 	 } else {
			 	 	if($page_id=="todays_order"){
			 	 	   $(".new_order_badge").html( '' );
			 	 	}
			 	 }
		 	 }
		 	 		 	 
		 	
			 $.each( $object  , function( $objectkey, $objectval ) {			 	
			 	$alert = 0;
			 	$date_created_raw = $(this).data("date_created_raw");
			 	
			 	$timezone = $(this).data("timezone");
			 	if(empty($timezone)){
			 		return false;
			 	}
			 	dump("$timezone=>"+$timezone);
			 	moment.tz.setDefault($timezone);
			 	$date_now = moment().tz($timezone).format("YYYY-MM-DDTHH:mm:ss");
			 	
			 	dump("datenow=>"+$date_now+"/date_created=>"+$date_created_raw);
			 	$resp = dateDifference($date_now,$date_created_raw);
			 	dump($resp);
			 	
			 	/*DEBUG TIME*/
			   $object.find(".dump_data").remove();
			   $dump_data = "timezone" + $timezone + "=>" + $date_now + "=>\n" + $date_created_raw + "=>" +    JSON.stringify($resp);
			   //$object.find(".actions_wrap").after( "<div class=\"dump_data\">"+ $dump_data + "</div>" );
			   /*END DEBUG TIME*/
			 	
			 	$human = moment.duration(-$resp.min,'minutes').humanize(true);
	            dump("$human=>"+$human);	            
	            $(this).find(".created_time_stamp").html( $human );
			 	
			 	if($resp.min>=$order_unattended_minutes){
			 		$alert = 1;
			 	}
			 	if($resp.hour>0){
			 		$alert = 1;
			 	}
			 	if($resp.days>0){
			 		$alert = 1;			 		
			 	}
			 	dump("$alert=>"+$alert);
			 	
			 	if($alert==1 && $page_id=="todays_order"){			 		
			 	   $(this).find(".kcircle").addClass("pulse");			 		
			 	   playMedia('neworder');
			 	}
			 	
			 	/*OUTGOING*/
			 	
			 	$alert_outgoing = 0;
			 	if($page_id=="outgoing_order"){
			 		
			 	   $estimated_time = $(this).data("estimated_time");
			 	   $estimated_date_time = $(this).data("estimated_date_time");
			 	   dump("datenow=>"+$date_now+"/$estimated_date_time=>"+$estimated_date_time);
				   $resp_outgoing = dateDifference($date_now,$estimated_date_time);
				   dump($resp_outgoing);
				   
				   /*DEBUG TIME*/
				   $object.find(".dump_data").remove();
				   $dump_data = "timezone" + $timezone + "=>" + $date_now + "=>\n" + $estimated_date_time + "=>" +    JSON.stringify($resp_outgoing);
				   //$object.find(".actions_wrap").after( "<div class=\"dump_data\">"+ $dump_data + "</div>" );
				   /*END DEBUG TIME*/
				   
				   $new_estimation = $resp_outgoing.min*-1;
				   dump("$new_estimation=>"+$new_estimation);
				   $(this).find(".new_estimation").html( $new_estimation );
				   
				   if($new_estimation<=$ready_outgoing_minutes){
			 		   $alert_outgoing = 1;
				 	}
				 	if($resp_outgoing.hour>0){
				 		$alert_outgoing = 1;
				 	}
				 	if($resp_outgoing.days>0){
				 		$alert_outgoing = 1;
				 	}
				 	dump("$alert_outgoing=>"+$alert_outgoing);
				 	if($alert_outgoing==1){
				 	   $(this).find(".kcircle").addClass("pulse");	
				 	   $(this).find(".time_left").html( $new_estimation + " "+  t("minutes left") );
				 	   playMedia('critical');	
				 	   
				 	   if($current_pageid=="homepage"){
						 	 $active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
						 	 dump("$active_index=>"+ $active_index) ;
						 	 if($active_index!=1){
						 	 	if($page_id=="outgoing_order"){
						 	 	  $(".new_order_badge").html( $object.length );
						 	 	}
						 	 } else {
						 	 	if($page_id=="outgoing_order"){
						 	 	   $(".new_order_badge").html( '' );
						 	 	}
						 	 }
					 	}
				 	   			 	   
				 	}
			 	}
			 	
			 });
		 } else {
		 	dump("no order");
		 	if($page_id=="todays_order"){
		   	   $(".new_order_badge").html( '' );
		 	}
		 }
		break;
		
		case "ready_order":
		  dump("ready_order");		  
		  $object3 = $("#" + $page_id + " ons-list ons-list-item" );
		  $minutes3 = 60;
		  if($object3.length>0){		  	 
		  	 $.each( $object3  , function( $object3_key, $object3_val ) {		  	 	
		  	 	$alert3 = 0;
		  	 	$timezone3 = $(this).data("timezone");		  	 			  	 	
		  	 	//$date_created_raw3 = $(this).data("date_created_raw");
		  	 	$date_created_raw3 = $(this).data("date_modified");
		  	 	if(!empty($timezone3)){		  
		  	 		moment.tz.setDefault($timezone3);	 		
			  	 	$date_now3 = moment().tz($timezone3).format("YYYY-MM-DDTHH:mm:ss");			  	 	
			  	 	$resp3 = dateDifference($date_now3,$date_created_raw3);
				 	dump($resp3);				 	
				 	$human3 = moment.duration(-$resp3.min,'minutes').humanize(true);
		            dump("$human3=>"+$human3);	            
		            $(this).find(".created_time_stamp").html( $human3 );  
		            
		            $new_ready_estimation = $resp3.min*-1;				    
				    $(this).find(".new_estimation").html( parseInt($ready_unattended_minutes)+parseInt($new_ready_estimation) );
		            
		            
		            if($resp3.min>=$ready_unattended_minutes){
		            	$alert3 = 1;
		            }
		            if($resp3.hour>0){
				 		$alert3 = 1;
				 	}
				 	if($resp3.days>0){
				 		$alert3 = 1;			 		
				 	}
				 	if($alert3==1){
				 	   $(this).find(".kcircle").addClass("pulse");
				 	   playMedia('critical');		
				 	}		                 
		  	 	}
		  	 });
		  }
		break;
				
		case "refresh_order":		 		  
		  dump("refresh_order");		  
		  $order_ids=[];
		  var $object = $("#" + $page_id + " ons-list ons-list-item" );
		  if($object.length>0){
		  	 $.each( $object  , function( $objectkey, $objectval ) {		  	 	
		  	 	$order_ids.push( $(this).data("order_id") );
		  	 });
		  }
		  processAjax("refresh_order","order_id="+$order_ids,'POST',38,'silent')
		break;
		
		case "refresh_cancel_order":		  
		  $order_ids=[];
		  var $object = $("#" + $page_id + " ons-list ons-list-item" );
		  if($object.length>0){
		  	 $.each( $object  , function( $objectkey, $objectval ) {		  	 	
		  	 	$order_ids.push( $(this).data("order_id") );
		  	 });
		  }
		  processAjax("refresh_cancel_order","order_id="+$order_ids,'POST',39,'silent')
		break;
		
		case "order_details":		  
		  var $object2 = $("#" + $page_id + " ons-list ons-list-item" );
		  if($object2.length>0){		  	 
		  	 $.each( $object2  , function( $object2_key, $object2_val ) {
		  	 	$timezone2 = $(this).data("timezone");		  	 	
		  	 	$estimated_date_time2 = $(this).data("estimated_date_time");
		  	 	$estimated_time2 = $(this).data("estimated_time");
		  	 	if(!empty($timezone2)){		  
		  	 		moment.tz.setDefault($timezone2);	 		
			  	 	$date_now2 = moment().tz($timezone2).format("YYYY-MM-DDTHH:mm:ss");
	                $resp_outgoing2 = dateDifference($date_now2,$estimated_date_time2);
	                $new_estimation2 = $resp_outgoing2.min*-1;		
	                if($new_estimation2>0){
				       $(this).find(".new_estimation").html( $new_estimation2 );
	                } else {
	                   $(this).find(".new_estimation").html( $estimated_time2 );
	                }
		  	 	} else{
		  	 		$(this).find(".new_estimation").html( $estimated_time2 );
		  	 	}
		  	 });
		  }
		break;
		
		case "todays_booking":
		case "cancel_booking":
		 
		  $minutes = $booking_incoming_unattended_minutes;
		  if($type=="cancel_booking"){
		  	$minutes = $booking_cancel_unattended_minutes;
		  }
		
		  var $list_booking = $("#" + $page_id + " ons-list ons-list-item" );
		  $alert_booking = 0;
		  
		  dump("list_booking.length =>"+ $list_booking.length);
		  
		  if($list_booking.length>0){		
		  	
		  	 $current_pageid  = getCurrentPage();		 	
		 	 dump("$current_pageid=>"+ $current_pageid) ;
		 	 $active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
		 	 
		 	 if($current_pageid=="homepage"){			 	 
			 	 dump("$active_index=>"+ $active_index) ;
			 	 if($active_index!=2){
			 	 	if($page_id=="todays_booking"){
			 	 	  $(".new_booking_badge").html( $list_booking.length );
			 	 	}
			 	 } else {
			 	 	if($page_id=="todays_booking"){
			 	 	   $(".new_booking_badge").html( '' );
			 	 	}
			 	 }
		 	 }
		  	  	 
		  	 $.each( $list_booking  , function() {
		  	 	$booking_timezone = $(this).data("timezone");		  	 			  	 	
		  	 	$booking_date_created = $(this).data("date_created_raw");		  	 	
		  	 	dump($booking_timezone+"=>"+$booking_date_created);
		  	 	if(!empty($booking_timezone)){		  	 	
		  	 		moment.tz.setDefault($booking_timezone);	
			  	 	$date_now_booking = moment().tz($booking_timezone).format("YYYY-MM-DDTHH:mm:ss");
			  	 	$resp = dateDifference($date_now_booking,$booking_date_created);			  	 	
			  	 	dump($resp);
			  	 	$human = moment.duration(-$resp.min,'minutes').humanize(true);
		            dump("$human=>"+$human);	            
		            $(this).find(".created_time_stamp").html( $human );
	            
		            if($resp.min>=$minutes){
			 		    $alert_booking = 1;
				 	}
				 	if($resp.hour>0){
				 		$alert_booking = 1;
				 	}
				 	if($resp.days>0){
				 		$alert_booking = 1;			 		
				 	}
				 	dump("$alert_booking=>"+$alert_booking);				 	
				 	if($alert_booking==1){			 		
				 	   $(this).find(".kcircle").addClass("pulse");			 		
				 	   playMedia('neworder');
				 	   
				 	   if($type=="cancel_booking"){				 	   	   
				 	   	   if($current_pageid=="homepage"){						 	   	   	 
						 	 if($active_index!=2){
						 	 	if($page_id=="cancel_booking"){
						 	 	  $(".new_booking_badge").html( 1 );
						 	 	}
						 	 } else {
						 	 	$(".new_booking_badge").html( '' );
						 	 }
				 	   	   }
				 	   }
				 	   
				 	}
			            
		  	 	} else{
		  	 		//
		  	 	}
		  	 });
		  } else {
		  	 $current_pageid  = getCurrentPage();	
		  	 if($current_pageid=="homepage"){
		  	    $(".new_booking_badge").html( '' );
		  	 }
		  }
		break;
		
		case "refresh_booking":	
		case "refresh_cancel_booking":
		  $booking_id=[];
		  var $booking_list2 = $("#" + $page_id + " ons-list ons-list-item" );
		  if($booking_list2.length>0){
		  	 $.each( $booking_list2  , function() {		  	 	
		  	 	$booking_id.push( $(this).data("booking_id") );
		  	 });
		  }
		  		  		  
		  $process_id = $type=="refresh_booking"?40:41;
		  processAjax($type,"booking_id="+$booking_id,'POST',$process_id,'silent')
		break;		

		case "push_list":		  		 
		  $current_push_id  = getCurrentPage();
		  $push_active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
		  dump( "$current_push_id=>"+ $current_push_id + " $push_active_index=>" + $push_active_index);
		  if($current_push_id=="homepage"){
		  	
		  	  var $push_list = $("#" + $page_id + " ons-list ons-list-item" );
			  $count_unread = 0;
			  if($push_list.length>0){
			  	 $.each( $push_list  , function() {		  	 			  	 	
			  	 	 $stats = $(this).data("status");
			  	 	 if($stats=="unread"){
			  	 	 	$count_unread++;
			  	 	 }
			  	 });
			  }
		  	
		  	  if($push_active_index!=3){
				  if($count_unread>0){
				  	 $(".new_push_message").html( $count_unread );
				  } else {
				  	 $(".new_push_message").html( '' );
				  }
		  	  }
		  }
		  
		break;	
		
	}
};

/*end run cron*/


stopAllCron = function(){
	clearInterval($handle_incoming);
	clearInterval($handle_outgoing);
	clearInterval($handle_ready);
	clearInterval($handle_refresh_order);
	clearInterval($handle_refresh_cancel_order);
	
	clearInterval($handle_refresh_booking);
	clearInterval($handle_todays_booking);	
	clearInterval($handle_cancel_booking);
	clearInterval($handle_refresh_cancel_booking);		   
	
	clearInterval($handle_push_list);		   
};

dateDifference = function(date_now, date_past){
	var a = moment(date_now);
    var b = moment(date_past);
    $min = a.diff(b, 'minutes');
    $hours = a.diff(b, 'hours');
    $days = a.diff(b, 'days');        
	return {
	  'min':$min,
	  'hour':$hours,	
	  'days':$days,
	};
};

playMedia = function($sounds_type){	
	try {	
		
		if( isdebug() ){		
			dump("$sounds_type=>"+ $sounds_type );
			switch($sounds_type){
				case "neworder":
				  $media_handle1 = document.getElementById("neworder_notification");  
		          $media_handle1.play(); 		
		          break;
		          
				default:
				  $media_handle = document.getElementById("bell_notification");  
		          $media_handle.play(); 		
				break;
			}	    
		} else {
			
			$sound_path = "";
					
			 if(cordova.platformId === "android"){
		     	$sound_path = cordova.file.applicationDirectory + "www/sounds/"+$sounds_type+".mp3";
		     } else if(cordova.platformId === "ios"){
		     	$sound_path = "sounds/"+$sounds_type+".mp3";
		     }		 			   
			 var my_media = new Media( $sound_path ,	        
		        function () { 
		        	//ok
		        },	        
		        function (err) { 
		        	// failed
		        }
		    );
		    
		    my_media.play({ playAudioWhenScreenIsLocked : true });
		    my_media.setVolume(1.0);		    
		    my_media.play();
		    setTimeout(function(){		
		    	my_media.stop();
	            my_media.release();	             	    	
		    }, 4000);
		    		
		}
	
	} catch(err) {        
        showToast(err.message);        
    }    
};


logout = function(){
	ons.notification.confirm( t("You will be returned to the login screen."),{
		title: t("Log out") ,		
		id : "dialog_order_options",
		modifier: " ",			
		buttonLabels : [ t("Ok") , t("Cancel") ]
	}).then(function(input) {				
		if (input==0){
			removeStorage("merchant_info");
			removeStorage("merchant_token");
			setStorage("last_active_tab",0);
			
			setTimeout(function(){	
				 stopAllCron();
				 setTimeout(function(){	
				    stopAllCron();
				 }, 100);
				 
				 unsubscribeAllTopics();
				 
				 processAjax("logoutApp",'','POST',42,'silent');
			  	 resetToPage('page_login.html','fade');
			}, 100);						
		}
   }); 
};

mapExternalDirection = function(lat,lng){
	if(!empty(lat)){
	   if( isdebug() ){
	   	   showAlert("App is in debug mode "+lat+"="+lng);
	   } else {
	   	
	   	 try {
		    	
	        launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, function(isAvailable){
				    var app;
				    if(isAvailable){
				        //app = launchnavigator.APP.GOOGLE_MAPS;
				        app = launchnavigator.APP.USER_SELECT;
				    }else{		        
				        app = launchnavigator.APP.USER_SELECT;
				    }
				    launchnavigator.navigate( [lat, lng] , {
				        app: app
				    });
				});
			
			} catch(err) {		
				showToast(err.message);	    
			}    
		   	
	   }
	} else {
		showToast( t("Empty latitude and longititude") ,'danger');
	}
}

externalPhoneCall = function(phone){
	if(!empty(phone)){
		window.open( "tel:" + phone  );
	} else {
		showToast( t("Empty phone number") ,'danger');
	}
};

setLast_tab = function(){	
   $last_active_tab = parseInt(getStorage("last_active_tab"));
   if(isNaN($last_active_tab)){
   	  $last_active_tab = 0;
   }   
   document.querySelector('ons-tabbar').setActiveTab($last_active_tab);
      
};

fillForm = function(page_id, data){
	$.each( data  , function( key, val ) {		
		$("#"+ page_id + " #"+key).val( val );
	});
};

getPin = function(){
	processAjax("getPIN",'','POST',43);
};


EnabledPush = function(){
	
	try {
		
		var enabled_push = $("input[name=push_enabled]:checked").val();
		if(empty(enabled_push)){
			enabled_push='';
		}	
		
		$topic_new_order='';
		if($data = getDeviceAlertInfo()){
			$topic_new_order = $data.topic_new_order
		}
					
		if( isdebug() ){
			processAjax('saveAlertOrder', "push_enabled="+enabled_push , '' , 44);
			return;
		}
		
		if(enabled_push>0){
			window.FirebasePlugin.subscribe($topic_new_order, function(){		        
		        processAjax('saveAlertOrder', "push_enabled="+enabled_push ,'', 45);
		    },function(error){
		        showToast( t("Failed to subscribe to alert") , 'danger' );
		    });
		} else {
			window.FirebasePlugin.unsubscribe($topic_new_order, function(){		        
		        processAjax('saveAlertOrder', "push_enabled="+enabled_push ,'', 46 );
		    },function(error){
		        showToast( t("Failed to subscribe to alert") , 'danger');
		    });
		}		
	
	} catch(err) {
       showToast(err.message, 'danger');       
    } 
};

EnabledSubcribe = function(){
	try {
		var push_alert = $("input[name=push_alert]:checked").val();
		if(empty(push_alert)){
			push_alert='';
		}	
		
		$topic_alert='';
		if($data = getDeviceAlertInfo()){
			$topic_alert = $data.topic_alert
		}
						
		if( isdebug() ){
			processAjax('saveSubsribe', "push_alert="+push_alert ,'', 47);
			return;
		}
		
		if(push_alert>0){
			window.FirebasePlugin.subscribe($topic_alert, function(){		        
		        processAjax('saveSubsribe', "push_alert="+push_alert ,'', 48 );
		    },function(error){
		        showToast( t("Failed to subscribe to alert") , 'danger');
		    });
		} else {
			window.FirebasePlugin.unsubscribe($topic_alert, function(){		        
		        processAjax('saveSubsribe', "push_alert="+push_alert , '', 49 );
		    },function(error){
		        showToast( t("Failed to subscribe to alert") , 'danger');
		    });
		}		
	
	} catch(err) {
       showToast(err.message ,'danger');       
    } 
};

setFocus = function(element){
	try {	    	    
	    setTimeout(function(){
		   document.getElementById( element )._input.focus();		   
		},200);
	 } catch(err) {
        dump(err);
     } 
};

setBookingInfo = function(data){	
	$("#booking_options"+ ' .booking_number').html( data.booking_number );
	$("#booking_options"+ ' .booking_id').val( data.booking_id );
	$("#booking_options"+ ' .cancel_action').val( data.cancel_action );
	$("#booking_options"+ ' .sub_reason').html( data.sub_reason );
};

clearBookingOptions = function(){
	$("#booking_options"+ ' .booking_number').html( '' );
	$("#booking_options"+ ' .booking_id').val( '' );
	$("#booking_options"+ ' .cancel_action').val( '');
	$("#booking_options"+ ' .sub_reason').html( '' );
	$("#booking_options"+ ' .notes').val( '' );
	$("#booking_options"+ ' .segment').html( '' );	
};

booking_action = function(actions, booking_id){
	
	dump("actions=>"+actions+" booking_id=>"+booking_id);
	
	var $booking_info=''; $show_segment = false; my_modifier='';	
	$show_dialog = false;	

	$modifer_list = {
		1:"dialog_extra_medium",
		2:"dialog_large"
	};
	
	switch( actions ) {
		case "accept":
		case "cancel_booking_approved":
		   my_modifier='dialog_extra_medium'; $show_dialog=true;
		   $booking_info = {
		   	 "booking_number": t("Booking No. #") + booking_id,
		   	 "booking_id":booking_id,
		   	 "cancel_action":actions,
		   	 "sub_reason":""
		   };		   		  
		break;
		
		case "decline":
		case "denied":
		    my_modifier='dialog_large'; $show_dialog=true;
		    $show_segment = true;
		    $booking_info = {
		   	 "booking_number": t("Booking No. #") + booking_id,
		   	 "booking_id":booking_id,
		   	 "cancel_action":actions,
		   	 "sub_reason": t("Reason for declining?")
		   };		 
		break;
		
		case "booking_details":		
		  showPage("booking_details.html",'',{
		  	"booking_id":booking_id,
		  	"booking_number": t("Booking No. #") + booking_id,
		  });		  
		break;
		
	}
	
	if(!$show_dialog){
		return;
	}
	
	booking_options = document.getElementById('booking_options');			
	if (booking_options) {		
	    booking_options.show({
	    	callback : function(){
	    		if($show_segment){
	    		    setCarouselOptions('booking_options', $settings.reason_decline,45);
	    		}
	    		setBookingInfo($booking_info);	    			    	
	    		changeModifier(document.getElementById('booking_options'),my_modifier,$modifer_list);
	    	}
	    });
	  } else {
	    ons.createElement('booking_options.html', { append: true })
	      .then(function(dialog) {
	        dialog.show({
	        	callback : function(){		  
	        		if($show_segment){ 
	        		   setCarouselOptions('booking_options', $settings.reason_decline,45);
	        		}
	        		setBookingInfo($booking_info);	
	        		changeModifier(document.getElementById('booking_options'),my_modifier , $modifer_list);
		    	}
	        });
	      });
	 }
	 
	 
};

changeModifier = function(element, modifier, list_modifier){
	$.each( list_modifier  , function( modifier_key, modifier_val ) {		
		ons.modifier.remove(element, modifier_val);
	});
	ons.modifier.add(element, modifier);
};

load_all_booking_tab = function(){
	
	$time_now = getTimeNow();
	
	setTimeout(function(){	
	    list_action = "booking_list";
		params = 'page_id=todays_booking&refresh=1&booking_type=incoming';
		processAjax(list_action,params,'POST',$time_now+1, 'paginate_loader');
	}, 400);
	
	setTimeout(function(){	
		list_action = "booking_list";
		params = 'page_id=past_booking&refresh=1&booking_type=done_booking';
		processAjax(list_action,params,'POST',$time_now+2, 'paginate_loader');     	      	  
	}, 500);
	
	setTimeout(function(){	
		list_action = "booking_list";
		params = 'page_id=cancel_booking&refresh=1&booking_type=cancel_booking';
		processAjax(list_action,params,'POST',$time_now+3, 'paginate_loader');     	      	  
	}, 600);
		
};

notificationAction = function(id){ 
 $page_id = 'push_list';
 
 $object = $("#" + $page_id + " ons-list ons-list-item" );		 		  
 if($object.length<=0){
 	return;
 }
 
 ons.openActionSheet({
    title: t('What do you want to do?'),
    modifier : "material",
    cancelable: true,
    buttons: [      
      {
        label: t('Mark all as read'),
        modifier: 'material'
      },
      {
        label: t('Remove all'),        
        modifier: 'material'
      }
    ]
  }).then(function (index) {    	     	 
   	  if(index==0){   	  	 
   	  	  processAjax( "PushMarkRead",'page_id='+$page_id,'POST',50);    	  
   	  } else if (index==1) {   
	   	  	ons.notification.confirm( t("You are about to delete all notification you have received"),{
				title: t("Are you sure?") ,		
				id : "dialog_order_options",
				modifier: " ",			
				buttonLabels : [ t("Yes") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "PushRemoveAll",'page_id='+$page_id,'POST',51);    	  
				}
		   }); 	   	  			   	  	 
   	  }//endif
   	  
  });
};

push_action = function(action, record_type,  id , row_id){	
		
	$page_id = 'push_list';
	$params = 'page_id='+$page_id+"&id="+ id + "&row_id="+ row_id + "&record_type="+ record_type; 
	switch(action){
		case "mark_read":		  
		  processAjax( "PushMarkRead",$params,'POST',52);    	
		break;
		
		case "remove":
		    ons.notification.confirm( t("You are about to delete this notification"),{
				title: t("Are you sure?") ,		
				id : "dialog_order_options",
				modifier: " ",			
				buttonLabels : [ t("Yes") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "PushRemoveAll",$params,'POST',53);    	
				}
		   }); 	   	 		  
		break;
	}
};

priceNewRow = function(selected,value){
	
	if(empty(selected)){
		selected='';
	}
	if(empty(value)){
		value='';
	}
	
	html=''; $size_data = getSizeList();
	   
   html+='<div class="field_label relative">';
   
       html+='<ons-button modifier="quiet button_close" onclick="removePrice( $(this) );" >';
	      html+='<ons-icon icon="md-close"></ons-icon>';
	    html+='</ons-button>';
   
   html+='<ons-row>';
          html+='<ons-col vertical-align="top" width="5%" ></ons-col>';
          html+='<ons-col vertical-align="top" width="47%" >';
          
          html+='<ons-select  id="'+ 'size' +'" name="'+ 'size[]' +'"  class="'+ 'size' +'" >';
		    $.each( $size_data  , function( key, val ) {			    	
		    	is_selected = "";		    			    	
			    if(val.value==selected){
			    	is_selected = "selected";
			    }			    	
		    	html+='<option value="'+ val.value +'" '+ is_selected+' >'+ val.name +'</option>';
		    });
		  html+='</ons-select>'; 
          
          html+='</ons-col>';
          
          html+='<ons-col vertical-align="top" width="47%" >';
          html+='<ons-input type="number" name="'+ 'price[]' +'" id="'+ 'price' +'" class="'+ 'price' +'" modifier="material underbar"	 ';
    html+='placeholder="'+ t("Price") +'" '+ '' +'  value="'+ value +'" float></ons-input>';
          html+='</ons-col>';
          
   html+='</ons-row>';
   html+='</div>';	   
   
   current_page = document.querySelector('ons-navigator').topPage.id;
   $("#"+current_page +  " .prices_list").append( html );
	   
};

removePrice = function($object){
	$object.parent().remove();
};

getSizeList = function(){
	 size_list_json = getStorage("size_list_json");	 
	 if(!empty(size_list_json)){
	    size_list_json = JSON.parse( size_list_json );	 
	    return size_list_json;
	 }	 
	 $size_default_data = [{
 		name : "",
	   	value: 0
	 }];
	 return $size_default_data;
};

enabled_switch = function(field, action){	
	var enabled_switch = $("input[name="+field+"]:checked").val();
	processAjax( action ,field+"="+enabled_switch, '' , 54);    	  
};

var getDeviceAlertInfo = function(){
	 device_alert_settings = getStorage("device_alert_settings");	 
	 if(!empty(device_alert_settings)){
	    device_alert_settings = JSON.parse( device_alert_settings );	 
	    return device_alert_settings;
	 }
	 return false;
};


subscribeDevice = function(){			
	if($data = getDeviceAlertInfo()){
		$topic_new_order = $data.topic_new_order
	    $topic_alert = $data.topic_alert;
	    	
		$push_enabled = $data.push_enabled;
		$subscribe_topic = $data.subscribe_topic;	
		
		if($push_enabled>0 && !empty($topic_new_order)){   						
			setTimeout(function() {				  
		 	  subscribe($topic_new_order);
		   }, 500);  
		}
		
		if($subscribe_topic>0 && !empty($topic_alert)){  			
			setTimeout(function() {				     
		 	  subscribe($topic_alert);
		   }, 500);  
		}
		
	}
};

unsubscribeAllTopics = function(){
	if($data = getDeviceAlertInfo()){
		
		$topic_new_order = $data.topic_new_order
	    $topic_alert = $data.topic_alert;
	    	    
	    unsubscribe($topic_new_order);
	    
	    setTimeout(function() {	
	    	unsubscribe($topic_alert);
	    }, 500);  
	}
};

translateForm = function(page_id, data){	
	$.each( data  , function( key, val ) {		
		$("#"+ page_id + " #"+val.field_name ).attr("placeholder", val.label);
	});
};   

setLanguageCode = function(lang_code){
	setStorage("merchant_set_lang", lang_code);	
	processAjax( "reget_getsettings" ,'','POST',55);    	  
};


showDialog = function(show, dialog_name){
		
	d = document.getElementById(dialog_name);   
	if(d){
	   if(show){
	     d.show();
	   } else {
	   	 d.hide();
	   }
	} else {
	   if(show){
		   ons.createElement( dialog_name + '.html', { append: true }).then(function(dialog) {       	
	        dialog.show();
	       });
	   } 
	}
};

var loaded=0;
var percent=0;

browseGallery = function(){
		
	if( isdebug() ){
		
		showToast( t("App is in debug mode upload will work on actual device") , 'danger' );
		showLoader(true,'upload_loader');
		$(".upload_percent").html( "0%");
		test_loader = setInterval(function(){ 
	       loaded++;
	       percent = loaded*10;	       
	       $(".upload_percent").html( percent +"%");
	       if(percent>=100){
	       	  clearInterval(test_loader);
	       	  percent=0; loaded=0;
	       	  showLoader(false,'upload_loader');	       	  
	       }	       
	    }, 1000);
		return;
	} 
	
	try {		
		navigator.camera.getPicture(uploadPhoto, function(message){
			 //showToast( t('Failed because:') + " " + message);
		},{
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
	    });
		
    } catch(err) {
       alert(err.message);       
    } 
    
};


uploadPhoto = function(imageURI){	
	try {
					 
		 showLoader(true,'upload_loader');
		 $(".upload_percent").html( "0%");	     		 
		 
		 var options = new FileUploadOptions();
		 options.fileKey = "file";
		 options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		 options.mimeType = "image/jpeg";
		 	 
		 var params = {};
		 
		 params.merchant_token = getStorage("merchant_token") ;	 		 
		 params.device_id = device_id;
		 params.device_platform = device_platform;
		 params.device_uiid = device_uiid;
		 params.code_version = code_version;
		 
		 params.api_key = merchantapp_config.ApiKey;		 
		 params.lang = getLanguageCode();
		 
		 current_page_id = getCurrentPage();
		 upload_option_name = $("#"+ current_page_id + " .upload_option_name").val();
		 params.upload_option_name = upload_option_name;
		 
		 upload_next_action = $("#"+ current_page_id + " .upload_next_action").val();
		 params.next_action = upload_next_action;
		 
		 $upload_type = $("#"+ current_page_id + " .upload_type").val();
		 params.upload_type = $upload_type;
		 		 		 		 		 
		 options.params = params;	 
		 options.chunkedMode = false;	
		 
		 var headers={'headerParam':'headerValue'};
		 options.headers = headers;
		
		 var ft = new FileTransfer();	 	 	 
		 
		 ft.onprogress = function(progressEvent) {
	     if (progressEvent.lengthComputable) {	     	    
	     	    var loaded_bytes= parseInt(progressEvent.loaded);
	     	    var total_bytes= parseInt(progressEvent.total);
	     	    
	     	    var loaded_percent = (loaded_bytes/total_bytes)*100;	        
	     	    loaded_percent=Math.ceil(loaded_percent);
	     	    	       	        		        		        
		        $(".upload_percent").html( loaded_percent +"%");
		        
		    } else {	    		    	
		        //
		    }
		 };
		 	 
		 ft.upload(imageURI, ajax_url+"/UploadFile", function(result){
		     
		     setTimeout(function(){				
				showLoader(false,'upload_loader');
			 }, 2000);
			 			
			if( result.responseCode=="200" || result.responseCode==200 ){
		    			    
			    $json_response = JSON.parse( result.response );	 			    
			    
			    $curr_page = getCurrentPage(); 
			    			    
			    if($json_response.code==1){
			    	switch($json_response.next_action){
			    		case "list_reload":			    		  
		    			  list_action = $("#"+ current_page_id + " .list_action" ).val();
		    			  processAjax(list_action,'refresh=1','POST',56); 
			    		 break;
			    		 
			    		 case "display_image":			    		  
			    		  $("#" + $curr_page +  " .avatar_wrap .upload_image1").html( '<img src="'+  $json_response.file_url +'" />' );
			    		  
			    		  $field_name = $("#"+ $curr_page + " .upload_option_name").val();
			    		  $photo='<input type="hidden" name="'+ $field_name +'" value="'+ $json_response.filename +'" class="added_photo" >';
			    		  
			    		  $("#"+$curr_page +  " .added_photo").remove();
			    		  $("#"+$curr_page +  " form").append( $photo );
			    		 break;
			    		 
			    	}
			    } else {
			    	showToast( $json_response.msg  , 'danger');
			    }		  
			} else {
				showToast( t("upload error :") + result.responseCode , 'danger');
			}
		    
		 }, function(error){	 	
		 	 $(".progress_wrapper ons-progress-bar").hide();	       	  
		     showToast( t("An error has occurred: Code") + " "+ error.code , 'danger');
		 }, options);
	 
	 } catch(err) {
	 	showLoader(false,'upload_loader'); 
        showToast(err.message,'danger');       
     } 
};

/*UPLOAD BANNER*/
browseBanner = function(){
		
	if( isdebug() ){
		
		showToast( t("App is in debug mode upload will work on actual device") , 'danger' );
		showLoader(true,'upload_loader');
		$(".upload_percent").html( "0%");
		test_loader = setInterval(function(){ 
	       loaded++;
	       percent = loaded*10;	       
	       $(".upload_percent").html( percent +"%");
	       if(percent>=100){
	       	  clearInterval(test_loader);
	       	  percent=0; loaded=0;
	       	  showLoader(false,'upload_loader');	       	  
	       }	       
	    }, 1000);
		return;
	} 
	
	try {		
		navigator.camera.getPicture(uploadBanner, function(message){
			 //showToast( t('Failed because:') + " " + message);
		},{
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
	    });
		
    } catch(err) {
       alert(err.message);       
    } 
    
};


uploadBanner = function(imageURI){	
	try {
					 
		 showLoader(true,'upload_loader');
		 $(".upload_percent").html( "0%");	     		 
		 
		 var options = new FileUploadOptions();
		 options.fileKey = "file";
		 options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		 options.mimeType = "image/jpeg";
		 	 
		 var params = {};
		 
		 params.merchant_token = getStorage("merchant_token") ;	 		 
		 params.device_id = device_id;
		 params.device_platform = device_platform;
		 params.device_uiid = device_uiid;
		 params.code_version = code_version;
		 
		 params.api_key = merchantapp_config.ApiKey;		 
		 params.lang = getLanguageCode();
		 
		 current_page_id = getCurrentPage();
		 upload_option_name = $("#"+ current_page_id + " .upload_option_name2").val();
		 params.upload_option_name = upload_option_name;
		 
		 upload_next_action = $("#"+ current_page_id + " .upload_next_action2").val();
		 params.next_action = upload_next_action;
		 
		 $upload_type = $("#"+ current_page_id + " .upload_type2").val();
		 params.upload_type = $upload_type;
		 		 		 		 		 
		 options.params = params;	 
		 options.chunkedMode = false;	
		 
		 var headers={'headerParam':'headerValue'};
		 options.headers = headers;
		
		 var ft = new FileTransfer();	 	 	 
		 
		 ft.onprogress = function(progressEvent) {
	     if (progressEvent.lengthComputable) {	     	    
	     	    var loaded_bytes= parseInt(progressEvent.loaded);
	     	    var total_bytes= parseInt(progressEvent.total);
	     	    
	     	    var loaded_percent = (loaded_bytes/total_bytes)*100;	        
	     	    loaded_percent=Math.ceil(loaded_percent);
	     	    	       	        		        		        
		        $(".upload_percent").html( loaded_percent +"%");
		        
		    } else {	    		    	
		        //
		    }
		 };
		 	 
		 ft.upload(imageURI, ajax_url+"/UploadFile", function(result){
		     
		     setTimeout(function(){				
				showLoader(false,'upload_loader');
			 }, 2000);
			 			
			if( result.responseCode=="200" || result.responseCode==200 ){
		    			    
			    $json_response = JSON.parse( result.response );	 			    
			    
			    $curr_page = getCurrentPage(); 
			    			    
			    if($json_response.code==1){
			    	switch($json_response.next_action){
			    		case "list_reload":			    		  
		    			  list_action = $("#"+ current_page_id + " .list_action" ).val();
		    			  processAjax(list_action,'refresh=1','POST',56); 
			    		 break;
			    		 
			    		 case "display_image":			    		  
			    		  $("#" + $curr_page +  " .avatar_wrap .upload_image2").html( '<img src="'+  $json_response.file_url +'" />' );
			    		  
			    		  $field_name = $("#"+ $curr_page + " .upload_option_name2").val();
			    		  $photo='<input type="hidden" name="'+ $field_name +'" value="'+ $json_response.filename +'" class="added_photo2" >';
			    		  
			    		  $("#"+$curr_page +  " .added_photo2").remove();
			    		  $("#"+$curr_page +  " form").append( $photo );
			    		 break;
			    		 
			    	}
			    } else {
			    	showToast( $json_response.msg  , 'danger');
			    }		  
			} else {
				showToast( t("upload error :") + result.responseCode , 'danger');
			}
		    
		 }, function(error){	 	
		 	 $(".progress_wrapper ons-progress-bar").hide();	       	  
		     showToast( t("An error has occurred: Code") + " "+ error.code , 'danger');
		 }, options);
	 
	 } catch(err) {
	 	showLoader(false,'upload_loader'); 
        showToast(err.message,'danger');       
     } 
};

/*END UPLOAD BANNER*/

explode = function(sep,string)
{
	var res=string.split(sep);
	return res;
}

setMapAction = function(){
	$map_action = $(".map_action").val();	
	switch($map_action){
		case "merchant_location":
		 $map_lat = $(".map_lat").val();
		 $map_lng = $(".map_lng").val();
		 if(!empty($map_lat)){
			 $("#info .latitude").val( $map_lat );
			 $("#info .lontitude").val( $map_lng );
		 }
		 popPage();
		break;
	}
	
};

KeepAwake = function(){
	
	try {
		var keep_app_awake = $("input[name=keep_app_awake]:checked").val();
		if(empty(keep_app_awake)){
			keep_app_awake='';
		}	
		
		setStorage("has_set_awake",1);
				
		if(keep_app_awake==1){			
			setStorage("keep_app_awake",1);
			window.plugins.insomnia.keepAwake();			
		} else {
			setStorage("keep_app_awake",'');
			window.plugins.insomnia.allowSleepAgain();			
		}
					
		showToast( t("Setting saved") ,'success' );
		
	} catch(err) {
       showToast(err.message, 'danger');       
    } 
};

displayAppAwake = function(){
	$keep_app_awake = getStorage("keep_app_awake");
	$("#settings .keep_app_awake").attr("checked", $keep_app_awake==1?true:false );
};

setAppAwake = function(){
	try {
		$settings = getMerchantSettings();
		$has_set_awake = getStorage("has_set_awake");		
		if(empty($has_set_awake)){
	       if ( $settings.options.merchantapp_keep_awake==1){	       	   
	       	   setStorage("keep_app_awake",1);	       	   
	       	   window.plugins.insomnia.keepAwake();
	       }
		} else {
		   if($has_set_awake==1){
		   	   window.plugins.insomnia.keepAwake();
		   }
		}
	} catch(err) {
       //showToast(err.message, 'danger');       
    } 
};

handlePushReceive = function(data){
	if(cordova.platformId === "android"){
		$crnt_page = getCurrentPage();		
		if($crnt_page=="homepage"){
			params = 'page_id=push_list&list_type=unread';
    	    processAjax("notificationList",params,'POST','', 'paginate_loader');     	      	  
		}
	} else {
		
	}
};

notifyMediaSounds = function(){
	$agree = getStorage("notify_media_sounds");		
	if(empty($agree)){
		 ons.notification.confirm( t("merchant app plays media sounds when there is new order."),{
			title: t("Turn on your media volume") ,		
			id : "dialog",
			modifier: " ",			
			buttonLabels : [ t("Ok") ]
		}).then(function(input) {					
			setStorage("notify_media_sounds",1);
	   }); 
	} 
};

/*START FIREBASEX  */
initFirebasex = function(){
	try {	
			   
	    window.FirebasePlugin.onMessageReceived(function(data) {
	        try{	         	  	        	
	        	showToast(data.title+"\n"+data.body);	   
	        	handlePushReceive(data);
	        }catch(e){
	            alert("Exception in onMessageReceived callback: "+e.data);
	        }
	
	    }, function(error) {
	        dump("Failed receiving FirebasePlugin message", error);
	    });
	    
	    window.FirebasePlugin.onTokenRefresh(function(token){	        
	        device_id = token;
	        setStorage("device_id", token );	        
	    }, function(error) {
	        dump("Failed to refresh token");
	    });
	    	     	    
	     checkNotificationPermission(false);	
	     	     	     
	     if(cordova.platformId === "android"){
	     	initAndroid();
	     }else if(cordova.platformId === "ios"){
	     	initIos();
	     }
	    
	} catch(err) {
       alert(err.message);       
    } 
};

var initIos = function(){
    window.FirebasePlugin.onApnsTokenReceived(function(token){        
        //
    }, function(error) {
        dump("Failed to receive APNS token");
    });
};

var checkNotificationPermission = function(requested){
    window.FirebasePlugin.hasPermission(function(hasPermission){
        if(hasPermission){            
            getToken();
        }else if(!requested){            
            window.FirebasePlugin.grantPermission(checkNotificationPermission.bind(this, true));
        }else{            
            alert("Notifications won't be shown as permission is denied");
        }
    });
};

var getToken = function(){
    window.FirebasePlugin.getToken(function(token){        
        device_id = token;
        setStorage("device_id", token );        
    }, function(error) {
        dump("Failed to get FCM token");
    });
};

initAndroid = function(){
	var customChannel  = {
		id: "merchantapp_channel",
		name: "merchantapp channel",
		sound: "neworder",
		vibration: [300, 200, 300],
		light: true,
	    lightColor: "0xFF0000FF",
	    importance: 4,
	    badge: true, 
	    visibility: 1
	};
	
	 window.FirebasePlugin.createChannel(customChannel,
        function() {            
            window.FirebasePlugin.listChannels(
                function(channels) {
                    if(typeof channels == "undefined") return;
                    for(var i=0;i<channels.length;i++) {                        
                    }
                },
                function(error) {
                    dump('List channels error: ' + error);
                }
            );
        },
        function(error) {
            showToast("Create channel error", error);
        }
    );    
        
};

function subscribe($topic){
	try {
		
	    window.FirebasePlugin.subscribe($topic, function(){
	        //showToast("Subscribed to topic");
	    },function(error){
	        //showToast("Failed to subscribe to alert", error);
	    });
	    
    } catch(err) {
       dump(err.message);       
    } 
}

function unsubscribe($topic){
	try {
	    window.FirebasePlugin.unsubscribe($topic, function(){
	        //showToast("Unsubscribed from topic");
	    },function(error){
	        //showToast("Failed to unsubscribe from alert", error);
	    });
    } catch(err) {
       dump(err.message);       
    } 
}

/*END FIREBASEX  */


add_addon_row = function(){
	addon_id = $(".addon_select select").val();
		
	$found_addon = $.inArray( addon_id , $item_added_addon );
	if($found_addon>=0){
		showToast( t("Addon Category already exist"), 'danger');
		return;
	}
	
	if(addon_id>0){		
		processAjax( "GetAddonDetails" ,'addon_id='+ addon_id,'POST');    	  
	} else {
		showToast( t("Please select addon"), 'danger');
	}
};

showHideTwoFlavor = function(){	
	var $enabled_two_flavors = $("input[name=two_flavors]:checked").val();	
	$enabled_two_flavors  = $enabled_two_flavors==2?1:0;
	handleTwoFlavor($enabled_two_flavors);
};

handleTwoFlavor = function($enabled){	
	if($enabled==1){
		$(".two_flavor_div").show();
		$(".multi_option select").attr("disabled",true);
		$(".multi_option_value_div").hide();
	} else {
		$(".two_flavor_div").hide();
		$(".multi_option select").attr("disabled",false);		
		$(".multi_option_value_div").show();
	}
};

removeAddonRow = function($object, $category_id){
	try {
		$item_added_addon.splice( $item_added_addon.indexOf($category_id), 1 ); 		
		$object.parent().remove();
	} catch(err) {
       dump(err.message);
    } 
};
