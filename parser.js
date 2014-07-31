// Inspired by phpSyntaxTree by Andre Eisenbach <andre@ironcreek.net>
// https://code.google.com/p/phpsyntaxtree/

var pos = 0;
var data;
// root node
var root;
var currentNode;

function parse(textData) {
	// Reset
	pos = 0;
	currentNode = null;
	root = null;
	
	// Clean up
	data = textData.replace(/\s+/g, " ");
	data = data.replace(/\) \(/g, ")(");
	data = data.replace(/\( \(/g, "((");
	data = data.replace(/\) \)/g, "))");
	
	// Parse the string
	makeTree();
	root = currentNode;
	while (root.getParent() != null) root = root.getParent();
	return jQuery.parseJSON(root.toJSON());
}

function makeTree() {
    var token = getNextToken().trim();
	// console.log("First token: " + token);
	var parts = [2];
	
    while( token != "" && token != ")" && token != "]" ) {
        switch(token.charAt(0)) {
		case "(":
        case "[":
            token = token.substr(1, token.length - 1);
            var spaceAt = token.indexOf(" ");
			var childNode;
			
            if (spaceAt != -1) {
                parts[0] = token.substr(0, spaceAt);
                parts[1] = token.substr(spaceAt, token.length - spaceAt);
                childNode = new TreeNode(parts[0]);
				childNode.addChild(new TreeNode(parts[1]));
            } 
			else {
                childNode = new TreeNode(token);
            }
			
			if (currentNode) {
				// console.log("Current node: " + currentNode.toJSON());
				// console.log("Adding child" + childNode.toJSON());
				currentNode.addChild(childNode);
			}
			currentNode = childNode;
			makeTree();
            break;

        default:
            if (token != "") {
				currentNode.addChild(new TreeNode(token));
            }
            break;
        }
        token = getNextToken().trim();
    }
	if (token == ")" || token == "]") {
		if (currentNode.getParent()) {
			currentNode = currentNode.getParent();
			// console.log("Back to: " + currentNode.toJSON());
		}
	}
}

function getNextToken() {
    var gotToken = false;
    var token = "";
    var i = 0;

    if ((pos + 1) >= data.length) return "";

    while((pos + i) < data.length && !gotToken ) {
        var ch = data.charAt(pos + i);

        switch(ch) {
        case "[":
		case "(":
            if( i > 0 ) gotToken = true;
            else token += ch;
            break;

		case ")":
        case "]":
            if( i == 0 ) token += ch;
            gotToken = true;
            break;

        default:
            token += ch;
            break;
        }
        i++;
    }

    if (i > 1) pos += i - 1;
    else pos++;

    return token;
}

function TreeNode(label) {
	this.parent;
	this.name = label;
	this.children = [];
	
	this.addChild = function(child) {
		child.parent = this;
		this.children[this.children.length] = child;
	}
	
	this.getParent = function() {
		return this.parent;
	}
	
	this.getChild = function(index) {
		return this.children[index];
	}
	
	this.toJSON = function() {
		var text = "{\"name\":" + "\"" + label + "\"";
		if (this.children.length != 0) {
			text += ",\"children\":[";
			for	(var index = 0; index < this.children.length; ++index) {
		    	text += this.children[index].toJSON() + ",";
			}
			//Remove the last comma
			text = text.substr(0, text.length-1);
			text += "]";
		}
		text += "}";
		return text;
	}
}