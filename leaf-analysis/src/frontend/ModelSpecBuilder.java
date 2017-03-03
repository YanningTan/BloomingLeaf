package frontend;


import simulation.Actor;
import simulation.Contribution;
import simulation.ContributionType;
import simulation.Decomposition;
import simulation.DecompositionType;
import simulation.Dependency;
import simulation.EpochConstraint;
import simulation.IntentionalElement;
import simulation.IntentionalElementDynamicType;
import simulation.LinkableElement;

public class ModelSpecBuilder {
	public static ModelSpecPojo buildModelSpec(FrontendModel frontendModel){
		
		ModelSpecPojo modelSpec = new ModelSpecPojo();

		try{
			
		
		if(!frontendModel.actors.isEmpty()){
			for(DataActor dataActor: frontendModel.actors){
				modelSpec.getActors().add(new Actor(dataActor.nodeId, dataActor.nodeName, dataActor.nodeType));
			}
		}
		
	
		if(!frontendModel.intentions.isEmpty()){
			for (DataIntention dataIntention : frontendModel.intentions) {
				Actor nodeActor = null;
				if(!dataIntention.nodeActorID.equals("-"))
					for(Actor tmp : modelSpec.getActors()){
			        	if(dataIntention.nodeActorID.equals(tmp.getId())){
			        		 nodeActor = tmp;
			        		 break;
			        	}	
			        }
				IntentionalElement element = new IntentionalElement(dataIntention.nodeID, dataIntention.nodeName, nodeActor, dataIntention.nodeType, false);
				modelSpec.getIntElements().add(element);
			}
		}
		
		if(!frontendModel.links.isEmpty()){
			for(DataLink dataLink : frontendModel.links){
				LinkableElement src = null;
				LinkableElement dest = null;
		        for(IntentionalElement tmp : modelSpec.getIntElements()){
		        	if(dataLink.linkSrcID.equals(tmp.getId()))
		        		 src = tmp;
				    if(dataLink.linkDestID.equals(tmp.getId()))
				         dest = tmp;				 
		        }
		        
		        if (DecompositionType.getByCode(dataLink.linkType) != null)
		        	modelSpec.getDecomposition().add(new Decomposition(src, dest, DecompositionType.getByCode(dataLink.linkType)));
		        else if (ContributionType.getByCode(dataLink.linkType) != null)
		        	modelSpec.getContribution().add(new Contribution(src, dest, ContributionType.getByCode(dataLink.linkType)));
		        else if (dataLink.linkType.equals("DEP") || dataLink.linkType.equalsIgnoreCase("DEPENDS"))
		        	modelSpec.getDependency().add(new Dependency(dest, src));		//TODO: Figure out if these should be flipped.
			}
		}

		if(!frontendModel.dynamics.isEmpty()){
			for(DataDynamic dataDynamic : frontendModel.dynamics){
				String intentionID = dataDynamic.intentionID;
				String dynamicType = dataDynamic.dynamicType;
				String markedValue = dataDynamic.markedValue;
				
				for(IntentionalElement it : modelSpec.getIntElements()){
		        	if(intentionID.equals(it.getId())){
		        		it.setDynamicType(IntentionalElementDynamicType.getByCode(dataDynamic.dynamicType), Integer.parseInt(frontendModel.maxEpoch));
		        		//if (dynamicType.equals("UD"))
		        		//	it.setUserDefinedDynamicType(line, this.maxEpoch);				        			
		        		//else if (result.length > 3){
						//	it.setDynamicFunctionMarkedValue(Integer.parseInt(markedValue));
						//}  
		        	}
		        }				
			}

		}

		if(!frontendModel.constraints.isEmpty()){
			for(DataConstraint dataConstraint : frontendModel.constraints){
				String constraintType = dataConstraint.constraintType;
				String constraintSrcID = dataConstraint.constraintSrcID;
				String constraintSrcEB = dataConstraint.constraintSrcEB;
				if (constraintType.equals("A")){
					String absoluteValue = dataConstraint.absoluteValue;
					IntentionalElement src = null;
					for(IntentionalElement tmp : modelSpec.getIntElements()){
						if(constraintSrcID.equals(tmp.getId()))
							src = tmp;
					}
					modelSpec.getConstraintsBetweenEpochs().add(new EpochConstraint(constraintType, src, constraintSrcEB, absoluteValue));
				}else{
					String constraintDestID = dataConstraint.constraintDestID;
					String constraintDestEB = dataConstraint.constraintDestEB;
					IntentionalElement src = null;
					IntentionalElement dest = null;
					for(IntentionalElement tmp : modelSpec.getIntElements()){
						if(constraintSrcID.equals(tmp.getId()))
							src = tmp;
						if(constraintDestID.equals(tmp.getId()))
							dest = tmp;				 
					}
					modelSpec.getConstraintsBetweenEpochs().add(new EpochConstraint(constraintType, src, dest, constraintSrcEB, constraintDestEB));
				}				
			}
		}

		if(!frontendModel.queries.isEmpty()){
			for(DataQuery dataQuery : frontendModel.queries){
				String constraintSrcID = dataQuery.constraintSrcID;
				String constraintSrcEB = dataQuery.constraintSrcEB;
				String constraintType = dataQuery.constraintType;
				String constraintDestID = dataQuery.constraintDestID;
				String constraintDestEB = dataQuery.constraintDestEB;
				IntentionalElement src = null;
				IntentionalElement dest = null;
		        for(IntentionalElement tmp : modelSpec.getIntElements()){
		        	if(constraintSrcID.equals(tmp.getId()))
		        		 src = tmp;
				    if(constraintDestID.equals(tmp.getId()))
				         dest = tmp;				 
		        }
		        modelSpec.getConstraintsBetweenEpochs().add(new EpochConstraint(constraintType, src, dest, constraintSrcEB, constraintDestEB));	
			}
		}
		
		if(!frontendModel.histories.isEmpty()){
			for(DataHistory dataHistory : frontendModel.histories){
				int numHistory = Integer.parseInt(dataHistory.numHistory);
				int numIntentions = Integer.parseInt(dataHistory.numIntentions);
				int numTimePoints = Integer.parseInt(dataHistory.numTimePoints);
				modelSpec.setHistory(new int[numHistory][numIntentions][numTimePoints]);

				for (int i = 0; i < numHistory; i ++)
					for (int j = 0; j < numIntentions; j++){
						for (int k = 0; k < numTimePoints; k++)
							modelSpec.getHistory()[i][j][k] = dataHistory.history_array[k];
					}
				break;			
	
			}		
		}
		
		}catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
		return modelSpec;

	}
}
