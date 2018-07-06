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
     * Remove the intention with node ID nodeID
     * from the intentions array
     *
     * @param {String} nodeID
     */
    removeIntention(nodeID) {
    	for (var i = 0; i < this.intentions.length; i++) {
    		if (this.intentions[i].nodeID = nodeID) {
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
            if (this.links[i].linkID = linkID) {
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
            if (this.actors[i].nodeID = nodeID) {
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
	 * @param {String} absoluteValue
	 *   TODO ex. -1, 0,...,n
	 */
    constructor(linkType, linkSrcID, absoluteValue) {
    	this.linkID = this.createID();
    	this.linkType = linkType;
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
}
Link.numOfCreatedInstances = 0;

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
		this.dynamicFunction = null;
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
	 * Sets the function for this Intention
	 */
	setFunction(dynamicFunction) {
		this.dynamicFunction = dynamicFunction;
	}
}
UserIntention.numOfCreatedInstances = 0; // static variable to keep track of number of instances

class EvolvingFunction {

    /**
     * @param {String} intentionID
     * @param {String} stringDynVis
     * @param {Array.<FuncSegment|RepFuncSegment>} functionSegList
     */
	constructor(intentionID, stringDynVis, functionSegList) {
		this.intentionID = intentionID;
		this.stringDynVis = stringDynVis;
		this.functionSegList = functionSegList;
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
	constructor(funcType , funcX, funcStart, funcStop) {
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
     * @param {Number}absTime
     */
	constructor(functionSegList, repNum, absTime) {
		this.functionSegList = functionSegList;
		this.repNum = repNum;
		this.absTime = absTime;
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
	constructor(constraintType, constraintSrcID, constraintSrcEB, constraintDestID, constraintDestEB, absoluteValue) {
		this.constraintType = constraintType;
        this.constraintSrcID = constraintSrcID;
        this.constraintSrcEB = constraintSrcEB;
        this.constraintDestID = constraintDestID;
        this.constraintDestEB = constraintDestEB;
        this.absoluteValue = absoluteValue;
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
