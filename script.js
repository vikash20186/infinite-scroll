function init(dataList){
  console.log("listdata is",dataList)
  var $fixedHeightParent = $("#list-component");
  var $parentElem = $("#list-body");
  var rowSelector = ".list-item";
  var compiledListTemplateFn = _.template($("#rowTemplate").html());
  var rowHeight = 50;
  var $rowParentElem = $parentElem;
  var infiniteScrollInstance = InfiniteScrollService.getInfiniteScrollObject();
  
  infiniteScrollInstance.initializeGrid({
		$fixedHeightContainerElem : $fixedHeightParent,
		$parentElem : $parentElem,
		rowSelector : rowSelector,
		compiledListTemplateFn : compiledListTemplateFn,
		rowHeight : rowHeight,
		$rowParentElem : $rowParentElem,
		lodashVariables : {
		  dataList : dataList,
		  afterGridRenderCallback : function(){
		    console.log("after rendering of rows. ")
		  }
		}
	});
}


function loadData(){
  return $.ajax("data.json");
}


document.addEventListener("DOMContentLoaded", function(){
  loadData().then(init);
})