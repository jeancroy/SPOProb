import {childrenBudgets, probabilityOfSelection} from "./model";
import {KeyedSum} from "./keyedsum";
import {GroupedValues} from "./groupedvalues";

export class ProbabilitySpoQuery{
    constructor(target, initialBudget,numberOfSteps, availableStyleCosts, snorlaxStyleCosts){
        this.target = target;
        this.initialBudget = initialBudget;
        this.groupedStyleCost = new GroupedValues( availableStyleCosts );
        this.snorlaxStyleCosts = new GroupedValues( snorlaxStyleCosts );
        this.numberOfSteps = numberOfSteps;
    }
}

export class SelectionState{
    /**
     * @param budget {number}
     * @param canDrawOnSnorlax {boolean}
     */
    constructor(budget, canDrawOnSnorlax) {
        this.budget = budget;
        this.canDrawOnSnorlax = canDrawOnSnorlax;

        // Technically stepIndex is part of the state, but it's the same for everyone as we work step by step.

    }

    /**
     * @param state {SelectionState}
     * @returns {number}
     */
    static hash( state ){
        // This will return +- budget as the hash key.
        return state.budget * ( state.canDrawOnSnorlax * 2 - 1);
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
    let previousBudgets = new KeyedSum(SelectionState.hash);

    /** @type {KeyedSum<number>} */
    let currentBudgets = new KeyedSum(SelectionState.hash);


    // Step 1
    // Basically just 1/count below budget.
    selectProbabilityByStep.push( probabilityOfSelection(query, query.initialBudget,1) );
    previousBudgets.add(query.initialBudget,1)

    // Step 2 .. K
    for(let currentStep=1;currentStep<query.numberOfSteps;currentStep++ ){


        currentBudgets.clear();
        for (let {key:state,value:probability} of previousBudgets.entries()  ){
            currentBudgets.addRange( childrenBudgets(query, state, probability))
        }

        // P(select at step k) =
        // sum( P(select|budget) * P(budget)  ) over all possible budgets for this step.

        let prob = 0.0;
        for ( let {key:state,value:probability} of currentBudgets.entries() ){
            prob += probabilityOfSelection(query, state, currentStep) * probability
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





