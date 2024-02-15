
/** @template TKey */
export class KeyedSum {

    constructor() {
        /**
         * @type {Map<TKey,number>}
         */
        this._map = new Map(); // Is this more performant than using a {} as dict ?
    }

    /**
     * @param {TKey} key
     * @param {number} qty
     */
    add(key, qty){
        this._map.set(key, ( this._map.get(key)??0 ) + qty )
    }

    /**
     * @param {Iterable<[TKey,number]>} list
     */
    addRange(list){
        for (let [key,value] of list){
            this.add(key,value)
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


    entries(){
        return this._map.entries();
    }

}




