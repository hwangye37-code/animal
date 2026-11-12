import test from 'node:test';
import assert from 'node:assert/strict';
import { gameKey } from '../src/input.js';

test('physical movement and interaction keys work with Korean input enabled',()=>{
  assert.equal(gameKey({code:'KeyW',key:'ㅈ'}),'w');
  assert.equal(gameKey({code:'KeyE',key:'ㄷ'}),'e');
  assert.equal(gameKey({code:'KeyA',key:'A'}),'a');
  assert.equal(gameKey({code:'ArrowLeft',key:'ArrowLeft'}),'arrowleft');
  assert.equal(gameKey({code:'Escape',key:'Escape'}),'escape');
});
