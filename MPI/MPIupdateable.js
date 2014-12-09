
MPIupdatable = {
	// a list of blocks, to include source
	blocks : [],
	// index by property name of blocks using that property
	propindex : {},
	tmppropindex : {},
	updatinprogress : false,
	pendingupdates : {},
	//advancedOps : ['refreshing'],

	  nextTag : function()
	  {
	  	return this.blocks.length;
	  },
	  
	addTag : function(src, tag)
	{
		//var tag = this.blocks.length;
		//console.log(tag, src);
		this.blocks.push(src);
		for (var i in this.tmppropindex)
		{
			//console.log(i);
			if (this.propindex[i] == undefined)
			{	this.propindex[i] = [];	}
			this.propindex[i].push(tag);
		}
	},

	// mpi_prop() and mpi_props() should call this to note a property being used.
	listProp : function(node, prop)
	{
		prop = node+'/'+prop;
		this.tmppropindex[prop] = 1;
	},
	
	updateByPropName : function(node, name, depth)
	{
		name = node+'/'+name;
		
		if (typeof(depth) == 'undefined')	depth = 0;
		if (depth > 10)	{ return;	}	// recursive or otherwise troublesome update
		
		// delay updates until the one in progress finishes
		if (this.updateinprogress)
		{
			this.pendingupdates[name] = 1;
		}
		this.updateinprogress = true;
		
		//console.log(name);
		var proplist = this.propindex[name];
		if (!Array.isArray(proplist))	{ return;	}
		//console.log(proplist, proplist.join(','));
		//console.log ('updating');
		for (i in proplist)
		{
			//console.log(i, proplist[i]);
			this.updateTag(proplist[i]);
		}
		this.updateinprogress = false;
		for (i in this.pendingupdates)
		{
			var n = i.split('/');
			var node = n.shift();
			name = n.join('/');
			this.updateByPropName(node,name, depth+1);
		
			this.pendingupdates[i] = 0;
		}
	},
	
	updateTag : function(tag)
	{
		console.log(tag);
		var params = this.blocks[tag];
		// restore specified vars
		if (params[1])
		{
				for(var i in params[1])
				{
					console.log('restoring', i);
					this.vars[i] = params[1][i];
				}
		}
		
		//var newval =  this.tagPrefix(tag) + this.exec(params[0]) + this.tagSuffix(tag);
		var newval = this.exec(params[0]);
		console.log (newval);
		document.getElementById('mpitag_'+tag).innerHTML = newval;
	},
	
	tagPrefix : function(tag)
	{
		return '<span id="mpitag_'+tag+'">';
	},
	
	tagSuffix : function(tag)
	{
		return '</span>';
	},
	
	// a more selective interface for refreshing elements based on properties.
	// nested refreshable blocks are expected to not work right.
	// {refreshing:code[,vars]}
	// specified vars are preserved for refresh, useful if refresh block is generated in a loop
	afunc_refreshing : function(params)
	{
		//console.log(params);
		this.tmppropindex = {};	// fresh list
		var savedvars = {};
		// save specified vars
		if (params[1])
		{
			var savevars = this.eval_mpi(params[1]);
			for(var i in savevars)
			{
				var n = savevars[i];
				//console.log('saving', n, this.vars[n]);
				savedvars[n] = this.vars[n];
			}
		}
		var value = this.eval_mpi(params[0]);
		//var tagsource = [JSON.parse(JSON.stringify(params[0]))];	// make a copy
		var tagsource = [params[0]];
		tagsource.push(savedvars);
		
		var tag = this.nextTag();
		this.addTag(tagsource, tag);
		result = this.tagPrefix(tag) + value + this.tagSuffix(tag);
		//console.log (result);
		//console.log (tagsource);
		return result;
	},
	
	// parse 1 parameter, which may contain a mix of plain text and MPI functions
	// variant to tag outermost script block for update
	parse_parameter_tag : function (text)
	{
	  //console.log("parameter from "+text);
	  if ("" == text)	{ return ["", "", ""];	}
	  var result = "", prefix, remainder, match, value;
	  // find start of MPI function or terminating comma
	  var matches;
	  while ((typeof(text) == 'string') && (matches = text.match( /(,|\}|\{\w+:?)/ ) ) )
	  {
	    //console.log(text, matches[0]);
	    var match = matches[1], matches2;
	    // terminating comma or '}', split remaining text into result and remainder
	    if (match.match(/(,|\})/))
	    {
		var pr = text.split(match);
		//console.log (pr.join(match));
		prefix = pr.shift();
		remainder = pr.join(match); // work around bug when split has a limit and cuts off extra
		result += prefix;
		//console.log(result, remainder, match);
		return [result, remainder, match];
	    }
	    
	    // mpi function, tag and evaluate
	    else if (matches2 = match.match(/\{(\w+)/ ))
	    {
		//console.log(text, match);
		var pr = text.split(match, 2);
		prefix = pr[0];
		remainder = pr[1];
		
		var tag = this.nextTag();
		
		result += prefix + tagPrefix(tag);
		//console.log (result+' -', matches2[1], remainder);
		this.tmppropindex = {};	// fresh list
		var va = this.eval_mpi(matches2[1], remainder);
		var tagsource = remainder.substring(0,remainder.length-va[1].length);
		this.addTag(match+tagsource, tag);

		value = va[0];
		remainder = va[1];
	//if (! defined(value))
	//{ "catch"; }
		result += value + tagSuffix(tag);
		text = remainder;
	    }
	  }
	  // nothing left to parse
	  return [result+text, '', ''];
	},
	
	parse_tag : function(text)
	{
	  var result = '', value, term;
	  // while we have unprocessed text
	  //   find MPI, if any.
	  //   preceeding text copied to result.
	  //   MPI evaluated and retuned values added to result.

	  term = "zz"; // meaningless except not null
	  while (term)
	  { var va = this.parse_parameter_tag(text);
	    //console.log(va.join(' - '));
	    value = va[0];
	    text = va[1];
	    term = va[2];
	    result += value+term;
	  }

	  return result;
	}
};
