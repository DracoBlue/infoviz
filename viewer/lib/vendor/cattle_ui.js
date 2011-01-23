/*
 * cattle_ui is licensed under the terms of MIT.
 * 
 * cattle_ui is copyright by DracoBlue 2011.
 */
cattle_ui = {

};

cattle_ui.ui = function(root_type, options, ui_elements)
{
    if (options && typeof options.push === 'function')
    {
        ui_elements = options || [];
        options = {};
    }
    else
    {
        options = options || {};
        ui_elements = ui_elements || [];
    }

    var ui_element = null;
    
    if (options.dom_element)
    {
        var creator = cattle_ui.getCreatorForType(root_type);
        ui_element = new creator(options.dom_element, options);
    }
    else
    {
        ui_element = cattle_ui.createByType(root_type, options);
    }
    
    if (ui_elements.length > 0)
    {
        ui_element.getDomElement().adopt(ui_elements);
    }

    return ui_element;
};

cattle_ui.content = {};

cattle_ui.util = {
    applyHoverEffect: function(dom_element)
    {
        dom_element.addEvent('mouseenter', function()
        {
            dom_element.addClass('ui-state-hover');
        });
        dom_element.addEvent('mouseleave', function()
        {
            dom_element.removeClass('ui-state-hover');
        });
    }
};

cattle_ui.BaseElement = new Class( {

    Implements: [
        Options
    ],

    required_options: [],

    options: {},

    dom_element: null,

    initialize: function(dom_element, options)
    {
        this.setOptions(options);
        this.assertRequiredOptions();

        if (dom_element === null)
        {
            this.revertDomElement();
        }
        else
        {
            this.dom_element = dom_element;
        }

        if (!this.options.dont_apply_behaviour)
        {
            this.applyBehaviour();
        }
    },

    toElement: function()
    {
        return this.dom_element;
    },

    getDomElement: function()
    {
        return this.dom_element;
    },

    assertRequiredOptions: function()
    {
        var required_options = this.required_options;
        var required_options_length = required_options.length;
        for ( var i = 0; i < required_options_length; i++)
        {
            if (typeof this.options[required_options[i]] === 'undefined')
            {
                throw new Error('The option ' + required_options[i] + ' is not set, but is required!');
            }
        }
    }
});

cattle_ui.Widget = new Class( {

    Extends: cattle_ui.BaseElement,

    applyBehaviour: function()
    {
        this.dom_element.addClass('ui-widget');
    },

    revertDomElement: function()
    {
        this.dom_element = new Element('div');
    }

});

cattle_ui.Header = new Class( {

    Extends: cattle_ui.Widget,

    options: {
        size: 3
    },

    required_options: [],

    revertDomElement: function()
    {
        this.dom_element = new Element('h' + this.options.size, {
            'text': this.options.text || ''
        });
    },

    applyBehaviour: function()
    {
        this.parent();
        this.dom_element.addClass('ui-widget-header');
        this.dom_element.addClass('ui-corner-all');
    },

    getSize: function()
    {
        return this.options.size;
    },

    setText: function(text)
    {
        this.dom_element.set('text');
    },

    getText: function()
    {
        return this.dom_element.get('text');
    }

});

cattle_ui.ButtonSet = new Class( {

    Extends: cattle_ui.Widget,

    revertDomElement: function()
    {
        this.dom_element = new Element('div');
    },

    applyBehaviour: function()
    {
        this.parent();
        this.dom_element.addClass('ui-buttonset');
    }

});

cattle_ui.content.WidgetContent = new Class( {

    Extends: cattle_ui.BaseElement,

    applyBehaviour: function()
    {
        this.dom_element.addClass('ui-widget-content');
        this.dom_element.addClass('ui-corner-all');
    }

});

cattle_ui.content.Textarea = new Class( {

    Extends: cattle_ui.content.WidgetContent,

    options: {
        'value': ''
    },

    revertDomElement: function()
    {
        this.dom_element = new Element('textarea', {
            'value': this.options.value
        });
    },

    getValue: function()
    {
        return this.getDomElement().get('value');
    },

    setValue: function(value)
    {
        return this.getDomElement().set('value', value);
    }

});

cattle_ui.content.Input = new Class( {

    Extends: cattle_ui.content.WidgetContent,

    options: {
        'value': ''
    },

    revertDomElement: function()
    {
        this.dom_element = new Element('input', {
            'value': this.options.value
        });
    },

    getValue: function()
    {
        return this.getDomElement().get('value');
    },

    setValue: function(value)
    {
        return this.getDomElement().set('value', value);
    }

});

cattle_ui.Label = new Class( {

    Extends: cattle_ui.Widget,

    required_options: [
        'text'
    ],

    revertDomElement: function()
    {
        this.dom_element = new Element('label', {
            'text': this.options.text
        });
    }

});

cattle_ui.Button = new Class( {

    Extends: cattle_ui.Widget,

    required_options: [],

    options: {
        'text': ''
    },

    revertDomElement: function()
    {
        this.dom_element = new Element('button', {
            'text': this.options.text
        });

        if (this.options.disabled)
        {
            this.dom_element.set('disabled', "disabled");
        }
    },

    applied_events: [],

    applyBehaviour: function()
    {
        this.parent();
        this.dom_element.addClass('ui-button');
        this.dom_element.addClass('ui-button-text-only');
        this.dom_element.addClass('ui-state-default');
        this.dom_element.addClass('ui-corner-all');

        var text = this.dom_element.get('text');

        this.dom_element.empty();
        var span_element = new Element('span', {
            'text': text,
            'class': 'ui-button-text'
        });
        this.dom_element.grab(span_element);

        if (!this.isEnabled())
        {
            this.dom_element.addClass('ui-state-disabled');
        }

        cattle_ui.util.applyHoverEffect(this.dom_element);
    },

    isEnabled: function()
    {
        return this.dom_element.get('disabled') ? false : true;
    },

    enable: function()
    {
        this.options.disabled = false;
        this.dom_element.removeClass('ui-state-disabled');
        this.dom_element.set('disabled');
    },

    disable: function()
    {
        this.options.disabled = true;
        this.dom_element.addClass('ui-state-disabled');
        this.dom_element.set('disabled', 'disabled');
    }

});

cattle_ui.createButton = function(options)
{
    return new cattle_ui.Button(null, options);
};
cattle_ui.createHeader = function(options)
{
    return new cattle_ui.Header(null, options);
};

cattle_ui.content.createTextarea = function(options)
{
    return new cattle_ui.content.Textarea(null, options);
};

cattle_ui.content.createInput = function(options)
{
    return new cattle_ui.content.Input(null, options);
};

cattle_ui.getCreatorForType = function(type_name)
{
    var creator_map = {
        'header': cattle_ui.Header,
        'input': cattle_ui.content.Input,
        'button': cattle_ui.Button,
        'widget': cattle_ui.Widget,
        'button_set': cattle_ui.ButtonSet,
        'textarea': cattle_ui.content.Textarea
    };
    return creator_map[type_name];
};

cattle_ui.createByTypeFromDomElement = function(type_name, dom_element, options)
{

    options = options || {};
    options.dont_apply_behaviour = true;
    var creator = cattle_ui.getCreatorForType(type_name);
    var new_ui_element = new creator(null, options);
    new_ui_element.getDomElement().adopt(dom_element.childNodes);
    new_ui_element.applyBehaviour();
    return new_ui_element;
};

cattle_ui.createByType = function(type_name, options)
{
    var creator = cattle_ui.getCreatorForType(type_name);
    return new creator(null, options);
};

cattle_ui.create = function(parts, root_type)
{
    var ui_elements = [];
    var has_ui_parts = false;
    var options = {};

    for ( var key in parts)
    {
        if (parts.hasOwnProperty(key))
        {
            if (key.substr(0, 1) === ':')
            {
                has_ui_parts = true;
                var type_name = key.substr(1);
                if (type_name.indexOf('+') > 0)
                {
                    type_name = type_name.substr(0, type_name.indexOf('+'));
                }
                ui_elements.push(cattle_ui.create(parts[key], type_name));
            }
            else
            {
                options[key] = parts[key];
            }
        }
    }
    
    if (root_type)
    {
        return this.ui(root_type, options, ui_elements);
    }

    return ui_elements;
};

cattle_ui.createIncludedUiElements = function(dom_element)
{
    var elements = dom_element.getElements('*');
    var elements_length = elements.length;
    for ( var i = 0; i < elements_length; i++)
    {
        var element = elements[i];
        if (element.get('tag').substr(0, 3) == 'ui:')
        {
            var type_name = element.get('tag').substr(3);
            var dom_element = null;
            if (element.hasAttributes())
            {
                var options = {};
                var attributes = element.attributes;
                var attributes_length = attributes.length;
                for ( var a = 0; a < attributes_length; a++)
                {
                    options[attributes[a].name] = attributes[a].value;
                }
                dom_element = cattle_ui.createByTypeFromDomElement(type_name, element, options).getDomElement();
            }
            else
            {
                dom_element = cattle_ui.createByTypeFromDomElement(type_name, element).getDomElement();
            }

            dom_element.inject(element, 'before');
            element.destroy();
        }
    }
};

if (typeof JsBehaviourToolkit !== 'undefined')
{
    JsBehaviourToolkit.registerHandler('ui', cattle_ui.createIncludedUiElements);

    JsBehaviourToolkit.registerHandler('ui_header', cattle_ui.Header);
    JsBehaviourToolkit.registerHandler('ui_button', cattle_ui.Button);
    JsBehaviourToolkit.registerHandler('ui_button_set', cattle_ui.ButtonSet);
    JsBehaviourToolkit.registerHandler('ui_widget', cattle_ui.Widget);
    JsBehaviourToolkit.registerHandler('ui_input', cattle_ui.content.Input);
    JsBehaviourToolkit.registerHandler('ui_textarea', cattle_ui.content.Textarea);
}