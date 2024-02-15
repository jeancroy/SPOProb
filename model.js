let filler_value = 2;

/**
 *
 * @param query {ProbabilitySpoQuery}
 * @param budget {number}
 * @param stepIndex {number}
 * @returns {number}
 */

export function probabilityOfSelection(query, budget, stepIndex ){

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

        // Not selected at last step.
        if(query.target !== largestValue) return 0.0;

        // Split 1/count amongst the highest values;
        return 1/largestCount;

    }

    // Otherwise we count number of valid entries and return 1/count;

    let count = query.groupedStyleCost.totalCountAtOrUnder(budget);
    if(count===0) return 0.0; // should not happen because of filler
    return 1.0 / count;
}

/**
 * @generator
 * @param query {ProbabilitySpoQuery}
 * @param parentBudget {number}
 * @param parentProbability {number}
 * @yields [{[number,number]}]
 * @return {Iterable<[number,number]>}
 */

export function *childrenBudgets(query, parentBudget, parentProbability){

    let groupedCost = query.groupedStyleCost;
    let totalCountBelowBudget = groupedCost.totalCountAtOrUnder(parentBudget);
    let countToProbability = parentProbability / totalCountBelowBudget;

    for(let item in groupedCost.sortedEntries()){

        let [cost, count, rank] = item;

        if(cost > parentBudget) // rely on ascending order.
            break;

        let childBudget = parentBudget - cost;
        let probability = count * countToProbability; // count / totalCount * parentProbability

        yield [childBudget, probability]
    }

}
