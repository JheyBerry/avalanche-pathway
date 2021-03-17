"use strict";
/**
 * @packageDocumentation
 * @module Utils-PersistanceOptions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistanceOptions = void 0;
/**
 * A class for defining the persistance behavior of this an API call.
 *
 */
class PersistanceOptions {
    /**
     *
     * @param name The namespace of the database the data
     * @param overwrite True if the data should be completey overwritten
     * @param MergeRule The type of process used to merge with existing data: "intersection", "differenceSelf", "differenceNew", "symDifference", "union", "unionMinusNew", "unionMinusSelf"
     *
     * @remarks
     * The merge rules are as follows:
     *   * "intersection" - the intersection of the set
     *   * "differenceSelf" - the difference between the existing data and new set
     *   * "differenceNew" - the difference between the new data and the existing set
     *   * "symDifference" - the union of the differences between both sets of data
     *   * "union" - the unique set of all elements contained in both sets
     *   * "unionMinusNew" - the unique set of all elements contained in both sets, excluding values only found in the new set
     *   * "unionMinusSelf" - the unique set of all elements contained in both sets, excluding values only found in the existing set
     */
    constructor(name, overwrite = false, mergeRule) {
        this.name = undefined;
        this.overwrite = false;
        this.mergeRule = 'union';
        /**
         * Returns the namespace of the instance
         */
        this.getName = () => this.name;
        /**
         * Returns the overwrite rule of the instance
         */
        this.getOverwrite = () => this.overwrite;
        /**
         * Returns the [[MergeRule]] of the instance
         */
        this.getMergeRule = () => this.mergeRule;
        this.name = name;
        this.overwrite = overwrite;
        this.mergeRule = mergeRule;
    }
}
exports.PersistanceOptions = PersistanceOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc2lzdGVuY2VvcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3BlcnNpc3RlbmNlb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7QUFHSDs7O0dBR0c7QUFDSCxNQUFhLGtCQUFrQjtJQXNCNUI7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0YsWUFBWSxJQUFXLEVBQUUsWUFBb0IsS0FBSyxFQUFFLFNBQW1CO1FBckM3RCxTQUFJLEdBQVUsU0FBUyxDQUFDO1FBRXhCLGNBQVMsR0FBVyxLQUFLLENBQUM7UUFFMUIsY0FBUyxHQUFhLE9BQU8sQ0FBQztRQUV6Qzs7V0FFRztRQUNGLFlBQU8sR0FBRyxHQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRWxDOztXQUVHO1FBQ0YsaUJBQVksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRTdDOztXQUVHO1FBQ0YsaUJBQVksR0FBRyxHQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBbUI1QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUEzQ0gsZ0RBMkNHIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgVXRpbHMtUGVyc2lzdGFuY2VPcHRpb25zXG4gKi9cblxuaW1wb3J0IHsgTWVyZ2VSdWxlIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuLyoqXG4gKiBBIGNsYXNzIGZvciBkZWZpbmluZyB0aGUgcGVyc2lzdGFuY2UgYmVoYXZpb3Igb2YgdGhpcyBhbiBBUEkgY2FsbC5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBQZXJzaXN0YW5jZU9wdGlvbnMge1xuICAgIHByb3RlY3RlZCBuYW1lOnN0cmluZyA9IHVuZGVmaW5lZDtcbiAgXG4gICAgcHJvdGVjdGVkIG92ZXJ3cml0ZTpib29sZWFuID0gZmFsc2U7XG4gIFxuICAgIHByb3RlY3RlZCBtZXJnZVJ1bGU6TWVyZ2VSdWxlID0gJ3VuaW9uJztcbiAgXG4gICAvKipcbiAgICAqIFJldHVybnMgdGhlIG5hbWVzcGFjZSBvZiB0aGUgaW5zdGFuY2VcbiAgICAqL1xuICAgIGdldE5hbWUgPSAoKTpzdHJpbmcgPT4gdGhpcy5uYW1lO1xuICBcbiAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgb3ZlcndyaXRlIHJ1bGUgb2YgdGhlIGluc3RhbmNlXG4gICAgKi9cbiAgICBnZXRPdmVyd3JpdGUgPSAoKTpib29sZWFuID0+IHRoaXMub3ZlcndyaXRlO1xuICBcbiAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgW1tNZXJnZVJ1bGVdXSBvZiB0aGUgaW5zdGFuY2VcbiAgICAqL1xuICAgIGdldE1lcmdlUnVsZSA9ICgpOk1lcmdlUnVsZSA9PiB0aGlzLm1lcmdlUnVsZTtcbiAgXG4gICAvKipcbiAgICAqXG4gICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZXNwYWNlIG9mIHRoZSBkYXRhYmFzZSB0aGUgZGF0YVxuICAgICogQHBhcmFtIG92ZXJ3cml0ZSBUcnVlIGlmIHRoZSBkYXRhIHNob3VsZCBiZSBjb21wbGV0ZXkgb3ZlcndyaXR0ZW5cbiAgICAqIEBwYXJhbSBNZXJnZVJ1bGUgVGhlIHR5cGUgb2YgcHJvY2VzcyB1c2VkIHRvIG1lcmdlIHdpdGggZXhpc3RpbmcgZGF0YTogXCJpbnRlcnNlY3Rpb25cIiwgXCJkaWZmZXJlbmNlU2VsZlwiLCBcImRpZmZlcmVuY2VOZXdcIiwgXCJzeW1EaWZmZXJlbmNlXCIsIFwidW5pb25cIiwgXCJ1bmlvbk1pbnVzTmV3XCIsIFwidW5pb25NaW51c1NlbGZcIlxuICAgICpcbiAgICAqIEByZW1hcmtzXG4gICAgKiBUaGUgbWVyZ2UgcnVsZXMgYXJlIGFzIGZvbGxvd3M6XG4gICAgKiAgICogXCJpbnRlcnNlY3Rpb25cIiAtIHRoZSBpbnRlcnNlY3Rpb24gb2YgdGhlIHNldFxuICAgICogICAqIFwiZGlmZmVyZW5jZVNlbGZcIiAtIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGV4aXN0aW5nIGRhdGEgYW5kIG5ldyBzZXRcbiAgICAqICAgKiBcImRpZmZlcmVuY2VOZXdcIiAtIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG5ldyBkYXRhIGFuZCB0aGUgZXhpc3Rpbmcgc2V0XG4gICAgKiAgICogXCJzeW1EaWZmZXJlbmNlXCIgLSB0aGUgdW5pb24gb2YgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYm90aCBzZXRzIG9mIGRhdGFcbiAgICAqICAgKiBcInVuaW9uXCIgLSB0aGUgdW5pcXVlIHNldCBvZiBhbGwgZWxlbWVudHMgY29udGFpbmVkIGluIGJvdGggc2V0c1xuICAgICogICAqIFwidW5pb25NaW51c05ld1wiIC0gdGhlIHVuaXF1ZSBzZXQgb2YgYWxsIGVsZW1lbnRzIGNvbnRhaW5lZCBpbiBib3RoIHNldHMsIGV4Y2x1ZGluZyB2YWx1ZXMgb25seSBmb3VuZCBpbiB0aGUgbmV3IHNldFxuICAgICogICAqIFwidW5pb25NaW51c1NlbGZcIiAtIHRoZSB1bmlxdWUgc2V0IG9mIGFsbCBlbGVtZW50cyBjb250YWluZWQgaW4gYm90aCBzZXRzLCBleGNsdWRpbmcgdmFsdWVzIG9ubHkgZm91bmQgaW4gdGhlIGV4aXN0aW5nIHNldFxuICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZTpzdHJpbmcsIG92ZXJ3cml0ZTpib29sZWFuID0gZmFsc2UsIG1lcmdlUnVsZTpNZXJnZVJ1bGUpIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLm92ZXJ3cml0ZSA9IG92ZXJ3cml0ZTtcbiAgICAgIHRoaXMubWVyZ2VSdWxlID0gbWVyZ2VSdWxlO1xuICAgIH1cbiAgfVxuICAiXX0=