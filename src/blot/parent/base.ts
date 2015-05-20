import Blot from '../base';
import LeafBlot from '../leaf/base';
import LinkedList from '../../collection/linked-list';
import ShadowParent from '../../shadow/parent';
import * as Registry from '../../registry';


class ParentBlot extends ShadowParent implements Blot {
  static nodeName = 'parent';
  static scope = Registry.Scope.BLOCK;

  children: LinkedList<LeafBlot|ParentBlot> = new LinkedList<LeafBlot|ParentBlot>();

  constructor(value: HTMLElement) {
    super(value);
    this.build();
  }

  build(): void {
    var childNodes = Array.prototype.slice.call(this.domNode.childNodes || []);
    childNodes.forEach((node) => {
      var BlotClass = Registry.match(node);
      if (BlotClass != null) {
        var child = new BlotClass(node);
        this.appendChild(child);
      } else if (node.parentNode != null) {
        node.parentNode.removeChild(node);
      }
    });
  }

  // TODO same code as leaf.ts
  init(value: any): any {
    return value || document.createElement(this.statics.tagName);
  }

  formats(): any {
    throw new Error('ParentNode.formats() should be overwritten.');
  }

  length(): number {
    return this.children.reduce(function(memo, child) {
      return memo + child.length();
    }, 0);
  }

  values(): any[] {
    return this.children.reduce(function(memo, child) {
      var value = child.values();
      if (value instanceof Array) {
        memo = memo.concat(value);
      } else if (value != null) {
        memo.push(value);
      }
      return memo;
    }, []);
  }

  deleteAt(index: number, length: number): void {
    if (index === 0 && length === this.length()) {
      this.remove();
    } else {
      this.children.forEachAt(index, length, function(child, offset, length) {
        child.deleteAt(offset, length);
      });
    }
  }

  format(name: string, value: any): void {
    if (this.statics.nodeName === name) {
      if (value) return; // Nothing to do if adding existing format
      this.unwrap();
    } else {
      if (!value) return; // Can't remove formatting from self
      this.wrap(name, value);
    }
  }

  formatAt(index: number, length: number, name: string, value: any): void {
    if (index === 0 && length === this.length()) {
      this.format(name, value);
    } else {
      this.children.forEachAt(index, length, function(child, offset, length) {
        child.formatAt(offset, length, name, value);
      });
    }
  }

  insertAt(index: number, value: string, def?: any): void {
    var _arr = this.children.find(index);
    var child = _arr[0], offset = _arr[1];
    child.insertAt(offset, value, def);
  }
}


export default ParentBlot;
