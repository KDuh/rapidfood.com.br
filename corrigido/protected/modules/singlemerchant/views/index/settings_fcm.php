<?php echo CHtml::beginForm(); ?>  
<?php echo CHtml::hiddenField('merchant_id',$merchant_id);?>

<div class="row">
  <div class="col-md-12">
  
  <div class="form-group">
	    <label ><?php echo SingleAppClass::t("Server key")?></label>
	    <?php 
	    echo CHtml::textField('singleapp_android_push_key',
	    getOption($merchant_id,'singleapp_android_push_key')
	    ,array(
	      'class'=>'form-control',
	    ));
	    ?>
	</div> 
  
  </div> <!--col-->   
</div> <!--row-->


 
<div class="floating_action">

<a  href="<?php echo Yii::app()->createUrl($modulename."/index/settings")?>" 
class="btn btn-secondary  left_margin"  >
 <?php echo st("BACK")?> 
</a>

  <?php
echo CHtml::ajaxSubmitButton(
	SingleAppClass::t('Save Settings'),
	array('ajax/save_fcm'),
	array(
		'type'=>'POST',
		'dataType'=>'json',
		'beforeSend'=>'js:function(){
		                 busy(true); 	
		                 $("#save-fcm").val("'.SingleAppClass::t('Processing').'");
		                 $("#save-fcm").css({ "pointer-events" : "none" });	                 	                 
		              }
		',
		'complete'=>'js:function(){
		                 busy(false); 		                 
		                 $("#save-fcm").val("'.SingleAppClass::t("Save Settings").'");
		                 $("#save-fcm").css({ "pointer-events" : "auto" });	                 	                 
		              }',
		'success'=>'js:function(data){	
		               if(data.code==1){		               
		                 nAlert(data.msg,"success");
		               } else {
		                  nAlert(data.msg,"warning");
		               }
		            }
		'
	),array(
	  'class'=>'btn '.APP_BTN,
	  'id'=>'save-fcm'
	)
);
?>
</div>

<?php echo CHtml::endForm(); ?>