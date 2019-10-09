//repulsion coefficient dictionary: {Set of vertices that should be grouped together}:{Value of repulsion}
//attraction coefficient dictionary: similar structure
//default attraction on each links
//default repulsion between two nodes
//default layout: evenly distributed on the coordinate
//E: repulsion coefficient
//k: attraction coefficient
var defaultCoefficientValue= 0.5; 
var numVertices = 10; 
var area = 1000*1000;
var gravityDict = new Object();
var resourcesGravity = 5; 
var taskGravity = 3; 
var softgoalGravity = 1;
var goalGravity = 0;
var IDNodeIDDict = new Object();

//TODO: node ids: generated, reusable in different visual layout? ids linked only by their name. Would that be fine to keep that structure for now? 
//TODO: What to include in the abstract?

class Node{
  constructor(name,x,y,connectionSet,gravity) {
    this.nodeName = name;
    this.nodeX = x; 
    this.nodeY = y; 
    this.connectedTo = connectionSet;
    this.forcesX = 0;
    this.forcesY = 0;
    this.gravity = gravity;
  }
  set xValue(newX){
  	this.nodeX = newX; 
  }
  set yValue(newY){
  	this.nodeY = newY; 
  }

  get xValue(){
  	return this.nodeX; 
  }

  get yValue(){
  	return this.nodeY;
  }

  get forcesX(){
  	return this.forceX;
  }

  get forcesY(){
  	return this.forceY;
  }

  isConnectdTo(anotherNode){
  	if(this.connectedTo.has(anotherNode)){
  		return true;
  	}
  	else{
  		return false;
  	}
  }

  set forceX(newForceX){
  	this.forceX = newForceX;
  }

  set forceY(newForceY){
  	this.forceY = newForceY;
  }

  set gravity(gravity){
  	this.gravity = gravity;
  }

}

//todo: id? 
function makeDictIDToNodeID(resultList, model1, model2){

	IDNodeIDDict =
}



function initializaGravityDict(resultList){
	var listOfIntentions = restList[1];
	for(var i=0, i < listOfIntentions.length; i++){
		var curIntention = listOfIntentions[i];
		if(curIntention["nodeType"] == "basic.Resource"){
			gravityDict[curIntention["nodeID"]] = resourcesGravity;
		}
		else if(curIntention["nodeType"] == "basic.Task"){
			gravityDict[curIntention["nodeID"]] = taskGravity;
		}
		else if(curIntention["nodeType"] == "basic.Goal"){
			gravityDict[curIntention["nodeID"]] = goalGravity;
		}
		else if(curIntention["nodeType"] == "basic.Softgoal"){
			gravityDict[curIntention["nodeID"]] = softgoalGravity;
		}
	}

}

//add model1 and model2 to the parameters of this function
function initializeNodes(resultList, nodeSet, model1, model2){
	//assume each node no more than 2 lines with a size of width: 150 height: 100
	initializaGravityDict(resultList);
	var width = 150; 
	var height = 100; 
	/*here construct a coordinate*/ 
	var listOfIntentions = restList[1];
	var numIntentions = listOfIntentions.length; 
	var numXY = Math.ceil(Math.sqrt(numIntentions));
	var curXCount, curYCount = 0, 0;
	var listOfLinks = resultList[2];
	for(var i=0, i < listOfIntentions.length; i++){
		var intention = listOfIntentions[i];
		var nodeID = intention["nodeID"];
		var connectionSet = new Set();
		for(var link in listOfLinks){
			var src = link['linkSrcID'];
			var dest = link['linkDestID'];
			if(src == nodeID){
				connectionSet.add(dest);
			}
			else if(dest == nodeID){
				connectionSet.add(src);
			}
		}
		//go to next y or stay in the same y
		if((curXCount + 1) <= numXY){
			curXCount += 1; 
			curYCount += 0; 
		}
		else{
			curXCount = 0;
			curYCount += 1;
		}
		var gravity = gravityDict[nodeID];
		var node = new Node(nodeID,(curXCount-1)*width,curYCount*height,connectionSet,gravity);
		nodeSet.add(node);
	}
	//nodeName = nodeID
	//link
	//均匀分布
	//construct a coordinate system
	//TODO: construct node accordingly
	//construct clusterDictionary
	//constuct clusterDictionary
	//place each node evenly in the coordinate
	//var nodes = [node1, node2, node3...];
}


function coefficientValue(clusterDictionary, nodeNamePair){
	for(var key in clusterDictionary){
		if(key.has(nodeNamePair)){
			return clusterDictionary[key];
		}
	}
	return defaultCoefficientValue; 
}

function changeNodePos(node, newX, newY){
	node.nodeX = newX; 
	node.nodeY = newY;
}


function setAttractionSum(curNode){
	var curName = curNode.nodeName;
	for(var node in nodes){
		var nodeName = node.nodeName;
		if(curName != nodeName){
			var forceX, forceY = attraction(curNode, node);
			var curXForce = curNode.forcesX; 
			curXForce += forceX; 
			curNode.forcesX = curXForce;
			var curYForce = curNode.forcesY; 
			curYForce += forceY; 
			curNode.forcesY = curYForce; 
		}
	}
}

function setRepulsionSum(curNode){
	var curName = curNode.nodeName;
	for(var node in nodes){
		var nodeName = node.nodeName;
		if(curName != nodeName){
			var forceX, forceY = repulsion(curNode, node);
			var curXForce = curNode.forcesX; 
			curXForce += forceX; 
			curNode.forcesX = curXForce;
			var curYForce = curNode.forcesY; 
			curYForce += forceY; 
			curNode.forcesY = curYForce; 
		}

	}
}

function attraction(node1, node2){
	var d = Math.sqrt((node2.xValue - node1.xValue)^2 + (node1.yValue - node2.yValue)^2);
	var k = coefficientValue(clusterDictionary, [node1.nodeName, node2.nodeName]);
	var coefficient = k * Math.sqrt(area/numVertices); 
	var forceSum = d^2/(coefficient^2);
	var dx = Math.sqrt((node2.xValue - node1.xValue)^2); 
	var dy = Math.sqrt((node1.yValue - node2.yValue)^2);
	var cos = dx/d;
	var sin = dy/d;
	var forceX = cos*forceSum; 
	var forceY = sine*forceSum;
	//direction
	if(node2.xValue < node1.xValue){
		forceX = -forceX;
	}
	if(node2.yValue < node1.yValue){
		forceY = -forceY;
	}
	return forceX, forceY; 
}

function repulsion(node1, node2){
	var d = Math.sqrt((node2.xValue - node1.xValue)^2 + (node1.yValue - node2.yValue)^2);
	var k = coefficeintValue(clusterDictionary, [node1.nodeName, node2.nodeName]); 
	var coefficient = k * Math.sqrt(area/numVertices);
	var forceSum = -coefficient^2/d;
	var dx = Math.sqrt((node2.xValue - node1.xValue)^2); 
	var dy = Math.sqrt((node1.yValue - node2.yValue)^2);
	var cos = dx/d;
	var sin = dy/d;
	var forceX = cos*forceSum; 
	var forceY = sine*forceSum;
	//direction
	if(node2.xValue < node1.xValue){
		forceX = -forceX;
	}
	if(node2.yValue < node1.yValue){
		forceY = -forceY;
	}
	return forceX, forceY;
}

/*Should be called after initialization(initial position should be assigned in the
initializeNodes)*/
function adjustment(nodeSet,moveConstant){
	for(var node of nodeSet){
		setAttractionSum(node); 
		setRepulsionSum(node);
		var moveX = moveConstant * node.forceX; 
		var moveY = moveConstant * node.forceY;
		node.nodeX += moveX; 
		node.nodeY += moveY;
	}
}

function forceDirectedAlgorithm(resultList){
	var numIterations = 70;
	var numConstant = 5;
	var nodeSet = new Set();
	initializeNodes(resultList, nodeSet);
	for(var i = 0; i < numItertions; i++){
		adjustment(nodeSet);
	}
	/*print x, y here*/ 
	for(var node of nodeSet){
		console.log("x value: "node.nodeX + " ; y value: "+node.nodeY);
	}
}

/*The part that read in the JSON files for the model*/ 
const fs = require('fs');
if (process.argv.length !== 5) {
    console.error('Invalid input');
    process.exit(1);
}
else{
	var inputModel1;
	var inputModel2;
	var rawData1 = fs.readFileSync(process.argv[3]);
	inputModel1 = JSON.parse(rawData1);
	var rawData2 = fs.readFileSync(process.argv[4]);
	inputModel2 = JSON.parse(rawData2);
	var outPutString = ``;
	var resultList = mergeModels(process.argv[2], inputModel1, inputModel2);
	initializaNodes(resultList, inputModel1, inputModel2);
	forceDirectedAlgorithm(resultList);
	var commentList = ["newActors","newIntentions","newLinks","newConstraints","newAnalysisRequest"];
	for(var i = 0; i < resultList.length; i++){
		outPutString += commentList[i];
		outPutString += '\n';
		outPutString += JSON.stringify(resultList[i]);
		outPutString += '\n';
	}
	fs.writeFile('OutputForMerge.txt', outPutString, (err) => { 
    	// In case of a error throw err. 
    	if (err) throw err; 
	});

}

