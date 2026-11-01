import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { createFunctionServer } from '../server/serverless.mjs';
import config from '../vercel.json' with { type: 'json' };

function waitFor(ws, predicate) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { cleanup(); reject(new Error('WebSocket response timed out')); }, 4000);
    function cleanup() { clearTimeout(timeout); ws.off('message', onMessage); }
    function onMessage(raw) { const message = JSON.parse(raw); if (predicate(message)) { cleanup(); resolve(message); } }
    ws.on('message', onMessage);
  });
}

test('Vercel rewrite targets serve health, rooms and WebSocket room membership together', { timeout: 15000 }, async () => {
  const app = await createFunctionServer();
  const clients = [];
  try {
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${app.server.address().port}`;
    const target = path => config.rewrites.find(route => route.source === path).destination;
    assert.equal((await fetch(origin + target('/health'))).status, 200);
    assert.deepEqual(await (await fetch(origin + target('/api/rooms'))).json(), []);
    const host = new WebSocket(origin.replace('http:', 'ws:') + target('/ws')); clients.push(host);
    await once(host, 'open');
    const welcome = waitFor(host, m => m.type === 'welcome');
    host.send(JSON.stringify({ type: 'join', action: 'create', name: 'Host' }));
    const room = await welcome;
    const rooms = await (await fetch(origin + target('/api/rooms'))).json();
    assert.equal(rooms[0].id, room.roomId);
    assert.equal(rooms[0].players, 1);
    const student = new WebSocket(origin.replace('http:', 'ws:') + target('/ws')); clients.push(student);
    await once(student, 'open');
    const joined = waitFor(student, m => m.type === 'welcome');
    student.send(JSON.stringify({ type: 'join', action: 'join', name: 'Student', roomId: room.roomId }));
    const participant = await joined;
    assert.equal(participant.role, 'student');
    assert.equal(participant.players.length, 2);
    assert.equal((await (await fetch(origin + target('/health'))).json()).players, 2);
    const world = await (await fetch(origin + target('/api/world'))).json();
    assert.deepEqual(world.edits, []);
    assert.equal((await fetch(origin + '/api/game?route=invalid')).status, 404);
  } finally {
    for (const client of clients) client.terminate();
    await app.close();
  }
});

test('room chat retains all messages, stays private, and disappears when the host ends the room', {timeout:15000}, async () => {
  const app=await createFunctionServer(); const clients=[];
  try {
    await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
    const origin=`http://127.0.0.1:${app.server.address().port}`;
    async function join(action,roomId,name) {
      const ws=new WebSocket(origin.replace('http:','ws:')+'/ws');clients.push(ws);
      await once(ws,'open');const welcome=waitFor(ws,m=>m.type==='welcome');
      ws.send(JSON.stringify({type:'join',action,roomId,name}));return {ws,welcome:await welcome};
    }
    const host=await join('create',null,'Host');const id=host.welcome.roomId;
    for(let i=0;i<9;i++) {
      const member=await join('join',id,`Student ${i}`);
      for(let j=0;j<3;j++) {
        const text=`Tin ${i*3+j}`;const echoed=waitFor(host.ws,m=>m.type==='chat'&&m.text===text);
        member.ws.send(JSON.stringify({type:'chat',text}));await echoed;
      }
    }
    const late=await join('join',id,'Late student');
    assert.equal(late.welcome.history.length,27);
    assert.equal(late.welcome.history[0].text,'Tin 0');
    assert.equal(late.welcome.history.at(-1).text,'Tin 26');
    const other=await join('create',null,'Other host');assert.deepEqual(other.welcome.history,[]);
    const disbanded=waitFor(late.ws,m=>m.type==='disbanded');const closed=once(host.ws,'close');
    host.ws.close();await disbanded;await closed;
    const rooms=await (await fetch(origin+'/api/rooms')).json();assert.ok(!rooms.some(room=>room.id===id));
    const next=await join('create',null,'New host');
    assert.equal(next.welcome.roomId,id);
    assert.deepEqual(next.welcome.history,[]);
  } finally { for(const ws of clients)ws.terminate();await app.close(); }
});
