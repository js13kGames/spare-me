;(function () {
'use strict';

var animations = []

function Fn (selector) {
  var i = 0
    , nodes = []
    , results = []

  if (selector instanceof Fn) {
    return selector
  }

  this.element = selector
  if (typeof selector === 'string') {
    if (selector.indexOf('#') === 0) {
      this.element = document.getElementById(selector.slice(1))
    }
    if (selector.indexOf('.') === 0) {
      nodes = document.getElementByClassName(selector.slice(1))
      for (i = 0; i < nodes.length; i += 1) {
        results.push(new Fn(nodes[i]))
      }
      return results
    }
    if (selector.indexOf('<') === 0) {
      selector = selector.slice(1, -1)
      nodes = document.getElementByTagName(selector)
      for (i = 0; i < nodes.length; i += 1) {
        results.push(new Fn(nodes[i]))
      }
      return results
    }
  }
  return this
}

Fn.prototype.html = function (value) {
  if (this.element) {
    if (value === undefined) {
      return this.element.innerHTML
    }
    this.element.innerHTML = value
  }
  return this
}

Fn.prototype.int = function (value) {
  return parseInt(this.html(), 10)
}

Fn.prototype.top = function (value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.style.top, 10)
    }
    this.element.style.top = value + 'rem'
  }
  return this
}

Fn.prototype.left = function (value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.style.left, 10)
    }
    this.element.style.left = value + 'rem'
  }
  return this
}

Fn.prototype.center = function () {
  var e = this.element
    , x = 0
    , y = 0

  if (e) {
    x = e.offsetWidth / 2
    y = e.offsetHeight / 2
  }

  while (e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop)) {
    x += e.offsetLeft - e.scrollLeft
    y += e.offsetTop - e.scrollTop
    e = e.offsetParent
  }

  return { x: x / 10, y: y / 10 }
}

Fn.prototype.has = function (klass) {
  return this.element && this.element.className.indexOf(klass) >= 0
}

Fn.prototype.add = function (klass) {
  klass = ' ' + klass
  if (!this.has(klass)) {
    this.element.className += klass
  }
  return this
}

Fn.prototype.remove = function (klass) {
  if (this.element) {
    var regex = new RegExp('(\\s+)?' + klass, 'g')
    this.element.className = this.element.className.replace(regex, '')
  }
  return this
}

Fn.prototype.toggle = function (klass) {
  if (this.has(klass)) {
    this.remove(klass)
  } else {
    this.add(klass)
  }
  return this
}

Fn.prototype.data = function (value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.getAttribute('data-value'), 10)
    }
    this.element.setAttribute('data-value', value)
  }
  return this
}

Fn.prototype.on = function (message, callback) {
  if (this.element) {
    this.element.addEventListener(message, callback, false)
  }
}

Fn.prototype.off = function (message, callback) {
  if (this.element) {
    this.element.removeEventListener(message, callback, false)
  }
}

Fn.prototype.animate = function (klass, callback) {
  var self = this

  function onTransitionEnd () {
    var i = 0
      , temp = []

    for (i = 0; i < animations.length; i += 1) {
      if (animations[i].element !== self &&
          animations[i].callback !== onTransitionEnd &&
          animations[i].klass !== klass) {
        temp.push(animations[i])
      }
    }
    animations = temp

    self.off('webkitTransitionEnd', onTransitionEnd)
    self.off('otransitionend', onTransitionEnd)
    self.off('transitionend', onTransitionEnd)
    self.remove(klass)
    if (callback) {
      callback()
    }
  }

  if (this.element) {
    animations.push({ element: self, callback: onTransitionEnd, klass: klass })
    this.on('webkitTransitionEnd', onTransitionEnd)
    this.on('otransitionend', onTransitionEnd)
    this.on('transitionend', onTransitionEnd)
    this.add(klass)
  }

  return this
}


Fn.prototype.touch = function (start, end) {
  if (this.element) {
    this.element.onmousedown = function (event) {
      if (start) {
        start(event)
      }
      document.onmousemove = function (event) {
        event.preventDefault()
      }
      document.onmouseup = function (event) {
        if (end) {
          end(event)
        }
        document.onmousemove = null
        document.onmouseup = null
      }
    }
    this.element.ontouchstart = function (event) {
      this.element.onmousedown = null
      if (start) {
        start(event)
      }
      document.ontouchmove = function (event) {
        event.preventDefault()
      }
      document.ontouchend = function (event) {
        if (end) {
          end(event)
        }
        document.ontouchmove = null
        document.ontouchend = null
      }
    }
  }
}

Fn.prototype.unwrap = function () {
  return this.element
}

function root (selector) {
  return new Fn(selector)
}

window.jQuery = root

})()
