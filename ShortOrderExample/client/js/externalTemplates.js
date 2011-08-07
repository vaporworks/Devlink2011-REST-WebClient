var TemplateFinder = function () {

    // By default templates are pulled from the same server path as the html file making the request.
    // If you keep your templates in a separate directory, specify it here as a relative path to the html document making the request
    // For example, /Templates for a sub dir, or ../Templates for going up a dir level and dropping into a Templates folder
    this['templateUrl'] = "";

    //  We want to be able to apply any naming conventions you have for your template resource files without cluttering the name itself up.
    //  So, if you have a convention to name your templates with a ".tpl.html" extension/suffix, then specify ".tpl.html" here
    this['templateSuffix'] = ".html";

    //  If you prefer to prefix your templates with a convention, specify it here.
    this['templatePrefix'] = "";

    // allows you to specify the timeout, dataType, type (HTTP method) and other ajax options for the template request.
    // Note - it does NOT allows you to change the async option.  For now, the requests have to be synchronous.  For now...
    this['ajaxOptions'] = {};

    this['getTemplateNode'] = function (templateId) {
        var node = document.getElementById(templateId);
        if(node == null)
        {
            var templatePath = this['getTemplatePath'](templateId, this['templatePrefix'], this['templateSuffix'], this['templateUrl']);
            var templateHtml = null;

            var options = {
                                "url":templatePath,
                                "dataType": "html",
                                "type": "GET",
                                "timeout": 0,
                                "success": function(response) { templateHtml = response;},
                                "error": function(exception) {
                                    alert("Problem getting template " + templateId + "\r\n" + exception);
                                }
                          };

            $.extend(true, options, this['ajaxOptions']);

            options["async"] = false;

            $['ajax'](options);

            if(templateHtml === null)
                throw new Error("Cannot find template with ID=" + templateId);

            node = document.createElement("script");
            node.type = "text/html";
            node.id = templateId;
            node.text = templateHtml;
            document.body.appendChild(node);
        }
        return node;
    };

    // Since getTemplatePath is published as a public member of this, it can be overridden with custom functionality
    // If you want to override it, simply include a new "getTemplatePath" definition as part of the options hash you pass to setOptions
    this['getTemplatePath'] = function(templateId, templatePrefix, templateSuffix, templateUrl) {
        var templateFile = templatePrefix + templateId + templateSuffix;
        var templateSrc = templateUrl === undefined || templateUrl === "" ? templateFile : templateUrl + "/" + templateFile;
        return templateSrc;
    };

    this['setOptions'] = function(options) {
        $['extend'](this,options);
    };
};

templateFinder = new TemplateFinder();