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

/*this function merge two actors with the same name together*/
function mergeToOneActor(actor1, actor){

}


/*deal with the cases which there is neither gap nor time conflict*/
//assume model1 happens first
function noGapNoConflict(model1, model2, delta){
	/*
	1)add intentionsneed to prevent the repetition of the node id
		1. if name different, then different id
		2. if name the same, then leave it alone
	2) Update links: change linkDestID, change linkSrcID according to the new nodeID generated
	in the first step
	3) Update functions: If there are function in the node with the same name in model2,
	change the function type of the intention to "UD" and add all of the functions in model2 
	to the function list of the new intention
	*/
	var newIntentions = [];
	var curCountForID = 0;
	for(var intention1 in model1.intentions){
		var newID = createID(curCountForID);
		/*The following block of code is to update the original intention ids to new ids
		Will be put into a seperate function later*/ 
		for(var i = 0; i < model1.links.length; i++){
			if(model1.links[i].linkSrcID === intention1.nodeID){
				model1.links[i].linkSrcID = newID;
			}
			if(model1.links[i].linkDestID === intention1.nodeID){
				model1.links[i].linkDestID = newID;
			}
		}

		for(var i=0 ; i < model1.analysisRequest.userAssignmentsList.length; i++){
			if(model1.analysisRequest.userAssignmentsList[i].intentionID === intention1.nodeID){
				model1.analysisRequest.userAssignmentsList[i].intentionID = newID; 
			}
		}

		for(var i = 0 ; i < model1.actors.length; i++){
			for(var j = 0; j < actor.intentionIDs.length; j++){
				if(model1.actors[i].intentionIDs[j] === intention1.nodeID){
					model1.actors[i].intentionIDs[j] = newID;
				}
			}
		}
		intention1.nodeID = newID;
		intention1.dynamicFunction.intentionID = newID;
		/*new id update is finished here*/ 
		newIntentions.push(intention1);
		curCountForID ++;
	}

	for(var intention2 in model2.intentions){
		for(var intention in newIntentions){
			if(!((intention.nodeName === intention2.nodeName)
				&&(intention.nodeType === intention2.nodeType))){
				var newID = createID(curCountForID);
				for(var i = 0; i < model2.links.length; i++){
					if(model2.links[i].linkSrcID === intention2.nodeID){
						model2.links[i].linkSrcID = newID;
					}
					if(model2.links[i].linkDestID === intention2.nodeID){
						model2.links[i].linkDestID = newID;
					}
				}
				for(var i=0 ; i < model2.analysisRequest.userAssignmentsList.length; i++){
					if(model2.analysisRequest.userAssignmentsList[i].intentionID === intention2.nodeID){
						model2.analysisRequest.userAssignmentsList[i].intentionID = newID; 
					}
				}
				intention2.nodeID = newID; 
				intention2.dynamicFunction.intentionID = newID; 
				newIntentions.push(intention2);
				curCountForID ++;
			}
			else{
				//functionList of the nodes with the same names are updated here
				//TODO: the function stop may need to be modified.
				if(!(intention2.funcSegList.length == 0)){
					intention.stringDynVis = "UD";
					for(var func in intention2.functionSegList){
						intention.functionSegList.push(func);
					}
				}
			}
		}
	}

	/*
	merge actors:
	1. Merge actors with the same name together
	2. Check whether same name , different actors? If so, raise errors
	3. Put missings in the actors into the corresponding actor
	*/
	var newActors = [];
	var actorsNameSet = new Set();
	//the following is the set that contains the name of each actor that has been visited in the algorithm
	var visitedActorNameSet = new Set();
	for(var actor1 in model1.actors){
		for(actor2 in model2.actors){
			if(actor1.nodeName === actor2.nodeName){
				var mergedActor = mergeToOneActor(actor1, actor2);
				newActors.push(mergedActor);
				for(var intention in mergedActor.intentionIDs){
					visitedActorNameSet.add();
				}
				actorsNameSet.add(actor1.nodeName);
			}
		}
	}

	//not correct!!!!!!!!
	//need to check
	for(var actor1 in model1.actors){
		if(!actorNameSet.has(actor1.nodeName)){
			actorNameSet
		}
	}
	/*
	modify links: 
	1. Add all links in model1 to the merged model's links
	2. Add all links that are not in model1 to the merged model's links
	*/
	var newLinks = [];
	var linkCount = 0
	for(var link in model1.links){
		var newID = createID(linkCount);
		link.linkID = newID;
		linkCount ++;
		newLinks.push(link);
	}
	for(var link in model2.links){
		var isInNewLink = false;
		for(var newLink in newLinks){
			if(isSameLink(newLink,link)){
				isInNewLink = true;
			}
		}
		if(!isInNewLink){
			var newID = createID(linkCount); 
			link.linkID = newID; 
			linkCount ++;
			newLinks.push(link);
		}
	}

	/*
	1) Update all of the constraints & absValues by adding (maxTime + delta) to all of the
	absValue in model2
	2) Update the analysis request
	*/
	//TODO: check repetitions of the constriants?
	var maxTime1 = model1.maxAbsTime;
	var newConstraints = []
	for(var constraint in model1.constraints){
		newConstraints.push(constraint);
	}
	var newConstraints2= updateAbs(model2.constraints,delta,maxTime1);
	for(var constriant in newConstraints2){
		newConstraints.push(constraint);
	}

	//TODO: What to do with conflict value? 
	//TODO: What is current state?
	//TODO: What to do with previous analysis?
	var newAnalysisRequest = [];
	for(var assingment in model1.analysisRequest.userAssignmentsList){
		newAnalysisRequest.push(assignment);
	}
	for(var i = 0; i < model2.analysisRequest.userAssignmentsList.length; i++){
		var numAbs = parseInt(model2.analysisRequest.userAssignmentsList[i].absTime);
		numAbs += delta + maxTime1; 
		model2.analysisRequest.userAssignmentsList[i].absTime = numAbs.toString();
	}
	for(var i = 0; i < model2.analysisRequest.absTimePtsArr.length; i++){
		var absValNum = parseInt(model2.analysisRequest.absTimePtsArr[i]);
		absValNum += delta + maxTime;
		model2.analysisRequest.absTimePtsArr[i] = absValNum.toString();
	}

	var absTimePtsTemp = model2.analysisRequest.absTimePts.split(" ");
	var stringAbsTimePts = "";
	for(var num in absTimePtsTemp){
		var numVal = parseInt(num); 
		numVal += (delta + maxTime1); 
		stringAbsTimePts = stringAbsTimePts + numVal.toString() + " ";
	}
	stringAbsTimePts = stringAbsTimePts.substr(0, stringAbsTimePts.length - 1);
	model2.analysisRequest.absTimePts = stringAbsTimePts;

	var model1NumRelTime = paseInt(model1.analysisRequest.numRelTime); 
	var model2NumRelTime = parseInt(model2.analysisRequest.numRelTime); 
	newAnalysisRequest.numRelTime = (model1NumRelTime + model2NumRelTime).toString;

	for(var assignment in model2.analysisRequest.userAssignmentsList){
		newAnalysisRequest.push(assignment);
	}

	return newIntentions, newLinks, newConstraints, newAnalysisRequest;
}


function isSameLink(link1, link2){
	var isSame = true; 
	for(var attribute in link1){
		if(!(link1[attribute] === link2[attribute]){
			isSame = false;
		}
	}
	return isSame;
}


/**
* Creates and returns a 4 digit ID for this node
*
* @returns {String}
*/
function createID(curCountForID) {
        var id = newID.toString();
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
}

function updateAbs(constraints2, delta, maxTime1){
	var updatedConstraint2 = [];
	var toAdd = maxTime1 + delta; 
	for(var constraint in constarints2){
		constraint.absoluteValue += toAdd;
		updateConstraint2.push(constraint);
	}
	return updateConstraint2;

}

/*deal with the cases which there is time conflict but there is gap*/
function withGapNoConflict(model1, model2){
	//TBD
	//not decided yet

}

/*deal with the cases which there is time conflict*/
function withConflict(model1, model2, delta){
	//TBD
	//not decided yet
}

function mergeModels(delta, model1, model2){
	if(delta > 0){
		withGapNoConflict(model1, model2, delta);
	}
	else if(delta == 0){
		noGapNoConflict(model1, model2);
	}
	else{
		withConflict(model1, model2, delta);
	}
}

