/* eslint-disable max-classes-per-file */
/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);

  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelector {
  constructor() {
    this.curElement = '';
    this.curId = '';
    this.curClass = '';
    this.curAttr = '';
    this.curPseudoClass = '';
    this.curPseudoElement = '';
  }

  element(value) {
    if (this.curId
      || this.curClass
      || this.curAttr
      || this.curPseudoClass
      || this.curPseudoElement) {
      throw new Error('Selector parts should be arranged in the following order:'
      + ' element, id, class, attribute, pseudo-class, pseudo-element');
    }

    if (!this.curElement) {
      this.curElement += value;
    } else {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    return this;
  }

  id(value) {
    if (this.curClass
      || this.curAttr
      || this.curPseudoClass
      || this.curPseudoElement) {
      throw new Error('Selector parts should be arranged in the following order:'
      + ' element, id, class, attribute, pseudo-class, pseudo-element');
    }

    if (!this.curId) {
      this.curId += `#${value}`;
    } else {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    return this;
  }

  class(value) {
    if (this.curAttr
      || this.curPseudoClass
      || this.curPseudoElement) {
      throw new Error('Selector parts should be arranged in the following order:'
      + ' element, id, class, attribute, pseudo-class, pseudo-element');
    }

    this.curClass += `.${value}`;
    return this;
  }

  attr(value) {
    if (this.curPseudoClass
      || this.curPseudoElement) {
      throw new Error('Selector parts should be arranged in the following order:'
      + ' element, id, class, attribute, pseudo-class, pseudo-element');
    }

    this.curAttr += `[${value}]`;
    return this;
  }

  pseudoClass(value) {
    if (this.curPseudoElement) {
      throw new Error('Selector parts should be arranged in the following order:'
      + ' element, id, class, attribute, pseudo-class, pseudo-element');
    }

    this.curPseudoClass += `:${value}`;
    return this;
  }

  pseudoElement(value) {
    if (!this.curPseudoElement) {
      this.curPseudoElement += `::${value}`;
    } else {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    return this;
  }

  stringify() {
    return `${this.curElement}${this.curId}${this.curClass}${this.curAttr}${this.curPseudoClass}${this.curPseudoElement}`;
  }
}

class CombinedCssSelector {
  constructor(selector1, combinator, selector2) {
    this.selector1 = selector1;
    this.combinator = combinator;
    this.selector2 = selector2;
  }

  stringify() {
    return `${this.selector1.stringify()} ${this.combinator} ${this.selector2.stringify()}`;
  }
}

const cssSelectorBuilder = {
  element(value) {
    const selector = new CssSelector();
    selector.element(value);
    return selector;
  },

  id(value) {
    const selector = new CssSelector();
    selector.id(value);
    return selector;
  },

  class(value) {
    const selector = new CssSelector();
    selector.class(value);
    return selector;
  },

  attr(value) {
    const selector = new CssSelector();
    selector.attr(value);
    return selector;
  },

  pseudoClass(value) {
    const selector = new CssSelector();
    selector.pseudoClass(value);
    return selector;
  },

  pseudoElement(value) {
    const selector = new CssSelector();
    selector.pseudoElement(value);
    return selector;
  },

  // eslint-disable-next-line class-methods-use-this
  combine(selector1, combinator, selector2) {
    return new CombinedCssSelector(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
