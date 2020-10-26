
<div class="card" id="box_wrap">
<div class="card-body">

<div class="row action_top_wrap desktop button_small_wrap">   

 <button type="button" class="btn <?php echo APP_BTN2;?> refresh_datatables"  >
 <?php echo mobileWrapper::t("Refresh")?> 
 </button>

 <?php if(isset($_GET['bid'])):?>
 <a href="<?php echo Yii::app()->createUrl(APP_FOLDER."/index/old_broadcast")?>" class="btn <?php echo APP_BTN;?>"  >
   <?php echo mobileWrapper::t("Back")?>
 </a>
 <?php endif;?>
 
</div>

<?php 
if(isset($bid)){
	echo CHtml::hiddenField('broadcast_id',$bid);
}
?>
<table class="table data_tables table-hover" data-action_name="push_list" >
 <thead>
  <tr>
   <th><?php echo mobileWrapper::t("ID")?></th>
   <th><?php echo mobileWrapper::t("Push Type")?></th>
   <th><?php echo mobileWrapper::t("Name")?></th>
   <th><?php echo mobileWrapper::t("Platform")?></th>   
   <th><?php echo mobileWrapper::t("Device ID")?></th>   
   <th><?php echo mobileWrapper::t("Push Title")?></th>   
   <th><?php echo mobileWrapper::t("Push Content")?></th>   
   <th><?php echo mobileWrapper::t("Date")?></th>         
   <th><?php echo mobileWrapper::t("Process")?></th> 
  </tr>
 </thead>
 <tbody>  
 </tbody>
</table>

</div> <!--card body-->
</div> <!--card-->


<div class="modal fade" id="errorDetails" tabindex="-1" role="dialog" aria-labelledby="errorDetails" aria-hidden="true">
 <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header"> <h5 class="modal-title" ><?php echo mt("Details")?></h5></div>

        <div class="modal-body">
        <?php 
        echo CHtml::hiddenField('details_id');
        ?>
        <p class="error_details"></p>
        </div>

      </div><!-- content-->
 </div>
</div>




<div class="modal fade" id="deviceDetails" tabindex="-1" role="dialog" aria-labelledby="deviceDetails" aria-hidden="true">
 <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header"> <h5 class="modal-title" ><?php echo mt("Details")?></h5></div>

        <div class="modal-body">        
        <p class="device_details"></p>
        </div>

      </div><!-- content-->
 </div>
</div>


