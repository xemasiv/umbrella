/**
 * Class behavior mixin based on:
 * http://raganwald.com/2015/06/26/decorators-in-es7.html
 *
 * Additionally only injects/overwrites properties in target, which are
 * NOT marked with `@nomixin` (i.e. haven't set their `configurable`
 * property descriptor flag to `false`)
 *
 * @param behaviour to mixin
 * @param sharedBehaviour
 * @returns decorator function
 */
export function mixin(behaviour: any, sharedBehaviour = {}) {
    const instanceKeys = Reflect.ownKeys(behaviour),
        sharedKeys = Reflect.ownKeys(sharedBehaviour),
        typeTag = Symbol("isa");

    function _mixin(clazz) {
        for (let key of instanceKeys) {
            const existing = Object.getOwnPropertyDescriptor(clazz.prototype, key);
            if (!existing || existing.configurable) {
                Object.defineProperty(clazz.prototype, key, {
                    value: behaviour[key],
                    writable: true,
                });
            } else {
                console.log(`not patching: ${clazz.name}.${key}`);
            }
        }
        Object.defineProperty(clazz.prototype, typeTag, { value: true });
        return clazz;
    }

    for (let key of sharedKeys) {
        Object.defineProperty(_mixin, key, {
            value: sharedBehaviour[key],
            enumerable: sharedBehaviour.propertyIsEnumerable(key),
        });
    }

    Object.defineProperty(_mixin, Symbol.hasInstance, { value: (x) => !!x[typeTag] });

    return _mixin;
}