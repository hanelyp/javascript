// dummy test callbacks

MPItest = {

mpi_neighbors : function (thisnode, pattern)
{
  return "neighbors:"+thisnode+','+pattern;
},

mpi_prop : function(thisnode, propname)
{
  return (thisnode+'/'+propname);
},

mpi_props : function(thisnode, proppat)
{
  return ["propa", "propb", "propc"];
},

mpi_propset : function(thisnode, propname, val)
{
  return thisnode+','+propname+','+val;
}

};

MPImain = {
  mpi : '', //new MPI('dummy node'),

tests :
[ 'plain text, no MPI',
  '{toupper:lower to upper}',
  '1+2 = {add:1,2} = 2+1',
  '{tolower:{toupper:lower to upper to lower}}',
  '{for:i,1,4,1,{v:i} }',
  
  '{abs:-2}',
  '{add:1,2,3}',
  '{and:2,4,6}',
  '{attr:attribute...,text}',
  '{mklist:list,items}',
  '{set:list,{mklist:list,items}}',
  '{count:{v:list}}',
  '{date:}',
  '{set:var,1}',
  '{v:var}',
  '{dec:var,2}',
  '{inc:var,4}',
  '{default:1,2}',
  '{dice:6,3,2}',
  '{dist:3,4}',
  '{div:81,9,3}',
  '{eq:var1,var1}',
  '{eval:vars...}',
  '{foreach:var,{v:list},:{v:var}:}',
  '{ge:2,2}',
  '{gt:2,1}',
  '{if:true,true statement,false statement}',
  '{insrt:string1,ing}',
  '{lcommon:{v:list},{mklist:items}}',
  '{le:1,2}',
  '{lmember:{v:list},items}',
  '{lit:{a:dummy,mpi}}',
  '{max:1,2,3}',
  '{min:1,2,3}',
  '{mod:9,4}',
  '{mult:2,4,8}',
  '{ne:var1,var2}',
  '::{nl:}::',
  '{not:true}',
  '{null:a big statement to execute but not keep a value from...}',
  '{or:1,2,0}',
  '{secs:}',
  '{sign:-100}',
  '{smatch:string,ing}',
  '{strip:  string   }',
  '{strlen:string}',
  '{subst:string,ing,ung}',
  '{subt:100,50,25}',
  '{time:}',
  '{version:}',
  '{set:var,3}',
  '{while:{v:var},{v:var}>>{dec:var,1}:}',
  '{with:var,{v:var}}',
  '{xor:1,1,1}',
  'The following are dummy without support functions',
  '{delprop:var,obj}',
  '{exec:prop,node}',
  '{index:prop,obj}',
  '{list:props,obj}',
  '{listprops:props,obj}',
  '{neighbors:varname,pattern,{v:varname}}',
  '{prop:property,node}',
  '{store:val,property,node}'
],

run: function()
{
  this.mpi = new MPI('dummy node');
  this.mpi['import'](MPItest);
  
  //for(var i = 0; i < this.tests.length; i++)
  for(var i = 0; i < 22; i++)  // highlight a single trouble case
  {
    var test = this.tests[i];
    console.log("test:",test);
    //alert (test);
    result = this.mpi.exec(test);
    console.log ("result: [[", result, "]]");
  }
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
