/*
 * SpludoUI is released under the terms of MIT and
 * copyright by DracoBlue 2010.
 */

spludoui = {};

spludoui.chain = function() {
    var args = arguments;
    var args_length = args.length;

    if (args_length === 0) {
        return;
    }

    var args_pos = 0;

    var start_func = function() {
        args[args_pos](function() {
            args_pos++;
            if (args_length > args_pos) {
                start_func();
            }
        });
    };

    start_func();
};

spludoui.Element = new Class( {

    Implements: [
        Options
    ],

    dom_element: null,

    caption: null,

    initialize: function(options) {
        options = options || {};
        if (options.dom_element) {
            this.dom_element = options.dom_element;
        }
        delete options.dom_element;

        this.caption = options.text || "";
        delete options.text;

        this.setOptions(options);
    },

    getDomElement: function() {
        return this.dom_element;
    },

    getCaption: function() {
        return this.caption;
    }

});

spludoui.Header = new Class( {

    Extends: spludoui.Element,

    options: {
        size: 3
    },

    initialize: function(options) {
        this.parent(options);

        options.text = this.getCaption();

        delete options.size;

        if (this.dom_element === null) {
            this.dom_element = new Element('h' + this.options.size, options);
        }

        this.dom_element.addClass('ui-widget-header');
        this.dom_element.addClass('ui-corner-all');
    }

});

spludoui.Textarea = new Class( {

    Extends: spludoui.Element,

    options: {},

    initialize: function(options) {
        this.parent(options);

        if (this.dom_element === null) {
            this.dom_element = new Element('textarea', options);
        }

        this.dom_element.addClass('ui-widget-content');
        this.dom_element.addClass('ui-corner-all');
    },

    getValue: function() {
        return this.getDomElement().get('value');
    }

});

spludoui.Label = new Class( {

    Extends: spludoui.Element,

    options: {},

    initialize: function(options) {
        this.parent(options);

        if (this.dom_element === null) {
            this.dom_element = new Element('label', options);
        }

        this.dom_element.set('text', this.getCaption());
    }

});

spludoui.Button = new Class( {

    Extends: spludoui.Element,

    initialize: function(options) {
        this.parent(options);

        var state = options.state || "default";
        delete options.state;

        options.href = options.href || "#";
        options.text = this.getCaption();

        if (this.dom_element === null) {
            this.dom_element = new Element('a', options);
        }

        this.dom_element.addEvents( {
            'mouseenter': function() {
                this.addClass('ui-state-hover');
            },
            'mouseleave': function() {
                this.removeClass('ui-state-hover');
            }
        });

        this.dom_element.addClass('ui-state-' + state);
        this.dom_element.addClass('ui-corner-all');
        this.dom_element.addClass('ui-button');
    }

});

spludoui.FormButton = new Class( {

    Extends: spludoui.Element,

    initialize: function(options) {
        this.parent(options);

        var state = options.state || "default";
        delete options.state;

        options['type'] = options['type'] || 'button';
        options.text = this.getCaption();

        if (this.dom_element === null) {
            this.dom_element = new Element('button', options);
        }

        this.dom_element.addEvents( {
            'mouseenter': function() {
                this.addClass('ui-state-hover');
            },
            'mouseleave': function() {
                this.removeClass('ui-state-hover');
            }
        });

        this.dom_element.addClass('ui-state-' + state);
        this.dom_element.addClass('ui-corner-all');
        this.dom_element.addClass('ui-button');
        this.dom_element.addClass('ui-button-text-only');
    }

});

spludoui.FormSelect = new Class( {

    Extends: spludoui.Element,

    initialize: function(options) {
        var self = this;
        this.parent(options);

        this.dom_element = new Element('div');

        var label = new spludoui.Label( {
            'text': this.options.label
        });

        var select_input_wrapper = new Element('div', {
            "class": 'ui-widget-content ui-corner-all ui-input-wrapper'
        });

        this.value_dom_element = new Element('select', {
            "class": 'ui-widget-content'
        }).inject(select_input_wrapper);

        $each(this.options.options, function(value, key) {
            self.value_dom_element.grab(new Element('option', {
                'text': value,
                'value': key
            }));
        });

        this.value_dom_element.set('value', this.options.value);

        this.dom_element.adopt( [
            label.getDomElement(), select_input_wrapper
        ]);
    },
    
    getValueDomElement: function() {
        return this.value_dom_element;
    },

    getValue: function() {
        return this.value_dom_element.get('value');
    },

    setValue: function(value) {
        return this.value_dom_element.set('value', value);
    }

});

spludoui.IconButton = new Class( {

    Extends: spludoui.Element,

    initialize: function(options) {
        this.parent(options);

        var state = options.state || "default";
        delete options.state;

        var icon = options.icon || "bullet";
        delete options.icon;

        options.href = options.href || "#";
        options.text = this.getCaption();

        if (this.dom_element === null) {
            this.dom_element = new Element('a', options);
        } else {
            this.dom_element.empty();
        }

        new Element('span', {
            'class': 'ui-icon ui-icon-' + icon
        }).inject(this.dom_element);

        this.dom_element.addEvents( {
            'mouseenter': function() {
                this.addClass('ui-state-hover');
            },
            'mouseleave': function() {
                this.removeClass('ui-state-hover');
            }
        });

        this.dom_element.addClass('ui-state-' + state);
        this.dom_element.addClass('ui-corner-all');
        this.dom_element.addClass('ui-button');
    }

});

spludoui.Dialog = new Class( {
    Extends: spludoui.Element,

    drag: null,
    
    options: {
        width: 600
    },

    initialize: function(options) {
        var self = this;

        this.parent(options);

        if (this.dom_element === null) {
            this.dom_element = new Element('div', {});
        } else {
            this.dom_element.empty();
        }

        this.dom_element.addClass('ui-dialog');

        this.dom_element.addClass('ui-widget-content');
        this.dom_element.addClass('ui-corner-all');

        this.title_dom_element = new Element('span', {
            'class': 'ui-dialog-title',
            'text': this.options.title
        });

        this.top_close_button_dom_element = new Element('a', {
            'class': 'ui-dialog-titlebar-close ui-corner-all',
            'href': '#',
            'events': {
                'click': function(event) {
                    new Event(event).stop();
                    self.close();
                }
            }
        }).grab(new Element('span', {
            'text': 'close',
            'class': 'ui-icon ui-icon-closethick'
        }));

        this.title_bar_dom_element = new Element('div', {
            'class': 'ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix'
        }).adopt( [
            this.title_dom_element, this.top_close_button_dom_element
        ]).inject(this.dom_element);

        this.content_dom_element = new Element('div', {
            'class': 'ui-dialog-content ui-widget-content'
        });

        this.content_dom_element.inject(this.dom_element);

        this.buttons_bar_dom_element = new Element('div', {
            'class': 'ui-dialog-buttonset form-buttons',
            'style': 'padding: 1em'
        });

        new Element('div', {
            'class': 'ui-dialog-buttonpane ui-widget-content ui-helper-clearfix'
        }).grab(this.buttons_bar_dom_element).inject(this.dom_element);

        if (!this.options.buttons) {
            var close_button = new spludoui.Button( {
                'text': 'Close',
                'events': {
                    'click': function(event) {
                        new Event(event).stop();
                        self.close();
                    }
                }
            });

            close_button.getDomElement().inject(this.buttons_bar_dom_element);
        } else {
            $each(this.options.buttons, function(button_data) {
                var button = new spludoui.Button( {
                    'text': button_data[0],
                    'events': {
                        'click': button_data[1]
                    }
                });

                button.getDomElement().inject(self.buttons_bar_dom_element);
            });
        }

        if (this.options.content) {
            this.setContent(this.options.content);
        }
    },

    getContentDomElement: function() {
        return this.content_dom_element;
    },

    setContent: function(text) {
        this.content_dom_element.set('text', text);
    },

    close: function() {
        this.getDomElement().dispose();
        if (this.drag) {
            this.drag.detach();
            this.drag = null;
        }
    },

    open: function() {
        this.getDomElement().inject($(document.body));

        var window_scroll = $(window).getScroll();
        var window_size = $(window).getSize();

        this.getDomElement().setStyles( {
            'display': 'block',
            'height': 'auto',
            'position': 'absolute',
            'width': this.options.width + 'px',
            'outline': '0 none',
            'z-index': '2',
            'top': (window_scroll.y + 100) + 'px',
            'left': Math.floor((window_size.x - this.options.width) / 2) + 'px'
        });

        this.drag = new Drag.Move(this.getDomElement(), {
            'handle': this.title_bar_dom_element
        });
    }
});

spludoui.Alert = new Class( {

    Extends: spludoui.Dialog,

    options: {},

    initialize: function(message, title, options) {
        this.options.title = title || 'Info';
        this.parent(options);

        this.getContentDomElement().grab(new Element('p', {
            'text': message
        }));
    }
});

spludoui.Notification = new Class( {

    Extends: spludoui.Element,

    text_dom_element: null,

    initialize: function(options) {
        this.parent(options);

        var state = options.state || "highlight";
        delete options.state;
        var icon = options.icon || "info";
        delete options.icon;

        if (this.dom_element === null) {
            this.dom_element = new Element('div', {
                "style": 'margin-bottom:10px'
            });
        } else {
            this.dom_element.empty();
        }

        var panel_dom_element = new Element('div');

        panel_dom_element.addClass('ui-state-' + state);
        panel_dom_element.addClass('ui-corner-all');
        panel_dom_element.addClass('ui-notification-panel');

        var p = new Element('p');

        new Element('span', {
            'class': 'ui-icon ui-icon-info',
            'style': 'float: left; margin-right: 0.3em'
        }).inject(p);

        this.text_dom_element = new Element('span', {
            text: this.getCaption()
        });

        this.text_dom_element.inject(p);

        p.inject(panel_dom_element);

        panel_dom_element.inject(this.dom_element);
    },

    setText: function(text) {
        this.text_dom_element.set('text', text);
    },

    getText: function() {
        return this.text_dom_element.get('text');
    },

    show: function() {
        this.dom_element.fade('hide');
        this.dom_element.setStyle('display', 'block');
        this.dom_element.fade('in');
    },

    hide: function() {
        this.dom_element.setStyle('display', 'none');
        this.dom_element.fade('hide');
    }

});

spludoui.ErrorNotification = new Class( {

    Extends: spludoui.Notification,

    initialize: function(text) {
        var options = {
            state: 'error',
            icon: 'alert',
            text: text
        }
        this.parent(options);
    }

});

spludoui.InfoNotification = new Class( {

    Extends: spludoui.Notification,

    initialize: function(text) {
        var options = {
            state: 'highlight',
            icon: 'info',
            text: text
        }
        this.parent(options);
    }

});

spludoui.TabManager = new Class( {

    Extends: spludoui.Element,

    nav_dom_element: null,

    tabs: [],

    selected_tab_id: null,

    initialize: function(options) {
        var self = this;

        options = options || {};

        if (options.nav_dom_element) {
            this.nav_dom_element = options.nav_dom_element;
        }
        delete options.dom_element;

        this.parent(options);

        if (this.dom_element === null) {
            this.dom_element = new Element('div');
        }

        this.dom_element.addClass('ui-tabs');
        this.dom_element.addClass('ui-widget-content');
        this.dom_element.addClass('ui-corner-all');

        if (this.nav_dom_element === null) {
            this.nav_dom_element = new Element('ul');
            this.nav_dom_element.inject(this.dom_element, 'top');
        }

        this.nav_dom_element.addClass('ui-tabs-nav');
        this.nav_dom_element.addClass('ui-helper-reset');
        this.nav_dom_element.addClass('ui-helper-clearfix');
        this.nav_dom_element.addClass('ui-widget-header');
        this.nav_dom_element.addClass('ui-corner-all');

        this.new_tab_dom_element = new Element('li');
        this.new_tab_dom_element.addClass('ui-state-default');
        this.new_tab_dom_element.addClass('ui-corner-top');

        var a_dom_element = new Element('a', {
            'href': '#',
            'text': '+',
            'events': {
                'click': function(e) {
                    new Event(e).stop();
                    self.options.onNewTab();
                }.bind(this),

                'mouseenter': function() {
                    self.new_tab_dom_element.addClass('ui-state-hover');
                },

                'mouseleave': function() {
                    self.new_tab_dom_element.removeClass('ui-state-hover');
                }
            }
        });

        a_dom_element.inject(this.new_tab_dom_element);

        if (!this.options.onNewTab) {
            this.new_tab_dom_element.setStyle('display', 'none');
        }

        this.new_tab_dom_element.inject(this.nav_dom_element);
    },

    /**
     * @return {Number} Index of the Tab
     */
    addTab: function(options) {
        options = options || {};
        options.id = options.id || $uid( {});

        var li_dom_element = new Element('li');
        li_dom_element.addClass('ui-state-default');
        li_dom_element.addClass('ui-corner-top');

        var a_dom_element = new Element('a', {
            'href': '#',
            'text': options.text,
            'events': {
                'click': function(e) {
                    new Event(e).stop();
                    if (!li_dom_element.hasClass('ui-state-disabled')) {
                        this.selectTab(options.id);
                    }
                }.bind(this),

                'mouseenter': function() {
                    li_dom_element.addClass('ui-state-hover');
                },

                'mouseleave': function() {
                    li_dom_element.removeClass('ui-state-hover');
                }
            }
        });

        a_dom_element.inject(li_dom_element);

        if (options.onRemoveTab) {
            var remove_button = new Element('div', {
                'style': 'float: left; margin-top: 2px;',
                'class': 'ui-state-default ui-corner-all ui-icon-button'
            }).grab(new Element('span', {
                'class': 'ui-icon ui-icon-minus',
                'style': 'cursor-pointer',
                'title': 'Remove',
                'events': {
                    'mouseenter': function() {
                        remove_button.addClass('ui-state-hover');
                    },

                    'mouseleave': function() {
                        remove_button.removeClass('ui-state-hover');
                    },

                    'click': function(event) {
                        new Event(event).stop();
                        options.onRemoveTab(options.id);
                    }
                }
            })).inject(li_dom_element);
        }

        if (options.disabled) {
            li_dom_element.addClass('ui-state-disabled');
        }

        li_dom_element.inject(this.new_tab_dom_element, 'before');

        var panel_dom_element = options.dom_element;

        panel_dom_element.addClass('ui-tabs-panel');
        panel_dom_element.addClass('ui-widget-content');
        panel_dom_element.addClass('ui-corner-bottom');
        panel_dom_element.addClass('ui-tabs-hide');

        panel_dom_element.inject(this.dom_element);

        this.tabs.push( {
            id: options.id,
            nav_dom_element: li_dom_element,
            dom_element: panel_dom_element
        });

        if (this.tabs.length === 1) {
            this.selectTab(options.id);
        }
    },

    getTabById: function(id) {
        var tabs = this.tabs;
        var tabs_length = tabs.length;

        for ( var i = 0; i < tabs_length; i++) {
            if (tabs[i].id == id) {
                return tabs[i];
            }
        }

        throw new Error('Tab with id ' + id + ' is not defined!');
    },

    setTabName: function(id, name) {
        this.getTabById(id).nav_dom_element.getFirst('a').set('text', name);
    },

    disableTab: function(id) {
        this.getTabById(id).nav_dom_element.addClass('ui-state-disabled');
    },

    enableTab: function(id) {
        this.getTabById(id).nav_dom_element.removeClass('ui-state-disabled');
    },

    removeTab: function(id) {
        var tabs = this.tabs;
        var tabs_length = tabs.length;

        var was_selected_one = (this.selected_tab_id == id);

        for ( var i = 0; i < tabs_length; i++) {
            if (tabs[i].id == id) {
                var tab = tabs[i];

                if (was_selected_one) {
                    if (i === 0) {
                        this.selectTab(tabs[1].id);
                    } else {
                        this.selectTab(tabs[i - 1].id);
                    }
                }

                tab.nav_dom_element.destroy();
                tab.dom_element.destroy();

                this.tabs.splice(i, 1);

                return;
            }
        }

        throw new Error('Tab with id ' + id + ' is not defined!');
    },

    selectTab: function(id) {
        var tab = this.getTabById(id);

        if (tab.nav_dom_element.hasClass('ui-state-disabled')) {
            throw new Error('Cannot navigate to tab with id ' + id + ' because it\'s disabled!');
        }

        var previous_selected_tab_id = this.selected_tab_id;

        if (previous_selected_tab_id !== null) {
            var previous_selected_tab = this.getTabById(previous_selected_tab_id);
            previous_selected_tab.nav_dom_element.removeClass('ui-tabs-selected');
            previous_selected_tab.nav_dom_element.removeClass('ui-state-active');
            previous_selected_tab.dom_element.addClass('ui-tabs-hide');
        }

        this.selected_tab_id = id;

        tab.nav_dom_element.addClass('ui-tabs-selected');
        tab.nav_dom_element.addClass('ui-state-active');
        tab.dom_element.removeClass('ui-tabs-hide');
    }

});

spludoui.Pagination = new Class( {

    Extends: spludoui.Element,

    options: {},

    initialize: function(options) {
        this.parent(options);

        var total_pages = Number(this.options.total_pages);
        var page = Number(this.options.page);
        var href_pattern = String(this.options.href_pattern);

        delete this.options.page;
        delete this.options.total_pages;
        delete this.options.href_pattern;

        if (this.dom_element === null) {
            this.dom_element = new Element('div', options);
            this.dom_element.addClass("ui-helper-clearfix");
            this.dom_element.addClass("ui-pagination");

            var dom_element = this.dom_element;
        }

        this.dom_element.empty();

        var areas = [];

        if (total_pages < 10) {
            for (p = 1; p <= total_pages; p++) {
                areas.push(p);
            }
        } else {

            areas.push(1);
            areas.push(2);
            areas.push(3);

            if (page > 9)
                areas.push('');
            if (page > 8)
                areas.push(page - 5);
            if (page > 7)
                areas.push(page - 4);
            if (page > 6)
                areas.push(page - 3);
            if (page > 5)
                areas.push(page - 2);
            if (page > 4 && page < total_pages - 1)
                areas.push(page - 1);
            if (page > 3 && page < total_pages - 2)
                areas.push(page);
            if (page > 2 && page < total_pages - 3)
                areas.push(page + 1);
            if (page > 1 && page < total_pages - 4)
                areas.push(page + 2);
            if (page < total_pages - 5)
                areas.push(page + 3);
            if (page < total_pages - 6)
                areas.push(page + 4);
            if (page < total_pages - 7)
                areas.push(page + 5);
            if (page < total_pages - 8)
                areas.push('');

            areas.push(total_pages - 2);
            areas.push(total_pages - 1);
            areas.push(total_pages);
        }

        var areas_length = areas.length;

        for (p = 0; p < areas_length; p++) {
            var paginate_area = areas[p];

            if (paginate_area === '') {
                var page_div = new Element('div', {
                    "style": "float: left; margin-top: 6px; min-width: 16px; text-align: center",
                    "class": "ui-state-default ui-state-disabled ui-corner-all ui-icon-button",
                    "text": '...'
                });

                page_div.inject(this.dom_element);
            } else {
                var page_div = new Element('div', {
                    "style": "float: left; margin-top: 6px; min-width: 16px; text-align: center; width: default",
                    "class": "ui-state-default ui-corner-all ui-icon-button",
                    'events': {
                        'mouseenter': function() {
                            this.addClass('ui-state-hover');
                        },

                        'mouseleave': function() {
                            this.removeClass('ui-state-hover');
                        }
                    }

                });

                if (paginate_area === page) {
                    page_div.addClass("ui-state-active");
                }

                new Element('a', {
                    "style": "display: block;",
                    "href": href_pattern.replace("{page}", paginate_area),
                    "text": paginate_area
                }).inject(page_div);

                page_div.inject(this.dom_element);
            }

        }
    }

});

spludoui.Navigation = new Class( {

    Extends: spludoui.Element,

    nav_dom_element: null,

    entries: [],

    next_entry_key: 1,

    initialize: function(options) {
        options = options || {};

        this.parent(options);

        if (this.dom_element === null) {
            this.dom_element = new Element('div');
        }

        if (this.nav_dom_element === null) {
            this.nav_dom_element = new Element('ul');
            this.nav_dom_element.inject(this.dom_element, 'top');
        }

        var search_text = '';

        var onNewSearchText = function() {
            if (search_text != this.search_field_dom_element.get('value')) {
                search_text = this.search_field_dom_element.get('value');

                var search_for = search_text.toLowerCase();

                var entries = this.entries;
                var entries_length = entries.length;

                var whitelist = {};
                var silver_whitelist = {};
                var black_whitelist = {};

                for ( var e = 0; e < entries_length; e++) {
                    var a_dom_element = entries[e].retrieve('a');
                    if (a_dom_element.get('text').toLowerCase().indexOf(search_for) !== -1) {
                        whitelist[entries[e].retrieve('key')] = entries[e];
                        delete silver_whitelist[entries[e].retrieve('key')];
                        delete black_whitelist[entries[e].retrieve('key')];
                        entries[e].setStyle('display', 'block');
                        a_dom_element.removeClass('ui-state-disabled');

                        var its_parent = entries[e].retrieve('parent');
                        while (its_parent) {
                            its_parent.setStyle('display', 'block');
                            delete black_whitelist[its_parent.retrieve('key')];
                            if (whitelist[its_parent.retrieve('key')]) {
                                /*
                                 * Already on the whitelist!
                                 */
                            } else {
                                silver_whitelist[its_parent.retrieve('key')] = its_parent;
                            }
                            its_parent = its_parent.retrieve('parent');
                        }

                    } else {
                        black_whitelist[entries[e].retrieve('key')] = entries[e];
                    }
                }

                $each(black_whitelist, function(element) {
                    element.setStyle('display', 'none');
                });
                $each(silver_whitelist, function(element) {
                    element.retrieve('a').addClass('ui-state-disabled');
                });
            }
        }.bind(this);

        this.search_field_dom_element = new Element('input', {
            'class': 'ui-widget-content ui-corner-all',
            'style': 'width: 100%',
            'events': {
                'keyup': function() {
                    onNewSearchText();
                },
                'change': function() {
                    onNewSearchText();
                }
            }
        });
        this.search_field_dom_element.inject(this.dom_element, 'top');
    },

    addEntry: function(options) {
        var li_dom_element = new Element('li');

        li_dom_element.store('key', this.next_entry_key++);

        var a_dom_element = new Element('a', {
            'href': options.href,
            'text': options.text,
            'style': 'padding: 5px; margin: 5px',
            'events': {
                'mouseenter': function() {
                    a_dom_element.addClass('ui-state-hover');
                },

                'mouseleave': function() {
                    a_dom_element.removeClass('ui-state-hover');
                }
            }
        });

        li_dom_element.store('a', a_dom_element);

        a_dom_element.addClass('ui-state-default');
        a_dom_element.addClass('ui-corner-all');
        a_dom_element.addClass('ui-helper-reset');
        a_dom_element.addClass('ui-helper-clearfix');

        a_dom_element.inject(li_dom_element);

        if (options.disabled) {
            a_dom_element.addClass('ui-state-disabled');
        }

        if (options.parent) {
            if (!options.parent.retrieve('ul')) {
                var ul = new Element('ul');
                ul.inject(options.parent);
                options.parent.store('ul', ul);
            }
            li_dom_element.store('parent', options.parent);
            li_dom_element.inject(options.parent.retrieve('ul'));
        } else {
            li_dom_element.inject(this.nav_dom_element);
        }

        this.entries.push(li_dom_element);
    }

});
