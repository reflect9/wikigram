
///////////////////////////////////////////////////////////////////////////
// HELPER METHODS ///
///////////////////////////////////////////////////////////////////////////
jQuery.fn.myIndex = function(selector) {
	var i = $(this).parent().children(selector).index(this);
	return (i && i>-1)? i:0;
};
jQuery.fn.justtext = function() {
    return $(this).clone()
            .children()
            .remove()
            .end()
            .text();
};
jQuery.fn.containsString = function(str) {
	if($(this).text.indexOf(str)!=-1) return true;
	if($(this).attr('href') && $(this).attr('href').indexOf(str)!=-1) return true;
	if($(this).attr('src') && $(this).attr('src').indexOf(str)!=-1) return true;
	return false;
};
var containsAll = function(outer,inner) {
	var flag = true;
	_.each(inner, function(el) {
		if($.contains(outer,el)===false) flag = false;
	});
	return flag;
};
jQuery.fn.fingerprint = function() {
	var  childrenPrint = "";
	if($(this).children().length>0)
		childrenPrint = "["+ _.reduce($(this).children(), function(memo,child) {
			return memo + "," + $(child).fingerprint();
		},"") +"]";
	return $(this).prop("tagName")+childrenPrint;
};
jQuery.fn.pathWithNth = function(root) {
	// if this(commonAncester) and root(I[0]) are same, then return ""
	if($(this)[0]===$(root)[0]) return "";
	return _.reduce($(this).parentsUntil(root), function(memo,p) {
			return $(p).tagNth()+" > "+memo;
	},$(this).tagNth());
};
jQuery.fn.leafNodePath = function(commonAncester) {
	if($(this)[0]===$(commonAncester)[0]) return "";
	var listOfParents = $(this).parentsUntil($(commonAncester));
	return _.reduce(listOfParents, function(memo, p) {
		return $(p).prop("tagName")+" > "+memo;
	},(listOfParents.length>0)? $(this).tagClassNth(): $(this).tagAndClass());
};
jQuery.fn.path = function() {
	return _.reduce($(this).parents(), function(memo,p) {
			return $(p).tag()+" "+memo;
	},"");
};
jQuery.fn.tagClassNth = function() {
	var cls, nth;
	var tag = $(this).prop("tagName");
	if ($(this).attr("class")) cls = "."+$(this).attr("class").trim().replace(/\s+/g,".");
	else cls="";
	var siblings = $(this).parent().children();
	if(siblings.length>1) {
		nth = ":nth-child("+(siblings.index(this)+1)+")";
	} else nth = "";
	return tag+cls+nth;
};
jQuery.fn.tagNth = function() {
	var nth;
	var tag = $(this).prop("tagName");
	//if ($(this).attr("class"))  var cls = "."+$(this).attr("class").trim().replace(/\s+/g,".");
	//else var cls="";
	var siblings = $(this).parent().children();
	if(siblings.length>1) {
		nth = ":nth-child("+(siblings.index(this)+1)+")";
	} else nth = "";
	return tag+nth;
};
jQuery.fn.tagAndClass = function() {
	var q = $(this).prop("tagName");
	if ($(this).attr("class")) q = q+"."+$(this).attr("class").trim().replace(/\s+/g,".");
	return q;
};
jQuery.fn.tagAndId = function() {
	var q = $(this).prop("tagName");
	if ($(this).attr("id")) q = q+"#"+$(this).attr("id");
	return q;
};
jQuery.fn.tag = function() {
	var q = $(this).prop("tagName");
	return q;
};
jQuery.fn.trimArray = function() {
	var result = [];   var validity = true;
	_.each(this, function(v) {
		if(v===undefined || v===null || v==="") validity=false;
		if(validity) result.push(v);
	});
	return result;
};
jQuery.fn.hasElement = function(el) {
	return _.filter(this, function(p) { return p==el;}).length>0;
};
var html2dom = function(html) {
	var $dom = $('<html>').html(html);
	return $dom;
};
var getContentAtTop = function(list) {
	var result = [];
	for(var i=0;i<list.length;i++) {
		if(list[i]!==null && list[i]!==undefined ) result.push(list[i]);
		else break;
	}
	return result;
};
var getCommonAncestorMultiple=  function(list) {
	var result = _.reduce(list, function(memo,el) {
		return getCommonAncestor(el,memo);
	},_.first(list));
	return result;
};
var getCommonAncestor = function(a,b) {
    $parentsa = $(a).add($(a).parents());
    $parentsb = $(b).add($(b).parents());
    var found = null;
    $($parentsa.get().reverse()).each(function() {
        var thisa = this;
        $($parentsb.get().reverse()).each(function() {
            if (thisa == this)
            {
                found = this;
                return false;
            }
        });
        if (found) return false;
    });
    return found;
};
var hasAttribute = function(list, attrKey) {
	return _.filter($(list).trimArray(), function(el) {
		return $(el).attr(attrKey)!==undefined || $(el).attr(attrKey)!==null;
	}).length===0;
};
var RegexProduct = function(rlist) {
	var resultReg=[];  var rL = _.union(rlist,/^/);  var rR = _.union(rlist,/$/);
	for(var i in rL) {
		for(var j in rR) {
			if(rL[i]==rR[j]) continue;
			resultReg.push(new RegExp(rL[i].source+"(.*)"+rR[j].source,"g"));
		}
	}
	return _.uniq(resultReg);
};
var insertArrayAt = function(array, index, arrayToInsert) {
    Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
};
var mergeList = function(list1, list2) {
	var merged = [];
	for(var i=0;i<Math.max(list1.length,list2.length);i++) {
		if(list1[i]!==null && list1[i]!==undefined) merged.push(list1[i]);
		else merged.push(list2[i]);
	}
	return merged;
};
var isCorrectResult = function(inputList, outputList) {
	// checks each outputList is found in corresponding inputList
	if($(inputList).trimArray().length===0) return false;	// if input creates nothing, incorrect.
	else if($(outputList).trimArray().length===0) return true; // if input has something and output is empty, then all the inputs are accepted. 
	// if input and outputlist are both nonempty, then we check each 
	var nonMatched = _.filter(_.zip($(inputList).trimArray(),$(outputList).trimArray()), function(e) {
		// if input empty or, output cannot be found in input, then it's nonmatched object 
		return !e[0] || (e[0] && e[1] && e[0].indexOf(e[1])==-1);
	});
	return nonMatched.length===0;
};
var isOutputContainInput = function(inputList, outputList) {
	// used in GenerateAttach.  checks whether every output.html contains input.outerHTML
	var iT = $(inputList).trimArray(); var oT = $(outputList).trimArray();
	if(!isDomList(iT) || !isDomList(oT)) return false;
	if(iT.length<2 || oT.length<2 || iT.length<oT.length) return false;	// if input creates nothing, incorrect.
	var zipped = _.zip(iT.slice(0,oT.length),oT);	// match the oT.length
	var nonMatched = _.filter(zipped, function(e) {
		// if input empty or, output cannot be found in input, then it's nonmatched object 
		if(!e[0] || e[0].outerHTML.match(/^\s*$/) || e[1].outerHTML.match(/^\s*$/)) return true;
		if(e[1].innerHTML.indexOf(e[0].outerHTML)!==-1) return false;
		else return true;
	});
	return nonMatched.length===0;
};
var isURL = function(list) {
	var toCheck = (_.isArray(list))? list: [list];
	toCheck = $(toCheck).trimArray();
	return _.filter(toCheck, function(e) {
		return _.isString(e)===false || e.indexOf("http")!==0;
	}).length===0;
};
var isSrc = function(list) {
	var toCheck = (_.isArray(list))? list: [list];
	toCheck = $(toCheck).trimArray();
	return _.filter(toCheck, function(e) {
		return _.isString(e)===false || !e.match(/(png)|(jpg)|(gif)|(bmp)/ig) || !e.match(/html/ig);
	}).length===0;
};
var isDomList = function(list) {
	var trimmedList = $(list).trimArray();
	return trimmedList.length>0 && _.filter(trimmedList, function(e) {  return !isDom(e); }).length ===0;
};
var isDom = function(el) {
	return (el && el.nodeType!==null && el.nodeType!==undefined);
};
var isValueList = function(list) {
	return (list[0].nodeType===undefined || list[0].nodeType===null);
};
var isSameArray = function(a1, a2, option) {
	var aa1=a1; var aa2=a2;
	if(option=="ALLOW_PARTIAL_OUTPUT") { aa1 = a1.slice(0,a2.length); aa2=a2; }
	if(aa1.length != aa2.length) return false;
	for(var i=0;i<aa1.length;i++) {
		if(aa1[i]!=aa2[i]) return false;
	}
	return true;
};
var isPermutation = function(a1, a2) {
	if(a1.length != a2.length) return false;
	var a2c = a2.slice(0);
	for(var i=0;i<a1.length;i++) {
		if(a2c.indexOf(a1[i])==-1) return false;
		a2c = remove(a2c,a1[i]);
	}
	if (a2c.length>0) return false;
	return true;
};
var remove = function(list, removeItem) {
	return jQuery.grep(list, function(value) {
		return value != removeItem;
	});
};
var obj2text = function(obj) {
	if(obj.nodeType!==null && obj.nodeType!==undefined) {
		// DOM
		return "[D:"+$(obj).prop('tagName')+"]"+$(obj).text();
	} else {
		return JSON.stringify(obj);
	}
};
// convert ill-structured test to list or single string/integer
var txt2var = function(txt) {
	try{
		return JSON.parse(txt);
	}catch(er) {
		try {
			return JSON.parse('"'+txt+'"');
		}
		catch(err) {
			return null;
		}
	}
};
// convert list or single string/integer to string without quotation
var var2txt = function(v) {
	if (v===null || v===undefined) return "";
	if(isDom(v)) {
		return "[D:"+$(v).prop('tagName')+"]"+$(v).text();
	} else {
		return JSON.stringify(v).replace(/^\"/ig,"").replace(/\"$/ig,"");
	}
};

var var2cell = function(v) {
	if (v===null || v===undefined) return "";
	if(isDom(v)) {
		var span;
		if($(v).prop('tagName').match(/img/ig)) {
			span = $("<span varType='dom'></span>").addClass('');
			$(span).append($("<span class='cellButton label label-inverse'></span>").append($(v).tagAndId()));
			$("<img></img>").attr('src',$(v).attr('src')).appendTo(span);
			return span;
		} else {
			span = $("<span varType='dom'></span>").addClass('');
			var label = $("<span class='cellButton label label-inverse'></span>").append($(v).tagAndId()).appendTo(span);
			// A and HTML labels open new tab with the widget open
			if($(v).tagAndId().match(/(^HTML|^A)/ig)) {
				$(label).mouseup(function() {
					var cellDiv = $(this).parents(".wg_cell");
					var pos = wg.widget.getCellPosition(cellDiv);
					openChildPage(v.url,pos);
				});
			}
			$(span).append($(v).text().replace(/\s{2,}/ig,""));
			return span;
		}
	} else {
		return JSON.stringify(v).replace(/^\"/ig,"").replace(/\"$/ig,"");
	}
};

var str2value = function(str) {
	var list = str.replace(/[\"|\[\]]/g,"").split(",");
	parsedList = _.map(list, function(e) {
		e = $.trim(e);
		if(_.isNaN(parseFloat(e))) return e;
		else return parseFloat(e);
	});
	return parsedList;
};
var str2Url = function(str) {
	var domain = $.url().attr("protocol")+"://"+$.url().attr("host")+"/";
	if(str && !str.match(/http(s)?:\/\//i)) {
		return domain+str;
	} else {
		return str;
	}
};
var productThreeArrays = function(a,b,c, cons) {
	var result = [];
	_.each(a, function(ael) {
		_.each(b, function(bel) {
			_.each(c, function(cel) {
				if(cons(ael,bel,cel)===true)
					result.push([ael,bel,cel]);
			});
		});
	});
	return result;
};
var isSameObject = function(x, y)
{
	if(x===null || y===null) { return false;}
  var p;
  for(p in y) {
      if(typeof(x[p])=='undefined') {return false;}
  }
  for(p in y) {
      if (y[p]) {
          switch(typeof(y[p])) {
              case 'object':
                  if (!y[p].equals(x[p])) { return false; } break;
              case 'function':
                  if (typeof(x[p])=='undefined' ||
                      (p != 'equals' && y[p].toString() != x[p].toString()))
                      return false;
                  break;
              default:
                  if (y[p] != x[p]) { return false; }
          }
      } else {
          if (x[p])
              return false;
      }
  }

  for(p in x) {
      if(typeof(y[p])=='undefined') {return false;}
  }
  return true;
};

if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
var makeid = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
};