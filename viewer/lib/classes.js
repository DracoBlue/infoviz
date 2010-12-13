project = {};

project.chain = function () {
        var args = arguments;
        var args_length = args.length;

        if (args_length === 0) {
                return ;
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

project.PageController = new Class({

    Implements: [Options, Events],

    views: {},

    is_attribute_on: {},

    parameters: {},

    min_ring: 123,
    max_ring: 262,

    initialize: function(dom_element, options)
    {
        var self = this;
        this.setOptions(options);

        var attribute_chooser_view = new project.AttributeChooserView($('controls'), {
            controller: this
        });

        var graph_view = new project.GraphView($('graph'), {
            controller: this
        });

        var slider_view = new project.SliderView($('slider'), {
            controller: this
        });

        self.attributes = {};
        [
                {
                    'name': 'Vorschubdruck (oberer Sektor)',
                    'default': true,
                    'color': '255,0,0', 
                    'shape': 'square',
                    'scale': 1.0,
                    'key': 'AW'
                },
                {
                    'name': 'Druckantrieb Förderschnecke',
                    'color': '255,0,255', 
                    'shape': 'ring',
                    'scale': 1.0,
                    'key': 'CE'
                },
                {
                    'name': 'Erddrucksensor (oben)',
                    'color': '0,0,255', 
                    'shape': 'diamond',
                    'scale': 100.0,
                    'key': 'BX'
                }
        ].forEach(function(attribute) {
            self.is_attribute_on[attribute.key] = false;
            attribute_chooser_view.addAttribute(attribute);
            self.attributes[attribute.key] = attribute;
        });

        this.setView('attribute_chooser', attribute_chooser_view);
        this.setView('graph', graph_view);
        this.setView('slider', slider_view);

        var previous_hash = null;
        (function() {
            var new_hash = document.location.hash.substr(1);
            if (previous_hash !== new_hash)
            {
                previous_hash = new_hash;
                self.triggerParametersUpdate();
            }
        }).periodical(100);
    },

    getRingCount: function()
    {
        return this.max_ring - this.min_ring + 1;
    },

    getMaxRing: function()
    {
        return this.max_ring;
    },

    getMinRing: function()
    {
        return this.min_ring;
    },

    getSegmentsCount: function()
    {
        return 30;
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

        for (var key in this.is_attribute_on)
        {
            if (this.is_attribute_on.hasOwnProperty(key))
            {
                    if (new_parameters["ac_"+key] === "true" || (typeof new_parameters["ac_"+key] === "undefined" && this.attributes[key].default))
                    {
                        this.is_attribute_on[key] = true;
                        this.getView('attribute_chooser').activateAttribute(key);
                    }
                    else
                    {
                        
                        this.is_attribute_on[key] = false;
                        this.getView('attribute_chooser').deactivateAttribute(key);
                    }
            }
        }

        var min_changed = (this.min_ring != new_parameters['min_c']) ? true : false;
        var max_changed = (this.max_ring != new_parameters['max_c']) ? true : false;

        this.min_ring = parseInt(new_parameters['min_c'] || 123);
        this.max_ring = parseInt(new_parameters['max_c'] || 262);

        if (min_changed)
        {
            this.getView('slider').setMinRing(this.min_ring);
        }

        if (max_changed)
        {
            this.getView('slider').setMaxRing(this.max_ring);
        }

        this.refreshGraph();
    },

    refreshGraph: function()
    {
        var graph = this.getView('graph');

        var keys = ['AW', 'BX', 'CE'];

        var all_data = {};

        var retrieve_chain = [];
        $each(keys, function(key) {
            if (this.is_attribute_on[key])
            {
                retrieve_chain.push(function(chain_cb) {
                    graph.retrieveData(function(success, data) {
                        all_data[key] = data;    
                        chain_cb();
                    }, key);
                });
            }
        }.bind(this));

        retrieve_chain.push(function() {
            graph.refresh(all_data);
        });

        project.chain.apply(window, retrieve_chain);
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

    getAttributeShape: function(key)
    {
        return this.attributes[key].shape;
    },
    
    getAttributeScale: function(key)
    {
        return this.attributes[key].scale;
    },
    
    getAttributeColor: function(key)
    {
        return this.attributes[key].color;
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

project.SliderView = new Class({

    Implements: [Options, Events],

    initialize: function(dom_element, options)
    {
        this.dom_element = dom_element;
        this.controller = options.controller;

        this.setOptions(options);
        this.min_ring_element = new Element('input', {
            'class': 'ui-widget-content ui-corner-all',
            'value': 123
        });
        this.max_ring_element = new Element('input', {
            'class': 'ui-widget-content ui-corner-all',
            'value': 262
        });
        var update_handler = function() {
            this.controller.setParameter('min_c', this.min_ring_element.get('value'));
            this.controller.setParameter('max_c', this.max_ring_element.get('value'));
        }.bind(this);

        this.max_ring_element.addEvent('change', update_handler);
        this.min_ring_element.addEvent('change', update_handler);
        this.dom_element.adopt([new Element('label', {'class': 'ui-widget-header ui-corner-all', 'text':'Min Ring'}), this.min_ring_element,new Element('label', {'class': 'ui-widget-header ui-corner-all', 'text':'Max Ring'}), this.max_ring_element]);
    },

    setMinRing: function(value)
    {
        this.min_ring_element.set('value', value);
    },

    setMaxRing: function(value)
    {
        this.max_ring_element.set('value', value);
    }
});

project.GraphView = new Class({

    Implements: [Options, Events],

    initialize: function(dom_element, options)
    {
        this.controller = options.controller;
        this.dom_element = dom_element;
        this.setOptions(options);
    },

    cache: {},

    retrieveData: function(callback, key, ring_start, ring_end)
    {
        var self = this;

        if (this.cache[key])
        {
            callback(true, this.cache[key]);
            return;
        }

        new Request.JSON({
            'url': 'data/' + key + '.json',
            'onSuccess': function(raw_json_data)
            {
                var data = [];
                var raw_data = raw_json_data.rows;
                var raw_data_length = raw_data.length;

                var overall_maximum = raw_data[0].value;
                var overall_minimum = raw_data[0].value;

                var items_per_ring = {};

                for (var i=1; i < raw_data_length; i++)
                {
                    overall_maximum = Math.max(overall_maximum, raw_data[i].value);
                    overall_minimum = Math.min(overall_minimum, raw_data[i].value);
                }

                var overall_range = overall_maximum - overall_minimum;

                var segments_count = self.controller.getSegmentsCount();

                var get_segment_pos = function(value)
                {
                    return Math.floor(segments_count * ((value - overall_minimum) / overall_range));
                }

                var segments_data = {};

                for (var i=0; i < raw_data_length; i++)
                {
                    var ring = raw_data[i].key;
                    var value = raw_data[i].value;
                    var pos = get_segment_pos(value);
                    
                    items_per_ring[ring] = (items_per_ring[ring] || 0) + 1;
                    segments_data[ring] = segments_data[ring] || [];
                    segments_data[ring][pos] = (segments_data[ring][pos] || 0) + 1;
                }

                for (var ring in segments_data)
                {
                    if (segments_data.hasOwnProperty(ring))
                    {
                        var ring_data = segments_data[ring];
                        for (var pos in ring_data)
                        {
                            if (ring_data.hasOwnProperty(pos))
                            {
                                data.push([
                                    ring,
                                    Math.round((overall_minimum + overall_range * (parseInt(pos)))/segments_count),
                                    pos,
                                    ring_data[pos] / items_per_ring[ring]
                                ]);
                            }
                        }
                    }
                }

                this.cache[key] = data;

                callback(true, this.cache[key]);
            }.bind(this)
        }).get();
 
    },

    getAttributeColor: function(key)
    {
        return this.controller.getAttributeColor(key);
    },

    getAttributeShape: function(key)
    {
        return this.controller.getAttributeShape(key);
    },

    getAttributeScale: function(key)
    {
        return this.controller.getAttributeScale(key);
    },

    createDotsForData: function(data)
    {
        var dots = [];
        var segments_count = this.controller.getSegmentsCount();

        for (var key in data)
        {
            if (data.hasOwnProperty(key))
            {
                var points = data[key];
                var points_length = points.length;
                for (var i = 0; i < points_length; i++)
                {
                    var ring = points[i][0];
                    var value = points[i][1];
                    var pos = points[i][2];
                    var alpha = points[i][3];

                    /*
                     * TODO: refactor to getter.
                     */
                    if (this.controller.getMinRing() <= ring && ring <= this.controller.max_ring)
                    {
                        dots.push({
                            x: ring,
                            title: 'Value: ' + value,
                            y: 200 * (parseInt(pos) / segments_count),
                            shape: this.getAttributeShape(key),
                            style: 'rgba(' + this.getAttributeColor(key) + ',' + alpha + ')',
                            pos: pos 
                        });
                    }
                }
            }
        }
        return dots;
    },

    refresh: function(data)
    {
        var self = this;

        var dots = this.createDotsForData(data);

        var svg = this.dom_element.getElement('svg');
        if (svg)
        {
            svg.destroy();
        }

        this.dom_element.empty();
        this.dom_element.fade('out');
        /* Sizing and scales. */
        var w = 600,
            h = 300,
            x = pv.Scale.linear(this.controller.getMinRing(), this.controller.getMaxRing() + 1).range(0, w),
            y = pv.Scale.linear(0, 200).range(0, h);

        /* The root panel. */
        var vis = new pv.Panel()
            .width(w)
            .height(h)
            .bottom(20)
            .left(20)
            .right(10)
            .top(5);

        /* Y-axis and ticks. */
        vis.add(pv.Rule)
            .data(y.ticks())
            .bottom(y)
            .strokeStyle(function(d) {
                return d ? "#eee" : "#000"
             })
          .anchor("left").add(pv.Label)
            .visible(function(d) {
                return d > 0 && d < 1;
            })
            .text(y.tickFormat);

        /* X-axis and ticks. */
        vis.add(pv.Rule)
            .data(x.ticks())
            .left(x)
            .strokeStyle(function(d) {
                return d ? "#eee" : "#000"
            })
          .anchor("bottom").add(pv.Label)
            .visible(function(d) {
                return d > 0 && d < 100;
            })
            .text(x.tickFormat);

        /* The dot plot! */

        var segments_count = this.controller.getSegmentsCount();

        vis.add(pv.Panel)
            .data(dots)
          .add(pv.Bar)
            .left(function(d) {
                return x(d.x);
            })
            .bottom(function(d) {
                return y(d.y);
            })
            .fillStyle(function(d) {
                return d.style;
            })
            .height(function(d) {
                return h / segments_count;
            })
            .width(function(d) {
                return w / self.controller.getRingCount();
            })
            .title(function(d) {
                return d.title;
            });

        this.dom_element.fade('hide');
        this.dom_element.setStyle('display', 'none');

        vis.$canvas = [this.dom_element];
        vis.render();

        this.dom_element.setStyle('display');
        this.dom_element.fade('in');
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
