import{d as e,E as t}from"./events-4c8e3503.js";import{i as n}from"./utils-aa566623.js";import{g as i,f as r,i as a,b as l,V as o}from"./cc-form-control-element.abstract-0dd8a3c9.js";import{c as s}from"./async-directive-7becedb2.js";import{A as d}from"./lit-element-98ed46d4.js";import{e as m,t as c}from"./directive-de55b00a.js";function v(t){return s=>{s.preventDefault();const d=s.target,m=function(e){const t=Array.from(e.elements),i=[];return t.forEach((e=>{if(function(e){return!n(e.name)}(e)){const t=e.name;a(e)&&e.willValidate?i.push({name:t,validate:()=>e.validate(),report:()=>{e.reportInlineValidity()}}):l(e)&&e.willValidate&&i.push({name:t,validate:()=>e.checkValidity()?o.VALID:o.invalid(e.validationMessage),report:()=>{}})}})),i}(d),c=m.map((e=>({name:e.name,validity:e.validate()})));m.forEach((e=>e.report()));if(c.every((e=>e.validity.valid))){const n=i(d);t.onValid?.(n,d),e(d,"valid",n)}else t.onInvalid?.(c,d),r(d),e(d,"invalid",c)}}const u=m(class extends s{constructor(e){super(e),this._formElement=null,this._eventHandler=null}render(...e){return d}update(e,n){const i=this.getFormElement(e),r=f(n,0),a=f(n,1);return i===this._formElement&&this._onValid===r&&this._onInvalid!==a||(this._eventHandler?.disconnect(),this._formElement=i,this._onValid=r,this._onInvalid=a,this._formElement.setAttribute("novalidate",""),this._eventHandler=new t(i,"submit",v({onValid:r,onInvalid:a})),this._eventHandler.connect()),this.render()}disconnected(){this._eventHandler?.disconnect()}reconnected(){this._eventHandler?.connect()}getFormElement(e){if(!(function(e){return e.type===c.ELEMENT}(e)&&(t=e.element,t instanceof HTMLFormElement)))throw new Error("This directive must be used on an `<form>` element");var t;return e.element}});function f(e,t){return null==e||0===e.length||e.length<t+1?null:e[t]}export{u as f};
