// MPIbc.js
/**
=pod

//=head1 NAME

MPI.js - 2014.10.15 Message Parsing Interpreter, "bytecode" based version.

//=head1 SYNOPSIS

Processor for the Message Parsing Interpreter text
composition language, based on the MPI found in MU* online
environments, adapted for more general semantics.

http://en.wikipedia.org/wiki/Message_Parsing_Interpreter

//=head1 USAGE

	<script type="text/javascript" src="MPI.js"></script>
	var mpi = new MPI('self');
	result = this.mpi.parse(test);

	$node->setvar("varname", "varval");
	$val = $node->readvar("varname");

MPI assumes an operating environment consisting of a set
of nodes each of which has a set of named properties.  How
these nodes and properties are stored and structured is up
to the application except that:

=over

=item * noderefs are scalars used by application
supplied functions.  Something with a printable value is
encouraged but not required.

=item * properties may be identified by and resolve to
plain text strings.

=back

MPI, in the interest of more general usage, expects some
support subroutines to be supplied by app to access nodes
and properties.  Should any of these not be supplied, errors
are trapped to prevent crashing.  Functions not needing
these should still work properly.  Should the application
designer wish, app data to be passed to these callbacks may
be set into and read from the object by the setvar() and
readvar() methods.

=over

=item mpi.neighbors($thisnode, $pattern, $obj)

$thisnode is a noderef.
$pattern is a string pattern used to specify which nodes
'neighboring' the current node are of interest.
returns list of noderefs;

=item mpi.prop($thisnode, $propname, $obj)

$propname is the string name of a property.
returns propval;

=item mpi.props($thisnode, $proppat, $obj)

$propat is a string specifier to a property directory or a
subset of properties.
returns list of propnames;

=item mpi.propset($thisnode, $propname, $val, $obj)

=back

//=head1 STATUS

Some MPI standard functions incomplete or unimplimented.  Testing incomplete.

//=head1 Etc
*/
/**
@license
Copyright (c)2014 Peter Hanely. All rights reserved.
This program is free software; you can redistribute it and/or
modify it under the terms of GPL3.0 or later.
*/
/**
//=head1 LANGUAGE

//=head2 VARS

=over

=item Variable names of alphabetic characters are general MPI use.

=item Names beginning with an underscore "_" are reserved
for mpi internal variables and should not be used by the
application.

=item Names beginning with "\" are suggested for application
values placed in the mpi object.

=cut
*/
function MPI(self)
{
	this.vars._node = self;
}

MPI.prototype = {

	VERSION:'2014.10.13',
	blocktag:'{',
	endtag:'}',
	septag:':',
	/** vars._node is the default noderef */
	vars:{_node:''},

// control functions alter execution of their parameters,
// and thus parse their own parameters.
	ctrl_functions:{
	//	'debug'		:	1,
		'debugif'	:	1,
		'filter'	:	1,
		'fold'		:	1,
		'for'		:	1,
		'foreach'	:	1,
	//	'func'		:	1,
		'if'		:	1,
		'lit'		:	1,
		'lsort'		:	1,
		'neighbors'	:	1,
		'parse'		:	1,
		'while'		:	1,
		'with'		:	1
	},

//=head1 MPI primitives

//=head2 {abs:num}

func_abs :function(val)
{
  return Math.abs(val[0]);
},

//=head2 {add:num1,num2...}

func_add : function(val)
{
  //console.log(JSON.stringify(val));
  var tot = 0;
  for (var i=0; i < val.length; i++)
  {
    //console.log (val[i]);
    tot += 1*val[i];
  }
  return tot;
},

//=head2 {and:num1,num2...}

func_and : function(val)
{
  var tot = val.shift();
  for (var i=0; i < val.length; i++)
  { 
    tot = tot && val[i];
    //if (!val[i]) { $tot = 0; }
  }
  return tot;
},

//=head2 {attr:attribute...,text}

func_attr : function(val)
{
  // stub
  return val[val.length-1];
},

func_convsecs : function(val)
{

},

func_convtime : function(val)
{

},

//=head2 {count:array}

func_count : function(val)
{
  var arry = this.unpack_list(val[0]);
  return (arry.length);
},

//=head2 {date:}

func_date : function(val)
{
  //console.log(val[0]);
  var date;
  if (val[0])
  { date = new Date(val[0]); }
  else
  { date = new Date(); }
  return date.toDateString();
},

func_debug : function(val)
{ },

func_debugif : function(val)
{ },

//=head2 {dec:var,dec}

func_dec : function(val)
{
  var inc = val[1];
  inc = inc || 1;
  return (this.vars[val[0]] -= inc);
},

//=head2 {default:var1,var2...}

func_default : function(val)
{
  var indx = 0;
  while ((indx < val.length) && !(val[indx])) { indx ++ }
  if (indx < val.length) { return val[indx]; }
  else { return ""; }
},

//=head2 {delprop:var[,obj]}

func_delprop : function(val)
{
  var prop = val[0];
  var obj = val[1];
  obj = obj || this.vars['_node'];
  if (typeof (this.mpi_propset) == "function")
  { this.mpi_propset(obj, prop, "", this); }
},

//=head2 {dice:range[,count[,bonus]]}

func_dice : function(val)
{
  var range = 1*val[0];
  var count = 1*val[1];
  var bonus = 1*val[2];
  //console.log (range, count, bonus);
  var tot = 0;
  if (count <= 0) { count = 1; }
  for (var indx = 0; indx < count; indx ++)
  { tot += Math.floor(Math.random()*range+1); }
  return tot+bonus;
},

//=head2 {dist:x1,y2...}

func_dist : function(val)
{
  //var x1, $y1, $z1, $x2, $y2, $z2) = val.length;
  var offs = val.length/2;
  var tot = 0;
  //console.log(offs);
  for (var i = 0; i < offs; i++)
  {
  	var off = 1*val[i] - 1*val[i+offs];
  	//console.log (off);
  	tot = tot + off*off;
  }
  return Math.sqrt(tot);
},

//=head2 {div:num,num1...}

func_div : function(val)
{
  return Math.floor(val[0]/val[1]);
},

//=head2 {eq:var1,var2}

func_eq : function(val)
{
  return val[0] == val[1];
},

func_escape : function(val)
{ },

//=head2 {eval:vars...}

func_eval : function(val)
{
  var tot = '';
  var param;
  for (param = 0; param < val.length; param++)
  { tot += this.parse(val[param]); }
  return tot;
},

//=head2 {exec:prop[,node]}

func_exec : function(val)
{
  var prop = val[0];
  var obj = val[1];
  var tmp = "";
  var propval = this.mpi_prop(obj || this['_node'], prop, this);
  if (propval)
  { tmp = this.parse(propval) || "" };
  return tmp;
},

func_filter : function(val)
{ },

func_fold : function(val)
{ },

//=head2 {for:varname,start,end,increment,commands}

// control function, parses its own parameters
afunc_for : function(params)
{
  var results = '';
  var varname = this.eval_mpi(params[0]);
  var start = 1*this.eval_mpi(params[1]);
  var end = 1*this.eval_mpi(params[2]);
  var increment = 1*this.eval_mpi(params[3]);
  var command = params[4];
  this.vars[varname] = start;
  //console.log(varname, start, end, increment, command);
//  crash();
  if (increment > 0)
  {
    while (this.vars[varname] <= end)
    {
      //(result, $params)
      //console.log (JSON.stringify(command));
      var result = this.eval_mpi(command);
      //console.log (JSON.stringify(result));
      results += result; //.join();
      this.vars[varname] += increment;
      //console.log(results);
    }
  }
  else if (increment < 0)
  {
    while (this.vars[varname] >= end)
    {
      //($result, $params)
      var result = this.eval_mpi(command);
      results += result.join();
      this.vars[varname] += increment;
    }
  }
  else // sanity case
  { var result = this.eval_mpi(command);
    results += result.join();
  }
  //console.log (results, params);
  return results; //[results, params];
},

//=head2 {foreach:varname,list,command[,list seperator]}

afunc_foreach : function(params)
{
  var list, expr, sep, llist, val, result;
  var varname = this.eval_mpi(params[0]);
  var list = this.eval_mpi(params[1]);;
  expr = params[2];
  sep = this.eval_mpi(params[3]) || "\n";
  if (typeof(list) == 'string')
  {	llist = this.unpack_list(list, sep);	}
  else
  {	llist = list;	}
  for (val in llist)
  {
    this.vars[varname] = llist[val];
    //console.log(JSON.stringify(expr));
    result += this.eval_mpi(expr);
  }
  return result;
},

func_ftime : function(val)
{ },

func_fullname : function(val)
{ },

//=head2 {func:name,var1:var2...,commands}

func_func : function(val)
{
  var func = val[0];
  var vars = val[1];
  var code = val[2];
  this.vars["_f_$func"] = $code;
  this.vars["_f_$func v"] = $vars;
  return func+', '+vars+', '+code;
},

//=head2 {ge:var1,var2}

func_ge : function(val)
{
  return val[0] >= val[1];
},

//=head2 {gt:var1,var2}

func_gt : function(val)
{
  return val[0] > val[1];
},

//=head2 {if:condition,true[,false]}

afunc_if  : function(params)
{
  var ret;
  var check = this.eval_mpi(params[0]);
  if (check)
  {
    ret = this.eval_mpi(params[1]);
  }
  else
  {
    ret = this.eval_mpi(params[2]);
  }
  return ret;
},

//=head2 {inc:var,inc}

func_inc : function(val)
{
  var vr = val[0];
  var inc = 1*val[1];
  inc = inc || 1;
  this.vars[vr] += inc;
  return this.vars[vr];
},

//=head2 {index:prop[,obj]}

func_index : function(val)
{
  var prop = val[0];
  var obj = val[1];
  obj = obj || this.vars["_node"];
  prop = this.mpi_prop(obj, prop, this);
  if (prop)
  { return this.mpi_prop(obj, prop, this) || ""; }
  return '';
},

//=head2 {insrt:string1,string2}

func_instr : function(val)
{
//  console.log(JSON.stringify(val));
  var str1 = val[0];
  var str2 = val[1];
  return str1.indexOf(str2) + 1;
},

func_isnum : function(val)
{
  var num = val[0];
  if (!num) { num = '0e0'; }
  return num;
},

//=head2 {lcommon:list1,list2}

func_lcommon : function(val)
{
  var l1 = val[0];
  var l2 = val[1];
  var h = {};
  var i
  var res = [];
  var list = this.unpack_list(l1);
  for (i = 0; i < list.length; i++)
  { h[list[i]] = 1; }
  list = this.unpack_list(l2);
  for (i = 0; i < list.length; i++)
  { 
    if (h[list[i]])
    {
      res.push (list[i]);
      h[list[i]] = 0; // remove duplicates.
    }
  }
  return this.pack_list(res);
},

//=head2 {le:var1,var2}

func_le : function(val)
{
  return val[0] <= val[1];
},

//=head2 {list:props[,obj]}
// fixme
func_list : function(val)
{
  var list = val[0];
  var obj = val[1];
  var list = [];
  var i;
  obj = obj || this.vars["_node"];
  var tl = this.mpi_props(obj, list, this);
  for (i = 0; i < tl.length; i++)
  { list.push (this.mpi_prop(obj, tl[i], this)); }
  return this.pack_list(list);
},

//=head2 {listprops:props[,obj]}

func_listprops : function(val)
{
  var list = val[0];
  var obj = val[1];
  obj = obj || this.vars["_node"];
  return this.pack_list(this.mpi_props(obj, list, this));
},

//=head2 {lit:expression to not parse}

afunc_lit : function(param)
{
  var lit = this.unparse(param);
  return lit;
},

//=head2 {lmember:list,item[,delimiter]}

func_lmember : function(val)
{
  var list = val[0];
  var item = val[1];
  var del = val[2];
  var i, list = [];
  list = this.unpack_list(list, del);
  for (i = 0; i < list.length && list[i] != item; i++) { }
  if (list[i] == item) { return i+1; }
  return 0;
},

//=head2 {lrand:list[,delimiter]}

func_lrand : function(val)
{
  var list = val[0];
  var del = val[1];
  var i, list = [];
  list = this.unpack_list(list, del);
  return list[Math.floor(Math.random(list.length))];
},

//=head2 {lremove:list1,list2}

func_lremove : function(val)
{
  var l1 = val[0];
  var l2 = val[1];
  var h = {}, i, res = [];
  var tl = this.unpack_list(l1);
  for (i=0; i < tl.length; i++)
  { h[tl[i]] = 1; }
  tl = this.unpack_list(l2);
  for (i=0; i < tl.length; i++)
  { if (!h[tl[i]])
    { res.push(tl[i]);
      h[tl[i]] = 0; // remove duplicates.
    }
  }
  return this.pack_list(res);
},

// fixme?
afunc_lsort : function(params)
{
  var llist = [], var1, var2, code;
  var list = this.eval_mpi(params[0]);
  // do fancy sort later
  return list.sort();
},

//=head2 {lt:num1,num2}

func_lt : function(val)
{
  return val[0] < val[1];
},

func_ltimestr : function(val)
{ },

//=head2 {lunion:list1,list2}
/*
func_lunion : function(val)
{
  var l1 = val[0];
  var l2 = val[1];
  var h = {}, i;
  foreach $i(this.unpack_list(l1))
  { $h{$i} = 1; }
  foreach $i(this.unpack_list(l2))
  { $h{$i} = 1; }
  this.pack_list(keys %h);
},

//=head2 {lunique:list}

func_lunique : function(val)
{
  var l1, $l2) = val.length;
  my (%h, $i, @res);
  foreach $i(this.unpack_list(l1))
  { if (!$h{$i})
    { $h{$i} = 1;
      push @res,$i;
    }
  }
  this.pack_list(@res);
},
*/
//=head2 {max:var1,var2...}

func_max : function(val)
{
  var tot = 1*val[0];
  for (var i = 0; i < val.length; i++)
  { if (tot > 1*val[i]) { tot = 1*val[i]; } }
  return tot;
},

//=head2 {midstr:string,start[,end]}

func_midstr : function(val)
{
  var str = val[0];
  var pos1 = val[1];
  var pos2 = val[2];
  return str.substring(pos1, pos2);
},

//=head2 {min:var1,var2...}

func_min : function(val)
{
  var tot, vr;
  tot = 1*val[0];
  for (var i = 0; i < val.length; i++)
  { if (tot > 1*val[i]) { tot = 1*val[i]; } }
  return tot;
},

//=head2 {mklist:list items}

func_mklist : function(val)
{
  //join "\n", val.length;
  return this.pack_list(this.unpack_list(val));
},

//=head2 {mod:num1,num2}

func_mod : function(val)
{
  return val[0] % val[1];
},

//=head2 {mult:num1,num2...}

func_mult : function(val)
{
  var num, tot;
  tot = 1;
  for (var i=0; i < val.length; i++)
  { tot *= val[i]; }
  return tot;
},

func_name : function(val)
{ },

//=head2 {ne:var1,var2}

func_ne : function(val)
{
  return (val[0] != val[1]);
},

//=head2 {neighbors:varname,pattern,code}
/*
afunc_neighbors(params)
{
  var varname;
  var pattern;
  var expr, @list, val, res, result);
  (varname, params) = this.parse_parameter(params);
  (pattern, expr) = this.parse_parameter(params);
  @list = eval {&mpi_neighbors(this.vars['_node'}, pattern, this)};
  foreach val(@list)
  { this.vars[varname} = val;
    (res, params) = this.parse_parameter(expr);
    result += res;
  }
  if (@list == 0)
  { res = "";
    params = &skip_parameters(expr);
    params =~ /^\}(.*)/;
    params = $! || params;
  }
  (res, params);
},

//=head2 {neighbors2:pattern}

func_neighbors2
{ var this, params) = @_;
  var pattern) = @$params;
  this.pack_list(eval {&mpi_neighbors(this.vars['_node'}, pattern, this)});
},
*/

//=head2 {nl:}

func_nl : function(val)
{ return "\n"; },

//=head2 {not:var}

func_not : function(val)
{
  return !(val[0]);
},

//=head2 {null:...}

func_null : function(val)
{ return ""; },

//=head2 {or:var1,var2...}

func_or : function(val)
{
  var num, tot = true;
  for (var i=0; i < val.length; i++)
  { //tot ||= num;
    if (!val[i]) { tot = 0; }
  }
  return tot;
},

func_parse : function(val)
{ },

//=head2 {prop:property,node}

func_prop : function(val)
{
  var prop = val[0];
  var obj = val[1];
  obj = obj || this.vars["_node"];
  //console.log(obj, prop);
  return this.mpi_prop(obj, prop, this) || "";
},

//=head2 {rand:props[,obj]}

func_rand : function(val)
{
  var list = val[0];
  var obj = val[1];
  var llist = [], i;
  obj = obj || this.vars["_node"];
  llist = this.mpi_props(obj, list, this);
  return (this.mpi_prop(obj, llist[Math.floor(Math.random(llist.length)) ], this));
},

//=head2 {secs:}

func_secs : function(val)
{ return (new Date().valueOf()/1000); },

func_select : function(val)
{ },

//=head2 {set:var,val}

func_set : function(val)
{
  var vr = val[0];
  var v = val[1];
  //if (vr.match(/^[a..zA..Z]/)) // some vars are reserved for engine use
  if (vr.substring(0,0) != '_')
  { this.vars[vr] = v; }
  else
  { console.log("invalid var", vr);	}
  return this.vars[vr];
},

//=head2 {sign:num}

func_sign : function(val)
{
  return (val[0]<0)?-1:(val[0]>0)?1:0;
},

//=head2 {smatch:string,pattern}
/*
func_smatch : function(val)
{
  var str = val[0]
  var pat = val[1];
  $str =~ /($pat)/;
  $1
},
*/
func_stimestr : function(val)
{ },

//=head2 {store:val,property[,node]}

func_store : function(val)
{
  var str = val[0]
  var prop =val[1];
  var obj = val[2];
  obj = obj || this.vars['_node'];
  return this.mpi_propset(obj, prop, str, this) || "";
},

//=head2 {strip:string}

//func_strip : function(val)
//{
  //chomp val[0];
  //val[0] =~ s/^\s*//;
  //val[0] =~ s/\s*$//;
  //val[0];
//}
// */
//=head2 {strlen:string}

func_strlen : function(val)
{
  return val[0].length;
},

//=head2 {sublist:list,pos1,pos2[,sep]}

func_sublist : function(val)
{
  var list = val[0];
  var pos1 = val[1];
  var pos2 = val[2];
  var sep = val[3];
  var list = this.unpack_list(list, sep);
  if (!pos2) { pos2 = list.length; }
  return this.pack_list( list.slice(pos1+0, pos2-1) );
},

//=head2 {subst:string,old,new}

func_subst : function(val)
{
  var str = val[0];
  var old = val[1];
  var nw = val[2];
  str.replace (old, nw);
  return str;
},

//=head2 {subt:num1,num2...}

func_subt : function(val)
{
  var num, tot;
  tot = 1*val.shift();
  for (var i=0; i < val.length; i++)
  { tot -= 1*val[i]; }
  return tot;
},

//=head2 {time:}

func_time : function(val)
{
  var date;
  if (val[0])
  { date = new Date(val[0]);	}
  else
  { date = new Date();	}
  return date.toTimeString();
},

func_timestr : function(val)
{ },

func_timesub : function(val)
{ },

//=head2 {tolower:string}

func_tolower : function(val)
{
  return val[0].toLowerCase();
},

//=head2 {toupper:string}

func_toupper : function(val)
{
  return val[0].toUpperCase();
},

func_tzoffset : function(val)
{ },

//=head2 {v:varname}

func_v : function(val)
{
  return this.vars[val[0]] || '';
},

//=head2 {version:}

func_version : function(val)
{ return this.VERSION; },

//=head2 {while:condition,command}

chk_cond : function (cond)
{
  var res = this.parse_parameter(cond);
// debug
//  print "cond res -- ";
  return res;
},

afunc_while : function(params)
{
  var res, result = '', save = {}, maxloop;
  var cond = params[0];
  var expr = params[1];
//  params = this.skip_param(expr)[0];
  maxloop = 255; //sanity
  while (this.eval_mpi(cond) && (maxloop >= 0))
  { var res = this.eval_mpi(expr);
    result += res;
    maxloop --;
  }
  return result;
},

//=head2 {with:varname...}

afunc_with : function(params)
{
  var varname;
  var expr;
  var val, res, save = {}, vasplit;
  var varname = this.eval_mpi(params[0]);
  if (typeof(varname) == 'string')
  {	vasplit = varname.split(':');	}
  else
  {	vasplit = varname;	}
  for (var i = 0; i < vasplit.length; i++)
  {
    save[vasplit[i]] = this.vars[vasplit[i]];
    this.vars[vasplit[i]] = ''; // a 'null' that isn't undef
  }
  var res = this.eval_mpi(params[1]);
  for (var i = 0; i < vasplit.length; i++)
  {	this.vars[vasplit[i]] = save[vasplit[i]];	}
  return res;
},

//=head2 {xor:num1,num2...}

XOR : function(a,b)
{
	return a&&!b || !a&&b;
},

func_xor : function(val)
{
  var num, tot;
  tot = val.shift();
  for (var i=0; i < val.length; i++)
  { tot = this.XOR(tot, num); }
  return tot;
},

// ====================================================
// core routines
// ====================================================
//=head2 -

//=head2 mpi->setvar(var,val);

//Sets a variable in the mpi object to a scalar value.

setvar : function(vr, val)
{
  return this.vars[vr] = val;
},

//=head2 mpi->readvar(var);

//Reads a scalar value from the mpi object

readvar : function(vr)
{
  return this.vars[vr];
},

// unpack a list in either MPI \n delimited string or perl list ref
unpack_list:function(list, sep)
{
  var llist = [];
  //console.log(ArrayisArray));
  if (Array.isArray(list))
  { llist = list; }
  else
  {
    //console.log(list);
    sep = sep || "\n";
    llist = list.split(sep);
  }
  return llist;
},

pack_list : function (list)
{
  //console.log(list);
  return list.join("\n");
},

// parse 1 parameter, which may contain a mix of plain text and MPI functions
// produces a list of
//	literal strings
//	operation objects {op, parameters}
//	remainder string last element
parse_parameter : function (text)
{
  //console.log("parameter from "+text);
  if ("" == text)	{ return ["", "", ""];	}
  var result = [], prefix, remainder, match, value;
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
      result.push(prefix);
      result.push(remainder);
      result.push(match);
      //console.log(result, remainder, match);
      return result; //[result, remainder, match];
    }
    // mpi function, evaluate
    
    else if (matches2 = match.match(/\{(\w+)/ ))
    {
      //console.log(text, match);
      var pr = text.split(match);
      prefix = pr.shift();
      remainder = pr.join(match);
      if (prefix != '')
      {	result.push(prefix);	}
      //console.log (result+' -', matches2[1], remainder);
      var params = this.parse_parameters(remainder);
      remainder = params.pop();
      var op = {op:matches2[1], parameters:params};
//if (! defined(value))
//{ "catch"; }
      result.push(op);
      text = remainder;
    }
  }
  // nothing left to parse
  if (text != '')
  {	result.push(text);	}
  result.push('');
  result.push('');
  return result; //[result+text, '', ''];
},

// parse all parameters for the current function(val)
parse_parameters: function(text)
{
  //console.log("parameters from", text);
  var params = [];
  var result, term;
  term = "zz";
  while (term.match(/[^\}]/))
  {
    //console.log(text);
    var result = this.parse_parameter(text);
    //result = re[0];
    term = result.pop();
    text = result.pop();
    if (result.length == 1)
    result = result[0];
    params.push(result);
  }
  params.push(text);
  return params; //[params, text];
},

eval_parameters : function(code)
{
	var result = [];
	for(var i in code)
	{
		result.push(this.eval_mpi(code[i]));
	}
	return result;
},
 
// evaluate 1 MPI function(operation)
eval_mpi: function(funct)
{
	//console.log (JSON.stringify(funct));
	//console.log(typeof(funct));
	if (typeof(funct) == 'undefined')
	{	return '';	}
	if (typeof(funct) == 'string')
	{	return funct;	}
	if (Array.isArray(funct))
	{
	    var params = this.eval_parameters(funct);
	    //console.log(params.join(','));
	    return params.join('');	
	}
		
	var result = '', remainder, params;
	funct.op = funct.op.toLowerCase();

	// if function is in control function list, pass raw text and let function parse.
	if (typeof (this["afunc_"+funct.op]) == "function")
	{
	     //console.log ('running', funct, text);
	     var result = this["afunc_"+funct.op](funct.parameters);
	     //result = re[0];
	     //remainder = re[1];
	}
	// parse parameters and pass results to function.
	else if (typeof (this["func_"+funct.op]) == "function")
	{
	    var params = this.eval_parameters(funct.parameters);
	    //console.log(JSON.stringify(funct.parameters));
	    //console.log(params);
	    //params = pa[0];
	    //remainder = pa[1];
	    //console.log ('running', funct.op, params.join(','));
	    result = this["func_"+funct.op](params);
	    //console.log (result);
	    //result = result[0];
	}
	// else concat parameters
	else if (this.vars["_f_"+funct.op])
	{
	    var vars = [], vr, i, save = {};
	    var params = this.eval_parameters(funct.parameters);
	    //params = pa[0];
	    //remainder = pa[1];
	    vars = this.vars["_f_"+funct+" v"]; //.split(':');
	    for (i = 0; i < vars; i++)
	    {
	      vr = vars[i];
	      save[vr] = this.vars[vr];
	      this.vars[vr] = params[i];
	    }
	    result = this.exec(this.vars["_f_"+funct]);
	    vr = this.vars["_f_"+funct+" v"]; //.split(':');
	    for (i = 0; i < vr.length; i++)
	    { this.vars[vr[i]] = save[vr[i]]; }
	}
	else
	{
		console.log('unknown operation ',funct.op);
	    var params = this.eval_parameters(funct.parameters);
	    result = params.join(',');
	}
	return result; //, remainder];
},

// process sourcecode into bytecode tree
exec : function(code)
{
	var result = '';
	if (typeof(code) == 'string')
	{	code = this.parse(code);	}
	//console.log(JSON.stringify(code));
	for(var i in code)
	{
		result += this.eval_mpi(code[i]);
	}
	return result;
},

//=head2 mpi->parse(string);

//Processes a string for MPI codes

// parse a text block.  simular to parse_parameter, except not terminating at ','
parse : function(text)
{
  var result = [], value, term;
  // while we have unprocessed text
  //   find MPI, if any.
  //   preceeding text copied to result.
  //   MPI evaluated and retuned values added to result.

  term = "zz"; // meaningless except not null
  while (text)
  {
    var value = this.parse_parameter(text);
    //console.log(va.join(' - '));
    term = value.pop();
    text = value.pop();
    if (value.length == 1)
    {	value = value[0];	}
    result.push(value);
    result.push(term);
  }

  return result;
},

unparse : function(code)
{
	if (typeof (code) == 'string')	{ return code;	}
	var source = '';
	for (i in code)
	{
		if (typeof(code[i]) == 'string')
		{	source += code[i];	}
		else
		{	source += '{'+code[i].op+':'+this.unparse(code[i].parameters)+'}';	}		
	}
},

// import content from another object
'import' : function(obj)
{
	for(var propertyName in obj)
	{
		this[propertyName] = obj[propertyName];
	}
	for (var adv in obj.advancedOps)
	{
		this.ctrl_functions[obj.advancedOps[adv]] = true;
	}	
}
};

