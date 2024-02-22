import {KeyedSum} from "./keyedsum";


export class GroupedValues{

    /**
     * @param valueList {Iterable<number>}
     */
    constructor(valueList) {

        /**
         * @type {number[]}
         */
        this.uniqueValues = []

        /**
         * @type {number[]}
         */
        this.counts = []

        /**
         * @type {number[]}
         */
        this.ranks = []

        // Get counts
        let ks = new KeyedSum();
        for(let item in valueList)
            ks.add(item, 1);

        // Export to a sortable list
        let sortable = Array.from(ks.entries());
        sortable.sort( (x,y) => x[0]-y[0]); // ascending order first item of tuple

        // Split into their array
        this.uniqueValues = sortable.map(x=>x[0]);
        this.counts = sortable.map(x=>x[1]);

        // cumulative sum of counts
        let sum = 0
        this.ranks = this.counts.map(x => sum += x);

    }


    *sortedEntries(){

        let n = this.uniqueValues.length;
        for (let i=0;i<n;i++){
             yield [this.uniqueValues[i],this.counts[i],this.ranks[i]];
        }

    }

    largestIndexAtOrUnder(limit){
        return indexAtOrBelow(this.uniqueValues, limit);
    }

    totalCountAtOrUnder(limit){
        let idx = indexAtOrBelow(this.uniqueValues, limit);
        if(idx===-1) return 0;

        return this.ranks[idx];
    }

    item(index){
        return [this.uniqueValues[index],this.counts[index],this.ranks[index]];
    }


}

// Find the last index which arr[i] <= target
function indexAtOrBelow(arr, target)
{
    if(target < arr[0]) return -1;
    if(target >= arr[arr.length-1]) return arr.length-1;

    let n = arr.length;
    let left = 0;
    let right = n-1;

    while (left < right) {
        let mid = (right + left) >> 1; // (int)floor(a+b)/2

        // if target is present in array
        if (arr[mid] === target) {

            // Place cursor after duplicates.
            while ((mid + 1) < n && arr[mid + 1] === target)
                mid++;

            return mid;
        }

        else if (arr[mid] > target)
            right = mid;
        else
            left = mid + 1;
    }

    // The range collapse on the first number larger-than, we seek smaller than or equal.
    while (left > -1 && arr[left] > target)
        left--;

    return left;
}




