project.AttributePreviewImageElement = function()
{
};

project.AttributePreviewImageElement.prototype = {

    Extends: cattle_ui.Widget,

    required_options: [],

    options: {},

    revertDomElement: function()
    {
        this.dom_element = new Element('li', {
            'text': this.options.text
        });
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
        this.image_element = new Element('img', {
            'src': '#',
            'title': this.options.caption,
            'style': 'width: 100px; height: 100px; margin: 10px'
        });
        this.dom_element.grab(this.image_element);
        cattle_ui.util.applyHoverEffect(this.dom_element);
    },

    setUrl: function(url)
    {
        this.image_element.set('src', url);
    },

    removeSelection: function()
    {
        this.dom_element.removeClass('ui-state-highlight');
    },

    addSelection: function()
    {
        this.dom_element.addClass('ui-state-highlight');
    },

    getName: function()
    {
        return this.options.name;
    }

};

project.AttributePreviewImageElement = new Class(project.AttributePreviewImageElement.prototype);