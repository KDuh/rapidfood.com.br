<?php
//if (!isset($_SESSION)) { session_start(); }


class IndexController extends CController
{
	public $layout='layout';
	public $needs_db_update=false;
		
	public function init()
	{
		FunctionsV3::handleLanguage();
		$lang=Yii::app()->language;				
		$cs = Yii::app()->getClientScript();
		$cs->registerScript(
		  'lang',
		  "var lang='$lang';",
		  CClientScript::POS_HEAD
		);
		
	   $table_translation=array(
	      "tablet_1"=>SingleAppClass::t("No data available in table"),
    	  "tablet_2"=>SingleAppClass::t("Showing _START_ to _END_ of _TOTAL_ entries"),
    	  "tablet_3"=>SingleAppClass::t("Showing 0 to 0 of 0 entries"),
    	  "tablet_4"=>SingleAppClass::t("(filtered from _MAX_ total entries)"),
    	  "tablet_5"=>SingleAppClass::t("Show _MENU_ entries"),
    	  "tablet_6"=>SingleAppClass::t("Loading..."),
    	  "tablet_7"=>SingleAppClass::t("Processing..."),
    	  "tablet_8"=>SingleAppClass::t("Search:"),
    	  "tablet_9"=>SingleAppClass::t("No matching records found"),
    	  "tablet_10"=>SingleAppClass::t("First"),
    	  "tablet_11"=>SingleAppClass::t("Last"),
    	  "tablet_12"=>SingleAppClass::t("Next"),
    	  "tablet_13"=>SingleAppClass::t("Previous"),
    	  "tablet_14"=>SingleAppClass::t(": activate to sort column ascending"),
    	  "tablet_15"=>SingleAppClass::t(": activate to sort column descending"),
    	  'are_you_sure'=>SingleAppClass::t("Are you sure"),
    	  'invalid_file_extension'=>SingleAppClass::t("Invalid File extension"),
    	  'invalid_file_size'=>SingleAppClass::t("Invalid File size"),
    	  'failed'=>SingleAppClass::t("Failed"),
	   );	
	   $js_translation=json_encode($table_translation);
		
	   $cs->registerScript(
		  'js_translation',
		  "var js_translation=$js_translation;",
		  CClientScript::POS_HEAD
		);	
	   	
	}	
	
    public function beforeAction($action)
	{				
		
		if(!Yii::app()->functions->isAdminLogin()){
			$this->redirect(Yii::app()->createUrl('/admin/noaccess'));
			Yii::app()->end();		
		}
		
		/*CHECK DATABASE*/
	    $new=0;
	    
	    if( !FunctionsV3::checkIfTableExist('singleapp_cart')){
	        $this->redirect(Yii::app()->createUrl('/singlemerchant/update'));
			Yii::app()->end();
	    }
	    	    
	    $new_fields=array('delivery_lat'=>"delivery_lat");
		if ( !FunctionsV3::checkTableFields('singleapp_cart',$new_fields)){			
			$new++;
		}
		
		/*2.0*/
		$new_fields=array('is_read'=>"is_read");
		if ( !FunctionsV3::checkTableFields('singleapp_mobile_push_logs',$new_fields)){			
			$new++;
		}
		
		if( !FunctionsV3::checkIfTableExist('singleapp_broadcast')){
			$new++;
		}	
		if( !FunctionsV3::checkIfTableExist('singleapp_pages')){
			$new++;
		}	
		
		
		/*2.1*/
		$new_fields=array('single_app_merchant_id'=>"single_app_merchant_id");
		if ( !FunctionsV3::checkTableFields('client',$new_fields)){			
			$new++;
		}
		if( !FunctionsV3::checkIfTableExist('singleapp_recent_location')){
			$new++;
		}			
		
		/*2.2*/
		$new_fields=array('latitude'=>"latitude");
		if ( !FunctionsV3::checkTableFields('address_book',$new_fields)){			
			$new++;
		}
		
		if($new>0){
			$this->redirect(Yii::app()->createUrl('/singlemerchant/update'));
			Yii::app()->end();
		}
	    
		
		return true;
	}	
	
	public function actionIndex(){			
		$this->redirect(Yii::app()->createUrl('/'.SingleAppClass::moduleName().'/index/settings'));
	}		
	
	public function actionsettings()
	{				
		$this->pageTitle = st("Merchant List");
		
		$this->render('merchant-list',array(		
		  'modulename' => SingleAppClass::moduleName(),			  		  
		));  
	}
	
	public function actiondevice()
	{
		$this->pageTitle = st("Device List");
		
		$this->render('device_list',array(		
		  'modulename' => SingleAppClass::moduleName(),		  
		));  
	}
	
	public function actionpush_logs()
	{
		$this->pageTitle = st("Push Logs");
		$this->render('push_logs',array(		
		  'modulename' => SingleAppClass::moduleName(),		  
		));  
	}
	
	public function actionsend_push()
	{		
		$client_id = isset($_GET['id'])?$_GET['id']:'';		
		
		$this->pageTitle = st("Send Push [id]",array(
		 'id'=>$client_id
		));
		
		if($client_id>0){	
			if ($data = Yii::app()->functions->getClientInfo($client_id)){
				
				$this->pageTitle = st("Send Push to [first_name]",array(
		           'first_name'=>$data['first_name']
		        ));
				
				$this->render('send_push',array(		
				  'modulename' => SingleAppClass::moduleName(),			  				  
				  'data'=>$data
				));  
			} else $this->render('error',array(
			  'message'=>SingleAppClass::t("Client id not found")
		    ));
		} else $this->render('error',array(
			  'message'=>SingleAppClass::t("invalid client id")
		    ));
	}
	
	public function actioncron_jobs()
	{
		$this->render('cron_jobs',array(		
		  'modulename' => SingleAppClass::moduleName(),			  			  
		));  
	}
	
	public function actionmerchant_settings()
	{		
		$p = new CHtmlPurifier();
		$merchant_id = isset($_GET['merchant_id'])?$_GET['merchant_id']:'';		
		
		$this->pageTitle = st("Merchant [id]",array(
		 'id'=>$merchant_id
		));
		
		if($merchant_id>0){
			if($merchant_info = FunctionsV3::getMerchantInfo($merchant_id)){
				
				$this->pageTitle = st("Merchant [merchant_name]",array(
				 'merchant_name'=>$p->purify( clearString($merchant_info['restaurant_name']) )
				));
				
				$this->render('settings-merchant',array(
				  'merchant_id'=>$merchant_id,
				  'merchant_info'=>$merchant_info,
				  'modulename' => SingleAppClass::moduleName(),	
				  'single_app_keys'=>$merchant_info['single_app_keys']
				));
			} else $this->render('error',array(
			  'message'=>SingleAppClass::t("merchant information not found")
			));
		} else {
			$this->render('error',array(
			  'message'=>SingleAppClass::t("Invalid merchant id")
			));
		}
	}
	
	public function actionpush_broadcast()
	{
		$this->pageTitle = st("Broadcast");
		$this->render('push_broadcast_list',array(		
		  'modulename' => SingleAppClass::moduleName(),		  
		));  
	}
	
	public function actionbroadcast_new()
	{
		$this->pageTitle = st("Broadcast New");
		$this->render('push_broadcast_new',array(		
		   'merchant_list'=>SingleAppClass::getMerchantList()
		));  
	}
	
	public function actionbroadcast_details()
	{
		$broadcast_id = isset($_GET['id'])?$_GET['id']:'';	
		
		$this->pageTitle = st("Broadcast details [id]",array(
		  'id'=>$broadcast_id
		));
			
		$this->render('push_broadcast_details',array(		
		  'modulename' => SingleAppClass::moduleName(),	
		  'broadcast_id'=>$broadcast_id
		));  
	}
	
	public function actionpages_new()
	{
		$data = array();
		$merchant_id = isset($_GET['merchant_id'])?$_GET['merchant_id']:'';		
		$page_id = isset($_GET['id'])?$_GET['id']:'';		
		if($page_id>0){
			$data = SingleAppClass::getPagesByID($page_id);
		}		
		if($merchant_info = FunctionsV3::getMerchantInfo($merchant_id)){					
			$this->render('pages_new',array(		
			  'modulename' => SingleAppClass::moduleName(),	
			  'merchant_id'=>$merchant_id,
			  'data'=>$data,
			  'merchant_info'=>$merchant_info
			));  
		} else {
			$this->render('error',array(					  
			  'message'=>SingleAppClass::t("invalid merchant id")
			));  
		}
	}
	
	public function actionothers()
	{
		$this->pageTitle = st("Others");
		
		$cron[] = array(
		  'link'=>FunctionsV3::getHostURL().Yii::app()->createUrl(APP_FOLDER."/cron/processpush"),
		  'notes'=>st("run this every minute")
		);
		$cron[] = array(
		  'link'=>FunctionsV3::getHostURL().Yii::app()->createUrl(APP_FOLDER."/cron/processbroadcast"),
		  'notes'=>st("run this every 2 minute")
		);
		
		$update_db = FunctionsV3::getHostURL().Yii::app()->createUrl(APP_FOLDER."/update");
		
		$this->render('others',array(
		  'cron'=>$cron,
		  'cron_sample'=>$cron[0]['link'],
		  'update_db'=>$update_db
		));
	}
	
	public function actiontest_api()
	{
		$data  = $_GET;
		$merchant_id = isset($data['merchant_id'])?$data['merchant_id']:'';
		if($res = FunctionsV3::getMerchantById($merchant_id)){
			$single_app_keys = $res['single_app_keys'];	
			
			$api_settings = websiteUrl()."/".APP_FOLDER."/api/getAppSettings";
			if(!empty($single_app_keys)){
				$api_settings.="/?merchant_keys=".urlencode($single_app_keys);
			}				
			$this->redirect($api_settings);			
		} else echo st("Merchant information not found");				
	}
	
} /*end class*/