<?php
$menu =  array(  		    		    
    'activeCssClass'=>'active', 
    'encodeLabel'=>false,
    'htmlOptions' => array(
      'class'=>'menu_nav',
     ),
    'items'=>array(
    
        array('visible'=>true,
        'label'=>'<i class="ion-android-list"></i>',
        'url'=>array('/'.APP_FOLDER.'/index/settings'),'linkOptions'=>array(
          'data-content'=>st("Merchant")
        )),               
        
         array('visible'=>true,
        'label'=>'<i class="ion-iphone"></i>',
        'url'=>array('/'.APP_FOLDER.'/index/device'),'linkOptions'=>array(
          'data-content'=>st("Device List")
        )), 
        
        array('visible'=>true,
        'label'=>'<i class="ion-ios-paper-outline"></i>',
        'url'=>array('/'.APP_FOLDER.'/index/push_broadcast'),'linkOptions'=>array(
          'data-content'=>st("Broadcast")
        )), 
        
        array('visible'=>true,
        'label'=>'<i class="ion-ios-filing-outline"></i>',
        'url'=>array('/'.APP_FOLDER.'/index/push_logs'),'linkOptions'=>array(
          'data-content'=>st("Push Logs")
        )), 

                                      
        array('visible'=>true,
        'label'=>'<i class="ion-plus"></i>',
        'url'=>array('/'.APP_FOLDER.'/index/others'),'linkOptions'=>array(
          'data-content'=>st("Others")
        )), 
     )   
);       

$this->widget('zii.widgets.CMenu', $menu);