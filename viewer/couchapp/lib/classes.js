project = {};

project.PageController = new Class({

    Implements: [Options, Events],

    views: {},

    is_attribute_on: {},

    parameters: {},

    initialize: function(dom_element, options)
    {
        var self = this;
        this.setOptions(options);

        var attribute_chooser_view = new project.AttributeChooserView($('controls'), {
            controller: this
        });

        [
                {
                    'name': 'Vorschubdruck (oberer Sektor)',
                    'key': 'AW'
                },
                {
                    'name': 'Druckantrieb Förderschnecke',
                    'key': 'CE'
                },
                {
                    'name': 'Erddrucksensor (oben)',
                    'key': 'BX'
                }
        ].forEach(function(attribute) {
            self.is_attribute_on[attribute.key] = false;
            attribute_chooser_view.addAttribute(attribute);
        });

        this.setView('attribute_chooser', attribute_chooser_view);

        var previous_hash = null;
        (function() {
            var new_hash = document.location.hash.substr(1);
            if (previous_hash !== new_hash)
            {
                previous_hash = new_hash;
                self.triggerParametersUpdate();
            }
        }).periodical(300);
    },

    getParametersFromUrl: function()
    {
        var hash = document.location.hash.substr(1);
        if (hash === '')
        {
            return {};
        }
        return hash.parseQueryString();
    },

    triggerParametersUpdate: function()
    {
        var new_parameters = this.getParametersFromUrl();

        for (var key in new_parameters)
        {
            if (new_parameters.hasOwnProperty(key))
            {
                if (key.substr(0, 3) === 'ac_')
                {
                    var attribute_key = key.substr(3);
                    if (new_parameters[key] === "true")
                    {
                        this.is_attribute_on[attribute_key] = true;
                        this.getView('attribute_chooser').activateAttribute(attribute_key);
                    }
                    else
                    {
                        this.is_attribute_on[attribute_key] = false;
                        this.getView('attribute_chooser').deactivateAttribute(attribute_key);
                    }
                }
            }
        }
    },

    setParameter: function(key, value)
    {
        var old_parameters = this.getParametersFromUrl();
        old_parameters[key] = value;
        document.location.hash = '#' + new Hash(old_parameters).toQueryString();
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
        if (this.is_attribute_on[key])
        {
            this.setParameter('ac_' + key, false);
        }
        else
        {
            this.setParameter('ac_' + key, true);
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
                'click': function(event) {
                    event.stop();
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
