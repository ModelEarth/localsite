/* Localsite Filters */
// hashChanged() responds to hash changes
// Work WITHOUT map.js. Loads map.js if hash.show gets populated.

// EXPANDABLE MAP IN TOP SEARCH FILTERS:
// renderMapShapes

// For autocomplete - Vue could be removed - Source: https://cdn.jsdelivr.net/npm/vue
/*!
 * Vue.js v2.6.12
 * (c) 2014-2020 Evan You
 * Released under the MIT License.
 */

/*
 !function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).Vue=t()}(this,function(){"use strict";var e=Object.freeze({});function t(e){return null==e}function n(e){return null!=e}function r(e){return!0===e}function i(e){return"string"==typeof e||"number"==typeof e||"symbol"==typeof e||"boolean"==typeof e}function o(e){return null!==e&&"object"==typeof e}var a=Object.prototype.toString;function s(e){return"[object Object]"===a.call(e)}function c(e){var t=parseFloat(String(e));return t>=0&&Math.floor(t)===t&&isFinite(e)}function u(e){return n(e)&&"function"==typeof e.then&&"function"==typeof e.catch}function l(e){return null==e?"":Array.isArray(e)||s(e)&&e.toString===a?JSON.stringify(e,null,2):String(e)}function f(e){var t=parseFloat(e);return isNaN(t)?e:t}function p(e,t){for(var n=Object.create(null),r=e.split(","),i=0;i<r.length;i++)n[r[i]]=!0;return t?function(e){return n[e.toLowerCase()]}:function(e){return n[e]}}var d=p("slot,component",!0),v=p("key,ref,slot,slot-scope,is");function h(e,t){if(e.length){var n=e.indexOf(t);if(n>-1)return e.splice(n,1)}}var m=Object.prototype.hasOwnProperty;function y(e,t){return m.call(e,t)}function g(e){var t=Object.create(null);return function(n){return t[n]||(t[n]=e(n))}}var _=/-(\w)/g,b=g(function(e){return e.replace(_,function(e,t){return t?t.toUpperCase():""})}),$=g(function(e){return e.charAt(0).toUpperCase()+e.slice(1)}),w=/\B([A-Z])/g,C=g(function(e){return e.replace(w,"-$1").toLowerCase()});var x=Function.prototype.bind?function(e,t){return e.bind(t)}:function(e,t){function n(n){var r=arguments.length;return r?r>1?e.apply(t,arguments):e.call(t,n):e.call(t)}return n._length=e.length,n};function k(e,t){t=t||0;for(var n=e.length-t,r=new Array(n);n--;)r[n]=e[n+t];return r}function A(e,t){for(var n in t)e[n]=t[n];return e}function O(e){for(var t={},n=0;n<e.length;n++)e[n]&&A(t,e[n]);return t}function S(e,t,n){}var T=function(e,t,n){return!1},E=function(e){return e};function N(e,t){if(e===t)return!0;var n=o(e),r=o(t);if(!n||!r)return!n&&!r&&String(e)===String(t);try{var i=Array.isArray(e),a=Array.isArray(t);if(i&&a)return e.length===t.length&&e.every(function(e,n){return N(e,t[n])});if(e instanceof Date&&t instanceof Date)return e.getTime()===t.getTime();if(i||a)return!1;var s=Object.keys(e),c=Object.keys(t);return s.length===c.length&&s.every(function(n){return N(e[n],t[n])})}catch(e){return!1}}function j(e,t){for(var n=0;n<e.length;n++)if(N(e[n],t))return n;return-1}function D(e){var t=!1;return function(){t||(t=!0,e.apply(this,arguments))}}var L="data-server-rendered",M=["component","directive","filter"],I=["beforeCreate","created","beforeMount","mounted","beforeUpdate","updated","beforeDestroy","destroyed","activated","deactivated","errorCaptured","serverPrefetch"],F={optionMergeStrategies:Object.create(null),silent:!1,productionTip:!1,devtools:!1,performance:!1,errorHandler:null,warnHandler:null,ignoredElements:[],keyCodes:Object.create(null),isReservedTag:T,isReservedAttr:T,isUnknownElement:T,getTagNamespace:S,parsePlatformTagName:E,mustUseProp:T,async:!0,_lifecycleHooks:I},P=/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;function R(e,t,n,r){Object.defineProperty(e,t,{value:n,enumerable:!!r,writable:!0,configurable:!0})}var H=new RegExp("[^"+P.source+".$_\\d]");var B,U="__proto__"in{},z="undefined"!=typeof window,V="undefined"!=typeof WXEnvironment&&!!WXEnvironment.platform,K=V&&WXEnvironment.platform.toLowerCase(),J=z&&window.navigator.userAgent.toLowerCase(),q=J&&/msie|trident/.test(J),W=J&&J.indexOf("msie 9.0")>0,Z=J&&J.indexOf("edge/")>0,G=(J&&J.indexOf("android"),J&&/iphone|ipad|ipod|ios/.test(J)||"ios"===K),X=(J&&/chrome\/\d+/.test(J),J&&/phantomjs/.test(J),J&&J.match(/firefox\/(\d+)/)),Y={}.watch,Q=!1;if(z)try{var ee={};Object.defineProperty(ee,"passive",{get:function(){Q=!0}}),window.addEventListener("test-passive",null,ee)}catch(e){}var te=function(){return void 0===B&&(B=!z&&!V&&"undefined"!=typeof global&&(global.process&&"server"===global.process.env.VUE_ENV)),B},ne=z&&window.__VUE_DEVTOOLS_GLOBAL_HOOK__;function re(e){return"function"==typeof e&&/native code/.test(e.toString())}var ie,oe="undefined"!=typeof Symbol&&re(Symbol)&&"undefined"!=typeof Reflect&&re(Reflect.ownKeys);ie="undefined"!=typeof Set&&re(Set)?Set:function(){function e(){this.set=Object.create(null)}return e.prototype.has=function(e){return!0===this.set[e]},e.prototype.add=function(e){this.set[e]=!0},e.prototype.clear=function(){this.set=Object.create(null)},e}();var ae=S,se=0,ce=function(){this.id=se++,this.subs=[]};ce.prototype.addSub=function(e){this.subs.push(e)},ce.prototype.removeSub=function(e){h(this.subs,e)},ce.prototype.depend=function(){ce.target&&ce.target.addDep(this)},ce.prototype.notify=function(){for(var e=this.subs.slice(),t=0,n=e.length;t<n;t++)e[t].update()},ce.target=null;var ue=[];function le(e){ue.push(e),ce.target=e}function fe(){ue.pop(),ce.target=ue[ue.length-1]}var pe=function(e,t,n,r,i,o,a,s){this.tag=e,this.data=t,this.children=n,this.text=r,this.elm=i,this.ns=void 0,this.context=o,this.fnContext=void 0,this.fnOptions=void 0,this.fnScopeId=void 0,this.key=t&&t.key,this.componentOptions=a,this.componentInstance=void 0,this.parent=void 0,this.raw=!1,this.isStatic=!1,this.isRootInsert=!0,this.isComment=!1,this.isCloned=!1,this.isOnce=!1,this.asyncFactory=s,this.asyncMeta=void 0,this.isAsyncPlaceholder=!1},de={child:{configurable:!0}};de.child.get=function(){return this.componentInstance},Object.defineProperties(pe.prototype,de);var ve=function(e){void 0===e&&(e="");var t=new pe;return t.text=e,t.isComment=!0,t};function he(e){return new pe(void 0,void 0,void 0,String(e))}function me(e){var t=new pe(e.tag,e.data,e.children&&e.children.slice(),e.text,e.elm,e.context,e.componentOptions,e.asyncFactory);return t.ns=e.ns,t.isStatic=e.isStatic,t.key=e.key,t.isComment=e.isComment,t.fnContext=e.fnContext,t.fnOptions=e.fnOptions,t.fnScopeId=e.fnScopeId,t.asyncMeta=e.asyncMeta,t.isCloned=!0,t}var ye=Array.prototype,ge=Object.create(ye);["push","pop","shift","unshift","splice","sort","reverse"].forEach(function(e){var t=ye[e];R(ge,e,function(){for(var n=[],r=arguments.length;r--;)n[r]=arguments[r];var i,o=t.apply(this,n),a=this.__ob__;switch(e){case"push":case"unshift":i=n;break;case"splice":i=n.slice(2)}return i&&a.observeArray(i),a.dep.notify(),o})});var _e=Object.getOwnPropertyNames(ge),be=!0;function $e(e){be=e}var we=function(e){var t;this.value=e,this.dep=new ce,this.vmCount=0,R(e,"__ob__",this),Array.isArray(e)?(U?(t=ge,e.__proto__=t):function(e,t,n){for(var r=0,i=n.length;r<i;r++){var o=n[r];R(e,o,t[o])}}(e,ge,_e),this.observeArray(e)):this.walk(e)};function Ce(e,t){var n;if(o(e)&&!(e instanceof pe))return y(e,"__ob__")&&e.__ob__ instanceof we?n=e.__ob__:be&&!te()&&(Array.isArray(e)||s(e))&&Object.isExtensible(e)&&!e._isVue&&(n=new we(e)),t&&n&&n.vmCount++,n}function xe(e,t,n,r,i){var o=new ce,a=Object.getOwnPropertyDescriptor(e,t);if(!a||!1!==a.configurable){var s=a&&a.get,c=a&&a.set;s&&!c||2!==arguments.length||(n=e[t]);var u=!i&&Ce(n);Object.defineProperty(e,t,{enumerable:!0,configurable:!0,get:function(){var t=s?s.call(e):n;return ce.target&&(o.depend(),u&&(u.dep.depend(),Array.isArray(t)&&function e(t){for(var n=void 0,r=0,i=t.length;r<i;r++)(n=t[r])&&n.__ob__&&n.__ob__.dep.depend(),Array.isArray(n)&&e(n)}(t))),t},set:function(t){var r=s?s.call(e):n;t===r||t!=t&&r!=r||s&&!c||(c?c.call(e,t):n=t,u=!i&&Ce(t),o.notify())}})}}function ke(e,t,n){if(Array.isArray(e)&&c(t))return e.length=Math.max(e.length,t),e.splice(t,1,n),n;if(t in e&&!(t in Object.prototype))return e[t]=n,n;var r=e.__ob__;return e._isVue||r&&r.vmCount?n:r?(xe(r.value,t,n),r.dep.notify(),n):(e[t]=n,n)}function Ae(e,t){if(Array.isArray(e)&&c(t))e.splice(t,1);else{var n=e.__ob__;e._isVue||n&&n.vmCount||y(e,t)&&(delete e[t],n&&n.dep.notify())}}we.prototype.walk=function(e){for(var t=Object.keys(e),n=0;n<t.length;n++)xe(e,t[n])},we.prototype.observeArray=function(e){for(var t=0,n=e.length;t<n;t++)Ce(e[t])};var Oe=F.optionMergeStrategies;function Se(e,t){if(!t)return e;for(var n,r,i,o=oe?Reflect.ownKeys(t):Object.keys(t),a=0;a<o.length;a++)"__ob__"!==(n=o[a])&&(r=e[n],i=t[n],y(e,n)?r!==i&&s(r)&&s(i)&&Se(r,i):ke(e,n,i));return e}function Te(e,t,n){return n?function(){var r="function"==typeof t?t.call(n,n):t,i="function"==typeof e?e.call(n,n):e;return r?Se(r,i):i}:t?e?function(){return Se("function"==typeof t?t.call(this,this):t,"function"==typeof e?e.call(this,this):e)}:t:e}function Ee(e,t){var n=t?e?e.concat(t):Array.isArray(t)?t:[t]:e;return n?function(e){for(var t=[],n=0;n<e.length;n++)-1===t.indexOf(e[n])&&t.push(e[n]);return t}(n):n}function Ne(e,t,n,r){var i=Object.create(e||null);return t?A(i,t):i}Oe.data=function(e,t,n){return n?Te(e,t,n):t&&"function"!=typeof t?e:Te(e,t)},I.forEach(function(e){Oe[e]=Ee}),M.forEach(function(e){Oe[e+"s"]=Ne}),Oe.watch=function(e,t,n,r){if(e===Y&&(e=void 0),t===Y&&(t=void 0),!t)return Object.create(e||null);if(!e)return t;var i={};for(var o in A(i,e),t){var a=i[o],s=t[o];a&&!Array.isArray(a)&&(a=[a]),i[o]=a?a.concat(s):Array.isArray(s)?s:[s]}return i},Oe.props=Oe.methods=Oe.inject=Oe.computed=function(e,t,n,r){if(!e)return t;var i=Object.create(null);return A(i,e),t&&A(i,t),i},Oe.provide=Te;var je=function(e,t){return void 0===t?e:t};function De(e,t,n){if("function"==typeof t&&(t=t.options),function(e,t){var n=e.props;if(n){var r,i,o={};if(Array.isArray(n))for(r=n.length;r--;)"string"==typeof(i=n[r])&&(o[b(i)]={type:null});else if(s(n))for(var a in n)i=n[a],o[b(a)]=s(i)?i:{type:i};e.props=o}}(t),function(e,t){var n=e.inject;if(n){var r=e.inject={};if(Array.isArray(n))for(var i=0;i<n.length;i++)r[n[i]]={from:n[i]};else if(s(n))for(var o in n){var a=n[o];r[o]=s(a)?A({from:o},a):{from:a}}}}(t),function(e){var t=e.directives;if(t)for(var n in t){var r=t[n];"function"==typeof r&&(t[n]={bind:r,update:r})}}(t),!t._base&&(t.extends&&(e=De(e,t.extends,n)),t.mixins))for(var r=0,i=t.mixins.length;r<i;r++)e=De(e,t.mixins[r],n);var o,a={};for(o in e)c(o);for(o in t)y(e,o)||c(o);function c(r){var i=Oe[r]||je;a[r]=i(e[r],t[r],n,r)}return a}function Le(e,t,n,r){if("string"==typeof n){var i=e[t];if(y(i,n))return i[n];var o=b(n);if(y(i,o))return i[o];var a=$(o);return y(i,a)?i[a]:i[n]||i[o]||i[a]}}function Me(e,t,n,r){var i=t[e],o=!y(n,e),a=n[e],s=Pe(Boolean,i.type);if(s>-1)if(o&&!y(i,"default"))a=!1;else if(""===a||a===C(e)){var c=Pe(String,i.type);(c<0||s<c)&&(a=!0)}if(void 0===a){a=function(e,t,n){if(!y(t,"default"))return;var r=t.default;if(e&&e.$options.propsData&&void 0===e.$options.propsData[n]&&void 0!==e._props[n])return e._props[n];return"function"==typeof r&&"Function"!==Ie(t.type)?r.call(e):r}(r,i,e);var u=be;$e(!0),Ce(a),$e(u)}return a}function Ie(e){var t=e&&e.toString().match(/^\s*function (\w+)/);return t?t[1]:""}function Fe(e,t){return Ie(e)===Ie(t)}function Pe(e,t){if(!Array.isArray(t))return Fe(t,e)?0:-1;for(var n=0,r=t.length;n<r;n++)if(Fe(t[n],e))return n;return-1}function Re(e,t,n){le();try{if(t)for(var r=t;r=r.$parent;){var i=r.$options.errorCaptured;if(i)for(var o=0;o<i.length;o++)try{if(!1===i[o].call(r,e,t,n))return}catch(e){Be(e,r,"errorCaptured hook")}}Be(e,t,n)}finally{fe()}}function He(e,t,n,r,i){var o;try{(o=n?e.apply(t,n):e.call(t))&&!o._isVue&&u(o)&&!o._handled&&(o.catch(function(e){return Re(e,r,i+" (Promise/async)")}),o._handled=!0)}catch(e){Re(e,r,i)}return o}function Be(e,t,n){if(F.errorHandler)try{return F.errorHandler.call(null,e,t,n)}catch(t){t!==e&&Ue(t,null,"config.errorHandler")}Ue(e,t,n)}function Ue(e,t,n){if(!z&&!V||"undefined"==typeof console)throw e;console.error(e)}var ze,Ve=!1,Ke=[],Je=!1;function qe(){Je=!1;var e=Ke.slice(0);Ke.length=0;for(var t=0;t<e.length;t++)e[t]()}if("undefined"!=typeof Promise&&re(Promise)){var We=Promise.resolve();ze=function(){We.then(qe),G&&setTimeout(S)},Ve=!0}else if(q||"undefined"==typeof MutationObserver||!re(MutationObserver)&&"[object MutationObserverConstructor]"!==MutationObserver.toString())ze="undefined"!=typeof setImmediate&&re(setImmediate)?function(){setImmediate(qe)}:function(){setTimeout(qe,0)};else{var Ze=1,Ge=new MutationObserver(qe),Xe=document.createTextNode(String(Ze));Ge.observe(Xe,{characterData:!0}),ze=function(){Ze=(Ze+1)%2,Xe.data=String(Ze)},Ve=!0}function Ye(e,t){var n;if(Ke.push(function(){if(e)try{e.call(t)}catch(e){Re(e,t,"nextTick")}else n&&n(t)}),Je||(Je=!0,ze()),!e&&"undefined"!=typeof Promise)return new Promise(function(e){n=e})}var Qe=new ie;function et(e){!function e(t,n){var r,i;var a=Array.isArray(t);if(!a&&!o(t)||Object.isFrozen(t)||t instanceof pe)return;if(t.__ob__){var s=t.__ob__.dep.id;if(n.has(s))return;n.add(s)}if(a)for(r=t.length;r--;)e(t[r],n);else for(i=Object.keys(t),r=i.length;r--;)e(t[i[r]],n)}(e,Qe),Qe.clear()}var tt=g(function(e){var t="&"===e.charAt(0),n="~"===(e=t?e.slice(1):e).charAt(0),r="!"===(e=n?e.slice(1):e).charAt(0);return{name:e=r?e.slice(1):e,once:n,capture:r,passive:t}});function nt(e,t){function n(){var e=arguments,r=n.fns;if(!Array.isArray(r))return He(r,null,arguments,t,"v-on handler");for(var i=r.slice(),o=0;o<i.length;o++)He(i[o],null,e,t,"v-on handler")}return n.fns=e,n}function rt(e,n,i,o,a,s){var c,u,l,f;for(c in e)u=e[c],l=n[c],f=tt(c),t(u)||(t(l)?(t(u.fns)&&(u=e[c]=nt(u,s)),r(f.once)&&(u=e[c]=a(f.name,u,f.capture)),i(f.name,u,f.capture,f.passive,f.params)):u!==l&&(l.fns=u,e[c]=l));for(c in n)t(e[c])&&o((f=tt(c)).name,n[c],f.capture)}function it(e,i,o){var a;e instanceof pe&&(e=e.data.hook||(e.data.hook={}));var s=e[i];function c(){o.apply(this,arguments),h(a.fns,c)}t(s)?a=nt([c]):n(s.fns)&&r(s.merged)?(a=s).fns.push(c):a=nt([s,c]),a.merged=!0,e[i]=a}function ot(e,t,r,i,o){if(n(t)){if(y(t,r))return e[r]=t[r],o||delete t[r],!0;if(y(t,i))return e[r]=t[i],o||delete t[i],!0}return!1}function at(e){return i(e)?[he(e)]:Array.isArray(e)?function e(o,a){var s=[];var c,u,l,f;for(c=0;c<o.length;c++)t(u=o[c])||"boolean"==typeof u||(l=s.length-1,f=s[l],Array.isArray(u)?u.length>0&&(st((u=e(u,(a||"")+"_"+c))[0])&&st(f)&&(s[l]=he(f.text+u[0].text),u.shift()),s.push.apply(s,u)):i(u)?st(f)?s[l]=he(f.text+u):""!==u&&s.push(he(u)):st(u)&&st(f)?s[l]=he(f.text+u.text):(r(o._isVList)&&n(u.tag)&&t(u.key)&&n(a)&&(u.key="__vlist"+a+"_"+c+"__"),s.push(u)));return s}(e):void 0}function st(e){return n(e)&&n(e.text)&&!1===e.isComment}function ct(e,t){if(e){for(var n=Object.create(null),r=oe?Reflect.ownKeys(e):Object.keys(e),i=0;i<r.length;i++){var o=r[i];if("__ob__"!==o){for(var a=e[o].from,s=t;s;){if(s._provided&&y(s._provided,a)){n[o]=s._provided[a];break}s=s.$parent}if(!s&&"default"in e[o]){var c=e[o].default;n[o]="function"==typeof c?c.call(t):c}}}return n}}function ut(e,t){if(!e||!e.length)return{};for(var n={},r=0,i=e.length;r<i;r++){var o=e[r],a=o.data;if(a&&a.attrs&&a.attrs.slot&&delete a.attrs.slot,o.context!==t&&o.fnContext!==t||!a||null==a.slot)(n.default||(n.default=[])).push(o);else{var s=a.slot,c=n[s]||(n[s]=[]);"template"===o.tag?c.push.apply(c,o.children||[]):c.push(o)}}for(var u in n)n[u].every(lt)&&delete n[u];return n}function lt(e){return e.isComment&&!e.asyncFactory||" "===e.text}function ft(t,n,r){var i,o=Object.keys(n).length>0,a=t?!!t.$stable:!o,s=t&&t.$key;if(t){if(t._normalized)return t._normalized;if(a&&r&&r!==e&&s===r.$key&&!o&&!r.$hasNormal)return r;for(var c in i={},t)t[c]&&"$"!==c[0]&&(i[c]=pt(n,c,t[c]))}else i={};for(var u in n)u in i||(i[u]=dt(n,u));return t&&Object.isExtensible(t)&&(t._normalized=i),R(i,"$stable",a),R(i,"$key",s),R(i,"$hasNormal",o),i}function pt(e,t,n){var r=function(){var e=arguments.length?n.apply(null,arguments):n({});return(e=e&&"object"==typeof e&&!Array.isArray(e)?[e]:at(e))&&(0===e.length||1===e.length&&e[0].isComment)?void 0:e};return n.proxy&&Object.defineProperty(e,t,{get:r,enumerable:!0,configurable:!0}),r}function dt(e,t){return function(){return e[t]}}function vt(e,t){var r,i,a,s,c;if(Array.isArray(e)||"string"==typeof e)for(r=new Array(e.length),i=0,a=e.length;i<a;i++)r[i]=t(e[i],i);else if("number"==typeof e)for(r=new Array(e),i=0;i<e;i++)r[i]=t(i+1,i);else if(o(e))if(oe&&e[Symbol.iterator]){r=[];for(var u=e[Symbol.iterator](),l=u.next();!l.done;)r.push(t(l.value,r.length)),l=u.next()}else for(s=Object.keys(e),r=new Array(s.length),i=0,a=s.length;i<a;i++)c=s[i],r[i]=t(e[c],c,i);return n(r)||(r=[]),r._isVList=!0,r}function ht(e,t,n,r){var i,o=this.$scopedSlots[e];o?(n=n||{},r&&(n=A(A({},r),n)),i=o(n)||t):i=this.$slots[e]||t;var a=n&&n.slot;return a?this.$createElement("template",{slot:a},i):i}function mt(e){return Le(this.$options,"filters",e)||E}function yt(e,t){return Array.isArray(e)?-1===e.indexOf(t):e!==t}function gt(e,t,n,r,i){var o=F.keyCodes[t]||n;return i&&r&&!F.keyCodes[t]?yt(i,r):o?yt(o,e):r?C(r)!==t:void 0}function _t(e,t,n,r,i){if(n)if(o(n)){var a;Array.isArray(n)&&(n=O(n));var s=function(o){if("class"===o||"style"===o||v(o))a=e;else{var s=e.attrs&&e.attrs.type;a=r||F.mustUseProp(t,s,o)?e.domProps||(e.domProps={}):e.attrs||(e.attrs={})}var c=b(o),u=C(o);c in a||u in a||(a[o]=n[o],i&&((e.on||(e.on={}))["update:"+o]=function(e){n[o]=e}))};for(var c in n)s(c)}else;return e}function bt(e,t){var n=this._staticTrees||(this._staticTrees=[]),r=n[e];return r&&!t?r:(wt(r=n[e]=this.$options.staticRenderFns[e].call(this._renderProxy,null,this),"__static__"+e,!1),r)}function $t(e,t,n){return wt(e,"__once__"+t+(n?"_"+n:""),!0),e}function wt(e,t,n){if(Array.isArray(e))for(var r=0;r<e.length;r++)e[r]&&"string"!=typeof e[r]&&Ct(e[r],t+"_"+r,n);else Ct(e,t,n)}function Ct(e,t,n){e.isStatic=!0,e.key=t,e.isOnce=n}function xt(e,t){if(t)if(s(t)){var n=e.on=e.on?A({},e.on):{};for(var r in t){var i=n[r],o=t[r];n[r]=i?[].concat(i,o):o}}else;return e}function kt(e,t,n,r){t=t||{$stable:!n};for(var i=0;i<e.length;i++){var o=e[i];Array.isArray(o)?kt(o,t,n):o&&(o.proxy&&(o.fn.proxy=!0),t[o.key]=o.fn)}return r&&(t.$key=r),t}function At(e,t){for(var n=0;n<t.length;n+=2){var r=t[n];"string"==typeof r&&r&&(e[t[n]]=t[n+1])}return e}function Ot(e,t){return"string"==typeof e?t+e:e}function St(e){e._o=$t,e._n=f,e._s=l,e._l=vt,e._t=ht,e._q=N,e._i=j,e._m=bt,e._f=mt,e._k=gt,e._b=_t,e._v=he,e._e=ve,e._u=kt,e._g=xt,e._d=At,e._p=Ot}function Tt(t,n,i,o,a){var s,c=this,u=a.options;y(o,"_uid")?(s=Object.create(o))._original=o:(s=o,o=o._original);var l=r(u._compiled),f=!l;this.data=t,this.props=n,this.children=i,this.parent=o,this.listeners=t.on||e,this.injections=ct(u.inject,o),this.slots=function(){return c.$slots||ft(t.scopedSlots,c.$slots=ut(i,o)),c.$slots},Object.defineProperty(this,"scopedSlots",{enumerable:!0,get:function(){return ft(t.scopedSlots,this.slots())}}),l&&(this.$options=u,this.$slots=this.slots(),this.$scopedSlots=ft(t.scopedSlots,this.$slots)),u._scopeId?this._c=function(e,t,n,r){var i=Pt(s,e,t,n,r,f);return i&&!Array.isArray(i)&&(i.fnScopeId=u._scopeId,i.fnContext=o),i}:this._c=function(e,t,n,r){return Pt(s,e,t,n,r,f)}}function Et(e,t,n,r,i){var o=me(e);return o.fnContext=n,o.fnOptions=r,t.slot&&((o.data||(o.data={})).slot=t.slot),o}function Nt(e,t){for(var n in t)e[b(n)]=t[n]}St(Tt.prototype);var jt={init:function(e,t){if(e.componentInstance&&!e.componentInstance._isDestroyed&&e.data.keepAlive){var r=e;jt.prepatch(r,r)}else{(e.componentInstance=function(e,t){var r={_isComponent:!0,_parentVnode:e,parent:t},i=e.data.inlineTemplate;n(i)&&(r.render=i.render,r.staticRenderFns=i.staticRenderFns);return new e.componentOptions.Ctor(r)}(e,Wt)).$mount(t?e.elm:void 0,t)}},prepatch:function(t,n){var r=n.componentOptions;!function(t,n,r,i,o){var a=i.data.scopedSlots,s=t.$scopedSlots,c=!!(a&&!a.$stable||s!==e&&!s.$stable||a&&t.$scopedSlots.$key!==a.$key),u=!!(o||t.$options._renderChildren||c);t.$options._parentVnode=i,t.$vnode=i,t._vnode&&(t._vnode.parent=i);if(t.$options._renderChildren=o,t.$attrs=i.data.attrs||e,t.$listeners=r||e,n&&t.$options.props){$e(!1);for(var l=t._props,f=t.$options._propKeys||[],p=0;p<f.length;p++){var d=f[p],v=t.$options.props;l[d]=Me(d,v,n,t)}$e(!0),t.$options.propsData=n}r=r||e;var h=t.$options._parentListeners;t.$options._parentListeners=r,qt(t,r,h),u&&(t.$slots=ut(o,i.context),t.$forceUpdate())}(n.componentInstance=t.componentInstance,r.propsData,r.listeners,n,r.children)},insert:function(e){var t,n=e.context,r=e.componentInstance;r._isMounted||(r._isMounted=!0,Yt(r,"mounted")),e.data.keepAlive&&(n._isMounted?((t=r)._inactive=!1,en.push(t)):Xt(r,!0))},destroy:function(e){var t=e.componentInstance;t._isDestroyed||(e.data.keepAlive?function e(t,n){if(n&&(t._directInactive=!0,Gt(t)))return;if(!t._inactive){t._inactive=!0;for(var r=0;r<t.$children.length;r++)e(t.$children[r]);Yt(t,"deactivated")}}(t,!0):t.$destroy())}},Dt=Object.keys(jt);function Lt(i,a,s,c,l){if(!t(i)){var f=s.$options._base;if(o(i)&&(i=f.extend(i)),"function"==typeof i){var p;if(t(i.cid)&&void 0===(i=function(e,i){if(r(e.error)&&n(e.errorComp))return e.errorComp;if(n(e.resolved))return e.resolved;var a=Ht;a&&n(e.owners)&&-1===e.owners.indexOf(a)&&e.owners.push(a);if(r(e.loading)&&n(e.loadingComp))return e.loadingComp;if(a&&!n(e.owners)){var s=e.owners=[a],c=!0,l=null,f=null;a.$on("hook:destroyed",function(){return h(s,a)});var p=function(e){for(var t=0,n=s.length;t<n;t++)s[t].$forceUpdate();e&&(s.length=0,null!==l&&(clearTimeout(l),l=null),null!==f&&(clearTimeout(f),f=null))},d=D(function(t){e.resolved=Bt(t,i),c?s.length=0:p(!0)}),v=D(function(t){n(e.errorComp)&&(e.error=!0,p(!0))}),m=e(d,v);return o(m)&&(u(m)?t(e.resolved)&&m.then(d,v):u(m.component)&&(m.component.then(d,v),n(m.error)&&(e.errorComp=Bt(m.error,i)),n(m.loading)&&(e.loadingComp=Bt(m.loading,i),0===m.delay?e.loading=!0:l=setTimeout(function(){l=null,t(e.resolved)&&t(e.error)&&(e.loading=!0,p(!1))},m.delay||200)),n(m.timeout)&&(f=setTimeout(function(){f=null,t(e.resolved)&&v(null)},m.timeout)))),c=!1,e.loading?e.loadingComp:e.resolved}}(p=i,f)))return function(e,t,n,r,i){var o=ve();return o.asyncFactory=e,o.asyncMeta={data:t,context:n,children:r,tag:i},o}(p,a,s,c,l);a=a||{},$n(i),n(a.model)&&function(e,t){var r=e.model&&e.model.prop||"value",i=e.model&&e.model.event||"input";(t.attrs||(t.attrs={}))[r]=t.model.value;var o=t.on||(t.on={}),a=o[i],s=t.model.callback;n(a)?(Array.isArray(a)?-1===a.indexOf(s):a!==s)&&(o[i]=[s].concat(a)):o[i]=s}(i.options,a);var d=function(e,r,i){var o=r.options.props;if(!t(o)){var a={},s=e.attrs,c=e.props;if(n(s)||n(c))for(var u in o){var l=C(u);ot(a,c,u,l,!0)||ot(a,s,u,l,!1)}return a}}(a,i);if(r(i.options.functional))return function(t,r,i,o,a){var s=t.options,c={},u=s.props;if(n(u))for(var l in u)c[l]=Me(l,u,r||e);else n(i.attrs)&&Nt(c,i.attrs),n(i.props)&&Nt(c,i.props);var f=new Tt(i,c,a,o,t),p=s.render.call(null,f._c,f);if(p instanceof pe)return Et(p,i,f.parent,s);if(Array.isArray(p)){for(var d=at(p)||[],v=new Array(d.length),h=0;h<d.length;h++)v[h]=Et(d[h],i,f.parent,s);return v}}(i,d,a,s,c);var v=a.on;if(a.on=a.nativeOn,r(i.options.abstract)){var m=a.slot;a={},m&&(a.slot=m)}!function(e){for(var t=e.hook||(e.hook={}),n=0;n<Dt.length;n++){var r=Dt[n],i=t[r],o=jt[r];i===o||i&&i._merged||(t[r]=i?Mt(o,i):o)}}(a);var y=i.options.name||l;return new pe("vue-component-"+i.cid+(y?"-"+y:""),a,void 0,void 0,void 0,s,{Ctor:i,propsData:d,listeners:v,tag:l,children:c},p)}}}function Mt(e,t){var n=function(n,r){e(n,r),t(n,r)};return n._merged=!0,n}var It=1,Ft=2;function Pt(e,a,s,c,u,l){return(Array.isArray(s)||i(s))&&(u=c,c=s,s=void 0),r(l)&&(u=Ft),function(e,i,a,s,c){if(n(a)&&n(a.__ob__))return ve();n(a)&&n(a.is)&&(i=a.is);if(!i)return ve();Array.isArray(s)&&"function"==typeof s[0]&&((a=a||{}).scopedSlots={default:s[0]},s.length=0);c===Ft?s=at(s):c===It&&(s=function(e){for(var t=0;t<e.length;t++)if(Array.isArray(e[t]))return Array.prototype.concat.apply([],e);return e}(s));var u,l;if("string"==typeof i){var f;l=e.$vnode&&e.$vnode.ns||F.getTagNamespace(i),u=F.isReservedTag(i)?new pe(F.parsePlatformTagName(i),a,s,void 0,void 0,e):a&&a.pre||!n(f=Le(e.$options,"components",i))?new pe(i,a,s,void 0,void 0,e):Lt(f,a,e,s,i)}else u=Lt(i,a,e,s);return Array.isArray(u)?u:n(u)?(n(l)&&function e(i,o,a){i.ns=o;"foreignObject"===i.tag&&(o=void 0,a=!0);if(n(i.children))for(var s=0,c=i.children.length;s<c;s++){var u=i.children[s];n(u.tag)&&(t(u.ns)||r(a)&&"svg"!==u.tag)&&e(u,o,a)}}(u,l),n(a)&&function(e){o(e.style)&&et(e.style);o(e.class)&&et(e.class)}(a),u):ve()}(e,a,s,c,u)}var Rt,Ht=null;function Bt(e,t){return(e.__esModule||oe&&"Module"===e[Symbol.toStringTag])&&(e=e.default),o(e)?t.extend(e):e}function Ut(e){return e.isComment&&e.asyncFactory}function zt(e){if(Array.isArray(e))for(var t=0;t<e.length;t++){var r=e[t];if(n(r)&&(n(r.componentOptions)||Ut(r)))return r}}function Vt(e,t){Rt.$on(e,t)}function Kt(e,t){Rt.$off(e,t)}function Jt(e,t){var n=Rt;return function r(){null!==t.apply(null,arguments)&&n.$off(e,r)}}function qt(e,t,n){Rt=e,rt(t,n||{},Vt,Kt,Jt,e),Rt=void 0}var Wt=null;function Zt(e){var t=Wt;return Wt=e,function(){Wt=t}}function Gt(e){for(;e&&(e=e.$parent);)if(e._inactive)return!0;return!1}function Xt(e,t){if(t){if(e._directInactive=!1,Gt(e))return}else if(e._directInactive)return;if(e._inactive||null===e._inactive){e._inactive=!1;for(var n=0;n<e.$children.length;n++)Xt(e.$children[n]);Yt(e,"activated")}}function Yt(e,t){le();var n=e.$options[t],r=t+" hook";if(n)for(var i=0,o=n.length;i<o;i++)He(n[i],e,null,e,r);e._hasHookEvent&&e.$emit("hook:"+t),fe()}var Qt=[],en=[],tn={},nn=!1,rn=!1,on=0;var an=0,sn=Date.now;if(z&&!q){var cn=window.performance;cn&&"function"==typeof cn.now&&sn()>document.createEvent("Event").timeStamp&&(sn=function(){return cn.now()})}function un(){var e,t;for(an=sn(),rn=!0,Qt.sort(function(e,t){return e.id-t.id}),on=0;on<Qt.length;on++)(e=Qt[on]).before&&e.before(),t=e.id,tn[t]=null,e.run();var n=en.slice(),r=Qt.slice();on=Qt.length=en.length=0,tn={},nn=rn=!1,function(e){for(var t=0;t<e.length;t++)e[t]._inactive=!0,Xt(e[t],!0)}(n),function(e){var t=e.length;for(;t--;){var n=e[t],r=n.vm;r._watcher===n&&r._isMounted&&!r._isDestroyed&&Yt(r,"updated")}}(r),ne&&F.devtools&&ne.emit("flush")}var ln=0,fn=function(e,t,n,r,i){this.vm=e,i&&(e._watcher=this),e._watchers.push(this),r?(this.deep=!!r.deep,this.user=!!r.user,this.lazy=!!r.lazy,this.sync=!!r.sync,this.before=r.before):this.deep=this.user=this.lazy=this.sync=!1,this.cb=n,this.id=++ln,this.active=!0,this.dirty=this.lazy,this.deps=[],this.newDeps=[],this.depIds=new ie,this.newDepIds=new ie,this.expression="","function"==typeof t?this.getter=t:(this.getter=function(e){if(!H.test(e)){var t=e.split(".");return function(e){for(var n=0;n<t.length;n++){if(!e)return;e=e[t[n]]}return e}}}(t),this.getter||(this.getter=S)),this.value=this.lazy?void 0:this.get()};fn.prototype.get=function(){var e;le(this);var t=this.vm;try{e=this.getter.call(t,t)}catch(e){if(!this.user)throw e;Re(e,t,'getter for watcher "'+this.expression+'"')}finally{this.deep&&et(e),fe(),this.cleanupDeps()}return e},fn.prototype.addDep=function(e){var t=e.id;this.newDepIds.has(t)||(this.newDepIds.add(t),this.newDeps.push(e),this.depIds.has(t)||e.addSub(this))},fn.prototype.cleanupDeps=function(){for(var e=this.deps.length;e--;){var t=this.deps[e];this.newDepIds.has(t.id)||t.removeSub(this)}var n=this.depIds;this.depIds=this.newDepIds,this.newDepIds=n,this.newDepIds.clear(),n=this.deps,this.deps=this.newDeps,this.newDeps=n,this.newDeps.length=0},fn.prototype.update=function(){this.lazy?this.dirty=!0:this.sync?this.run():function(e){var t=e.id;if(null==tn[t]){if(tn[t]=!0,rn){for(var n=Qt.length-1;n>on&&Qt[n].id>e.id;)n--;Qt.splice(n+1,0,e)}else Qt.push(e);nn||(nn=!0,Ye(un))}}(this)},fn.prototype.run=function(){if(this.active){var e=this.get();if(e!==this.value||o(e)||this.deep){var t=this.value;if(this.value=e,this.user)try{this.cb.call(this.vm,e,t)}catch(e){Re(e,this.vm,'callback for watcher "'+this.expression+'"')}else this.cb.call(this.vm,e,t)}}},fn.prototype.evaluate=function(){this.value=this.get(),this.dirty=!1},fn.prototype.depend=function(){for(var e=this.deps.length;e--;)this.deps[e].depend()},fn.prototype.teardown=function(){if(this.active){this.vm._isBeingDestroyed||h(this.vm._watchers,this);for(var e=this.deps.length;e--;)this.deps[e].removeSub(this);this.active=!1}};var pn={enumerable:!0,configurable:!0,get:S,set:S};function dn(e,t,n){pn.get=function(){return this[t][n]},pn.set=function(e){this[t][n]=e},Object.defineProperty(e,n,pn)}function vn(e){e._watchers=[];var t=e.$options;t.props&&function(e,t){var n=e.$options.propsData||{},r=e._props={},i=e.$options._propKeys=[];e.$parent&&$e(!1);var o=function(o){i.push(o);var a=Me(o,t,n,e);xe(r,o,a),o in e||dn(e,"_props",o)};for(var a in t)o(a);$e(!0)}(e,t.props),t.methods&&function(e,t){e.$options.props;for(var n in t)e[n]="function"!=typeof t[n]?S:x(t[n],e)}(e,t.methods),t.data?function(e){var t=e.$options.data;s(t=e._data="function"==typeof t?function(e,t){le();try{return e.call(t,t)}catch(e){return Re(e,t,"data()"),{}}finally{fe()}}(t,e):t||{})||(t={});var n=Object.keys(t),r=e.$options.props,i=(e.$options.methods,n.length);for(;i--;){var o=n[i];r&&y(r,o)||(a=void 0,36!==(a=(o+"").charCodeAt(0))&&95!==a&&dn(e,"_data",o))}var a;Ce(t,!0)}(e):Ce(e._data={},!0),t.computed&&function(e,t){var n=e._computedWatchers=Object.create(null),r=te();for(var i in t){var o=t[i],a="function"==typeof o?o:o.get;r||(n[i]=new fn(e,a||S,S,hn)),i in e||mn(e,i,o)}}(e,t.computed),t.watch&&t.watch!==Y&&function(e,t){for(var n in t){var r=t[n];if(Array.isArray(r))for(var i=0;i<r.length;i++)_n(e,n,r[i]);else _n(e,n,r)}}(e,t.watch)}var hn={lazy:!0};function mn(e,t,n){var r=!te();"function"==typeof n?(pn.get=r?yn(t):gn(n),pn.set=S):(pn.get=n.get?r&&!1!==n.cache?yn(t):gn(n.get):S,pn.set=n.set||S),Object.defineProperty(e,t,pn)}function yn(e){return function(){var t=this._computedWatchers&&this._computedWatchers[e];if(t)return t.dirty&&t.evaluate(),ce.target&&t.depend(),t.value}}function gn(e){return function(){return e.call(this,this)}}function _n(e,t,n,r){return s(n)&&(r=n,n=n.handler),"string"==typeof n&&(n=e[n]),e.$watch(t,n,r)}var bn=0;function $n(e){var t=e.options;if(e.super){var n=$n(e.super);if(n!==e.superOptions){e.superOptions=n;var r=function(e){var t,n=e.options,r=e.sealedOptions;for(var i in n)n[i]!==r[i]&&(t||(t={}),t[i]=n[i]);return t}(e);r&&A(e.extendOptions,r),(t=e.options=De(n,e.extendOptions)).name&&(t.components[t.name]=e)}}return t}function wn(e){this._init(e)}function Cn(e){e.cid=0;var t=1;e.extend=function(e){e=e||{};var n=this,r=n.cid,i=e._Ctor||(e._Ctor={});if(i[r])return i[r];var o=e.name||n.options.name,a=function(e){this._init(e)};return(a.prototype=Object.create(n.prototype)).constructor=a,a.cid=t++,a.options=De(n.options,e),a.super=n,a.options.props&&function(e){var t=e.options.props;for(var n in t)dn(e.prototype,"_props",n)}(a),a.options.computed&&function(e){var t=e.options.computed;for(var n in t)mn(e.prototype,n,t[n])}(a),a.extend=n.extend,a.mixin=n.mixin,a.use=n.use,M.forEach(function(e){a[e]=n[e]}),o&&(a.options.components[o]=a),a.superOptions=n.options,a.extendOptions=e,a.sealedOptions=A({},a.options),i[r]=a,a}}function xn(e){return e&&(e.Ctor.options.name||e.tag)}function kn(e,t){return Array.isArray(e)?e.indexOf(t)>-1:"string"==typeof e?e.split(",").indexOf(t)>-1:(n=e,"[object RegExp]"===a.call(n)&&e.test(t));var n}function An(e,t){var n=e.cache,r=e.keys,i=e._vnode;for(var o in n){var a=n[o];if(a){var s=xn(a.componentOptions);s&&!t(s)&&On(n,o,r,i)}}}function On(e,t,n,r){var i=e[t];!i||r&&i.tag===r.tag||i.componentInstance.$destroy(),e[t]=null,h(n,t)}!function(t){t.prototype._init=function(t){var n=this;n._uid=bn++,n._isVue=!0,t&&t._isComponent?function(e,t){var n=e.$options=Object.create(e.constructor.options),r=t._parentVnode;n.parent=t.parent,n._parentVnode=r;var i=r.componentOptions;n.propsData=i.propsData,n._parentListeners=i.listeners,n._renderChildren=i.children,n._componentTag=i.tag,t.render&&(n.render=t.render,n.staticRenderFns=t.staticRenderFns)}(n,t):n.$options=De($n(n.constructor),t||{},n),n._renderProxy=n,n._self=n,function(e){var t=e.$options,n=t.parent;if(n&&!t.abstract){for(;n.$options.abstract&&n.$parent;)n=n.$parent;n.$children.push(e)}e.$parent=n,e.$root=n?n.$root:e,e.$children=[],e.$refs={},e._watcher=null,e._inactive=null,e._directInactive=!1,e._isMounted=!1,e._isDestroyed=!1,e._isBeingDestroyed=!1}(n),function(e){e._events=Object.create(null),e._hasHookEvent=!1;var t=e.$options._parentListeners;t&&qt(e,t)}(n),function(t){t._vnode=null,t._staticTrees=null;var n=t.$options,r=t.$vnode=n._parentVnode,i=r&&r.context;t.$slots=ut(n._renderChildren,i),t.$scopedSlots=e,t._c=function(e,n,r,i){return Pt(t,e,n,r,i,!1)},t.$createElement=function(e,n,r,i){return Pt(t,e,n,r,i,!0)};var o=r&&r.data;xe(t,"$attrs",o&&o.attrs||e,null,!0),xe(t,"$listeners",n._parentListeners||e,null,!0)}(n),Yt(n,"beforeCreate"),function(e){var t=ct(e.$options.inject,e);t&&($e(!1),Object.keys(t).forEach(function(n){xe(e,n,t[n])}),$e(!0))}(n),vn(n),function(e){var t=e.$options.provide;t&&(e._provided="function"==typeof t?t.call(e):t)}(n),Yt(n,"created"),n.$options.el&&n.$mount(n.$options.el)}}(wn),function(e){var t={get:function(){return this._data}},n={get:function(){return this._props}};Object.defineProperty(e.prototype,"$data",t),Object.defineProperty(e.prototype,"$props",n),e.prototype.$set=ke,e.prototype.$delete=Ae,e.prototype.$watch=function(e,t,n){if(s(t))return _n(this,e,t,n);(n=n||{}).user=!0;var r=new fn(this,e,t,n);if(n.immediate)try{t.call(this,r.value)}catch(e){Re(e,this,'callback for immediate watcher "'+r.expression+'"')}return function(){r.teardown()}}}(wn),function(e){var t=/^hook:/;e.prototype.$on=function(e,n){var r=this;if(Array.isArray(e))for(var i=0,o=e.length;i<o;i++)r.$on(e[i],n);else(r._events[e]||(r._events[e]=[])).push(n),t.test(e)&&(r._hasHookEvent=!0);return r},e.prototype.$once=function(e,t){var n=this;function r(){n.$off(e,r),t.apply(n,arguments)}return r.fn=t,n.$on(e,r),n},e.prototype.$off=function(e,t){var n=this;if(!arguments.length)return n._events=Object.create(null),n;if(Array.isArray(e)){for(var r=0,i=e.length;r<i;r++)n.$off(e[r],t);return n}var o,a=n._events[e];if(!a)return n;if(!t)return n._events[e]=null,n;for(var s=a.length;s--;)if((o=a[s])===t||o.fn===t){a.splice(s,1);break}return n},e.prototype.$emit=function(e){var t=this._events[e];if(t){t=t.length>1?k(t):t;for(var n=k(arguments,1),r='event handler for "'+e+'"',i=0,o=t.length;i<o;i++)He(t[i],this,n,this,r)}return this}}(wn),function(e){e.prototype._update=function(e,t){var n=this,r=n.$el,i=n._vnode,o=Zt(n);n._vnode=e,n.$el=i?n.__patch__(i,e):n.__patch__(n.$el,e,t,!1),o(),r&&(r.__vue__=null),n.$el&&(n.$el.__vue__=n),n.$vnode&&n.$parent&&n.$vnode===n.$parent._vnode&&(n.$parent.$el=n.$el)},e.prototype.$forceUpdate=function(){this._watcher&&this._watcher.update()},e.prototype.$destroy=function(){var e=this;if(!e._isBeingDestroyed){Yt(e,"beforeDestroy"),e._isBeingDestroyed=!0;var t=e.$parent;!t||t._isBeingDestroyed||e.$options.abstract||h(t.$children,e),e._watcher&&e._watcher.teardown();for(var n=e._watchers.length;n--;)e._watchers[n].teardown();e._data.__ob__&&e._data.__ob__.vmCount--,e._isDestroyed=!0,e.__patch__(e._vnode,null),Yt(e,"destroyed"),e.$off(),e.$el&&(e.$el.__vue__=null),e.$vnode&&(e.$vnode.parent=null)}}}(wn),function(e){St(e.prototype),e.prototype.$nextTick=function(e){return Ye(e,this)},e.prototype._render=function(){var e,t=this,n=t.$options,r=n.render,i=n._parentVnode;i&&(t.$scopedSlots=ft(i.data.scopedSlots,t.$slots,t.$scopedSlots)),t.$vnode=i;try{Ht=t,e=r.call(t._renderProxy,t.$createElement)}catch(n){Re(n,t,"render"),e=t._vnode}finally{Ht=null}return Array.isArray(e)&&1===e.length&&(e=e[0]),e instanceof pe||(e=ve()),e.parent=i,e}}(wn);var Sn=[String,RegExp,Array],Tn={KeepAlive:{name:"keep-alive",abstract:!0,props:{include:Sn,exclude:Sn,max:[String,Number]},created:function(){this.cache=Object.create(null),this.keys=[]},destroyed:function(){for(var e in this.cache)On(this.cache,e,this.keys)},mounted:function(){var e=this;this.$watch("include",function(t){An(e,function(e){return kn(t,e)})}),this.$watch("exclude",function(t){An(e,function(e){return!kn(t,e)})})},render:function(){var e=this.$slots.default,t=zt(e),n=t&&t.componentOptions;if(n){var r=xn(n),i=this.include,o=this.exclude;if(i&&(!r||!kn(i,r))||o&&r&&kn(o,r))return t;var a=this.cache,s=this.keys,c=null==t.key?n.Ctor.cid+(n.tag?"::"+n.tag:""):t.key;a[c]?(t.componentInstance=a[c].componentInstance,h(s,c),s.push(c)):(a[c]=t,s.push(c),this.max&&s.length>parseInt(this.max)&&On(a,s[0],s,this._vnode)),t.data.keepAlive=!0}return t||e&&e[0]}}};!function(e){var t={get:function(){return F}};Object.defineProperty(e,"config",t),e.util={warn:ae,extend:A,mergeOptions:De,defineReactive:xe},e.set=ke,e.delete=Ae,e.nextTick=Ye,e.observable=function(e){return Ce(e),e},e.options=Object.create(null),M.forEach(function(t){e.options[t+"s"]=Object.create(null)}),e.options._base=e,A(e.options.components,Tn),function(e){e.use=function(e){var t=this._installedPlugins||(this._installedPlugins=[]);if(t.indexOf(e)>-1)return this;var n=k(arguments,1);return n.unshift(this),"function"==typeof e.install?e.install.apply(e,n):"function"==typeof e&&e.apply(null,n),t.push(e),this}}(e),function(e){e.mixin=function(e){return this.options=De(this.options,e),this}}(e),Cn(e),function(e){M.forEach(function(t){e[t]=function(e,n){return n?("component"===t&&s(n)&&(n.name=n.name||e,n=this.options._base.extend(n)),"directive"===t&&"function"==typeof n&&(n={bind:n,update:n}),this.options[t+"s"][e]=n,n):this.options[t+"s"][e]}})}(e)}(wn),Object.defineProperty(wn.prototype,"$isServer",{get:te}),Object.defineProperty(wn.prototype,"$ssrContext",{get:function(){return this.$vnode&&this.$vnode.ssrContext}}),Object.defineProperty(wn,"FunctionalRenderContext",{value:Tt}),wn.version="2.6.12";var En=p("style,class"),Nn=p("input,textarea,option,select,progress"),jn=function(e,t,n){return"value"===n&&Nn(e)&&"button"!==t||"selected"===n&&"option"===e||"checked"===n&&"input"===e||"muted"===n&&"video"===e},Dn=p("contenteditable,draggable,spellcheck"),Ln=p("events,caret,typing,plaintext-only"),Mn=function(e,t){return Hn(t)||"false"===t?"false":"contenteditable"===e&&Ln(t)?t:"true"},In=p("allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,translate,truespeed,typemustmatch,visible"),Fn="http://www.w3.org/1999/xlink",Pn=function(e){return":"===e.charAt(5)&&"xlink"===e.slice(0,5)},Rn=function(e){return Pn(e)?e.slice(6,e.length):""},Hn=function(e){return null==e||!1===e};function Bn(e){for(var t=e.data,r=e,i=e;n(i.componentInstance);)(i=i.componentInstance._vnode)&&i.data&&(t=Un(i.data,t));for(;n(r=r.parent);)r&&r.data&&(t=Un(t,r.data));return function(e,t){if(n(e)||n(t))return zn(e,Vn(t));return""}(t.staticClass,t.class)}function Un(e,t){return{staticClass:zn(e.staticClass,t.staticClass),class:n(e.class)?[e.class,t.class]:t.class}}function zn(e,t){return e?t?e+" "+t:e:t||""}function Vn(e){return Array.isArray(e)?function(e){for(var t,r="",i=0,o=e.length;i<o;i++)n(t=Vn(e[i]))&&""!==t&&(r&&(r+=" "),r+=t);return r}(e):o(e)?function(e){var t="";for(var n in e)e[n]&&(t&&(t+=" "),t+=n);return t}(e):"string"==typeof e?e:""}var Kn={svg:"http://www.w3.org/2000/svg",math:"http://www.w3.org/1998/Math/MathML"},Jn=p("html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot"),qn=p("svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view",!0),Wn=function(e){return Jn(e)||qn(e)};function Zn(e){return qn(e)?"svg":"math"===e?"math":void 0}var Gn=Object.create(null);var Xn=p("text,number,password,search,email,tel,url");function Yn(e){if("string"==typeof e){var t=document.querySelector(e);return t||document.createElement("div")}return e}var Qn=Object.freeze({createElement:function(e,t){var n=document.createElement(e);return"select"!==e?n:(t.data&&t.data.attrs&&void 0!==t.data.attrs.multiple&&n.setAttribute("multiple","multiple"),n)},createElementNS:function(e,t){return document.createElementNS(Kn[e],t)},createTextNode:function(e){return document.createTextNode(e)},createComment:function(e){return document.createComment(e)},insertBefore:function(e,t,n){e.insertBefore(t,n)},removeChild:function(e,t){e.removeChild(t)},appendChild:function(e,t){e.appendChild(t)},parentNode:function(e){return e.parentNode},nextSibling:function(e){return e.nextSibling},tagName:function(e){return e.tagName},setTextContent:function(e,t){e.textContent=t},setStyleScope:function(e,t){e.setAttribute(t,"")}}),er={create:function(e,t){tr(t)},update:function(e,t){e.data.ref!==t.data.ref&&(tr(e,!0),tr(t))},destroy:function(e){tr(e,!0)}};function tr(e,t){var r=e.data.ref;if(n(r)){var i=e.context,o=e.componentInstance||e.elm,a=i.$refs;t?Array.isArray(a[r])?h(a[r],o):a[r]===o&&(a[r]=void 0):e.data.refInFor?Array.isArray(a[r])?a[r].indexOf(o)<0&&a[r].push(o):a[r]=[o]:a[r]=o}}var nr=new pe("",{},[]),rr=["create","activate","update","remove","destroy"];function ir(e,i){return e.key===i.key&&(e.tag===i.tag&&e.isComment===i.isComment&&n(e.data)===n(i.data)&&function(e,t){if("input"!==e.tag)return!0;var r,i=n(r=e.data)&&n(r=r.attrs)&&r.type,o=n(r=t.data)&&n(r=r.attrs)&&r.type;return i===o||Xn(i)&&Xn(o)}(e,i)||r(e.isAsyncPlaceholder)&&e.asyncFactory===i.asyncFactory&&t(i.asyncFactory.error))}function or(e,t,r){var i,o,a={};for(i=t;i<=r;++i)n(o=e[i].key)&&(a[o]=i);return a}var ar={create:sr,update:sr,destroy:function(e){sr(e,nr)}};function sr(e,t){(e.data.directives||t.data.directives)&&function(e,t){var n,r,i,o=e===nr,a=t===nr,s=ur(e.data.directives,e.context),c=ur(t.data.directives,t.context),u=[],l=[];for(n in c)r=s[n],i=c[n],r?(i.oldValue=r.value,i.oldArg=r.arg,fr(i,"update",t,e),i.def&&i.def.componentUpdated&&l.push(i)):(fr(i,"bind",t,e),i.def&&i.def.inserted&&u.push(i));if(u.length){var f=function(){for(var n=0;n<u.length;n++)fr(u[n],"inserted",t,e)};o?it(t,"insert",f):f()}l.length&&it(t,"postpatch",function(){for(var n=0;n<l.length;n++)fr(l[n],"componentUpdated",t,e)});if(!o)for(n in s)c[n]||fr(s[n],"unbind",e,e,a)}(e,t)}var cr=Object.create(null);function ur(e,t){var n,r,i=Object.create(null);if(!e)return i;for(n=0;n<e.length;n++)(r=e[n]).modifiers||(r.modifiers=cr),i[lr(r)]=r,r.def=Le(t.$options,"directives",r.name);return i}function lr(e){return e.rawName||e.name+"."+Object.keys(e.modifiers||{}).join(".")}function fr(e,t,n,r,i){var o=e.def&&e.def[t];if(o)try{o(n.elm,e,n,r,i)}catch(r){Re(r,n.context,"directive "+e.name+" "+t+" hook")}}var pr=[er,ar];function dr(e,r){var i=r.componentOptions;if(!(n(i)&&!1===i.Ctor.options.inheritAttrs||t(e.data.attrs)&&t(r.data.attrs))){var o,a,s=r.elm,c=e.data.attrs||{},u=r.data.attrs||{};for(o in n(u.__ob__)&&(u=r.data.attrs=A({},u)),u)a=u[o],c[o]!==a&&vr(s,o,a);for(o in(q||Z)&&u.value!==c.value&&vr(s,"value",u.value),c)t(u[o])&&(Pn(o)?s.removeAttributeNS(Fn,Rn(o)):Dn(o)||s.removeAttribute(o))}}function vr(e,t,n){e.tagName.indexOf("-")>-1?hr(e,t,n):In(t)?Hn(n)?e.removeAttribute(t):(n="allowfullscreen"===t&&"EMBED"===e.tagName?"true":t,e.setAttribute(t,n)):Dn(t)?e.setAttribute(t,Mn(t,n)):Pn(t)?Hn(n)?e.removeAttributeNS(Fn,Rn(t)):e.setAttributeNS(Fn,t,n):hr(e,t,n)}function hr(e,t,n){if(Hn(n))e.removeAttribute(t);else{if(q&&!W&&"TEXTAREA"===e.tagName&&"placeholder"===t&&""!==n&&!e.__ieph){var r=function(t){t.stopImmediatePropagation(),e.removeEventListener("input",r)};e.addEventListener("input",r),e.__ieph=!0}e.setAttribute(t,n)}}var mr={create:dr,update:dr};function yr(e,r){var i=r.elm,o=r.data,a=e.data;if(!(t(o.staticClass)&&t(o.class)&&(t(a)||t(a.staticClass)&&t(a.class)))){var s=Bn(r),c=i._transitionClasses;n(c)&&(s=zn(s,Vn(c))),s!==i._prevClass&&(i.setAttribute("class",s),i._prevClass=s)}}var gr,_r,br,$r,wr,Cr,xr={create:yr,update:yr},kr=/[\w).+\-_$\]]/;function Ar(e){var t,n,r,i,o,a=!1,s=!1,c=!1,u=!1,l=0,f=0,p=0,d=0;for(r=0;r<e.length;r++)if(n=t,t=e.charCodeAt(r),a)39===t&&92!==n&&(a=!1);else if(s)34===t&&92!==n&&(s=!1);else if(c)96===t&&92!==n&&(c=!1);else if(u)47===t&&92!==n&&(u=!1);else if(124!==t||124===e.charCodeAt(r+1)||124===e.charCodeAt(r-1)||l||f||p){switch(t){case 34:s=!0;break;case 39:a=!0;break;case 96:c=!0;break;case 40:p++;break;case 41:p--;break;case 91:f++;break;case 93:f--;break;case 123:l++;break;case 125:l--}if(47===t){for(var v=r-1,h=void 0;v>=0&&" "===(h=e.charAt(v));v--);h&&kr.test(h)||(u=!0)}}else void 0===i?(d=r+1,i=e.slice(0,r).trim()):m();function m(){(o||(o=[])).push(e.slice(d,r).trim()),d=r+1}if(void 0===i?i=e.slice(0,r).trim():0!==d&&m(),o)for(r=0;r<o.length;r++)i=Or(i,o[r]);return i}function Or(e,t){var n=t.indexOf("(");if(n<0)return'_f("'+t+'")('+e+")";var r=t.slice(0,n),i=t.slice(n+1);return'_f("'+r+'")('+e+(")"!==i?","+i:i)}function Sr(e,t){console.error("[Vue compiler]: "+e)}function Tr(e,t){return e?e.map(function(e){return e[t]}).filter(function(e){return e}):[]}function Er(e,t,n,r,i){(e.props||(e.props=[])).push(Rr({name:t,value:n,dynamic:i},r)),e.plain=!1}function Nr(e,t,n,r,i){(i?e.dynamicAttrs||(e.dynamicAttrs=[]):e.attrs||(e.attrs=[])).push(Rr({name:t,value:n,dynamic:i},r)),e.plain=!1}function jr(e,t,n,r){e.attrsMap[t]=n,e.attrsList.push(Rr({name:t,value:n},r))}function Dr(e,t,n,r,i,o,a,s){(e.directives||(e.directives=[])).push(Rr({name:t,rawName:n,value:r,arg:i,isDynamicArg:o,modifiers:a},s)),e.plain=!1}function Lr(e,t,n){return n?"_p("+t+',"'+e+'")':e+t}function Mr(t,n,r,i,o,a,s,c){var u;(i=i||e).right?c?n="("+n+")==='click'?'contextmenu':("+n+")":"click"===n&&(n="contextmenu",delete i.right):i.middle&&(c?n="("+n+")==='click'?'mouseup':("+n+")":"click"===n&&(n="mouseup")),i.capture&&(delete i.capture,n=Lr("!",n,c)),i.once&&(delete i.once,n=Lr("~",n,c)),i.passive&&(delete i.passive,n=Lr("&",n,c)),i.native?(delete i.native,u=t.nativeEvents||(t.nativeEvents={})):u=t.events||(t.events={});var l=Rr({value:r.trim(),dynamic:c},s);i!==e&&(l.modifiers=i);var f=u[n];Array.isArray(f)?o?f.unshift(l):f.push(l):u[n]=f?o?[l,f]:[f,l]:l,t.plain=!1}function Ir(e,t,n){var r=Fr(e,":"+t)||Fr(e,"v-bind:"+t);if(null!=r)return Ar(r);if(!1!==n){var i=Fr(e,t);if(null!=i)return JSON.stringify(i)}}function Fr(e,t,n){var r;if(null!=(r=e.attrsMap[t]))for(var i=e.attrsList,o=0,a=i.length;o<a;o++)if(i[o].name===t){i.splice(o,1);break}return n&&delete e.attrsMap[t],r}function Pr(e,t){for(var n=e.attrsList,r=0,i=n.length;r<i;r++){var o=n[r];if(t.test(o.name))return n.splice(r,1),o}}function Rr(e,t){return t&&(null!=t.start&&(e.start=t.start),null!=t.end&&(e.end=t.end)),e}function Hr(e,t,n){var r=n||{},i=r.number,o="$$v";r.trim&&(o="(typeof $$v === 'string'? $$v.trim(): $$v)"),i&&(o="_n("+o+")");var a=Br(t,o);e.model={value:"("+t+")",expression:JSON.stringify(t),callback:"function ($$v) {"+a+"}"}}function Br(e,t){var n=function(e){if(e=e.trim(),gr=e.length,e.indexOf("[")<0||e.lastIndexOf("]")<gr-1)return($r=e.lastIndexOf("."))>-1?{exp:e.slice(0,$r),key:'"'+e.slice($r+1)+'"'}:{exp:e,key:null};_r=e,$r=wr=Cr=0;for(;!zr();)Vr(br=Ur())?Jr(br):91===br&&Kr(br);return{exp:e.slice(0,wr),key:e.slice(wr+1,Cr)}}(e);return null===n.key?e+"="+t:"$set("+n.exp+", "+n.key+", "+t+")"}function Ur(){return _r.charCodeAt(++$r)}function zr(){return $r>=gr}function Vr(e){return 34===e||39===e}function Kr(e){var t=1;for(wr=$r;!zr();)if(Vr(e=Ur()))Jr(e);else if(91===e&&t++,93===e&&t--,0===t){Cr=$r;break}}function Jr(e){for(var t=e;!zr()&&(e=Ur())!==t;);}var qr,Wr="__r",Zr="__c";function Gr(e,t,n){var r=qr;return function i(){null!==t.apply(null,arguments)&&Qr(e,i,n,r)}}var Xr=Ve&&!(X&&Number(X[1])<=53);function Yr(e,t,n,r){if(Xr){var i=an,o=t;t=o._wrapper=function(e){if(e.target===e.currentTarget||e.timeStamp>=i||e.timeStamp<=0||e.target.ownerDocument!==document)return o.apply(this,arguments)}}qr.addEventListener(e,t,Q?{capture:n,passive:r}:n)}function Qr(e,t,n,r){(r||qr).removeEventListener(e,t._wrapper||t,n)}function ei(e,r){if(!t(e.data.on)||!t(r.data.on)){var i=r.data.on||{},o=e.data.on||{};qr=r.elm,function(e){if(n(e[Wr])){var t=q?"change":"input";e[t]=[].concat(e[Wr],e[t]||[]),delete e[Wr]}n(e[Zr])&&(e.change=[].concat(e[Zr],e.change||[]),delete e[Zr])}(i),rt(i,o,Yr,Qr,Gr,r.context),qr=void 0}}var ti,ni={create:ei,update:ei};function ri(e,r){if(!t(e.data.domProps)||!t(r.data.domProps)){var i,o,a=r.elm,s=e.data.domProps||{},c=r.data.domProps||{};for(i in n(c.__ob__)&&(c=r.data.domProps=A({},c)),s)i in c||(a[i]="");for(i in c){if(o=c[i],"textContent"===i||"innerHTML"===i){if(r.children&&(r.children.length=0),o===s[i])continue;1===a.childNodes.length&&a.removeChild(a.childNodes[0])}if("value"===i&&"PROGRESS"!==a.tagName){a._value=o;var u=t(o)?"":String(o);ii(a,u)&&(a.value=u)}else if("innerHTML"===i&&qn(a.tagName)&&t(a.innerHTML)){(ti=ti||document.createElement("div")).innerHTML="<svg>"+o+"</svg>";for(var l=ti.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;l.firstChild;)a.appendChild(l.firstChild)}else if(o!==s[i])try{a[i]=o}catch(e){}}}}function ii(e,t){return!e.composing&&("OPTION"===e.tagName||function(e,t){var n=!0;try{n=document.activeElement!==e}catch(e){}return n&&e.value!==t}(e,t)||function(e,t){var r=e.value,i=e._vModifiers;if(n(i)){if(i.number)return f(r)!==f(t);if(i.trim)return r.trim()!==t.trim()}return r!==t}(e,t))}var oi={create:ri,update:ri},ai=g(function(e){var t={},n=/:(.+)/;return e.split(/;(?![^(]*\))/g).forEach(function(e){if(e){var r=e.split(n);r.length>1&&(t[r[0].trim()]=r[1].trim())}}),t});function si(e){var t=ci(e.style);return e.staticStyle?A(e.staticStyle,t):t}function ci(e){return Array.isArray(e)?O(e):"string"==typeof e?ai(e):e}var ui,li=/^--/,fi=/\s*!important$/,pi=function(e,t,n){if(li.test(t))e.style.setProperty(t,n);else if(fi.test(n))e.style.setProperty(C(t),n.replace(fi,""),"important");else{var r=vi(t);if(Array.isArray(n))for(var i=0,o=n.length;i<o;i++)e.style[r]=n[i];else e.style[r]=n}},di=["Webkit","Moz","ms"],vi=g(function(e){if(ui=ui||document.createElement("div").style,"filter"!==(e=b(e))&&e in ui)return e;for(var t=e.charAt(0).toUpperCase()+e.slice(1),n=0;n<di.length;n++){var r=di[n]+t;if(r in ui)return r}});function hi(e,r){var i=r.data,o=e.data;if(!(t(i.staticStyle)&&t(i.style)&&t(o.staticStyle)&&t(o.style))){var a,s,c=r.elm,u=o.staticStyle,l=o.normalizedStyle||o.style||{},f=u||l,p=ci(r.data.style)||{};r.data.normalizedStyle=n(p.__ob__)?A({},p):p;var d=function(e,t){var n,r={};if(t)for(var i=e;i.componentInstance;)(i=i.componentInstance._vnode)&&i.data&&(n=si(i.data))&&A(r,n);(n=si(e.data))&&A(r,n);for(var o=e;o=o.parent;)o.data&&(n=si(o.data))&&A(r,n);return r}(r,!0);for(s in f)t(d[s])&&pi(c,s,"");for(s in d)(a=d[s])!==f[s]&&pi(c,s,null==a?"":a)}}var mi={create:hi,update:hi},yi=/\s+/;function gi(e,t){if(t&&(t=t.trim()))if(e.classList)t.indexOf(" ")>-1?t.split(yi).forEach(function(t){return e.classList.add(t)}):e.classList.add(t);else{var n=" "+(e.getAttribute("class")||"")+" ";n.indexOf(" "+t+" ")<0&&e.setAttribute("class",(n+t).trim())}}function _i(e,t){if(t&&(t=t.trim()))if(e.classList)t.indexOf(" ")>-1?t.split(yi).forEach(function(t){return e.classList.remove(t)}):e.classList.remove(t),e.classList.length||e.removeAttribute("class");else{for(var n=" "+(e.getAttribute("class")||"")+" ",r=" "+t+" ";n.indexOf(r)>=0;)n=n.replace(r," ");(n=n.trim())?e.setAttribute("class",n):e.removeAttribute("class")}}function bi(e){if(e){if("object"==typeof e){var t={};return!1!==e.css&&A(t,$i(e.name||"v")),A(t,e),t}return"string"==typeof e?$i(e):void 0}}var $i=g(function(e){return{enterClass:e+"-enter",enterToClass:e+"-enter-to",enterActiveClass:e+"-enter-active",leaveClass:e+"-leave",leaveToClass:e+"-leave-to",leaveActiveClass:e+"-leave-active"}}),wi=z&&!W,Ci="transition",xi="animation",ki="transition",Ai="transitionend",Oi="animation",Si="animationend";wi&&(void 0===window.ontransitionend&&void 0!==window.onwebkittransitionend&&(ki="WebkitTransition",Ai="webkitTransitionEnd"),void 0===window.onanimationend&&void 0!==window.onwebkitanimationend&&(Oi="WebkitAnimation",Si="webkitAnimationEnd"));var Ti=z?window.requestAnimationFrame?window.requestAnimationFrame.bind(window):setTimeout:function(e){return e()};function Ei(e){Ti(function(){Ti(e)})}function Ni(e,t){var n=e._transitionClasses||(e._transitionClasses=[]);n.indexOf(t)<0&&(n.push(t),gi(e,t))}function ji(e,t){e._transitionClasses&&h(e._transitionClasses,t),_i(e,t)}function Di(e,t,n){var r=Mi(e,t),i=r.type,o=r.timeout,a=r.propCount;if(!i)return n();var s=i===Ci?Ai:Si,c=0,u=function(){e.removeEventListener(s,l),n()},l=function(t){t.target===e&&++c>=a&&u()};setTimeout(function(){c<a&&u()},o+1),e.addEventListener(s,l)}var Li=/\b(transform|all)(,|$)/;function Mi(e,t){var n,r=window.getComputedStyle(e),i=(r[ki+"Delay"]||"").split(", "),o=(r[ki+"Duration"]||"").split(", "),a=Ii(i,o),s=(r[Oi+"Delay"]||"").split(", "),c=(r[Oi+"Duration"]||"").split(", "),u=Ii(s,c),l=0,f=0;return t===Ci?a>0&&(n=Ci,l=a,f=o.length):t===xi?u>0&&(n=xi,l=u,f=c.length):f=(n=(l=Math.max(a,u))>0?a>u?Ci:xi:null)?n===Ci?o.length:c.length:0,{type:n,timeout:l,propCount:f,hasTransform:n===Ci&&Li.test(r[ki+"Property"])}}function Ii(e,t){for(;e.length<t.length;)e=e.concat(e);return Math.max.apply(null,t.map(function(t,n){return Fi(t)+Fi(e[n])}))}function Fi(e){return 1e3*Number(e.slice(0,-1).replace(",","."))}function Pi(e,r){var i=e.elm;n(i._leaveCb)&&(i._leaveCb.cancelled=!0,i._leaveCb());var a=bi(e.data.transition);if(!t(a)&&!n(i._enterCb)&&1===i.nodeType){for(var s=a.css,c=a.type,u=a.enterClass,l=a.enterToClass,p=a.enterActiveClass,d=a.appearClass,v=a.appearToClass,h=a.appearActiveClass,m=a.beforeEnter,y=a.enter,g=a.afterEnter,_=a.enterCancelled,b=a.beforeAppear,$=a.appear,w=a.afterAppear,C=a.appearCancelled,x=a.duration,k=Wt,A=Wt.$vnode;A&&A.parent;)k=A.context,A=A.parent;var O=!k._isMounted||!e.isRootInsert;if(!O||$||""===$){var S=O&&d?d:u,T=O&&h?h:p,E=O&&v?v:l,N=O&&b||m,j=O&&"function"==typeof $?$:y,L=O&&w||g,M=O&&C||_,I=f(o(x)?x.enter:x),F=!1!==s&&!W,P=Bi(j),R=i._enterCb=D(function(){F&&(ji(i,E),ji(i,T)),R.cancelled?(F&&ji(i,S),M&&M(i)):L&&L(i),i._enterCb=null});e.data.show||it(e,"insert",function(){var t=i.parentNode,n=t&&t._pending&&t._pending[e.key];n&&n.tag===e.tag&&n.elm._leaveCb&&n.elm._leaveCb(),j&&j(i,R)}),N&&N(i),F&&(Ni(i,S),Ni(i,T),Ei(function(){ji(i,S),R.cancelled||(Ni(i,E),P||(Hi(I)?setTimeout(R,I):Di(i,c,R)))})),e.data.show&&(r&&r(),j&&j(i,R)),F||P||R()}}}function Ri(e,r){var i=e.elm;n(i._enterCb)&&(i._enterCb.cancelled=!0,i._enterCb());var a=bi(e.data.transition);if(t(a)||1!==i.nodeType)return r();if(!n(i._leaveCb)){var s=a.css,c=a.type,u=a.leaveClass,l=a.leaveToClass,p=a.leaveActiveClass,d=a.beforeLeave,v=a.leave,h=a.afterLeave,m=a.leaveCancelled,y=a.delayLeave,g=a.duration,_=!1!==s&&!W,b=Bi(v),$=f(o(g)?g.leave:g),w=i._leaveCb=D(function(){i.parentNode&&i.parentNode._pending&&(i.parentNode._pending[e.key]=null),_&&(ji(i,l),ji(i,p)),w.cancelled?(_&&ji(i,u),m&&m(i)):(r(),h&&h(i)),i._leaveCb=null});y?y(C):C()}function C(){w.cancelled||(!e.data.show&&i.parentNode&&((i.parentNode._pending||(i.parentNode._pending={}))[e.key]=e),d&&d(i),_&&(Ni(i,u),Ni(i,p),Ei(function(){ji(i,u),w.cancelled||(Ni(i,l),b||(Hi($)?setTimeout(w,$):Di(i,c,w)))})),v&&v(i,w),_||b||w())}}function Hi(e){return"number"==typeof e&&!isNaN(e)}function Bi(e){if(t(e))return!1;var r=e.fns;return n(r)?Bi(Array.isArray(r)?r[0]:r):(e._length||e.length)>1}function Ui(e,t){!0!==t.data.show&&Pi(t)}var zi=function(e){var o,a,s={},c=e.modules,u=e.nodeOps;for(o=0;o<rr.length;++o)for(s[rr[o]]=[],a=0;a<c.length;++a)n(c[a][rr[o]])&&s[rr[o]].push(c[a][rr[o]]);function l(e){var t=u.parentNode(e);n(t)&&u.removeChild(t,e)}function f(e,t,i,o,a,c,l){if(n(e.elm)&&n(c)&&(e=c[l]=me(e)),e.isRootInsert=!a,!function(e,t,i,o){var a=e.data;if(n(a)){var c=n(e.componentInstance)&&a.keepAlive;if(n(a=a.hook)&&n(a=a.init)&&a(e,!1),n(e.componentInstance))return d(e,t),v(i,e.elm,o),r(c)&&function(e,t,r,i){for(var o,a=e;a.componentInstance;)if(a=a.componentInstance._vnode,n(o=a.data)&&n(o=o.transition)){for(o=0;o<s.activate.length;++o)s.activate[o](nr,a);t.push(a);break}v(r,e.elm,i)}(e,t,i,o),!0}}(e,t,i,o)){var f=e.data,p=e.children,m=e.tag;n(m)?(e.elm=e.ns?u.createElementNS(e.ns,m):u.createElement(m,e),g(e),h(e,p,t),n(f)&&y(e,t),v(i,e.elm,o)):r(e.isComment)?(e.elm=u.createComment(e.text),v(i,e.elm,o)):(e.elm=u.createTextNode(e.text),v(i,e.elm,o))}}function d(e,t){n(e.data.pendingInsert)&&(t.push.apply(t,e.data.pendingInsert),e.data.pendingInsert=null),e.elm=e.componentInstance.$el,m(e)?(y(e,t),g(e)):(tr(e),t.push(e))}function v(e,t,r){n(e)&&(n(r)?u.parentNode(r)===e&&u.insertBefore(e,t,r):u.appendChild(e,t))}function h(e,t,n){if(Array.isArray(t))for(var r=0;r<t.length;++r)f(t[r],n,e.elm,null,!0,t,r);else i(e.text)&&u.appendChild(e.elm,u.createTextNode(String(e.text)))}function m(e){for(;e.componentInstance;)e=e.componentInstance._vnode;return n(e.tag)}function y(e,t){for(var r=0;r<s.create.length;++r)s.create[r](nr,e);n(o=e.data.hook)&&(n(o.create)&&o.create(nr,e),n(o.insert)&&t.push(e))}function g(e){var t;if(n(t=e.fnScopeId))u.setStyleScope(e.elm,t);else for(var r=e;r;)n(t=r.context)&&n(t=t.$options._scopeId)&&u.setStyleScope(e.elm,t),r=r.parent;n(t=Wt)&&t!==e.context&&t!==e.fnContext&&n(t=t.$options._scopeId)&&u.setStyleScope(e.elm,t)}function _(e,t,n,r,i,o){for(;r<=i;++r)f(n[r],o,e,t,!1,n,r)}function b(e){var t,r,i=e.data;if(n(i))for(n(t=i.hook)&&n(t=t.destroy)&&t(e),t=0;t<s.destroy.length;++t)s.destroy[t](e);if(n(t=e.children))for(r=0;r<e.children.length;++r)b(e.children[r])}function $(e,t,r){for(;t<=r;++t){var i=e[t];n(i)&&(n(i.tag)?(w(i),b(i)):l(i.elm))}}function w(e,t){if(n(t)||n(e.data)){var r,i=s.remove.length+1;for(n(t)?t.listeners+=i:t=function(e,t){function n(){0==--n.listeners&&l(e)}return n.listeners=t,n}(e.elm,i),n(r=e.componentInstance)&&n(r=r._vnode)&&n(r.data)&&w(r,t),r=0;r<s.remove.length;++r)s.remove[r](e,t);n(r=e.data.hook)&&n(r=r.remove)?r(e,t):t()}else l(e.elm)}function C(e,t,r,i){for(var o=r;o<i;o++){var a=t[o];if(n(a)&&ir(e,a))return o}}function x(e,i,o,a,c,l){if(e!==i){n(i.elm)&&n(a)&&(i=a[c]=me(i));var p=i.elm=e.elm;if(r(e.isAsyncPlaceholder))n(i.asyncFactory.resolved)?O(e.elm,i,o):i.isAsyncPlaceholder=!0;else if(r(i.isStatic)&&r(e.isStatic)&&i.key===e.key&&(r(i.isCloned)||r(i.isOnce)))i.componentInstance=e.componentInstance;else{var d,v=i.data;n(v)&&n(d=v.hook)&&n(d=d.prepatch)&&d(e,i);var h=e.children,y=i.children;if(n(v)&&m(i)){for(d=0;d<s.update.length;++d)s.update[d](e,i);n(d=v.hook)&&n(d=d.update)&&d(e,i)}t(i.text)?n(h)&&n(y)?h!==y&&function(e,r,i,o,a){for(var s,c,l,p=0,d=0,v=r.length-1,h=r[0],m=r[v],y=i.length-1,g=i[0],b=i[y],w=!a;p<=v&&d<=y;)t(h)?h=r[++p]:t(m)?m=r[--v]:ir(h,g)?(x(h,g,o,i,d),h=r[++p],g=i[++d]):ir(m,b)?(x(m,b,o,i,y),m=r[--v],b=i[--y]):ir(h,b)?(x(h,b,o,i,y),w&&u.insertBefore(e,h.elm,u.nextSibling(m.elm)),h=r[++p],b=i[--y]):ir(m,g)?(x(m,g,o,i,d),w&&u.insertBefore(e,m.elm,h.elm),m=r[--v],g=i[++d]):(t(s)&&(s=or(r,p,v)),t(c=n(g.key)?s[g.key]:C(g,r,p,v))?f(g,o,e,h.elm,!1,i,d):ir(l=r[c],g)?(x(l,g,o,i,d),r[c]=void 0,w&&u.insertBefore(e,l.elm,h.elm)):f(g,o,e,h.elm,!1,i,d),g=i[++d]);p>v?_(e,t(i[y+1])?null:i[y+1].elm,i,d,y,o):d>y&&$(r,p,v)}(p,h,y,o,l):n(y)?(n(e.text)&&u.setTextContent(p,""),_(p,null,y,0,y.length-1,o)):n(h)?$(h,0,h.length-1):n(e.text)&&u.setTextContent(p,""):e.text!==i.text&&u.setTextContent(p,i.text),n(v)&&n(d=v.hook)&&n(d=d.postpatch)&&d(e,i)}}}function k(e,t,i){if(r(i)&&n(e.parent))e.parent.data.pendingInsert=t;else for(var o=0;o<t.length;++o)t[o].data.hook.insert(t[o])}var A=p("attrs,class,staticClass,staticStyle,key");function O(e,t,i,o){var a,s=t.tag,c=t.data,u=t.children;if(o=o||c&&c.pre,t.elm=e,r(t.isComment)&&n(t.asyncFactory))return t.isAsyncPlaceholder=!0,!0;if(n(c)&&(n(a=c.hook)&&n(a=a.init)&&a(t,!0),n(a=t.componentInstance)))return d(t,i),!0;if(n(s)){if(n(u))if(e.hasChildNodes())if(n(a=c)&&n(a=a.domProps)&&n(a=a.innerHTML)){if(a!==e.innerHTML)return!1}else{for(var l=!0,f=e.firstChild,p=0;p<u.length;p++){if(!f||!O(f,u[p],i,o)){l=!1;break}f=f.nextSibling}if(!l||f)return!1}else h(t,u,i);if(n(c)){var v=!1;for(var m in c)if(!A(m)){v=!0,y(t,i);break}!v&&c.class&&et(c.class)}}else e.data!==t.text&&(e.data=t.text);return!0}return function(e,i,o,a){if(!t(i)){var c,l=!1,p=[];if(t(e))l=!0,f(i,p);else{var d=n(e.nodeType);if(!d&&ir(e,i))x(e,i,p,null,null,a);else{if(d){if(1===e.nodeType&&e.hasAttribute(L)&&(e.removeAttribute(L),o=!0),r(o)&&O(e,i,p))return k(i,p,!0),e;c=e,e=new pe(u.tagName(c).toLowerCase(),{},[],void 0,c)}var v=e.elm,h=u.parentNode(v);if(f(i,p,v._leaveCb?null:h,u.nextSibling(v)),n(i.parent))for(var y=i.parent,g=m(i);y;){for(var _=0;_<s.destroy.length;++_)s.destroy[_](y);if(y.elm=i.elm,g){for(var w=0;w<s.create.length;++w)s.create[w](nr,y);var C=y.data.hook.insert;if(C.merged)for(var A=1;A<C.fns.length;A++)C.fns[A]()}else tr(y);y=y.parent}n(h)?$([e],0,0):n(e.tag)&&b(e)}}return k(i,p,l),i.elm}n(e)&&b(e)}}({nodeOps:Qn,modules:[mr,xr,ni,oi,mi,z?{create:Ui,activate:Ui,remove:function(e,t){!0!==e.data.show?Ri(e,t):t()}}:{}].concat(pr)});W&&document.addEventListener("selectionchange",function(){var e=document.activeElement;e&&e.vmodel&&Xi(e,"input")});var Vi={inserted:function(e,t,n,r){"select"===n.tag?(r.elm&&!r.elm._vOptions?it(n,"postpatch",function(){Vi.componentUpdated(e,t,n)}):Ki(e,t,n.context),e._vOptions=[].map.call(e.options,Wi)):("textarea"===n.tag||Xn(e.type))&&(e._vModifiers=t.modifiers,t.modifiers.lazy||(e.addEventListener("compositionstart",Zi),e.addEventListener("compositionend",Gi),e.addEventListener("change",Gi),W&&(e.vmodel=!0)))},componentUpdated:function(e,t,n){if("select"===n.tag){Ki(e,t,n.context);var r=e._vOptions,i=e._vOptions=[].map.call(e.options,Wi);if(i.some(function(e,t){return!N(e,r[t])}))(e.multiple?t.value.some(function(e){return qi(e,i)}):t.value!==t.oldValue&&qi(t.value,i))&&Xi(e,"change")}}};function Ki(e,t,n){Ji(e,t,n),(q||Z)&&setTimeout(function(){Ji(e,t,n)},0)}function Ji(e,t,n){var r=t.value,i=e.multiple;if(!i||Array.isArray(r)){for(var o,a,s=0,c=e.options.length;s<c;s++)if(a=e.options[s],i)o=j(r,Wi(a))>-1,a.selected!==o&&(a.selected=o);else if(N(Wi(a),r))return void(e.selectedIndex!==s&&(e.selectedIndex=s));i||(e.selectedIndex=-1)}}function qi(e,t){return t.every(function(t){return!N(t,e)})}function Wi(e){return"_value"in e?e._value:e.value}function Zi(e){e.target.composing=!0}function Gi(e){e.target.composing&&(e.target.composing=!1,Xi(e.target,"input"))}function Xi(e,t){var n=document.createEvent("HTMLEvents");n.initEvent(t,!0,!0),e.dispatchEvent(n)}function Yi(e){return!e.componentInstance||e.data&&e.data.transition?e:Yi(e.componentInstance._vnode)}var Qi={model:Vi,show:{bind:function(e,t,n){var r=t.value,i=(n=Yi(n)).data&&n.data.transition,o=e.__vOriginalDisplay="none"===e.style.display?"":e.style.display;r&&i?(n.data.show=!0,Pi(n,function(){e.style.display=o})):e.style.display=r?o:"none"},update:function(e,t,n){var r=t.value;!r!=!t.oldValue&&((n=Yi(n)).data&&n.data.transition?(n.data.show=!0,r?Pi(n,function(){e.style.display=e.__vOriginalDisplay}):Ri(n,function(){e.style.display="none"})):e.style.display=r?e.__vOriginalDisplay:"none")},unbind:function(e,t,n,r,i){i||(e.style.display=e.__vOriginalDisplay)}}},eo={name:String,appear:Boolean,css:Boolean,mode:String,type:String,enterClass:String,leaveClass:String,enterToClass:String,leaveToClass:String,enterActiveClass:String,leaveActiveClass:String,appearClass:String,appearActiveClass:String,appearToClass:String,duration:[Number,String,Object]};function to(e){var t=e&&e.componentOptions;return t&&t.Ctor.options.abstract?to(zt(t.children)):e}function no(e){var t={},n=e.$options;for(var r in n.propsData)t[r]=e[r];var i=n._parentListeners;for(var o in i)t[b(o)]=i[o];return t}function ro(e,t){if(/\d-keep-alive$/.test(t.tag))return e("keep-alive",{props:t.componentOptions.propsData})}var io=function(e){return e.tag||Ut(e)},oo=function(e){return"show"===e.name},ao={name:"transition",props:eo,abstract:!0,render:function(e){var t=this,n=this.$slots.default;if(n&&(n=n.filter(io)).length){var r=this.mode,o=n[0];if(function(e){for(;e=e.parent;)if(e.data.transition)return!0}(this.$vnode))return o;var a=to(o);if(!a)return o;if(this._leaving)return ro(e,o);var s="__transition-"+this._uid+"-";a.key=null==a.key?a.isComment?s+"comment":s+a.tag:i(a.key)?0===String(a.key).indexOf(s)?a.key:s+a.key:a.key;var c=(a.data||(a.data={})).transition=no(this),u=this._vnode,l=to(u);if(a.data.directives&&a.data.directives.some(oo)&&(a.data.show=!0),l&&l.data&&!function(e,t){return t.key===e.key&&t.tag===e.tag}(a,l)&&!Ut(l)&&(!l.componentInstance||!l.componentInstance._vnode.isComment)){var f=l.data.transition=A({},c);if("out-in"===r)return this._leaving=!0,it(f,"afterLeave",function(){t._leaving=!1,t.$forceUpdate()}),ro(e,o);if("in-out"===r){if(Ut(a))return u;var p,d=function(){p()};it(c,"afterEnter",d),it(c,"enterCancelled",d),it(f,"delayLeave",function(e){p=e})}}return o}}},so=A({tag:String,moveClass:String},eo);function co(e){e.elm._moveCb&&e.elm._moveCb(),e.elm._enterCb&&e.elm._enterCb()}function uo(e){e.data.newPos=e.elm.getBoundingClientRect()}function lo(e){var t=e.data.pos,n=e.data.newPos,r=t.left-n.left,i=t.top-n.top;if(r||i){e.data.moved=!0;var o=e.elm.style;o.transform=o.WebkitTransform="translate("+r+"px,"+i+"px)",o.transitionDuration="0s"}}delete so.mode;var fo={Transition:ao,TransitionGroup:{props:so,beforeMount:function(){var e=this,t=this._update;this._update=function(n,r){var i=Zt(e);e.__patch__(e._vnode,e.kept,!1,!0),e._vnode=e.kept,i(),t.call(e,n,r)}},render:function(e){for(var t=this.tag||this.$vnode.data.tag||"span",n=Object.create(null),r=this.prevChildren=this.children,i=this.$slots.default||[],o=this.children=[],a=no(this),s=0;s<i.length;s++){var c=i[s];c.tag&&null!=c.key&&0!==String(c.key).indexOf("__vlist")&&(o.push(c),n[c.key]=c,(c.data||(c.data={})).transition=a)}if(r){for(var u=[],l=[],f=0;f<r.length;f++){var p=r[f];p.data.transition=a,p.data.pos=p.elm.getBoundingClientRect(),n[p.key]?u.push(p):l.push(p)}this.kept=e(t,null,u),this.removed=l}return e(t,null,o)},updated:function(){var e=this.prevChildren,t=this.moveClass||(this.name||"v")+"-move";e.length&&this.hasMove(e[0].elm,t)&&(e.forEach(co),e.forEach(uo),e.forEach(lo),this._reflow=document.body.offsetHeight,e.forEach(function(e){if(e.data.moved){var n=e.elm,r=n.style;Ni(n,t),r.transform=r.WebkitTransform=r.transitionDuration="",n.addEventListener(Ai,n._moveCb=function e(r){r&&r.target!==n||r&&!/transform$/.test(r.propertyName)||(n.removeEventListener(Ai,e),n._moveCb=null,ji(n,t))})}}))},methods:{hasMove:function(e,t){if(!wi)return!1;if(this._hasMove)return this._hasMove;var n=e.cloneNode();e._transitionClasses&&e._transitionClasses.forEach(function(e){_i(n,e)}),gi(n,t),n.style.display="none",this.$el.appendChild(n);var r=Mi(n);return this.$el.removeChild(n),this._hasMove=r.hasTransform}}}};wn.config.mustUseProp=jn,wn.config.isReservedTag=Wn,wn.config.isReservedAttr=En,wn.config.getTagNamespace=Zn,wn.config.isUnknownElement=function(e){if(!z)return!0;if(Wn(e))return!1;if(e=e.toLowerCase(),null!=Gn[e])return Gn[e];var t=document.createElement(e);return e.indexOf("-")>-1?Gn[e]=t.constructor===window.HTMLUnknownElement||t.constructor===window.HTMLElement:Gn[e]=/HTMLUnknownElement/.test(t.toString())},A(wn.options.directives,Qi),A(wn.options.components,fo),wn.prototype.__patch__=z?zi:S,wn.prototype.$mount=function(e,t){return function(e,t,n){var r;return e.$el=t,e.$options.render||(e.$options.render=ve),Yt(e,"beforeMount"),r=function(){e._update(e._render(),n)},new fn(e,r,S,{before:function(){e._isMounted&&!e._isDestroyed&&Yt(e,"beforeUpdate")}},!0),n=!1,null==e.$vnode&&(e._isMounted=!0,Yt(e,"mounted")),e}(this,e=e&&z?Yn(e):void 0,t)},z&&setTimeout(function(){F.devtools&&ne&&ne.emit("init",wn)},0);var po=/\{\{((?:.|\r?\n)+?)\}\}/g,vo=/[-.*+?^${}()|[\]\/\\]/g,ho=g(function(e){var t=e[0].replace(vo,"\\$&"),n=e[1].replace(vo,"\\$&");return new RegExp(t+"((?:.|\\n)+?)"+n,"g")});var mo={staticKeys:["staticClass"],transformNode:function(e,t){t.warn;var n=Fr(e,"class");n&&(e.staticClass=JSON.stringify(n));var r=Ir(e,"class",!1);r&&(e.classBinding=r)},genData:function(e){var t="";return e.staticClass&&(t+="staticClass:"+e.staticClass+","),e.classBinding&&(t+="class:"+e.classBinding+","),t}};var yo,go={staticKeys:["staticStyle"],transformNode:function(e,t){t.warn;var n=Fr(e,"style");n&&(e.staticStyle=JSON.stringify(ai(n)));var r=Ir(e,"style",!1);r&&(e.styleBinding=r)},genData:function(e){var t="";return e.staticStyle&&(t+="staticStyle:"+e.staticStyle+","),e.styleBinding&&(t+="style:("+e.styleBinding+"),"),t}},_o=function(e){return(yo=yo||document.createElement("div")).innerHTML=e,yo.textContent},bo=p("area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr"),$o=p("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source"),wo=p("address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track"),Co=/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,xo=/^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,ko="[a-zA-Z_][\\-\\.0-9_a-zA-Z"+P.source+"]*",Ao="((?:"+ko+"\\:)?"+ko+")",Oo=new RegExp("^<"+Ao),So=/^\s*(\/?)>/,To=new RegExp("^<\\/"+Ao+"[^>]*>"),Eo=/^<!DOCTYPE [^>]+>/i,No=/^<!\--/,jo=/^<!\[/,Do=p("script,style,textarea",!0),Lo={},Mo={"&lt;":"<","&gt;":">","&quot;":'"',"&amp;":"&","&#10;":"\n","&#9;":"\t","&#39;":"'"},Io=/&(?:lt|gt|quot|amp|#39);/g,Fo=/&(?:lt|gt|quot|amp|#39|#10|#9);/g,Po=p("pre,textarea",!0),Ro=function(e,t){return e&&Po(e)&&"\n"===t[0]};function Ho(e,t){var n=t?Fo:Io;return e.replace(n,function(e){return Mo[e]})}var Bo,Uo,zo,Vo,Ko,Jo,qo,Wo,Zo=/^@|^v-on:/,Go=/^v-|^@|^:|^#/,Xo=/([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,Yo=/,([^,\}\]]*)(?:,([^,\}\]]*))?$/,Qo=/^\(|\)$/g,ea=/^\[.*\]$/,ta=/:(.*)$/,na=/^:|^\.|^v-bind:/,ra=/\.[^.\]]+(?=[^\]]*$)/g,ia=/^v-slot(:|$)|^#/,oa=/[\r\n]/,aa=/\s+/g,sa=g(_o),ca="_empty_";function ua(e,t,n){return{type:1,tag:e,attrsList:t,attrsMap:ma(t),rawAttrsMap:{},parent:n,children:[]}}function la(e,t){Bo=t.warn||Sr,Jo=t.isPreTag||T,qo=t.mustUseProp||T,Wo=t.getTagNamespace||T;t.isReservedTag;zo=Tr(t.modules,"transformNode"),Vo=Tr(t.modules,"preTransformNode"),Ko=Tr(t.modules,"postTransformNode"),Uo=t.delimiters;var n,r,i=[],o=!1!==t.preserveWhitespace,a=t.whitespace,s=!1,c=!1;function u(e){if(l(e),s||e.processed||(e=fa(e,t)),i.length||e===n||n.if&&(e.elseif||e.else)&&da(n,{exp:e.elseif,block:e}),r&&!e.forbidden)if(e.elseif||e.else)a=e,(u=function(e){var t=e.length;for(;t--;){if(1===e[t].type)return e[t];e.pop()}}(r.children))&&u.if&&da(u,{exp:a.elseif,block:a});else{if(e.slotScope){var o=e.slotTarget||'"default"';(r.scopedSlots||(r.scopedSlots={}))[o]=e}r.children.push(e),e.parent=r}var a,u;e.children=e.children.filter(function(e){return!e.slotScope}),l(e),e.pre&&(s=!1),Jo(e.tag)&&(c=!1);for(var f=0;f<Ko.length;f++)Ko[f](e,t)}function l(e){if(!c)for(var t;(t=e.children[e.children.length-1])&&3===t.type&&" "===t.text;)e.children.pop()}return function(e,t){for(var n,r,i=[],o=t.expectHTML,a=t.isUnaryTag||T,s=t.canBeLeftOpenTag||T,c=0;e;){if(n=e,r&&Do(r)){var u=0,l=r.toLowerCase(),f=Lo[l]||(Lo[l]=new RegExp("([\\s\\S]*?)(</"+l+"[^>]*>)","i")),p=e.replace(f,function(e,n,r){return u=r.length,Do(l)||"noscript"===l||(n=n.replace(/<!\--([\s\S]*?)-->/g,"$1").replace(/<!\[CDATA\[([\s\S]*?)]]>/g,"$1")),Ro(l,n)&&(n=n.slice(1)),t.chars&&t.chars(n),""});c+=e.length-p.length,e=p,A(l,c-u,c)}else{var d=e.indexOf("<");if(0===d){if(No.test(e)){var v=e.indexOf("--\x3e");if(v>=0){t.shouldKeepComment&&t.comment(e.substring(4,v),c,c+v+3),C(v+3);continue}}if(jo.test(e)){var h=e.indexOf("]>");if(h>=0){C(h+2);continue}}var m=e.match(Eo);if(m){C(m[0].length);continue}var y=e.match(To);if(y){var g=c;C(y[0].length),A(y[1],g,c);continue}var _=x();if(_){k(_),Ro(_.tagName,e)&&C(1);continue}}var b=void 0,$=void 0,w=void 0;if(d>=0){for($=e.slice(d);!(To.test($)||Oo.test($)||No.test($)||jo.test($)||(w=$.indexOf("<",1))<0);)d+=w,$=e.slice(d);b=e.substring(0,d)}d<0&&(b=e),b&&C(b.length),t.chars&&b&&t.chars(b,c-b.length,c)}if(e===n){t.chars&&t.chars(e);break}}function C(t){c+=t,e=e.substring(t)}function x(){var t=e.match(Oo);if(t){var n,r,i={tagName:t[1],attrs:[],start:c};for(C(t[0].length);!(n=e.match(So))&&(r=e.match(xo)||e.match(Co));)r.start=c,C(r[0].length),r.end=c,i.attrs.push(r);if(n)return i.unarySlash=n[1],C(n[0].length),i.end=c,i}}function k(e){var n=e.tagName,c=e.unarySlash;o&&("p"===r&&wo(n)&&A(r),s(n)&&r===n&&A(n));for(var u=a(n)||!!c,l=e.attrs.length,f=new Array(l),p=0;p<l;p++){var d=e.attrs[p],v=d[3]||d[4]||d[5]||"",h="a"===n&&"href"===d[1]?t.shouldDecodeNewlinesForHref:t.shouldDecodeNewlines;f[p]={name:d[1],value:Ho(v,h)}}u||(i.push({tag:n,lowerCasedTag:n.toLowerCase(),attrs:f,start:e.start,end:e.end}),r=n),t.start&&t.start(n,f,u,e.start,e.end)}function A(e,n,o){var a,s;if(null==n&&(n=c),null==o&&(o=c),e)for(s=e.toLowerCase(),a=i.length-1;a>=0&&i[a].lowerCasedTag!==s;a--);else a=0;if(a>=0){for(var u=i.length-1;u>=a;u--)t.end&&t.end(i[u].tag,n,o);i.length=a,r=a&&i[a-1].tag}else"br"===s?t.start&&t.start(e,[],!0,n,o):"p"===s&&(t.start&&t.start(e,[],!1,n,o),t.end&&t.end(e,n,o))}A()}(e,{warn:Bo,expectHTML:t.expectHTML,isUnaryTag:t.isUnaryTag,canBeLeftOpenTag:t.canBeLeftOpenTag,shouldDecodeNewlines:t.shouldDecodeNewlines,shouldDecodeNewlinesForHref:t.shouldDecodeNewlinesForHref,shouldKeepComment:t.comments,outputSourceRange:t.outputSourceRange,start:function(e,o,a,l,f){var p=r&&r.ns||Wo(e);q&&"svg"===p&&(o=function(e){for(var t=[],n=0;n<e.length;n++){var r=e[n];ya.test(r.name)||(r.name=r.name.replace(ga,""),t.push(r))}return t}(o));var d,v=ua(e,o,r);p&&(v.ns=p),"style"!==(d=v).tag&&("script"!==d.tag||d.attrsMap.type&&"text/javascript"!==d.attrsMap.type)||te()||(v.forbidden=!0);for(var h=0;h<Vo.length;h++)v=Vo[h](v,t)||v;s||(!function(e){null!=Fr(e,"v-pre")&&(e.pre=!0)}(v),v.pre&&(s=!0)),Jo(v.tag)&&(c=!0),s?function(e){var t=e.attrsList,n=t.length;if(n)for(var r=e.attrs=new Array(n),i=0;i<n;i++)r[i]={name:t[i].name,value:JSON.stringify(t[i].value)},null!=t[i].start&&(r[i].start=t[i].start,r[i].end=t[i].end);else e.pre||(e.plain=!0)}(v):v.processed||(pa(v),function(e){var t=Fr(e,"v-if");if(t)e.if=t,da(e,{exp:t,block:e});else{null!=Fr(e,"v-else")&&(e.else=!0);var n=Fr(e,"v-else-if");n&&(e.elseif=n)}}(v),function(e){null!=Fr(e,"v-once")&&(e.once=!0)}(v)),n||(n=v),a?u(v):(r=v,i.push(v))},end:function(e,t,n){var o=i[i.length-1];i.length-=1,r=i[i.length-1],u(o)},chars:function(e,t,n){if(r&&(!q||"textarea"!==r.tag||r.attrsMap.placeholder!==e)){var i,u,l,f=r.children;if(e=c||e.trim()?"script"===(i=r).tag||"style"===i.tag?e:sa(e):f.length?a?"condense"===a&&oa.test(e)?"":" ":o?" ":"":"")c||"condense"!==a||(e=e.replace(aa," ")),!s&&" "!==e&&(u=function(e,t){var n=t?ho(t):po;if(n.test(e)){for(var r,i,o,a=[],s=[],c=n.lastIndex=0;r=n.exec(e);){(i=r.index)>c&&(s.push(o=e.slice(c,i)),a.push(JSON.stringify(o)));var u=Ar(r[1].trim());a.push("_s("+u+")"),s.push({"@binding":u}),c=i+r[0].length}return c<e.length&&(s.push(o=e.slice(c)),a.push(JSON.stringify(o))),{expression:a.join("+"),tokens:s}}}(e,Uo))?l={type:2,expression:u.expression,tokens:u.tokens,text:e}:" "===e&&f.length&&" "===f[f.length-1].text||(l={type:3,text:e}),l&&f.push(l)}},comment:function(e,t,n){if(r){var i={type:3,text:e,isComment:!0};r.children.push(i)}}}),n}function fa(e,t){var n,r;(r=Ir(n=e,"key"))&&(n.key=r),e.plain=!e.key&&!e.scopedSlots&&!e.attrsList.length,function(e){var t=Ir(e,"ref");t&&(e.ref=t,e.refInFor=function(e){var t=e;for(;t;){if(void 0!==t.for)return!0;t=t.parent}return!1}(e))}(e),function(e){var t;"template"===e.tag?(t=Fr(e,"scope"),e.slotScope=t||Fr(e,"slot-scope")):(t=Fr(e,"slot-scope"))&&(e.slotScope=t);var n=Ir(e,"slot");n&&(e.slotTarget='""'===n?'"default"':n,e.slotTargetDynamic=!(!e.attrsMap[":slot"]&&!e.attrsMap["v-bind:slot"]),"template"===e.tag||e.slotScope||Nr(e,"slot",n,function(e,t){return e.rawAttrsMap[":"+t]||e.rawAttrsMap["v-bind:"+t]||e.rawAttrsMap[t]}(e,"slot")));if("template"===e.tag){var r=Pr(e,ia);if(r){var i=va(r),o=i.name,a=i.dynamic;e.slotTarget=o,e.slotTargetDynamic=a,e.slotScope=r.value||ca}}else{var s=Pr(e,ia);if(s){var c=e.scopedSlots||(e.scopedSlots={}),u=va(s),l=u.name,f=u.dynamic,p=c[l]=ua("template",[],e);p.slotTarget=l,p.slotTargetDynamic=f,p.children=e.children.filter(function(e){if(!e.slotScope)return e.parent=p,!0}),p.slotScope=s.value||ca,e.children=[],e.plain=!1}}}(e),function(e){"slot"===e.tag&&(e.slotName=Ir(e,"name"))}(e),function(e){var t;(t=Ir(e,"is"))&&(e.component=t);null!=Fr(e,"inline-template")&&(e.inlineTemplate=!0)}(e);for(var i=0;i<zo.length;i++)e=zo[i](e,t)||e;return function(e){var t,n,r,i,o,a,s,c,u=e.attrsList;for(t=0,n=u.length;t<n;t++)if(r=i=u[t].name,o=u[t].value,Go.test(r))if(e.hasBindings=!0,(a=ha(r.replace(Go,"")))&&(r=r.replace(ra,"")),na.test(r))r=r.replace(na,""),o=Ar(o),(c=ea.test(r))&&(r=r.slice(1,-1)),a&&(a.prop&&!c&&"innerHtml"===(r=b(r))&&(r="innerHTML"),a.camel&&!c&&(r=b(r)),a.sync&&(s=Br(o,"$event"),c?Mr(e,'"update:"+('+r+")",s,null,!1,0,u[t],!0):(Mr(e,"update:"+b(r),s,null,!1,0,u[t]),C(r)!==b(r)&&Mr(e,"update:"+C(r),s,null,!1,0,u[t])))),a&&a.prop||!e.component&&qo(e.tag,e.attrsMap.type,r)?Er(e,r,o,u[t],c):Nr(e,r,o,u[t],c);else if(Zo.test(r))r=r.replace(Zo,""),(c=ea.test(r))&&(r=r.slice(1,-1)),Mr(e,r,o,a,!1,0,u[t],c);else{var l=(r=r.replace(Go,"")).match(ta),f=l&&l[1];c=!1,f&&(r=r.slice(0,-(f.length+1)),ea.test(f)&&(f=f.slice(1,-1),c=!0)),Dr(e,r,i,o,f,c,a,u[t])}else Nr(e,r,JSON.stringify(o),u[t]),!e.component&&"muted"===r&&qo(e.tag,e.attrsMap.type,r)&&Er(e,r,"true",u[t])}(e),e}function pa(e){var t;if(t=Fr(e,"v-for")){var n=function(e){var t=e.match(Xo);if(!t)return;var n={};n.for=t[2].trim();var r=t[1].trim().replace(Qo,""),i=r.match(Yo);i?(n.alias=r.replace(Yo,"").trim(),n.iterator1=i[1].trim(),i[2]&&(n.iterator2=i[2].trim())):n.alias=r;return n}(t);n&&A(e,n)}}function da(e,t){e.ifConditions||(e.ifConditions=[]),e.ifConditions.push(t)}function va(e){var t=e.name.replace(ia,"");return t||"#"!==e.name[0]&&(t="default"),ea.test(t)?{name:t.slice(1,-1),dynamic:!0}:{name:'"'+t+'"',dynamic:!1}}function ha(e){var t=e.match(ra);if(t){var n={};return t.forEach(function(e){n[e.slice(1)]=!0}),n}}function ma(e){for(var t={},n=0,r=e.length;n<r;n++)t[e[n].name]=e[n].value;return t}var ya=/^xmlns:NS\d+/,ga=/^NS\d+:/;function _a(e){return ua(e.tag,e.attrsList.slice(),e.parent)}var ba=[mo,go,{preTransformNode:function(e,t){if("input"===e.tag){var n,r=e.attrsMap;if(!r["v-model"])return;if((r[":type"]||r["v-bind:type"])&&(n=Ir(e,"type")),r.type||n||!r["v-bind"]||(n="("+r["v-bind"]+").type"),n){var i=Fr(e,"v-if",!0),o=i?"&&("+i+")":"",a=null!=Fr(e,"v-else",!0),s=Fr(e,"v-else-if",!0),c=_a(e);pa(c),jr(c,"type","checkbox"),fa(c,t),c.processed=!0,c.if="("+n+")==='checkbox'"+o,da(c,{exp:c.if,block:c});var u=_a(e);Fr(u,"v-for",!0),jr(u,"type","radio"),fa(u,t),da(c,{exp:"("+n+")==='radio'"+o,block:u});var l=_a(e);return Fr(l,"v-for",!0),jr(l,":type",n),fa(l,t),da(c,{exp:i,block:l}),a?c.else=!0:s&&(c.elseif=s),c}}}}];var $a,wa,Ca={expectHTML:!0,modules:ba,directives:{model:function(e,t,n){var r=t.value,i=t.modifiers,o=e.tag,a=e.attrsMap.type;if(e.component)return Hr(e,r,i),!1;if("select"===o)!function(e,t,n){var r='var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return '+(n&&n.number?"_n(val)":"val")+"});";r=r+" "+Br(t,"$event.target.multiple ? $$selectedVal : $$selectedVal[0]"),Mr(e,"change",r,null,!0)}(e,r,i);else if("input"===o&&"checkbox"===a)!function(e,t,n){var r=n&&n.number,i=Ir(e,"value")||"null",o=Ir(e,"true-value")||"true",a=Ir(e,"false-value")||"false";Er(e,"checked","Array.isArray("+t+")?_i("+t+","+i+")>-1"+("true"===o?":("+t+")":":_q("+t+","+o+")")),Mr(e,"change","var $$a="+t+",$$el=$event.target,$$c=$$el.checked?("+o+"):("+a+");if(Array.isArray($$a)){var $$v="+(r?"_n("+i+")":i)+",$$i=_i($$a,$$v);if($$el.checked){$$i<0&&("+Br(t,"$$a.concat([$$v])")+")}else{$$i>-1&&("+Br(t,"$$a.slice(0,$$i).concat($$a.slice($$i+1))")+")}}else{"+Br(t,"$$c")+"}",null,!0)}(e,r,i);else if("input"===o&&"radio"===a)!function(e,t,n){var r=n&&n.number,i=Ir(e,"value")||"null";Er(e,"checked","_q("+t+","+(i=r?"_n("+i+")":i)+")"),Mr(e,"change",Br(t,i),null,!0)}(e,r,i);else if("input"===o||"textarea"===o)!function(e,t,n){var r=e.attrsMap.type,i=n||{},o=i.lazy,a=i.number,s=i.trim,c=!o&&"range"!==r,u=o?"change":"range"===r?Wr:"input",l="$event.target.value";s&&(l="$event.target.value.trim()"),a&&(l="_n("+l+")");var f=Br(t,l);c&&(f="if($event.target.composing)return;"+f),Er(e,"value","("+t+")"),Mr(e,u,f,null,!0),(s||a)&&Mr(e,"blur","$forceUpdate()")}(e,r,i);else if(!F.isReservedTag(o))return Hr(e,r,i),!1;return!0},text:function(e,t){t.value&&Er(e,"textContent","_s("+t.value+")",t)},html:function(e,t){t.value&&Er(e,"innerHTML","_s("+t.value+")",t)}},isPreTag:function(e){return"pre"===e},isUnaryTag:bo,mustUseProp:jn,canBeLeftOpenTag:$o,isReservedTag:Wn,getTagNamespace:Zn,staticKeys:function(e){return e.reduce(function(e,t){return e.concat(t.staticKeys||[])},[]).join(",")}(ba)},xa=g(function(e){return p("type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap"+(e?","+e:""))});function ka(e,t){e&&($a=xa(t.staticKeys||""),wa=t.isReservedTag||T,function e(t){t.static=function(e){if(2===e.type)return!1;if(3===e.type)return!0;return!(!e.pre&&(e.hasBindings||e.if||e.for||d(e.tag)||!wa(e.tag)||function(e){for(;e.parent;){if("template"!==(e=e.parent).tag)return!1;if(e.for)return!0}return!1}(e)||!Object.keys(e).every($a)))}(t);if(1===t.type){if(!wa(t.tag)&&"slot"!==t.tag&&null==t.attrsMap["inline-template"])return;for(var n=0,r=t.children.length;n<r;n++){var i=t.children[n];e(i),i.static||(t.static=!1)}if(t.ifConditions)for(var o=1,a=t.ifConditions.length;o<a;o++){var s=t.ifConditions[o].block;e(s),s.static||(t.static=!1)}}}(e),function e(t,n){if(1===t.type){if((t.static||t.once)&&(t.staticInFor=n),t.static&&t.children.length&&(1!==t.children.length||3!==t.children[0].type))return void(t.staticRoot=!0);if(t.staticRoot=!1,t.children)for(var r=0,i=t.children.length;r<i;r++)e(t.children[r],n||!!t.for);if(t.ifConditions)for(var o=1,a=t.ifConditions.length;o<a;o++)e(t.ifConditions[o].block,n)}}(e,!1))}var Aa=/^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/,Oa=/\([^)]*?\);*$/,Sa=/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/,Ta={esc:27,tab:9,enter:13,space:32,up:38,left:37,right:39,down:40,delete:[8,46]},Ea={esc:["Esc","Escape"],tab:"Tab",enter:"Enter",space:[" ","Spacebar"],up:["Up","ArrowUp"],left:["Left","ArrowLeft"],right:["Right","ArrowRight"],down:["Down","ArrowDown"],delete:["Backspace","Delete","Del"]},Na=function(e){return"if("+e+")return null;"},ja={stop:"$event.stopPropagation();",prevent:"$event.preventDefault();",self:Na("$event.target !== $event.currentTarget"),ctrl:Na("!$event.ctrlKey"),shift:Na("!$event.shiftKey"),alt:Na("!$event.altKey"),meta:Na("!$event.metaKey"),left:Na("'button' in $event && $event.button !== 0"),middle:Na("'button' in $event && $event.button !== 1"),right:Na("'button' in $event && $event.button !== 2")};function Da(e,t){var n=t?"nativeOn:":"on:",r="",i="";for(var o in e){var a=La(e[o]);e[o]&&e[o].dynamic?i+=o+","+a+",":r+='"'+o+'":'+a+","}return r="{"+r.slice(0,-1)+"}",i?n+"_d("+r+",["+i.slice(0,-1)+"])":n+r}function La(e){if(!e)return"function(){}";if(Array.isArray(e))return"["+e.map(function(e){return La(e)}).join(",")+"]";var t=Sa.test(e.value),n=Aa.test(e.value),r=Sa.test(e.value.replace(Oa,""));if(e.modifiers){var i="",o="",a=[];for(var s in e.modifiers)if(ja[s])o+=ja[s],Ta[s]&&a.push(s);else if("exact"===s){var c=e.modifiers;o+=Na(["ctrl","shift","alt","meta"].filter(function(e){return!c[e]}).map(function(e){return"$event."+e+"Key"}).join("||"))}else a.push(s);return a.length&&(i+=function(e){return"if(!$event.type.indexOf('key')&&"+e.map(Ma).join("&&")+")return null;"}(a)),o&&(i+=o),"function($event){"+i+(t?"return "+e.value+"($event)":n?"return ("+e.value+")($event)":r?"return "+e.value:e.value)+"}"}return t||n?e.value:"function($event){"+(r?"return "+e.value:e.value)+"}"}function Ma(e){var t=parseInt(e,10);if(t)return"$event.keyCode!=="+t;var n=Ta[e],r=Ea[e];return"_k($event.keyCode,"+JSON.stringify(e)+","+JSON.stringify(n)+",$event.key,"+JSON.stringify(r)+")"}var Ia={on:function(e,t){e.wrapListeners=function(e){return"_g("+e+","+t.value+")"}},bind:function(e,t){e.wrapData=function(n){return"_b("+n+",'"+e.tag+"',"+t.value+","+(t.modifiers&&t.modifiers.prop?"true":"false")+(t.modifiers&&t.modifiers.sync?",true":"")+")"}},cloak:S},Fa=function(e){this.options=e,this.warn=e.warn||Sr,this.transforms=Tr(e.modules,"transformCode"),this.dataGenFns=Tr(e.modules,"genData"),this.directives=A(A({},Ia),e.directives);var t=e.isReservedTag||T;this.maybeComponent=function(e){return!!e.component||!t(e.tag)},this.onceId=0,this.staticRenderFns=[],this.pre=!1};function Pa(e,t){var n=new Fa(t);return{render:"with(this){return "+(e?Ra(e,n):'_c("div")')+"}",staticRenderFns:n.staticRenderFns}}function Ra(e,t){if(e.parent&&(e.pre=e.pre||e.parent.pre),e.staticRoot&&!e.staticProcessed)return Ha(e,t);if(e.once&&!e.onceProcessed)return Ba(e,t);if(e.for&&!e.forProcessed)return za(e,t);if(e.if&&!e.ifProcessed)return Ua(e,t);if("template"!==e.tag||e.slotTarget||t.pre){if("slot"===e.tag)return function(e,t){var n=e.slotName||'"default"',r=qa(e,t),i="_t("+n+(r?","+r:""),o=e.attrs||e.dynamicAttrs?Ga((e.attrs||[]).concat(e.dynamicAttrs||[]).map(function(e){return{name:b(e.name),value:e.value,dynamic:e.dynamic}})):null,a=e.attrsMap["v-bind"];!o&&!a||r||(i+=",null");o&&(i+=","+o);a&&(i+=(o?"":",null")+","+a);return i+")"}(e,t);var n;if(e.component)n=function(e,t,n){var r=t.inlineTemplate?null:qa(t,n,!0);return"_c("+e+","+Va(t,n)+(r?","+r:"")+")"}(e.component,e,t);else{var r;(!e.plain||e.pre&&t.maybeComponent(e))&&(r=Va(e,t));var i=e.inlineTemplate?null:qa(e,t,!0);n="_c('"+e.tag+"'"+(r?","+r:"")+(i?","+i:"")+")"}for(var o=0;o<t.transforms.length;o++)n=t.transforms[o](e,n);return n}return qa(e,t)||"void 0"}function Ha(e,t){e.staticProcessed=!0;var n=t.pre;return e.pre&&(t.pre=e.pre),t.staticRenderFns.push("with(this){return "+Ra(e,t)+"}"),t.pre=n,"_m("+(t.staticRenderFns.length-1)+(e.staticInFor?",true":"")+")"}function Ba(e,t){if(e.onceProcessed=!0,e.if&&!e.ifProcessed)return Ua(e,t);if(e.staticInFor){for(var n="",r=e.parent;r;){if(r.for){n=r.key;break}r=r.parent}return n?"_o("+Ra(e,t)+","+t.onceId+++","+n+")":Ra(e,t)}return Ha(e,t)}function Ua(e,t,n,r){return e.ifProcessed=!0,function e(t,n,r,i){if(!t.length)return i||"_e()";var o=t.shift();return o.exp?"("+o.exp+")?"+a(o.block)+":"+e(t,n,r,i):""+a(o.block);function a(e){return r?r(e,n):e.once?Ba(e,n):Ra(e,n)}}(e.ifConditions.slice(),t,n,r)}function za(e,t,n,r){var i=e.for,o=e.alias,a=e.iterator1?","+e.iterator1:"",s=e.iterator2?","+e.iterator2:"";return e.forProcessed=!0,(r||"_l")+"(("+i+"),function("+o+a+s+"){return "+(n||Ra)(e,t)+"})"}function Va(e,t){var n="{",r=function(e,t){var n=e.directives;if(!n)return;var r,i,o,a,s="directives:[",c=!1;for(r=0,i=n.length;r<i;r++){o=n[r],a=!0;var u=t.directives[o.name];u&&(a=!!u(e,o,t.warn)),a&&(c=!0,s+='{name:"'+o.name+'",rawName:"'+o.rawName+'"'+(o.value?",value:("+o.value+"),expression:"+JSON.stringify(o.value):"")+(o.arg?",arg:"+(o.isDynamicArg?o.arg:'"'+o.arg+'"'):"")+(o.modifiers?",modifiers:"+JSON.stringify(o.modifiers):"")+"},")}if(c)return s.slice(0,-1)+"]"}(e,t);r&&(n+=r+","),e.key&&(n+="key:"+e.key+","),e.ref&&(n+="ref:"+e.ref+","),e.refInFor&&(n+="refInFor:true,"),e.pre&&(n+="pre:true,"),e.component&&(n+='tag:"'+e.tag+'",');for(var i=0;i<t.dataGenFns.length;i++)n+=t.dataGenFns[i](e);if(e.attrs&&(n+="attrs:"+Ga(e.attrs)+","),e.props&&(n+="domProps:"+Ga(e.props)+","),e.events&&(n+=Da(e.events,!1)+","),e.nativeEvents&&(n+=Da(e.nativeEvents,!0)+","),e.slotTarget&&!e.slotScope&&(n+="slot:"+e.slotTarget+","),e.scopedSlots&&(n+=function(e,t,n){var r=e.for||Object.keys(t).some(function(e){var n=t[e];return n.slotTargetDynamic||n.if||n.for||Ka(n)}),i=!!e.if;if(!r)for(var o=e.parent;o;){if(o.slotScope&&o.slotScope!==ca||o.for){r=!0;break}o.if&&(i=!0),o=o.parent}var a=Object.keys(t).map(function(e){return Ja(t[e],n)}).join(",");return"scopedSlots:_u(["+a+"]"+(r?",null,true":"")+(!r&&i?",null,false,"+function(e){var t=5381,n=e.length;for(;n;)t=33*t^e.charCodeAt(--n);return t>>>0}(a):"")+")"}(e,e.scopedSlots,t)+","),e.model&&(n+="model:{value:"+e.model.value+",callback:"+e.model.callback+",expression:"+e.model.expression+"},"),e.inlineTemplate){var o=function(e,t){var n=e.children[0];if(n&&1===n.type){var r=Pa(n,t.options);return"inlineTemplate:{render:function(){"+r.render+"},staticRenderFns:["+r.staticRenderFns.map(function(e){return"function(){"+e+"}"}).join(",")+"]}"}}(e,t);o&&(n+=o+",")}return n=n.replace(/,$/,"")+"}",e.dynamicAttrs&&(n="_b("+n+',"'+e.tag+'",'+Ga(e.dynamicAttrs)+")"),e.wrapData&&(n=e.wrapData(n)),e.wrapListeners&&(n=e.wrapListeners(n)),n}function Ka(e){return 1===e.type&&("slot"===e.tag||e.children.some(Ka))}function Ja(e,t){var n=e.attrsMap["slot-scope"];if(e.if&&!e.ifProcessed&&!n)return Ua(e,t,Ja,"null");if(e.for&&!e.forProcessed)return za(e,t,Ja);var r=e.slotScope===ca?"":String(e.slotScope),i="function("+r+"){return "+("template"===e.tag?e.if&&n?"("+e.if+")?"+(qa(e,t)||"undefined")+":undefined":qa(e,t)||"undefined":Ra(e,t))+"}",o=r?"":",proxy:true";return"{key:"+(e.slotTarget||'"default"')+",fn:"+i+o+"}"}function qa(e,t,n,r,i){var o=e.children;if(o.length){var a=o[0];if(1===o.length&&a.for&&"template"!==a.tag&&"slot"!==a.tag){var s=n?t.maybeComponent(a)?",1":",0":"";return""+(r||Ra)(a,t)+s}var c=n?function(e,t){for(var n=0,r=0;r<e.length;r++){var i=e[r];if(1===i.type){if(Wa(i)||i.ifConditions&&i.ifConditions.some(function(e){return Wa(e.block)})){n=2;break}(t(i)||i.ifConditions&&i.ifConditions.some(function(e){return t(e.block)}))&&(n=1)}}return n}(o,t.maybeComponent):0,u=i||Za;return"["+o.map(function(e){return u(e,t)}).join(",")+"]"+(c?","+c:"")}}function Wa(e){return void 0!==e.for||"template"===e.tag||"slot"===e.tag}function Za(e,t){return 1===e.type?Ra(e,t):3===e.type&&e.isComment?(r=e,"_e("+JSON.stringify(r.text)+")"):"_v("+(2===(n=e).type?n.expression:Xa(JSON.stringify(n.text)))+")";var n,r}function Ga(e){for(var t="",n="",r=0;r<e.length;r++){var i=e[r],o=Xa(i.value);i.dynamic?n+=i.name+","+o+",":t+='"'+i.name+'":'+o+","}return t="{"+t.slice(0,-1)+"}",n?"_d("+t+",["+n.slice(0,-1)+"])":t}function Xa(e){return e.replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}new RegExp("\\b"+"do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,super,throw,while,yield,delete,export,import,return,switch,default,extends,finally,continue,debugger,function,arguments".split(",").join("\\b|\\b")+"\\b");function Ya(e,t){try{return new Function(e)}catch(n){return t.push({err:n,code:e}),S}}function Qa(e){var t=Object.create(null);return function(n,r,i){(r=A({},r)).warn;delete r.warn;var o=r.delimiters?String(r.delimiters)+n:n;if(t[o])return t[o];var a=e(n,r),s={},c=[];return s.render=Ya(a.render,c),s.staticRenderFns=a.staticRenderFns.map(function(e){return Ya(e,c)}),t[o]=s}}var es,ts,ns=(es=function(e,t){var n=la(e.trim(),t);!1!==t.optimize&&ka(n,t);var r=Pa(n,t);return{ast:n,render:r.render,staticRenderFns:r.staticRenderFns}},function(e){function t(t,n){var r=Object.create(e),i=[],o=[];if(n)for(var a in n.modules&&(r.modules=(e.modules||[]).concat(n.modules)),n.directives&&(r.directives=A(Object.create(e.directives||null),n.directives)),n)"modules"!==a&&"directives"!==a&&(r[a]=n[a]);r.warn=function(e,t,n){(n?o:i).push(e)};var s=es(t.trim(),r);return s.errors=i,s.tips=o,s}return{compile:t,compileToFunctions:Qa(t)}})(Ca),rs=(ns.compile,ns.compileToFunctions);function is(e){return(ts=ts||document.createElement("div")).innerHTML=e?'<a href="\n"/>':'<div a="\n"/>',ts.innerHTML.indexOf("&#10;")>0}var os=!!z&&is(!1),as=!!z&&is(!0),ss=g(function(e){var t=Yn(e);return t&&t.innerHTML}),cs=wn.prototype.$mount;return wn.prototype.$mount=function(e,t){if((e=e&&Yn(e))===document.body||e===document.documentElement)return this;var n=this.$options;if(!n.render){var r=n.template;if(r)if("string"==typeof r)"#"===r.charAt(0)&&(r=ss(r));else{if(!r.nodeType)return this;r=r.innerHTML}else e&&(r=function(e){if(e.outerHTML)return e.outerHTML;var t=document.createElement("div");return t.appendChild(e.cloneNode(!0)),t.innerHTML}(e));if(r){var i=rs(r,{outputSourceRange:!1,shouldDecodeNewlines:os,shouldDecodeNewlinesForHref:as,delimiters:n.delimiters,comments:n.comments},this),o=i.render,a=i.staticRenderFns;n.render=o,n.staticRenderFns=a}}return cs.call(this,e,t)},wn.compile=rs,wn});
*/

//alert("navigation.js");
if(typeof layerControls=='undefined'){ var layerControls = {}; }// Object containing one control for each map on page.

if(typeof dataObject == 'undefined') {
    var dataObject = {};
}

// localObject.geo will save a list of loaded counties for multiple states
if(typeof localObject == 'undefined') { var localObject = {};}
localObject.us_stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78};

if(typeof localObject.stateCountiesLoaded == 'undefined') {
    localObject.stateCountiesLoaded = []; // Holds a geo code for each state and province loaded. (but not actual counties)
    // Later: localObject.stateZipsLoaded
}
if(typeof localObject.geo == 'undefined') {
    localObject.geo = []; // Holds counties. Should this also be {} ?
}

// Load localObject.layers for later use when showApps clicked
// Also adds state hash for layers requiring a state.
//callInitSiteObject(1); // replaced by 

function hashChanged() {
    let loadGeomap = false;
    let hash = getHash(); // Might still include changes to hiddenhash
    console.log("hashChanged() navigation.js");
    populateFieldsFromHash();
    productList("01","99","All Harmonized System Categories"); // Sets title for new HS hash.

    let stateAbbrev = "";
    if (hash.statename) { // From Tabulator state list, convert to 2-char abbrviation
        //alert("hash.statename1 " + hash.statename);
        //alert("hiddenhash.statename1 " + hiddenhash.statename);
        waitForElm('#state_select').then((elm) => {
            //theState = $("#state_select").find(":selected").val();
            //stateAbbrev = $("#state_select[name=\"" + hash.statename + "\"]").val();
            stateAbbrev = $('#state_select option:contains(' + hash.statename + ')').val();
            $("#state_select").val(stateAbbrev);
            //alert("hiddenhash.state " + hiddenhash.state);
            hiddenhash.statename = "";
            goHash({'state':stateAbbrev,'statename':''});
        });
        return;
    }

    if (hash.state) {
        stateAbbrev = hash.state.split(",")[0].toUpperCase();
        waitForElm('#state_select').then((elm) => {
            $("#state_select").val(stateAbbrev);
        });      
        // Apply early since may be used by changes to geo
        $("#state_select").val(stateAbbrev);
        if (priorHash.state && hash.state != priorHash.state) {
            console.log("hitRefreshNote is now turned off")
            //$("#hitRefreshNote").show();
        }
    } else {
        //$(".locationTabText").text("United States");
    }
    if (hash.state != priorHash.state) {
        waitForElm('#state_select').then((elm) => {
            //alert("hash.state " + hash.state + " stateAbbrev: " + stateAbbrev);
            if (stateAbbrev) {
                $("#state_select").val(stateAbbrev);
            } else {
                $("#state_select").val("");
            }
        });
    }
    if (priorHash.show && hash.show !== priorHash.show) {
        hideSide("list");
    } else if (hash.state !== priorHash.state) {
        hideSide("list");

        // Seemed to get repopulated with Georgia.
        //$(".listTitle").hide(); // Recyclers
        //alert("test2")
    }
    if (hash.show != priorHash.show) {
        if (hash.show && priorHash.show) {
            console.log("Close location filter, show new layer.");
            closeLocationFilter();
        }
        if (!hash.appview) {
            waitForElm('.showApps').then((elm) => {
                // Same as in closeAppsMenu(), but calling that function from here generates blank page
                $("#bigThumbPanelHolder").hide();
                $(".showApps").removeClass("filterClickActive");
            });
        }
        loadScript(theroot + 'js/map.js', function(results) {
        });

        //if (hash.show == priorHash.show) {
        //  hash.show = ""; // Clear the suppliers display
        //}
        if (priorHash.show) {
          $(".listTitle").empty();
          $(".catList").empty();
        } else if (!hash.show) {
            hideSide("list");
        }
        delete hash.naics; // Since show value invokes new hiddenhash
        clearHash("naics");
        //getNaics_setHiddenHash(hash.show); // Sets hiddenhash.naics for use by other widgets.

        //hash.naics = ""; // Since go value invokes hiddenhash
        // Then we call applyIO at end of this hashChanged function


        //$(document).ready(function() {
            if (hash.show != "vehicles") {
                $("#introframe").hide();
            }
            if (hash.show != "ppe" || hash.show != "suppliers") {
                $(".layerclass.ppe").hide();
            }
            if (hash.show != "opendata") {
                $(".layerclass.opendata").hide();
            }

            //$("#tableSide").hide();

            if ($("#navcolumn .catList").is(":visible")) {
                $("#selected_states").hide();
            }

            $(".layerclass." + hash.show).show();
        //});
    }

    /*
    if (hash.geomap) {
        //$("#infoColumn").show();
        $(".mainColumn1").show();
    }
    if (hash.geomap != priorHash.geomap) {
        //if (hash.geomap) {
            $("#aboutToolsDiv").hide();
            //$("#infoColumn").show();
            $("#geomap").show();
            
            // DOES NOT WORK - document.querySelector(whichmap)._leaflet_map not found
            //reloadMapTiles('#geomap',1);
            
            alert("renderMapShapes")
            renderMapShapes();
            
            
            //alert("show map")
            //if (document.querySelector('#geomap')._leaflet_map) {
            //  alert("redraw map")
            //  document.querySelector('#geomap')._leaflet_map.invalidateSize(); // Refresh map tiles.
            //}
            
            
        //} else {
        //  $("#geomap").hide();
        //  $("#aboutToolsDiv").show();
        //}
    }
    */

    // To remove
    /*
    if (hash.show != priorHash.show) {
        if (hash.show == "farmfresh") {
            $(".data-section").show();
        } else if (hash.show == "suppliers") {
            $(".data-section").show();
            $(".suppliers").show();
        } else {
            $(".data-section").hide();
            $(".suppliers").hide();
        }
    }
    */

    let mapCenter = [];
    let zoom = 4; // Wide for entire US
    // Before hash.state to utilize initial lat/lon
    if (hash.lat != priorHash.lat || hash.lon != priorHash.lon) {
        //alert("hash.lat " + hash.lat + " priorHash.lat " + priorHash.lat)
        $("#lat").val(hash.lat);
        $("#lon").val(hash.lon);
        mapCenter = [hash.lat,hash.lon];
    }
    if (hash.state != priorHash.state) {
        // If map is already loaded, recenter map.  See same thing below
        // Get lat/lon from state dropdown #state_select

        // Potential BugBug - this runs after initial map load, not needed (but okay as long as zoom is not set).
        
        // Similar resides in map.js for ds
        
        // Used for map2
        /*
        if($("#state_select").find(":selected").val()) {
            let theState = $("#state_select").find(":selected").val();
            if (theState != "") {
              let kilometers_wide = $("#state_select").find(":selected").attr("km");
              zoom = zoomFromKm(kilometers_wide); // In map.js
              let lat = $("#state_select").find(":selected").attr("lat");
              let lon = $("#state_select").find(":selected").attr("lon");
              //alert("lat " + lat + " lon " + lon)
              mapCenter = [lat,lon];
            }
        } else {
            console.log("ERROR #state_select not available");
        }
        console.log("Recenter map " + mapCenter)
        */

        //showThumbMenu(hash.show, "#bigThumbMenu");
    }
    if (hash.state) {
        $(".showforstates").show();
    } else {
        $(".showforstates").hide();
    }
    
    if (mapCenter.length > 0) { // Set when hash.lat changes
        //if (typeof L != "undefined") {
        if (typeof L.DomUtil === "object") {
            // Avoiding including ",5" for zoom since 7 is already set. 
            // NOT IDEAL: This also runs during init.
            // TODO: If reactiveating, omit on init, or pass in default zoom.
            /*
            console.log("Recenter map zoom " + zoom)
            let pagemap = document.querySelector('#map1')._leaflet_map; // Recall existing map
            let pagemap_container = L.DomUtil.get(pagemap);
            if (pagemap_container != null) {
                // Test here: http://localhost:8887/localsite/info/embed.html#state=GA
              pagemap.flyTo(mapCenter, zoom);
            }
            */
            if (typeof document.querySelector('#map2') === 'undefined' || typeof document.querySelector('#map2') === 'null') {
                console.log("#map2 undefined");
            } else if (document.querySelector('#map2')) {

                let pagemap2 = document.querySelector('#map2')._leaflet_map; // Recall existing map
                let pagemap_container2 = L.DomUtil.get(pagemap2);
                // This will not be reachable on initial load.
                if (pagemap_container2 != null) {
                  pagemap2.flyTo(mapCenter);

                }
            }
        } else {
            console.log("ERROR lat changed for map2, but leaflet not loaded. typeof L undefined.");
        }
    }
    
    if (hash.geoview && hash.geoview != priorHash.geoview) {
        $("#geoview_select").val(hash.geoview);

        /*
        // Tabulator list is already updated before adjacent geomap is rendered.
	    if (hash.geoview == "state" && hash.state) {
	    	console.log("Call1 locationFilterChange counties");
	        locationFilterChange("counties");
	    } else {
	        //console.log("Call locationFilterChange with no value")
	        //locationFilterChange("");
	    }
		*/
    }

    if (hash.state != priorHash.state) {
    	if (hash.geoview) {
        	loadGeomap = true;
    	}
        if(location.host.indexOf('model.georgia') >= 0) {
            if (hash.state != "" && hash.state.split(",")[0].toUpperCase() != "GA") { // If viewing other state, use model.earth
                let goModelEarth = "https://model.earth" + window.location.pathname + window.location.search + window.location.hash;
                window.location = goModelEarth;
            }
        }

        $("#state_select").val(stateAbbrev);

        if (hash.state != "GA") {
            $(".regionFilter").hide();
            $(".geo-limited").hide();
        } else {
            $(".regionFilter").show();
            $(".geo-US13").show();
        }
        if(location.host.indexOf('localhost') >= 0) {
            //alert("localhost hash.state " + hash.state);
        }
        if (hash.state && hash.state.length == 2 && !($("#filterLocations").is(':visible'))) {
            $(".locationTabText").text($("#state_select").find(":selected").text());
        } else {
            $(".locationTabText").text("Locations");
            //$("#filterLocations").hide();
            //$("#industryListHolder").hide(); // Remove once national naics are loaded.
        }

        //&& hash.geoview == "state"
        if (hash.geoview && hash.geoview == priorHash.geoview) { // Prevents dup loading when hash.geoview != priorHash.geoview below.
            if (hash.geoview != "earth") {
                console.log("loadStateCounties invoked by state change");
                loadStateCounties(0); // Add counties to state boundaries.
            }
        }
    }

    if (hash.geoview != priorHash.geoview || (priorHash.state && !hash.state)) {
        //alert("Load geoview")
        
        /*
        if (hash.geoview) {
        	openMapLocationFilter();
        }
        */
        if (hash.geoview == "state" || hash.geoview == "country") {
            console.log("loadStateCounties invoked by geoview change");
            console.log("priorHash.geoview: " + priorHash.geoview + ", hash.geoview: " + hash.geoview);
            loadStateCounties(0);

            if (hash.geoview == "country" && !hash.state) {
                //if (onlineApp) {
                    let element = {};
                    element.scope = "state";
                    //element.datasource = "https://model.earth/beyond-carbon-scraper/fused/result.json"; // Also loaded in apps/js/bc.js
                    element.datasource = local_app.modelearth_root() + "/localsite/info/data/map-filters/us-states.json";
                    element.columns = [
                        {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                        {title:"State", field:"jurisdiction"},
                        {title:"Population", field:"population", hozAlign:"right", headerSortStartingDir:"desc", formatter:"money", formatterParams:{precision:false}},
                        {title:"CO<sub>2</sub> per capita", field:"CO2_per_capita", hozAlign:"right", formatter:"money", formatterParams:{precision:false}},
                    ];
                    console.log("columns for country, including per capita");
                    // Displays tabulator list of states, but USA map shapes turned red.
                    if (hash.geoview == "country") {
                        loadObjectData(element, 0);
                    } else if (hash.geoview == "state" && !hash.state) {
                        loadObjectData(element, 0); // Display tabulator list of states.
                    }
                    //$("#tabulator-geocredit").show();
                //}
            }
        } else if (hash.geoview == "earth" || hash.geoview == "countries") {
            let element = {};
            element.scope = "countries";
            element.key = "Country Code";
            //element.datasource = "https://model.earth/country-data/population/population-total.csv";
            element.datasource = local_app.modelearth_root() + "/localsite/info/data/map-filters/country-populations.csv";
            element.columns = [
                    {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                    {title:"Country Name", field:"Country Name"},
                    {title:"2010", field:"2010", hozAlign:"right", headerSortStartingDir:"desc", formatter:"money", formatterParams:{precision:false}},
                    {title:"2020", field:"2020", hozAlign:"right", headerSortStartingDir:"desc", formatter:"money", formatterParams:{precision:false}}
                ];
            loadObjectData(element, 0);
        } else { // For backing up within apps
            console.log("NO MAPVIEW");
            if (typeof relocatedStateMenu != "undefined") {
                relocatedStateMenu.appendChild(state_select); // For apps hero
            }
            $("#hero_holder").show();
        }
    }
    if (hash.geoview == "earth") {
        $("#state_select").hide();
    } else if (hash.geoview == "country") {
        if (hash.geoview != priorHash.geoview) {
            //alert("country");
            ///$("#geoPicker").show(); // Required for map to load
            $("#state_select").show();
        }
    } else if (hash.geoview == "state") {
        $("#state_select").show();
    } else if (!hash.geoview && priorHash.geoview) {
        closeLocationFilter();
    }

    //Resides before geo
    if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state || hash.show != priorHash.show) {
        let theStateName;

        //alert("hash.regiontitle  " + hash.regiontitle);

        // Don't use, needs a waitfor
        if ($("#state_select").find(":selected").value) {
            theStateName = $("#state_select").find(":selected").text();
        }
        if (theStateName != "") {
            $(".statetitle").text(theStateName);
            $(".regiontitle").text(theStateName);
            $(".locationTabText").text(theStateName);
            local_app.loctitle = theStateName;
        } else if (hash.state) {
            //let multiStateString = hash.state.replace(",",", ") + " - USA";
            let multiStateString = hash.state + " USA";
            $(".statetitle").text(multiStateString);
            $(".regiontitle").text(multiStateString);
            $(".locationTabText").text(multiStateString);
            local_app.loctitle = multiStateString;
        } else {
            local_app.loctitle = "USA";
            $(".statetitle").text("US");
            $(".regiontitle").text("United States");
            $(".locationTabText").text("United States");
        }

        //alert("hash.regiontitle " + hash.regiontitle);
        if(!hash.regiontitle) {
            //alert("OKAY hash.geo before: " + hash.geo);
            delete hiddenhash.loctitle;
            delete hiddenhash.geo;
            //alert("BUG hash.geo after: " + hash.geo);
            //delete param.geo;
            $(".regiontitle").text("");
            // Could add full "United States" from above. Could display longer "show" manufacing title.
            let appTitle = $("#showAppsText").attr("title");
            console.log("appTitle: " + appTitle);

            let showTitle;
            if (hash.show) {
                /*
                if (appTitle) {
                    $("#pageTitle").text(appTitle); // Ex: Parts Manufacturing
                } else {
                    ////$(".region_service").text(hash.show.toTitleCase());
                    $("#pageTitle").text(hash.show.toTitleCase());
                }
                */
                showTitle = hash.show.toTitleCase();
            }


            if (hash.show && local_app.loctitle) {
                $(".region_service").text(local_app.loctitle + " - " + hash.show.toTitleCase());
                
            } else if (hash.state) {

                $(".region_service").text(hash.state); // While waiting for full state name
                waitForElm('#state_select').then((elm) => {
                    //$("#state_select").val(stateAbbrev);
                    console.log("fetch theStateName from #state_select");
                    //$("#state_select").val(hash.state.split(",")[0].toUpperCase());

                    if ($("#state_select").find(":selected").val()) { // Omits top which has no text
                        theStateName = $("#state_select").find(":selected").text();
                        console.log("fetched " + theStateName);
                        $(".region_service").text(theStateName + " Industries");
                        if (showTitle) {
                            $(".region_service").text(theStateName + " - " + hash.show.toTitleCase());
                        }
                    }

                    if (hash.show && param.display == "everything") { // Limitig to everything since /map page does not load layers, or need longer title.
                        let layer = hash.show;

                        /* Bug waitForSubObject is not finding localObject layers
                        waitForSubObject('localObject','layers', function() { 
                        //waitForObjectProperty('localObject','layers', function() { 
                            if (localObject.layers[layer] && localObject.layers[layer].section) {
                                let section = localObject.layers[layer].section;
                                updateRegionService(section);
                            }
                        });
                        */
                        //setTimeout(() => { // Works
                        //    alert("localObject.layers " + localObject.layers[layer].section);
                        //},3000);
                    }
                });

                /*
                if (theStateName) {
                    $(".region_service").text(theStateName);
                } else {
                    $(".region_service").text(hash.state);
                }
                */
            } else {
                ////$(".region_service").text("Top " + $(".locationTabText").text() + " Industries");
            }
            if (appTitle) {

                /*
                // Under development
                alert(document.title);
                let siteAppTitle = appTitle;
                //if (document.title != siteAppTitle) {
                    document.title = siteAppTitle;
                //}
                alert(document.title);
                */
            }
        } else {
            //alert("hash.regiontitle1 " + hash.regiontitle);
            hiddenhash.loctitle = hash.regiontitle;
            $(".regiontitle").text(hash.regiontitle);
            if (hash.show) {
                $(".region_service").text(hash.regiontitle + " - " + hash.show.toTitleCase());
            } else {
                $(".region_service").text(hash.regiontitle);
            }
            $(".locationTabText").text(hash.regiontitle.replace(/\+/g," "));
            local_app.loctitle = hash.regiontitle.replace(/\+/g," ");
            
            $(".regiontitle").val(hash.regiontitle.replace(/\+/g," "));
            hiddenhash.geo = $("#region_select option:selected").attr("geo");
            hash.geo = $("#region_select option:selected").attr("geo");
            //hash.geo = hiddenhash.geo;
            
            try {
                params.geo = hiddenhash.geo; // Used by old naics.js
            } catch(e) {
                console.log("Remove params.geo after upgrading naics.js " + e);
            }
        }
    }

    
    // Not sure if we need this
    if (hash.geo != priorHash.geo) {
        if (hash.geo && hash.geo.length > 4) { 
            $(".state-view").hide();
            $(".county-view").show();
            //$(".industry_filter_settings").show(); // temp
        } else {
            $(".county-view").hide();
            $(".state-view").show();
            //$(".industry_filter_settings").hide(); // temp
        }
        if (hash.geo) {
            if (hash.geo.split(",").length >= 3) {
                $("#top-content-columns").addClass("top-content-columns-wide");
            } else {
                $("#top-content-columns").removeClass("top-content-columns-wide");
            }
        } else {
            $(".mainColumn1").show();
        }

        let clearall = false;
        if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state) {
            //clearall = true;
        }
        if($("#geomap").is(':visible')){
            if (hash.geoview != "country") {
                //alert("updateSelectedTableRows 2"); // Might need this delay.
                updateSelectedTableRows(hash.geo, clearall, 0);
            }
        }

        // TEST
        //dataObject.stateshown = getStateFips(hash);
        
        /*
        if (hash.geo) {
            alert("hash geo");
            loadGeos(hash.geo,0,function(results) {
                alert("test3");
            });
        }
        */
        //loadGeomap = true; // No longer showing map when just geo.
    }

    $(".locationTabText").attr("title",$(".locationTabText").text());
    if (hash.cat != priorHash.cat) {
        changeCat(hash.cat)
    }
    if (hash.catsort) {
        $("#catsort").val(hash.catsort);
    }
    if (hash.catsize) {
        $("#catsize").val(hash.catsize);
    }
    if (hash.catmethod) {
        $("#catmethod").val(hash.catmethod);
    }
    if (hash.indicators != priorHash.indicators) {
        //alert("Selected hash.indicators " + hash.indicators);
        //$("#indicators").prop("selectedIndex", 0).value("Selected hash.indicators " + hash.indicators);

        //$("#indicators").prepend("<option value='" + hash.indicators + "' selected='selected'>" + hash.indicators + "</option>");
       $("#indicators").val(hash.indicators);
       if (!$("#indicators").val()) { // Select first one
           $('#indicators option').each(function () {
                if ($(this).css('display') != 'none') {
                    $(this).prop("selected", true);
                    return false;
                }
            });
        }

        /*
        if (hash.indicators) {
           $('#indicators option').each(function () {
                if ($(this).val() == 'JOBS' || $(this).val() == 'VADD') {
                    $(this).prop("selected", true);
                    alert("select")
                    //return false;
                }
            });
        }
        */
    }

	if (hash.state != priorHash.state) {
		// Load state hero graphic
        let theStateName; // Full name of state.
        let theStateNameLowercase;
        let imageUrl;
        if (hash.state) {
            let stateAbbrev = hash.state.split(",")[0].toUpperCase();
            waitForElm('#state_select').then((elm) => {
                $("#state_select").val(stateAbbrev);
                if ($("#state_select").find(":selected").val()) { // Omits top which has no text
                    theStateName = $("#state_select").find(":selected").text();
                    //theState = $("#state_select").find(":selected").val();
                }
                if (theStateName && theStateName.length > 0) {
                    theStateNameLowercase = theStateName.toLowerCase();
                    imageUrl = "https://model.earth/us-states/images/backgrounds/1280x720/landscape/" + theStateNameLowercase.replace(/\s+/g, '-') + ".jpg";
                    if (theStateNameLowercase == "georgia") {
                    	imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                    }
                    if (theStateName.length == 0) {
                    	imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                    }
                } else {
                    imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                }
                let imageUrl_scr = "url(" + imageUrl + ")";
                //alert("imageUrl_scr  " + imageUrl_scr)
                $("#hero-landscape-image").css('background-image', imageUrl_scr);
            });
        }
    }
    if (hash.show != priorHash.show) {
    	let show = hash.show;
    	if (!hash.show) {
    		show = "industries";
    	}
		//if (activeLayer) {
			$(".bigThumbMenuContent").removeClass("bigThumbActive");
	    	$(".bigThumbMenuContent[show='" + show +"']").addClass("bigThumbActive");
	    	let activeTitle = $(".bigThumbMenuContent[show='" + show +"'] .bigThumbText").text();
	    	$("#showAppsText").attr("title",activeTitle);
	    //}
	}
    if (hash.imgview != priorHash.imgview) {
        if (hash.imgview == "state") {
            loadScript('/apps/js/apps-menus.js', function(results) {
                showHeroMenu("feature", {}, "my_site");
            });
        }
    }
	if (hash.appview != priorHash.appview) {
        if (hash.appview) {
            console.log("hash.appview exists: " + hash.appview);
            //navigationJsLoaded
            waitForVariable('navigationJsLoaded', function() {
                showApps("#bigThumbMenu");
            });
        } else {
            closeAppsMenu();
        }
    }
    if (hash.geoview != priorHash.geoview) {
    	filterLocationChange();
    }
    if (hash.sidetab != priorHash.sidetab) {
    	showSideTabs();
    	if(priorHash.sidetab == "locale") {
    		//alert("hide locale")
    	}
    }
    if (hash.locpop != priorHash.locpop) {
    	if(hash.locpop){
			popAdvanced();
		} else {
			hideAdvanced();
		}
	}

    if (hash.geoview != priorHash.geoview) {

        //$("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
        //$("#geomap").show(); // To trigger map filter display below.
        if (hash.geoview && hash.geoview != "earth") {
            $("#nullschoolHeader").hide();
        }
        waitForElm('#state_select').then((elm) => {
	        if (!hash.geoview || hash.geoview == "none") {
	            $("#geoPicker").hide();
	            $(".stateFilters").hide();
	        } else {
	            $("#geoPicker").show();
	            $(".stateFilters").show();
	        }
       	});
        if (hash.geoview == "earth") {
            showGlobalMap("https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037");
        } else if (hash.geoview) {
            loadGeomap = true;

            // if ((priorHash.sidetab == "locale" && hash.sidetab != "locale") || (priorHash.locpop  && !hash.locpop)) {
            
                // Closing sidetab or locpop, move geomap back to holder.
                $("#filterLocations").prependTo($("#locationFilterHolder")); // Move back from sidetabs
                $("#geomap").appendTo($("#geomapHolder")); // Move back from sidetabs

                if (!hash.sidetab) { // For when clicking on Location top tab
                    $("#locationFilterHolder").show();
                    loadGeomap = true;
                }
            //}

        } else {
            //alert("#filterLocations hide")
            $("#filterLocations").hide();
            //$("#geoPicker").hide();
        }
    }
    if (hash.locpop != priorHash.locpop) {
        if (hash.locpop) {
            loadGeomap = true;
        }
    }
    $(".regiontitle").text(local_app.loctitle);
    $(".service_title").text(local_app.loctitle + " - " + local_app.showtitle);
    if (loadGeomap) {
        // TO DO: Should we avoid reloading if already loaded for a state?  Occurs when hash.locpop & changes.

        //$("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
        //if($("#geomap").is(':visible')){
        waitForElm('#geomap').then((elm) => {
            //alert("loadGeomap")
            console.log("call renderMapShapes from navigation.js hashChanged()");
            renderMapShapes("geomap", hash, "county", 1); // County select map
        });
        //}
    }
}
function hideSide(which) {
    console.log("hideSide " + which);
    if (which == "list") {
        $("#listcolumn").hide();
        if ($("#listcolumnList").text().trim().length > 0) {
            $("#showListInBar").show();
        }
    } else {
        $("#navcolumn").hide();
        $('body').removeClass('bodyLeftMarginFull');
        if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
            if ($("#listcolumn").is(':visible')) {
                $('#listcolumn').addClass('listcolumnOnly');
                console.log("addClass bodyLeftMarginList");
                $('body').addClass('bodyLeftMarginList');
            }
        }
    }
    if (!$("#navcolumn").is(':visible') && !$("#listcolumn").is(':visible')) {
        $("#showNavColumn").show();$("#showSideInBar").hide();
        $("#sideIcons").show();
    } else if (!$("#navcolumn").is(':visible') && $("#listcolumn").is(':visible')) {
        $("#showSideInBar").show();
    }
    if (!$("#navcolumn").is(':visible')) {
        $('body').removeClass('bodyLeftMargin');
    }
    if (!$("#listcolumn").is(':visible')) {
        $('body').removeClass('bodyLeftMarginList');
    }
    if (!$("#navcolumn").is(':visible') || !$("#listcolumn").is(':visible')) {
        $('body').removeClass('bodyLeftMarginFull');
    }
    if (!$('body').hasClass('bodyRightMargin')) {
        $('body').removeClass('mobileView');
    }
    // Might not need this with mobile

    // Stopped working after reconfuring to load map1 and map2 with same function.
    /*
    if (document.querySelector('#map1')._leaflet_map) {
        document.querySelector('#map1')._leaflet_map.invalidateSize(); // Refresh map tiles.
    }
    if (document.querySelector('#map2')._leaflet_map) {
        document.querySelector('#map2')._leaflet_map.invalidateSize(); // Refresh map tiles.
    }
    */
    // Works instead
    if ($("#map1").text().trim().length > 1) {
        if (map1) {
            map1.invalidateSize(); // Refresh map tiles.
        }
    }
    if ($("#map2").text().trim().length > 1) {
        if (map2) {
            map2.invalidateSize(); // Refresh map tiles.
        }
    }
}
function popAdvanced() {
    waitForElm('#filterLocations').then((elm) => {
                
        console.log("popAdvanced");
        closeSideTabs();
        /*
        loadScript(theroot + 'js/map.js', function(results) {
            loadScript(theroot + 'js/navigation.js', function(results) { // For pages without
                goHash({'geoview':'state'});
                //filterClickLocation();
            });
        });
        */
        $("#filterClickLocation").removeClass("filterClickActive");
        $("#filterLocations").appendTo($("#locationFilterPop"));
        $("#draggableSearch").show();
    });
}
function showSideTabs() {
    consoleLog("showSideTabs() in navigation.js");
	waitForElm('#sideTabs').then((elm) => {
		let hash = getHash();
		
		if (hash.sidetab) {
			$('body').addClass('bodyRightMargin'); // Creates margin on right for fixed sidetabs.
			$('body').addClass('mobileView');
			$(".rightTopMenuInner div").removeClass("active");
			$(".menuExpanded").hide(); // Hide any open
			if (hash.sidetab == "sections") {
				//showSections();
				$(".showSections").addClass("active");
				$("#sectionsPanel").show();
			} else if (hash.sidetab == "seasons") {
				$(".showSeasons").addClass("active");
				$("#seasonsPanel").show();
			} else if (hash.sidetab == "topics") {
				showTopics();
			} else if (hash.sidetab == "locale") {
				showLocale();
			} else if (hash.sidetab == "settings") {
				$(".showSettings").addClass("active");
			    $(".settingsPanel").show();
			} else if (hash.sidetab == "desktop") {
				$(".showDesktop").addClass("active");
			    $("#desktopPanel").show();
			} else if (hash.sidetab == "account") {
				$(".showAccount").addClass("active");
			    $("#accountPanel").show();
			} else {
				//$("#sideTabs").show();
			}
			$("#sideTabs").show();
		} else {
			$('body').removeClass('bodyRightMargin'); // Creates margin on right for fixed sidetabs.
			$('body').removeClass('mobileView');
			$("#sideTabs").hide();
		}
	});
}
function populateFieldsFromHash() {
    let hash = getHash();
	$("#keywordsTB").val(hash.q);
    waitForElm('#mainCatList').then((elm) => {
        consoleLog("#mainCatList ready for use with cat: " + hash.cat);
    	//$('.catList > div').removeClass('catListSelected');
    	if (hash.cat) {
    		var catString = hash.cat.replace(/_/g, ' ');
            $("#catSearch").val(catString);
    	    $('.catList > div').filter(function(){
    	        return $(this).text() === catString
    	    }).addClass('catListSelected');
    	}
    });
	/*
	// This occurs in showList when checkboxes are added.
	if (param["search"]) {
		//$(".selected_col").prop('checked', false);
		alert("deselect")
		let search = param["search"].split(",");
		for(var i = 0 ; i < search.length ; i++) {
			if($("#" + search[i]).length) {
				alert(search[i]);
				//$("#" + search[i]).prop('checked', true);
				$("#items").prop('checked', true);
			}
		}
	}
	*/
	$("#productCodes").val(hash.hs);
	if (hash.region) {
		if (hash.show) {
			$(".regiontitle").val(hash.region + " - " + hash.show.toTitleCase());
		} else {
			$(".regiontitle").val(hash.region);
		}
	}
}
// var param = loadParams(location.search,location.hash); // This occurs in localsite.js


// INIT
//alert("hey")
//$(".showSearch").css("display","inline-block");
//$(".showSearch").removeClass("local");

catArray = [];
$(document).ready(function () {

	// Gets overwritten
	if (param.state) {
	    $("#state_select").val(param.state.split(",")[0]);
	}
	
	// The following can be reactivated
    /*
    alert(local_app.modelearth_root() + '/localsite/js/d3.v5.min.js'); // Is model.earth used to avoid CORS error? Better to avoid and move harmonized-system.txt in localsite repo.
    loadScript(local_app.modelearth_root() + '/localsite/js/d3.v5.min.js', function(results) {

        // This avoids cross domain CORS error      
        
            d3.text(local_app.community_data_root() + 'global/hs/harmonized-system.txt').then(function(data) {
                if(location.host.indexOf('localhost') >= 0) {
                    console.log("Loaded Harmonized System (HS) codes - harmonized-system.txt");
                }
                let catLines = d3.csvParseRows(data);
                //alert(catLines.length)
                for(var i = 0; i < catLines.length; i++) {
                    catArray.push([catLines[i][0], catLines[i][1]]);
                }

                //catLines.forEach(function(element) {
                //  //catArray.push([element.substr(0,4), element.substr(5)]);
                //  catArray.push([element[0], element.[1]]);
                //});
                ////$('#mainCats > div:nth-child(11)').trigger("click"); // Specific category

                productList("01","99","Harmonized System (HS) Product Categories")

            });
        

        // Would this be usable? Old, find newer perhaps
        // https://github.com/FengJun-dev/harmonized-system
    });
    */


    /*
    // cross domain CORS error
	$.get(local_app.community_data_root() + 'global/hs/harmonized-system.txt', function(data) {

		var catLines = data.split("\n");
		
		catLines.forEach(function(element) {
		  // 
		  catArray.push([element.substr(0,4), element.substr(5)]);
		});
		//$('#mainCats > div:nth-child(11)').trigger("click"); // Specific category
		productList("01","99","Harmonized System (HS) Product Categories")
	}, 'text');
    */

	//populateFieldsFromHash();
	$("#productCodes").css('width','200px');

	$('#catListHolderShow').click(function () {
		if ($('#catsMobile').css('display') == 'none') {
			$('#catsMobile').show();
			$('#catListHolderShow').text('Hide Categories');
			$('#tableSide').removeClass('hideCatsMobile');
		} else {
			$('#catsMobile').hide();
			$('#catListHolderShow').text('Product Categories');
			$('#tableSide').addClass('hideCatsMobile');
		}
    });

	
	$('#hsCatList > div').click(function () {
		//consoleLog('.menuRectLink click ' + $(this).attr("data-section").toLowerCase());
        $('#hsCatList > div').css('border', 'solid 1px #fff');
        //$('#mainCats > div:first-child').css('background-color', '#3B99FC');
        $(this).css('border', 'solid 1px #aaa');

        var attr = $(this).attr("range");
        if (typeof attr !== typeof undefined && attr !== false) {
	        //productList($(this).html().substr(0,2), $(this).html().substr(3,2), $(this).html().substr(6));
	        // + " (HS " + $(this).attr("range").replace("-","00 to ") + "00)"
	        productList($(this).attr("range").substr(0,2), $(this).attr("range").substr(3,2), $(this).html());

	        $('#topPanel').show();
	        $('#allProductCats').show();
	    }
        event.stopPropagation();
    });
	$('#allProductCats, #subcatHeader').click(function () {
		$('#hsCatList').show();
		$('#allProductCats').hide();
		$("#subcatHeader").html("Harmonized System (HS) Product Categories");
		$('#hsCatList > div').css('border', 'solid 1px #fff');
		productList("01","99","Harmonized System (HS) Product Categories");
	});
	$('#botButton').click(function () {
		if ($('#botPanel').css('display') === 'none') {
        	$('#botPanel').show();
    	} else {
    		$('#botPanel').hide();
    	}
       	//$(".fieldSelector").hide();
        event.stopPropagation();
    });
    $(document).on("click", "#mapButton", function(event) {
		if ($('#mapPanel').css('display') === 'none') {
        	$('#mapPanel').show();
    	} else {
    		$('#mapPanel').hide();
    	}
       	$("#introText").hide();
        event.stopPropagation();
    });
    $(document).on("click", "#topPanel", function(event) {
    	event.stopPropagation(); // Allows HS codes to remain visible when clicking in panel.
    });

    $('#mainCats > div').each(function(index) { // Initial load
    	$(this).attr("text", $(this).text());
    });
    $(document).on("click", "#catSearch", function(event) {
        alert("#catSearch click - #toppanel has been deactivated and moved to map/index-categories.html")
    	if ($('#topPanel').css('display') === 'none') {
            
			$('#productSubcats').css("max-height","300px");
			$('#topPanelFooter').show();
        	$('#topPanel').show();
        	$('#introText').hide();
        	$('#mainCats > div').each(function(index) {
	        	if ($(this).attr("range")) {
	        		$(this).html($(this).attr("text") + ' (' + $(this).attr("range") + ')');
	        	}
        	});
    	} else {
    		$('#topPanel').hide();
    		$('#mainCats > div').each(function(index) {
    			if ($(this).attr("range")) {
	        		$(this).html($(this).attr("text"));
	        	}
        	});
    	}
       	$(".fieldSelector").hide();
       	event.stopPropagation();
    });

	$('#productCodes').click(function () {
		// Needs to be changed after replacing/moving with #catSearch above.
		if ($('#topPanel').css('display') === 'none') {
			$('#productSubcats').css("max-height","300px");
			$('#topPanelFooter').show();
        	$('#topPanel').show();
        	$('#introText').hide();
        	$('#mainCats > div').each(function(index) {
	        	if ($(this).attr("range")) {
	        		$(this).html($(this).attr("text") + ' (' + $(this).attr("range") + ')');
	        	}
        	});

    	} else {
    		//$('#topPanel').hide();
    		$('#mainCats > div').each(function(index) {
    			if ($(this).attr("range")) {
	        		$(this).html($(this).attr("text"));
	        	}
        	});
    	}
       	$(".fieldSelector").hide();
       	event.stopPropagation();
    });

    
	/*
	$(".filterUL li").click(function(e) {
		//$(".filterBubbleHolder").hide();
		e.preventDefault();
		$(".filterUL li").removeClass("selected");
		$(this).addClass("selected");
		//$(".locationTabText").html($(this).text() + '<i class="entypo-down-open" style="font-size:13pt"></i>');
		$("#filterClickLocation .locationTabText").html($(this).text()).data('selected', $(this).data('id'));
		$("#locationDD option[value='" + $(this).data('id') + "']").prop("selected", true).trigger("change");
		
		$("#locationStatus").hide();
		//alert($(this).data('id'));
        consoleLog("Call locationFilterChange from .filterUL li click: " + $(this).data('id'));
        locationFilterChange($(this).data('id'),$(this).attr('geo'));
        goHash({"filter":$(this).data('id'),"geo":$(this).attr('geo')}, false);

		//$(".fieldSelector").hide(); // Close loc menu
		e.stopPropagation(); // Prevents click on containing #filterClickLocation.
	 });
	*/
    $('#topPanelFooter').click(function () {
    	$('#productSubcats').css("max-height","none");
    	$('#topPanelFooter').hide();
    	event.stopPropagation();
    });

	$('#searchloc').click(function () {
    	event.stopPropagation();
    });
    $(document).on("change", "#geoview_select", function(event) {
        if (this.value == "countries" || this.value == "earth") {
            hiddenhash.state = "";
            goHash({"geoview":this.value,"state":"",});
        } else {
            goHash({"geoview":this.value});
        }
        
    });
	$('.selected_state').on('change', function() {
		//alert("selected_state " + this.getAttribute("id"))
		$("#state_select").val(this.getAttribute("id"));
	    goHash({'name':'','state':this.getAttribute("id")}); // triggers renderMapShapes("geomap", hash); // County select map
	});
 	$('#region_select').on('change', function() {
 		//alert($(this).attr("geo"))
 	    //goHash({'regiontitle':this.value,'lat':this.options[this.selectedIndex].getAttribute('lat'),'lon':this.options[this.selectedIndex].getAttribute('lon'),'geo':this.options[this.selectedIndex].getAttribute('geo')});
 		hiddenhash.geo = this.options[this.selectedIndex].getAttribute('geo');
        console.log("hiddenhash.geo " + hiddenhash.geo);
        delete hash.geo;
        delete param.geo;
        try {
	        delete params.geo; // Used by old naics.js
	    } catch(e) {
	    	console.log("Remove params.geo after upgrading naics.js " + e);
	    }
        //params.geo = hiddenhash.geo; // Used by naics.js
        local_app.latitude = this.options[this.selectedIndex].getAttribute('lat');
        local_app.longitude = this.options[this.selectedIndex].getAttribute('lon');
        goHash({'regiontitle':this.value,'geo':''});
	});

 	/*
 	<li><a onClick="goHash({
    'regiontitle':'West+Central+Georgia',
    'geo':'US13045,US13077,US13143,US13145,US13149,US13199,US13223,US13233,US13263,US13285,US01111,US01017', 
    'lat':'33.0362',
    'lon':'-85.0322'
    }); $('.fieldSelector').hide(); return false;" href="#regiontitle=West+Central+Georgia&geo=US13045,US13077,US13143,US13145,US13149,US13199,US13223,US13233,US13263,US13285,US01111,US01017">West&nbsp;Central</a></li>
    <!-- Smaller region: US13077,US13145,US13149,US13199,US13263,US13285 -->

    <li><a onClick="goHash({
    'regiontitle':'Central+Georgia',
    'geo':'US13023,US13043,US13091,US13109,US13167,US13175,US13209,US13267,US13271,US13279,US13283,US13309,US13315,US13107,US13235', 
    'lat':'33.0362',
    'lon':'-85.0322'
    }); $('.fieldSelector').hide(); return false;" href="#regiontitle=Central+Georgia&geo=US13023,US13043,US13091,US13109,US13167,US13175,US13209,US13267,US13271,US13279,US13283,US13309,US13315,US13107,US13235">Central</a></li>

    <li><a onClick="goHash({
    'regiontitle':'Southeast+Coastal+Georgia',
    'geo':'US13001,US13005,US13127,US13161,US13229,US13305', 
    'lat':'31.1891',
    'lon':'-81.4979'
    }); $('.fieldSelector').hide(); return false;" href="#regiontitle=Southeast+Coastal+Georgia&geo=US13001,US13005,US13127,US13161,US13229,US13305&lat=31.1891&lon=-81.4980">Southeast Coastal</a></li>
 	*/
    
    $(document).click(function(event) { // Hide open menus
    	console.log("document click -  Hide open menus")
    	if ( !$(event.target).closest( "#goSearch" ).length ) {
    		// BUGBUG - Reactivate after omitting clicks within location selects
    		//$(".fieldSelector").hide(); // Avoid since this occurs when typing text in search field.
    	}
    	$('#keywordFields').hide();
    	$('#topPanel').hide();
	});
	$(document).on("click", "body", function(event) {
        if ($("#navcolumn").is(":visible") && window.innerWidth < 1200) { 
            $('#navcolumn').hide();
            $("#showNavColumn").show();$("#showSideInBar").hide();
            $("#sideIcons").show();
            $('body').removeClass('bodyLeftMargin');
            $('body').removeClass('bodyLeftMarginFull');
            $('body').removeClass('bodyLeftMarginNone'); // For DS side over hero
            if (!$('body').hasClass('bodyRightMargin')) {
                $('body').removeClass('mobileView');
            }
        }
    });

	function hideNonListPanels() {
        goHash({"geoview":""});
		$(".fieldSelector").hide(); // Avoid since this occurs when typing text in search field.
    	$('#topPanel').hide();
    	$("#introText").hide();
    	$("#mapPanel").hide(); $("#filterClickLocation").removeClass("filterClickActive");
    	if(location.host.indexOf('localhost') >= 0) {
    		$('#mapButton').show();
    	}
    }
    $(document).on("click", "#goSearch", function(event) {
        let hash = getHash();
        let searchQuery = $('#keywordsTB').val();
        console.log("Search for " + searchQuery);
        let search = $('.selected_col:checked').map(function() {return this.id;}).get().join(',');
        // TODO: set search to empty array if all search boxes are checked.
        if(!hash.show && location.href.indexOf('/localsite/info/') < 0) {
            // TODO: Remove geoview
            window.location = "/localsite/info/" + location.hash;
            return;
        }
        goHash({"q":searchQuery,"search":search,"geoview":""}); // triggers hash change event.
        event.stopPropagation();
   	});

    $(document).on("click", "#keywordsTB", function(event) {
		if ($("#keywordFields").is(':visible')) {
			$("#keywordFields").hide();
		} else {
			$("#filterLocations").hide();
            if (!$("#selected_col_checkboxes").is(':empty')) {
			 $("#keywordFields").show();
            }
		}
	    event.stopPropagation();
   	});
   	$("#findWhat, #productCodeHolder").click(function() { /* Stop drilldown */
	    event.stopPropagation();
   	});
   	$("#hideCatPanel").click(function() {
   		$("#mainCats").hide();
   		//$("#hideCatPanel").hide();
   		$("#showCatPanel").show();
	    event.stopPropagation();
   	});
   	$("#showCatPanel").click(function() {
   		$("#showCatPanel").hide();
   		$("#mainCats").show();
	    event.stopPropagation();
   	});
   	$("#hideBotPanel").click(function() {
	    $("#botPanel").hide();
	    event.stopPropagation();
   	});
   	$("#hideTopPanel").click(function() {
	    $("#topPanel").hide();
   	});
   	$("#hideMapPanel").click(function() {
	    $("#mapPanel").hide();
	    $("#mapButton").show();
	    event.stopPropagation();
   	});

   	
   	$(".showLocMenu").click(function() {
	    $(".locMenu").show();
   	});
   	$("#hideSidemap").click(function() {
	    $("#sidemapCard").hide();
	    $("#detaillist > .detail").css("border","none");
   	});

   	function clearFields() {
   		$(".eWidget").show();
   		hideNonListPanels();
   		//$('#industryCatList > div').removeClass('catListSelected');
   		$("#keywordsTB").val("");
   		$("#catSearch").val("");
   		$("#productCodes").val("");
   		$("#productCatTitle").html("");
   		$("#eTable_alert").hide();
   		$("#mainframe").hide();
   		$("#filterClickLocation").removeClass("filterClickActive");
   		$(".output_table input").prop('checked',false); // geo counties
   		$("input[name='hs']").prop('checked',false);
   		$("input[name='in']").prop('checked',true);
   	}
    clearButtonClick = function () { // Allow return false to be passed back.

        clearFields();
        clearHash("cat,search,q,geo,name"); // Avoids triggering hash change
        //dataObject.geos = null; // Loaded when geo is in hash on init, to avoid time to place hidden checkboxes.
        //history.pushState("", document.title, window.location.pathname);
        //loadHtmlTable(true); // New list

        let hash = getHash();
        goHash(hash); // Now trigger the hash change
        return false; // Deactivates a href
    }
   	$("#clearButton").click(function() {
   		clearButtonClick();
   	});
   	$("#botGo").click(function() {
   		alert("Chat Bot under development.");
   	});
   	
   	$('showMap').click(function () {

   	});
   	$('#toggleList').click(function () {
		if ($('#dataList').css('display') != 'none') {
			$('#dataGrid').show();
        	$('#dataList').hide();
    	} else {
    		$('#dataList').show();
    		$('#dataGrid').hide();
    	}
       	//event.stopPropagation();
    });
    function escapeRegExp(str) {
    	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
    function replaceAll(str, find, replace) {
    	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
	}
   	$('#requestInfo').click(function () {
   		var checkedCompaniesArray = $('[name="contact"]:checked').map(function() {return replaceAll(this.value,",","");}).get();
   		var checkedCompanies = checkedCompaniesArray.join(', ').trim();
   		if (checkedCompaniesArray.length <= 0) {
   			alert("Select one or more companies to pre-fill our request form.");
   			return;
   		}
   		else if (checkedCompaniesArray.length > 10) {
   			alert("Please reduce your selected companies to 10 or less. You've selected " + checkedCompaniesArray.length + ".");
   			return;
   		}
   		//alert("Please select 1 to 10 exporters to request contact info.\r(Under development, please return soon. Thank you!)")
   		//window.location = "https://www.cognitoforms.com/GDECD1/ExportGeorgiaUSARequestForSupplierIntroduction";

   		


   		window.open(
		  'https://www.cognitoforms.com/GDECD1/ExportGeorgiaUSARequestForSupplierIntroduction?entry={"RequestForIntroduction":{"Suppliers":"' + checkedCompanies + '"}}',
		  '_blank' // open in a new tab.
		);
   	});
   	$('#addCompany').click(function () {
   		//window.location="exporters/add";
   		window.open(
		  'exporters/add',
		  '_blank' // open in a new tab.
		);
   	});
});

function productList(startRange, endRange, text) {
	// Displays Harmonized System (HS) subcategories
	// To Do: Lazyload file when initially requested - when #catSearch is clicked.

    // BUGBUG - called twice, sometimes without catArray.
    //alert("catArray.length " + catArray.length)

	if (!$("#productCodes").length) {
		return;
	}
	$("#productSubcats").html("");
	$("#productCatTitle").html("");
	console.log("productList " + startRange + ' to ' + endRange + " " + text);
	$("#subcatHeader").html(text);

	console.log("pcodes: " + $("#productCodes").val())
	var productcodes = $("#productCodes").val().replace(";",",");
	var productcode_array = productcodes.split(/\s*,\s*/); // Removes space when splitting on comma
	//alert("productcode_array " + productcode_array[0].length);

	if (catArray.length > 0) {
		$("#catRowCount").html(catArray.length);
		$("#botWelcome").show();
	}
	//console.log("catArray " + catArray)
	var checkProductBox;
	catArray.forEach(function(entry) {
		checkProductBox = false;
		for(var i = 0; i < productcode_array.length; i++) {
			if (productcode_array[i].length > 0) {
				if (isInt(productcode_array[i])) { // Int
						// Reduce to four digits
						productcode_truncated = productcode_array[i].substring(0,4);
						//console.log("Does " + entry[0] + " start with " + productcode_truncated);

						if (entry[0].startsWith(productcode_truncated)) { // If columns values start with search values.
							$("#productCatTitle").append(entry[0] + " - " + entry[1] + "<br>");
							checkProductBox = true;
							// To activate on list of HS types is displayed.
							$("#catSearchHolder").removeClass("localonly");
						} else {
							//console.log("Not Found");
						}
					
				} else {
					console.log("Alert: productcode " + productcode_array[i] + " not integer.")
					//productMatchFound++;
				}
			}
		}

		if (entry[0] > (startRange*100) && entry[0] < (endRange*100+99)) {
	    	//console.log(entry[0]);
	    	var ischecked = "";
	    	if (checkProductBox) {
	    		ischecked = "checked";
	    	}
	    	$("#productSubcats").append( "<div><div><input name='hs' type='checkbox' " + ischecked + " value='" + entry[0] + "'> " + entry[0] + "</div><div>" + entry[1] + "</div></div>" );
		}
	});
	if ($(window).width() < 600) {
		//$('#mainCats').hide();
	}
	
	$('#productSubcats > div').click(function () {
    	$(this).find('input[type=checkbox]').prop("checked", !$(this).find('input[type=checkbox]').prop("checked")); // toggle
    	let hsCodes = $('#productSubcats input:checked').map(function() {return this.value;}).get().join(','); // Note use of value instead of id.
    	updateHash({"hs":hsCodes});
        event.stopPropagation();
    });

    //$('#productSubcats > div:first-child').click(function () {
	//	$('#mainCats').show();
	//	$('.backArrow').hide();
    //    event.stopPropagation();
    //});
}
function renderMapShapes(whichmap, hash, geoview, attempts) {
  console.log("renderMapShapes() state: " + hash.state + " attempts: " + attempts);
  loadScript(local_app.modelearth_root() + '/localsite/js/topojson-client.min.js', function(results) {
    renderMapShapeAfterPromise(whichmap, hash, attempts);
  });
}

//var geojsonLayer; // Hold the prior letter. We can use an array or object instead.
var geoOverlays = {};
function renderMapShapeAfterPromise(whichmap, hash, geoview, attempts) {
 includeCSS3(theroot + 'css/leaflet.css',theroot);
  loadScript(theroot + 'js/leaflet.js', function(results) {
    waitForVariable('L', function() { // Wait for Leaflet

    let stateAbbr = "";
    if (hash.state) {
      stateAbbr = hash.state.split(",")[0].toUpperCase();
    }
    
    // In addition, the state could also be derived from the county geo value(s).
    var stateCount = typeof hash.state !== "undefined" ? hash.state.split(",").length : 0;
    if (stateCount > 1 && hash.geoview != "country") {
      console.log("Call renderMapShapeAfterPromise for each state in " + hash.state);
      let reversedStr = hash.state.split(",").reverse().join(",");
      console.log("TO DO: Figure out why ony last state is retained on map")
      reversedStr.split(",").forEach(function(state) { // Loop through each state
        hashclone = $.extend(true, {}, hash); // Clone/copy object without entanglement
        hashclone.state = state.toUpperCase(); // One state at a time
        renderMapShapeAfterPromise(whichmap, hashclone, 0); // Using clone since hash could be modified mid-loop by another widget,
      });
      return;
    }
    console.log("renderMapShapeAfterPromise " + whichmap + " state: " + stateAbbr);

    if (stateAbbr == "GA") { // TO DO: Add regions for all states
      $(".regionFilter").show();
    } else {
      $(".regionFilter").hide();
    }
    $("#state_select").val(stateAbbr); // Used for lat lon fetch

    waitForElm('#' + whichmap).then((elm) => {

        $("#geoPicker").show();
        $('#' + whichmap).show();
        if (!$("#" + whichmap).is(":visible")) {
          // Oddly, this is needed when using 3-keys to reload: Cmd-shift-R
          $("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show(); 

          console.log("Caution: #" + whichmap + " not visible. May effect tile loading.");
          //return; // Prevents incomplete tiles
        }

        var req = new XMLHttpRequest();
        //const whichGeoRegion = hash.geomap;

        // Topo data source
        //https://github.com/deldersveld/topojson/tree/master/countries/us-states

        updateGeoFilter(hash.geo); // Checks and unchecks geo (counties) when backing up.

        // BUGBUG - Shouldn't need to fetch counties.json every time.

        // TOPO Files: https://github.com/modelearth/topojson/countries/us-states/AL-01-alabama-counties.json";

        // US:
        let stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78};
        let state2char = ('0'+stateIDs[stateAbbr]).slice(-2);
        //let stateNameLowercase = $("#state_select option:selected").text().toLowerCase();

        let map;
        // MAPS FROM TOPOJSON

        //alert($("#state_select option:selected").attr("stateid"));
        //alert($("#state_select option:selected").val()); // works

        // $("#state_select").find(":selected").text();

        //if(location.host.indexOf('localhost') >= 0) {
        //if (param.geo == "US01" || param.state == "AL") { // Bug, change to get state from string, also below.
        // https://github.com/modelearth/topojson/blob/master/countries/us-states/AL-01-alabama-counties.json

        //var url = local_app.custom_data_root() + '/counties/GA-13-georgia-counties.json';
        
        var lat = 32.69;
        var lon = -20; // -83.2;
        let zoom = 2;
        let theState = $("#state_select").find(":selected").val();

        var url;
        let topoObjName = "";
        var layerName = "Map Layer";

        if (hash.geoview == "zip") {
          layerName = "Zipcodes";
          if (stateAbbr) {
            url = local_app.modelearth_root() + "/community-forecasting/map/zcta/states/" + getState(stateAbbr) + ".topo.json";
          } else {
            url = local_app.modelearth_root() + "/community-forecasting/map/zip/topo/zips_us_topo.json";
          }
          topoObjName = "topoob.objects.data";
        }  else if (hash.geoview == "country") { // USA  && stateAbbr.length != 2
          layerName = "States";
          url = local_app.modelearth_root() + "/localsite/map/topo/states-10m.json";
          topoObjName = "topoob.objects.states";
        } else if (stateAbbr && stateAbbr.length <= 2) { // COUNTIES
          layerName = stateAbbr + " Counties";
          let stateNameLowercase = getStateNameFromID(stateAbbr).toLowerCase();
          let countyFileTerm = "-counties.json";
          let countyTopoTerm = "_county_20m";
          if (stateNameLowercase == "louisiana") {
            countyFileTerm = "-parishes.json";
            countyTopoTerm = "_parish_20m";
          }
          url = local_app.modelearth_root() + "/topojson/countries/us-states/" + stateAbbr + "-" + state2char + "-" + stateNameLowercase.replace(/\s+/g, '-') + countyFileTerm;
          topoObjName = "topoob.objects.cb_2015_" + stateNameLowercase.replace(/\s+/g, '_') + countyTopoTerm;

          //url = local_app.modelearth_root() + "/topojson/countries/us-states/GA-13-georgia-counties.json";
          // IMPORTANT: ALSO change localhost setting that uses cb_2015_alabama_county_20m below
        } else { // ALL COUNTRIES
        //} else if (hash.geoview == "earth") {
          url = local_app.modelearth_root() + "/topojson/world-countries-sans-antarctica.json";
          topoObjName = "topoob.objects.countries1";
        }

        req.open('GET', url, true);
        req.onreadystatechange = handler;
        req.send();

        var topoob = {};
        var topodata = {};
        var neighbors = {};
        function handler(){

        if(req.readyState === XMLHttpRequest.DONE) {

          //map.invalidateSize();
          //map.addLayer(OpenStreetMap_BlackAndWhite)

         
          // try and catch json parsing of the responseText
          //try {
                topoob = JSON.parse(req.responseText)

                // Originated in community/map/leaflet/zips-sm.html
                // zips_us_topo.json
                // {"type":"Topology","objects":{"data":{"type":"GeometryCollection","geometries":[{"type":"Polygon

                // {"type":"Topology","transform":{"scale":[0.00176728378633945,0.0012459509163533049],"translate":

                //"arcs":[[38,39,40,41,42]],"type":"Polygon","properties":{"STATEFP":"13","COUNTYFP":"003","COUNTYNS":"00345784","AFFGEOID":"0500000US13003","GEOID":"13003","NAME":"Atkinson","LSAD":"06","ALAND":879043416,"AWATER":13294218}}


                // Since this line returns error, subsquent assignment to "neighbors" can be removed, or update with Community Forecasting boundaries.
                //console.log(topojson)



                // Was used by applyStyle
                ////neighbors = topojson.neighbors(topoob.objects.data.geometries);
                      // comented out May 29, 2021 due to "topojson is not defined" error.
                //neighbors = topojson.neighbors(topoob.arcs); // .properties

                // ADD geometries  see https://observablehq.com/@d3/choropleth
                //topodata = topojson.feature(topoob, topoob.objects.data)

                //topodata = topojson.feature(topoob, topoob.transform)

                // 
                
                //if (param.geo == "US01" || param.state == "AL") {
                  // Example: topoob.objects.cb_2015_alabama_county_20m
                  
                  topodata = topojson.feature(topoob, eval(topoObjName));

                  console.log(topodata)
              //} else {
              //  topodata = topojson.feature(topoob, topoob.objects.cb_2015_georgia_county_20m)
              //}

                // ADD 
                // For region colors
                //mergeInDetailData(topodata, dp.data); // See start/maps/counties/counties.html



                // IS THIS BEING USED?
                //topodata.features = topodata.features.map(function(fm,i){
                /*
                topodata.features = topodata.features.map(function(fm,i){
                    var ret = fm;
                    //console.log("fm: " + fm.COUNTYFP);
                    console.log("fm: " + fm.properties.countyfp);
                    ret.indie = i;
                    return ret
                  });
                */

                //dp.data.forEach(function(datarow) { // For each county row from the region lookup table
                  
                  // All these work:
                  //console.log("name:: " + datarow.name);
                  //console.log("county_num:: " + datarow.county_num);
                  //console.log("economic_region:: " + datarow.economic_region);

                //})

                //console.log('topodata: ', topodata)

                //geojsonLayer.clearLayers(); // Clear prior
                //        layerControls[whichmap].clearLayers();

                

                //console.log('neigh', neighbors)
             //}
            //catch(e){
            //  geojson = {};
            //   console.log(e)
            //}


            //console.log(topodata)
          

          if (hash.geoview == "earth" && theState == "") {
            zoom = 2
            lat = "25"
            lon = "0"
          } else if (hash.geoview == "country") {
            zoom = 4
            lat = "39.5"
            lon = "-96"
          } else if ($("#state_select").find(":selected").attr("lat")) {
            let kilometers_wide = $("#state_select").find(":selected").attr("km");
            zoom = zoomFromKm(kilometers_wide,theState);
            lat = $("#state_select").find(":selected").attr("lat");
            //alert("lat " + lat)
            lon = $("#state_select").find(":selected").attr("lon");
          }
          var mapCenter = [lat,lon];

          var mbAttr = '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWUyZGV2IiwiYSI6ImNqaWdsMXJvdTE4azIzcXFscTB1Nmcwcm4ifQ.hECfwyQtM7RtkBtydKpc5g';

          var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
              satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr}),
              streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

          var OpenStreetMap_BlackAndWhite = L.tileLayer('//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
              maxZoom: 18,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });

          let dataParameters = {}; // Temp



          //let map;
          if (document.querySelector('#' + whichmap)) {
            //alert("Recall existing map: " + whichmap);
            map = document.querySelector('#' + whichmap)._leaflet_map; // Recall existing map
          }
          var container = L.DomUtil.get(map);
          //if (container == null || map == undefined || map == null) { // Does not work

            // Don't add, breaks /info
            // && $('#' + whichmap).html()
          //if ($('#' + whichmap) && $('#' + whichmap).html().length == 0) { // Note: Avoid putting loading icon within map div.
              //alert("set " + whichmap)

         //var container = L.DomUtil.get(map);
         //alert(container)
         if (container == null) { // Initialize map
            //alert("container null")
            // Line above does not work, so we remove map:

            var basemaps1 = {
          'Satellite' : L.tileLayer(mbUrl, {maxZoom: 25, id: 'mapbox.satellite', attribution: mbAttr}),
          // OpenStreetMap
          'Street Map' : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
          }),
          // OpenStreetMap_BlackAndWhite:
          'Grey' : L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
              maxZoom: 18, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
          }),
        }


            container = L.DomUtil.get(whichmap);
            if(container != null) {
              container._leaflet_id = null; // Prevents error: Map container is already initialized.
            }

            // Try commenting this out
            /*
            try { // Traps the first to avoid error when changing from US to state, or adding state.
              //map.off();
              map.remove(); // removes the previous map element using Leaflet's library (instead of jquery's).


            } catch(e) {

            }        
            */
            if(!map) {
              map = L.map(whichmap, {
                center: new L.LatLng(lat,lon),
                scrollWheelZoom: false,
                zoom: zoom,
                dragging: !L.Browser.mobile, 
                tap: !L.Browser.mobile
              });

              //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
              //    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              //}).addTo(map);
            }
            
            // Add 
            geoOverlays[layerName] = L.geoJson(topodata, {style:styleShape, onEachFeature: onEachFeature}).addTo(map); // Called within addTo(map)
        
            layerControls[whichmap] = L.control.layers(basemaps1, geoOverlays, {position: 'bottomleft'}).addTo(map); // Push multple layers
            if (onlineApp) {
                basemaps1["Grey"].addTo(map);
            }

        //} else if (geojsonLayer) { // INDICATES TOPO WAS ALREADY LOADED
        } else if (map.hasLayer(geoOverlays[layerName])) {

            // Add 
          //geojsonLayer = L.geoJson(topodata, {style:styleShape, onEachFeature: onEachFeature}).addTo(map); // Called within addTo(map)
        
          //map.removeLayer(geoOverlays[layerName]);

          if (geoOverlays[layerName]) {
            map.removeLayer(geoOverlays[layerName]); // Remove overlay but not checkbox.
          }
          //map.removeOverlay(geoOverlays[layerName]);

          //layerControls[whichmap].addOverlay(geoOverlays[layerName], layerName); // Sorta works - use to add a duplicate check box
          
          //layerControls[whichmap].removeOverlay(layerName);
          //layerControls[whichmap].removeOverlay(geoOverlays[layerName], layerName);

          geoOverlays[layerName] = L.geoJson(topodata, {
                style: styleShape, 
                onEachFeature: onEachFeature
          }).addTo(map);

          /*
          var geojsonLayer = L.geoJson(topodata, {
                style: styleShape, 
                onEachFeature: onEachFeature
          }).addTo(map);
          geoOverlays[layerName] = geojsonLayer;
          */


          //console.log("DISABLE REMOVE - Remove the prior topo layer")
          //alert("Remove prior, has geojsonLayer")


          /*
          // Prevent drawing on top of 
          
            // Causes error in /map : leaflet.js:5 Uncaught TypeError: Cannot read property '_removePath' of undefined
            //if(map.hasLayer(geojsonLayer)) {
            
              alert("HAS PRIOR LAYER, REMOVE")
              //alert("Need to check if already exists: " + layerName);
              // Need to use name of prior layer.
              //map.removeLayer(geojsonLayer); // Prevents overlapping by removing the prior topo layer
              ////map.geojsonLayer.clearLayers();

              //alert(geoOverlays[layerName])
              geoOverlays[layerName].remove(); // Prevent thick overlapping colors
              //geoOverlays[layerName].clearLayers();
              map.removeLayer(geoOverlays[layerName]);
            
            //map.geojsonLayer.clearLayers(); // Clear prior
            */

            map.setView(mapCenter,zoom);

            // setView(lng, lat, zoom = zoom_level)
          

            
        } else { // Add the new state

          geoOverlays[layerName] = L.geoJson(topodata, {
                style: styleShape, 
                onEachFeature: onEachFeature
          }).addTo(map);

          map.setView(mapCenter,zoom);
        }
        
        console.log("zoom " + zoom);
        console.log(mapCenter);


        /* From other map, probably not Leaflet
        var layersToRemove = [];
        map.getLayers().forEach(function (layer) {
            if (layer.get('name') != undefined && layer.get('name') === layerName) {
                layersToRemove.push(layer);
            }
        });
        var len = layersToRemove.length;
        for(var i = 0; i < len; i++) {
            map.removeLayer(layersToRemove[i]);
            alert("remove layer: " + layersToRemove[i])
        }
        */





        if (map) {
        } else {
          console.log("WARNING - map not available from _leaflet_map")
        }

        var baseLayers = {
          "Open Street Map": OpenStreetMap_BlackAndWhite,
          "Grayscale Mapbox": grayscale,
          "Streets Mapbox": streets,
          "Satellite Mapbox": satellite
        };
        
          //dataParameters.forEach(function(ele) {
            //geoOverlays[ele.name] = ele.group; // Allows for use of dp.name with removeLayer and addLayer
            //console.log("Layer added: " + ele.name);
          //})

          //if(layerControls[whichmap] === false) { // First time, add new layer
            // Add the layers control to the map
          //  layerControl_CountyMap = L.control.layers(baseLayers, geoOverlays).addTo(map);
          //}

          if (typeof layerControls != "undefined") {
            console.log("layerControls is available to CountyMap.");

            // layerControls object is declared in map.js. Contains element for each map.
            if (layerControls[whichmap] != undefined) {
              if (geoOverlays[stateAbbr + " Counties"]) {
                // Reached on county click, but shapes are not removed.
                //console.log("geoOverlays: ");
                //console.log(geoOverlays);
                
                //resetHighlight(layerControls[whichmap].);
                // No effect
                //layerControls[whichmap].removeLayer(geoOverlays["Counties"]);

                //geojsonLayer.remove();

                // Might work a little

                //alert("Remove the prior topo layer")
                //map.removeLayer(geojsonLayer); // Remove the prior topo layer
              }
            }

            // layerControls wasn't yet available in loading sequence.
            // Could require localsite/js/map.js load first, but top maps might not always be loaded.
            // Or only declare layerControls object if not yet declared.
            //alert("map.length " + map.length);
            if (map.length) { // was just map until {} added
              //alert("map " + map);
                if (1==2 && layerControls[whichmap] == undefined) { //NEW MAP
                  //TESTING
                  //alert("NEW MAP " + whichmap)

                  //geoOverlays = {
                  //  [layerName]: geojsonLayer
                  //};
                  //geoOverlays[layerName] = geojsonLayer;


                  //layerControls[whichmap] = L.control.layers(basemaps1, geoOverlays).addTo(map); // Push multple layers
                  //basemaps1["Grey"].addTo(map);



                  // layerControls[whichmap]
              
                  /*
                  // create the master layer group
                  var masterLayerGroup = L.layerGroup().addTo(map);

                  // create layer groups
                  var aLayerGroup = L.layerGroup([
                    // create a bunch of layers
                  ]);

                  masterLayerGroup.addLayer(aLayerGroup);
                  */

                //} else if (!geoOverlays[layerName]) {
                } else if (!map.hasLayer(geoOverlays[layerName])) { // LAYER NOT ADDED YET

                  alert("hasLayer false - LAYER NOT ADDED YET");
                  // Error: Cannot read property 'on' of undefined
                  //layerControls[whichmap].addOverlay(layerGroup, dp.dataTitle); // Appends to existing layers
                  //alert("Existing " + whichmap + " has no overlay for: " + layerName)

                  

                  //if(map.hasLayer(geojsonLayer)) {
                    //alert("HAS LAYER")
                    //map.removeLayer(geojsonLayer); // Remove the prior topo layer - BUGBUG this hid the new layer.
                    ////map.geojsonLayer.clearLayers();
                  //}

                  //geoOverlays[layerName] = geojsonLayer; // Add element to existing geoOverlays object.

                  //geoOverlays[layerName] = stateAbbr + " Counties";

                  // Add dup
                  //layerControls[whichmap].addOverlay(geojsonLayer, stateAbbr + " Counties");


                  //layerControls[whichmap].addLayer(stateAbbr + " Counties");
                  //layerControls[whichmap].addOverlay(geojsonLayer, geoOverlays);

                  //layerControls[whichmap].addOverlay(basemaps1, geoOverlays); // Appends to existing layers
                  //layerControls[whichmap] = L.control.layers(basemaps1, geoOverlays).addTo(map); 
                } else {
                  //alert("DELETE ALL OF THIS PART layer already exists2: " + layerName);
                  //geoOverlays[layerName].remove(); // Also above
                  
                  //map.removeLayer(geoOverlays[layerName]);
                  //layerControls[whichmap].removeOverlay(geoOverlays[layerName]);

                  console.log("getgeoOverlays");
                  console.log(layerControls[whichmap].getgeoOverlays());
                  if (location.host.indexOf('localhost') >= 0) {
                    alert("Local only layerString");
                    let layerString = "";
                    Object.keys(layerControls[whichmap].getgeoOverlays()).forEach(key => {
                      layerString += key;
                      if (layerControls[whichmap].getgeoOverlays()[key]) {
                        layerString += " - selected";
                      }
                      layerString += "<br>";
                    });

                    // Show map layers, to use later
                    //$("#layerStringDiv").remove();
                    //$("#locationFilterHolder").prepend("<div id='layerStringDiv' style='width:220px'>" + layerString + "<hr></div>");
                  
                  }
                }
            }
          } // end layerControls

          // To add additional layers:
          //layerControls.addOverlay(layerGroup, dp.name); // Appends to existing layers


            /* Rollover effect */
            function highlightFeature(e){
              var layer = e.target;
              layer.setStyle({
                weight: 3,
                color: '#665',
                dashArray: '',
                fillOpacity: .7})
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {

                  layer.bringToFront();
                }
              // Send text to side box
              info.update(layer.feature.properties);
            }
            // Rollout map shape (county)
            function resetHighlight(e){
                // Restores color prior to rollover
                if (geoOverlays[layerName]) {
                  //console.log("Rollout resetHighlight e.target ");
                  //console.log(e.target);
                  geoOverlays[layerName].resetStyle(e.target);
                  info.update();
                } else {
                    console.log("Found NO layerName: " + layerName);
                }
            }

            // CLICK SHAPE ON MAP
            function mapFeatureClick(e) {

              param = loadParams(location.search,location.hash); // param is declared in localsite.js
              var layer = e.target;
              //map.fitBounds(e.target.getBounds()); // Zoom to boundary area clicked
              if (layer.feature.properties.COUNTYFP) {
              	consoleLog("Click state map");
                var fips = "US" + layer.feature.properties.STATEFP + layer.feature.properties.COUNTYFP;
                
                //var fipsString = fips;
                if (param.geo && param.geo.split(",").includes(fips)) {
                  // Remove clicked fips from array, then convert back to string
                  param.geo = jQuery.grep(param.geo.split(","), function(value) {return value != fips;}).toString();
                  //fipsString = param.geo;
                } else if (param.geo && param.geo.split(",").length > 0) {
                  param.geo = param.geo + "," + fips;
                } else {
                  param.geo = fips;
                }
                goHash({'geo':param.geo,'regiontitle':''});
              } else if (layer.feature.properties.name) { // Full state name
                  let hash = getHash();
                  let theStateID = getIDfromStateName(layer.feature.properties.name);
                  consoleLog("Click state map theStateID " + theStateID);
                  //console.log("hash.state " + hash.state);
                  if (!theStateID && layer.feature.properties.name == "United States of America") {
                    console.log("Click  " + layer.feature.properties.name);
                    goHash({'geoview':'country','geo':'','regiontitle':''});
                  } else {

                      if (hash.state) {
                        if (hash.state.includes(theStateID)) {
                            //if (hash.state.includes(",")) { // Assuming user is removing state.
                            //    hash.state = hash.state.replace(/&/g, '%26');
                            //}
                            let hashStateArray = hash.state.split(",");

                            hashStateArray = hashStateArray.filter(function(item) {
                                return item !== theStateID
                            })

                            console.log(hashStateArray);
                            hash.state = hashStateArray.toString();
                            console.log("After hash.state " + hash.state);

                          // BUGBUG returned F,L from state=FL,GA
                          //hash.state = jQuery.grep(hash.state.split(",")[0].toUpperCase(), function(value) {
                          //  return value != theStateID;
                          //}).toString();
                        } else {
                          hash.state = theStateID + "," + hash.state;
                        }
                      } else {
                        hash.state = theStateID;
                      }
                      goHash({'state':hash.state,'geoview':'state'});
                }
              }
            }
            // ROLLOVER SHAPE ON MAP
            function onEachFeature(feature, layer){
              layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight, 
                    click: mapFeatureClick
              })
            }

            var info = L.control();

            info.onAdd = function(map) {
              //alert("attempt")
              if ($(".info.leaflet-control").length) {
                $(".info.leaflet-control").remove(); // Prevent adding multiple times
              }
              this._div = L.DomUtil.create('div', 'info');
              this.update();
              return this._div;
            }

            info.update = function(props){
                if (props) {
                  $(".info.leaflet-control").show();
                } else {
                  $(".info.leaflet-control").hide();
                }
                // National
                // Hover over map
                //this._div.innerHTML = "<h4>Zip code</h4>" + (props ? props.zip + '</br>' + props.name + ' ' + props.state + '</br>' : "Select Locations")
                
                // CSS resides in map.css at .leaflet-top > .info
                if (props && props.COUNTYFP) {
                  this._div.innerHTML = "" 
                  + (props ? "<b>" + props.NAME + " County</b><br>" : "Select Locations") 
                  + (props ? "FIPS 13" + props.COUNTYFP : "")
                } else { // US
                  this._div.innerHTML = "" 
                  + (props ? "<b>" + props.name + "</b><br>" : "Select Locations")
                }

                // To fix if using state - id is not defined
                // Also, other state files may need to have primary node renamed to "data"
                //this._div.innerHTML = "<h4>Zip code</h4>" + (1==1 ? id + '</br>' : "Hover over map")
            }
            if (map) {
              info.addTo(map);
            }
          }
        }
  }); // waitforElm # whichmap
  });
  });
}

function updateGeoFilter(geo) {
  $(".geo").prop('checked', false);
  if (geo && geo.length > 0) {

    //locationFilterChange("counties");
    let sectors = geo.split(",");
      for(var i = 0 ; i < sectors.length ; i++) {
        $("#" + sectors[i]).prop('checked', true);
      }

  }
  console.log('ALERT: Change to support multiple states as GEO. Current geo: ' + geo)
  if (geo && geo.length > 4) // Then county or multiple states - Bug
  {
      $(".state-view").hide();
      $(".county-view").show();
      //$(".industry_filter_settings").show(); // temp
  } else {
      $(".county-view").hide();
      $(".state-view").show();
      //$(".industry_filter_settings").hide(); // temp
  }
}
function getStateNameFromID(stateID) {
  if (typeof stateID == "undefined" || stateID.length < 2) { return; }
  let stateName = ""; // Avoids error when made lowercase
  $("#state_select option").map(function(index) {
    if ($("#state_select option").get(index).value == stateID) {
      stateName = $("#state_select option").get(index).text;
    }
  });
  return(stateName);
}
function getIDfromStateName(stateName) {
  let theStateID;
  $("#state_select option").map(function(index) {
    if ($("#state_select option").get(index).text == stateName) {
      theStateID = $("#state_select option").get(index).value.toString();
    }
  });
  return(theStateID);
}
function zoomFromKm(kilometers_wide, theState) {
  //alert(kilometers_wide) // undefined for the 1st of 3.
  let zoom = 5;
  if (!kilometers_wide) return zoom;
  if (kilometers_wide > 1000000) { // Alaska
    zoom = 4
  } else if (kilometers_wide > 600000) { // Texas
    zoom = 5
  } else if (kilometers_wide > 105000) { // Hawaii and Idaho
    zoom = 6
  }
  if (theState == "AL" || theState == "AR" || theState == "GA" || theState == "CO" || theState == "IA") { // Zoom closer for some states
    zoom = zoom + 1;
  }
  if (theState == "HI" || theState == "IN") {
    zoom = zoom + 2;
  }
  if (theState == "DE" || theState == "RI" || theState == "MA") {
    zoom = zoom + 3;
  }
  return zoom;
}

function locationFilterChange(selectedValue,selectedGeo) {
	let hash = getHash();
	var useCookies = false; // Would need Cookies from explore repo.

    console.log("locationFilterChange: " + selectedValue + " " + selectedGeo);
    //$("#geoListHolder > div").hide();
    $(".geoListCounties").show();

    //showSearchFilter(); // Display filters

    //alert("reactivate these 2. " + selectedValue);
    // When to hide?
    //hideLocationFilters();
    //hideLocationsMenu();

    //$(".hideLocationsMenu").trigger("click");
    $('.countyTitleText').text(""); // Used by cities and counties
    removeCityFilter();
    $('.countyList').hide();

    
    $(".listHolder").hide();

    //hideCounties();
    $("#cityFields").hide();

    // Avoid always showing since some show values do not have searchable datasets, until we also search industries.
    //$(".keywordField").show(); // Since hidden by zip search

    //filterULSelect(selectedValue); // When from hash

    //$(".filterUL li").removeClass("selected");
        //$(this).addClass("selected");

        //$("#filterClickLocation .locationTabText").html($(this).text()).data('selected', $(this).data('id'));

    
    if (selectedValue == 'all' || selectedValue == 'state') { // its entire state
        // Reached by clicking "Entire State"
        if(useCookies) {
            //Cookies.set('searchParams', { 'useCurrent': null, 'locationDD': 'all' });
            Cookies.set('searchParams', { 'useCurrent': null, 'locationDD': 'all' });
        }
        //activateEntireState();
        $("#zip").val('');
        //$('.goSearch').trigger("click");
    }
    /*
    if (selectedValue == 'country') {
    	$(".stateFilters").hide();
    } else {
    	if (hash.state || hash.geo) {
    		///$("#geoPicker").show();
    	}
    	$(".stateFilters").show();
    }
	*/
    if (selectedValue == 'nearby') { // My current location, set cookie useCurrent=1
        $("#distanceField").show();
        activateMyLocation(true);
        if(useCookies) {
            Cookies.set('searchParams', { 'useCurrent': '1', 'centerlat': $(".mylat").val(), 'centerlon': $(".mylon").val(), 'locationDD': selectedValue });
        }
        //geoSelected();
    }

    if (selectedValue == 'latlon') { // Other location, set cookie useCurrent=0
        $("#coordFields").show();
        $("#distanceField").show();
        //$('#latLonFields').show();
        if(useCookies) {
            Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': selectedValue });
        }
        //geoSelected();
    }

    if (selectedValue == 'zip') {
    	$("#coordFields").hide();
        $("#distanceField").hide();
        $("#distanceField").show();
        $("#zipFields").show();
        $("#zip").focus();

        if(useCookies) {
            var cookieParam = Cookies.set('searchParams');
            if (typeof (cookieParam) != 'undefined' && typeof (cookieParam.zip) != 'undefined') {
                $("#zip").val(cookieParam.zip);
            }
            Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': 'zip' });
        }
    }
    if (selectedValue == 'city') {
        $("#distanceField").show();
        $("#cityFields").show();
        //$('.currentCities').show();
        //$(".detailsPanel").hide();
        //$(".listPanelInner").hide();
        //$(".listPanelSideBkgd").hide(); // Alphabet
        $(".cityList").show();
        $(".listPanelRows").show();
        
        populateCityList(function(results) { // Returns asynchronous results. Waits for city cvs to load.
            if (results) {
                // Reached when changing location dropdown, if cityList not yet loaded.
            }
            else {
                consoleLog('No cities results found');
            }
        });

        $(".listHolder").show();

        if(useCookies) {
            //var cookieParam = Cookies.set('searchParams');
            var cookieParam = Cookies.get('searchParams');
            if (cookieParam && typeof (cookieParam.city) != 'undefined') {
                consoleLog(cookieParam.city);
                $("#cities").val(cookieParam.city.split(','))
            }
            //alert("City lat: " + $("#lat").val());
            //Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': 'city' });
           Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': 'city' });
        }
    }
}
/*
function locClick(which) {
	let geo = $('.geo:checked').map(function() {return this.id;}).get().join(',');
	$(".regiontitle").text(""); //Clear
	let regiontitle = ""; // Remove from hash. Later associate existing regions.
	goHash({"geo":geo,"regiontitle":regiontitle});
}
*/
// Data as values, not objects.
//let geoCountyTable = []; // Array of arrays

function loadStateCounties(attempts) { // To avoid broken tiles, this won't be executed if the #geomap div is not visible.
	consoleLog("loadStateCounties " + attempts);
    loadScript(theroot + 'js/d3.v5.min.js', function(results) {
    	if (typeof d3 !== 'undefined') {

    		// Switching to: http://tabulator.info/examples/5.0
            let element = {};
            element.scope = "geo";

            let hash = getHash();
            let theState = param.state; // From navigation.js
            let theStateSelect = $("#state_select").find(":selected").val();
            if (theStateSelect) {
                theState = theStateSelect;
            }
            if (hash.state) {
                theState = hash.state.split(",")[0].toUpperCase();
            }
            if (theState && theState.length > 2) {
                theState = theState.substring(0,2);
            }
            if ($(".output_table > table").length) {
                if (theState == priorHash.state || (theState == "GA" && !priorHash.state)) {
                    console.log("cancel loadStateCounties: " + theState + " prior: " + priorHash.state);
                    return; // Avoid reloading
                }
                $(".output_table").html(""); // Clear prior state
            }

            consoleLog("loadStateCounties tabulator for 2 character state: " + theState);

    		//Load in contents of CSV file for Tabulator (separate from map county shapes)
    		if (theState && theState.length == 2) {
                let csvFilePath = local_app.community_data_root() + "us/state/" + theState + "/" + theState + "counties.csv";
                if (hash.geoview == "zip") {
                    csvFilePath = local_app.community_data_root() + "us/zipcodes/zipcodes6.csv";
                } else if (hash.show == "cameraready" && hash.state == "GA") {
                    csvFilePath = "/localsite/info/data/map-filters/state-county-sections-ga.csv";
                }
    			d3.csv(csvFilePath).then(function(myData,error) {
                //d3.csv(csvFilePath, function(myData) {
                //d3.csv(csvFilePath).then(function(error,myData) {

    				if (error) { // Wasn't reached. Will delete this. Now reaches error message at bottom of ds.csv function instead.
    					//alert("error")
                        if (location.host.indexOf('localhost') >= 0) {
                            alert("Error loading file. " + error);
                        } else {
    					   console.log("Error loading file. " + error);
                        }
    				}

                    if (hash.geoview == "zip") {

                    } else { // Counties

        				//alert($("#county-table").length());
        				// No effect
        				//$("#county-table").empty(); // Clear previous state. geo is retained in URL hash.
        				//$("#county-table").text("")
        				//alert($("#county-table").length());

        				// Add a new variable, to make it easier to do a color scale.
        				// Alternately, you could extract these values with a map function.
        				let allDifferences = [];

        				// geo is country, state/province, county

        				let theStateGeo = "US" + ('0' + localObject.us_stateIDs[theState]).slice(-2);
        				
        				myData.forEach(function(d, i) {

        					d.difference =  d.US_2007_Demand_$;

        					// OBJECTID,STATEFP10,COUNTYFP10,GEOID10,NAME10,NAMELSAD10,totalpop18,Reg_Comm,Acres,sq_miles,Label,lat,lon
        					//d.name = ;
        					d.idname = "US" + d.GEOID + "-" + d.NAME + " County, " + theState;

        					//d.perMile = Math.round(d.totalpop18 / d.sq_miles).toLocaleString(); // Breaks sort
        					d.perMile = Math.round(d.totalpop18 / d.sq_miles);

        					//console.log("d.sq_miles " + d.sq_miles);

        					//d.sq_miles = Number(Math.round(d.sq_miles).toLocaleString());

        					d.sq_miles = Math.round(d.sq_miles).toLocaleString();

        				 	// Add an array to the empty array with the values of each:
        				 	// d.difference, 
        				 	// , d.sq_miles
        			 	 	//geoCountyTable.push([d.idname, d.totalpop18, d.perMile]);

        			 	 	// Save to localObject so counties in multiple states can be selected
        			 	 	if (localObject.stateCountiesLoaded.indexOf(theStateGeo)==-1) { // Just add first time

                                //BUGBUG - Also need to check that state was not already added.
        				 	 	let geoElement = {};
        				 	 	geoElement.id = "US" + d.GEOID;
        				 	 	//geoElement.county = d.NAME;
        				 	 	geoElement.name = d.NAME + " County, " + theState;
        				 	 	geoElement.state = theState;
        				 	 	geoElement.sqmiles = d.sq_miles;
        				 	 	geoElement.pop = d.totalpop18;
        				 	 	geoElement.permile = d.perMile;

        				 	 	localObject.geo.push(geoElement); 
        				 	 }

        					// this is just a convenience, another way would be to use a function to get the values in the d3 scale.
        					//alert("d.perMile " + d.perMile)

        					// Not working
        			 	 	//allDifferences.push(d.difference);
        			 	 	//allDifferences.push(d.perMile + 0);
        			 	 	allDifferences.push(d.perMile);
        				});

        				// Track the states that have been added to localObject.geo
        				if (localObject.stateCountiesLoaded.indexOf(theStateGeo)==-1) {
        					if (localObject.stateCountiesLoaded.indexOf(theStateGeo)==-1) localObject.stateCountiesLoaded.push(theStateGeo);
        					//alert(localObject.stateCountiesLoaded)
        				}
        				//console.log("geoCountyTable");
        				//console.log(geoCountyTable);
                    }
                    consoleLog(myData.length + " counties loaded.");
                    //console.log(myData);
    				showTabulatorList(element, 0);
                    $(".geoListCounties").show();
                }, function(error, rows) {
                    console.log("ERROR fetching csv file for TabulatorList (counties or zip). " + error);
                    $(".geoListCounties").hide();
                    //console.log(error);
    			});
    		}
    	} else {
    		attempts = attempts + 1;
    	      if (attempts < 500) {
    	      	setTimeout( function() {
    	          loadStateCounties(attempts);
    	        }, 20 );
    	      } else {
    	        console.log("ALERT: D3 javascript not available for loadStateCounties csv.");
    	      }
    	}
    });
}

function loadObjectData(element, attempts) {
    console.log("loadObjectData " + attempts);
    if (typeof d3 !== 'undefined') {
        if(typeof localObject[element.scope] == 'undefined') {
            localObject[element.scope] = {}; // Holds states, countries.
        }

        // Just load from file the first time
        if (Object.keys(localObject[element.scope]).length <= 0) { // state, countries
            console.log("element.scope " + element.scope + " does not exist yet.");
            if (element.datasource.toLowerCase().endsWith(".csv")) {
                d3.csv(element.datasource).then(function(data) { // One row per line
                    // element.scope = countries
                    if (element.key) {

                        data.forEach(function(d, i) {
                          // TO DO - might remove the key from the data
                          localObject[element.scope][d[element.key]] = data[i];
                        });

                    } else {
                        localObject[element.scope] = makeRowValuesNumeric(data, element.numColumns, element.valueColumn);
                    }
                    console.log("localObject.countries")
                    console.log(localObject[element.scope])
                    showTabulatorList(element, 0);
                })
            } else {
                d3.json(element.datasource).then(function(json,error) {

                    stateImpact = $.extend(true, {}, json); // Clone/copy object without entanglement

                      /*
                      if (Array.isArray(json)) { // Other than DifBot - NASA when count included
                        for (a in json) {
                          fullHtml += "<div class='level1'><b>Product ID:</b> " + json[a].id + "</div>\n";
                          for (b in json[a]) {
                            fullHtml += formatRow(b,json[a][b],1); // Resides in localsite.js
                          }
                        }
                      } else {
                        alert("not array")
                        if (!json.data) {
                          //json.data = json; // For NASA
                        }
                      }
                      alert(fullHtml);
                      */

                      if (error) throw error;
                      //console.log("stateImpact");
                      //return(stateImpact);
                      
                      /*
                      let rowcount = 0;
                      //stateImpactArray = [];
                      $.each(stateImpact, function(key,val) {             
                          //alert(key+val);
                          if (val["jurisdiction"]) {
                            //stateImpactArray.push(val)

                            localObject.state.push(val)
                            rowcount++;
                          }
                      });
                      console.log("Loaded set of states. rowcount: " + rowcount)
                      */

                        // To Do: Remove from json:
                        // jurisdiction: "Alabama"

                        localObject[element.scope] = $.extend(true, {}, json); // Clone/copy object without entanglement
                        console.log("localObject.state")
                        //console.log(localObject[element.scope])
                        console.log(localObject.state)
                        showTabulatorList(element, 0);
                });
            }

        } else {
            console.log("element.scope " + element.scope + " exists.");
            showTabulatorList(element, 0);
        }

    } else {
        loadScript(theroot + 'js/d3.v5.min.js', function(results) {
        });
        attempts = attempts + 1;
          if (attempts < 2000) {
            setTimeout( function() {
              loadObjectData(element, attempts);
            }, 20 );
          } else {
            alert("D3 javascript not available for loadObjectData csv.")
          }
    }
}

var statetable = {};
var geotable = {};
function showTabulatorList(element, attempts) {
    let currentRowIDs = [];
    console.log("showTabulatorList scope: " + element.scope + ". Length: " + Object.keys(element).length + ". Attempt: " + attempts);
	let hash = getHash();
    let theState = hash.state;
    if (element.state) {
        theState = element.state;
    }
	if (typeof Tabulator !== 'undefined') {

        // Convert key-value object to a flat array (like a spreadsheet)
        let dataForTabulator = [];
        $.each(localObject[element.scope] , function(key,val) { // val is an object     
          if (element.scope == "state") {
            if (val["jurisdiction"]) { // 3 in the state json file don't have a jurisdiction value.
                dataForTabulator.push(val);
            } else {
                console.log("No jurisdiction value " + val["name"]);
            }
          } else { // countries
            dataForTabulator.push(val);
          }
          //console.log("Scope in Tabulator " + element.scope);
        });

        console.log("dataForTabulator:");
        console.log(dataForTabulator);

		// For fixed header, also allows only visible rows to be loaded. See "Row Display Test" below.
		// maxHeight:"100%",

        // COUNTRY - LIST OF STATES
        //if (!hash.state && typeof stateImpact != 'undefined') {
        if (!theState && onlineApp) {
         console.log("load Countries OR USA states list. element.scope: " + element.scope);

         console.log("element.columns: ");
         console.log(element.columns);
         //if (element.columns) {
         //   alert(element.columns.length); 
         //   alert("element.columns.length " + element.columns.length); // Error: Cannot read properties of undefined (reading 'length')
         //}
         waitForElm('#tabulator-statetable').then((elm) => {
            //alert("element.scope " + element.scope);
            //alert("element.columns.length inside " + element.columns.length);
             $("#tabulator-geotable").hide();
             $("#tabulator-statetable").show();
             // BUGBUG - TypeError: Cannot read properties of undefined (reading 'slice')
             // Not sure why this occurs when there is no state.
             // Example http://localhost:8887/apps/ev/#geoview=country
             
             statetable = new Tabulator("#tabulator-statetable", {
                data:dataForTabulator,    //load row data from array of objects
                layout:"fitColumns",      //fit columns to width of table
                responsiveLayout:"hide",  //hide columns that dont fit on the table
                tooltips:true,            //show tool tips on cells
                addRowPos:"top",          //when adding a new row, add it to the top of the table
                history:true,             //allow undo and redo actions on the table
                movableColumns:true,      //allow column order to be changed
                resizableRows:true,       //allow row order to be changed
                maxHeight:"500px",        // For frozenRows
                paginationSize:10000,
                columns:element.columns,
                selectable:true,
            });
            statetable.on("rowSelected", function(row){
                //alert(row._row.data.id);
                if (!currentRowIDs.includes(row._row.data.id)) {
                 currentRowIDs.push(row._row.data.id);
                }
                //if(hash.geo) {
                    //hash.geo = hash.geo + "," + currentRowIDs.toString();
                //  hash.geo = hash.geo + "," + row._row.data.id;
                //} else {
                if (hash.geo != currentRowIDs.toString()) {
                    hash.geo = currentRowIDs.toString();
                    console.log("Got hash.geo " + hash.geo);
                }
                if (row._row.data["Country Name"] == "United States") {
                    goHash({'geoview':'country'});
                } else if(!hash.geo && row._row.data.jurisdiction) {
                    if(row._row.data.jurisdiction == "Georgia") { // From state checkboxes
                        // Temp, later we'll pull from data file or dropdown.
                        row._row.data.state = "GA";
                    }
                    if (!row._row.data.state) {
                        // TO DO: Get the 2-char abbrev here from the row._row.data.jurisdiction (statename). Better would be to update the source data to include 2-char state.
                    }
                    if (!row._row.data.state) {
                        console.log('%cTO DO: add state abbreviation to data file. ', 'color: green; background: yellow; font-size: 14px');
                        // This prevents backing up.
                        goHash({'geoview':'state','geo':'','statename':row._row.data.jurisdiction});
                    } else {
                        console.log('%cTO DO: add support for multiple states. ', 'color: green; background: yellow; font-size: 14px');
                        goHash({'geoview':'state','geo':'','statename':'','state':row._row.data.state});
                    }
                } else {
                    goHash({'geo':hash.geo});
                }

            })
            statetable.on("rowDeselected", function(row){
                let filteredArray = currentRowIDs.filter(item => item !== row._row.data.id);
                if (hash.geo != filteredArray.toString()) {
                    hash.geo = filteredArray.toString();
                    goHash({'geo':hash.geo});
                }
            })
             
         }); // End wait for element #tabulator-statetable
        } // End typeof stateImpact != 'undefined'


        // EACH STATE'S COUNTIES
        if (theState) {

            //document.addEventListener("#tabulator-geotable", function(event) { // Wait for #tabulator-geotable div availability.

            waitForElm('#tabulator-geotable').then((elm) => {

                console.log("#tabulator-geotable available. State: " + hash.state + " element.scope: " + element.scope);

                $("#tabulator-statetable").hide();
                $("#tabulator-geotable").show();

                // Prevented up-down scrolling:
                // maxHeight:"100%",

                // More filter samples
                // https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes

                var columnArray;
                var rowData;
                if (hash.geoview == "zip") {
                    columnArray = [
                        {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                        {title:"ZIPCODE", field:"name"}
                    ];
                } else {
                    rowData = localObject.geo.filter(function(el){return el.state == theState.split(",")[0].toUpperCase();}); // load row data from array of objects
                    columnArray = [
                        {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                        {title:"County", field:"name", width:170},
                        {title:"Population", field:"pop", width:110, hozAlign:"right", headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false}},
                        {title:"Sq Miles", field:"sqmiles", width:90, hozAlign:"right", sorter:"number"},
                        {title:"Per Mile", field:"permile", width:100, hozAlign:"right", sorter:"number"},
                    ];
                }

                currentRowIDs = [];
                if(hash.geo) {
                	currentRowIDs = hash.geo.split(',');
                }
        		geotable = new Tabulator("#tabulator-geotable", {
        		    data:rowData,  
        		    layout:"fitColumns",      //fit columns to width of table - bug show dead space on right. bug 1/3 loads don't display without min-width:550px included
        		    responsiveLayout:"hide",  //hide columns that dont fit on the table
         		    //tooltips:true,            //show tool tips on cells
        		    addRowPos:"top",          //when adding a new row, add it to the top of the table
        		    history:true,             //allow undo and redo actions on the table
        		    movableColumns:true,      //allow column order to be changed
        		    resizableRows:true,       //allow row order to be changed
        		    initialSort:[             //set the initial sort order of the data - NOT WORKING
        		        {column:"pop", dir:"desc"},
        		    ],
                    frozenRows:1,
                    maxHeight:"500px", // For frozenRows
        		    paginationSize:10000,
        		    columns:columnArray,
        		    selectable:true,
        		});

        		geotable.on("rowSelected", function(row){
        			//alert(row._row.data.id);
                    if (!currentRowIDs.includes(row._row.data.id)) {
        			 currentRowIDs.push(row._row.data.id);
                    }
        			//if(hash.geo) {
			    		//hash.geo = hash.geo + "," + currentRowIDs.toString();
			    	//	hash.geo = hash.geo + "," + row._row.data.id;
			    	//} else {
			    	if (hash.geo != currentRowIDs.toString()) {
                        hash.geo = currentRowIDs.toString();
    			    	goHash({'geo':hash.geo});
                    }
        		})
        		geotable.on("rowDeselected", function(row){
        			currentRowIDs = currentRowIDs.filter(item => item !== row._row.data.id);
                    if (hash.geo != currentRowIDs.toString()) {
            			hash.geo = currentRowIDs.toString();
            			goHash({'geo':hash.geo});
                    }
        		})
                consoleLog("Tabulator list displayed. State: " + theState);
            }); // End wait for element #tabulator-geotable
        }
		//geotable.selectRow(geotable.getRows().filter(row => row.getData().name == 'Fulton County, GA'));
		//geotable.selectRow(geotable.getRows().filter(row => row.getData().name.includes('Ba')));

		// Place click-through on checkbox - allows hashchange to update row.
		//$('.tabulator-row input:checkbox').prop('pointer-events', 'none'); // Bug - this only checks visible
		

	} else {
	  attempts = attempts + 1;
      loadTabulator();
      if (attempts < 4000) {
      	// To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
        setTimeout( function() {
          showTabulatorList(element, attempts);
        }, 100 );
      } else {
        alert("Tabulator JS not available for displaying " + element.scope + ". (4000 attempts by navigation.js)")
      }
	}
}
function updateSelectedTableRows(geo, clear, attempts) {
    let hash = getHash();
    if (!hash.state) {
        console.log("ALERT - A state value is needed in the URL")
    } else {
    	if (typeof geotable.getRows === "function") {
            //alert("geotable.getRows === function")
            // #tabulator-geotable
        	//geotable.selectRow(geotable.getRows().filter(row => row.getData().name.includes('Ba')));
        	if (clear) {
                geotable.deselectRow(); // All
        	}
        	if (geo) {
    			$.each(geo.split(','), function(index, value) {
    				geotable.selectRow(geotable.getRows().filter(row => row.getData().id == value));
    			});
    		}
    		// Row Display Test - scroll down to see which rows were not initially in DOM.
        	//$('.tabulator-row input:checkbox').css('display', 'none');

        	//var selectedRows = ; //get array of currently selected row components.
        	let county_names = []
        	$.each(geotable.getSelectedRows(), function(index, value) {
        		// TODO - Group by state
        		county_names.push(value._row.data.name.split(",")[0].replace(" County",""));
        	});
        	console.log("county_names " + county_names.toString());
        	$(".counties_title").text(county_names.toString().replaceAll(",",", "));
        } else {
    	  attempts = attempts + 1;
          if (attempts < 200) {
          	// To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
            setTimeout( function() {
              updateSelectedTableRows(geo,clear,attempts);
            }, 20 );
          } else {
            alert("geotable.getRows not available after " + attempts + " attempts.")
          }
    	}
    }
}

// To remove, or use as fallback
function applyStupidTable(count) {
	console.log("applyStupidTable attempt " + count);

	if ($.fn.stupidtable) { // Prevents TypeError: $(...).stupidtable is not a function
		console.log("Table function available. Count " + count);
		//$("table").stupidtable();
		


		$("#county-table").stupidtable();
		//$("table2").stupidtable();
	} else if (count <= 100) {
		setTimeout( function() {
			applyStupidTable(count+1);
		}, 10 );
	} else {
		console.log("applyStupidTable attepts exceeded 100.");
	}
}

function activateMyLocation(limitByDistance) {
    $('#latLonFields').show();
    getLatLonFromBrowser(limitByDistance);
}
function getLatLonFromBrowser(limitByDistance) {
    // For when Leafet/Carto map is not in use.
    consoleLog("Refresh Latitude and Longitude");
    //if (chkGeoPosition) {
        // Get latitude and longitude
        $("#currentButtons").hide();
        if (navigator.geolocation) { // Browser supports lookup
            //Show loading icon
            $("#loadingLatLon").html('<div style="margin:0 10px 10px 0; padding-left:6px"><img src="https://map.georgia.org/explore/img/icons/loading-sm.gif" alt="Geo Loading" title="Geo Loading" style="width:18px;float:left;margin:14px 6px 0 0" /><div style="float:left;line-height:28px">Loading GeoLocation</div></div>');
            $("#loadingLatLon").show();

            navigator.geolocation.getCurrentPosition(function (position) {
                consoleLog(position.coords.latitude.toFixed(3));
                $("#lat").val(position.coords.latitude.toFixed(3));
                $("#lon").val(position.coords.longitude.toFixed(3));
                $(".mylat").val(position.coords.latitude.toFixed(3));
                $(".mylon").val(position.coords.longitude.toFixed(3));
                if (limitByDistance) { // Shows points within distance in dropdown menu.
                    consoleLog("limitByDistance");
                    distanceSearchType = 'latlon';
                    $("#currentButtons").show();
                    $('.searchText').show();
                    $('.goSearch').trigger("click");
                }
                $("#loadingLatLon").html('<div style="margin-right:10px"><img src="https://map.georgia.org/explore/img/icons/loading-sm.gif" alt="Geo Loading" title="Geo Loading" style="width:18px;float:left;margin:6px 6px 0 0" /><div style="float:left;line-height:40px">Recentering map</div></div>');
                setTimeout(function(){
                    $("#loadingLatLon").hide();
                }, 5000);
                
            }, function (error) {
                consoleLog(error);
                console.log('geolocation error occurred. Error code: ' + error.code);
                $("#loadingLatLon").html('Unable to fetch your geolocation.');
                $('.searchText').hide();

                // error.code 2 occurred when disconnected.
                //alert(error.code);
                //loadPageAsync(jsonFile);       
            });
            //alert('Break page'); // CAUTION - Putting an alert here breaks page.
        }
        if (!$("#lat").val()) {
            //alert("Approve geocoding at the top of your browser.");
        }
        //chkGeoPosition = false;
    //}
}


function hideLocationFilters() {
    $("#distanceField").hide();
    //$(".currentCities").hide(); // Avoid hiding when clicking addCity
    $("#zipFields").hide();
}
function removeCityFilter() {
    $('.cityTitleText').text("");
    $('.currentCities').hide();
    //$('.hideMainMenu').trigger("click");
    $(".cityCB").prop('checked', false);
    // Also need to update URL.
}
function hideLocationsMenu() {
    $('.listHolder').hide();
}
function populateCityList(callback) {
    //$(".menuPanel").hide(); // Also called from loadStateCounties
    $(".countyList").hide();

    if ($('.cityList').length > 0) { // Already populated
        return;
    }
    console.log("cityList");
    var file = "https://map.georgia.org/explore/menu/data/cities.csv";
    $.get(file, function(data) {
        var cityList;
        var lines = data.split('\n');

        var n = $('<div class="sideSelectList cityList"></div>');      
        //n.append('<label for="county-' + r[columnName] + '" class="countyLabel"><input type="checkbox" class="countyCB" name="countyCB" id="county-' + r[columnName] + '" value="' + r[columnName] + '" economic_region="' + r["economic_region"] + '" wia_region="' + r["wia_region"] + '">' + r[columnName] + ' County</label>');
        //$('.countyList').append(n);

        $.each(lines, function (lineNo, line) {
            var items = line.split(',');
            //cityList +=  + "," + items[2] + "<br>";
            if (lineNo > 0 && items[1]) {
                n.append('<label for="city-' + items[1].toLowerCase() + '"><input type="checkbox" class="cityCB" name="cityCB" id="city-' + items[1].toLowerCase() + '" value="' + items[1].toLowerCase() + '" data-latitude="' + items[2] + '" data-longitude="' + items[3] + '">' + items[1] + '</label><br>');
            }
        });
        $(".listHolder").append(n);

        // We avoid showing .listHolder here because sometime list is populated without displaying.
        $('.cityList :checkbox').change(function () {
            $('#goSearch').trigger("click");
        });
        $('.cityText').click(function(event) {
            locationFilterChange("city");          
        });
        callback('done');
    });
}


// UPPER ("extra" in display)
// Some may go in search-display.js

function SearchFormTextCheck(t, dirn) {
	if (dirn == 1 && t.value == "") {
		t.value = "";
		$(".fieldSelector").show();
		//console.log('boo');
	}
	//return false;
	event.stopPropagation();
}

function SearchEnter(event1) {
	var kCode = String.fromCharCode(event1.keyCode);
	////if (kCode == "\n" || kCode == "\r") {

        // Reactivate on pages where auto-update appropriate.
        //$("#goSearch").click();

	////	return false;
	////}
}
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}
String.prototype.split2 = function(separator) {
    return this == "" ? [] : this.split(separator); // Avoid returning 1 when null.
}
function displayRow(rowArray) {
	// NOT USED?
	// <input name='contact' type='checkbox' value='" + rowArray[0] + "'> 
	$("#dataList").append( "<div><div><div style='float:right'>Add</div>" + rowArray[0] + "</div><div><b class='exporter'>Export Categories: </b><span class='exporter'> " + rowArray[2] + "</span></div><div>" + rowArray[3] + "</div><div>" + rowArray[4] + "</div><div><b>Product HS Codes: </b>" + rowArray[5] + "</div></div>");
	//<div>" + rowArray[6] + "</div><div>" + rowArray[7] + "</div>
}

var dataSet = [];

function displayListX() {
	console.log("displayList");
	var matchCount = 0;

	$("#dataList").html("");
	for(var i = 0; i < dataSet.length; i++) {
      	if (i > 2) {
      		//if (entry[0] > (startRange*100) && entry[0] < (endRange*100+99)) {
		    	matchCount++;
		    	// <input name='contact' type='checkbox' value='" + dataSet[i][0] + "'> 
		    	$("#dataList").append( "<div><div style='float:right'>Add<div></div>" + dataSet[i][0] + "</div><div><b class='exporter'>Export Categories: </b><span class='exporter'> " + dataSet[i][2] + "</span></div><div><b>Description: </b>" + dataSet[i][3] + "</div>");
		    	$("#dataList").append( "<div><b>Product HS Codes: </b>" + dataSet[i][5] + "</div></div>");
		    		//<div>" + dataSet[i][6] + "</div><div>" + dataSet[i][7] + "</div>
			//}
      	}
      	if (matchCount > 0) {
      		$("#resultsPanel").show();
      	}
     }
     if (matchCount > 0) {
  		$("#resultsPanel").show();
  	}
}

function changeCat(catTitle) {
    if (catTitle) {
    	catTitle = catTitle.replace(/_/g, ' ');
    }
    //$('#catSearch').val(catTitle);
    //alert("changeCat catTitle1 " + catTitle)
    $('#catSearchText').text(catTitle);
	$('#items').prop("checked", true); // Add front to parameter name.

    $('.catList > div').removeClass('catListSelected');

    // Side nav with title attribut
    if (catTitle) {
        $('.catList div[ title="' + catTitle + '" ]').addClass("catListSelected");
    } else {
        $('.catList .all_categories').addClass('catListSelected');
    }
	$("#topPanel").hide();
	$('#catListHolderShow').text('Product Categories');
	//$('html,body').animate({
	//    scrollTop: $("#hublist").offset().top - 250
	//});
}

function changeCatDelete(catTitle) {
  $('#catSearch').val(catTitle);

  $('#items').prop("checked", true); // Add front to parameter name.

  //$('#industryCatList > div').removeClass('catListSelected');

  $('.catList > div').filter(function(){
      return $(this).text() === catTitle
  }).addClass('catListSelected');

  $("#topPanel").hide();
  $('#catListHolderShow').text('Product Categories');
  //$('html,body').animate({
  //    scrollTop: $("#hublist").offset().top - 250
  //});
}

$(document).ready(function () {

    if (param["show"] == "mockup" || param["mockup"] || param["design"]) {
    	// Phase out .mock-up and switch to .mockup
    var div = $("<div />", {
        html: '<style>.mock-up{display: block !important;}.mockup{display: block !important;}</style>'
      }).appendTo("body");
    }
    if (param["show"] == "suppliers") {
    //var div = $("<div />", {
    //    html: '<style>.suppliers{display:inline !important;}</style>'
    //}).appendTo("body");
    $(".suppliers").show();
    }

    if (param["show"] == "produce") {
    $('.addlisting').show();
    }

    $('#catListClone').html($('#industryCatList').clone());

    $(document).on("click", ".catList > div", function(event) {
    var catTitle = $(this).text();
    if ($(this).attr("title")) {
        catTitle = $(this).attr("title");
    }
    var catString = catTitle.replace(/ /g, '_').replace(/&/g, '%26');
    $("#bigThumbPanelHolder").hide();
    $(".showApps").removeClass("filterClickActive");
    //updateHash({'appview':''});
    if (catString == "All_Categories") {
        hash.cat = "";
        catString = "";
    } else {
        console.log("catList triggers update. cat: " + catString);
        // Too soon here
        //clearListDisplay();
    }
    goHash({"cat":catString,"subcat":"","name":""}); // Let the hash change trigger updates
    event.stopPropagation();
    });
    $('.toggleListOptions').click(function(event) {
      if ($('.toggleListOptions').hasClass("expand")) {
          $('.toggleListOptions').removeClass("expand");
          $('.listOptions').hide();
      } else {
          $('.toggleListOptions').addClass("expand");
          if ($(".listPanel").is(':visible')) {
              $('.listOptions .hideList').show();
          } else {
              $('.listOptions .hideList').hide();
          }
          $('.listOptions').show();
      }
      event.stopPropagation();
    });

    // If this does not work, may need to call when map1 is initially loaded, but only once.
    $('.refreshMap').click(function(event) {

    	  alert("Not fully implemented.")
      //$("#map1").show();
      //displayMap(layerName, localObject.layers);
      $(".listOptions").hide();
      console.log(".refreshMap ");

      if (document.querySelector('#geomap')._leaflet_map) {
      	document.querySelector('#geomap')._leaflet_map.invalidateSize(); // Force Leaflet map to reload
      } else {
      	console.log("document.querySelector('#geomap')._leaflet_map not found");

        // To try as alternative. Not yet tested.
        /*
        if (map1) {
            map1.invalidateSize(); // Refresh map tiles.
        }
        if (map2) {
            map2.invalidateSize(); // Refresh map tiles.
        }
        */

      }
      document.querySelector('#map1')._leaflet_map.invalidateSize(); 
      document.querySelector('#map2')._leaflet_map.invalidateSize(); 



    });
    if (window.self == window.top && param["show"] == "suppliers") {
      $("#suppliers_noiframe").show();
    }

	$('.sendfeedback').click(function(event) {
	  window.open(local_app.localsite_root() + "/info/input/",'_parent');
	  event.stopPropagation();
	});

	$('.addlisting').click(function(event) {
	  window.location = "https://www.ams.usda.gov/services/local-regional/food-directories-update";
	  event.stopPropagation();
	});
	$('.go_map').click(function(event) {
	  goHash({'geoview':'country'});
	  window.scrollTo({
	      top: $('#map1').offset().top,
	      left: 0
	    });
	});
	$('.go_list').click(function(event) {
	  window.scrollTo({
	      top: $('#detaillist').offset().top,
	      left: 0
	    });
	});
	$('.go_local').click(function(event) {
	  window.scrollTo({
	      top: $('#mapHolder').offset().top - 95,
	      left: 0
	    });
	  $("#sidemapCard").show(); // map2
	});
	$('.go_search').click(function(event) {
	  window.scrollTo({
	      top: 0,
	      left: 0
	    });
	});
});


// These is missing var promises = [] and ready.
// Let's look at Industry Mix first: http://localhost:8887/community/zip/leaflet/#columns=JobsAgriculture:50;JobsManufacturing:50
//var geojsonLayer;
function renderMapShapesSimple(whichmap, hash) {
	console.log("renderMapShapesSimple " + whichmap);
	let map = document.querySelector('#' + whichmap)._leaflet_map; 
	//alert("renderMapShapesSimple " + whichmap);
	//if (geojsonLayer) {
		//alert("found geojsonLayer")
	  	// Problem, this removes the whole layer, shapes and all.
		//map.removeLayer(geojsonLayer); // Remove the prior topo layer
	//}
}

// This could be reactivated to merge another dataset to map popups
function mergeInDetailData(topodata,detail_data) {
  var data_by_id = d3.nest() // where id is a zipcode or countyID
    .key(function(d){return d.zcta;})
    .entries(detail_data);

  topodata.features.forEach(function(d) {
        // d.properties.zip becomes d.properties.COUNTYFP
        var topoID = data_by_id.find(x=>x.key === d.properties.COUNTYFP.replace(/^0+/, ''));
        if(topoID) {
            columns.forEach(function(c){
                d[c] = parseFloat(topoID.values[0][c]);
            });
            cluster_data.push(d); // Topo shape data now has census attributes added, including zcta
        }
  });
  return cluster_data;
}

function isElementInViewport(el) {

    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}
function localJsonpCallback(json) {
  if (!json.Error) {
    //$('#resultForm').submit();
  } else {
    //$('#loading').hide();
    //$('#userForm').show();
    alert(json.Message);
  }
}

// INIT
// BUGBUG - param is not available here
/*
if(!param.state) {
    local_app.loctitle = "United States";
}
if(!param.show) {
    local_app.showtitle = "Industries";
}
*/

/* Allows map to remove selected shapes when backing up. */
document.addEventListener('hashChangeEvent', function (elem) {
	console.log("navigation.js detects URL hashChangeEvent");
 	hashChanged();
}, false);

if(typeof hiddenhash == 'undefined') {
    var hiddenhash = {};
}
function updateRegionService(section) {

    //alert("updateRegionService");
    let theLocation = hash.regiontitle;
    if (!theLocation) {
        let theStateName = $("#state_select").find(":selected").text();
        if (theStateName) {
            theLocation = theStateName;
            //alert("theLocation " + theLocation)
        } else if (hash.state) {
            theLocation = hash.state;
            waitForElm('#state_select').then((elm) => {
                //$("#state_select").val(param.state.split(",")[0]);
                //alert(param.state.split(",")[0])applyNavigation();
                //if ($("#state_select").find(":selected").value) {
                //    alert("found #state_select");
                //    updateRegionService(section);
                //}
            });
        }
    }
    if (theLocation) {
        $(".region_service").text(theLocation + " - " + section);
    } else {
        $(".region_service").text(section);
    }
}

// INIT

$(document).ready(function () {

    // Wait for localsite.js
    hashChanged(); // Ideally this resides before $(document).ready, but we'll need a copy of waitForVariable here

	let hash = getHash();
	if (hash.state) {
		let stateAbbrev = hash.state.split(",")[0].toUpperCase();
		$("#state_select").val(stateAbbrev);
	}
	if (hash.regiontitle) {
		$("#region_select").val(hash.regiontitle);
	}
});

// For stateImpact colors
var colorTheStateCarbon = "#fcc"; // pink
var colorTheCountry = "#ccf" // lite blue
//loadScript(theroot + 'js/d3.v5.min.js', function(results) { // Allows lists to be displayed before maps
  // TODO: Apply the colors after list loaded
  /*
  colorTheStateCarbon = d3.scaleThreshold()
      .domain(d3.range(2, 10))
      .range(d3.schemeBlues[9]);
  colorTheCountry = d3.scaleThreshold()
      .domain(d3.range(2, 1000000))
      .range(d3.schemeBlues[9]);
  */
//});

function styleShape(feature) { // Called FOR EACH topojson row

  let hash = getHash(); // To do: pass in as parameter
  //console.log("feature: ", feature)

  var fillColor = 'rgb(51, 136, 255)'; // 
  // For hover '#665';
  
  // REGION COLORS: See community/start/map/counties.html for colored region sample.

  /*
    dp.data.forEach(function(datarow) { // For each county row from the region lookup table
      if (datarow.county_num == feature.properties.COUNTYFP) {
        fillColor = color(datarow.io_region);
      }
    })
  */
  let stateID = getIDfromStateName(feature.properties.name);
  let fillOpacity = .05;
  if (hash.geo && hash.geo.includes("US" + feature.properties.STATEFP + feature.properties.COUNTYFP)) {
      fillColor = 'purple';
      fillOpacity = .2;
  } else if (hash.geoview == "country" && hash.state && hash.state.includes(stateID)) {
      fillColor = 'red';
      fillOpacity = .2;

      fillColor = 'white';
      fillOpacity = 0;

  } else if (hash.geoview == "countries") {
      let theValue = 2;
      //console.log("country: " + (feature.properties.name));
      if (localObject.countries && localObject.countries[feature.id]) {
        //alert("Country 2020 " + localObject.countries[feature.id]["2020"]);
        theValue = localObject.countries[feature.id]["2020"];
      }
      // TO DO - Adjust for 2e-7
      theValue = theValue/10000000;
      //fillColor = colorTheCountry(theValue);
      fillColor = colorTheCountry;
      //console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
      fillOpacity = .5;
  } else if ((hash.geoview == "country" || (hash.geoview == "state" && !hash.state)) && typeof localObject.state != 'undefined') {
      let theValue = 2;
       if (localObject.state[getState(stateID)] && localObject.state[getState(stateID)].CO2_per_capita != "No data") {
        //console.log("state: " + stateID + " " + getState(stateID));
        //console.log("state: " + stateID + " " + localObject.state[getState(stateID)].CO2_per_capita);
        theValue = localObject.state[getState(stateID)].CO2_per_capita;
      }
      theValue = theValue/4; // Ranges from 0 to 26
      //fillColor = colorTheStateCarbon(theValue); // Stopped working. Wasn't a function. Maybe try to reactivate.
      fillColor = colorTheStateCarbon;
      //console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
      fillOpacity = .5;
  } return {
      weight: 1,
      opacity: .4,
      color: fillColor, // '#ccc', // 'white'
      //dashArray: '3',
      fillOpacity: fillOpacity,
      fillColor: fillColor
  };
}



///// NAVIGATION

// Site specific settings
// Maintained in localsite/js/navigation.js
//alert("navigation.js param.state " + param.state);
var navigationJsLoaded = "true";
if(typeof page_scripts == 'undefined') {  // Wraps script below to insure navigation.js is only loaded once.
if(typeof localObject == 'undefined') { var localObject = {};}
if(typeof localObject.layers == 'undefined') {
    localObject.layers = {}; // Holds layers.
}
const page_scripts = document.getElementsByTagName("script");
let earthFooter = false;
let showLeftIcon = false;
if(typeof param=='undefined'){ var param={}; }

if (window.location.protocol != 'https:' && location.host.indexOf('localhost') < 0) {
	location.href = location.href.replace("http://", "https://");
}
// Get the levels below root
var foldercount = (location.pathname.split('/').length - 1); // - (location.pathname[location.pathname.length - 1] == '/' ? 1 : 0) // Removed because ending with slash or filename does not effect levels. Increased -1 to -2.
foldercount = foldercount - 2;
var climbcount = foldercount;
if(location.host.indexOf('localhost') >= 0) {
	//climbcount = foldercount - 0;
}
var climbpath = "";
for (var i = 0; i < climbcount; i++) {
	climbpath += "../";
}
if (climbpath == "") {
	//climbpath += "./"; // Eliminates ? portion of URL
	console.log("climbpath = '', set to '../'")
	climbpath += "../";
}
//console.log("climbpath " + climbpath);

var modelpath = climbpath;
if (modelpath == "./") {
	//modelpath = "";
}
var modelroot = ""; // For links that start with /

if(location.host.indexOf('localhost') < 0 && location.host.indexOf('model.') < 0 && location.host.indexOf('neighborhood.org') < 0) { // When not localhost or other site that has a fork of io and community.
	// To do: allow "Input-Output Map" link in footer to remain relative.
	modelpath = "https://model.earth/" + modelpath; // Avoid - gets applied to #headerSiteTitle and hamburger menu
	modelroot = "https://model.earth";
}
console.log("modelpath " + modelpath);


function waitForVariableNav(variable, callback) { // Declare variable using var since let will not be detected.
  var interval = setInterval(function() {
    if (window[variable]) {
      clearInterval(interval);
      consoleLog('waitForVariable found ' + variable);
      callback();
      return;
    }
    consoleLog('waitForVariable waiting ' + variable);
  }, 80);
}

// INIT
waitForVariableNav('localStart', function() {
    if (typeof localObject.navigationLoaded == "undefined") {
        // Initial load. Prevents reload if navigation.js is placed on page without id.
        localObject.navigationLoaded = true; // Var so universally available.
    } else {
        console.log("ALERT! navigation.js already loaded. Add an id in the javascript include. Or remove navigation.js since localsite.js loads.");
        return;
    }
    applyNavigation();
});

// Not in use, but might be cool to use
function displayHexagonMenu(layerName, localObject) {

  var currentAccess = 0;
  consoleLog("Display HEXAGON MENU");

  $("#honeycombMenu").html(""); // Clear prior
  $("#honeycombPanel").show();
  var thelayers = localObject.layers;
  //console.log(thelayers);
  var sectionMenu = "";
  var categoryMenu = "";
  //var iconMenu = "";
  var layer;
  for(layer in thelayers) {

        var menuaccess = 10; // no one
        menuaccess = 0; //Temp
        try { // For IE error. Might not be necessary.
            if (typeof(localObject.layers[layer].menuaccess) === "undefined") {
                menuaccess = 0;
            } else {
                menuaccess = localObject.layers[layer].menuaccess;
            }
        } catch(e) {
            consoleLog("displayLayerCheckboxes: no menuaccess");
        }
        if (access(currentAccess,menuaccess)) {
            if (localObject.layers[layer].menulevel == "1") {
            //var layerTitleAndArrow = (thelayers[layer].navtitle ? thelayers[layer].navtitle : thelayers[layer].title);
            var layerTitleAndArrow = thelayers[layer].section;
                var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
             if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
                // <h1 class='honeyTitle'>" + thelayers[layer].provider + "</h1>
                sectionMenu += "<li class='hex'><a class='hexIn hash-changer' href='#" + thelayers[layer].item + "'><img src='" + removeFrontFolder(thelayers[layer].image) + "' alt='' /> <p class='honeySubtitle'>" + layerTitleAndArrow + "</p></a></li>";
                }
            }
        }
  }
  $("#honeycombMenu").append("<ul id='hexGrid'>" + sectionMenu + "</ul>"); // Resides in template-main.html
  $("#bigThumbPanelHolder").show();
  //$("#iconMenu").append(iconMenu);
    $("#honeyMenuHolder").show();
}
function thumbClick(show,path) {
    let hash = getHashOnly(); // Not hiddenhash
	let priorShow = hash.show;
	hash.show = show;
	if (!hash.state && param.state) {
		hash.state = param.state; // At least until states are pulled from geo values.
	}
	delete hash.cat;
	delete hash.naics;
	delete hash.name;
	delete hash.details;
	delete hash.m; // Birdseye view
    let pageContainsInfoWidgets = false;
    if ($("#iogrid").length >= 0 || $("#sector-list").length >= 0) {
        pageContainsInfoWidgets = true; // Stay on the current page if it contains widgets.
    }
    // !pageContainsInfoWidgets && // Prevented bioeconomy from leaving map page.
	if (path && !window.location.pathname.includes(path)) {
        // Leave current page
		var hashString = decodeURIComponent($.param(hash));
		window.location = "/localsite/" + path + "#" + hashString;
	} else { // Remain in current page
		if (show != priorShow) {
	        delete hiddenhash.show;
	        delete hiddenhash.naics;
	        delete param.show;
	        if (typeof params != 'undefined') {
	            delete params.show;
	        }
	    }
	    $(".bigThumbMenuContent").removeClass("bigThumbActive");
		$(".bigThumbMenuContent[show='" + show +"']").addClass("bigThumbActive");
        console.log(hash);
		goHash(hash,"name,loc"); // Remove name and loc (loc is not used yet)
	}
}

function closeExpandedMenus(menuClicked) {
    $(".rightTopMenuInner div").removeClass("active");
    $(menuClicked).addClass("active");
    $(".menuExpanded").hide(); // Hide any open
    //alert("rightTopMenuInner 3");
}
function showNavColumn() {
	console.log("showNavColumn");
	$("#sideIcons").hide();
	$("#navcolumn").show(); $("#showSideInBar").hide();
	if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded.
		if ($("#listcolumn").is(":visible")) {
			$('body').addClass('bodyLeftMarginFull'); // Creates margin on left for both fixed side columns.
			$('#listcolumn').removeClass('listcolumnOnly');
		}
	}
	$("#showSideInBar").hide();
	if(document.getElementById("containerLayout") != null) {
		$('#navcolumn').addClass("navcolumnClear");
		$('body').addClass('bodyLeftMarginNone');
	} else {
		$("#fullcolumn #showNavColumn").hide();
		$('body').addClass('bodyLeftMargin'); // Margin on left for fixed nav column.
        if ($('body').hasClass('bodyRightMargin')) {
		  $('body').addClass('mobileView');
        }
		// Refreshs to load map tiles. Worked at one point.
		// Maybe vars map1 and map2 need to be called directly? They are now declaired universally.
		// Test is we need this with mobile.
		if (document.querySelector('#map1')._leaflet_map) {
			document.querySelector('#map1')._leaflet_map.invalidateSize(); // Refresh map tiles.
		}
		if (document.querySelector('#map2')._leaflet_map) {
			document.querySelector('#map2')._leaflet_map.invalidateSize(); // Refresh map tiles.
		}
	}
}
function applyNavigation() { // Called by localsite.js so local_app path is available.

	// To do: fetch the existing background-image.
    
	let hash = getHash();
    const changeFavicon = link => { // var for Safari
      let $favicon = document.querySelector('link[rel="icon"]')
      // If a <link rel="icon"> element already exists,
      // change its href to the given link.
      if ($favicon !== null) {
        $favicon.href = link
        // Otherwise, create a new element and append it to <head>.
      } else {
        $favicon = document.createElement("link")
        $favicon.rel = "icon"
        $favicon.href = link
        document.head.appendChild($favicon)
      }
    }
    if (location.href.indexOf("dreamstudio") >= 0 || param.startTitle == "DreamStudio" || location.href.indexOf("/swarm/") >= 0) {
		localsiteTitle = "DreamStudio";
		$(".siteTitleShort").text("DreamStudio");
		param.titleArray = [];
		//param.headerLogo = "<a href='https://dreamstudio.com'><img src='https://dreamstudio.com/dreamstudio/img/logo/dreamstudio-text.png' style='height:23px'></a>";
		
		let siteRoot = "";
		if (location.host.indexOf("localhost") >= 0) {
			siteRoot = "/dreamstudio";
		}
		param.headerLogo = "<a href='" + siteRoot + "/'><img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'><img src='/storyboard/img/logo/ds/dreamstudio-text.png' alt='DreamStudio' style='height:22px; margin-top:9px' class='headerLogoDesktop'></a>";
		param.headerLogoNoText = "<img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'>";
		if (location.href.indexOf("/seasons") >= 0) {
            changeFavicon("/storyboard/img/logo/ds/faveye.png");
            param.headerLogo = "<a href='" + siteRoot + "/'><img src='/storyboard/img/logo/ds/faveye.png' style='float:left;width:38px;margin-right:7px'><img src='/storyboard/img/logo/ds/dreamstudio-text.png' alt='DreamStudio' style='height:22px; margin-top:9px' class='headerLogoDesktop'></a>";
        } else {
            changeFavicon("/localsite/img/logo/apps/dreamstudio.png");
        }
        if (location.host.indexOf("dreamstudio") >= 0) {
			//param.headerLogo = param.headerLogo.replace(/\/dreamstudio\//g,"\/");
		}
		
		showClassInline(".dreamstudio");
		if (location.host.indexOf('localhost') >= 0) {
			//showClassInline(".earth");
		}

	} else if (location.href.indexOf("atlanta") >= 0) {
        showLeftIcon = true;
        $(".siteTitleShort").text("Civic Tech Atlanta");
        param.titleArray = ["civic tech","atlanta"]
        param.headerLogo = "<a href='https://codeforatlanta.org'><img src='/community/img/logo/orgs/civic-tech-atlanta-text.png' style='width:186px;padding-top:8px'></a>";
        
        localsiteTitle = "Civic Tech Atlanta";
        changeFavicon("/localsite/img/logo/apps/neighborhood.png")
        showClassInline(".neighborhood");
        earthFooter = true;
        showClassInline(".georgia"); // Temp side nav
        showClassInline(".earth"); // Temp side nav

	} else if (defaultState == "GA" && !Array.isArray(param.titleArray) && (location.host.indexOf('localhost') >= 0 && navigator && navigator.brave) || param.startTitle == "Georgia.org" || location.host.indexOf("georgia") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) {
		// The localsite repo is open to use by any state or country.
		// Georgia Economic Development has been a primary contributor.
		// Show locally for Brave Browser only - insert before:  ) || false
		// && navigator && navigator.brave
		if (!param.state && !hash.state) {
			if (param.geoview != "earth") {
				if (onlineApp && defaultState) {
					param.state = defaultState; // For longer displayBigThumbnails menu in navigation.js
				}
			}
		}
		showLeftIcon = true;
		$(".siteTitleShort").text("Model Georgia");
		param.titleArray = [];
		console.log("local_app.localsite_root() " + local_app.localsite_root()); // https://model.earth was in here: https://map.georgia.org/localsite/map/#show=recyclers
		param.headerLogo = "<a href='https://georgia.org'><img src='/localsite/img/logo/states/GA.png' style='width:140px;padding-top:4px'></a>";
		param.headerLogoNoText = "<a href='https://georgia.org'><img src='/localsite/img/logo/states/GA-notext.png' style='width:50px;padding-top:0px;margin-top:-1px'></a>";
		localsiteTitle = "Georgia.org";
		changeFavicon("/localsite/img/logo/states/GA-favicon.png");
		if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
			showClassInline(".acct");
			showClassInline(".garesource");
		} else if (hash.state == "GA") {
            //showClassInline(".garesource");
        }
		showClassInline(".georgia");
		if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
			showClassInline(".earth");
		}
		$('#headerOffset').css('display', 'block'); // Show under site's Drupal header

		earthFooter = true;

	} else if (!Array.isArray(param.titleArray) && (param.startTitle == "Neighborhood.org" || location.host.indexOf('neighborhood.org') >= 0)) {
		showLeftIcon = true;
		$(".siteTitleShort").text("Neighborhood Modeling");
		param.titleArray = ["neighbor","hood"]
		param.headerLogoSmall = "<img src='/localsite/img/logo/apps/neighborhood.png' style='width:40px;opacity:0.7'>"
		localsiteTitle = "Neighborhood.org";
		changeFavicon("/localsite/img/logo/apps/neighborhood.png")
		showClassInline(".neighborhood");
		earthFooter = true;
	} else if (!Array.isArray(param.titleArray) && (location.host.indexOf("democracy.lab") >= 0)) {
		showLeftIcon = true;
		$(".siteTitleShort").text("Democracy Lab");

		param.headerLogo = "<img src='/localsite/img/logo/partners/democracy-lab.png' style='width:190px;margin-top:15px'>";
		param.headerLogoSmall = "<img src='/localsite/img/logo/partners/democracy-lab-icon.jpg' style='width:32px;margin:4px 8px 0 0'>";
		showClassInline(".dlab'");
		earthFooter = true;
	} else if (!Array.isArray(param.titleArray) && !param.headerLogo) {
	//} else if (location.host.indexOf('model.earth') >= 0) {
		showLeftIcon = true;
		if (location.host.indexOf("planet.live") >= 0) {
			$(".siteTitleShort").text("Planet Live");
			param.titleArray = ["planet","live"]
			localsiteTitle = "Planet Live";
		} else {
			$(".siteTitleShort").text("Model Earth");
			param.titleArray = ["model","earth"]
			localsiteTitle = "Model Earth";
		}
		param.headerLogoSmall = "<img src='/localsite/img/logo/earth/model-earth.png' style='width:34px; margin-right:2px'>";
		changeFavicon(modelpath + "../localsite/img/logo/earth/model-earth.png")
		showClassInline(".earth");
		console.log(".earth display");
		earthFooter = true;
	}

	if (document.title) {
 		document.title = localsiteTitle + " - " + document.title;
 	} else {
 		document.title = localsiteTitle;
 	}

	if (location.host.indexOf('model.earth') >= 0) { // Since above might not be detecting model.earth, probably is now.
		showLeftIcon = true;
		earthFooter = true;
	}

	if (param.footer || param.showfooter == false) {
		earthFooter = false;
		console.log("param.footer " + param.footer);
	}
	// Load when body div becomes available, faster than waiting for all DOM .js files to load.
   	waitForElm('#bodyloaded').then((elm) => {
	 	$("body").wrapInner( "<div id='fullcolumn'></div>"); // Creates space for navcolumn
	 	
	 	
	 	$("body").addClass("flexbody"); // For footer to stick at bottom on short pages
	 	$("body").wrapInner("<main class='flexmain' style='position:relative'></main>"); // To stick footer to bottom
	 	// min-height allows header to serve as #filterbaroffset when header.html not loaded
	 	// pointer-events:none; // Avoid because sub-divs inherite and settings dropdowns are then not clickable.
	 	if(document.getElementById("datascape") == null) {
			$("#fullcolumn").prepend("<div id='datascape' class='datascape'></div>\r");
		}
 	});
	waitForElm('#datascape').then((elm) => {
		let listColumnElement = "<div id='listcolumn' class='listcolumn pagecolumn sidelist pagecolumnLower' style='display:none'><div class='listHeader'><div class='hideSideList close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><h1 class='listTitle'></h1><div class='listSubtitle'></div><div class='sideListSpecs'></div></div><div id='listmain'><div id='listcolumnList'></div></div><div id='listInfo' class='listInfo content'></div></div>\r";
		if(document.getElementById("datascape") != null || document.getElementById("datascape1") != null) {
			$("#datascape").addClass("datascape");
			$("#datascape").addClass("datascapeEmbed");
			$("#fullcolumn > #datascape").removeClass("datascapeEmbed");  // When #datascape is NOT embedded.
			if (!$("#datascape").hasClass("datascapeEmbed")) {
				$("#datascape").addClass("datascapeTop");
			}

			$('body').removeClass('bodyLeftMarginFull'); // Gets added back if navcolumn is displayed.
			// Wait for template to be loaded so it doesn't overwrite listcolumn in #datascape.
			//waitForElm('#insertedText').then((elm) => {
			waitForElm('#fullcolumn > .datascapeTop').then((elm) => { // When #datascape is NOT embedded.
				// Place list in left margin for whole page use.
				//$("#datascape").prepend(listColumnElement);
				$("body").prepend(listColumnElement);
				listColumnElement = "";
				//$('body').addClass('bodyLeftMarginFull'); // Avoid here. Places gap on /community
			});
			
		} else {
			console.log("#datascape not available");
		}
		if(document.getElementById("navcolumn") == null) {
			let prependTo = "#datascape";
			// BUG #fullcolumn > .datascape does not seem to be loaded yet
			if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
				console.log("Not embed");
				//prependTo = "body"; // Might not have worked intermintantly for the following prepend here: http://localhost:8887/recycling/
			}
			// min-height added since ds.ai html cropping to short side
			$(prependTo).prepend("<div id='navcolumn' class='navcolumn pagecolumn pagecolumnLower greyDiv noprint sidecolumnLeft liteDiv' style='display:none; min-height:300px'><div class='hideSide close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><div class='navcolumnBar'></div><div class='sidecolumnLeftScroll'><div id='navcolumnTitle' class='maincat'></div><div id='listLeft'></div><div id='cloneLeftTarget'></div></div></div>" + listColumnElement); //  listColumnElement will be blank if already applied above.
	 	} else {
	 		// TODO - change to fixed when side reaches top of page
	 		console.log("navigation.js report: navcolumn already exists")
	 		$("#navcolumn").addClass("navcolumn-inpage");
	 	}

	 	$(document).on("click", ".showNavColumn", function(event) {
	 		console.log(".showNavColumn click");
			if ($("#navcolumn").is(':hidden')) {
				showNavColumn();
			} else {
				$("#navcolumn").hide();
				$("#showNavColumn").show();$("#showSideInBar").hide();
				$('body').removeClass('bodyLeftMargin');
				$('body').removeClass('bodyLeftMarginFull');
				if (!$('body').hasClass('bodyRightMargin')) {
		        	$('body').removeClass('mobileView');
		    	}
			}
			let headerFixedHeight = $("#headerLarge").height();
			$('#cloneLeft').css("top",headerFixedHeight + "px");
		});
		$(document).on("click", ".hideSideList", function(event) {
	 		hideSide("list");
		});
	 	$(document).on("click", ".hideSide", function(event) {
	 		hideSide("");
		});

		$(document).on("click", ".showNavColumn, #navcolumn", function(event) {
		  event.stopPropagation();
		});
		$(document).on('click', function(event) {
			if ($("#navcolumn").is(':visible')) {
				if ($('#fullcolumn').width() <= 800) {
			  		hideSide();
				}
			}
		});
	 	if (param["showapps"] && param["showapps"] == "false") {
	 		$(".showApps").hide();
			$("#appSelectHolder").hide();
	 	}
	 	if (param["showheader"] && param["showheader"] == "false") {

			//$(".filterPanel").addClass("filterPanel_fixed"); // This cause everything but top nav to disappear.
			//$(".filterbarOffset").hide();
			$(".headerOffset").hide();
			$("#headeroffset").hide();
			$(".headerOffset").hide();
			$("#headerbar").addClass("headerbarhide");

			// Insert for map filters since header.html file is not loaded.
			//$("body").prepend( "<div id='filterbaroffset' style='height:56px; pointer-events:none'></div>");

			// TO DO: Add support for custom headerpath

	 	} else {

	 		$(".headerOffset").show();
			$("#headeroffset").show();
			$(".headerOffset").show();

	 		// LOAD HEADER.HTML
	 		//if (earthFooter) {
		 		let headerFile;

                /*
                const current_code_path = page_scripts[page_scripts.length-1].src;
                console.log("current_code_path " + current_code_path);
                const slash_count = (current_code_path.match(/\//g) || []).length; // To set path to header.html
		 		if (slash_count <= 4) { // Folder is the root of site
		 			// Currently avoid since "https://model.earth/" is prepended to climbpath above.
		 			//headerFile = climbpath + "../header.html";
		 		}
		 		*/

		 		if (param.header) {
					headerFile = modelroot + param.header;
				} else if (param.headerFile) {
		 			modelpath = ""; // Use the current repo when custom headerFile provided. Allows for site to reside within repo.
		 			headerFile = param.headerFile;
				} else {
					headerFile = modelroot + "/localsite/header.html";
				}

				//if (earthFooter && param.showSideTabs != "false") { // Sites includieng modelearth and neighborhood
				// 	$(".showSideTabs").show(); // Before load headerFile for faster display.
				//}
				if (headerFile) {
					// headerFile contains only navigation
					//alert("headerFile " + headerFile);
					waitForElm('#local-header').then((elm) => { 
					$("#local-header").load(headerFile, function( response, status, xhr ) {
						//alert("headerFile loaded");
						waitForElm('#sidecolumnContent').then((elm) => { // Resides in header.html
							//alert("got sidecolumnContent");
							console.log("Doc is ready, header file loaded, place #cloneLeft into #navcolumn")

							waitForElm('#navcolumn').then((elm) => { // #navcolumn is appended by this navigation.js script, so typically not needed.
								$("#showNavColumn").show();
							    if(location.host.indexOf("dreamstudio") >= 0) {
							        $("#sidecolumnContent a").each(function() {
							          $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
							        });
							    }
								let colEleLeft = document.querySelector('#sidecolumnContent');
								let colCloneLeft = colEleLeft.cloneNode(true)
								colCloneLeft.id = "cloneLeft";
								$("#cloneLeftTarget").append(colCloneLeft);

								waitForElm('#topicsMenu').then((elm) => { // From info/template-main.html
									let colEleRight = document.querySelector('#sidecolumnContent');
									let colCloneRight = colEleRight.cloneNode(true)
									colCloneRight.id = "cloneRight";

		          					$("#topicsMenu").prepend(colCloneRight);

									if (location.href.indexOf('desktop') >= 0 || location.host.indexOf('dreamstudio') >= 0 || location.href.indexOf('dreamstudio') >= 0 || location.href.indexOf('/swarm/') >= 0 || location.href.indexOf('/LinearA/') >= 0) {
										let storiesFile = "https://dreamstudio.com/seasons/episodes.md";
										//console.log("location.href index: " + location.href.indexOf("/dreamstudio/"));
										if(location.host.indexOf('localhost') >= 0) {
											storiesFile = "/dreamstudio/seasons/episodes.md";
										} else if (location.href.indexOf("dreamstudio") >= 0) {
											storiesFile = "/seasons/episodes.md";
										}
										waitForElm('#storiesDiv').then((elm) => {
											// TO DO - Lazy load elsewhere, and avoid if already loaded
											loadMarkdown(storiesFile, "storiesDiv", "_parent");
											console.log("after storiesFile")
										});
									}
								});

							});

					 		// Move filterbarOffset and filterEmbedHolder immediately after body tag start.
					 		// Allows map embed to reside below intro text and additional navigation on page.

					 		//if (param.showSideTabs != "false") { // brig
					 		
					 		$("#filterEmbedHolder").insertAfter("#headeroffset");
					 		////$(".filterbarOffset").insertAfter("#headeroffset");
					 		
					 		//$(".filterbarOffset").insertAfter("#headerLarge");

					 		// Not needed since moved into header.html
					 		//$(".filterbarOffset").insertAfter("#headeroffset");

					 		//$(".filterbarOffset").insertAfter("#header");
					 		//$('body').prepend($(".filterbarOffset"));

					 		//$(".filterbarOffset").hide();

					 		// Make paths relative to current page
					 		// Only updates right side navigation, so not currently necessary to check if starts with / but doing so anyway.
					 		$("#local-header a[href]").each(function() {
					 		  if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
					 		  	if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
					 		  		//alert($(this).attr('href'))
						      		$(this).attr("href", modelpath + $(this).attr('href'));
						        }
						  	  }
						    });
						    $("#local-header img[src]").each(function() {
					 		  	if($(this).attr("src").toLowerCase().indexOf("http") < 0) {
					 		  		if($(this).attr("src").indexOf("/") == 0) { // Starts with slash
					 		  			$(this).attr("src", modelroot + $(this).attr('src'));
					 		  		} else {
						      		$(this).attr("src", modelpath + $(this).attr('src'));
						      	}
						  	  }
						    });

						 	if(location.host.indexOf('neighborhood') >= 0) {
						 		// Since deactivated above due to conflict with header logo in app.
						 		$('.neighborhood').css('display', 'block');
						 	}
						 	if (param.titleArray && !param.headerLogo) {
						 		if (param.titleArray[1] == undefined) {
						 			if (param.titleArray[0] != undefined) {
						 				$('#headerSiteTitle').html(param.titleArray[0]);
						 			}
						 		} else {
							 		//let titleValue = "<span style='float:left'><a href='" + climbpath + "' style='text-decoration:none'>";
							 		let titleValue = "<span style='float:left'><a href='/' style='text-decoration:none'>";
							 		
							 		titleValue += "<span style='color: #777;'>" + param.titleArray[0] + "</span>";
							 		for (var i = 1; i < param.titleArray.length; i++) {
							 			titleValue += "<span id='titleTwo' style='color:#bbb;margin-left:1px'>" + param.titleArray[i] + "</span>";
							 		}
							 		titleValue += "</a></span>";
							 		$('#headerSiteTitle').html(titleValue);
							 		let theState = $("#state_select").find(":selected").text();
							 		if (theState) {
							 			//$(".locationTabText").text(theState);
							 		}
							 	}
						 	}

						 	if (param.favicon) {
						 		changeFavicon(param.favicon);
						 	}

							// WAS LIMITED TO HEADER
							//$(document).ready(function() { // Needed for info/index.html page. Fast, but could probably use a timeout delay instead since we are already within the header.html load.
							//alert("test2");
							// Equivalent to checking for #headerbar, but using #localsiteDetails since template pages already have a #headerbar.
							//waitForElm('#localsiteDetails').then((elm) => {
							waitForElm('#headerbar').then((elm) => {
								//alert("climbpath value: " + climbpath);

								waitForElm('#headerLogo').then((elm) => {
								 	if (!param.headerLogo && param.headerLogoSmall) {
								 		$('#headerLogo').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoSmall + "</a>");
								 	} else if (param.headerLogo) {
								 		//alert("Display param.headerLogo")
								 		$('#headerLogo').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogo + "</a>");
								 	} else if (param.favicon) {
								 		let imageUrl = climbpath + ".." + param.favicon;
									 	$('#headerLogo').css('background-image', 'url(' + imageUrl + ')');
										$('#headerLogo').css('background-repeat', 'no-repeat');
									}
								});

								// Resides in map/filter.html
								waitForElm('#logoholderbar').then((elm) => { // Note, #logoholderbar becomes available after #localsiteDetails
									if (param.headerLogoSmall) {
										$('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoSmall+ "</a>");
									} else if (param.headerLogoNoText) {
										$('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoNoText + "</a>");
									} else if (param.headerLogo) {
										$('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogo + "</a>");
									}
								});

								
								// END WAS LIMITED TO HEADER
								$(".headerOffset").show();
								//$("#local-header").append( "<div id='filterbaroffset' style='display:none;height:56px; pointer-events:none; display:none'></div>"); // Might stop using now that search filters are in main.
								if ($("#filterFieldsHolder").length) {
									//$("#filterbaroffset").css('display','block');
								}

								// Slight delay
								setTimeout( function() {
									if ($("#filterFieldsHolder").length) {
										$("#filterbaroffset").css('display','block');
									}
								}, 200);
								setTimeout( function() {
									if ($("#filterFieldsHolder").length) {
										$("#filterbaroffset").css('display','block');
									}
								}, 1000);

								activateSideColumn();

								if (location.host.indexOf('localhost') >= 0 && earthFooter) {
									showLeftIcon = true;
								}
								if (showLeftIcon) {
									// Move to header


										// /localsite/img/icon/sidemenu.png  // width:15px;height:14px
						 					//<div class="showSideTabs" style="displayX:none; float:left;font-size:24px; color:#999;">
						 		}


						 		//$("#headerbar").show();
						 		//$("#headerbar").css("display:block");
						 		//alert("okay2")
						 	});


							if (param["showheader"] && param["showheader"] == "false") {
								// Don't show header
								$("#headerbar").addClass("headerbarhide");
							} else {
								//alert("#headerbar show")
								//$("#headerbar").show();
							}
						});
					}); // End $("#header").load
				
					});
				} // End header.html sidenav

				//waitForElm('#/icon?family=Material+Icons').then((elm) => {
					// Only apply if id="/icon?family=Material+Icons" is already in DOM.
			 		// Running here incase header has not loaded yet when the same runs in localsite.js.
			 		if (document.getElementById("/icon?family=Material+Icons")) {
			 			$(".show-on-load").removeClass("show-on-load");
			 		}
			 	//});
			//}
		}

		if (param.headerFile) {
			//$(document).ready(function () {
			setTimeout( function() {
				//$('body').prepend($("#local-header"));
				$('.headerOffsetOne').prepend($("#local-header"));

				//$("#headerLarge").hide();
			}, 1000);
			//});
		}

		/*
		var link = document.querySelector("link[rel~='icon']");
		alert("link " + link);
		if (!link) {
		    link = document.createElement('link');
		    link.rel = 'icon';
		    document.getElementsByTagName('head')[0].appendChild(link);
		}
		link.href = 'https://stackoverflow.com/favicon.ico';
		*/

		if(document.getElementById("footer") == null) {
			$("body").append( "<div id='local-footer' class='flexfooter noprint'></div>\r" );
		} else {
			//$("#footer").addClass("flexfooter");
			$("#footer").prepend( "<div id='local-footer' class='flexfooter noprint'></div>\r" );
		}
		if (location.host.indexOf('localhost') >= 0 && param.showfooter != false && !param.footer) {
			earthFooter = true; // Need to drive localhost by settings in a file ignored by .gitignore
		}
		if (param["showfooter"] && param["showfooter"] == "false") {
		} else if (earthFooter || param.footer) {
			var footerClimbpath = "";
			let footerFile = modelpath + "../localsite/footer.html"; // modelpath remains relative for site desgnated above as having a local copy of io and community.
			if (param.footer) {
				footerFile = param.footer; // Custom

				var footerFilePath = location.pathname + footerFile;
				if (footerFile.indexOf("/") > 0) {
					footerFilePath = footerFilePath.substr(0, footerFilePath.lastIndexOf("/") + 1); // Remove file name
				}

				console.log("footerFilePath " + footerFilePath);

				var upLevelInstance = (footerFilePath.match(/\.\.\//g) || []).length; // count of ../ in path.

				var climbLevels = ""
				for (var i = 0; i < upLevelInstance; i++) { // Remove ../ for each found
					climbLevels = climbLevels + "../";
				}	 	
			 	footerClimbpath = climbLevels; // Example: ../
			 	console.log("footerClimbpath (Levels up to current page): " + footerClimbpath);
			 	//alert(footerClimbpath)
			} else {
				footerClimbpath = climbpath;
			}
			$("#local-footer").load(footerFile, function( response, status, xhr ) {
				console.log("footerFile: " + footerFile);
				let pageFolder = getPageFolder(footerFile);
				// Append footerClimbpath to relative paths
				makeLinksRelative("local-footer", footerClimbpath, pageFolder);
			});
		}

	 	// SIDE NAV WITH HIGHLIGHT ON SCROLL

	 	// Not currently using nav.html, will likely use later for overrides.  Primary side nav resides in header.
	 	if (1==2 && param["navcolumn"]) {
	 		// Wait for header to load?

			let targetColumn = "#navcolumn";
			$(targetColumn).load( modelpath + "../localsite/nav.html", function( response, status, xhr ) {

				activateSideColumn();
			});
		}
		// END SIDE NAV WITH HIGHLIGHT ON SCROLL
	});
} // end applyNavigation function

$(document).ready(function () {
	//alert("word")
	$(document).on("click", ".hideMenu", function(event) {
		$("#menuHolder").show();
		$("#menuHolder").css('margin-right','-250px');
		//$("#listingMenu").appendTo($(this).parent().parent());
		event.stopPropagation();
	});
	$(document).on("click", ".imagineLocation", function(event) {
		console.log("imagineLocation")
		imagineLocation();
	});
	$(document).on("click", ".hideAdvanced", function(event) {
		goHash({'locpop':'','geoview':''});
	});
	$(document).on("click", ".popAdvanced", function(event) {
		goHash({'locpop':'true'});
	});
	$(document).on("click", ".hideThumbMenu", function(event) {
		$("#bigThumbPanelHolder").hide();
		$(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
	});
	$(document).on("click", ".filterBubble", function(event) {
		console.log('filterBubble click')
	    event.stopPropagation(); // To keep location filter open when clicking
	});
});
$(document).on("click", ".showSections", function(event) {
	goHash({'sidetab':'sections'});
    event.stopPropagation();	
});
function showSections() {

}
$(document).on("click", ".showTopics", function(event) {
	goHash({'sidetab':'topics'});
    event.stopPropagation();
});
function showTopics() {
	//closeExpandedMenus(event.currentTarget);
	if (!$.trim($("#mapList1").html())) { // If the location list is not empty, load the list of types.
    	$("#bigThumbMenuInner").appendTo("#listingsPanelScroll");
        if (!document.getElementById("#bigThumbMenuInner")) {
            let hash = getHash();
            showThumbMenu(hash.show, "#listingsPanelScroll");
        }
    }
    $(".showTopics").addClass("active");
    $("#listingsPanel").show();
    $("#sideTabs").show();
}
$(document).on("click", ".showLocale", function(event) {
	//goHash({'geoview':'state','sidetab':'locale'});
	goHash({'sidetab':'locale'});
    event.stopPropagation();
});
function showLocale() {
	//closeExpandedMenus(event.currentTarget);
	$("#filterClickLocation").removeClass("filterClickActive");
	//loadScript(theroot + 'js/map.js', function(results) {
		loadScript(theroot + 'js/navigation.js', function(results) { // For pages without
	    
	    	openMapLocationFilter();
	    	$("#sideTabs").show();
			$("#filterLocations").appendTo($("#localeDiv"));
			$("#geomap").appendTo($("#rightTopMenu"));
			$("#locationFilterHolder").hide(); // Checked when opening with tab.
		    $(".showLocale").addClass("active");
		    $("#localePanel").show();
		});
	//});
}
function popAdvancedDELETE() {
    waitForElm('#filterLocations').then((elm) => {
                
        console.log("popAdvanced");
        closeSideTabs();
        /*
        loadScript(theroot + 'js/map.js', function(results) {
            loadScript(theroot + 'js/navigation.js', function(results) { // For pages without
                goHash({'geoview':'state'});
                //filterClickLocation();
            });
        });
        */
        $("#filterClickLocation").removeClass("filterClickActive");
        $("#filterLocations").appendTo($("#locationFilterPop"));
        $("#draggableSearch").show();
    });
}

$(document).on("click", ".showSettings", function(event) {
	goHash({'sidetab':'settings'});
    event.stopPropagation();
});
$(document).on("click", ".showAccount", function(event) {
	goHash({'sidetab':'account'});
    event.stopPropagation();
});
$('.contactUs').click(function(event) {
    alert("The Contact Us link is not active.")
    event.stopPropagation();
});
$('.shareThis').click(function(event) {
    window.location = "https://www.addthis.com/bookmark.php?v=250&amp;pub=xa-4a9818987bca104e";
    event.stopPropagation();
});

$(document).on("click", ".showSeasons", function(event) {
	goHash({'sidetab':'seasons'});
    event.stopPropagation();
});
$(document).on("click", ".showDesktop", function(event) { // Was .showDesktopNav
    goHash({'sidetab':'desktop'});
    event.stopPropagation();
});

// SETTINGS
$(document).on("change", ".sitemode", function(event) {
    if ($(".sitemode").val() == "fullnav" && $('#siteHeader').is(':empty')) { // #siteHeader exists. This will likely need to be changed later.
        layerName = getLayerName();
        window.location = "./#" + layerName;
    }
    sitemode = $(".sitemode").val();
    setSiteMode($(".sitemode").val());
    Cookies.set('sitemode', $(".sitemode").val());
    if ($(".sitemode").val() == "fullnav") {
        $('.showSearchClick').trigger("click");
    }
    //event.stopPropagation();
});
$(document).on("change", ".sitesource", function(event) {
	// Options: Overview or Directory
    sitesource = $(".sitesource").val();
    Cookies.set('sitesource', $(".sitesource").val());
    setSitesource($(".sitesource").val());
    //event.stopPropagation();
});
$(document).on("change", "#sitelook", function(event) { // Style: default, coi, gc
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitelook', $("#sitelook").val());
    }
    setSitelook($("#sitelook").val());
    //event.stopPropagation();
});
$(document).on("change", ".sitebasemap", function(event) {
    sitebasemap = $(".sitebasemap").val();
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitebasemap', $(".sitebasemap").val());
    }
    //event.stopPropagation();
});

function setSitesource(sitesource) {
	console.log("setSitesource inactive");
	/*
    if ($(".sitesource").val() == "directory") {
        //$('.navTopHolder').hide();
        $('.navTopInner').hide();
        if (!embedded()) { // Settings would become hidden if embedded.
            $(".topButtons").hide();
        }
        $('.mapBarHolder').hide();
    } else {
        $('.navTopInner').show();
        $('.navTopHolder').show();
    }
    */
}

$(document).on("click", ".showPrintOptions, .print_button", function(event) {
//$('.showPrintOptions, .print_button').click(function(event) {
    //alert("show print2")
    $('.menuExpanded').hide();
    $('.printOptionsText').show();
    $('.printOptionsHolderWide').show();
    event.stopPropagation();
});

$(document).on("click", ".showTheMenu", function(event) { // Seasons
	console.log("Clicked .showTheMenu");
		$(".navLinks").show();
		//$("#showSideTabs").hide();
	event.stopPropagation();
});

$(document).on("click", ".showSideTabs", function(event) {
	let hash = getHash();
	if (hash.sidetab) {
		goHash({'sidetab':''});
	} else {
		if(location.href.indexOf("/seasons") >= 0) {
			goHash({'sidetab':'seasons'});
		} else {
			goHash({'sidetab':'sections'});
		}
	}
	event.stopPropagation();
});

$(document).on('click', '.closeParent', function () {
	$(this).parent().fadeOut();
    event.stopPropagation();
});
$(document).on("click", ".closeSideTabs", function(event) {
	goHash({'sidetab':''});
	//closeSideTabs();
	event.stopPropagation();
});
$(document).on("click", ".showEarth", function(event) {
	if ($("#nullschoolHeader").is(':visible')) {
		$("#nullschoolHeader").hide();
		//$("#globalMapHolder").show();
		$("#hero_holder").show();
		closeSideTabs();
	} else {
		includeCSS3('/localsite/css/leaflet.css',''); // For zoom icons
		//$("#globalMapHolder").hide(); // Home page nullschool map.
		closeSideTabs();
		$("#hero_holder").hide();
		// Add a setting to choose map: Temperatures or just wind
		// Big blue: https://earth.nullschool.net/#current/wind/surface/level/orthographic=-35.06,40.67,511
		showGlobalMap("https://earth.nullschool.net/#current/wind/surface/level/overlay=temp/orthographic=-72.24,46.06,511"); //   /loc=-81.021,33.630
	}
	event.stopPropagation();
});
$(document).click(function(event) { // Hide open menus
	if($("#menuHolder").css('display') !== 'none') {
    	$("#menuHolder").hide(); // Since menu motion may freeze when going to another page.
    	if (!$(event.target).parents("#menuHolder").length) {
    		//event.preventDefault(); // Using requires double click
    	}
	}
	//$("#filterLocations").hide();
});

function loadLocalObjectLayers(layerName, callback) { // layerName is not currently used
    //alert("loadLocalObjectLayers " + layerName);
    // Do we need to load this function on init, for state hash for layers requiring a state.

    //console.log("loadLocalObjectLayers is deactivated. Using thumb menu load instead.")
    //return;

    let hash = getHash();
	//if(location.host.indexOf('localhost') >= 0) {
	    // Greenville:
	    // https://github.com/codeforgreenville/leaflet-google-sheets-template
	    // https://data.openupstate.org/map-layers

	    //var layerJson = local_app.community_data_root() + "us/state/GA/ga-layers.json"; // CORS prevents live
	    // The URL above is outdated. Now resides here:
	    let layerJson = local_app.localsite_root() + "info/data/ga-layers-array.json";
        if(location.host.indexOf("georgia") >= 0) {
	    	// For B2B Recyclers, since localsite folder does not reside on same server.
	    	layerJson = "https://model.earth/localsite/info/data/ga-layers-array.json";
	    	console.log("Set layerJson: " + layerJson);
		}
        //alert(layerJson)
	    //console.log(layerJson);

        if (localObject.layers.length >= 0) {
            callback();
            return;
        }
	    let layerObject = (function() {
            //alert("loadLocalObjectLayers layerObject " + layerName);
    
            if(!localObject.layers) {
                console.log("Error: no localObject.layers");
            }
            $.getJSON(layerJson, function (layers) {

                //console.log("The localObject.layers");
                //console.log(localObject.layers);

                // Create an object of objects so show.hash is the layers key
                $.each(layers, function (i) {

                    // To Do, avoid including "item" in object since it is already the key.
                    localObject.layers[layers[i].item] = layers[i];

                    //$.each(layerObject[i], function (key, val) {
                    //    alert(key + val);
                    //});
                });

                console.log("The localObject 2");
                console.log(localObject);

                //console.log("The localObject.layers");
                //console.log(localObject.layers);

                let layer = hash.show;
                //alert(hash.show)
                //alert(localObject.layers[layer].state)
                




          		// These should be lazy loaded when clicking menu
                //displayBigThumbnails(0, hash.show, "main");
                //displayHexagonMenu("", layerObject);
                
                if (!hash.show && !param.show) { // INITial load
                	// alert($("#fullcolumn").width()) = null
                	if ($("body").width() >= 800) {

                		//showThumbMenu(hash.show, "#bigThumbMenu");
                	}
            	}
                callback();
                return;
                //return layerObject;
	            
	        });
	    })(); // end layerObject
	    
	    
	//}
} // end loadLocalObjectLayers

/*
function callInitSiteObject(attempt) {
    alert("callInitSiteObject")
    if (typeof localObject.layers != 'undefined' && localObject.layers.length >= 0) {
        alert("localObject.layers already loaded " + localObject.layers.length)
        return;
    }
	if (typeof local_app !== 'undefined') {
		loadLocalObjectLayers("");
        return;
	} else if (attempt < 100) { // wait for local_app
		setTimeout( function() {
   			console.log("callInitSiteObject again")
			callInitSiteObject(attempt+1);
   		}, 100 );
	} else {
		console.log("ERROR: Too many search-filters local_app attempts. " + attempt);
	}
}
*/

function showThumbMenu(activeLayer, insertInto) {
	$("#menuHolder").css('margin-right','-250px');
    if (insertInto == "#bigThumbMenu") {
	   $("#bigThumbPanelHolder").show();
    }
	if (!$(".bigThumbMenuContent").length) {
		displayBigThumbnails(0, activeLayer, "main", insertInto);
	}
    if (insertInto != "#bigThumbMenu") {
        $("#bigThumbPanelHolder").hide();
        $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
    } else {
    	//$('.showApps').addClass("filterClickActive");
    }
}

function removeFrontFolder(path) {
    //return("../.." + path);
    return(path);
}
function getDirectLink(livedomain,directlink,rootfolder,hashStr) {
    let hash = getHash();
    if (directlink) {
        directlink = removeFrontFolder(directlink);
    } else if (rootfolder) {
        if (rootfolder.indexOf('/explore/') < 0) {
            //rootfolder = "/explore/" + rootfolder;
        }
        directlink = removeFrontFolder(rootfolder + "#" + hashStr);
        //alert(directlink)
    } else {
        //directlink = removeFrontFolder("/explore/#" + hashStr);
    }
    if (hash.state && directlink.indexOf('state=') < 0) {
        if (directlink.indexOf('#') >= 0) {
            directlink = directlink + "&state=" + hash.state;
        } else {
            directlink = directlink + "#state=" + hash.state;
        }
    }
    if (livedomain && location.host.indexOf('localhost') < 0) {
    	return(livedomain + directlink);
    } else {
    	return(directlink);
	}
}
function access(minlevel,alevel) {
    var level = 0;
    if (alevel) { level = parseInt(alevel) }
    if (minlevel >= level) {
        //consoleLog("TRUE minlevel " + minlevel + " level " + level);
        return true;
    } else {
        //consoleLog("FALSE minlevel " + minlevel + " level " + level);
        return false;
    }
}
function displayBigThumbnails(attempts, activeLayer, layerName, insertInto) {
	if (!activeLayer) {
		activeLayer = "industries";
	}
	loadScript(theroot + 'js/navigation.js', function(results) {
		loadLocalObjectLayers(activeLayer, function() {

		  waitForElm('#bigThumbPanelHolder').then((elm) => { //Not needed
		  	// Setting param.state in navigation.js passes to hash here for menu to use theState:
		    let hash = getHash();
		    let theState = $("#state_select").find(":selected").val();
		    if (param.state) { // Bugbug - might need a way to clear param.state
		        theState = param.state.split(",")[0].toUpperCase();
		    }
		    if (hash.state) {
		        theState = hash.state.split(",")[0].toUpperCase();
		    }
		    if (theState && theState.length > 2) {
		        theState = theState.substring(0,2);
		    }
			if ($('#bigThumbMenu').length <= 1) {
				console.log("Initial load of #bigThumbMenu");
			    var currentAccess = 0;
			    $(".bigThumbMenu").html("");

			    //$("#bigThumbPanelHolder").show();
			    var thelayers = localObject.layers;
			    var sectionMenu = "";
			    var categoryMenu = "";
			    var iconMenu = "";
			    var bigThumbSection = layerName;
			    var layer;
			    for(layer in thelayers) {
			        var menuaccess = 10; // no one
			        try { // For IE error. Might not be necessary.
			            if (typeof(localObject.layers[layer].menuaccess) === "undefined") {
			                menuaccess = 0;
			            } else {
			                menuaccess = localObject.layers[layer].menuaccess;
			            }
			        } catch(e) {
			            consoleLog("displayLayerCheckboxes: no menuaccess");
			        }
			        
			        var linkJavascript = "";
		            //alert(layer) // Returns a nummber: 1,2,3 etc
			        var directlink = getDirectLink(thelayers[layer].livedomain, thelayers[layer].directlink, thelayers[layer].rootfolder, thelayers[layer].item);
		            //alert("directlink " + directlink);
			        if (bigThumbSection == "main") {
			            if (thelayers[layer].menulevel == "1") {
			                if (access(currentAccess,menuaccess)) {
			                    //if (localObject.layers[layer].section == bigThumbSection && localObject.layers[layer].showthumb != '0' && bigThumbSection.replace(/ /g,"-").toLowerCase() != thelayers[layer].item) {
			                    
			                        var thumbTitle = ( thelayers[layer].thumbtitle ? thelayers[layer].thumbtitle : (thelayers[layer].section ? thelayers[layer].section : thelayers[layer].primarytitle));
			                        var thumbTitleSecondary = (thelayers[layer].thumbTitleSecondary ? thelayers[layer].thumbTitleSecondary : '&nbsp;');

			                        var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
			                           if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
			                                //console.log("Thumb title: " + thelayers[layer].title);
			                                var bkgdUrl = thelayers[layer].image;
			                                if (thelayers[layer].bigthumb) {
			                                    bkgdUrl = thelayers[layer].bigthumb;
			                                }
			                                bkgdUrl = removeFrontFolder(bkgdUrl);

			                                
			                                if (thelayers[layer].directlink) { // Omit thumbClick javascript
			                                    //hrefLink = "href='" + removeFrontFolder(thelayers[layer].directlink) + "'";
			                                } else if (thelayers[layer].rootfolder && thelayers[layer].rootfolder) {
			                                	// Change to pass entire hash

			                                	//linkJavascript = 'onclick="window.location = \'/localsite/' + thelayers[layer].rootfolder + '/#show=' + localObject.layers[layer].item + '\';return false;"';
			                                	linkJavascript = 'onclick="thumbClick(\'' + localObject.layers[layer].item + '\',\'' + thelayers[layer].rootfolder + '\');return false;"';
			                                //} else if ((directlink.indexOf('/map/') >= 0 && location.pathname.indexOf('/map/') >= 0) || (directlink.indexOf('/info/') >= 0 && location.pathname.indexOf('/info/') >= 0)) {
			                                } else if ((location.pathname.indexOf('/map/') >= 0) || (location.pathname.indexOf('/info/') >= 0)) {
			                                	// Stayon page when on map or info
			                                	//linkJavascript = "onclick='goHash({\"show\":\"" + localObject.layers[layer].item + "\",\"cat\":\"\",\"sectors\":\"\",\"naics\":\"\",\"go\":\"\",\"m\":\"\"}); return false;'"; // Remain in current page.
			                                	linkJavascript = 'onclick="thumbClick(\'' + localObject.layers[layer].item + '\',\'\');return false;"';
			                                } else {
			                                	linkJavascript = "";
			                                }

			                                // !thelayers[layer].states || (thelayers[layer].states == "GA" && (!param.state || param.state=="GA")  )
			                                if (menuaccess!=0 || (thelayers[layer].states == "GA")) {
			                                	// This one is hidden. If a related state, shown with geo-US13
			                                	let hideforAccessLevel = "";
			                                	if (menuaccess!=0) { // Also hiddden for access leven
			                                		hideforAccessLevel = "style='display:none'";
			                                	}
			                                	// TODO: lazy load images only when visible by moving img tag into an attribute.
			                                	// TODO: Add geo-US13 for other states
			                                    sectionMenu += "<div class='bigThumbMenuContent geo-US13 geo-limited' style='display:none' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' " + hideforAccessLevel + "><div class='bigThumbHolder'><a href='" + directlink + "' " + linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
			                                
			                                } else if (menuaccess==0) { // Quick hack until user-0 displays for currentAccess 1. In progress...
			                                    sectionMenu += "<div class='bigThumbMenuContent' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' style='displayX:none'><div class='bigThumbHolder'><a ";
		                                        if (directlink) { // This is a fallback and won't contain the hash values.
		                                            sectionMenu += "href='" + directlink + "' ";
		                                        }
		                                        sectionMenu += linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
			                                }
			                            }
			                    //}
			                }
			            }
			        } else {
			            if (access(currentAccess,menuaccess)) {
			                if (localObject.layers[layer].section == bigThumbSection && localObject.layers[layer].showthumb != '0' && bigThumbSection.replace(/ /g,"-").toLowerCase() != thelayers[layer].item) {
			                    var thumbTitle = (thelayers[layer].navtitle ? thelayers[layer].navtitle : thelayers[layer].title);
			                    var thumbTitleSecondary = (thelayers[layer].thumbTitleSecondary ? thelayers[layer].thumbTitleSecondary : '&nbsp;');

			                    var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
			                    if (!localObject.layers[layer].bigThumbSection) { // Omit the section parent
			                       if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
			                            // <h1 class='honeyTitle'>" + thelayers[layer].provider + "</h1>
			                            //var thumbTitle = thelayers[layer].title;
			                            var bkgdUrl = thelayers[layer].image;
			                            if (thelayers[layer].bigthumb) {
			                                bkgdUrl = thelayers[layer].bigthumb;
			                            }
			                            bkgdUrl = removeFrontFolder(bkgdUrl);

			                            //var hrefLink = "";
			                            if (thelayers[layer].directlink) {
			                                //hrefLink = "href='" + removeFrontFolder(thelayers[layer].directlink) + "'";
			                            }
			                            sectionMenu += "<div class='bigThumbMenuContent' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' style='display:none'><div class='bigThumbHolder'><a href='" + directlink + "' " + linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
			                        }
			                    }
			                }
			            }
			        }
			    }
			    // Hidden to reduce clutter
		        $("#honeycombPanel").prepend("<div class='hideThumbMenu close-X' style='display:none; position:absolute; right:0px; top:0px;'><i class='material-icons' style='font-size:32px'>&#xE5CD;</i></div>");
			    $(insertInto).append("<div id='bigThumbMenuInner' class='bigThumbMenuInner'>" + sectionMenu + "</div>");

		        if (theState == "GA") {
			    // if (hash.state && hash.state.split(",")[0].toUpperCase() == "GA") {
			    	$(".geo-US13").show();
			    }
			    //$("#honeycombMenu").append("<ul class='bigThumbUl'>" + sectionMenu + "</ul>");
			    $("#iconMenu").append(iconMenu);
		        if (insertInto == "#bigThumbMenu") {
			       $("#bigThumbPanelHolder").show();
		        }
			    $("#honeyMenuHolder").show(); // Might be able to remove display:none on this

		        // 
			    //$(".thumbModule").append($("#bigThumbPanelHolder"));
			} else if ($("#bigThumbPanelHolder").css("display") == "none") {
		        if (insertInto == "#bigThumbMenu") {
				  $("#bigThumbPanelHolder").show();
		        }
			} else {
				$("#bigThumbPanelHolder").hide();
		        $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
			}

			$('.bigThumbHolder').click(function(event) {
		        $("#bigThumbPanelHolder").hide(); // Could remain open when small version above map added. 
		        $(".showApps").removeClass("filterClickActive"); ////updateHash({'appview':''});     
		    });
		    if (activeLayer) {
		    	$(".bigThumbMenuContent[show='" + activeLayer +"']").addClass("bigThumbActive");
		    	let activeTitle = $(".bigThumbMenuContent[show='" + activeLayer +"'] .bigThumbText").text();
		    	if (activeTitle) { // Keep prior if activeLayer is not among app list.
		    		$("#showAppsText").attr("title",activeTitle);
		    	}
		    }
		  });
		});
	});
}

function showClassInline(theclass) {

	//$(theclass).css('display', 'inline');

	// Load when body head becomes available, faster than waiting for all DOM .js files to load.
    waitForElm('head').then((elm) => {
    	var div = $("<style />", {
        	html: theclass + ' {display: inline !important}'
        }).appendTo("head");
    });

	/*
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 1000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 2000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 5000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 10000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 30000);
	*/
}
function imagineLocation() {
    if (location.href.indexOf('/info') == -1) {
        updateHash({"geoview":""}); // Prevents location filter from remaining open after redirect.
        location.href = "/localsite/info/" + location.hash;
        return;
    }
    updateHash({"imgview":"state","geoview":"","appview":""}); // Should this reside in hideAdvanced()?
	hideAdvanced();
}
function hideAdvanced() {
	console.log("hideAdvanced");
	// Should we show a search icon when closing?
	$(".fieldSelector").hide();
	$("#filterLocations").hide();
	$("#imagineBar").hide();
	$("#filterClickLocation").removeClass("filterClickActive");
	$("#draggableSearch").hide();
	
	if (typeof relocatedStateMenu != "undefined") {
		relocatedStateMenu.appendChild(state_select); // For apps hero
	}
	$("#hero_holder").show();
	$(".locationTabText").text($(".locationTabText").attr("title"));
}
function activateSideColumn() {
	// Make paths relative to current page
		$("#navcolumn a[href]").each(function() {
			if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
				if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
					$(this).attr("href", climbpath + $(this).attr('href'));
      		}
  		}
    })
		$("#navcolumn img[src]").each(function() {
			if($(this).attr("src").indexOf("/") != 0) { // Don't append if starts with /
      		$(this).attr("src", climbpath + $(this).attr('src'));
  		}
    })
	
	// Clone after path change
		
		// Might need to reactivate, but should we give a different ID?
		// Double use of ID seems to prevent display here: http://localhost:8887/recycling/
		//$("#headerLogo").clone().appendTo("#logoholderside");

		// ALL SIDE COLUMN ITEMS
		var topMenu = $("#cloneLeft");
		//console.log("topMenu:");
		//console.log(topMenu);
	var menuItems = topMenu.find("a");
	var scrollItems = menuItems.map(function(){ // Only include "a" tag elements that have an href.

		// Get the section using the names of hash tags (since id's start with #). Example: #intro, #objectives
		if ($(this).attr("href").includes('#')) {
			var sectionID = '#' + $(this).attr("href").split('#')[1].split('&')[0]; 
			if (sectionID.indexOf("=") >= 0) { // Sometimes the show (section) value may be passed without an equals sign.
				sectionID = sectionID.split('=')[0];
			}
		    var item = $(sectionID); //   .replace(/\//g, "").replace(/../g, "")    Use of replaces fixes error due to slash in path.
		    if (item.length) {
		    	return item;
		    }
		}
	});
	var bottomSection = "partners";

		// BIND CLICK HANDLER TO MENU ITEMS
	menuItems.click(function(e){
	  var href = $(this).attr("href");
	  /*
	  console.log('Clicked ' + href);
	  var offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
	  */
	  if (href.includes("#intro")) { 

	  	// If current page contains a section called intro
	  	if($('#intro').length > 0) {
		  	//alert("intro click")
		    $('html,body').scrollTop(0);

		    // BUGBUG - still need to set URL since this is needed to override default position:
		    e.preventDefault();
		}
	  }
	});

	/*
	// Alternative to flaky $(this).scrollTop()+topMenuHeight; // this is the window
	function getScrollTop(){
	    if(typeof pageYOffset != 'undefined'){
	        //most browsers except IE before #9
	        return pageYOffset;
	    }
	    else{
	        var B= document.body; //IE 'quirks'
	        var D= document.documentElement; //IE with doctype
	        D= (D.clientHeight)? D: B;
	        return D.scrollTop;
	    }
	}
	*/

	// HIGHLIGHT SIDE NAVIGATION ON SCROLL
	function currentSideID() {
		var scrollTop = window.pageYOffset || (document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop) || 0;
		var topMenuHeight = 150;
		// Get container scroll position
		var fromTop = scrollTop+topMenuHeight; // this is the window
		//console.log('fromTop ' + fromTop);
		// Get id of current scroll item
		var cur = scrollItems.map(function(){
			// scrollItems is the sections fron nav.html, but just return the current one.
	   		//console.log('offset().top ' + $(this).offset().top)
	     	if ($(this).offset().top < fromTop) {
	     		//console.log('offset().top < fromTop ' + $(this).offset().top + ' < ' + fromTop);
	     		return this;
	       	}
		});
		if (cur.length == 0 && $("#allsections").length) {
			// At top, above top of intro section
			// To Do: Get the top most section
			// allsections
			return $("#allsections section:first").attr("id"); // "intro" when on tools page,
		}
		// Get the id of the last item fetched from scrollItems
		cur = cur[cur.length-1];
		var id = cur && cur.length ? cur[0].id : "";
		//console.log('currentSideID id: ' + id);
		return id;
	}
	var lastID;
	
	$(window).scroll(function() {
		var id = currentSideID();
		//console.log("id: " + id + " lastID: " + lastID);
	   if($('#' + bottomSection).length > 0 && $(window).scrollTop() + $(window).height() == $(document).height()) { // If bottomSection exists and at bottom
	      //console.log('at bottom');
	      menuItems.removeClass("active");
	      menuItems.filter("[href*='#"+bottomSection+"']").addClass("active");
	      lastID = bottomSection;
	   } else if (id && lastID !== id) { // Highlight side navigation
	      //console.log("CURRENT ID: " + id);
	      lastID = id;
	      menuItems.removeClass("active");
	      if (currentSection && currentSection.length) {
	      	if (id.length == 0) {
	      		// Page without sections
	      	} else if (id == "intro") {
	      		// To do: Change to highlight the uppermost section.
	      		menuItems.filter("[href='..\/tools\/#']").addClass("active");
	      	} else {
	      		//alert("id " + id)
	      		menuItems.filter("[href*='#"+id+"']").addClass("active"); // *= means contains
	      		menuItems.filter("[hashid='" + id + "']").addClass("active");
	      	}
	  	  }
	      /*
	      menuItems
	         .parent().removeClass("active")
	         .end().filter("[href*='#"+id+"']").parent().addClass("active");
	       */
	   } else {
	   		//console.log("Scrolling, no action");
	   }
	   
	  if (id == "intro") {
	  	console.log("headerbar show");
	    $('.headerbar').show();

	    // For when entering from a #intro link from another page.
	    // Would be better to disable browser jump to #intro elsewhere.
	    //$('html,body').scrollTop(0); 
	  }
	});

	// Initial page load
	var currentSection = currentSideID();
	//alert("currentSection " + currentSection)
	if (currentSection && currentSection.length) {
		if (currentSection == "intro") {
	      	// To do: Change to highlight the uppermost section.
	      	menuItems.filter("[href='..\/tools\/#']").addClass("active");
	      	lastID = "intro";
	    } else {
	    	menuItems.filter("[href*='#"+currentSection+"']").addClass("active");
	    	menuItems.filter("[hashid='" + currentSection + "']").addClass("active");
	    	// To do: If not found, try using folder name from link when no #
	    	//menuItems.filter("[href*='interns/']").addClass("active");
		}
	}
}

// INIT

//if (param.geoview == "state") {
//	loadScript(theroot + 'js/map.js', function(results) {
//		loadScript(theroot + 'js/navigation.js', function(results) {
//			// geoview=state triggers display of location filter in navigation.js. No additional script needed here.
//		});
//	});
//}

function makeLinksRelative(divID,climbpath,pageFolder) {
	  $("#" + divID + " a[href]").each(function() {

      //if (pagePath.indexOf('../') >= 0) { // If .md file is not in the current directory
      //$("#" + divID + " a[href]").each(function() {
      if($(this).attr("href").toLowerCase().indexOf("http") < 0){ // Relative links only        
          $(this).attr("href", climbpath + $(this).attr('href'));
      } else if (!/^http/.test($(this).attr("href"))) { // Also not Relative link
          alert("Adjust: " + $(this).attr('href'))
          $(this).attr("href", pageFolder + $(this).attr('href'));
      }
    })
}
function getPageFolder(pagePath) {
  let pageFolder = pagePath;
  if (pageFolder.lastIndexOf('?') > 0) { // Incase slash reside in parameters
    pageFolder = pageFolder.substring(0, pageFolder.lastIndexOf('?'));
  }
  // If there is a period after the last slash, remove the filename.
  if (pageFolder.lastIndexOf('.') > pageFolder.lastIndexOf('/')) {
    pageFolder = pageFolder.substring(0, pageFolder.lastIndexOf('/')) + "/";
  }
  if (pageFolder == "/") {
    pageFolder = "";
  }
  return pageFolder;
}



} else { 
	if (location.host.indexOf('localhost') >= 0) {
		alert("ALERT: navigation.js is being loaded twice.");
	}
	console.log("ALERT: navigation.js is being loaded twice.")
} // End typeof page_scripts which checks if file is loaded twice.

$(document).on("change", "#state_select", function(event) {

    console.log("state_select change");
	if (this.value) {
    	$("#region_select").val("");
        // Later a checkbox could be added to retain geo values across multiple states
        // Omitting for BC apps page  ,'geoview':'state'
    	goHash({'state':this.value,'geo':'','name':'','regiontitle':''}); // triggers renderMapShapes("geomap", hash); // County select map
    	//$("#filterLocations").hide(); // So state appears on map immediately
    } else { // US selected
    	hiddenhash.state = ""; // BugFix - Without this prior state stays in dropdown when choosing no state using top option.
    	goHash({'geoview':'country','state':'','geo':''});
    }
});
$(document).on("click", "#filterClickLocation", function(event) {

	
	if ($("#draggableSearch").is(':visible')) {
		$("#draggableSearch").hide();
		//alert("append")
		//$("#filterLocations").prependTo($("#locationFilterHolder"));
		$("#filterLocations").hide();
	}
	/*
	if ($("#localePanel").is(':visible')) {
		closeSideTabs();
		$("#topicsPanel").show(); // So return to apps menu shows something
		$(".rightTopMenuInner div").removeClass("active"); // So not displayed when returning
	}
	*/

	filterClickLocation();
	event.stopPropagation();
	return;



	//delete(hiddenhash.geoview); // Not sure where this gets set.
	if ($("#geoPicker").is(':visible')) {
		console.log($("#filterLocations").offset().top);
	}
    let hash = getHash();
    if ($("#locationFilterHolder").is(':visible') && $("#bigThumbPanelHolder").is(':visible')) { // was #geoPicker
    	//$("#bigThumbPanelHolder").hide();
    	//$("#filterClickLocation").removeClass("filterClickActive");
    	//$("#filterClickLocation").addClass("filterClickActive");
    	//goHash({"appview":""});
    	closeAppsMenu();
    	$("#filterClickLocation").addClass("filterClickActive");
    	$("#locationFilterHolder").show();
    	updateHash({"geoview":""});
    } else if ($("#locationFilterHolder").is(':visible')) { // was #geoPicker
    	//if (hash.geoview && hash.appview) {

    	$("#locationFilterHolder").hide();
    	//$("#geoPicker").hide();
    	closeAppsMenu();
    	$("#filterClickLocation").removeClass("filterClickActive");
    	updateHash({"geoview":""});
    } else {
    	$("#locationFilterHolder").show();
    	closeAppsMenu();
    	loadScript(theroot + 'js/navigation.js', function(results) {
	    	$("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
	    	///$("#geoPicker").show();
	    	if (!hash.appview) {
	    		$("#filterClickLocation").addClass("filterClickActive");
	    	}
		    if(!hash.geoview && (hash.state || param.state)) {
		    	hash.geoview = "state";
		    	if (!hash.state) {
		    		hash.state = param.state + "";
		    	}
		    	goHash({"geoview":hash.geoview});
		    	//alert("updateHash " + hash.geoview);
		    } else {
		    	goHash({"geoview":"country"});
		    }

		    console.log("#filterClickLocation click hash.geoview: " + hash.geoview);
		});
		$('html,body').scrollTop(0);
	    /*
	     if (!hash.geoview) {
	    	if (!hash.appview) {
	    		closeAppsMenu();
	    	}
	    	loadScript(theroot + 'js/navigation.js', function(results) {
				//if (!param.geoview) {
				// Hash change triggers call to filterClickLocation() and map display.
				if (mapviewState) {
					console.log("#filterClickLocation click go state");
		    		goHash({'geoview':'state'});
		    	} else {
		    		goHash({'geoview':'country'});
		    	}
	    	});
		} else {
			// Triggers closeLocationFilter()
			console.log("remove geoview from hash")
			goHash({"geoview":""}); // Remove from URL using gohash so priorhash is also reset
		}
		*/
	}
    event.stopPropagation();
});


$(document).on("click", ".showApps, .hideApps", function(event) {
	showApps("#bigThumbMenu");
  	event.stopPropagation();
});

function showApps(menuDiv) {
	loadScript(theroot + 'js/navigation.js', function(results) {

		let hash = getHash();
		console.log('showApps in ' + menuDiv);
		$("#filterClickLocation").removeClass("filterClickActive"); // But leave open

	    if ($("#bigThumbPanelHolder").is(':visible')) { // CLOSE APPS MENU
		//if($("#bigThumbPanelHolder").is(':visible') && isElementInViewport($("#bigThumbPanelHolder"))) { // Prevented tab click from closing app menu
			updateHash({"appview":""});
			$("#appSelectHolder .select-menu-arrow-holder .material-icons").hide();
			$("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").show();

			$("#appSelectHolder .showApps").removeClass("filterClickActive"); updateHash({'appview':''});
			$("#showAppsText").text($("#showAppsText").attr("title"));
			$(".hideWhenPop").show();
	        // To do: Only up scroll AND SHOW if not visible
	        // Bug bug this closed filters
			$('html,body').animate({
				scrollTop: 0
			});
        	closeAppsMenu();
        	if (!hash.appview) {
	        	if ($("#filterLocations").is(':visible')) {
	        		$("#filterClickLocation").addClass("filterClickActive");
	        	}
	        }
		} else { // Show Apps, Close Locations (if no geoview)
			updateHash({"appview":"topics"});
			console.log("call showThumbMenu from navidation.js");
			if (!hash.geoview) {
	        	closeExpandedMenus($(".showSections")); // Close all sidetab's prior to opening new tab
	        }
	        $("#topicsPanel").show();

	        if ($("#filterLocations").is(':visible')) {
	        	////goHash({"geoview":""});
	        	// Deactivated so both apps and geoview shown on localsite/map:
	        	//goHash({},["geoview"]); //TODO - Alter so the above works instead.

	            ////filterClickLocation(); // Toggle county-select closedhttp://localhost:8887/localsite/map/#show=recyclers&state=GA
	        }
			$("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").hide();
			$("#appSelectHolder .select-menu-arrow-holder .material-icons:nth-of-type(2)").show();

			$("#showAppsText").text("Location Topics");
			waitForElm('#appSelectHolder').then((elm) => {
				$("#appSelectHolder .showApps").addClass("filterClickActive"); // Adds to local topics
			});
	        $("#bigThumbMenuInner").appendTo(menuDiv);
			showThumbMenu(hash.show, menuDiv);
			//$('.showApps').addClass("filterClickActive");
			waitForElm('#bigThumbPanelHolder').then((elm) => { 
		        $('html,body').animate({
		        	//- $("#filterFieldsHolder").height()  
		            scrollTop: $("#bigThumbPanelHolder").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
		        });
		    });
		}
	});
}
function closeAppsMenu() {
	$("#bigThumbPanelHolder").hide();
    $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
}
function filterClickLocation(loadGeoTable) {
    console.log("filterClickLocation() " + loadGeoTable);
    let hash = getHash();
    if (hash.sidetab == "locale" && hash.geoview) {
    	goHash({'sidetab':'','locpop':''});
    } else if (hash.geoview) {
    	goHash({'geoview':'','locpop':''});
    } else if (hash.state) {
    	goHash({'geoview':'state','locpop':''});
    } else {
    	goHash({'geoview':'country','locpop':''});
    }
    return;
}
function filterLocationChange() {
	//alert("filterLocationChange")
	$("#bigThumbPanelHolder").hide();
	$('.showApps').removeClass("filterClickActive"); ////updateHash({'appview':''});
    let distanceFilterFromTop = 120;
    if ($("#locationFilterHolder #filterLocations").length) {
    	distanceFilterFromTop = $("#filterLocations").offset().top - $(document).scrollTop();
    }
    //alert("distanceFilterFromTop  " + distanceFilterFromTop);
	//$('.hideMetaMenuClick').trigger("click"); // Otherwise covers location popup. Problem: hides hideLayers/hideLocationsMenu.
	

	if ($("#filterLocations").is(':visible')) { // && (distanceFilterFromTop < 300 || distanceFilterFromTop > 300)
        //alert("closeLocationFilter()");
        closeLocationFilter();
        console.log("closeLocationFilter");
	} else { // OPEN MAP FILTER
		//alert("openLocationFilter() 1");
		$("#filterLocations").prependTo($("#locationFilterHolder"));
		openMapLocationFilter();

		/*
		waitForElm('#geomap').then((elm) => {

		  if (document.querySelector('#geomap')._leaflet_map) {
		  	alert("found, refresh geomap")
	      	document.querySelector('#geomap')._leaflet_map.invalidateSize(); // Force Leaflet map to reload
	      }
		});
		*/
	}
	$("#keywordFields").hide();
}
function openMapLocationFilter() {
	//alert("openMapLocationFilter");
    let hash = getHash();
    loadScript(theroot + 'js/navigation.js', function(results) {
	    if (!hash.geoview) { // && hash.sidetab != "locale"
	        let currentStates = [];
	        if(hash.geo && !hash.state) {
	            let geos = hash.geo.split(",");
	            for(var i = 0 ; i < geos.length ; i++) {
	                currentStates.push(getKeyByValue(localObject.us_stateIDs, Number(geos[i].replace("US","").substring(0,2))));
	            }
	        }

	        /*
	        if (currentStates.length > 0) { // Multiple states, use first one.
	            goHash({"geoview":"state","state":currentStates[0]});
	        } else {
	            goHash({"geoview":"state"});
	        }
	        */
	    }
	    ///$("#geoPicker").show();
	    $("#filterLocations").prependTo($("#locationFilterHolder")); // Move back from sidetabs
	    $("#geomap").appendTo($("#geomapHolder")); // Move back from sidetabs
        // Here we show the interior, but not #locationFilterHolder.
	    $("#filterLocations").show();$("#imagineBar").show();
	    $(".locationTabText").text("Locations");
	    $("#topPanel").hide();
	    $("#showLocations").show();
	    $("#hideLocations").hide();

	    $("#hero_holder").hide();
	    if (typeof state_select_holder != "undefined") {
	        state_select_holder.appendChild(state_select); // For apps hero
	    }

	    if (hash.geo) {
	        let clearall = false;
	        if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state) {
	            clearall = true;
	        }
	        if (hash.geoview != "country") {
	            //if (loadGeoTable != false) { // Prevents loading twice on init
	            
	            // not needed, added hash = GetHash() to fix actual problem.
	            //waitForElm('#tabulator-geotable .tabulator-table > .tabulator-row').then((elm) => {
	                updateSelectedTableRows(hash.geo, clearall, 0);
	            //});
	        }
	    }
	    if (!hash.appview) {
	    	waitForElm('#filterClickLocation').then((elm) => {
		    	if ($("#locationFilterHolder").is(':visible')) {
			    	$("#filterClickLocation").addClass("filterClickActive");
				}
			});
		}
	    //loadScript(theroot + 'js/map.js', function(results) { // Load list before map
	    	//console.log("Call renderMapShapes from navigation.js")
	        //renderMapShapes("geomap", hash, "", 1);// Called once map div is visible for tiles.
	    //});
	    if ($("#filterLocations").length) {
	        $('html,body').animate({
	            scrollTop: $("#filterLocations").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
	        });
	    } else {
	        console.log("ALERT #filterLocations not available yet.")
	    }
	    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
	        $("#header.nav-up").show();
	    }
	});
}
function closeLocationFilter() {
    $(".locationTabText").text($(".locationTabText").attr("title"));
    $("#showLocations").hide();
    $("#hideLocations").show();
    //$(".locationTabText").text("Entire State");
    $("#locationFilterHolder").hide();
    $("#filterLocations").hide(); // Not sure why this was still needed.
    $("#imagineBar").hide();
    $("#filterClickLocation").removeClass("filterClickActive");
    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
        $("#header.nav-up").hide();
    }

    if (typeof relocatedStateMenu != "undefined") {
        relocatedStateMenu.appendChild(state_select); // For apps hero
    }
    $("#hero_holder").show();
}