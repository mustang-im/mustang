// VIPs - Very often Invoked Procedures

const Cc = Components.classes;
const CI = Components.interfaces;
const Ci = Components.interfaces;

function E(id)
{
  return document.getElementById(id);
}

function debug(message)
{
  dump(message + "\n");

  // GUI
  var outNode = E("debug");
  if (outNode)
  {
    outNode.appendChild(document.createTextNode(message));
    outNode.appendChild(document.createElementNS("http://www.w3.org/1999/xhtml", "br"));
  }
}

function dumpObject(obj, name, maxDepth, curDepth)
{
  var result = "";

  if (curDepth == undefined)
    curDepth = 1;
  if (maxDepth != undefined && curDepth > maxDepth)
    return;

  var i = 0;
  for (var prop in obj)
  {
    i++;
    if (typeof(obj[prop]) == "xml")
    {
      result += name + "." + prop + "=[object]" + "\n";
      result += dumpObject(obj[prop], name + "." + prop, maxDepth, curDepth+1);
    }
    else if (typeof(obj[prop]) == "object")
    {
      if (obj[prop] && typeof(obj[prop].length) != "undefined")
        result += name + "." + prop + "=[probably array, length " + obj[prop].length + "]" + "\n";
      else
        result += name + "." + prop + "=[object]" + "\n";
      result += dumpObject(obj[prop], name + "." + prop, maxDepth, curDepth+1);
    }
    else if (typeof(obj[prop]) == "function")
      result += name + "." + prop + "=[function]" + "\n";
    else
      result += name + "." + prop + "=" + obj[prop] + "\n";
  }
  if (!i)
    result += name + " is empty";
  return result;
}
