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
    selected_attribute_id: null,

    attribute_image_elements: [],

    attribute_image_element_for_attribute_name: {},

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
                    'name': attribute.name,
                    'id': attribute.id,
                    'caption': attribute.caption
                });

                self.attribute_image_element_for_attribute_name[attribute.name] = image;

                image.setUrl(self.options.image_url_generator_function(attribute.name));

                image.toElement().getElement('img').addEvent('click', function(event)
                {
                    event.stop();
                    self.select(attribute.name);
                });

                self.attribute_image_elements.push(image);

                self.dom_element.grab(image);
            });
        });
    },

    regenerateUrls: function()
    {
        var self = this;
        this.attribute_image_elements.each(function(image_element)
        {
            image_element.setUrl(self.options.image_url_generator_function(image_element.getName(), image_element.getId()));
        });
    },

    getSelectedAttributeName: function()
    {
        if (!this.selected_attribute_name)
        {
            throw new Error('Nothing selected, yet!');
        }
        return this.selected_attribute_name;
    },

    getSelectedAttributeId: function()
    {
        if (!this.selected_attribute_id)
        {
            throw new Error('Nothing selected, yet!');
        }
        return this.selected_attribute_id;
    },

    select: function(attribute_name)
    {
        var image = this.attribute_image_element_for_attribute_name[attribute_name];
        
        if (!image)
        {
            throw new Error('The attribute: ' + attribute_name + ' is not a valid option');
        }

        if (this.selected_attribute_image_element)
        {
            this.selected_attribute_image_element.removeSelection();
            this.selected_attribute_name = null;
        }

        this.selected_attribute_image_element = image;
        this.selected_attribute_name = attribute_name;
        this.selected_attribute_id = image.getId();
        image.addSelection();
        this.fireEvent('select', [
            attribute_name
        ]);
    },

    toElement: function()
    {
        return this.dom_element;
    }
};

project.AttributeSelector = new Class(project.AttributeSelector.prototype);
