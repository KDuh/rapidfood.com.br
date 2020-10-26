
<form id="frm_table" method="POST" >
<?php echo CHtml::hiddenField('action','pageList')?>
<?php echo CHtml::hiddenField('merchant_id',$merchant_id)?>
 
<table id="table_list" class="table table-striped data_tables" style="width:100%;">
 <thead>
  <tr>
    <th width="5%"><?php echo st("ID")?></th>
    <th><?php echo st("Title")?></th>
    <th><?php echo st("Content")?></th>
    <th ><?php echo st("Icon")?></th>
    <th><?php echo st("HTML format")?></th>    
    <th><?php echo st("Sequence")?></th>
    <th><?php echo st("Date")?></th>
    <th><?php echo st("Actions")?></th>
  </tr>
 </thead>
 <tbody>  
 </tbody>
</table>
</form>



<div class="floating_action">

<a  href="<?php echo Yii::app()->createUrl(APP_FOLDER."/index/settings")?>" 
class="btn btn-secondary left_margin"  >
 <?php echo st("BACK")?> 
</a>

 <button type="button" class="btn <?php echo APP_BTN?> refresh_datatables left_margin"  >
 <?php echo st("Refresh")?> 
 </button>
 
 <button type="button" class="btn btn btn-light" data-toggle="modal" data-target="#pageNewModal"  >
 <?php echo st("Add New")?> 
 </button>
 
</div>


<?php
$this->renderPartial('/index/page_add',array(	
	'merchant_id'=>$merchant_id
));
?>