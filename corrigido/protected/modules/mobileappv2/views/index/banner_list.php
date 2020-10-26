
<div class="card" id="box_wrap">
<div class="card-body">

<div class="row action_top_wrap desktop button_small_wrap">   

<a href="<?php echo Yii::app()->createUrl("/".APP_FOLDER."/index/home_banner_new")?>" class="btn <?php echo APP_BTN?> "  >
<?php echo mobileWrapper::t("Add new")?>
</a>


<button type="button" class="btn <?php echo APP_BTN2;?> refresh_datatables"  >
<?php echo mobileWrapper::t("Refresh")?>	 
</button>


</div>

<table class="table data_tables table-hover" data-action_name="home_banner_list">
 <thead>
  <tr>
   <th><?php echo mobileWrapper::t("ID")?></th>
   <th width="18%"><?php echo mobileWrapper::t("Title")?></th>
   <th width="18%"><?php echo mobileWrapper::t("Banner")?></th>
   <th><?php echo mobileWrapper::t("Sequence")?></th>   
   <th><?php echo mobileWrapper::t("Date")?></th>   
   <th><?php echo mobileWrapper::t("Actions")?></th>
  </tr>
 </thead>
 <tbody>  
 </tbody>
</table>

</div> <!--card body-->
</div> <!--card-->


