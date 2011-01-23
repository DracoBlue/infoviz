project.AttributeSelector = function()
{
    /*
     * Must be kept empty, because of the last line of this file:
     * project.AttributeSelector = new
     * Class(project.AttributeSelector.prototype);
     * 
     * Do initialization stuff in #initialize!
     */
};

project.AttributeSelector.prototype = {

    Implements: [
        Options, Events
    ],

    options: {
        'image_url_generator_function': function(attribute_name)
        {
            return 'preview/' + attribute_name + '.png';
        }
    },

    database: null,

    dom_element: null,

    selected_attribute_image_element: null,
    selected_attribute_name: null,

    attribute_image_elements: [],

    initialize: function(database, options)
    {
        var self = this;
        this.database = database;
        this.setOptions(options);
        this.addEvents(options.events);

        this.dom_element = new Element('ul', {
            'class': 'attribute_selector'
        });

        this.database.retrieveAttributes(function(attributes)
        {
            attributes.each(function(attribute)
            {
                var image = new project.AttributePreviewImageElement(null, {
                    'name': attribute.name
                });

                image.setUrl(self.options.image_url_generator_function(attribute.name));

                image.toElement().getElement('div').addEvent('click', function(event)
                {
                    event.stop();

                    if (self.selected_attribute_image_element)
                    {
                        self.selected_attribute_image_element.removeSelection();
                        self.selected_attribute_name = null;
                    }

                    self.selected_attribute_image_element = image;
                    self.selected_attribute_name = attribute.name;
                    image.addSelection();
                    self.fireEvent('select', [
                        attribute.name
                    ]);
                });

                self.attribute_image_elements.push(image);

                self.dom_element.grab(new Element('li').grab(image));
            });
        });
    },

    regenerateUrls: function()
    {
        var self = this;
        this.attribute_image_elements.each(function(image_element)
        {
            image_element.setUrl(self.options.image_url_generator_function(image_element.getName()));
        });
    },

    getSelectedAttributeName: function()
    {
        return this.selected_attribute_name;
    },

    toElement: function()
    {
        return this.dom_element;
    }
};

project.AttributeSelector = new Class(project.AttributeSelector.prototype);