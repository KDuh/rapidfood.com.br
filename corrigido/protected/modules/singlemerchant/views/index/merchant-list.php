
<div class="card" id="box_wrap">
<div class="card-body">


<form id="frm_table" method="POST" >
<?php echo CHtml::hiddenField('action','merchantList')?>

<table id="table_list" class="table table-striped data_tables">
 <thead>
  <tr>
    <th width="10%"><?php echo st("ID")?></th>
    <th><?php echo st("Merchant Name")?></th>        
    <th><?php echo st("Merchant Keys")?></th>
    <th><?php echo st("Status")?></th>
    <th><?php echo st("Action")?></th>
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