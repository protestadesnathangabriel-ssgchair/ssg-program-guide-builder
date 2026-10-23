import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGuide, createGuide, GUIDE_TYPES, validateGuide } from '../src/guide-schema.js';
test('normalizes flow and preserves nested section/item fields',()=>{ const g=normalizeGuide({id:'a',title:'Opening',type:'PROGRAM_FLOW',sections:[{title:'Start',items:[{title:'Prayer',trt:'5 min',mediaUrl:'https://example.com'}]}]}); assert.equal(g.type,GUIDE_TYPES.FLOW); assert.equal(g.sections[0].items[0].duration,'5 min'); assert.equal(g.sections[0].items[0].mediaUrl,'https://example.com'); });
test('preserves sequence type',()=>assert.equal(createGuide('b',GUIDE_TYPES.SEQUENCE).type,GUIDE_TYPES.SEQUENCE));
test('provides stable required defaults',()=>{const g=normalizeGuide({id:'c'});assert.equal(g.title,'Untitled Program Guide');assert.deepEqual(g.sections,[]);});
test('validation requires an id',()=>assert.equal(validateGuide({title:'Test'}).valid,false));
test('normalizes host color and names',()=>{const g=normalizeGuide({hosts:[{name:'  Host A  '}]});assert.equal(g.hosts[0].name,'Host A');assert.equal(g.hosts[0].color,'#39ff14');});
