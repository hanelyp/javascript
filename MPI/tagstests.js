// dummy test callbacks

MPItest = {

properties : {
	self : {
		a : 1,
		b : 2
	}
},

mpi_neighbors : function (thisnode, pattern)
{
  return "neighbors:"+thisnode+','+pattern;
},

// adapt this for nested properties
mpi_prop : function(thisnode, propname)
{
	this.listProp(thisnode, propname);
	if (this.properties[thisnode])
	{
		//console.log(thisnode, propname);
		//console.log (this.properties[thisnode][propname]);
		return this.properties[thisnode][propname];
	}
	else
	return "";
},

mpi_props : function(thisnode, proppat)
{
	return this.mpi_prop(thisnode, propat);
},

// this method responsible for validating paths for set.
mpi_propset : function(thisnode, propname, val)
{
	if ('self' == thisnode)
	{
		this.properties[thisnode][propname] = val;
		this.updateByPropName(thisnode, propname);
		return val;
	}
	return '';
}

},

MPImain = {
  mpi : '', //new MPI('dummy node'),

tests :
[ 
  '{debug: 2}',
  '{style:bigtext,font-size:40px;font-style:italic;}',
  '{endstyle}',
  'Test of HTML elements and refreshing{br}',
  '{input: a}{input: b}{br}',
  '{refreshing:{add:{prop:a,},{prop:b,}}}{br}',
  '{table}{tr}',
  '{for:i,1,4,1,{td}{input:c/{v:i}}{endtd} }',
  '{endtr}{tr}',
//  '{refreshing:{prop:c/1} {prop:c/2} {prop:c/3} {prop:c/4} }{br}',
  '{for:i,1,4,1,{td:u_bigtext,color:blue}{refreshing:{v:i}=>{prop:c/{v:i}} ,{mklist:i}} }{endtd}',
  '{endtr}{endtable}',
  '{table}{tr}',
  '{td}good image: {image:https://lh5.googleusercontent.com/-hyJ-FcCJtCE/UkOh48YpfJI/AAAAAAAAARc/E2ehv67op5Y/w640-h480-no/parasol-prop.png}{endtd}',
  '{td}bad image: {image:https://malicious/lh5.googleusercontent.com/-hyJ-FcCJtCE/UkOh48YpfJI/AAAAAAAAARc/E2ehv67op5Y/w640-h480-no/parasol-prop.png}{endtd}',
  '{endtr}{endtable}',
  '{br}tests done'
],

run: function()
{
  var mpi = new MPI('self');
  mpi['import'](MPItest);
  mpi['import'](MPIupdatable);
  mpi['import'](MPIhtmltags);
  mpi.objname = 'MPImain.mpi';
  this.mpi = mpi;
  var out = '';
  for(var i = 0; i < this.tests.length; i++)
  //for(var i = 0; i < 22; i++)  // highlight a single trouble case
  {
    var test = this.tests[i];
    //console.log("test:",test);
    //alert (test);
    result = this.mpi.exec(test);
    this.mpi.func_notice([test]);
    //console.log ("result: [[", result, "]]");
    this.mpi.func_notice(["result: [["+ result+ "]]"]);
    out += result;
  }
  document.getElementById('testout').innerHTML = out;
}
};
/*
//abs          add         and          attr        convsecs     convtime
//count        date        debug        debugif     dec          default      
//delprop      dice        dist         div         eq           escape       
//eval         exec        filter       fold
//ftime        fullname    ge          gt           
//inc          index       instr        isnum       lcommon      le          
//list         listprops   lmember     lrand        lremove     
//lsort        lt          ltimestr     lunion      lunique      max          
//midstr       min         mklist       mod         mult         name        
//ne           nl          not          null        or           parse        
//prop         rand        secs         select      set          sign  
//smatch       stimestr    store        strip       strlen       sublist  
//subst        subt        time         timestr     timesub      tolower     
//toupper      tzoffset    v            version     xor
*/
