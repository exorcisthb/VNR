import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatLog, opensChat } from '../src/chat-log.js';

function view() {
  const listeners = {};
  const doc = {
    createElement() { return { children: [], append(...nodes) { this.children.push(...nodes); } }; },
    createTextNode(text) { return { textContent: text }; },
  };
  const list = { ownerDocument: doc, children: [], clientHeight: 60, scrollTop: 0,
    get scrollHeight() { return this.children.length * 20; },
    append(node) { this.children.push(node); }, replaceChildren() { this.children = []; },
    addEventListener(name, handler) { listeners[name] = handler; },
  };
  const button = { hidden: true, addEventListener(name, handler) { listeners['button:' + name] = handler; } };
  return { log: new ChatLog(list, button), list, button, listeners };
}

test('chat retains more than 25 messages in chronological order and clears for the next room', () => {
  const {log,list,button} = view();
  for (let i=0;i<60;i++) log.append('Student', `Tin ${i}`);
  assert.equal(list.children.length,60);
  assert.equal(list.children[0].children[1].textContent,'Tin 0');
  assert.equal(list.children[59].children[1].textContent,'Tin 59');
  assert.equal(list.scrollTop,list.scrollHeight);
  log.reset();
  assert.equal(list.children.length,0);
  assert.equal(list.scrollTop,0);
  assert.equal(button.hidden,true);
});

test('reading earlier messages preserves scroll position and exposes the latest-message button', () => {
  const {log,list,button,listeners} = view();
  for (let i=0;i<12;i++) log.append('Host',String(i));
  list.scrollTop=20;
  log.append('Student','New');
  assert.equal(list.scrollTop,20);
  assert.equal(button.hidden,false);
  listeners['button:click']();
  assert.equal(list.scrollTop,list.scrollHeight);
  assert.equal(button.hidden,true);
});

test('Enter opens chat from a focused game button, while text input, menus and IME keep their keys', () => {
  const state={playing:true,paused:false,typing:false};
  assert.equal(opensChat({code:'Enter'},state),true);
  assert.equal(opensChat({code:'NumpadEnter'},state),true);
  assert.equal(opensChat({code:'Escape'},state),false);
  assert.equal(opensChat({code:'Enter'},{...state,typing:true}),false);
  assert.equal(opensChat({code:'Enter'},{...state,paused:true}),false);
  assert.equal(opensChat({code:'Enter',isComposing:true},state),false);
});
