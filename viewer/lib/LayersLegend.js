project.LayersLegend = function()
{
    /*
     * Must be kept empty, because of the last line of this file:
     * project.LayersLegend = new
     * Class(project.LayersLegend.prototype);
     * 
     * Do initialization stuff in #initialize!
     */
};

project.LayersLegend.prototype = {

    Implements: [
        Options, Events
    ],

    options: {
    },

    database: null,

    dom_element: null,

    initialize: function(database, options)
    {
        var self = this;
        this.database = database;
        this.setOptions(options);

        this.dom_element = new Element('ul', {
            'class': 'layers_legend'
        });

        this.database.retrieveLayers(function(layers)
        {
            layers.each(function(layer)
            {
                self.dom_element.grab(new Element('li', {
                    'style': 'color: #' + layer.color
                }).adopt([new Element('img', {
                    'src': layer.img
                }), new Element('span', {
                    'text': layer.name,
                })]));
            });
        });
    },

    toElement: function()
    {
        return this.dom_element;
    }
};

project.LayersLegend = new Class(project.LayersLegend.prototype);
