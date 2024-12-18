const loader = require('./_common/fileLoader');

module.exports = class MongoLoader {
    // constructor(){
    //     this.schemaExtension = schemaExtension
    // }

    load(){
        /** load Mongo Models */
        const models = loader(`./managers/**/*.model.js`);
        return models
    }
}