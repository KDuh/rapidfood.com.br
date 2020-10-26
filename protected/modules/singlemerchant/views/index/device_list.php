<div class="card" id="box_wrap">
<div class="card-body">


<form id="frm_table" method="POST" >
<?php echo CHtml::hiddenField('action','registeredDeviceList')?>

<table id="table_list" class="table table-striped data_tables">
 <thead>
  <tr>
     <th width="5%"><?php echo st("ID")?></th>
    <th><?php echo st("Name")?></th>
    <th><?php echo st("Platform")?></th>    
    <th ><?php echo st("UIID")?></th>
    <th ><?php echo st("Device ID")?></th>
    <th><?php echo st("Enabled Push")?></th>    
    <th><?php echo st("Date")?></th>
    <th><?php echo st("Actions")?></th>
  </tr>
 </thead>
 <tbody>  
 </tbody>
</table>
</form>

</div> <!--card body-->
</div> <!--card-->


<div class="floating_action">
 <button type="button" class="btn <?php echo APP_BTN?> refresh_datatables"  >
 <?php echo st("Refresh")?> 
 </button>
</div>