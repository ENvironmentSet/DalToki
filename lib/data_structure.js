var data_structure = ( () => {
    "use strict";

    class Tree {
        constructor () {
            this.root = new Node(null);
        }

        static createNode (value) {
            return new Node(value);
        }

        init (root_value) {
            this.root = new Node(root_value);
            return this;
        }

        deleteNode (name) {
            var scope = this.root.childs;
            if(scope.has(name)) {
                scope.delete(name);
            } else {
                scope.forEach( (v,k) => {
                    v.remove(name);
                });
            }
            return this;
        }
    }

    class Node {
        constructor (value = null) {
            this.value = value;
            this.childs = new Map();
        }

        appendNode (name,node) {
            if(!this.childs.has(name)) {
                this.childs.set(name,node);
            } else false;
        }

        remove (name) {
            var scope = this.childs;
            if(scope.has(name)) {
                scope.delete(name);
            } else {
                scope.forEach( (v,k) => {
                    v.remove(name);
                });
            }
        }
    }

    return {
        "Tree" : Tree
    };
})();

module.exports = data_structure;