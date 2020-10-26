
<div class="card" id="box_wrap">
<div class="card-body">


<form id="frm_table" method="POST" >
<?php echo CHtml::hiddenField('action','pushBroadcast')?>

<table id="table_list" class="table table-striped data_tables">
 <thead>
  <tr>
    <th width="5%"><?php echo st("Broadcast ID")?></th>
    <th><?php echo st("Push Title")?></th>
    <th><?php echo st("Push Message")?></th>
    <th><?php echo st("Merchant")?></th>
    <th ><?php echo st("Platform")?></th>
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

<button type="button" class="btn <?php echo APP_BTN?> refresh_datatables left_margin"  >
   <?php echo st("Refresh")?> 
   </button>
   
<a  href="<?php echo Yii::app()->createUrl($modulename."/index/broadcast_new")?>" class="btn btn-light"  >
   <?php echo st("Add New")?> 
   </a>
      
</div>