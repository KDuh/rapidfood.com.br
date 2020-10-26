jQuery.fn.exists = function(){return this.length>0;}

var data_table;
var ajax_request;

function dump(data)
{
	console.debug(data);
}


function busy(e)
{
    if (e) {
        $('body').css('cursor', 'wait');	
    } else $('body').css('cursor', 'auto');        
        
    if(e){		
		$(".content_wrap").loading({
			message : translator.get("loading"),
			zIndex: 999999999,
		});
	} else {
		$(".content_wrap").loading('stop');
	}
    
}

loader = function(e){
	busy(e);
};


notify = function(message,alert_type){
	nAlert(message,alert_type);
};

function nAlert(message,alert_type)
{
	if(empty(alert_type)){
		alert_type='success';
	}
	
	notify_icon = '';
	
	switch(alert_type)
	{
		case "success":
		notify_icon = 'fa fa-check-circle';
		break;
		
		case "danger":
		notify_icon = 'fa fa-bell-o';
		break;
	}
	
	$.notify({		
		icon: notify_icon ,
		message: message,		
	},{
		type: alert_type ,		
		placement: {
		  from: "top",
		  align: "center"
	    },
	    animate:{
			enter: "animated fadeInUp",
			exit: "animated fadeOutDown"
		},
		delay : 1000*notify_delay,
		showProgressbar : true,		
		z_index: 9999999,
	});
}

jQuery(document).ready(function() {
	
	 translator = $('body').translate({lang: lang , t: dict}); 	
	 
	 $('.menu_nav a').webuiPopover({
		trigger:'hover',
		placement:'right'
	});	
	  
	 $( document ).on( "click", ".generate_keys", function() {
	 	callAjax('generateKeys','');
	 });
	 
	 $( document ).on( "click", ".remove_default_image", function() {
	 	$("#singleapp_default_image").val('');
	 	$(".my-thumb").attr("src",'');
	 	$(this).remove();
	 });
	 	 
	 $( document ).on( "click", ".remove_icon", function() {
	 	data = $(this).data("id");
	 	dump(data);
	 	switch (data){
	 		case "push_icon":
	 		  $(".upload_push_icon").addClass("hide");
	 		  $("#singleapp_push_icon").val('');
	 		break;
	 		
	 		case "push_picture":
	 		  $(".upload_push_picture").addClass("hide");
	 		  $("#singleapp_push_picture").val('');
	 		break;
	 	}
	 	$(this).hide();
	 });
	 
	  if ( $("#upload-file").exists()) {
	   var uploader = new ss.SimpleUpload({
	       button: 'upload-file', // HTML element used as upload button
	       url: ajaxurl+"/upload", // URL of server-side upload handler
	       name: 'uploadfile', // Parameter name of the uploaded file
	       responseType: 'json',
	       allowedExtensions: ['png', 'jpeg','jpg'],
		   maxSize: 11024, // kilobytes
		   onExtError: function(filename,extension ){
			   nAlert( js_translation.invalid_file_extension ,"warning");
		   },
		   onSizeError: function (filename,fileSize){ 
			   nAlert( js_translation.invalid_file_size ,"warning");  
		   },       
		   onSubmit: function(filename, extension) {      	            
		   	  busy(true);
		   },	
		   onComplete: function(filename, response) {	   	  
		   	  dump(response);
		   	  busy(false);
		   	  if (response.code==1){	   	  	 	   	  	 
		   	  	 nAlert(response.msg,"success");
		   	  	 $("#singleapp_default_image").val(response.details.file_name);
		   	  	 $(".my-thumb").attr("src",response.details.file_url);
		   	  } else {
		   	  	 nAlert(response.msg,"warning");	   	  	 
		   	  }
		   }
	    });    
   }
   
	if ( $("#upload-push-icon").exists()) {
	   var uploader = new ss.SimpleUpload({
	       button: 'upload-push-icon', // HTML element used as upload button
	       url: ajaxurl+"/upload", // URL of server-side upload handler
	       name: 'uploadfile', // Parameter name of the uploaded file
	       responseType: 'json',
	       allowedExtensions: ['png', 'jpeg','jpg'],
		   maxSize: 11024, // kilobytes
		   onExtError: function(filename,extension ){
			   nAlert( js_translation.invalid_file_extension ,"warning");
		   },
		   onSizeError: function (filename,fileSize){ 
			   nAlert( js_translation.invalid_file_size ,"warning");  
		   },       
		   onSubmit: function(filename, extension) {      	            
		   	  busy(true);
		   },	
		   onComplete: function(filename, response) {	   	  
		   	  dump(response);
		   	  busy(false);
		   	  if (response.code==1){	   	  	 	   	  	 
		   	  	 nAlert(response.msg,"success");
		   	  	 /*
		   	  	 $(".upload_push_icon").attr("src",response.details.file_url);
		   	  	 $(".upload_push_icon").removeClass("hide")*/
		   	  	 
		   	  	 $("#singleapp_push_icon").val(response.details.file_name);
		   	  	 
		   	  	 html='';
		   	  	 html+='<div class="card preview_multi_upload" style="width: 10rem;">';
					html+='<img class="img-thumbnail" src="'+ response.details.file_url +'" >';	
					html+='<div class="card-body">';
					  html+='<a href="javascript:;" data-id="singleapp_push_icon"	';
				      html+='class="card-link remove_push_image">'+  t("Remove Image") +'</a>';
					html+='</div>';
				 html+='</div>';
		   	  	 
				 $(".singleapp_push_icon_preview").html(html);
				 
		   	  } else {
		   	  	 nAlert(response.msg,"warning");	   	  	 
		   	  }
		   }
	    });    
   }   
   
 if ( $("#upload-push-picture").exists()) {
	   var uploader = new ss.SimpleUpload({
	       button: 'upload-push-picture', // HTML element used as upload button
	       url: ajaxurl+"/upload", // URL of server-side upload handler
	       name: 'uploadfile', // Parameter name of the uploaded file
	       responseType: 'json',
	       allowedExtensions: ['png', 'jpeg','jpg'],
		   maxSize: 11024, // kilobytes
		   onExtError: function(filename,extension ){
			   nAlert( js_translation.invalid_file_extension ,"warning");
		   },
		   onSizeError: function (filename,fileSize){ 
			   nAlert( js_translation.invalid_file_size ,"warning");  
		   },       
		   onSubmit: function(filename, extension) {      	            
		   	  busy(true);
		   },	
		   onComplete: function(filename, response) {	   	  
		   	  dump(response);
		   	  busy(false);
		   	  if (response.code==1){	   	  	 	   	  	 
		   	  	 nAlert(response.msg,"success");
		   	  	 /*
		   	  	 $(".upload_push_picture").attr("src",response.details.file_url);
		   	  	 $(".upload_push_picture").removeClass("hide")*/
		   	  	 
		   	  	 $("#singleapp_push_picture").val(response.details.file_name);
		   	  	 
		   	  	 html='';
		   	  	 html+='<div class="card preview_multi_upload" style="width: 10rem;">';
					html+='<img class="img-thumbnail" src="'+ response.details.file_url +'" >';	
					html+='<div class="card-body">';
					  html+='<a href="javascript:;" data-id="singleapp_push_picture"	';
				      html+='class="card-link remove_push_image">'+  t("Remove Image") +'</a>';
					html+='</div>';
				 html+='</div>';
		   	  	 
				 $(".singleapp_push_picture_preview").html(html);
				 
		   	  } else {
		   	  	 nAlert(response.msg,"warning");	   	  	 
		   	  }
		   }
	    });    
   }   
   
   
   if ( $("#upload-certificate-dev").exists()) {
	   var uploader = new ss.SimpleUpload({
	       button: 'upload-certificate-dev', // HTML element used as upload button
	       url: ajaxurl+"/uploadCertificate", // URL of server-side upload handler
	       name: 'uploadfile', // Parameter name of the uploaded file
	       responseType: 'json',
	       allowedExtensions: ['pem'],
		   maxSize: 11024, // kilobytes
		   onExtError: function(filename,extension ){
			   nAlert( js_translation.invalid_file_extension ,"warning");
		   },
		   onSizeError: function (filename,fileSize){ 
			   nAlert( js_translation.invalid_file_size ,"warning");  
		   },       
		   onSubmit: function(filename, extension) {      	            
		   	  busy(true);
		   },	
		   onComplete: function(filename, response) {	   	  
		   	  dump(response);
		   	  busy(false);
		   	  if (response.code==1){	   	  	 	   	  	 
		   	  	 nAlert(response.msg,"success");
		   	  	 $("#singleapp_ios_push_dev_cer").val(response.details.file_name);
		   	  } else {
		   	  	 nAlert(response.msg,"warning");	   	  	 
		   	  }
		   }
	    });    
   }	
   
   if ( $("#upload-certificate-prod").exists()) {
	   var uploader = new ss.SimpleUpload({
	       button: 'upload-certificate-prod', // HTML element used as upload button
	       url: ajaxurl+"/uploadCertificate", // URL of server-side upload handler
	       name: 'uploadfile', // Parameter name of the uploaded file
	       responseType: 'json',
	       allowedExtensions: ['pem'],
		   maxSize: 11024, // kilobytes
		   onExtError: function(filename,extension ){
			   nAlert( js_translation.invalid_file_extension ,"warning");
		   },
		   onSizeError: function (filename,fileSize){ 
			   nAlert( js_translation.invalid_file_size ,"warning");  
		   },       
		   onSubmit: function(filename, extension) {      	            
		   	  busy(true);
		   },	
		   onComplete: function(filename, response) {	   	  
		   	  dump(response);
		   	  busy(false);
		   	  if (response.code==1){	   	  	 	   	  	 
		   	  	 nAlert(response.msg,"success");
		   	  	 $("#singleapp_ios_push_prod_cer").val(response.details.file_name);		   	  	 
		   	  } else {
		   	  	 nAlert(response.msg,"warning");	   	  	 
		   	  }
		   }
	    });    
   }	
      
   if ( $("#table_list").exists() ) {
       initTable();
   }
	
});
/*end ready*/

/*mycall*/
function callAjax(action, data, method)
{
	if(empty(method)){
		method="GET";
	} else if(method=="POST"){
		data+=addValidationRequest();		
	}
	
	var ajax_uri = ajaxurl+"/"+action;	
	var ajax_request = $.ajax({
	  url: ajax_uri,
	  method: method ,
	  data: data ,
	  dataType: "json",
	  timeout: 30000,
	  crossDomain: true,
	  beforeSend: function( xhr ) {       
         if(ajax_request != null) {	
         	ajax_request.abort();            
         } else {         	
         	busy(true);         	         
         }
      }
    });
    
    ajax_request.done(function( data ) {
    	dump("done ajax");
    	dump(data);
    	if ( data.code==1){
    		switch (action)
    		{
    			case "generateKeys":
    			  $("#single_app_keys").val( data.details );
    			  $(".merchant_keys").html( data.details );
    			break;
    			
    			case "deletePages":    			
    			  $('.data_tables').DataTable().ajax.reload();
    			break;
    			
    			case "save_page":
    			  $('.data_tables').DataTable().ajax.reload();
    			  nAlert(data.msg,"success")
    			  $('#pageNewModal').modal('hide');   
    			break;
    			
    			case "get_page":
    			  datas = data.details.data;    			  
    			  $("#page_id").val(datas.page_id);
    			  $("#title").val(datas.title);
    			  $("#content").val(datas.content);
    			  $("#icon").val(datas.icon);
    			  $("#sequence").val(datas.sequence);
    			  $("#status").val(datas.status);
    			      			 
    			  if(datas.use_html==1){      			  	
    			  	$("#use_html").prop( "checked", true );
    			  } else {
    			  	 $("#use_html").prop( "checked", false );
    			  }   			  
    			  
    			  lang_list = data.details.lang;  
    			  if(lang_list.length>0){
    			  	 $.each(lang_list, function(key, val){
    			  	 	 field_name1 = "title_"+val;
    			  	 	 field_name2 = "content_"+val;     			  	 	 
    			  	 	 $("#"+ field_name1 ).val( datas[field_name1] );
    			  	 	 $("#"+ field_name2 ).val( datas[field_name2] );
    			  	 });
    			  }
    			      			  
    			break;
    			
    			case "saveBroadcast":
    			  clear_forms("#frm_ajax");
    			  $(".chosen").val('').trigger("chosen:updated");
    			  nAlert(data.msg,"success");
    			break;

    			case "sendpush":   			
    			  clear_forms("#frm_ajax");    			  
    			  nAlert(data.msg,"success");
    			break;
    			
    			default:
    			  nAlert(data.msg,"success")
    			break;
    		}
    	} else {
    		//failed
    		nAlert(data.msg,"success");
    	}
    });
	
    ajax_request.always(function() {
    	busy(false);
        dump("ajax always");
        ajax_request=null;          
    });
          
    /*FAIL*/
    ajax_request.fail(function( jqXHR, textStatus ) {    	
    	busy(false);
    	nAlert( jslang.failed + ": " + textStatus , 'warning' );        
    });     
}

t = function(words){
	return translator.get(words);
};	

function initTable()
{		
	var params=$("#frm_table").serialize();	
		
	data_table = $('#table_list').dataTable({		
		   "iDisplayLength": 20,
	       "bProcessing": true, 	       
	       "bServerSide": true,	       
	       "sAjaxSource": ajaxurl+"/"+ $("#action").val()+"/?currentController=admin&"+params,	       
	       "aaSorting": [[ 0, "DESC" ]],	       
           "sPaginationType": "full_numbers",                 
           "bLengthChange": false,
	       "language":{	   
	       	  url: ajaxurl+"/datable_localize"    	 	       	 	       	  
	       },	       
	       "fnInitComplete": function(oSettings, json) {	       	  		      
		   }		
	});
	   		
}

/*VERSION 1.1*/
jQuery(document).ready(function() {
	
	$('.numeric_only').keyup(function () {     
      this.value = this.value.replace(/[^0-9\.]/g,'');
    });	
	
    if ( $("#upload-banner").exists()) {
	   var uploader = new ss.SimpleUpload({
	       button: 'upload-banner', // HTML element used as upload button
	       url: ajaxurl+"/upload", // URL of server-side upload handler
	       name: 'uploadfile', // Parameter name of the uploaded file
	       multipleSelect: true, 	
		   multipart: true,
           multiple: true,
	       responseType: 'json',
	       allowedExtensions: ['png', 'jpeg','jpg'],
		   maxSize: 11024, // kilobytes
		   onExtError: function(filename,extension ){
			   nAlert( js_translation.invalid_file_extension ,"warning");
		   },
		   onSizeError: function (filename,fileSize){ 
			   nAlert( js_translation.invalid_file_size ,"warning");  
		   },       
		   onSubmit: function(filename, extension) {      	            
		   	  busy(true);
		   },	
		   onComplete: function(filename, response) {	   	  
		   	  dump(response);
		   	  busy(false);
		   	  if (response.code==1){	   	  	 	   	  	 
		   	  	 nAlert(response.msg,"success");
		   	  	 
		   	  	 html='';
		   	  	 html+='<div class="card preview_multi_upload" style="width: 10rem;">';
					html+='<img class="img-thumbnail" src="'+ response.details.file_url +'" >';
					
					html+='<div class="card-body">';
					  html+='<a href="javascript:;" data-id="uploadpushpicture" ';
					  html+='data-fieldname="android_push_picture" ';
					  html+='class="card-link multi_remove_picture">'+ t("Remove Image") +'</a>';
					html+='</div>';
					
					html+='<input type="hidden" name="banner[]" value="'+ response.details.file_name +'">';
				 html+='</div>';
		   	  	 
		   	  	 $(".banner_preview").append(html);
		   	  	 
		   	  } else {
		   	  	 nAlert(response.msg,"warning");	   	  	 
		   	  }
		   }
	    });    
   }   
   
   if( $('#sortable1').exists() ) {  
     $( "#sortable1" ).sortable();
     $( "#sortable3" ).sortable();
   }
   
   
   $( document ).on( "click", ".rm_banner", function() {
   	  $(this).parent().remove();
   });
    
});
/*END VERSION 1.1*/


function addValidationRequest()
{
	var params='';		
	params+="&YII_CSRF_TOKEN="+YII_CSRF_TOKEN;
	return params;
}

jQuery(document).ready(function() {	
	$( document ).on( "click", ".paynow_stripe", function() {			
		showPreloader(true);					
		stripe.redirectToCheckout({		  
		  sessionId: stripe_session,
		}).then(function (result) {
			showPreloader(true);		    
		    nAlert(result.error.message,"warning");	   	  	 
		});		
	});
	
    $( document ).on( "click", ".delete-pages", function() {		    	
    	var a = confirm( js_translation.are_you_sure );
    	if(a){	    	
    		
    		params =  "page_id=" + $(this).data('id');
    		params+= addValidationRequest();
    		callAjax("deletePages",params);
    	}	  		
	});	
	
	$('.nav-tabs a').click(function (e) {
	  e.preventDefault()
	  $(this).tab('show')
    });
    
    $( document ).on( "click", ".refresh_datatables", function() {			
		$('.data_tables').DataTable().ajax.reload();
	});		
	
	$( document ).on( "click", ".copy_text", function() {
		$(this).focus();
		$(this).select();
		document.execCommand('copy');
		nAlert( t("copy to clipboard") );			
	});
	
	if( $('.chosen').exists() ) {     
       $(".chosen").chosen({
       	  allow_single_deselect:true,
       	  no_results_text: t("No results match"),
          placeholder_text_single: t("Select Some Options"), 
          placeholder_text_multiple: t("Select Some Options")
       }); 	
    } 
	
    if( $("#multi_upload").exists() ){
    	init_multi_upload('multi_upload','singleapp_startup_banner');
    }
    
    $( document ).on( "click", ".multi_remove_picture", function() {
    	ans = confirm( t("Are you sure?") );
    	if(ans){
			parent = $(this).parent().parent();
			parent.remove();
		}
    });	
    
     $( document ).on( "click", ".remove_push_image", function() {
    	ans = confirm( t("Are you sure?") );
    	field_name = $(this).data("id");    	  
    	if(ans){
    		$("#"+field_name).val('');
			parent = $(this).parent().parent();
			parent.remove();
		}
    });	
    
});
/*end docu*/

function showPreloader(busy)
{
	if(busy){
	   $(".main-preloader").show(); 
	} else {
	   $(".main-preloader").hide(); 
	}
}

function empty(data)
{
	if (typeof data === "undefined" || data==null || data=="" ) { 
		return true;
	}
	return false;
}


init_multi_upload = function(id,field_name){
	
	uploader = new ss.SimpleUpload({
		 button: id ,
		 url: ajaxurl + "/uploadFile/?id="+id +"&field_name="+field_name ,		 
		 name: 'uploadfile',			 	
		 multipleSelect: true, 	
		 multipart: true,
         multiple: true,
		 responseType: 'json',			 
		 allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],			 
		 maxSize: image_limit_size,
		 onExtError: function(filename,extension ){
		 	loader(false);
		    notify(  translator.get("invalid_file_extension") ,'danger');
	     },
	     onSizeError: function (filename,fileSize){ 
	     	loader(false);
		    notify(  translator.get("invalid_file_size") ,'danger');
	     },    
		 onSubmit: function(filename, extension) {				 			 	
		 	loader(true);
		 },
		 onComplete: function(filename, response) {			 	 
		 	 loader(false);
		 	 //$(".preview_"+id).remove();
		 	 
		 	 if(response.code==1){		 	 	
		 	 	//alert(response.details.file_name);		 	 	
		 	 	parent = $("#"+id).parent();		 	 			 	 			 	 	
		 	 	parent.after( response.details.html_preview );
		 	 } else {
		 	 	notify(response.msg,'danger');
		 	 }
		 }
	});
	
};

clear_forms = function(ele) {	
    $(ele).find(':input').each(function() {						    	
        switch(this.type) {
            case 'password':            
            case 'text':
            case 'textarea':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;            
            
        }
   });   
}

jQuery(document).ready(function() {
	
	$('#broadcastNewModal,#pageNewModal,#sendPushModal').on('show.bs.modal', function (e) {
   		dump('show.bs.modal');
   		
   		$("#page_id").val('');
   		
   		clear_forms("#frm_ajax");
   		var validator = $( "#frm_ajax" ).validate();
        validator.resetForm();        
   	});   	
   	
   	$("#frm_ajax").validate({
   	    submitHandler: function(form) {
   	    	 action = $("#frm_ajax").data("action");
   	    	 callAjax( action , $("#frm_ajax").serialize() , 'POST' );
		}
   	});
   	
   	$( document ).on( "click", ".delete_page", function() {
   		page_id = $(this).data("page_id");
   		ans = confirm( t("Are you sure?") );
   		if(ans){
   			callAjax("deletePages","page_id="+ page_id  );
   		}
   	});
   	
   	$( document ).on( "click", ".edit_page", function() {
   		page_id = $(this).data("page_id");   		
   		$('#pageNewModal').modal('show');   		
   		setTimeout(function(){ 
   			callAjax('get_page', "page_id="+ page_id ,'POST'  );
   		}, 100);
   	});
	
});/* end docu*/
	