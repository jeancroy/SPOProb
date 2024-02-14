import {count_at_or_below, count_below, KeyedSum} from "./utils";

let filler_value = 2;

/**
 *
 * @param query {ProbabilitySpoQuery}
 * @param budget {number}
 * @param stepIndex {number}
 * @returns {number}
 */
export function probabilityOfSelection(query, budget, stepIndex ){

    // Over budget, cannot be selected.
    if(query.target>budget) return 0.0;

    // Ensure we have enough space for a filler.
    // This is only needed if target is also a filler.
    if(budget<filler_value) budget = filler_value;

    // Count
    let count = count_at_or_below(query.availableStyleCosts, budget);


    // On the last pull, target is only selected if it's the largest below budget.
    // The list of sorted cost might be not expressive enough to compute that.

    if(stepIndex === query.numberOfSteps){
        return query.availableStyleCosts[count] === query.target ? 1.0:0.0;
    }

    // Probability = 1/count is only valid if target is in the list. If not we should return 0;

    if(count===0) return 0.0; // should not happen because of filler
    return 1.0 / count;
}

export function childrenBudgets(costList, parentBudget, parentProbability){

    let budgetSums = new KeyedSum();
    let total = 0;

    for (let cost of costList){
        // This assumes costList is sorted in ascending order.
        if(cost > parentBudget) break;
        let childBudget = parentBudget - cost
        budgetSums.add(childBudget, 1) // add 1 is a count
        total++;
    }

    // from count to probability
    let factor = parentProbability/total;
    budgetSums.transform(count =>  factor * count );

    return budgetSums;

}
