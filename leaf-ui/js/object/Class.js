class Model {

    /**
     * Attributes: 
     * {Array.<Actor>} actors
     * {Array.<UserIntention>} intentions
     * {Array.<Link>} links
     * {Array.<Constraint>} constraints
     * {String} maxAbsTime
     */
    constructor() {
        this.actors = []; 
        this.intentions = [];
        this.links = [];
        this.constraints = [];
        this.maxAbsTime;
    }

    /**
     * Returns the UserIntention with node ID
     * nodeID
     *
     * @param {String} nodeID
     * @returns {UserIntention}
     */
    getUserIntentionByID(nodeID) {
    	for (var i = 0; i < this.intentions.length; i++) {
    		if (this.intentions[i].nodeID == nodeID) {
    			return this.intentions[i];
    		}
    	}
    }

    /**
     * Returns the Actor with nodeID nodeID
     *
     * @param {String} nodeID
     * @returns {Actor}
     */
    getActorByID(nodeID) {
    	for (var i = 0; i < this.actors.length; i++) {
    		if (this.actors[i].nodeID == nodeID) {
    			return this.actors[i];
    		}
    	}
    }

    /**
     * Returns the Links with linkID linkID
     *
     * @param {String} linkID
     * @returns {Link}
     */
    getLinkByID(linkID) {
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].linkID == linkID) {
                return this.links[i];
            }
        }
    }

    /**
     * Returns the absolute Constraint object with 
     * constraintSrcID srcID and source epoch boundary
     * srcEB
     *
     * @param {String} srcID
     * @param {String} source
     * @returns {Number}
     */
    getAbsConstBySrcID(srcID, srcEB) {
        for (var i = 0; i < this.constraints.length; i++) {
            if (this.constraints[i].constraintType === 'A' && 
                this.constraints[i].constraintSrcID === srcID &&
                this.constraints[i].constraintSrcEB === srcEB) {
                return this.constraints[i];
            }
        }
    }

    /**
     * Sets the absolute value for the absolute Constraint object
     * with constraintSrcID srcID 
     *
     * @param {String} srcID
     * @param {String} srcEB
     * @param {Number} absVal
     */
    setAbsConstBySrcID(srcID, srcEB, absVal) {
        var constraint = this.getAbsConstBySrcID(srcID, srcEB);
        constraint.absoluteValue = absVal;
    }

    /**
     * Remove the intention with node ID nodeID
     * from the intentions array
     *
     * @param {String} nodeID
     */
    removeIntention(nodeID) {
    	for (var i = 0; i < this.intentions.length; i++) {
    		if (this.intentions[i].nodeID == nodeID) {
    			this.intentions.splice(i, 1);
    			return;
    		}
    	}
    }

    /**
     * Remove the intention with link ID linkID
     * from the links array
     *
     * @param {String} linkID
     */
    removeLink(linkID) {
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].linkID == linkID) {
                this.links.splice(i, 1);
                return;
            }
        }
    }

	/**
     * Remove the Actor with node ID nodeID
     * from the actors array and update all intentions
     * that was embedded within the embedded actor
     *
     * @param {String} nodeID
     */
    removeActor(nodeID) {

    	for (var i = 0; i < this.actors.length; i++) {
            if (this.actors[i].nodeID == nodeID) {
                this.actors.splice(i, 1);
      			break;
            }
        }
    }


}

class Actor {

	/**
	 * @param {String} nodeID
	 *   ID of this node. ex: ('a000')
	 * @param {String} nodeName
	 *   Name of this node. ex: ('Actor_0')
	 * @param {Array.<String>} intentionsIDs
	 *   Array of intention IDs, for the intentions
	 *   embedded inside this actor
	 */
	constructor(nodeName) {
		this.nodeID = this.createID();
		this.nodeName = nodeName;
		this.intentionIDs = [];
	}

	/**
     * Creates and returns a 4 digit ID for this Actor
     *
     * @returns {String}
     */
    createID() {
        var id = Actor.numOfCreatedInstances.toString();
        Actor.numOfCreatedInstances += 1;
        while (id.length < 3){
            id = '0' + id;
        }
        return 'a' + id;
    }

    /**
     * Removes intention ID nodeID from the
     * intentionIDs array
     *
     * @param{String} nodeID
     */
    removeIntentionID(nodeID) {
    	for (var i = 0; i < this.intentionIDs.length; i++) {
    		if (this.intentionIDs[i] == nodeID) {
    			this.intentionIDs.splice(i, 1);
    			return ;
    		}
    	}
    }
}
Actor.numOfCreatedInstances = 0;


class AnalysisResult {


	/**
	 * @param {Array.<String>} assignedEpoch
	 * @param {Array.<String>} timePointPath
     *   Each element represents a time point in the analysis
     *   ex: ['0', '7']
	 * @param {Number} timePointPathSize
     *   Size of the time point path. ex: 2
	 * @param {Object} values
     *   Maps an intention ID and time point to a string which
     *   represents the evaluation for that intention
     *   ex: {'0000': {'0': '0000', '7': 'DNE'}}
     *   (for nodeID 0000, time point 0, its satisfaction value is none)
	 */
	constructor(assignedEpoch, timePointPath, timePointPathSize, values) {
        this.assignedEpoch = assignedEpoch;
        this.timePointPath = timePointPath;
        this.timePointPathSize = timePointPathSize;
        this.values = values;
	}
}

class Link {

	/**
	 * @param {String} linkType
	 *   Type of the link. ex: 'AND', 'OR', 'NO', etc.
	 * @param {String} linkSrcID
	 *   ID for the source of the link. ex: '0000'
	 * @param {String} linkDestID
	 *   ID for the destination of the link. ex: '0001'
	 * @param {Number} absoluteValue
	 *   TODO ex. -1, 0,...,n
	 */
    constructor(linkType, linkSrcID, absoluteValue) {
    	this.linkID = this.createID();
    	this.linkType = linkType;
        this.postType = null;
    	this.linkSrcID = linkSrcID;
    	this.linkDestID = null;
    	this.absoluteValue = absoluteValue;
    }

    /**
     * Creates and returns a 4 digit ID for this link
     *
     * @returns {String}
     */
    createID() {
        var id = Link.numOfCreatedInstances.toString();
        Link.numOfCreatedInstances += 1;
        while (id.length < 4){
            id = '0' + id;
        }
        return id;
    }

    /**
     * Returns true iff this Link object represents
     * an evolving relationship
     * @returns {Boolean}
     */
    isEvolvingRelationship() {
        return this.postType != null;
    }
}
Link.numOfCreatedInstances = 0;

class EvolvingFunction {

    /**
     * @param {String} intentionID
     * @param {String} stringDynVis
     * @param {Array.<FuncSegment|RepFuncSegment>} functionSegList
     */
	constructor(intentionID) {
		this.intentionID = intentionID;
		this.stringDynVis = null;
		this.functionSegList = [];
	}

    /**
     * Returns the 4 digit representation for this 
     * EvolvingFunction's ith function segment
     *
     * @param {Number} i
     * @returns {String}
     */
    getMarkedVal(i) {
        return this.functionSegList[i].funcX;
    }

    /**
     * Returns the funcStop value for the last
     * function segment for this EvolvingFunction
     * Returns null if functionSegList is empty
     *
     * returns {String | null}
     */
    getLastStopValue() {
        len = this.functionSegList.length
        if (len > 0) {
            return this.functionSegList[len - 1].funcStop;
        }
    }

    /**
     * Creates a new RepFuncSegment object containing function 
     * segments in the relative time interval [time1, time2], and add it to this
     * EvolvingFunction's functionSegList, in place of the function
     * segements in the time interval [time1, time2]
     *
     * @param {String} time1
     *   first relative time point
     * @param {String} time2
     *   second relative time point
     */
    setRepeatingFunction(time1, time2) {

        this.removeRepFuncSegments();

        // find the index of the FuncSegment with start time time 1
        var startIndex = 0;
        while (this.functionSegList[startIndex].funcStart !== time1) {
            startIndex++;
        }

        var repFuncSegments = [];

        // push and remove, until we see a segment with our desired FuncEnd time
        while (this.functionSegList[startIndex].funcStop !== time2) {
            repFuncSegments.push(this.functionSegList[startIndex]);
            this.functionSegList.splice(startIndex, 1);
        }

        // push and remove the last segment
        repFuncSegments.push(this.functionSegList[startIndex]);
        this.functionSegList.splice(startIndex, 1);


        // create and add a new RepFuncSegment
        var repFuncSegment = new RepFuncSegment(repFuncSegments);
        this.functionSegList.splice(startIndex, 0, repFuncSegment);
    }

    /**
     * Returns the FuncSegment in this EvolvingFunction's
     * functionSegList, with the relative start time time
     *
     * @param {String} time
     * @returns {FuncSegment}
     */
    findSegmentByStartTime(time) {
        for (var i = 0; i < this.functionSegList; i++) {
            if (this.functionSegList[i].funcStart === time) {
                return this.functionSegList[i];
            }
        }
    }

    /**
     * If a RepFuncSegment exists in this EvolvingFunction's
     * functionSegList, retrieve the FuncSegments in the RepFuncSegment,
     * remove the RepFuncSEgment and add the retrieved FuncSegments back
     * into their correct positions in functionSegList
     *
     * Id a RepFuncSegment does not exist in functionSegList, this function
     * does nothing
     */
    removeRepFuncSegments() {

        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }

        var repFuncSegment = this.functionSegList[repIndex];
        // remove RepFuncSegment object from array
        this.functionSegList.splice(repIndex, 1);

        // add the FuncSegments back into the array
        var j = repIndex;
        for (var i = 0; i < repFuncSegment.functionSegList.length; i++) {
            this.functionSegList.splice(j, 0, repFuncSegment.functionSegList[i]);
            j++;
        }
    }

    /**
     * Sets the repNum for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to count
     *
     * If there is no RepFuncSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} count
     */
    setRepNum(num) {
        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }
        this.functionSegList[repIndex].repNum = num;
    }


    /**
     * Sets the absTime for the RepFuncSegment inside of this
     * EvolvingFunction's functionSegList, to time
     *
     * If there is no RepFuncSegment object in functionSegList
     * this function does nothing
     *
     * @param {Number} time
     */
    setAbsoluteTime(time) {
        var repIndex = this.getRepFuncSegmentIndex();
        if (repIndex === -1) {
            return;
        }
        this.functionSegList[repIndex].absTime = time;
    }



    /**
     * Returns the index of the RepFuncSegment object
     * in this EvolvingFunction's functionSegList
     *
     * Returns -1 if there is no RepFunccSegment object
     * in functionSegList
     *
     * @returns {Number}
     */
    getRepFuncSegmentIndex() {
        // Find the index where the RepFuncSegment is located
        var repIndex = 0;
        while (repIndex < this.functionSegList.length && (!(this.functionSegList[repIndex] instanceof RepFuncSegment))) {
            repIndex++;
        }

        // RepFuncSegment did not exist in functionSegList
        if (repIndex >= this.functionSegList.length) {
            return - 1;
        }

        return repIndex;
    }
}

class FuncSegment {

    /**
	 *
     * @param {String} funcType
     * @param {String} funcX
     * @param {String} funcStart
     * @param {String} funcStop
     */
	constructor(funcType, funcX, funcStart, funcStop) {
		this.funcType = funcType;
		this.funcX = funcX;
        this.funcStart = funcStart;
        this.funcStop = funcStop;
	}
}

class RepFuncSegment {

    /**
	 *
     * @param {Array.<FuncSegment>} functionSegList
     * @param {Number} repNum
     * @param {Number} absTime
     */
	constructor(functionSegList) {
		this.functionSegList = functionSegList;
		this.repNum = $("#repeat-end2").val();
		this.absTime = $("#repeat-end3").val();
	}
}

class Constraint {

    /**
	 *
     * @param {String} constraintType
     * @param {String} constraintSrcID
     * @param {String} constraintSrcEB
     * @param {String} constraintDestID
     * @param {String} constraintDestEB
     * @param {Number} absoluteValue
     */
	constructor(constraintType, constraintSrcID, constraintSrcEB, constraintDestID, constraintDestEB) {
		this.constraintType = constraintType;
        this.constraintSrcID = constraintSrcID;
        this.constraintSrcEB = constraintSrcEB;
        this.constraintDestID = constraintDestID;
        this.constraintDestEB = constraintDestEB;
        this.absoluteValue = -1;
	}
}

class IntentionEvaluation {

    /**
	 *
     * @param {String} intentionID
     * @param {String} absTime
     * @param {String} evaluationValue
     */
	constructor(intentionID, absTime, evaluationValue) {
		this.intentionID = intentionID;
		this.absTime = absTime;
		this.evaluationValue = evaluationValue;
	}
}

class UserIntention {

    /**
     * @param {String} nodeActorID
     *   The ID of the actor that this intention is embedded in
     *   ex: 'a0000' (actor ID), '-' (if there is no actor) 
     * @param {String} nodeType
     *   Type of the intention. 
     *   Will be one of these four: 'basic.Goal', 'basic.Task', 'basic.Softgoal', 'basic.Resource'
     * @param {String} nodeName
     */
    constructor(nodeActorID, nodeType, nodeName) {
        this.nodeActorID = nodeActorID;
        this.nodeID = this.createID();
        this.nodeType = this.getShortenedNodeType(nodeType);
        this.nodeName = nodeName;
        this.dynamicFunction = new EvolvingFunction(this.nodeID);
    }

    /**
     * Returns a shortened version of type
     *
     * @param {String} type
     * @returns {String}
     */
    getShortenedNodeType(type) {
        return type[6];
    }

    /**
     * Changes the initial satisfaction value for this UserIntention
     * to initValue and clears the this UserIntention's EvolvingFunction's
     * functionSegmentList
     *
     * @param {String} initValue
     */
    changeInitialSatValue(initValue) {
        var intentionEval = analysisRequest.getIntentionEvaluationByID(this.nodeID, '0');
        intentionEval.evaluationValue = initValue;

        // if there is only one function segment, and its constant, then we need to
        // change the function segment's marked value

        var funcSegList = this.dynamicFunction.functionSegList;
        
        if (this.dynamicFunction.stringDynVis == 'C' ||
            (this.dynamicFunction.stringDynVis == 'UD' && funcSegList[0].funcType == 'C')) {
            funcSegList[0].funcX = initValue;
        }

        this.dynamicFunction.functionSegList = [];
    }
 
    /**
     * Creates and returns a 4 digit ID for this node
     * 
     * @returns {String}
     */
    createID() {
        var id = UserIntention.numOfCreatedInstances.toString();
        UserIntention.numOfCreatedInstances += 1;
        while (id.length < 4){
                id = '0' + id;
        }
        return id;
    }

    /**
     * Returns the 4 digit representation for this 
     * UserIntention's initial satisfaction value
     *
     * @returns {String}
     */
    getInitialSatValue() {
        var intentionEval = analysisRequest.getIntentionEvaluationByID(this.nodeID, '0');
        return intentionEval.evaluationValue;
    }

    /**
     * Returns the number of function segments for this
     * UserIntention
     *
     * @returns {Number}
     */
    getNumOfFuncSegements() {
        return this.dynamicFunction.functionSegList.length;
    }

    /**
     * Clears all FuncSegments for this UserIntention's
     * EvolvingFunction and adds new FuncSegments according to the current
     * function type.
     */
    setEvolvingFunction(funcType) {
        this.dynamicFunction.stringDynVis = funcType;
        this.dynamicFunction.functionSegList = [];

        // Since function changed, remove all current absolute constraints related to this intention
        this.removeAbsCosnt();

        // Add new absolute constraints if required
        this.addAbsConst(funcType);

        var initValue = analysisRequest.getIntentionEvaluationByID(this.nodeID, '0').evaluationValue;

        if (funcType == 'C' || funcType == 'R' || funcType == 'I' || funcType == 'D' || funcType == 'UD') {
            if (funcType == 'C') {
                var seg = new FuncSegment(funcType, initValue, '0', 'Infinity');
            } else if (funcType == 'R') {
                // the marked value for a Stochastic function is always 0000
                var seg = new FuncSegment(funcType, '0000', '0', 'Infinity');
            } else if (funcType == 'I' || funcType == 'D') {
                var seg = new FuncSegment(funcType, null, '0', 'Infinity');
            } else if (funcType == 'UD') {
                var seg = new FuncSegment('C', initValue, '0', 'A');
            }
            this.dynamicFunction.functionSegList.push(seg);
        } else if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' || funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            if (funcType == 'RC') {
                // Stochastic and Constant
                var seg1 = new FuncSegment('R', '0000', '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'CR') {
                // Constant and Stochastic
                var seg1 = new FuncSegment('C', initValue, '0', 'A');
                var seg2 = new FuncSegment('R', '0000', 'A', 'Infinity');
            } else if (funcType == 'MP') {
                // Increase and Constant
                var seg1 = new FuncSegment('I', null, '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'MN') {
                // Decrease and Constant
                var seg1 = new FuncSegment('D', null, '0', 'A');
                var seg2 = new FuncSegment('C', null, 'A', 'Infinity');
            } else if (funcType == 'SD') {
                // Constant and Constant
                var seg1 = new FuncSegment('C', '0011', '0', 'A');
                var seg2 = new FuncSegment('C', '1100', 'A', 'Infinity');
            } else if (funcType == 'DS') {
                // Constant and Constant
                var seg1 = new FuncSegment('C', '1100', '0', 'A');
                var seg2 = new FuncSegment('C', '0011', 'A', 'Infinity');
            }
            this.dynamicFunction.functionSegList.push(seg1, seg2);
        }
    }

    /**
     * Adds a new Constraint object int the global model variable, 
     * representing an absolute constraint, if requried.
     *
     * If funcType is RC, CR, MP, MN, SD, DS  a Constraint object
     * representin an absolute constraint will be added. If not, this
     * function does not do anything
     *
     * @param {String} funcType
     *   ex: 'RC'
     */
    addAbsConst(funcType) {
        if (funcType == 'RC' || funcType == 'CR' || funcType == 'MP' ||
            funcType == 'MN' || funcType == 'SD' || funcType == 'DS') {
            model.constraints.push(new Constraint('A', this.nodeID, 'A', null, null));
        }
    }


    /**
     * Returns the absolute time for this UserIntention's absolute constraint at
     * the starting epoch boundary start
     *
     * @param {String} source
     *  ex. 'A'
     */
    getAbsConstTime(source) {
        return model.getAbsConstBySrcID(this.nodeID, source).absoluteValue;
    }

    /**
     * Removes the absolute Constraint object(s) for this UserIntention from 
     * the global model variable, if such absolute Constraint object(s) exists
     */
    removeAbsCosnt() {
        var i = 0;
        while (i < model.constraints.length) {
            var constraint = model.constraints[i];
            if (constraint.constraintType == 'A' && constraint.constraintSrcID === this.nodeID) {
                model.constraints.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    /**
     * Adds a new FuncSeg to the end of this Intention's EvolvingFunction's
     * function list.

     * Also adds a corresponding Constraint object reprenting an absolute constraint
     * into the global model variable.
     *
     *This function should only be used to add new function
     * segments for user defined functions
     *
     * @param {String} funcType
     *   ex: 'C'
     * @param {String} satValue
     *   ex: '0000'
     */
    addUserDefinedSeg(funcType, satValue){

        var len = this.dynamicFunction.functionSegList.length;
        var start = this.dynamicFunction.functionSegList[len - 1].funcStop;
        var code = start.charCodeAt(0) + 1;
        var stop = String.fromCharCode(code);
        this.dynamicFunction.functionSegList.push(new FuncSegment(funcType, satValue, start, stop));
        model.constraints.push(new Constraint('A', this.nodeID, start, null, null));

    }
    /**
     * Sets the marked value for the FuncSegments in the
     * EvolvingFunction for this UserIntention
     *
     * This function will only be called for I, D, RC, MP, MN functions
     */
    setMarkedValueToFunction(satValue) {
        var funcType = this.dynamicFunction.stringDynVis;

        var len = this.dynamicFunction.functionSegList.length;
        this.dynamicFunction.functionSegList[len - 1].funcX = satValue;

        if (funcType == 'MP' || funcType == 'MN') {
            this.dynamicFunction.functionSegList[0].funcX = satValue;
        }
    }

    /**
     * Sets the function type and marked value for the
     * last FuncSegment for this UserIntention's EvolvingFunction
     *
     * @param {String} funcValue
     */
    setUserDefinedSegment(funcValue) {
        var funcSegLen = this.dynamicFunction.functionSegList.length;
        var funcSeg = this.dynamicFunction.functionSegList[funcSegLen - 1];
        funcSeg.funcType = funcValue;
        if (funcValue == 'C') {
            funcSeg.funcX == '0000';
        } else if (funcValue == 'R') {
            // the marked value for a Stochastic function is always 0000
            funcSeg.funcX = '0000';
        } else if (funcValue == 'I') {
            funcSeg.funcX = '0011';
        } else if (funcValue == 'D') {
            funcSeg.funcX ='1100';
        }
    }

    /**
     * Sets the satisfaction value for the last function segment 
     * in this Intention's evolving function, to satVal
     *
     * @param {String} satVal
     *   ex: '0000'
     */
    updateLastFuncSegSatVal(satVal) {
        var funcSegList = this.dynamicFunction.functionSegList; 
        var funcSegLen = this.dynamicFunction.functionSegList.length;

        var lastObj = funcSegList[funcSegLen - 1];

        if (lastObj instanceof FuncSegment) {
            lastObj.funcX = satVal;

        } else {
            // the last segment is inside of the repeat range and is
            // stored inside of the RepFuncSegment object
            var repSegList = lastObj.functionSegList;
            var repSegLen = repSegList.length;
            repSegList[repSegLen - 1].funcX = satVal;
        }
    }
}
UserIntention.numOfCreatedInstances = 0; // static variable to keep track of number of instances

class AnalysisRequest {

    /**
	 *
     * @param {String} action
     * @param {String} conflictLevel
     * @param {String} numRelTime
     * @param {String} absTimePts
     * @param {String} currentState
     * @param {Array.<IntentionEvaluation>} userAssignmentsList
     * @param {AnalysisResult} previousAnalysis
     */
	constructor() {
		this.action = null;
		this.conflictLevel = null;
		this.numRelTime = null;
		this.absTimePts = null;
		this.currentState = null;
		this.userAssignmentsList = [];
		this.previousAnalysis = null;
    }

    /**
     * Returns the IntentionEvaluation object
     * with node id nodeID with absolute time point
     * absTime. If the desired IntentionEvaluation does
     * not exist, returns null.
     *
     * @param {String} nodeID
     *  ID of the intention
     * @param {String} absTime
     *  The desired absolute time
     * @returns {IntentionEvaluation | null}
     */
    getIntentionEvaluationByID(nodeID, absTime) {
        for (var i = 0; i < this.userAssignmentsList.length; i++) {
            if (this.userAssignmentsList[i].intentionID == nodeID &&
                this.userAssignmentsList[i].absTime == absTime) {
                return this.userAssignmentsList[i];
            } 
        }
    }
	
	/**
	 * Removes all IntentionEvaluation objects in
	 * userAssignmentsList, with an intentionID equal to 
	 * nodeID
	 *
	 * @param {String}
	 */
	removeIntention(nodeID) {
		var i = 0;

		while (i < this.userAssignmentsList.length) {
			if (this.userAssignmentsList[i].intentionID == nodeID) {
				this.userAssignmentsList.splice(i, 1);
			} else {
				i++;
			}
		}
	}
}
