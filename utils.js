class KeyedItem{
    constructor(key,value) {
        /**
         * @type {any}
         */
        this.key=key;
        /**
         * @type {number}
         */
        this.value=value;
    }
}

export class KeyedSum {

    constructor() {
        /**
         * @type {Map<any,KeyedItem>}
         */
        this._map = new Map(); // Is this more performant than using a {} as dict ?
    }

    /**
     * @param {any} key
     * @param {number} qty
     */
    add(key, qty){
        if(this._map.has(key))
            this._map.get(key).value += qty;  // Without the new KeyedItem we need a pair of get()/set(), see which option is best.
        else
            this._map.set(key, new KeyedItem(key,qty) );
    }

    /**
     * @param {KeyedSum} other
     */
    merge(other){
        for (let {key,value} of other.values()){
            this.add(key,value)
        }
    }

    /**
     * @param func {function(number, any, ...):number}
     */
    transform(func){
        for (let item of this._map.values()){
            item.value = func(item.value, item.key);
        }
    }

    /**
     * @param other {KeyedSum}
     */
    swapWith(other){
        let tmp = this._map;
        this._map = other._map;
        other._map = tmp;
    }

    clear(){
        this._map.clear();
    }

    values(){
        return this._map.values();
    }


    // [Symbol.iterator](){ // Webstorm say 0 usage... so maybe we need another way to get iterator.
    //     return this._map.values();
    // }

}

// Find the last position for which arr[i] <= target
// Is it worth binary search instead of say reduce ?
// We'll do that count a very large number of time.

export function count_at_or_below(arr, target)
{
    let start = 0;
    let end = target.length - 1;

    while (start <= end) {
        let mid = ((start + end) / 2)|0;

        if (arr[mid] === target){
            end=mid;
            break;
        }

        else if (arr[mid] < target)
            start = mid + 1;

        else
            end = mid - 1;
    }

    // Maybe an off-by-one bug here ?
    while (end<target.length && arr[end] === target){end++}
    return end-1;

}