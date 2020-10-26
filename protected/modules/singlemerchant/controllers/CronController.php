<?php
class CronController extends CController
{
	
	public function __construct()
	{
		Yii::app()->setImport(array(			
		  'application.components.*',
		));		
		require_once 'Functions.php';
	}
	
	public function actionIndex()
	{
		echo 'cron is working';
	}
	
	public function actionprocesspush()
	{
		$db = new DbExt();
		$process_date = FunctionsV3::dateNow();		
		$stmt="
		SELECT * FROM
		{{singleapp_mobile_push_logs}}
		WHERE status='pending'		
		ORDER BY id ASC		
		LIMIT 0,10	
		";
		if ($res = $db->rst($stmt)){
			
			foreach ($res as $val) {
				
			   $process_status=''; $json_response='';
			   $device_id = $val['device_id'];
			   
			   $server_key = Yii::app()->functions->getOption('singleapp_android_push_key',$val['merchant_id']);
			   $singleapp_push_icon = Yii::app()->functions->getOption('singleapp_push_icon',$val['merchant_id']);			   
			   $singleapp_enabled_pushpic = Yii::app()->functions->getOption('singleapp_enabled_pushpic',$val['merchant_id']);
			   $singleapp_push_picture = Yii::app()->functions->getOption('singleapp_push_picture',$val['merchant_id']);
			   			   
			   switch (strtolower($val['device_platform'])) {
			   	   
					case "android":
						$data = array(
						  'title'=>$val['push_title'],
						  'body'=>$val['push_message'],
						  'vibrate'	=> 1,			
			              'soundname'=> 'beep',
			              'android_channel_id'=>"kmrs_singleapp",
			              'content-available'=>1,
			              'count'=>1,			              
			              'badge'=>1,
			              'push_type'=>$val['push_type']
						 );
						 
						 if(!empty($singleapp_push_icon)){
						 	$data['image'] = SingleAppClass::getImage($singleapp_push_icon);
						 }
						 if($singleapp_enabled_pushpic==1){
						 	$data['style'] ="picture";
						 	$data['picture'] = SingleAppClass::getImage($singleapp_push_picture);
						 }
						 						 						 												
						 if(!empty($server_key)){
							 try {
							 	$json_response = fcmPush::pushAndroid($data,$device_id,$server_key);						 	
							 	$process_status='process';
							 } catch (Exception $e) {
				                $process_status = 'Caught exception:'. $e->getMessage();
			                 }
						 } else $process_status = 'server key is empty';
		                 						 
						break;						
										
					case "ios":
						
						try {
							 $data = array( 
						      'title' =>$val['push_title'],
						      'body' => $val['push_message'],
						      'sound'=>'beep.wav',
						      'android_channel_id'=>"kmrs_singleapp",
						      'badge'=>1,
						      'content-available'=>1,
						      'push_type'=>$val['push_type']
						    );						   
							$json_response = fcmPush::pushIOS($data,$device_id,$server_key);
							$process_status='process';							
						} catch (Exception $e) {
							$process_status =  $e->getMessage();
						}		
										
					    break;
					    
					default:
						$process_status='undefined device platform'; 
						break;
				} /*END SWITCH*/

				
                if(!empty($process_status)){
		   	  	   $process_status=substr( strip_tags($process_status) ,0,255);
		   	    } 											   	    
				$params = array(
				  'status'=>$process_status,
				  'date_process'=>$process_date,
				  'json_response'=>json_encode($json_response)
				);
				$db->updateData("{{singleapp_mobile_push_logs}}",$params,'id',$val['id']);
				
			} /*END FOREACH*/			
		}
	}
		
	public function actionTest()
	{
		$server_key = 'AAAABe2y7Ao:APA91bGDwN-bqr8lpQG-J8xv_mNqvhoVfIucIcB9JdRs0LK63zbGf40pD_JSx0H1ryFt8Ub1LmhhobZCNXvYZnH9KTWb1w1nTQeJQhFtTZXKMf0BHq6Ty_owzUr8xgXju9VRDDk8hwno';
		$device_id = 'cXB_VZnRsTQ:APA91bEadwTVGnu4XtsMGqGkHlHRkk0KiAKpTb0fgumV4BcAtdo6YO-6b1CdVxPgbN8SciMJ3Aq-CvXE79BkhjylvxuFZ4KFNO9QkIZsc4x9EnjPg9UpP__56BkJZPkG810ET9SEDmor';		

		try {
			 $data = array( 
		      'title' =>"this is ios test".time() , 
		      'body' => "this is body".time(),
		      'sound'=>'beep.wav',
		      'badge'=>1,
		      'content-available'=>1,
		      'push_type'=>'order'
		    );
		    dump($data);
			$json_response = fcmPush::pushIOS($data,$device_id,$server_key);
			dump($json_response);
		} catch (Exception $e) {
			echo $e->getMessage();
		}
	}
	
	public function actionProcessBroadcast()
	{
		$DbExt=new DbExt; 
	    $stmt="
	    SELECT * FROM
	    {{singleapp_broadcast}}
	    WHERE
	    status='pending'
	    ORDER BY broadcast_id ASC
	    LIMIT 0,1	    
	    ";
	    if ( $res=$DbExt->rst($stmt)){
	    	$res=$res[0];	    		    	
	    		    	
	    	$broadcast_id=$res['broadcast_id'];	    		    
	    	
	    	$and='';
	    	switch ($res['device_platform']) {
	    		case "android":	    				    		    
	    		    $and=" AND device_platform IN ('Android','android') ";
	    			break;
	    	
	    		case "ios":		    		   
	    		   $and=" AND device_platform IN ('ios','iOS') ";
	    		   break;  
	    		   
	    		default:
	    			break;
	    	}
	    	
	    	$merchant_list = !empty($res['merchant_list'])?json_decode($res['merchant_list'],true):false;
	    	if(is_array($merchant_list) && count($merchant_list)>=1){
	    		$in_merchant ='';
	    		foreach ($merchant_list as $mtid) {
	    			$in_merchant.=FunctionsV3::q($mtid).",";
	    		}
	    		$in_merchant = substr($in_merchant,0,-1);
	    		$and.="
	    		AND single_app_merchant_id IN ($in_merchant)
	    		";
	    	}
	    	
	    	$and.=" 
	    	  AND client_id NOT IN (
	    	  select client_id from {{singleapp_mobile_push_logs}}
	    	  where client_id=a.client_id
	    	  and broadcast_id=".FunctionsV3::q($broadcast_id)."
	    	)
	    	";
	    	
	    	$stmt2="
	    	SELECT a.* FROM
	    	{{client}} a
	    	WHERE
	    	enabled_push='1'
	    	AND status in ('active')
	    	AND device_id !='' 
	    	$and   	
	    	LIMIT 0,50
	    	";
	    	
	    	if ($res2=$DbExt->rst($stmt2)){	    		
	    		foreach ($res2 as $val) {	    			
	    			$params=array(
	    			  'client_id'=>$val['client_id'],
	    			  'client_name'=>!empty($val['first_name'])?$val['first_name']." ".$val['last_name']:'no name',
	    			  'device_platform'=>$val['device_platform'],
	    			  'device_id'=>$val['device_id'],
	    			  'push_title'=>$res['push_title'],
	    			  'push_message'=>$res['push_message'],
	    			  'push_type'=>'campaign',
	    			  'date_created'=>FunctionsV3::dateNow(),
	    			  'ip_address'=>$_SERVER['REMOTE_ADDR'],
	    			  'broadcast_id'=>$res['broadcast_id'],
	    			  'merchant_id'=>$val['single_app_merchant_id']
	    			);
	    			if(isset($_GET['debug'])){
	    			   dump($params);
	    			}
	    			$DbExt->insertData("{{singleapp_mobile_push_logs}}",$params);
	    		}
	    		
	    	} else {	    		
	    		$params_update=array('status'=>"process");
	    	    $DbExt->updateData('{{singleapp_broadcast}}',$params_update,'broadcast_id',$broadcast_id);
	    	}	    		   
	    	
	    } else {
	    	if(isset($_GET['debug'])){
	    	   echo 'No records to process';
	    	}
	    }
	    
	    
	    $cron = websiteUrl()."/singlemerchant/cron/processpush";
	    FunctionsV3::fastRequest( $cron );
	}	
	
	public function actiongetfbavatar()
	{
		dump("running getfbavatar...");
		
		$db = new DbExt();
		$stmt="
		SELECT client_id,avatar,social_id
		FROM {{client}}
		WHERE avatar =''
		AND social_id !=''
		AND social_strategy ='fb_mobile'
		LIMIT 0,2
		";
		if($res = $db->rst($stmt)){
			foreach ($res as $val) {				
				$params = array();
				$client_id = $val['client_id'];
				if($avatar = FunctionsV3::saveFbAvatarPicture($val['social_id'])){
				   $params['avatar'] = $avatar;
				} else $params['avatar'] = "avatar.jpg";
				$params['date_modified']=FunctionsV3::dateNow();
				$params['ip_address']=$_SERVER['REMOTE_ADDR'];				
				$db->updateData('{{client}}',$params,'client_id',$client_id);
			}
		} else {
			if(isset($_GET['debug'])){
			   echo 'no records to process';
			}	
		}
	}	
}
/*END CLASS*/