import{s as n}from"./date-utils-dfe14e4f.js";function t(n){const t=new Date;return a({since:new Date(t.getTime()-n),until:t})}function e(n){return null==n.until}function i(){const n=new Date;return n.setUTCHours(0),n.setUTCMinutes(0),n.setUTCSeconds(0),n.setUTCMilliseconds(0),{since:n.toISOString(),until:(new Date).toISOString()}}function s(){const n=new Date;n.setUTCHours(0),n.setUTCMinutes(0),n.setUTCSeconds(0),n.setUTCMilliseconds(0);const t=new Date(n.getTime()-864e5),e=new Date(n.getTime()-1);return{since:t.toISOString(),until:e.toISOString()}}function u(t){const e=n(new Date,"D",-t);return e.setUTCHours(0),e.setUTCMinutes(0),e.setUTCSeconds(0),e.setUTCMilliseconds(0),{since:e.toISOString(),until:(new Date).toISOString()}}function r(n,t){if(e(n))throw new Error("Cannot shift an unbounded date range");return a(c(l(n),t))}function o(n){return c(l(n),"right").until.getTime()>(new Date).getTime()}function c(n,t){if(e(n))throw new Error("Cannot shift an unbounded date range");const i=n.since.getTime(),s=n.until.getTime(),u=s-i;switch(t){case"left":return{since:new Date(i-u),until:n.since};case"right":return{since:n.until,until:new Date(s+u)}}}function l(n){return{since:new Date(n.since),until:null==n.until?null:new Date(n.until)}}function a(n){return{since:n.since.toISOString(),until:null==n.until?null:n.until.toISOString()}}export{t as getRangeToNow,e as isLive,o as isRightDateRangeAfterNow,u as lastXDays,r as shiftDateRange,i as today,s as yesterday};
