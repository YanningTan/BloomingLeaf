/*
1. get the name of the node
2. get the starting and the ending point of each function
3. merge those together and output a new json file that contains those merged information
cases: 
1. doesn't have intersection: 
	a. doesn't have gaps
	b. has gaps
2. have intersections: 
	left blank
*/
var nodeTimeDict1 = {};
var nodeTimeDict2 = {};
var mergedDictionary = {};

function createNodeTimeMap(model1, model2){
	for(var constraint in model1.constarints){
		var nodeId = constraint.constraintSrcID;
		if(!(nodeTimeDict1[nodeId]==null)){
			nodeTimeDict1[nodeId] = [constraint.absoluteValue];
		}
		else{
			nodeTimeDict1[nodeId].push(constraint.absoluteValue);
		}
	}

	for(var constraint in model2.constarints){
		var nodeId = constraint.constraintSrcID;
		if(!(nodeTimeDict2[nodeId]==null)){
			nodeTimeDict2[nodeId] = [constraint.absoluteValue];
		}
		else{
			nodeTimeDict2[nodeId].push(constraint.absoluteValue);
		}
	}

	//push maxtime to value of each node
	for(var key in nodeTimeDict1){
		nodeTimeDic1[key].push(model1.maxAbsTime);
	}
	for(var key in nodeTimeDict2){
		nodeTimeDic2[key].push(model2.maxAbsTime);
	}
}

function findToMergePairs(){
	for(var key1 in nodeTimeDict1){
		for(var key2 in nodeTimeDict2){
			if(key1 === key2){
				/*
				element in this array is a tuple which the first element in the tuple is the time value
				second element in the tuple is a number. That number can be either 1 or 2, indicating
				whether that time value belongs to the first model
				or that time value belongs to the second model
				*/
				var time2DArray = [];
				for(var value in nodeTimeDict1[key1]){
					var timeTuple = [value, 1];
					time2DArray.push(timeTuple);
				}
				for(var value in nodeTimeDict2[key2]){
					var timeTuple = [value,2];
					time2DArray.push(timeTuple);
				}
				//sort time2DArray according to the time value
				//enter cases accordinly
				time2DArray = sort(time2DArray);
				mergedDictionary[key1] = time2DArray;
			}
		}
	}
}

/*
Without losing ngenerality, denote the second element of the first tuple to be 1.
In this way, there are two possible patterns in mergedDictionary[key]:
1) 1..2..1..2
2) 1..1..2..2
*/
function switchCases(mergedDictionary){
	for(var key in mergedDictionary){
		if(mergedDictionary[key].length < 2){
			//this case is only possible when only model1 or model 2 contains this node
			//so no gap no time conflict
			return noGapNoConflict(model1,mergedDictionary[key]);
		}
		else{
			for(var i = 0; i < mergedDictionary[key].length - 1 ; i=i+2){
				if((mergedDictionary[key][i][1] === mergedDictionary[key][i+1][1])
					&& (!(mergedDictionary[key][i][0] === mergedDictionary[key][i+1][0])))
				{
					//cases that there is no conflict and there is a gap between two intervals
					noGapNoConflict(model1,mergedDictionary[key][i]);
				}
				else if(mergedDictionary[key][i][0] === mergedDictionary[key][i+1][0])
				{
					//cases that there is neither time conflict nor gap
					noGapNoConflict(model1,mergedDictionary[key][i]);
				}
				else{
					//cases that there are time conflicts
					withConflict(model,mergedDictionary[key][i]);
				}
			}
		} 
	}
}

/*
Using merge sort to sort the time2DArray 
*/
function sort(twoDArray){
	if(twoDArray.length < 2){
		return twoDArray;
	}
	var middle = Math.floor(twoDArray.length/2);
	var rightArray = twoDArray.slice(middle);
	var leftArray = twoDArray.slice(0,middle);
	return merge(sort(leftArray), sort(rightArray));
}

function merge(leftList, rightList){
	var i = 0; 
	var j = 0; 
	var lenLeft = leftList.length; 
	var lenRight = rightList.length;
	var toReturn; 
	while(i < lenLeft && j < lenRight){
		if(leftList[i][0] < rightList[j][0]){
			toReturn.push(leftList[i]);
			i++; 
		}
		else
		{
			toReturn.push(rightList[j]);
			j++;
		}
	}
	//glue the rest part of the list into the result
	if((lenRight - j) > 1 ){
		toReturn.concat(rightList.slice(j));
	}
	if((lenLeft - i) > 1){
		toReturn.concat(leftList.slice(i)); 
	}
	return toReturn;
}

/*deal with the cases which there is neither gap nor time conflict*/
function noGapNoConflict(model1, ){

}

/*deal with the cases which there is time conflict but there is gap*/
function withGapNoConflict(model1, ){

}

/*deal with the cases which there is time conflict*/
function withConflict(model1, ){
	//what to do here?
}

