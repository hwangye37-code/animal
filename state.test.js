import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restore, collect, place, canStand } from '../src/state.js';

test('collecting the same fruit twice never increases the count twice', () => {
  const state = initialState();
  assert.equal(collect(state, 'fruit-0'), true);
  assert.equal(collect(state, 'fruit-0'), false);
  assert.equal(state.fruits.length, 1);
  assert.equal(collect(state, 'not-a-fruit'), false);
});
test('corrupt and unsupported saves recover safely', () => {
  for (const raw of ['bad', 'null', '{}', '{"version":100}', '{"version":1,"fruits":null}']) {
    assert.deepEqual(restore(raw), initialState());
  }
});
test('save roundtrip restores collected fruit and placed objects', () => {
  const state = initialState();
  collect(state, 'fruit-2');
  assert.equal(place(state, 'tree', 10, 5).ok, true);
  assert.deepEqual(restore(JSON.stringify(state)), state);
});
test('placement rejects roads, overlap, ocean and unknown types', () => {
  const state = initialState();
  assert.equal(place(state, 'house', 0, 0).ok, false);
  assert.equal(place(state, 'tree', 40, 0).ok, false);
  assert.equal(place(state, 'unknown', 10, 5).ok, false);
  assert.equal(place(state, 'tree', 10, 5).ok, true);
  assert.equal(place(state, 'house', 10, 5).ok, false);
  assert.equal(place(state, 'tree', NaN, 6).ok, false);
});
test('movement prevents leaving the island or walking through a house', () => {
  assert.equal(canStand(50, 50, []), false);
  assert.equal(canStand(0, 4, []), true);
  assert.equal(canStand(-7, -6, []), false);
  const state = initialState();
  assert.equal(place(state, 'house', 8, 6).ok, true);
  assert.equal(canStand(8, 6, state.objects), false);
});
test('untrusted saves cannot inject invalid objects or duplicate fruit', () => {
  const raw = JSON.stringify({version:1, fruits:['fruit-0','fruit-0','oops'],objects:[{type:'house',x:0,z:0},{type:'tree',x:10,z:5},{type:'tree',x:10,z:5}]});
  const state = restore(raw);
  assert.deepEqual(state.fruits, ['fruit-0']);
  assert.equal(state.objects.length, 1);
});
