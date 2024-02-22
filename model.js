import {SelectionState} from "./prob";

let filler_value = 2;


/**
 *
 * @param query {ProbabilitySpoQuery}
 * @param state {SelectionState}
 * @param stepIndex {number}
 * @return {number}
 */


// Technically stepIndex is part of the state, but it's the same for everyone as we work step by step.

export function probabilityOfSelection(query, state , stepIndex){

    let budget = state.budget;

    // Over budget, target cannot be selected.
    if(query.target>budget) return 0.0;

    // Ensure we have enough space for a filler.
    // This is only needed if target is also a filler.
    if(budget < filler_value) budget = filler_value;

    // Special case for the last step
    if(stepIndex === query.numberOfSteps){

        // The last step will return one item with  the highest value, still below budget.
        let largestIndex = query.groupedStyleCost.largestIndexAtOrUnder(budget);
        let [largestValue, largestCount, largestRank] = query.groupedStyleCost.item(largestIndex);

        if(state.canDrawOnSnorlax){
            // compare largest value non snorlax to largest value with snorlax.
        }

        // Not selected at last step.
        if(query.target !== largestValue) return 0.0;

        // Split 1/count amongst the highest values;
        return 1.0/largestCount;

    }

    // Otherwise we count number of valid entries and return 1/count;

    let count = query.groupedStyleCost.totalCountAtOrUnder(budget);
    if(count===0) return 0.0; // should not happen because of filler
    return 1.0 / count;
}

/**
 * @generator
 * @param query {ProbabilitySpoQuery}
 * @param parentSate {SelectionState}
 * @param parentProbability {number}
 * @yields [{[SelectionState,number]}]
 * @return {Iterable<[SelectionState,number]>}
 */

export function *childrenBudgets(query, parentSate, parentProbability){

    // Total available draw = normal draw + snorlax draw (when available)

    let groupedCost = query.groupedStyleCost;
    let totalCountBelowBudget = groupedCost.totalCountAtOrUnder(parentSate.budget);

    if(parentSate.canDrawOnSnorlax)
        totalCountBelowBudget = query.snorlaxStyleCosts.totalCountAtOrUnder(parentSate.budget);


    let countToProbability = parentProbability / totalCountBelowBudget;

    for(let item in groupedCost.sortedEntries()){

        let [cost, count, rank] = item;

        if(cost > parentSate.budget) // rely on ascending order.
            break;

        // We didn't draw a snorlax now... so just copy parent
        let childBudget = Math.max(parentSate.budget-cost, filler_value);
        let childState = new SelectionState(childBudget,parentSate.canDrawOnSnorlax)
        let probability = count * countToProbability;

        yield [childState, probability]
    }

    if(parentSate.canDrawOnSnorlax){

        for(let item in groupedCost.sortedEntries()){

            let [cost, count, rank] = item;

            if(cost > parentSate.budget) // rely on ascending order.
                break;

            // Set canDrawOnSnorlax to false because we can draw only one.
            let childBudget = Math.max(parentSate.budget-cost, filler_value);
            let childState = new SelectionState(childBudget,false)
            let probability = count * countToProbability;

            yield [childState, probability]
        }

    }

}
