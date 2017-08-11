## Infinite Scroll Grid

General purpose infinite scroll grid, which works any dom structure like table, div, ul li etc...

### Some Key features
1. Keeps only visible rows in the DOM Tree. Hiddens elements are removed to make DOM tree light weight.
2. Allows to jump from any page to any page. No need to browse pages one by one.
3. Currently assumes all rows data are loaded in the array before hand, but can be tweaked little bit to support server side pagination. Therefore no need to load the array before hand. Making it possible to support large data range.
4. Currently uses lodash in the implementation, but can be changed to use pure javascript or some other templating library.
5. Its super fast, easy to integrate and it works well.

### Demo
view [demo](http://plnkr.co/edit/3dAtzxTQMr8oXibUWA67?p=preview) on plnkr


#### Dependencies
uses lodash library for templating. You can modify the source code to change to other templating.

### Usage
1. include lodash library in your script tag, if you are going with default setup.
2. include infinite-scroll-without-jquery.js in your script tag
3. You need to supply below inputs to the infinite-scroll library
   1. define the fixed height dom element where the scroll will appear
   2. define the parent of each row element. this will be child of fixed height dom element.
   3. define the height of each row. Row should be of fixed height.
   4. define the template to render reach row. template can be defined as script template, or can be defined inline in javascript, or can be loaded from external javascript file. Anything is fine. You need to supply the string value to the component.
   5. define the dataList. Array of data. Currently it assumes, you have all the rows loaded in the array. You can tweak the renderPageData method to implement server side pagination. In any case, you need to make sure dataList.length returns the total count of the items. this count determines the total height of the component which brings right scrollbar and allows user to jump to any page from any page.

### Sample code
HTML Changes Part1. Template. Sample row element template is below.
```
		<script id="rowTemplate" type="text/template">
        		<% 
					for(var counter = startIndex; counter<startIndex + length; counter++){
						var rowItem = dataList[counter];
						var totalOffset = counter*rowHeight;
				%>
					<li class="width-100-per list-item" style="top:<%=totalOffset %>px; position:absolute;" data-indexNumber=<%=counter%>>
						<div><%= (counter+1) + ") " + rowItem.name + "," + rowItem.company%></div>
                  		<div><%= rowItem.email + "(" + rowItem.phone + ")"%></div>
					</li>
				<%}%>		
    </script>
```
Few things to note on the template format.
1. this is sample lodash template. Above template will render list of row elements for a given range. rowItem is the individual array item.
2. each row should have a valid selector. style(top, position) are set by the library to position each row element correctly. Since only visible elements are present in the dom, others are deleted. style absolute, top will render the rows correctly.
3. data-indexnumber is also set by the library and its required to indentify which range to be rendered when user scrolls the list.
4. in case you are using your template logic, then send the compiledListTemplateFn accordingly and update getListHTML method of the infinite-scroll.js.

HTML Changes Part2. Sample dom structure for grid.
```
	<div id="list-component">
        <ul id="list-body">
        </ul>
    </div>
```
1. in the exmample, list-component is a fixed height element.
2. "list-body" is the div where all the rows are rendered. Its height is rowHeight * number of items in the dataList.
3. You can use table also or just divs also.

Javascript infinite-scroll set up
```
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

```
1. ```var infiniteScrollInstance = InfiniteScrollService.getInfiniteScrollObject();``` creates the scroll object instance
2. instances takes few parameters
	1. fixedHeightParentElement dom element referece.
	2. parentElem dom element reference. Its height will be calcuated dynamically
	3. rowSelector, CSS selector to get the row elements from the list
	4. compiledListTemplateFn, lodash compiled template function.
	5. rowHeight, specify height of a single row.
	6. rowParentElem, its mostly same as parentElem. its where template generated html list items will be rendered
	7. loadashVariables, sets dataList here. You can also set additional properties here and access them inside the template just the way you are accessing the dataList.
3. After  setting above properties, your scroll grid should load.

### angular2-infinite-scroll component is also there which is created by tweaking this little bit. You can check it @ [https://github.com/vikash20186/infinite-scroll-angular2](https://github.com/vikash20186/infinite-scroll-angular2)

##### Feedback
You can provide feedback, then I can try to take a look. Send all possible along with plnkr, jsfiddle or some online link.