project.AttributeDatabase = function()
{
    /*
     * Must be kept empty, because of the last line of this file:
     * project.AttributeDatabase = new Class(project.AttributeDatabase.prototype);
     * 
     * Do initialization stuff in #initialize!
     */
};

project.AttributeDatabase.prototype = {

    Implements: [
        Options, Events
    ],

    options: {
    },

    initialize: function(options)
    {
        this.setOptions(options);
    },
    
    retrieveAttributes: function(callback)
    {
        setTimeout(function() {
            callback([{
                'name': 'AW'
            },{
                'name': 'CD'
            }]);
        }, 1);
    }

};

project.AttributeDatabase = new Class(project.AttributeDatabase.prototype);