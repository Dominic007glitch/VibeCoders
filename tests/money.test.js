import test from 'node:test';import assert from 'node:assert/strict';
import {roundCents,calculateSplit} from '../src/lib/money.js';
test('converte centavos sem ponto flutuante no rateio',()=>{assert.equal(roundCents(19.99),1999);assert.deepEqual(calculateSplit(200000,20000,0,50),{available:180000,first:90000,second:90000})});
test('rateio mantém centavo residual',()=>{let s=calculateSplit(101,0,0,50);assert.equal(s.first+s.second,101)});
test('reserva impede saldo negativo',()=>{assert.equal(calculateSplit(100,200,0).available,0)});
