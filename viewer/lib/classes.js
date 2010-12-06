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

    min_circle: 123,
    max_circle: 262,

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
                    'color': '#f00', 
                    'shape': 'square',
                    'scale': 1.0,
                    'key': 'AW'
                },
                {
                    'name': 'Druckantrieb Förderschnecke',
                    'color': '#f0F', 
                    'shape': 'circle',
                    'scale': 1.0,
                    'key': 'CE'
                },
                {
                    'name': 'Erddrucksensor (oben)',
                    'color': '#00F', 
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

        var min_changed = (this.min_circle != new_parameters['min_c']) ? true : false;
        var max_changed = (this.max_circle != new_parameters['max_c']) ? true : false;

        this.min_circle = new_parameters['min_c'] || 123;
        this.max_circle = new_parameters['max_c'] || 262;

        if (min_changed)
        {
            this.getView('slider').setMinCircle(this.min_circle);
        }

        if (max_changed)
        {
            this.getView('slider').setMaxCircle(this.max_circle);
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
        this.min_circle_element = new Element('input', {
            'class': 'ui-widget-content ui-corner-all',
            'value': 123
        });
        this.max_circle_element = new Element('input', {
            'class': 'ui-widget-content ui-corner-all',
            'value': 262
        });
        var update_handler = function() {
            this.controller.setParameter('min_c', this.min_circle_element.get('value'));
            this.controller.setParameter('max_c', this.max_circle_element.get('value'));
        }.bind(this);

        this.max_circle_element.addEvent('change', update_handler);
        this.min_circle_element.addEvent('change', update_handler);
        this.dom_element.adopt([new Element('label', {'class': 'ui-widget-header ui-corner-all', 'text':'Min Circle'}), this.min_circle_element,new Element('label', {'class': 'ui-widget-header ui-corner-all', 'text':'Max Circle'}), this.max_circle_element]);
    },

    setMinCircle: function(value)
    {
        this.min_circle_element.set('value', value);
    },

    setMaxCircle: function(value)
    {
        this.max_circle_element.set('value', value);
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

    retrieveData: function(callback, key, circle_start, circle_end)
    {
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

                var circle_in_use = {};
                var circle_max = {};
                var circle_min = {};

                for (var i=0; i < raw_data_length; i++)
                {
                    if (typeof circle_in_use[raw_data[i].key] === 'undefined')
                    {
                        circle_in_use[raw_data[i].key] = true;
                        circle_max[raw_data[i].key] = raw_data[i].value;
                        circle_min[raw_data[i].key] = raw_data[i].value;
                    } else {
                        circle_max[raw_data[i].key] = Math.max(raw_data[i].value, circle_max[raw_data[i].key]);
                        circle_min[raw_data[i].key] = Math.min(raw_data[i].value, circle_min[raw_data[i].key]);
                    }
                }

                circle_in_use = {};

                for (var i=0; i < raw_data_length; i++)
                {
                    if (typeof circle_in_use[raw_data[i].key] === 'undefined')
                    {
                        circle_in_use[raw_data[i].key] = true;
                        circle_size = Math.sqrt(circle_max[raw_data[i].key] - circle_min[raw_data[i].key]) * 10;
                        circle_size = Math.max(5, 100 - Math.min(circle_size, 100));
                        data.push([parseInt(raw_data[i].key), raw_data[i].value, circle_size]);
                    }
                }

                this.cache[key] = data;

                callback(true, this.cache[key]);
            }.bind(this)
        }).get();
 
    },

    retrieveData2: function(callback, key, circle_start, circle_end)
    {
       var mock_data =[{"_id":"20070618-999","_rev":"1-656a83fe5446030f983ec80e092d2293","DD":"9461.00","CC":"7.80","BX":"1.40","BB":"1.00","AW":"98.00","New_Counter":"999","DE":"3950.00","CD":"2.00","BY":"2.20","BC":"1.00","AX":"98.00","CE":"229.00","BZ":"3.10","BD":"1356.00","AY":"99.00","CF":"4.00","BE":"48.60","AZ":"94.00","AD":"13724.00","C":"125.00","CG":"319.00","BF":"24.90","AE":"1.70","CH":"104.00","AF":"43.00","DU":"1.80","CT":"104.00","CI":"27.00","AG":"2.00","filename":"20070618Data_c.txt","DV":"1.80","DA":"1.00","CU":"137.00","CJ":"0.26","AH":"2377.00","DB":"7210.00","CV":"1.32","CA":"1.20","DC":"4162.00","CW":"3.40","CB":"2.60","BA":"1413.00","AU":"81.00","CX":"3.60","BW":"3.00","AV":"2446.00","Counter":"6791.00"},

        {"_id":"20070618-998","_rev":"1-0ab268b6906aacaa8e59bcd1880f5e44","DD":"9365.00","CC":"7.80","BX":"1.40","BB":"1.00","AW":"97.00","New_Counter":"998","DE":"3950.00","CD":"2.10","BY":"2.00","BC":"1.00","AX":"97.00","CE":"227.00","BZ":"2.60","BD":"1353.00","AY":"99.00","CF":"4.00","BE":"84.00","AZ":"93.00","AD":"13352.00","C":"126.00","CG":"316.00","BF":"24.74","AE":"1.70","CH":"103.00","AF":"144.00","DU":"1.80","CT":"103.00","CI":"27.00","AG":"2.00","filename":"20070618Data_c.txt","DV":"1.80","DA":"1.00","CU":"136.00","CJ":"0.26","AH":"2329.00","DB":"7284.00","CV":"1.32","CA":"1.20","DC":"4162.00","CW":"3.20","CB":"2.40","BA":"1410.00","AU":"81.00","CX":"3.70","BW":"3.00","AV":"2419.00","Counter":"6790.00"}
        ];

        var data = [];
        var raw_data = mock_data;
        var raw_data_length = raw_data.length;

        for (var i=0; i < raw_data_length; i++)
        {
            data.push([parseInt(raw_data[i].C), raw_data[i][key]]);
        }

        callback(true, data);
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

        for (var key in data)
        {
            if (data.hasOwnProperty(key))
            {
                var points = data[key];
                var points_length = points.length;
                for (var i = 0; i < points_length; i++)
                {
                    var circle = points[i][0];
                    var value = points[i][1];
                    var size = points[i][2];

                    /*
                     * TODO: refactor to getter.
                     */
                    if (this.controller.min_circle <= circle && circle <= this.controller.max_circle)
                    {
                        dots.push({
                            x: circle,
                            title: 'Value: ' + value,
                            y: this.getAttributeScale(key) * value,
                            shape: this.getAttributeShape(key),
                            style: this.getAttributeColor(key),
                            z: size
                        });
                    }
                }
            }
        }
        return dots;
    },

    refresh: function(data)
    {
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
            x = pv.Scale.linear(this.controller.min_circle, this.controller.max_circle).range(0, w),
            y = pv.Scale.linear(0, 200).range(0, h),
            c = pv.Scale.log(1, 200).range("orange", "brown");

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

        vis.add(pv.Panel)
            .data(dots)
          .add(pv.Dot)
            .left(function(d) {
                return x(d.x);
            })
            .shape(function(d) {
                return d.shape;
            })
            .bottom(function(d) {
                return y(d.y);
            })
            .strokeStyle(function(d) {
                return d.style;
            })
            .fillStyle(function() {
                return this.strokeStyle().alpha(.2)
            })
            .size(function(d) {
                return d.z;
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
