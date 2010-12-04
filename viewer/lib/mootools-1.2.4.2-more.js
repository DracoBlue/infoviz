//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

/*
---

script: More.js

description: MooTools More

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
    'version': '1.2.4.4',
    'build': '6f6057dc645fdb7547689183b2311063bd653ddf'
};

/*
---

script: Drag.js

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
- Valerio Proietti
- Tom Occhinno
- Jan Kassens

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- /MooTools.More

provides: [Drag]

*/

var Drag = new Class({

    Implements: [Events, Options],

    options: {/*
        onBeforeStart: $empty(thisElement),
        onStart: $empty(thisElement, event),
        onSnap: $empty(thisElement)
        onDrag: $empty(thisElement, event),
        onCancel: $empty(thisElement),
        onComplete: $empty(thisElement, event),*/
        snap: 6,
        unit: 'px',
        grid: false,
        style: true,
        limit: false,
        handle: false,
        invert: false,
        preventDefault: false,
        stopPropagation: false,
        modifiers: {x: 'left', y: 'top'}
    },

    initialize: function(){
        var params = Array.link(arguments, {'options': Object.type, 'element': $defined});
        this.element = document.id(params.element);
        this.document = this.element.getDocument();
        this.setOptions(params.options || {});
        var htype = $type(this.options.handle);
        this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
        this.mouse = {'now': {}, 'pos': {}};
        this.value = {'start': {}, 'now': {}};

        this.selection = (Browser.Engine.trident) ? 'selectstart' : 'mousedown';

        this.bound = {
            start: this.start.bind(this),
            check: this.check.bind(this),
            drag: this.drag.bind(this),
            stop: this.stop.bind(this),
            cancel: this.cancel.bind(this),
            eventStop: $lambda(false)
        };
        this.attach();
    },

    attach: function(){
        this.handles.addEvent('mousedown', this.bound.start);
        return this;
    },

    detach: function(){
        this.handles.removeEvent('mousedown', this.bound.start);
        return this;
    },

    start: function(event){
        if (event.rightClick) return;
        if (this.options.preventDefault) event.preventDefault();
        if (this.options.stopPropagation) event.stopPropagation();
        this.mouse.start = event.page;
        this.fireEvent('beforeStart', this.element);
        var limit = this.options.limit;
        this.limit = {x: [], y: []};
        for (var z in this.options.modifiers){
            if (!this.options.modifiers[z]) continue;
            if (this.options.style) this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
            else this.value.now[z] = this.element[this.options.modifiers[z]];
            if (this.options.invert) this.value.now[z] *= -1;
            this.mouse.pos[z] = event.page[z] - this.value.now[z];
            if (limit && limit[z]){
                for (var i = 2; i--; i){
                    if ($chk(limit[z][i])) this.limit[z][i] = $lambda(limit[z][i])();
                }
            }
        }
        if ($type(this.options.grid) == 'number') this.options.grid = {x: this.options.grid, y: this.options.grid};
        this.document.addEvents({mousemove: this.bound.check, mouseup: this.bound.cancel});
        this.document.addEvent(this.selection, this.bound.eventStop);
    },

    check: function(event){
        if (this.options.preventDefault) event.preventDefault();
        var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
        if (distance > this.options.snap){
            this.cancel();
            this.document.addEvents({
                mousemove: this.bound.drag,
                mouseup: this.bound.stop
            });
            this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
        }
    },

    drag: function(event){
        if (this.options.preventDefault) event.preventDefault();
        this.mouse.now = event.page;
        for (var z in this.options.modifiers){
            if (!this.options.modifiers[z]) continue;
            this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
            if (this.options.invert) this.value.now[z] *= -1;
            if (this.options.limit && this.limit[z]){
                if ($chk(this.limit[z][1]) && (this.value.now[z] > this.limit[z][1])){
                    this.value.now[z] = this.limit[z][1];
                } else if ($chk(this.limit[z][0]) && (this.value.now[z] < this.limit[z][0])){
                    this.value.now[z] = this.limit[z][0];
                }
            }
            if (this.options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % this.options.grid[z]);
            if (this.options.style) {
                this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
            } else {
                this.element[this.options.modifiers[z]] = this.value.now[z];
            }
        }
        this.fireEvent('drag', [this.element, event]);
    },

    cancel: function(event){
        this.document.removeEvent('mousemove', this.bound.check);
        this.document.removeEvent('mouseup', this.bound.cancel);
        if (event){
            this.document.removeEvent(this.selection, this.bound.eventStop);
            this.fireEvent('cancel', this.element);
        }
    },

    stop: function(event){
        this.document.removeEvent(this.selection, this.bound.eventStop);
        this.document.removeEvent('mousemove', this.bound.drag);
        this.document.removeEvent('mouseup', this.bound.stop);
        if (event) this.fireEvent('complete', [this.element, event]);
    }

});

Element.implement({

    makeResizable: function(options){
        var drag = new Drag(this, $merge({modifiers: {x: 'width', y: 'height'}}, options));
        this.store('resizer', drag);
        return drag.addEvent('drag', function(){
            this.fireEvent('resize', drag);
        }.bind(this));
    }

});


/*
---

script: Drag.Move.js

description: A Drag extension that provides support for the constraining of draggables to containers and droppables.

license: MIT-style license

authors:
- Valerio Proietti
- Tom Occhinno
- Jan Kassens
- Aaron Newton
- Scott Kyle

requires:
- core:1.2.4/Element.Dimensions
- /Drag

provides: [Drag.Move]

...
*/

Drag.Move = new Class({

    Extends: Drag,

    options: {/*
        onEnter: $empty(thisElement, overed),
        onLeave: $empty(thisElement, overed),
        onDrop: $empty(thisElement, overed, event),*/
        droppables: [],
        container: false,
        precalculate: false,
        includeMargins: true,
        checkDroppables: true
    },

    initialize: function(element, options){
        this.parent(element, options);
        element = this.element;
        
        this.droppables = $$(this.options.droppables);
        this.container = document.id(this.options.container);
        
        if (this.container && $type(this.container) != 'element')
            this.container = document.id(this.container.getDocument().body);
        
        var styles = element.getStyles('left', 'top', 'position');
        if (styles.left == 'auto' || styles.top == 'auto')
            element.setPosition(element.getPosition(element.getOffsetParent()));
        
        if (styles.position == 'static')
            element.setStyle('position', 'absolute');

        this.addEvent('start', this.checkDroppables, true);

        this.overed = null;
    },

    start: function(event){
        if (this.container) this.options.limit = this.calculateLimit();
        
        if (this.options.precalculate){
            this.positions = this.droppables.map(function(el){
                return el.getCoordinates();
            });
        }
        
        this.parent(event);
    },
    
    calculateLimit: function(){
        var offsetParent = this.element.getOffsetParent(),
            containerCoordinates = this.container.getCoordinates(offsetParent),
            containerBorder = {},
            elementMargin = {},
            elementBorder = {},
            containerMargin = {},
            offsetParentPadding = {};

        ['top', 'right', 'bottom', 'left'].each(function(pad){
            containerBorder[pad] = this.container.getStyle('border-' + pad).toInt();
            elementBorder[pad] = this.element.getStyle('border-' + pad).toInt();
            elementMargin[pad] = this.element.getStyle('margin-' + pad).toInt();
            containerMargin[pad] = this.container.getStyle('margin-' + pad).toInt();
            offsetParentPadding[pad] = offsetParent.getStyle('padding-' + pad).toInt();
        }, this);

        var width = this.element.offsetWidth + elementMargin.left + elementMargin.right,
            height = this.element.offsetHeight + elementMargin.top + elementMargin.bottom,
            left = 0,
            top = 0,
            right = containerCoordinates.right - containerBorder.right - width,
            bottom = containerCoordinates.bottom - containerBorder.bottom - height;

        if (this.options.includeMargins){
            left += elementMargin.left;
            top += elementMargin.top;
        } else {
            right += elementMargin.right;
            bottom += elementMargin.bottom;
        }
        
        if (this.element.getStyle('position') == 'relative'){
            var coords = this.element.getCoordinates(offsetParent);
            coords.left -= this.element.getStyle('left').toInt();
            coords.top -= this.element.getStyle('top').toInt();
            
            left += containerBorder.left - coords.left;
            top += containerBorder.top - coords.top;
            right += elementMargin.left - coords.left;
            bottom += elementMargin.top - coords.top;
            
            if (this.container != offsetParent){
                left += containerMargin.left + offsetParentPadding.left;
                top += (Browser.Engine.trident4 ? 0 : containerMargin.top) + offsetParentPadding.top;
            }
        } else {
            left -= elementMargin.left;
            top -= elementMargin.top;
            
            if (this.container == offsetParent){
                right -= containerBorder.left;
                bottom -= containerBorder.top;
            } else {
                left += containerCoordinates.left + containerBorder.left;
                top += containerCoordinates.top + containerBorder.top;
            }
        }
        
        return {
            x: [left, right],
            y: [top, bottom]
        };
    },

    checkAgainst: function(el, i){
        el = (this.positions) ? this.positions[i] : el.getCoordinates();
        var now = this.mouse.now;
        return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
    },

    checkDroppables: function(){
        var overed = this.droppables.filter(this.checkAgainst, this).getLast();
        if (this.overed != overed){
            if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
            if (overed) this.fireEvent('enter', [this.element, overed]);
            this.overed = overed;
        }
    },

    drag: function(event){
        this.parent(event);
        if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
    },

    stop: function(event){
        this.checkDroppables();
        this.fireEvent('drop', [this.element, this.overed, event]);
        this.overed = null;
        return this.parent(event);
    }

});

Element.implement({

    makeDraggable: function(options){
        var drag = new Drag.Move(this, options);
        this.store('dragger', drag);
        return drag;
    }

});


/*
---

script: Sortables.js

description: Class for creating a drag and drop sorting interface for lists of items.

license: MIT-style license

authors:
- Tom Occhino

requires:
- /Drag.Move

provides: [Slider]

...
*/

var Sortables = new Class({

    Implements: [Events, Options],

    options: {/*
        onSort: $empty(element, clone),
        onStart: $empty(element, clone),
        onComplete: $empty(element),*/
        snap: 4,
        opacity: 1,
        clone: false,
        revert: false,
        handle: false,
        constrain: false
    },

    initialize: function(lists, options){
        this.setOptions(options);
        this.elements = [];
        this.lists = [];
        this.idle = true;

        this.addLists($$(document.id(lists) || lists));
        if (!this.options.clone) this.options.revert = false;
        if (this.options.revert) this.effect = new Fx.Morph(null, $merge({duration: 250, link: 'cancel'}, this.options.revert));
    },

    attach: function(){
        this.addLists(this.lists);
        return this;
    },

    detach: function(){
        this.lists = this.removeLists(this.lists);
        return this;
    },

    addItems: function(){
        Array.flatten(arguments).each(function(element){
            this.elements.push(element);
            var start = element.retrieve('sortables:start', this.start.bindWithEvent(this, element));
            (this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
        }, this);
        return this;
    },

    addLists: function(){
        Array.flatten(arguments).each(function(list){
            this.lists.push(list);
            this.addItems(list.getChildren());
        }, this);
        return this;
    },

    removeItems: function(){
        return $$(Array.flatten(arguments).map(function(element){
            this.elements.erase(element);
            var start = element.retrieve('sortables:start');
            (this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);
            
            return element;
        }, this));
    },

    removeLists: function(){
        return $$(Array.flatten(arguments).map(function(list){
            this.lists.erase(list);
            this.removeItems(list.getChildren());
            
            return list;
        }, this));
    },

    getClone: function(event, element){
        if (!this.options.clone) return new Element('div').inject(document.body);
        if ($type(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
        var clone = element.clone(true).setStyles({
            margin: '0px',
            position: 'absolute',
            visibility: 'hidden',
            'width': element.getStyle('width')
        });
        //prevent the duplicated radio inputs from unchecking the real one
        if (clone.get('html').test('radio')) {
            clone.getElements('input[type=radio]').each(function(input, i) {
                input.set('name', 'clone_' + i);
            });
        }
        
        return clone.inject(this.list).setPosition(element.getPosition(element.getOffsetParent()));
    },

    getDroppables: function(){
        var droppables = this.list.getChildren();
        if (!this.options.constrain) droppables = this.lists.concat(droppables).erase(this.list);
        return droppables.erase(this.clone).erase(this.element);
    },

    insert: function(dragging, element){
        var where = 'inside';
        if (this.lists.contains(element)){
            this.list = element;
            this.drag.droppables = this.getDroppables();
        } else {
            where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
        }
        this.element.inject(element, where);
        this.fireEvent('sort', [this.element, this.clone]);
    },

    start: function(event, element){
        if (!this.idle) return;
        this.idle = false;
        this.element = element;
        this.opacity = element.get('opacity');
        this.list = element.getParent();
        this.clone = this.getClone(event, element);

        this.drag = new Drag.Move(this.clone, {
            snap: this.options.snap,
            container: this.options.constrain && this.element.getParent(),
            droppables: this.getDroppables(),
            onSnap: function(){
                event.stop();
                this.clone.setStyle('visibility', 'visible');
                this.element.set('opacity', this.options.opacity || 0);
                this.fireEvent('start', [this.element, this.clone]);
            }.bind(this),
            onEnter: this.insert.bind(this),
            onCancel: this.reset.bind(this),
            onComplete: this.end.bind(this)
        });

        this.clone.inject(this.element, 'before');
        this.drag.start(event);
    },

    end: function(){
        this.drag.detach();
        this.element.set('opacity', this.opacity);
        if (this.effect){
            var dim = this.element.getStyles('width', 'height');
            var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
            this.effect.element = this.clone;
            this.effect.start({
                top: pos.top,
                left: pos.left,
                width: dim.width,
                height: dim.height,
                opacity: 0.25
            }).chain(this.reset.bind(this));
        } else {
            this.reset();
        }
    },

    reset: function(){
        this.idle = true;
        this.clone.destroy();
        this.fireEvent('complete', this.element);
    },

    serialize: function(){
        var params = Array.link(arguments, {modifier: Function.type, index: $defined});
        var serial = this.lists.map(function(list){
            return list.getChildren().map(params.modifier || function(element){
                return element.get('id');
            }, this);
        }, this);

        var index = params.index;
        if (this.lists.length == 1) index = 0;
        return $chk(index) && index >= 0 && index < this.lists.length ? serial[index] : serial;
    }

});


/*
---

script: Assets.js

description: Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Event
- /MooTools.More

provides: [Assets]

...
*/

var Asset = {

    javascript: function(source, properties){
        properties = $extend({
            onload: $empty,
            document: document,
            check: $lambda(true)
        }, properties);
        
        if (properties.onLoad) properties.onload = properties.onLoad;
        
        var script = new Element('script', {src: source, type: 'text/javascript'});

        var load = properties.onload.bind(script), 
            check = properties.check, 
            doc = properties.document;
        delete properties.onload;
        delete properties.check;
        delete properties.document;

        script.addEvents({
            load: load,
            readystatechange: function(){
                if (['loaded', 'complete'].contains(this.readyState)) load();
            }
        }).set(properties);

        if (Browser.Engine.webkit419) var checker = (function(){
            if (!$try(check)) return;
            $clear(checker);
            load();
        }).periodical(50);

        return script.inject(doc.head);
    },

    css: function(source, properties){
        return new Element('link', $merge({
            rel: 'stylesheet',
            media: 'screen',
            type: 'text/css',
            href: source
        }, properties)).inject(document.head);
    },

    image: function(source, properties){
        properties = $merge({
            onload: $empty,
            onabort: $empty,
            onerror: $empty
        }, properties);
        var image = new Image();
        var element = document.id(image) || new Element('img');
        ['load', 'abort', 'error'].each(function(name){
            var type = 'on' + name;
            var cap = name.capitalize();
            if (properties['on' + cap]) properties[type] = properties['on' + cap];
            var event = properties[type];
            delete properties[type];
            image[type] = function(){
                if (!image) return;
                if (!element.parentNode){
                    element.width = image.width;
                    element.height = image.height;
                }
                image = image.onload = image.onabort = image.onerror = null;
                event.delay(1, element, element);
                element.fireEvent(name, element, 1);
            };
        });
        image.src = element.src = source;
        if (image && image.complete) image.onload.delay(1);
        return element.set(properties);
    },

    images: function(sources, options){
        options = $merge({
            onComplete: $empty,
            onProgress: $empty,
            onError: $empty,
            properties: {}
        }, options);
        sources = $splat(sources);
        var images = [];
        var counter = 0;
        return new Elements(sources.map(function(source){
            return Asset.image(source, $extend(options.properties, {
                onload: function(){
                    options.onProgress.call(this, counter, sources.indexOf(source));
                    counter++;
                    if (counter == sources.length) options.onComplete();
                },
                onerror: function(){
                    options.onError.call(this, counter, sources.indexOf(source));
                    counter++;
                    if (counter == sources.length) options.onComplete();
                }
            }));
        }));
    }

};