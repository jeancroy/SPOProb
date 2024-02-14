import {childrenBudgets, probabilityOfSelection} from "./model";
import {KeyedSum} from "./utils";

export class ProbabilitySpoQuery{
    constructor(target, initialBudget,numberOfSteps, availableStyleCosts){
        this.target = target;
        this.initialBudget = initialBudget;
        this.availableStyleCosts = availableStyleCosts; // available pulls, but only a sorted array of SPO.
        this.numberOfSteps = numberOfSteps;
    }
}

/**
 * @param {ProbabilitySpoQuery} query
 * @returns {number}
 */
export function computeProbabilitySPO(query){

    // Init
    let stepProbabilities = [];
    let previousBudgets = new KeyedSum();
    let currentBudgets = new KeyedSum();

    // Step 1
    // Basically just 1/count below budget.
    stepProbabilities.push( probabilityOfSelection(query, query.initialBudget,1) );
    previousBudgets.add(query.initialBudget,1)
    // todo we should put the uniques 4* above if we support that feature

    // Step 2 .. K
    for(let currentStep=1;currentStep<query.numberOfSteps;currentStep++ ){

        // Transform previous list of budgets and probabilities to current list of budgets and probabilities
        // Starting from every possible previous budget, do every single possible pull once.
        //
        // The number of budgets should be << than the number of pulls.
        // Because pull 100 then pull 200, result in the same budget as pull 200 then 100.
        //
        // To further simplify, we could merge budgets that are very close. say +- 5;
        //
        // If parent budget is less than target, then all the children budgets will get multiplied by 0
        // In the next section, we can safely skip that parent.

        currentBudgets.clear();
        for (let {key:budgetValue,value:budgetProbability} of previousBudgets.values()  ){
            if(budgetValue < query.target) continue;
            currentBudgets.merge( childrenBudgets(query, budgetValue, budgetProbability))
        }

        // P(select at step k) =
        // sum( P(select|budget) * P(budget)  ) over all possible budgets for this step.

        let prob = 0.0;
        for ( let {key:budgetValue,value:budgetProbability} of currentBudgets.values() ){
            prob += probabilityOfSelection(query, budgetValue, currentStep) * budgetProbability
        }

        stepProbabilities.push(prob)

        // When all budgets are bellow target, there's no point of doing more pulls.
        if(prob===0.0) break;

        // current is new previous.
        previousBudgets.swapWith(currentBudgets);

    }

    // Final
    // P(at least one after k steps) = 1 - P(exactly 0 after k steps)
    //
    // P(exactly 0 after k steps) = P(exactly 0 step 1 AND exactly 0 step 2 ... AND exactly 0 step k)
    // P(exactly 0 after k steps) = Product( P(exactly 0 at step i)   )
    //
    // P(exactly 0 at step i) = 1 - P(select target at step i)
    //

    // 1 - ProductOf(1-xi)
    return 1.0 - stepProbabilities.reduce( (state,current) => state * (1.0-current), 1.0 );
}





