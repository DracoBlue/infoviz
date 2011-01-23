project = window.project || {};

project.chain = function()
{
    var args = arguments;
    var args_length = args.length;

    if (args_length === 0)
    {
        return;
    }

    var args_pos = 0;
    var start_func = function()
    {
        args[args_pos](function()
        {
            args_pos++;
            if (args_length > args_pos)
            {
                start_func();
            }
        });
    };

    start_func();
};