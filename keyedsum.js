
export class KeyValuePair {
    constructor(key,value) {
        this.key = key;
        this.value = value;
    }
}


/** @template TKey */
export class KeyedSum {

    /**
     * @param hashFunc {CallableFunction<TKey,number|string>}
     */
    constructor(hashFunc) {
        /**
         * @type {Map<number|string, KeyValuePair<TKey,number>>}
         */
        this._map = new Map(); // Is this more performant than using a {} as dict ?
        this._hashFunc = hashFunc || (x=>x);
    }

    /**
     * @param hashFunc {CallableFunction<TKey,number|string>}
     */
    configureHash(hashFunc){
        this._hashFunc = hashFunc;
    }

    /**
     * @param {TKey} key
     * @param {number} qty
     */
    add(key, qty){

        let mapkey = this._hashFunc(key);

        if(this._map.has(mapkey)){
            this._map.get(mapkey).value += qty;
        }
        else{
            this._map.set(mapkey, new KeyValuePair(key,qty))
        }

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


    /**
     *
     * @return {IterableIterator<KeyValuePair<TKey, number>>}
     */
    entries(){
        return this._map.values();
    }

}




