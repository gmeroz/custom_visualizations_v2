!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.text_box=t():e.text_box=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function n(l){if(t[l])return t[l].exports;var o=t[l]={i:l,l:!1,exports:{}};return e[l].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,l){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:l})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=516)}({516:function(e,t,n){"use strict";looker.plugins.visualizations.add({id:"text box",label:"Description Box",options:{html_content:{type:"string",label:"Text (HTML)",order:1,default:"edit you text here"},font_size:{type:"string",label:"Font Size",values:[{Large:"large"},{Small:"small"}],display:"radio",default:"large"},alignment:{default:"left",display:"select",label:"Text-align",type:"string",values:[{Left:"left"},{Center:"center"},{Right:"right"}]}},create:function(e,t){e.innerHTML="\n      <style>\n        .text-box-vis {\n          /* Vertical centering */\n          height: 100%;\n          display: flex;\n          flex-direction: column;\n          justify-content: center;\n          text-align: center;\n        }\n        .text-box-text-large {\n          font-size: 72px;\n        }\n        .text-box-text-small {\n          font-size: 18px;\n        }\n      </style>\n    ";var n=e.appendChild(document.createElement("div"));n.className="text-box-vis",this._textElement=n.appendChild(document.createElement("div"))},updateAsync:function(e,t,n,l,o,r){this.clearErrors();var i=n.html_content;this._textElement.innerHTML=i,"small"==n.font_size?this._textElement.className="text-box-text-small":this._textElement.className="text-box-text-large",r()}})}})});