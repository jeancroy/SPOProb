import {childrenBudgets, probabilityOfSelection} from "./model";
import {KeyedSum} from "./keyedsum";
import {GroupedValues} from "./groupedvalues";

export class ProbabilitySpoQuery{
    constructor(target, initialBudget,numberOfSteps, availableStyleCosts){
        this.target = target;
        this.initialBudget = initialBudget;
        this.groupedStyleCost = new GroupedValues( availableStyleCosts );
        this.numberOfSteps = numberOfSteps;
    }
}

/**
 * @param {ProbabilitySpoQuery} query
 * @returns {number}
 */
export function computeProbabilitySPO(query){

    // Init
    let selectProbabilityByStep = [];

    /** @type {KeyedSum<number>} */
    let previousBudgets = new KeyedSum();

    /** @type {KeyedSum<number>} */
    let currentBudgets = new KeyedSum();

    // Step 1
    // Basically just 1/count below budget.
    selectProbabilityByStep.push( probabilityOfSelection(query, query.initialBudget,1) );
    previousBudgets.add(query.initialBudget,1)
    // todo we should put the uniques 4* above if we support that feature

    // Step 2 .. K
    for(let currentStep=1;currentStep<query.numberOfSteps;currentStep++ ){

        // Starting from every possible previous budget, do every single possible pull once.
        //
        // The number of different budgets should be << than the number of pull combinations
        // Because "pull 100 then pull 200", result in the same budget as "pull 200 then 100",
        // Or even "pull 175 then pull 125"
        //
        // If we are ok with approximations, we could merge budgets that are very close. say +- 5;
        //
        // If parent budget is less than target, then all the children of that budgets will get multiplied by 0
        // (P(select)==0), we can safely skip that parent.

        currentBudgets.clear();
        for (let [budgetValue,budgetProbability] of previousBudgets.entries()  ){
            if(budgetValue < query.target) continue;
            currentBudgets.addRange( childrenBudgets(query, budgetValue, budgetProbability))
        }

        // P(select at step k) =
        // sum( P(select|budget) * P(budget)  ) over all possible budgets for this step.

        let prob = 0.0;
        for ( let [budgetValue,budgetProbability] of currentBudgets.entries() ){
            prob += probabilityOfSelection(query, budgetValue, currentStep) * budgetProbability
        }

        selectProbabilityByStep.push(prob)

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
    return 1.0 - selectProbabilityByStep.reduce( (state,current) => state * (1.0-current), 1.0 );
}





