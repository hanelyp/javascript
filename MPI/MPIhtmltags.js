
MPIhtmltags = {

// a list of valid beginnings for URLs
// default list of several major reputable image hosts
urlWhiteList : [
	'https:\\/\\/lh(\\d+).googleusercontent.com\\/',
	//'http(s?)://farm\\d+.staticflickr.com\\/',
	'http(s?):\\/\\/c(\\d).staticflickr.com\\/',
	'https:\\/\\/fbexternal-a.akamaihd.net\\/',
	'https:\\/\\/fbcdn-sphotos-(\\w)-a.akamaihd.net\\/',
	'https:\\/\\/scontent-(\\w)-lax.xx.fbcdn.net\\/hphotos',
	'http:\\/\\/www.gravatar.com\\/avatar\\/',
	'http:\\/\\/i(\\d+).photobucket.com/albums/',
	'http:\\/\\/imgur.com\\/gallery\\/',
	'http:\\/\\/imagizer.imageshack.us\\/v2\\/'
],
styles : [],

// whitelist check a URL
/*
cleanurl : function(url)
{
	var i = 0;
	while ((i < this.urlWhiteList.length) && (url.indexOf(this.urlWhiteList[i]) != 0))
	{	i++;	}
	if ((i < this.urlWhiteList.length) && (url.indexOf(this.urlWhiteList[i]) == 0))
	{	return url;	}
	else { return '';	}	// not a valid URL
},
// */
// regular expression match found needed.
cleanurl : function(url)
{
	var i = 0, match=false;
	//this.func_notice([url]);
	while (i < this.urlWhiteList.length)
	{
		//this.func_notice([this.urlWhiteList[i]]);
		var re = new RegExp("^"+this.urlWhiteList[i]);
		//this.func_notice([url.match(re)]);
		if (url.match(re))
		{	return url;	}
		i++;
	}
	return '';	// not a valid URL
},

processprop : function(val)
{
	if (typeof(val) != 'string')	return '';
	var m = val.match(/([\#\-\"\%\.\w\d\s]*)/);
	if (!m)	return '';
	val = m[1];	// exclude any unsafe characters that enable script in CSS
	// supported URLs must not include whitespace
	m = val.match(/(url-([^\s]+))/);
	if (m != null)
	{
		var url = 'url('+this.cleanurl(m[2])+')';
		val.replace(m[1], url);
	}
	return val;
},

forbiddenCSS: {
	'position':1
},

// ensure property is safe CSS, process url values
cleanprop : function(val)
{
	if (typeof(val) != 'string')	return '';
	var cleanprops = '';
	var properties = val.split(';');
	for (var i in properties)
	{
		var p = properties[i].split(':');
		var propertyname = this.cleantext(p[0]);
		if (this.forbiddenCSS[propertyname])
		{	}
		else
		{
			var value = this.processprop(p[1]);
			cleanprops += propertyname+':'+value+';';
		}
	}
	return cleanprops;
},

// ensure text contains only safe 'word' characters
cleantext : function(val)
{
	var m = val.match(/([\w-]+)/);
	if (!m)	{ return '';	}
	return m[1];
},

// safe property names
cleanname : function (val)
{
	//console.log(val);
	var m = val.match(/([\w\:\/]+)/);
	//console.log(m.join(','));
	return m[1];
},

// evaluate parameters to extract safe clas and style tags
cleanstyle : function(val)
{
	if (val.length == 0)	return '';
	var cleanclasses = '';
	var classes = val[0].split(/\s+/);

	for (var i in classes)
	{	cleanclasses += this.cleantext(classes[i]);	}

	var cleanprop = this.cleanprop(val[1]);	
	return 'class="'+classes+'" style="'+cleanprop+'"';
},

// fixme: stub
htmlEscape : function(val)
{
	return val;
},

// no immediate output, save up styles for a block output
func_style : function(val)
{
	var clas = 'u_'+this.cleantext(val[0]);
	var properties = this.cleanprop(val[1]);
	this.styles.push('.'+clas+'{'+properties+'}');

	return "";
},

// render defined styles
func_endstyle : function(val)
{
	this.func_notice(this.styles);
	var style = '<style>';
	for (var i = 0; i < this.styles.length; i++)
	{
		style += this.styles[i];
	}
	this.styles = [];
	return style+'</style>';
},

//defines a style clas for use as a sprite
func_sprite : function(val)
{
	var clas = 'u_'+this.cleantext(val.shift());
	var url = 'url('+this.cleanurl(val.shift())+')';
	var x1 = 1*val.shift();
	var y1 = 1*val.shift();
	var x2 = 1*val.shift();
	var y2 = 1*val.shift();
	var properties = this.cleanprop(val.shift());
	// compose the sprite style
	
	return '';	
},

//- formatting
// - with separate end tags
func_div : function(val)
{
	var css = this.cleanstyle(val);
	return '<div '+css+'>';
},

func_enddiv : function(val)
{
	return '</div>';
},

func_span : function(val)
{
	var css = this.cleanstyle(val);
	return '<span '+css+'>';
},

func_endspan : function(val)
{
	return '</span>';
},

func_table : function(val)
{
	var css = this.cleanstyle(val);
	return '<table '+css+'>';
},

func_endtable : function(val)
{
	return '</table>';
},

func_tr : function(val)
{
	var css = this.cleanstyle(val);
	return '<tr '+css+'>';
},

func_endtr : function(val)
{
	return '</tr>';
},

func_td : function(val)
{
	var css = this.cleanstyle(val);
	return '<td '+css+'>';
},

func_endtd : function(val)
{
	return '</td>';
},

//- single elements
//image:	url, clas
func_image : function(val)
{
	var url = this.cleanurl(val.shift());
	var css = this.cleanstyle(val);
	return '<image src="'+url+'" '+css+'>';
},

//input:	property, clas	// on change sets property, if permitted
updatepropinput : function(input)
{
	var prop = input.name;
	var val = input.value;
	console.log(prop, val);
	this.mpi_propset(this.vars._node, prop, val);
},

func_input : function(val)
{
	var prop = this.cleanname(val.shift());
	var css = this.cleanstyle(val);
	//console.log(prop, this.vars._node);
	//console.log (this.mpi_prop(this.vars._node, prop));
	var propval = this.htmlEscape(this.mpi_prop(this.vars._node, prop));
	return '<input name="'+prop+'" value="'+propval+'" onchange="'+this.objname+'.updatepropinput(this);" '+css+'>';
},

//link:	url, clas
func_link : function(val)
{
	var url = this.cleanurl(val.shift());
	var css = this.cleanstyle(val);
	return '<a href="'+url+'" '+css+'>';
},

func_br : function(val)
{
	return "<br />";
},

//- developer elements
//debug:	level	// dump debug messages here
//	level in [warn|error|off|...]
// debug presumes a div mpi_debug for output
func_debug : function(val)
{
	if (!this.development)	{ return "";	}	// force disable if used by other than developer
	var level = val.shift();
	this.debug = 0;
	if ('error' == level)	{ this.debug = 1;	}
	if ('warn' == level)	{ this.debug = 2;	}
	//var css = this.cleanstyle(val);
	return ""; //'<div id="mpi_debug" '+css+'></div>';
},

// output a message to the debug window, if available
// debug level MUST be 0 for page release
func_notice : function(val)
{
	if (this.debug < 2)	{ return ""; }
	for (var i = 0; i < val.length; i++)
	{
		var paragraph = document.createElement("P");
		var text = document.createTextNode(val[i]);
		paragraph.appendChild(text);	
		var out = document.getElementById("mpi_debug");
		out.appendChild(paragraph);
	}
	return "";
}
}
/*
elements/properties to restrict:
url	image, link, style
	only relative, site, or approved hosts
padding, margin, border?	// sane values
	provided clases for reasonable values?
visibility, display
	disallow in user clases, provide in common clases
position:
	disallow

character '<', by mpi or code only.
*/
