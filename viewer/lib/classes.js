project = {};

project.PageController = new Class({

    Implements: [Options, Events],

    views: {},

    is_attribute_on: {},

    initialize: function(dom_element, options)
    {
        var self = this;
        this.setOptions(options);

        var attribute_chooser_view = new project.AttributeChooserView($('controls'), {
            controller: this
        });

        [
                {
                    'name': 'Bohrkopfdrehmoment',
                    'key': 'moveit'
                }
        ].forEach(function(attribute) {
            self.is_attribute_on[attribute.key] = false;
            attribute_chooser_view.addAttribute(attribute);
        });

        this.setView('attribute_chooser', attribute_chooser_view);
    },

    setView: function(key, instance)
    {
        this.views[key] = instance;
    },

    getView: function(key)
    {
        if (typeof this.views[key] === 'undefined')
        {
            throw new Error('View with key ' + key + ' not found!');
        }

        return this.views[key];
    },
    
    toggleAttribute: function(key)
    {
        this.is_attribute_on[key] = this.is_attribute_on[key] ? false : true;
        if (this.is_attribute_on[key])
        {
            this.getView('attribute_chooser').activateAttribute(key);
        }
        else
        {
            this.getView('attribute_chooser').deactivateAttribute(key);
        }
    }

});

project.Slider = new Class({
    
    Implements: [Options, Events],

    initialize: function(dom_element, options)
    {
        this.setOptions(options);
    }
});

project.AttributeChooserView = new Class({

    Implements: [Options, Events],

    dom_element: null,

    controller: null,

    attribute_controls: {},
    
    initialize: function(dom_element, options)
    {
        this.dom_element = dom_element;
        this.setOptions(options);
        this.controller = options.controller;
    },

    addAttribute: function(data)
    {
        var self = this;

        var button = new spludoui.Button({
            'text': data.name,
            'events': {
                'click': function() {
                    self.controller.toggleAttribute(data.key);
                }
            }
        });
        data.button = button;
        this.attribute_controls[data.key] = data;

        this.dom_element.grab(button.getDomElement());
    },

    activateAttribute: function(key)
    {
        this.attribute_controls[key].button.getDomElement().addClass('ui-state-active');
    },

    deactivateAttribute: function(key)
    {
        this.attribute_controls[key].button.getDomElement().removeClass('ui-state-active');
    }
});


$(window).addEvent('domready', function() {
    project.page_controller = new project.PageController();
});
