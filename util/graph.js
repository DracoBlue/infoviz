exports.createSegmentsForData = function(data, segments_x, segments_y)
{
    if (data.length === 0)
    {
        return {};
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
  
    var segment_size_x = ((max_x - min_x) / segments_x);
    var segment_size_y = ((max_y - min_y) / segments_y);
  
    /*
     * Now let's find out, what values the segments have
     */
  
    var segment_value = {};
  
    for ( var i = 0; i < data_length; i++)
    {
        var segment_x = Math.floor((data[i].x - min_x) / segment_size_x);
        var segment_y = Math.floor((data[i].y - min_y) / segment_size_y);
      
        segment_value[segment_x] = segment_value[segment_x] || {};
        segment_value[segment_x][segment_y] = segment_value[segment_x][segment_y] || {};
        segment_value[segment_x][segment_y][data[i].g] = (segment_value[segment_x][segment_y][data[i].g] || 0) + 1;

    }
  
    return {
      "segment_size_x"  : segment_size_x,
      "segment_size_y"  : segment_size_y, 
      "data_length"     : data_length,
      "segment_value"   : segment_value,
      "min_x"           : min_x,
      "max_x"           : max_x,
      "min_y"           : min_y,
      "max_y"           : max_y,
    };
  
};

