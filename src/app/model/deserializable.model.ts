/**
 * Interface to facilitate deserializing model
 * The problem is, even though when data comes back from a service
 * its typed as a certain model type its treated as just an object, which won't have
 * access to the functionality in a model's class. This allows us to map an object
 * to a specific class. In many cases this is a non-issue, but if a class model has
 * functions it must be typed properly.
 */
export interface Deserializable {
    deserialize(input: any): this;
}