

<div class="card" id="box_wrap">
<div class="card-body">
<?php echo CHtml::beginForm('','post',array(
		  'id'=>"frm",
		  'onsubmit'=>"return false;",
		  'data-action'=>"save_home_banner"
		)); 
		?> 
		
<?php 
echo CHtml::hiddenField('banner_id', isset($data['banner_id'])?$data['banner_id']:'' );
echo CHtml::hiddenField('home_banner', isset($data['banner_name'])?$data['banner_name']:''  );
?>		


<div class="form-group">
<label><?php echo mt("Title")?></label>		
<?php 
echo CHtml::textField('title',
isset($data['title'])?$data['title']:'' 
,array('class'=>"form-control",'required'=>true ));
?>			
</div> 

<div class="form-group">
<label><?php echo mt("Sub title")?></label>		
<?php 
echo CHtml::textField('sub_title',
isset($data['sub_title'])?$data['sub_title']:'' 
,array('class'=>"form-control",'required'=>false ));
?>			
</div> 

<div class="form-group chosen_big_input">
<label><?php echo mt("Tags")?></label><br/>		
<?php 
$tag_id = isset($data['tag_id'])?json_decode($data['tag_id'],true):'';
echo CHtml::dropDownList('tag_id',(array)$tag_id,
  (array)$tags,array(
  'class'=>"form-control chosen",
  "multiple"=>"multiple",  
));
?>			
</div> 

<div class="form-group">
<button id="upload_banner" type="button" class="btn <?php echo APP_BTN2?> btn-primary">
 <?php echo mobileWrapper::t("Browse")?>
</button>    
</div> 			


<div class="form-group">
<label><?php echo mt("Sequence")?></label>		
<?php 
echo CHtml::textField('sequence',
isset($data['sequence'])?$data['sequence']:$last_increment 
,array('class'=>"form-control numeric_only",'required'=>true ));
?>			
</div> 

<div class="form-group">
	<label><?php echo mt("Status")?></label>		
	<?php 
	echo CHtml::dropDownList('status',
    isset($data['status'])?$data['status']:'' 
    ,statusList() ,array(
      'class'=>'form-control',      
      'required'=>true
    ));
	?>
	</div> 

<div class="floating_action">

<a href="<?php echo Yii::app()->createUrl("/".APP_FOLDER."/index/home_banner_list")?>" class="btn <?php echo APP_BTN2?>"  >
<?php echo mobileWrapper::t("Back")?>
</a>	 

<button class="btn <?php echo APP_BTN?> "  >
<?php if(isset($data['banner_id'])):?>
<?php echo mobileWrapper::t("Update")?>
<?php else :?>
<?php echo mobileWrapper::t("Save")?>
<?php endif;?>
</button>

</div>	

<?php echo CHtml::endForm() ; ?>	

</div>
</div>