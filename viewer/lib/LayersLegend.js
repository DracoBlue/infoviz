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
    
    enabled_layers: [],

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
                var checkbox = new Element('input', { 
                    'type': 'checkbox',
                    'events': {
                        'change': function()
                        {
                            console.log(self.enabled_layers);
                            var current_index = self.enabled_layers.indexOf(layer);
                            if (current_index !== -1)
                            {
                                self.enabled_layers.splice(current_index, 1);
                            }
                            
                            if (checkbox.checked)
                            {
                                self.enabled_layers.push(layer);
                            }
                            
                            self.fireEvent('change', []);
                        }
                    }
                });
                checkbox.set('checked', true);
                
                self.enabled_layers.push(layer);
                
                self.dom_element.grab(new Element('li', {
                    'style': 'color: #' + layer.color
                }).adopt([new Element('img', {
                    'src': layer.img
                }),
                checkbox,
                new Element('span', {
                    'text': layer.name
                })]));
            });
        });
    },
    
    getEnabledLayers: function()
    {
        return this.enabled_layers;
    },

    toElement: function()
    {
        return this.dom_element;
    }
};

project.LayersLegend = new Class(project.LayersLegend.prototype);
