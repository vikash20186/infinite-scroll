function init(dataList){
  console.log("listdata is",dataList)
  var fixedHeightParent = document.querySelector("#list-component");
  var parentElem = document.querySelector("#list-body");
  var rowSelector = ".list-item";
  var compiledListTemplateFn = _.template(document.querySelector("#rowTemplate").innerHTML);
  var rowHeight = 50;
  var rowParentElem = parentElem;
  var infiniteScrollInstance = InfiniteScrollService.getInfiniteScrollObject();
  
  infiniteScrollInstance.initializeGrid({
		fixedHeightContainerElem : fixedHeightParent,
		parentElem : parentElem,
		rowSelector : rowSelector,
		compiledListTemplateFn : compiledListTemplateFn,
		rowHeight : rowHeight,
		rowParentElem : rowParentElem,
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