
<div class="card" id="box_wrap">
<div class="card-body">

<div class="row action_top_wrap desktop button_small_wrap">   
<button type="button" class="btn <?php echo APP_BTN2;?> refresh_datatables"  >
 <?php echo mobileWrapper::t("Refresh")?> 
 </button>
</div>

<?php 
if(isset($bid)){
	echo CHtml::hiddenField('broadcast_id',$bid);
}
?>
<table class="table data_tables table-hover" data-action_name="order_trigger" >
 <thead>
  <tr>
   <th><?php echo mobileWrapper::t("Trigger ID")?></th>
   <th><?php echo mobileWrapper::t("Trigger Type")?></th>
   <th><?php echo mobileWrapper::t("Order ID")?></th>
   <th><?php echo mobileWrapper::t("Order Status")?></th>
   <th><?php echo mobileWrapper::t("Order Remarks")?></th>
   <th><?php echo mobileWrapper::t("Date")?></th>
  </tr>
 </thead>
 <tbody>  
 </tbody>
</table>

</div> <!--card body-->
</div> <!--card-->

