project.AttributeDatabase = function()
{
    /*
     * Must be kept empty, because of the last line of this file:
     * project.AttributeDatabase = new Class(project.AttributeDatabase.prototype);
     * 
     * Do initialization stuff in #initialize!
     */
};

project.AttributeDatabase.prototype = {

    Implements: [
        Options, Events
    ],

    options: {
    },

    initialize: function(options)
    {
        this.setOptions(options);
    },

    layers_cache: null,
    
    retrieveAttributes: function(callback)
    {
        setTimeout(function() {
            callback([{"id":"3","name":"C","caption":"Ring Nr."},{"id":"4","name":"AD","caption":"Bohrkopfdrehmoment"},{"id":"5","name":"AE","caption":"Bohrkopfdrehzahl"},{"id":"6","name":"AF","caption":"Bohrkopfwinkelposition"},{"id":"7","name":"AG","caption":"BK Drehrichtung 0=aus 1=CW 2=CWW"},{"id":"8","name":"AH","caption":"Bohrkpofantriebsleistung"},{"id":"9","name":"AU","caption":"Vorschubgeschwindigkeit"},{"id":"10","name":"AV","caption":"Zugkraft Nachl\u00e4ufer"},{"id":"11","name":"AW","caption":"Vorschubdruck oberer Sektor"},{"id":"12","name":"AX","caption":"Vorschubdruck rechter Sektor in Bohrrichtung"},{"id":"13","name":"AY","caption":"Vorschubdruck unterer Sektor"},{"id":"14","name":"AZ","caption":"Vorschubdruck linker Sektor in Bohrrichtung"},{"id":"15","name":"BA","caption":"Vorschubweg rechter Sektor in Bohrrichtung"},{"id":"16","name":"BB","caption":"Vorschubweg unterer Sektor"},{"id":"17","name":"BC","caption":"Vorschubweg linker Sektor in Bohrrichtung"},{"id":"18","name":"BD","caption":"Vorschubweg oberer Sektor"},{"id":"19","name":"BE","caption":"Penetration"},{"id":"20","name":"BF","caption":"Vorschubkraft total"},{"id":"21","name":"BW","caption":"M\u00f6rtelvolumen Total"},{"id":"22","name":"BX","caption":"Erddrucksensor 1 Schild oben"},{"id":"23","name":"BY","caption":"Erddrucksensor 2 Schild rechts"},{"id":"24","name":"BZ","caption":"Erddrucksensor 3 Schild rechts unten"},{"id":"25","name":"CA","caption":"Erddrucksensor 4 Schild links"},{"id":"26","name":"CB","caption":"Erddrucksensor 5 Schild links unten"},{"id":"27","name":"CC","caption":"Erddrucksensor 6 F\u00f6rderschnecke vorne"},{"id":"28","name":"CD","caption":"Erddrucksensor 7 F\u00f6rderschnecke hinten"},{"id":"29","name":"CE","caption":"Druck Antrieb F\u00f6rderschnecke"},{"id":"30","name":"CF","caption":"Drehzahl F\u00f6rderschnecke"},{"id":"31","name":"CG","caption":"Drehmoment F\u00f6rderschnecke"},{"id":"32","name":"CH","caption":"Bandwaage F\u00f6rderband C2 theoretisch "},{"id":"33","name":"CI","caption":"Bandwaage F\u00f6rderband C2 effektiv"},{"id":"34","name":"CJ","caption":"Bandwaage F\u00f6rderband C2 Eff.\/Theo."},{"id":"35","name":"CT","caption":"Volumenscanner F\u00f6rderband C2 theoretisch "},{"id":"36","name":"CU","caption":"Volumenscanner F\u00f6rderband C2 effektiv"},{"id":"37","name":"CV","caption":"Volumenscanner F\u00f6rderband C2 Eff.\/Theo."},{"id":"38","name":"CW","caption":"Neigung"},{"id":"39","name":"CX","caption":"Verrollung"},{"id":"40","name":"DA","caption":"Schaum manuell \/ automatisch"},{"id":"41","name":"DB","caption":"Vorschubkraft oberer Sektor"},{"id":"42","name":"DC","caption":"Vorschubkraft rechter Sektor in Bohrrichtung"},{"id":"43","name":"DD","caption":"Vorschubkraft unterer Sektor"},{"id":"44","name":"DE","caption":"Vorschubkraft linker Sektor in Bohrrichtung"},{"id":"45","name":"DU","caption":"Bandwaage F\u00f6rderband C2 spezifisches Gewicht"},{"id":"46","name":"DV","caption":"Bandwaage F\u00f6rderband C2 spezifisches Gewicht"}]);
        }, 1);
    },

    retrieveLayers: function(callback)
    {
        var self = this;

        if (this.layers_cache)
        {
            callback(this.layers_cache);
            return;
        }
        new Request.JSON({
            'url': '../util/config.json',
            'onSuccess': function(data)
            {
                self.layers_cache = data.schichten.layers;
                callback(self.layers_cache);
            }
        }).get();
    }

};

project.AttributeDatabase = new Class(project.AttributeDatabase.prototype);
