project.Graph = function()
{
};

project.Graph.prototype = {

    Implements: [
        Options, Events
    ],

    options: {
        'segments_x': 6,
        'segments_y': 12
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

    createDotsForData: function(data)
    {
        var dots = [];

        if (data.length === 0)
        {
            return [[0,0,0,0], dots];
        }
        
        /*
         * First of all, let's find out what is the minimum x,y and maximum x,y
         */

        var max_x = data[0].x;
        var max_y = data[0].x;
        var min_x = data[0].x;
        var min_y = data[0].y;

        var data_length = data.length;
        for ( var i = 1; i < data_length; i++)
        {
            min_x = Math.min(data[i].x, min_x);
            min_y = Math.min(data[i].y, min_y);
            max_x = Math.max(data[i].x, max_x);
            max_y = Math.max(data[i].y, max_y);
        }
        
        console.log('min', 'x', min_x, max_x, 'y', min_y, max_y);
        
        var segment_size_x = ((max_x - min_x) / this.options.segments_x);
        var segment_size_y = ((max_y - min_y) / this.options.segments_y);
        
        console.log('segement_size', segment_size_x, segment_size_y);
        /*
         * Now let's find out, what values the segments have
         */
        
        var segment_value = {};
        
        for ( var i = 0; i < data_length; i++)
        {
            var segment_x = Math.floor((data[i].x - min_x) / segment_size_x);
            var segment_y = Math.floor((data[i].y - min_y) / segment_size_y);
            
            segment_value[segment_x] = segment_value[segment_x] || {};
            segment_value[segment_x][segment_y] = (segment_value[segment_x][segment_y] || 0) + 1;
        }
        
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
                    var alpha = (segment_value[x][y] / data_length) * 1.33333;
                    dots.push( {
                        x: x * segment_size_x + min_x,
                        title: 'Value: ' +  alpha,
                        y: y * segment_size_y + min_y,
                        shape: 'square',
                        style: 'rgba(255,0,0,' + alpha + ')',
                        pos: segment_value[x][y]
                    });
                }
            }
        }
        
        console.log(segment_value);

        return [[min_x, max_x, min_y, max_y], dots, [segment_size_x, segment_size_y]];
    },

    refresh: function(data)
    {
        var self = this;

        var graph_data = this.createDotsForData(data);

        var min_x = graph_data[0][0];
        var max_x = graph_data[0][1];
        var min_y = graph_data[0][2];
        var max_y = graph_data[0][3];
        var dots = graph_data[1];
        var segment_size_x = graph_data[2][0];
        var segment_size_y = graph_data[2][1];
        
        var w = 600, h = 300;
        
        var segment_height = w / self.options.segments_y;
        var segment_width = h / self.options.segments_x;
        
        console.log('segment_size', segment_size_x, segment_size_y)
        var svg = this.dom_element.getElement('svg');
        if (svg)
        {
            svg.destroy();
        }

        this.dom_element.empty();
        this.dom_element.fade('out');
        /* Sizing and scales. */
        var x = pv.Scale.linear(min_x, max_x).range(0, w), y = pv.Scale
                .linear(min_y, max_y).range(0, h);

        /* The root panel. */
        var vis = new pv.Panel().width(w).height(h).bottom(20).left(20).right(10).top(5);

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