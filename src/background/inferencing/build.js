import tt from '../../helpers';

/*
 * Build tree from given JSON file listing nodes with keywords.
 */

class Category {
  constructor(name, keywords=[], children=[]) {
    this.name = name;
    this.keywords = keywords;
    this.children = children;
  }
}

/*
  Find given category in given tree and add a child to the
  found node. Assumes category exists and is unique.
*/
function findAndAddChild(name, child, tree) {
  if (tree === undefined) {
    return;
  } else if (tree.name === name) {
    tree.children.push(child);
  } else {
    for (let i = 0; i < tree.children.length; i++) {
      findAndAddChild(name, child, tree.children[i]);
    }
  }
}

export default async function (in_file) {
  // reading file
  // var fs = require("fs");
  // var obj = JSON.parse(fs.readFileSync(in_file, "utf8"));
  var file = await tt.readTextFile(in_file);
  var obj = tt.deserialize(file);

  // initalize tree with just the root
  var tree = new Category('Root');

  for (let i = 0; i < obj.length; i++) {
    let raw_name = obj[i].category.trim();
    let cats = raw_name.split('>');
    let cat;
    let child;

    if (cats.length === 1) {
      cat = 'Root';
    } else {
      cat = cats[cats.length - 2];
    }

    child = new Category(cats[cats.length - 1], obj[i].keywords);

    findAndAddChild(cat, child, tree);
  }

  return tree;
}

