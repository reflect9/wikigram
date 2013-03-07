
///////////////////////////////////////////////////////////////////////////
// HELPER METHODS ///
///////////////////////////////////////////////////////////////////////////
jQuery.fn.myIndex = function(selector) {
	return $(this).parent().children(selector).index(this);
};
jQuery.fn.justtext = function() {
    return $(this).clone()
            .children()
            .remove()
            .end()
            .text();
};
jQuery.fn.fingerprint = function() {
	var  childrenPrint = "";
	if($(this).children().length>0) 
		var childrenPrint = "["+ _.reduce($(this).children(), function(memo,child) {
			return memo + "," + $(child).fingerprint(); 
		},"") +"]";
	return $(this).prop("tagName")+childrenPrint;
}
jQuery.fn.pathWithNth = function(root) {
	return _.reduce($(this).parentsUntil(root), function(memo,p) { 
			return $(p).tagNth()+" > "+memo;  
	},$(this).prop("tagName"));
}
jQuery.fn.leafNodePath = function(commonAncester) {
	var listOfParents = $(this).parentsUntil($(commonAncester));
	return _.reduce(_.without(listOfParents,_.last(listOfParents)), function(memo, p) {
		return $(p).prop("tagName")+" > "+memo;
	},$(this).tagClassNth());
}
jQuery.fn.path = function() {
	return _.reduce($(this).parents(), function(memo,p) { 
			return $(p).tag()+" "+memo;  
	},"");
}
jQuery.fn.tagClassNth = function() {
	var tag = $(this).prop("tagName");
	if ($(this).attr("class"))  var cls = "."+$(this).attr("class").trim().replace(/\s+/g,"."); 
	else var cls="";
	var siblings = $(this).parent().children();
	if(siblings.length>1) {
		var nth = ":nth-child("+(siblings.index(this)+1)+")";	
	} else nth = "";
	return tag+cls+nth;		
}
jQuery.fn.tagNth = function() {
	var tag = $(this).prop("tagName");
	//if ($(this).attr("class"))  var cls = "."+$(this).attr("class").trim().replace(/\s+/g,"."); 
	//else var cls="";
	var siblings = $(this).parent().children();
	if(siblings.length>1) {
		var nth = ":nth-child("+(siblings.index(this)+1)+")";	
	} else nth = "";
	return tag+nth;		
}
jQuery.fn.tagAndClass = function() {
	var q = $(this).prop("tagName");
	if ($(this).attr("class")) q = q+"."+$(this).attr("class").trim().replace(/\s+/g,".");
	return q;
}
jQuery.fn.tag = function() {
	var q = $(this).prop("tagName");
	return q;
}
jQuery.fn.trimArray = function() {
	var result = [];   var validity = true;
	_.each(this, function(v) {
		if(v==null || v=="") validity=false;
		if(validity) result.push(v);	
	});
	return result;
}
var getCommonAncestorMultiple=  function(list) {
	var result = _.reduce(list, function(memo,el) {
		return getCommonAncestor(el,memo);
	},_.first(list));
	return result;
}
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
}
var RegexProduct = function(rlist) {
	var resultReg=[];  var rL = _.union(rlist,/^/);  var rR = _.union(rlist,/$/); 
	for(var i in rL) {
		for(var j in rR) {
			if(rL[i]==rR[j]) continue;
			resultReg.push(new RegExp(rL[i].source+"(.*)"+rR[j].source,"g"));
		}
	}
	return _.uniq(resultReg);
}
var isDomList = function(list) {
	return (list[0].nodeType!=null);	
}
var isValueList = function(list) {
	return (list[0].nodeType==null);	
}

var isSameArray = function(a1, a2, option) {
	var aa1=a1; var aa2=a2;
	if(option=="ALLOW_PARTIAL_OUTPUT") { aa1 = a1.slice(0,a2.length); aa2=a2; }
	if(aa1.length != aa2.length) return false;
	for(var i=0;i<aa1.length;i++) {
		if(aa1[i]!=aa2[i]) return false;
	}
	return true;
}
var isPermutation = function(a1, a2) {
	if(a1.length != a2.length) return false;
	var a2c = a2.slice(0);
	for(var i=0;i<a1.length;i++) {
		if(a2c.indexOf(a1[i])==-1) return false;
		a2c = remove(a2c,a1[i]);
	}
	if (a2c.length>0) return false;
	return true;
}
var remove = function(list, removeItem) {	
	return jQuery.grep(list, function(value) {
	  return value != removeItem;
	});
}		

		
var obj2text = function(obj) {
	if(obj.nodeType!=null) {
		// DOM
		return "[D:"+$(obj).prop('tagName')+"]"+$(obj).text();
	} else {
		return JSON.stringify(obj);
	}
}

// convert ill-structured test to list or single string/integer
var txt2var = function(txt) {
	try{
		return JSON.parse(txt);
	}catch(e) {
		try {
			return JSON.parse('"'+txt+'"');
		}
		catch(e) {
			return null;
		}
	}
}
// convert list or single string/integer to string without quotation
var var2txt = function(v) {
	if (v==null || v==undefined) return "";
	if(v.nodeType!=null) {
		// variable is DOM element
		return "[D:"+$(v).prop('tagName')+"]"+$(v).text();
	} else {
		return JSON.stringify(v).replace(/^\"/ig,"").replace(/\"$/ig,"");	
	}
}


var str2value = function(str) {
	var list = str.replace(/[\"|\[\]]/g,"").split(",");
	parsedList = _.map(list, function(e) {
		e = $.trim(e);
		if(_.isNaN(parseFloat(e))) return e;
		else return parseFloat(e);
	}); 
	return parsedList;
}
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
}