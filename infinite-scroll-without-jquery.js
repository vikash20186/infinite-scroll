window.InfiniteScrollService = (function(){

    /**
     * 
     * InfiniteScroll :- Class to manage the scroll and keep the minimum number of dom elements in the list.
     * It works with table, ul, div and with any dom structure. 
     * 
     * **/
 
    function InfiniteScroll(){
    		var settings = {};
    		
    		var lastScrollTop = 0; //Holds the last scrop position to detect scroll down or up
    		var rowElems; //contains cache of rendered list
    		
    		//Initialization methods
    		this.initializeGrid = function(obj){
    			this.destroyGrid();
    			
    			settings = obj;
    			
    			initializeProperties();
    			initializeEvents();
    			handleScroll();
    		};
    		
    		//Initialize setup like setting up the total height of the list and finding out the
		    // total number of visible items based on the allowed height.
    		function initializeProperties(){
    		  
    		  var totalHeight = settings.lodashVariables.dataList.length * settings.rowHeight;
    			
    			settings.parentElem.style.height = totalHeight + 'px';
    			settings.parentElem.style.position = "relative";
    			settings.fixedHeightContainerElem.scrollTop = 0;
    			settings.parentOffsetTop = settings.parentElem.getBoundingClientRect().top;
    			
    			var fixedContainerElemHeight = settings.fixedHeightContainerElem.clientHeight;
    			settings.visibleRowsCount = Math.ceil(fixedContainerElemHeight/settings.rowHeight);
    			
    			var temp = Math.max(settings.visibleRowsCount,20);
    			settings.extraVisibleRowCount =  temp + temp%2;// Make it even
  
    		}
    		
    		//get the bounding values of the main element which is of the fixed height.
    		function getParentClientRect(){
    			settings.parentClientRect = settings.fixedHeightContainerElem.getBoundingClientRect();
    			return settings.parentClientRect;
    		}
    		
    		//Removing & Attaching Scroll events. 
    		function initializeEvents(){
    			settings.fixedHeightContainerElem.removeEventListener("scroll", handleScrollEvent);
    			settings.fixedHeightContainerElem.addEventListener("scroll", handleScrollEvent);
    		}
    
    		function handleScrollEvent(evt){
    			if (requestAnimationFrame) {
    				requestAnimationFrame(function (){
    					handleScrollEvent1(evt);
    				});
    			} else {
    				handleScrollEvent1(evt);
    			}
    		}
    
    		//handleScrollEvent1 determines whether user is scrolling down or up.
    		// it stores the last scroll position in scrollTop & compares with current.
    		// if current scroll top is greater than last then user is scrolling down
    		// else scroll up
    		function handleScrollEvent1(evt){
    			var scrollTop = settings.fixedHeightContainerElem.scrollTop;
    			if (scrollTop !== lastScrollTop){
    				var func, isScrollDown = (scrollTop > lastScrollTop);
    				if (isScrollDown){
    					func = handleScrollDown;
    				}else{
    					func = handleScrollUp;
    				}
    				lastScrollTop = scrollTop;
    				func.call(this, evt);
    			} else {
    				console.log("horizontal scroll detected. Currently its not handled for virtual scroll");
    			}
    		}
    
    		/**
    		 *
    		 * when user is scrolling down, 
    		 * 1. calculates the next set of row element to be rendered. Look at the last row element rendered in the list and get its the position
    		 * 2. Find the next range by adding the number of visible rows to the end position
    		 * 3. Renders the new range
    		 **/
    		function handleScrollDown(evt){
    			if (rowElems){
    				var lastChildElem = rowElems[rowElems.length-1];
    				var lastIndexNumber = Number(lastChildElem.dataset.indexnumber) ;
    				lastIndexNumber = isNaN(lastIndexNumber)?0:lastIndexNumber;
    				var clientRect = lastChildElem.getBoundingClientRect();
    				if (clientRect.bottom < 0){
    					//Check if all the elems are rendered.
    					if( lastIndexNumber+1 < (settings.lodashVariables.dataList || []).length){
    						//Last element went up and page is empty. Need to calculate the page number now
    						handleScroll(evt, true);                
    					}
    				}else if (clientRect.bottom < getParentClientRect().bottom + (5*settings.rowHeight)){
    					//Last element went up and element is still in the page. Can do continuous rendering
    					var startCount = parseInt(lastChildElem.getAttribute("data-indexNumber"),10)+1;
    					var endCount = startCount + settings.extraVisibleRowCount;
    					renderPageData(startCount,endCount,true);
    				}
    			} else {
    				handleScroll(evt, true);
    			}
    		}
    
    		/**
    		 *
    		 * when user is scrolling and unable to determine the range then, 
    		 * 1. find the range by finding the scroll users has done.
    		 * 2. divide the scroll value by the height of each row element.
    		 * 3. division will give the current page count. Caculate the range based on the current page
    		 * 4. Render the current range.
    		 * 
    		 * This is usefull when user is scrolling very fast. This helps from jumping one page to any other page.
    		**/
    		function handleScroll(evt, isScrollDown){
    			var currentStartIndex = Math.floor((settings.fixedHeightContainerElem.scrollTop)/settings.rowHeight);
    			var start = currentStartIndex - settings.extraVisibleRowCount/2;
    			var end = currentStartIndex + settings.visibleRowsCount + settings.extraVisibleRowCount/2;
    			renderPageData(start, end, isScrollDown, true);
    		}
    		
    		/**
    		 * when user is scrolling up, exact opposite of scroll down
    		 * 
    		 * 1. find the position of first row element present in the list
    		 * 2. calculate the range by subracting from the visible number of row elements of the list
    		 * 3. Render new range.
    		 * 
    		 * **/
    		function handleScrollUp(evt){
    			var firstChildElem = rowElems[0];
    			var clientRect = firstChildElem.getBoundingClientRect();
    			if (clientRect.top > getParentClientRect().bottom){
    				handleScroll(evt, false);
    			} else if (clientRect.top > getParentClientRect().top -(5*settings.rowHeight)){
    				var endCount = parseInt(firstChildElem.getAttribute("data-indexNumber"),10);
    				var startCount = endCount - settings.extraVisibleRowCount;
    				renderPageData(startCount,endCount,false);
    			}
    		}
    		
    		/**
    		 * it removes the row element from the parent list. Utility method.
    		 * */
    		function  removeAllChilds(upperCount, lowerCounter, childsParent, childs){
    			for (;upperCount>=lowerCounter;upperCount--){
    				if (childsParent.length === 0){
    					console.error("error here");
    				}
    				childsParent.removeChild(childs[upperCount]);
    			}
    		}
    		function getListHTML(obj){
    			var html = settings.compiledListTemplateFn(_.extend({
    				rowHeight : settings.rowHeight,
    				startIndex : obj.startCount,
    				length : obj.length
    			},settings.lodashVariables));
    			return html;
    		}
    		
    		function fragmentFromString(strHTML) {
          return document.createRange().createContextualFragment(strHTML);
        }
    		
    		/**
    		 * 
    		 * renderPageData :- the main logic of the service.
    		 * 
    		 * Two main task
    		 * 1. It renders the given range on the screen
    		 * 2. it removes the row elements which are not visible in the current view port.
    		 * 
    		 * **/
    		function renderPageData(startCount, endCount, isScrollDown, removeAllChild){
    			var rowParentElem = settings.rowParentElem;
    			//Check to avoid negative indexing
    			if (startCount < 0 ){
    				startCount = 0;
    			}
    			
    			var totalDataLength = (settings.lodashVariables.dataList || []).length;
    
    			if (startCount >= totalDataLength){
    				if (totalDataLength === 0){
    					//if collection becomes empty, then remove all the existing list rows
    					var childs = rowParentElem.querySelectorAll(settings.rowSelector);
    					removeAllChilds(childs.length-1,0,rowParentElem, childs);
    				}
    				console.log("returning as no more data to render");
    				return;
    			}
    
    			//check to avoid wrong indexing
    			if (endCount > totalDataLength){
    				endCount = totalDataLength;
    			} else if (endCount <= 0){
    				return;
    			}
    
    			var that = this;
    			var noOfElems = endCount - startCount;
    			//Data is there in the list, get the range of contacts from the list
    			var slicedArr = settings.lodashVariables.dataList.slice(startCount,endCount);
    
    			
    
    			var childs = rowParentElem.querySelectorAll(settings.rowSelector);
    			
    			var html = getListHTML({
    				startCount : startCount,
    				length : (endCount - startCount)
    			});
    			var fragment = fragmentFromString(html);
    			
    			//renderLists is a helper method. it actuallys renders the new list item range and 
    			// takes off elements from the dom to keep dom light weight.
    			function renderLists(){
    				var counter =0, upperCount = 1, noOfChildPresent = childs.length;
    				if (removeAllChild){
    					counter = noOfChildPresent-1;
    					upperCount = 0;
    					//remove the elements from the dom tree.
    					removeAllChilds(counter,upperCount,rowParentElem, childs);
    				} else if (noOfChildPresent >  settings.visibleRowsCount + settings.extraVisibleRowCount){
    					if (isScrollDown){
    						counter = Math.min(noOfElems, noOfChildPresent);
    						counter--;
    						upperCount = 0;
    					} else {
    						counter = noOfChildPresent-1; 
    						upperCount = counter - noOfElems;
    					}
    				}
    				childs = null;
    				
    				if (isScrollDown){
    				  settings.rowParentElem.appendChild(fragment);
    				} else {
    				  settings.rowParentElem.insertBefore(fragment, settings.rowParentElem.children[0]);
    				}
    				
    				/*var methodName = isScrollDown ? "append" : "prepend";
    				//appends the new elements to the dom
    				settings.$rowParentElem[methodName](fragment[0]);*/
    				
    				rowElems = rowParentElem.querySelectorAll(settings.rowSelector);
    				if (rowElems.length === 0){
    					console.error("Rendering error")
    				} else {
    				  var extraChildCount, invisibleRowsCount, invisibleRowsHeight;
    					if (isScrollDown){
    						var firstElem = rowElems[0];
    						invisibleRowsHeight = (firstElem.getBoundingClientRect().top - getParentClientRect().top);
    						if (invisibleRowsHeight < 0 ){
    							invisibleRowsCount = Math.floor(Math.abs(invisibleRowsHeight)/settings.rowHeight);
    							extraChildCount = (invisibleRowsCount - settings.extraVisibleRowCount);
    							if (extraChildCount > 0 ){
    								//remove the elements from the dom tree.
    								removeAllChilds(extraChildCount,0, rowParentElem, rowElems);
    								rowElems = rowParentElem.querySelectorAll(settings.rowSelector);
    							}
    						}
    					} else {
    						var lastElem = rowElems[rowElems.length-1];
    						invisibleRowsHeight = (lastElem.getBoundingClientRect().bottom - getParentClientRect().bottom);
    						if (invisibleRowsHeight > 0 ){
    							invisibleRowsCount = Math.floor(invisibleRowsHeight/settings.rowHeight);
    							extraChildCount = (invisibleRowsCount - settings.extraVisibleRowCount);
    							if (extraChildCount > 0 ){
    								removeAllChilds(rowElems.length-1,rowElems.length - extraChildCount-1, rowParentElem, rowElems);
    								rowElems = rowParentElem.querySelectorAll(settings.rowSelector);
    							}
    						}
    					}
    				}
    				
    				if (settings.lodashVariables.afterGridRenderCallback){
    					settings.lodashVariables.afterGridRenderCallback(rowElems)
    				}
    			}
    			renderLists();
    		}
    
    		this.destroyGrid = function(){
    			settings.fixedHeightContainerElem && settings.fixedHeightContainerElem.removeEventListener("scroll", handleScrollEvent);
    		}
  }
    	
  function getInfiniteScrollObject(){
		  return new InfiniteScroll();
  }
	
	return {
	  getInfiniteScrollObject : getInfiniteScrollObject
	}
	
})();