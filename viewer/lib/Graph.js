project.Graph = function()
{
};

project.Graph.prototype = {

    Implements: [
        Options, Events
    ],

    options: {
        'segments_x': 100,
        'segments_y': 100
    },

    initialize: function(options)
    {
        this.setOptions(options);

        this.dom_element = new Element('div');
    },

    toElement: function()
    {
        return this.dom_element;
    },

    createDotsForData: function(response_data, layers, invers)
    {
        var dots = [];

        if (response_data.data_length === 0)
        {
            return [[0,0,0,0], dots];
        }
        console.log(response_data);


        var layer_id_to_color_map = {};

        layers.each(function(value, key) {
            layer_id_to_color_map[value.id] = '#' + value.color;
        });

        var max_x = response_data.max_x;
        var max_y = response_data.max_y;
        var min_x = response_data.min_x;
        var min_y = response_data.min_y;
        var data_length = response_data.data_length;
        var segment_value = response_data.segment_value;
        var segment_gestein = response_data.segment_gestein;
        var segment_size_x = response_data.segment_size_x;
        var segment_size_y = response_data.segment_size_y;
        
        this.options.segments_x = Math.round((max_x - min_x)/segment_size_x); 
        this.options.segments_y = Math.round((max_y - min_y)/segment_size_y); 

        console.log('min', 'x', min_x, max_x, 'y', min_y, max_y);
        
        console.log('segment_size', segment_size_x, segment_size_y);
        console.log('segment_count', this.options.segments_x, this.options.segments_y);
        
        /*
         * Now let's walk through all segments and see if we got a point there.
         * In case there is one, add it to the dots.
         */

        for ( var x = 0; x < this.options.segments_x; x++)
        {
            for ( var y = 0; y < this.options.segments_y; y++)
            {
                if (typeof segment_value[x] !== 'undefined' && typeof segment_value[x][y] !== 'undefined')
                {
                    var alpha = Math.max(0.3, Math.min((segment_value[x][y] / data_length) * (segment_size_x * segment_size_y), 1.0));
                    var color = pv.color(layer_id_to_color_map[segment_gestein[x][y]]);

                    var data = {
                        title: 'Value: ' +  alpha,
                        shape: 'square',
                        style: color.alpha(alpha)
                    };
                    
                    if (invers)
                    {
                        data['x'] = y * segment_size_y + min_y;
                        data['y'] = x * segment_size_x + min_x;
                    }
                    else
                    {
                        data['x'] = x * segment_size_x + min_x;
                        data['y'] = y * segment_size_y + min_y;
                    }
                    
                    dots.push(data);
                }
            }
        }
        
        if (invers)
        {
            return [[min_y, max_y, min_x, max_x], dots, [segment_size_y, segment_size_x]];
        }
        
        return [[min_x, max_x, min_y, max_y], dots, [segment_size_x, segment_size_y]];
    },

    refresh: function(response_data, layers, invers)
    {
        var self = this;

        var graph_data = this.createDotsForData(response_data, layers, invers);

        var min_x = graph_data[0][0];
        var max_x = graph_data[0][1];
        var min_y = graph_data[0][2];
        var max_y = graph_data[0][3];
        var dots = graph_data[1];
        var segment_size_x = graph_data[2][0];
        var segment_size_y = graph_data[2][1];
        
        console.log('graph', graph_data);
        var w = 600, h = 300;
        
        var segment_height = h / self.options.segments_y;
        var segment_width = w / self.options.segments_x;
        
        console.log('segment_size ??', segment_size_x, segment_size_y);
        console.log('h/w', segment_height, segment_width);
        var svg = this.dom_element.getElement('svg');
        if (svg)
        {
            svg.destroy();
        }

        this.dom_element.empty();
        this.dom_element.fade('out');
        /* Sizing and scales. */
        var x = pv.Scale.linear(min_x, max_x).range(1, w);
        var y = pv.Scale.linear(min_y, max_y).range(1, h);

        /* The root panel. */
        var vis = new pv.Panel().width(w).height(h).bottom(50).left(50).right(10).top(5);

        /* Y-axis and ticks. */
        vis.add(pv.Rule).data(y.ticks()).bottom(y).strokeStyle(function(d)
        {
            return d ? "#eee" : "#000";
        }).anchor("left").add(pv.Label).visible(function(d)
        {
            return true;
        }).text(y.tickFormat);

        /* X-axis and ticks. */
        vis.add(pv.Rule).data(x.ticks()).left(x).strokeStyle(function(d)
        {
            return d ? "#eee" : "#000";
        }).anchor("bottom").add(pv.Label).visible(function(d)
        {
            return true;
        }).text(x.tickFormat);

        /* The dot plot! */

        vis.add(pv.Panel).data(dots).add(pv.Bar).left(function(d)
        {
            return x(d.x);
        }).bottom(function(d)
        {
            return y(d.y);
        }).fillStyle(function(d)
        {
            return d.style;
        }).height(function(d)
        {
            return segment_height;
        }).width(function(d)
        {
            return segment_width;
        }).title(function(d)
        {
            return d.title;
        });

        this.dom_element.fade('hide');
        this.dom_element.setStyle('display', 'none');

        vis.$canvas = [
            this.dom_element
        ];
        vis.render();

        this.dom_element.setStyle('display');
        this.dom_element.fade('in');
    }
};

project.Graph = new Class(project.Graph.prototype);
