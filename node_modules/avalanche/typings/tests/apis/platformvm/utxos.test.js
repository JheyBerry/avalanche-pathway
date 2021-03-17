"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("src/utils/bintools"));
const utxos_1 = require("src/apis/platformvm/utxos");
const helperfunctions_1 = require("src/utils/helperfunctions");
const bintools = bintools_1.default.getInstance();
describe('UTXO', () => {
    const utxohex = '000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d';
    const outputhex = '3e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d';
    const outputidx = '00000001';
    const outtxid = '38d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5';
    const outaid = '3e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558';
    const opaddr = 'FuB6Lw2D62NuM8zpGLA4Avepq7eGsZRiG';
    const opamt = '4dd5';
    const oplocktime = '00';
    const utxobuff = buffer_1.Buffer.from(utxohex, 'hex');
    const otheraddr = 'MaTvKGccbYzCxzBkJpb2zHW7E1WReZqB8';
    // Payment
    const OPUTXOstr = bintools.cb58Encode(utxobuff);
    // "U9rFgK5jjdXmV8k5tpqeXkimzrN3o9eCCcXesyhMBBZu9MQJCDTDo5Wn5psKvzJVMJpiMbdkfDXkp7sKZddfCZdxpuDmyNy7VFka19zMW4jcz6DRQvNfA2kvJYKk96zc7uizgp3i2FYWrB8mr1sPJ8oP9Th64GQ5yHd8";
    // implies fromString and fromBuffer
    test('Creation', () => {
        const u1 = new utxos_1.UTXO();
        u1.fromBuffer(utxobuff);
        const u1hex = u1.toBuffer().toString('hex');
        expect(u1hex).toBe(utxohex);
    });
    test('Empty Creation', () => {
        const u1 = new utxos_1.UTXO();
        expect(() => {
            u1.toBuffer();
        }).toThrow();
    });
    test('Creation of Type', () => {
        const op = new utxos_1.UTXO();
        op.fromString(OPUTXOstr);
        expect(op.getOutput().getOutputID()).toBe(7);
    });
    describe('Funtionality', () => {
        const u1 = new utxos_1.UTXO();
        u1.fromBuffer(utxobuff);
        const u1hex = u1.toBuffer().toString('hex');
        test('getAssetID NonCA', () => {
            const assetid = u1.getAssetID();
            expect(assetid.toString('hex', 0, assetid.length)).toBe(outaid);
        });
        test('getTxID', () => {
            const txid = u1.getTxID();
            expect(txid.toString('hex', 0, txid.length)).toBe(outtxid);
        });
        test('getOutputIdx', () => {
            const txidx = u1.getOutputIdx();
            expect(txidx.toString('hex', 0, txidx.length)).toBe(outputidx);
        });
        test('getUTXOID', () => {
            const txid = buffer_1.Buffer.from(outtxid, 'hex');
            const txidx = buffer_1.Buffer.from(outputidx, 'hex');
            const utxoid = bintools.bufferToB58(buffer_1.Buffer.concat([txid, txidx]));
            expect(u1.getUTXOID()).toBe(utxoid);
        });
        test('toString', () => {
            const serialized = u1.toString();
            expect(serialized).toBe(bintools.cb58Encode(utxobuff));
        });
    });
});
const setMergeTester = (input, equal, notEqual) => {
    const instr = JSON.stringify(input.getUTXOIDs().sort());
    for (let i = 0; i < equal.length; i++) {
        if (JSON.stringify(equal[i].getUTXOIDs().sort()) != instr) {
            return false;
        }
    }
    for (let i = 0; i < notEqual.length; i++) {
        if (JSON.stringify(notEqual[i].getUTXOIDs().sort()) == instr) {
            return false;
        }
    }
    return true;
};
describe('UTXOSet', () => {
    const utxostrs = [
        bintools.cb58Encode(buffer_1.Buffer.from('000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d', 'hex')),
        bintools.cb58Encode(buffer_1.Buffer.from('0000c3e4823571587fe2bdfc502689f5a8238b9d0ea7f3277124d16af9de0d2d9911000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e', 'hex')),
        bintools.cb58Encode(buffer_1.Buffer.from('0000f29dba61fda8d57a911e7f8810f935bde810d3f8d495404685bdb8d9d8545e86000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e', 'hex')),
    ];
    const addrs = [
        bintools.cb58Decode('FuB6Lw2D62NuM8zpGLA4Avepq7eGsZRiG'),
        bintools.cb58Decode('MaTvKGccbYzCxzBkJpb2zHW7E1WReZqB8'),
    ];
    test('Creation', () => {
        const set = new utxos_1.UTXOSet();
        set.add(utxostrs[0]);
        const utxo = new utxos_1.UTXO();
        utxo.fromString(utxostrs[0]);
        const setArray = set.getAllUTXOs();
        expect(utxo.toString()).toBe(setArray[0].toString());
    });
    test('Serialization', () => {
        const set = new utxos_1.UTXOSet();
        set.addArray([...utxostrs]);
        let setobj = set.serialize("cb58");
        let setstr = JSON.stringify(setobj);
        /*
        console.log("-----SET1 JSON-----");
        console.log(setstr);
        console.log("-----SET1 ENDN-----");
        */
        let set2newobj = JSON.parse(setstr);
        let set2 = new utxos_1.UTXOSet();
        set2.deserialize(set2newobj, "cb58");
        let set2obj = set2.serialize("cb58");
        let set2str = JSON.stringify(set2obj);
        /*
        console.log("-----SET2 JSON-----");
        console.log(set2str);
        console.log("-----SET2 ENDN-----");
        */
        expect(set2.getAllUTXOStrings().sort().join(',')).toBe(set.getAllUTXOStrings().sort().join(','));
    });
    test('Mutliple add', () => {
        const set = new utxos_1.UTXOSet();
        // first add
        for (let i = 0; i < utxostrs.length; i++) {
            set.add(utxostrs[i]);
        }
        // the verify (do these steps separate to ensure no overwrites)
        for (let i = 0; i < utxostrs.length; i++) {
            expect(set.includes(utxostrs[i])).toBe(true);
            const utxo = new utxos_1.UTXO();
            utxo.fromString(utxostrs[i]);
            const veriutxo = set.getUTXO(utxo.getUTXOID());
            expect(veriutxo.toString()).toBe(utxostrs[i]);
        }
    });
    test('addArray', () => {
        const set = new utxos_1.UTXOSet();
        set.addArray(utxostrs);
        for (let i = 0; i < utxostrs.length; i++) {
            const e1 = new utxos_1.UTXO();
            e1.fromString(utxostrs[i]);
            expect(set.includes(e1)).toBe(true);
            const utxo = new utxos_1.UTXO();
            utxo.fromString(utxostrs[i]);
            const veriutxo = set.getUTXO(utxo.getUTXOID());
            expect(veriutxo.toString()).toBe(utxostrs[i]);
        }
        set.addArray(set.getAllUTXOs());
        for (let i = 0; i < utxostrs.length; i++) {
            const utxo = new utxos_1.UTXO();
            utxo.fromString(utxostrs[i]);
            expect(set.includes(utxo)).toBe(true);
            const veriutxo = set.getUTXO(utxo.getUTXOID());
            expect(veriutxo.toString()).toBe(utxostrs[i]);
        }
        let o = set.serialize("hex");
        let s = new utxos_1.UTXOSet();
        s.deserialize(o);
        let t = set.serialize("display");
        let r = new utxos_1.UTXOSet();
        r.deserialize(t);
    });
    test('overwriting UTXO', () => {
        const set = new utxos_1.UTXOSet();
        set.addArray(utxostrs);
        const testutxo = new utxos_1.UTXO();
        testutxo.fromString(utxostrs[0]);
        expect(set.add(utxostrs[0], true).toString()).toBe(testutxo.toString());
        expect(set.add(utxostrs[0], false)).toBeUndefined();
        expect(set.addArray(utxostrs, true).length).toBe(3);
        expect(set.addArray(utxostrs, false).length).toBe(0);
    });
    describe('Functionality', () => {
        let set;
        let utxos;
        beforeEach(() => {
            set = new utxos_1.UTXOSet();
            set.addArray(utxostrs);
            utxos = set.getAllUTXOs();
        });
        test('remove', () => {
            const testutxo = new utxos_1.UTXO();
            testutxo.fromString(utxostrs[0]);
            expect(set.remove(utxostrs[0]).toString()).toBe(testutxo.toString());
            expect(set.remove(utxostrs[0])).toBeUndefined();
            expect(set.add(utxostrs[0], false).toString()).toBe(testutxo.toString());
            expect(set.remove(utxostrs[0]).toString()).toBe(testutxo.toString());
        });
        test('removeArray', () => {
            const testutxo = new utxos_1.UTXO();
            testutxo.fromString(utxostrs[0]);
            expect(set.removeArray(utxostrs).length).toBe(3);
            expect(set.removeArray(utxostrs).length).toBe(0);
            expect(set.add(utxostrs[0], false).toString()).toBe(testutxo.toString());
            expect(set.removeArray(utxostrs).length).toBe(1);
            expect(set.addArray(utxostrs, false).length).toBe(3);
            expect(set.removeArray(utxos).length).toBe(3);
        });
        test('getUTXOIDs', () => {
            const uids = set.getUTXOIDs();
            for (let i = 0; i < utxos.length; i++) {
                expect(uids.indexOf(utxos[i].getUTXOID())).not.toBe(-1);
            }
        });
        test('getAllUTXOs', () => {
            const allutxos = set.getAllUTXOs();
            const ustrs = [];
            for (let i = 0; i < allutxos.length; i++) {
                ustrs.push(allutxos[i].toString());
            }
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs.indexOf(utxostrs[i])).not.toBe(-1);
            }
            const uids = set.getUTXOIDs();
            const allutxos2 = set.getAllUTXOs(uids);
            const ustrs2 = [];
            for (let i = 0; i < allutxos.length; i++) {
                ustrs2.push(allutxos2[i].toString());
            }
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs2.indexOf(utxostrs[i])).not.toBe(-1);
            }
        });
        test('getUTXOIDs By Address', () => {
            let utxoids;
            utxoids = set.getUTXOIDs([addrs[0]]);
            expect(utxoids.length).toBe(1);
            utxoids = set.getUTXOIDs(addrs);
            expect(utxoids.length).toBe(3);
            utxoids = set.getUTXOIDs(addrs, false);
            expect(utxoids.length).toBe(3);
        });
        test('getAllUTXOStrings', () => {
            const ustrs = set.getAllUTXOStrings();
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs.indexOf(utxostrs[i])).not.toBe(-1);
            }
            const uids = set.getUTXOIDs();
            const ustrs2 = set.getAllUTXOStrings(uids);
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs2.indexOf(utxostrs[i])).not.toBe(-1);
            }
        });
        test('getAddresses', () => {
            expect(set.getAddresses().sort()).toStrictEqual(addrs.sort());
        });
        test('getBalance', () => {
            let balance1;
            let balance2;
            balance1 = new bn_js_1.default(0);
            balance2 = new bn_js_1.default(0);
            for (let i = 0; i < utxos.length; i++) {
                const assetid = utxos[i].getAssetID();
                balance1.add(set.getBalance(addrs, assetid));
                balance2.add(utxos[i].getOutput().getAmount());
            }
            expect(balance1.toString()).toBe(balance2.toString());
            balance1 = new bn_js_1.default(0);
            balance2 = new bn_js_1.default(0);
            const now = helperfunctions_1.UnixNow();
            for (let i = 0; i < utxos.length; i++) {
                const assetid = bintools.cb58Encode(utxos[i].getAssetID());
                balance1.add(set.getBalance(addrs, assetid, now));
                balance2.add(utxos[i].getOutput().getAmount());
            }
            expect(balance1.toString()).toBe(balance2.toString());
        });
        test('getAssetIDs', () => {
            const assetIDs = set.getAssetIDs();
            for (let i = 0; i < utxos.length; i++) {
                expect(assetIDs).toContain(utxos[i].getAssetID());
            }
            const addresses = set.getAddresses();
            expect(set.getAssetIDs(addresses)).toEqual(set.getAssetIDs());
        });
        describe('Merge Rules', () => {
            let setA;
            let setB;
            let setC;
            let setD;
            let setE;
            let setF;
            let setG;
            let setH;
            // Take-or-Leave
            const newutxo = bintools.cb58Encode(buffer_1.Buffer.from('0000acf88647b3fbaa9fdf4378f3a0df6a5d15d8efb018ad78f12690390e79e1687600000003acf88647b3fbaa9fdf4378f3a0df6a5d15d8efb018ad78f12690390e79e168760000000700000000000186a000000000000000000000000100000001fceda8f90fcb5d30614b99d79fc4baa293077626', 'hex'));
            beforeEach(() => {
                setA = new utxos_1.UTXOSet();
                setA.addArray([utxostrs[0], utxostrs[2]]);
                setB = new utxos_1.UTXOSet();
                setB.addArray([utxostrs[1], utxostrs[2]]);
                setC = new utxos_1.UTXOSet();
                setC.addArray([utxostrs[0], utxostrs[1]]);
                setD = new utxos_1.UTXOSet();
                setD.addArray([utxostrs[1]]);
                setE = new utxos_1.UTXOSet();
                setE.addArray([]); // empty set
                setF = new utxos_1.UTXOSet();
                setF.addArray(utxostrs); // full set, separate from self
                setG = new utxos_1.UTXOSet();
                setG.addArray([newutxo, ...utxostrs]); // full set with new element
                setH = new utxos_1.UTXOSet();
                setH.addArray([newutxo]); // set with only a new element
            });
            test('unknown merge rule', () => {
                expect(() => {
                    set.mergeByRule(setA, 'ERROR');
                }).toThrow();
                const setArray = setG.getAllUTXOs();
            });
            test('intersection', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'intersection');
                test = setMergeTester(results, [setA], [setB, setC, setD, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'intersection');
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'intersection');
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'intersection');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
            });
            test('differenceSelf', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'differenceSelf');
                test = setMergeTester(results, [setD], [setA, setB, setC, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'differenceSelf');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'differenceSelf');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'differenceSelf');
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
            });
            test('differenceNew', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'differenceNew');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'differenceNew');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'differenceNew');
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'differenceNew');
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
            });
            test('symDifference', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'symDifference');
                test = setMergeTester(results, [setD], [setA, setB, setC, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'symDifference');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'symDifference');
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'symDifference');
                test = setMergeTester(results, [setG], [setA, setB, setC, setD, setE, setF, setH]);
                expect(test).toBe(true);
            });
            test('union', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'union');
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'union');
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'union');
                test = setMergeTester(results, [setG], [setA, setB, setC, setD, setE, setF, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'union');
                test = setMergeTester(results, [setG], [setA, setB, setC, setD, setE, setF, setH]);
                expect(test).toBe(true);
            });
            test('unionMinusNew', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'unionMinusNew');
                test = setMergeTester(results, [setD], [setA, setB, setC, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'unionMinusNew');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'unionMinusNew');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'unionMinusNew');
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
            });
            test('unionMinusSelf', () => {
                let results;
                let test;
                results = set.mergeByRule(setA, 'unionMinusSelf');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, 'unionMinusSelf');
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, 'unionMinusSelf');
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, 'unionMinusSelf');
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvcGxhdGZvcm12bS91dHhvcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQXVCO0FBQ3ZCLG9DQUFpQztBQUNqQyxrRUFBMEM7QUFDMUMscURBQTBEO0FBRTFELCtEQUFvRDtBQUVwRCxNQUFNLFFBQVEsR0FBRyxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBRXhDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLE1BQU0sT0FBTyxHQUFVLDhPQUE4TyxDQUFDO0lBQ3RRLE1BQU0sU0FBUyxHQUFVLGtLQUFrSyxDQUFDO0lBQzVMLE1BQU0sU0FBUyxHQUFVLFVBQVUsQ0FBQztJQUNwQyxNQUFNLE9BQU8sR0FBVSxrRUFBa0UsQ0FBQztJQUMxRixNQUFNLE1BQU0sR0FBVSxrRUFBa0UsQ0FBQztJQUN6RixNQUFNLE1BQU0sR0FBVSxtQ0FBbUMsQ0FBQztJQUMxRCxNQUFNLEtBQUssR0FBVSxNQUFNLENBQUM7SUFDNUIsTUFBTSxVQUFVLEdBQVUsSUFBSSxDQUFDO0lBQy9CLE1BQU0sUUFBUSxHQUFVLGVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXBELE1BQU0sU0FBUyxHQUFVLG1DQUFtQyxDQUFDO0lBRTdELFVBQVU7SUFDVixNQUFNLFNBQVMsR0FBVSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELDBLQUEwSztJQUUxSyxvQ0FBb0M7SUFDcEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7UUFDcEIsTUFBTSxFQUFFLEdBQVEsSUFBSSxZQUFJLEVBQUUsQ0FBQztRQUMzQixFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FB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QUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFeEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNuRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJOIGZyb20gJ2JuLmpzJztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJ3NyYy91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBVVFhPLCBVVFhPU2V0IH0gZnJvbSAnc3JjL2FwaXMvcGxhdGZvcm12bS91dHhvcyc7XG5pbXBvcnQgeyBBbW91bnRPdXRwdXQgfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL291dHB1dHMnO1xuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gJ3NyYy91dGlscy9oZWxwZXJmdW5jdGlvbnMnO1xuXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5cbmRlc2NyaWJlKCdVVFhPJywgKCkgPT4ge1xuICBjb25zdCB1dHhvaGV4OnN0cmluZyA9ICcwMDAwMzhkMWI5ZjExMzg2NzJkYTZmYjZjMzUxMjU1MzkyNzZhOWFjYzJhNjY4ZDYzYmVhNmJhM2M3OTVlMmVkYjBmNTAwMDAwMDAxM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwNGRkNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxYTM2ZmQwYzJkYmNhYjMxMTczMWRkZTdlZjE1MTRiZDI2ZmNkYzc0ZCc7XG4gIGNvbnN0IG91dHB1dGhleDpzdHJpbmcgPSAnM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwNGRkNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxYTM2ZmQwYzJkYmNhYjMxMTczMWRkZTdlZjE1MTRiZDI2ZmNkYzc0ZCc7XG4gIGNvbnN0IG91dHB1dGlkeDpzdHJpbmcgPSAnMDAwMDAwMDEnO1xuICBjb25zdCBvdXR0eGlkOnN0cmluZyA9ICczOGQxYjlmMTEzODY3MmRhNmZiNmMzNTEyNTUzOTI3NmE5YWNjMmE2NjhkNjNiZWE2YmEzYzc5NWUyZWRiMGY1JztcbiAgY29uc3Qgb3V0YWlkOnN0cmluZyA9ICczZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4JztcbiAgY29uc3Qgb3BhZGRyOnN0cmluZyA9ICdGdUI2THcyRDYyTnVNOHpwR0xBNEF2ZXBxN2VHc1pSaUcnO1xuICBjb25zdCBvcGFtdDpzdHJpbmcgPSAnNGRkNSc7XG4gIGNvbnN0IG9wbG9ja3RpbWU6c3RyaW5nID0gJzAwJztcbiAgY29uc3QgdXR4b2J1ZmY6QnVmZmVyID0gQnVmZmVyLmZyb20odXR4b2hleCwgJ2hleCcpO1xuXG4gIGNvbnN0IG90aGVyYWRkcjpzdHJpbmcgPSAnTWFUdktHY2NiWXpDeHpCa0pwYjJ6SFc3RTFXUmVacUI4JztcblxuICAvLyBQYXltZW50XG4gIGNvbnN0IE9QVVRYT3N0cjpzdHJpbmcgPSBiaW50b29scy5jYjU4RW5jb2RlKHV0eG9idWZmKTtcbiAgLy8gXCJVOXJGZ0s1ampkWG1WOGs1dHBxZVhraW16ck4zbzllQ0NjWGVzeWhNQkJadTlNUUpDRFREbzVXbjVwc0t2ekpWTUpwaU1iZGtmRFhrcDdzS1pkZGZDWmR4cHVEbXlOeTdWRmthMTl6TVc0amN6NkRSUXZOZkEya3ZKWUtrOTZ6Yzd1aXpncDNpMkZZV3JCOG1yMXNQSjhvUDlUaDY0R1E1eUhkOFwiO1xuXG4gIC8vIGltcGxpZXMgZnJvbVN0cmluZyBhbmQgZnJvbUJ1ZmZlclxuICB0ZXN0KCdDcmVhdGlvbicsICgpID0+IHtcbiAgICBjb25zdCB1MTpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICB1MS5mcm9tQnVmZmVyKHV0eG9idWZmKTtcbiAgICBjb25zdCB1MWhleDpzdHJpbmcgPSB1MS50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKTtcbiAgICBleHBlY3QodTFoZXgpLnRvQmUodXR4b2hleCk7XG4gIH0pO1xuXG4gIHRlc3QoJ0VtcHR5IENyZWF0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IHUxOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICB1MS50b0J1ZmZlcigpO1xuICAgIH0pLnRvVGhyb3coKTtcbiAgfSk7XG5cbiAgdGVzdCgnQ3JlYXRpb24gb2YgVHlwZScsICgpID0+IHtcbiAgICBjb25zdCBvcDpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICBvcC5mcm9tU3RyaW5nKE9QVVRYT3N0cik7XG4gICAgZXhwZWN0KG9wLmdldE91dHB1dCgpLmdldE91dHB1dElEKCkpLnRvQmUoNyk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdGdW50aW9uYWxpdHknLCAoKSA9PiB7XG4gICAgY29uc3QgdTE6VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgdTEuZnJvbUJ1ZmZlcih1dHhvYnVmZik7XG4gICAgY29uc3QgdTFoZXg6c3RyaW5nID0gdTEudG9CdWZmZXIoKS50b1N0cmluZygnaGV4Jyk7XG4gICAgdGVzdCgnZ2V0QXNzZXRJRCBOb25DQScsICgpID0+IHtcbiAgICAgIGNvbnN0IGFzc2V0aWQ6QnVmZmVyID0gdTEuZ2V0QXNzZXRJRCgpO1xuICAgICAgZXhwZWN0KGFzc2V0aWQudG9TdHJpbmcoJ2hleCcsIDAsIGFzc2V0aWQubGVuZ3RoKSkudG9CZShvdXRhaWQpO1xuICAgIH0pO1xuICAgIHRlc3QoJ2dldFR4SUQnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0eGlkOkJ1ZmZlciA9IHUxLmdldFR4SUQoKTtcbiAgICAgIGV4cGVjdCh0eGlkLnRvU3RyaW5nKCdoZXgnLCAwLCB0eGlkLmxlbmd0aCkpLnRvQmUob3V0dHhpZCk7XG4gICAgfSk7XG4gICAgdGVzdCgnZ2V0T3V0cHV0SWR4JywgKCkgPT4ge1xuICAgICAgY29uc3QgdHhpZHg6QnVmZmVyID0gdTEuZ2V0T3V0cHV0SWR4KCk7XG4gICAgICBleHBlY3QodHhpZHgudG9TdHJpbmcoJ2hleCcsIDAsIHR4aWR4Lmxlbmd0aCkpLnRvQmUob3V0cHV0aWR4KTtcbiAgICB9KTtcbiAgICB0ZXN0KCdnZXRVVFhPSUQnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0eGlkOkJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG91dHR4aWQsICdoZXgnKTtcbiAgICAgIGNvbnN0IHR4aWR4OkJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG91dHB1dGlkeCwgJ2hleCcpO1xuICAgICAgY29uc3QgdXR4b2lkOnN0cmluZyA9IGJpbnRvb2xzLmJ1ZmZlclRvQjU4KEJ1ZmZlci5jb25jYXQoW3R4aWQsIHR4aWR4XSkpO1xuICAgICAgZXhwZWN0KHUxLmdldFVUWE9JRCgpKS50b0JlKHV0eG9pZCk7XG4gICAgfSk7XG4gICAgdGVzdCgndG9TdHJpbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBzZXJpYWxpemVkOnN0cmluZyA9IHUxLnRvU3RyaW5nKCk7XG4gICAgICBleHBlY3Qoc2VyaWFsaXplZCkudG9CZShiaW50b29scy5jYjU4RW5jb2RlKHV0eG9idWZmKSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmNvbnN0IHNldE1lcmdlVGVzdGVyID0gKGlucHV0OlVUWE9TZXQsIGVxdWFsOkFycmF5PFVUWE9TZXQ+LCBub3RFcXVhbDpBcnJheTxVVFhPU2V0Pik6Ym9vbGVhbiA9PiB7XG4gIGNvbnN0IGluc3RyOnN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGlucHV0LmdldFVUWE9JRHMoKS5zb3J0KCkpO1xuICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCBlcXVhbC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeShlcXVhbFtpXS5nZXRVVFhPSURzKCkuc29ydCgpKSAhPSBpbnN0cikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IG5vdEVxdWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KG5vdEVxdWFsW2ldLmdldFVUWE9JRHMoKS5zb3J0KCkpID09IGluc3RyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuZGVzY3JpYmUoJ1VUWE9TZXQnLCAoKSA9PiB7XG4gIGNvbnN0IHV0eG9zdHJzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbSgnMDAwMDM4ZDFiOWYxMTM4NjcyZGE2ZmI2YzM1MTI1NTM5Mjc2YTlhY2MyYTY2OGQ2M2JlYTZiYTNjNzk1ZTJlZGIwZjUwMDAwMDAwMTNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgwMDAwMDAwNzAwMDAwMDAwMDAwMDRkZDUwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWEzNmZkMGMyZGJjYWIzMTE3MzFkZGU3ZWYxNTE0YmQyNmZjZGM3NGQnLCAnaGV4JykpLFxuICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oJzAwMDBjM2U0ODIzNTcxNTg3ZmUyYmRmYzUwMjY4OWY1YTgyMzhiOWQwZWE3ZjMyNzcxMjRkMTZhZjlkZTBkMmQ5OTExMDAwMDAwMDAzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDAwMDE5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlMWI2YjZhNGJhZDk0ZDJlM2YyMDczMDM3OWI5YmNkNmYxNzYzMThlJywgJ2hleCcpKSxcbiAgICBiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKCcwMDAwZjI5ZGJhNjFmZGE4ZDU3YTkxMWU3Zjg4MTBmOTM1YmRlODEwZDNmOGQ0OTU0MDQ2ODViZGI4ZDlkODU0NWU4NjAwMDAwMDAwM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwMDAxOTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZTFiNmI2YTRiYWQ5NGQyZTNmMjA3MzAzNzliOWJjZDZmMTc2MzE4ZScsICdoZXgnKSksXG4gIF07XG4gIGNvbnN0IGFkZHJzOkFycmF5PEJ1ZmZlcj4gPSBbXG4gICAgYmludG9vbHMuY2I1OERlY29kZSgnRnVCNkx3MkQ2Mk51TTh6cEdMQTRBdmVwcTdlR3NaUmlHJyksXG4gICAgYmludG9vbHMuY2I1OERlY29kZSgnTWFUdktHY2NiWXpDeHpCa0pwYjJ6SFc3RTFXUmVacUI4JyksXG4gIF07XG4gIHRlc3QoJ0NyZWF0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IHNldDpVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKTtcbiAgICBzZXQuYWRkKHV0eG9zdHJzWzBdKTtcbiAgICBjb25zdCB1dHhvOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgIHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1swXSk7XG4gICAgY29uc3Qgc2V0QXJyYXk6QXJyYXk8VVRYTz4gPSBzZXQuZ2V0QWxsVVRYT3MoKTtcbiAgICBleHBlY3QodXR4by50b1N0cmluZygpKS50b0JlKHNldEFycmF5WzBdLnRvU3RyaW5nKCkpO1xuXG4gIH0pO1xuXG4gIHRlc3QoJ1NlcmlhbGl6YXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgc2V0OlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHNldC5hZGRBcnJheShbLi4udXR4b3N0cnNdKTtcbiAgICBsZXQgc2V0b2JqOm9iamVjdCA9IHNldC5zZXJpYWxpemUoXCJjYjU4XCIpO1xuICAgIGxldCBzZXRzdHI6c3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoc2V0b2JqKTtcbiAgICAvKlxuICAgIGNvbnNvbGUubG9nKFwiLS0tLS1TRVQxIEpTT04tLS0tLVwiKTtcbiAgICBjb25zb2xlLmxvZyhzZXRzdHIpO1xuICAgIGNvbnNvbGUubG9nKFwiLS0tLS1TRVQxIEVORE4tLS0tLVwiKTtcbiAgICAqL1xuICAgIGxldCBzZXQybmV3b2JqOm9iamVjdCA9IEpTT04ucGFyc2Uoc2V0c3RyKTtcbiAgICBsZXQgc2V0MjpVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKTtcbiAgICBzZXQyLmRlc2VyaWFsaXplKHNldDJuZXdvYmosIFwiY2I1OFwiKTtcbiAgICBsZXQgc2V0Mm9iajpvYmplY3QgPSBzZXQyLnNlcmlhbGl6ZShcImNiNThcIik7XG4gICAgbGV0IHNldDJzdHI6c3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoc2V0Mm9iaik7XG4gICAgLypcbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tU0VUMiBKU09OLS0tLS1cIik7XG4gICAgY29uc29sZS5sb2coc2V0MnN0cik7XG4gICAgY29uc29sZS5sb2coXCItLS0tLVNFVDIgRU5ETi0tLS0tXCIpO1xuICAgICovXG5cbiAgICBleHBlY3Qoc2V0Mi5nZXRBbGxVVFhPU3RyaW5ncygpLnNvcnQoKS5qb2luKCcsJykpLnRvQmUoc2V0LmdldEFsbFVUWE9TdHJpbmdzKCkuc29ydCgpLmpvaW4oJywnKSk7XG4gIH0pO1xuXG4gIHRlc3QoJ011dGxpcGxlIGFkZCcsICgpID0+IHtcbiAgICBjb25zdCBzZXQ6VVRYT1NldCA9IG5ldyBVVFhPU2V0KCk7XG4gICAgLy8gZmlyc3QgYWRkXG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHNldC5hZGQodXR4b3N0cnNbaV0pO1xuICAgIH1cbiAgICAvLyB0aGUgdmVyaWZ5IChkbyB0aGVzZSBzdGVwcyBzZXBhcmF0ZSB0byBlbnN1cmUgbm8gb3ZlcndyaXRlcylcbiAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgZXhwZWN0KHNldC5pbmNsdWRlcyh1dHhvc3Ryc1tpXSkpLnRvQmUodHJ1ZSk7XG4gICAgICBjb25zdCB1dHhvOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzW2ldKTtcbiAgICAgIGNvbnN0IHZlcml1dHhvOlVUWE8gPSBzZXQuZ2V0VVRYTyh1dHhvLmdldFVUWE9JRCgpKSBhcyBVVFhPO1xuICAgICAgZXhwZWN0KHZlcml1dHhvLnRvU3RyaW5nKCkpLnRvQmUodXR4b3N0cnNbaV0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdGVzdCgnYWRkQXJyYXknLCAoKSA9PiB7XG4gICAgY29uc3Qgc2V0OlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHNldC5hZGRBcnJheSh1dHhvc3Rycyk7XG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUxOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgICAgZTEuZnJvbVN0cmluZyh1dHhvc3Ryc1tpXSk7XG4gICAgICBleHBlY3Qoc2V0LmluY2x1ZGVzKGUxKSkudG9CZSh0cnVlKTtcbiAgICAgIGNvbnN0IHV0eG86VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgICB1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbaV0pO1xuICAgICAgY29uc3QgdmVyaXV0eG86VVRYTyA9IHNldC5nZXRVVFhPKHV0eG8uZ2V0VVRYT0lEKCkpIGFzIFVUWE87XG4gICAgICBleHBlY3QodmVyaXV0eG8udG9TdHJpbmcoKSkudG9CZSh1dHhvc3Ryc1tpXSk7XG4gICAgfVxuXG4gICAgc2V0LmFkZEFycmF5KHNldC5nZXRBbGxVVFhPcygpKTtcbiAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdXR4bzpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICAgIHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1tpXSk7XG4gICAgICBleHBlY3Qoc2V0LmluY2x1ZGVzKHV0eG8pKS50b0JlKHRydWUpO1xuXG4gICAgICBjb25zdCB2ZXJpdXR4bzpVVFhPID0gc2V0LmdldFVUWE8odXR4by5nZXRVVFhPSUQoKSkgYXMgVVRYTztcbiAgICAgIGV4cGVjdCh2ZXJpdXR4by50b1N0cmluZygpKS50b0JlKHV0eG9zdHJzW2ldKTtcbiAgICB9XG4gICAgbGV0IG86b2JqZWN0ID0gc2V0LnNlcmlhbGl6ZShcImhleFwiKTtcbiAgICBsZXQgczpVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKTtcbiAgICBzLmRlc2VyaWFsaXplKG8pO1xuICAgIGxldCB0Om9iamVjdCA9IHNldC5zZXJpYWxpemUoXCJkaXNwbGF5XCIpO1xuICAgIGxldCByOlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHIuZGVzZXJpYWxpemUodCk7XG4gIH0pO1xuXG4gIHRlc3QoJ292ZXJ3cml0aW5nIFVUWE8nLCAoKSA9PiB7XG4gICAgY29uc3Qgc2V0OlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHNldC5hZGRBcnJheSh1dHhvc3Rycyk7XG4gICAgY29uc3QgdGVzdHV0eG86VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgdGVzdHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1swXSk7XG4gICAgZXhwZWN0KHNldC5hZGQodXR4b3N0cnNbMF0sIHRydWUpLnRvU3RyaW5nKCkpLnRvQmUodGVzdHV0eG8udG9TdHJpbmcoKSk7XG4gICAgZXhwZWN0KHNldC5hZGQodXR4b3N0cnNbMF0sIGZhbHNlKSkudG9CZVVuZGVmaW5lZCgpO1xuICAgIGV4cGVjdChzZXQuYWRkQXJyYXkodXR4b3N0cnMsIHRydWUpLmxlbmd0aCkudG9CZSgzKTtcbiAgICBleHBlY3Qoc2V0LmFkZEFycmF5KHV0eG9zdHJzLCBmYWxzZSkubGVuZ3RoKS50b0JlKDApO1xuICB9KTtcblxuICBkZXNjcmliZSgnRnVuY3Rpb25hbGl0eScsICgpID0+IHtcbiAgICBsZXQgc2V0OlVUWE9TZXQ7XG4gICAgbGV0IHV0eG9zOkFycmF5PFVUWE8+O1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2V0ID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgIHNldC5hZGRBcnJheSh1dHhvc3Rycyk7XG4gICAgICB1dHhvcyA9IHNldC5nZXRBbGxVVFhPcygpO1xuICAgIH0pO1xuXG4gICAgdGVzdCgncmVtb3ZlJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdHV0eG86VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgICB0ZXN0dXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKTtcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlKHV0eG9zdHJzWzBdKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpO1xuICAgICAgZXhwZWN0KHNldC5yZW1vdmUodXR4b3N0cnNbMF0pKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICBleHBlY3Qoc2V0LmFkZCh1dHhvc3Ryc1swXSwgZmFsc2UpLnRvU3RyaW5nKCkpLnRvQmUodGVzdHV0eG8udG9TdHJpbmcoKSk7XG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZSh1dHhvc3Ryc1swXSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ3JlbW92ZUFycmF5JywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdHV0eG86VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgICB0ZXN0dXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKTtcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlQXJyYXkodXR4b3N0cnMpLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlQXJyYXkodXR4b3N0cnMpLmxlbmd0aCkudG9CZSgwKTtcbiAgICAgIGV4cGVjdChzZXQuYWRkKHV0eG9zdHJzWzBdLCBmYWxzZSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKTtcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlQXJyYXkodXR4b3N0cnMpLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgIGV4cGVjdChzZXQuYWRkQXJyYXkodXR4b3N0cnMsIGZhbHNlKS5sZW5ndGgpLnRvQmUoMyk7XG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZUFycmF5KHV0eG9zKS5sZW5ndGgpLnRvQmUoMyk7XG4gICAgfSk7XG5cbiAgICB0ZXN0KCdnZXRVVFhPSURzJywgKCkgPT4ge1xuICAgICAgY29uc3QgdWlkczpBcnJheTxzdHJpbmc+ID0gc2V0LmdldFVUWE9JRHMoKTtcbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdCh1aWRzLmluZGV4T2YodXR4b3NbaV0uZ2V0VVRYT0lEKCkpKS5ub3QudG9CZSgtMSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0ZXN0KCdnZXRBbGxVVFhPcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGFsbHV0eG9zOkFycmF5PFVUWE8+ID0gc2V0LmdldEFsbFVUWE9zKCk7XG4gICAgICBjb25zdCB1c3RyczpBcnJheTxzdHJpbmc+ID0gW107XG4gICAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCBhbGx1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB1c3Rycy5wdXNoKGFsbHV0eG9zW2ldLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVzdHJzLmluZGV4T2YodXR4b3N0cnNbaV0pKS5ub3QudG9CZSgtMSk7XG4gICAgICB9XG4gICAgICBjb25zdCB1aWRzOkFycmF5PHN0cmluZz4gPSBzZXQuZ2V0VVRYT0lEcygpO1xuICAgICAgY29uc3QgYWxsdXR4b3MyOkFycmF5PFVUWE8+ID0gc2V0LmdldEFsbFVUWE9zKHVpZHMpO1xuICAgICAgY29uc3QgdXN0cnMyOkFycmF5PHN0cmluZz4gPSBbXTtcbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IGFsbHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVzdHJzMi5wdXNoKGFsbHV0eG9zMltpXS50b1N0cmluZygpKTtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdCh1c3RyczIuaW5kZXhPZih1dHhvc3Ryc1tpXSkpLm5vdC50b0JlKC0xKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRlc3QoJ2dldFVUWE9JRHMgQnkgQWRkcmVzcycsICgpID0+IHtcbiAgICAgIGxldCB1dHhvaWRzOkFycmF5PHN0cmluZz47XG4gICAgICB1dHhvaWRzID0gc2V0LmdldFVUWE9JRHMoW2FkZHJzWzBdXSk7XG4gICAgICBleHBlY3QodXR4b2lkcy5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICB1dHhvaWRzID0gc2V0LmdldFVUWE9JRHMoYWRkcnMpO1xuICAgICAgZXhwZWN0KHV0eG9pZHMubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgdXR4b2lkcyA9IHNldC5nZXRVVFhPSURzKGFkZHJzLCBmYWxzZSk7XG4gICAgICBleHBlY3QodXR4b2lkcy5sZW5ndGgpLnRvQmUoMyk7XG4gICAgfSk7XG5cbiAgICB0ZXN0KCdnZXRBbGxVVFhPU3RyaW5ncycsICgpID0+IHtcbiAgICAgIGNvbnN0IHVzdHJzOkFycmF5PHN0cmluZz4gPSBzZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKTtcbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdCh1c3Rycy5pbmRleE9mKHV0eG9zdHJzW2ldKSkubm90LnRvQmUoLTEpO1xuICAgICAgfVxuICAgICAgY29uc3QgdWlkczpBcnJheTxzdHJpbmc+ID0gc2V0LmdldFVUWE9JRHMoKTtcbiAgICAgIGNvbnN0IHVzdHJzMjpBcnJheTxzdHJpbmc+ID0gc2V0LmdldEFsbFVUWE9TdHJpbmdzKHVpZHMpO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVzdHJzMi5pbmRleE9mKHV0eG9zdHJzW2ldKSkubm90LnRvQmUoLTEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGVzdCgnZ2V0QWRkcmVzc2VzJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHNldC5nZXRBZGRyZXNzZXMoKS5zb3J0KCkpLnRvU3RyaWN0RXF1YWwoYWRkcnMuc29ydCgpKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ2dldEJhbGFuY2UnLCAoKSA9PiB7XG4gICAgICBsZXQgYmFsYW5jZTE6Qk47XG4gICAgICBsZXQgYmFsYW5jZTI6Qk47XG4gICAgICBiYWxhbmNlMSA9IG5ldyBCTigwKTtcbiAgICAgIGJhbGFuY2UyID0gbmV3IEJOKDApO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXNzZXRpZCA9IHV0eG9zW2ldLmdldEFzc2V0SUQoKTtcbiAgICAgICAgYmFsYW5jZTEuYWRkKHNldC5nZXRCYWxhbmNlKGFkZHJzLCBhc3NldGlkKSk7XG4gICAgICAgIGJhbGFuY2UyLmFkZCgodXR4b3NbaV0uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSk7XG4gICAgICB9XG4gICAgICBleHBlY3QoYmFsYW5jZTEudG9TdHJpbmcoKSkudG9CZShiYWxhbmNlMi50b1N0cmluZygpKTtcblxuICAgICAgYmFsYW5jZTEgPSBuZXcgQk4oMCk7XG4gICAgICBiYWxhbmNlMiA9IG5ldyBCTigwKTtcbiAgICAgIGNvbnN0IG5vdzpCTiA9IFVuaXhOb3coKTtcbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFzc2V0aWQgPSBiaW50b29scy5jYjU4RW5jb2RlKHV0eG9zW2ldLmdldEFzc2V0SUQoKSk7XG4gICAgICAgIGJhbGFuY2UxLmFkZChzZXQuZ2V0QmFsYW5jZShhZGRycywgYXNzZXRpZCwgbm93KSk7XG4gICAgICAgIGJhbGFuY2UyLmFkZCgodXR4b3NbaV0uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSk7XG4gICAgICB9XG4gICAgICBleHBlY3QoYmFsYW5jZTEudG9TdHJpbmcoKSkudG9CZShiYWxhbmNlMi50b1N0cmluZygpKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ2dldEFzc2V0SURzJywgKCkgPT4ge1xuICAgICAgY29uc3QgYXNzZXRJRHM6QXJyYXk8QnVmZmVyPiA9IHNldC5nZXRBc3NldElEcygpO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KGFzc2V0SURzKS50b0NvbnRhaW4odXR4b3NbaV0uZ2V0QXNzZXRJRCgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFkZHJlc3NlczpBcnJheTxCdWZmZXI+ID0gc2V0LmdldEFkZHJlc3NlcygpO1xuICAgICAgZXhwZWN0KHNldC5nZXRBc3NldElEcyhhZGRyZXNzZXMpKS50b0VxdWFsKHNldC5nZXRBc3NldElEcygpKTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdNZXJnZSBSdWxlcycsICgpID0+IHtcbiAgICAgIGxldCBzZXRBOlVUWE9TZXQ7XG4gICAgICBsZXQgc2V0QjpVVFhPU2V0O1xuICAgICAgbGV0IHNldEM6VVRYT1NldDtcbiAgICAgIGxldCBzZXREOlVUWE9TZXQ7XG4gICAgICBsZXQgc2V0RTpVVFhPU2V0O1xuICAgICAgbGV0IHNldEY6VVRYT1NldDtcbiAgICAgIGxldCBzZXRHOlVUWE9TZXQ7XG4gICAgICBsZXQgc2V0SDpVVFhPU2V0O1xuICAgICAgLy8gVGFrZS1vci1MZWF2ZVxuICAgICAgY29uc3QgbmV3dXR4bzpzdHJpbmcgPSBiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKCcwMDAwYWNmODg2NDdiM2ZiYWE5ZmRmNDM3OGYzYTBkZjZhNWQxNWQ4ZWZiMDE4YWQ3OGYxMjY5MDM5MGU3OWUxNjg3NjAwMDAwMDAzYWNmODg2NDdiM2ZiYWE5ZmRmNDM3OGYzYTBkZjZhNWQxNWQ4ZWZiMDE4YWQ3OGYxMjY5MDM5MGU3OWUxNjg3NjAwMDAwMDA3MDAwMDAwMDAwMDAxODZhMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZmNlZGE4ZjkwZmNiNWQzMDYxNGI5OWQ3OWZjNGJhYTI5MzA3NzYyNicsICdoZXgnKSk7XG5cbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzZXRBID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0QS5hZGRBcnJheShbdXR4b3N0cnNbMF0sIHV0eG9zdHJzWzJdXSk7XG5cbiAgICAgICAgc2V0QiA9IG5ldyBVVFhPU2V0KCk7XG4gICAgICAgIHNldEIuYWRkQXJyYXkoW3V0eG9zdHJzWzFdLCB1dHhvc3Ryc1syXV0pO1xuXG4gICAgICAgIHNldEMgPSBuZXcgVVRYT1NldCgpO1xuICAgICAgICBzZXRDLmFkZEFycmF5KFt1dHhvc3Ryc1swXSwgdXR4b3N0cnNbMV1dKTtcblxuICAgICAgICBzZXREID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0RC5hZGRBcnJheShbdXR4b3N0cnNbMV1dKTtcblxuICAgICAgICBzZXRFID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0RS5hZGRBcnJheShbXSk7Ly8gZW1wdHkgc2V0XG5cbiAgICAgICAgc2V0RiA9IG5ldyBVVFhPU2V0KCk7XG4gICAgICAgIHNldEYuYWRkQXJyYXkodXR4b3N0cnMpOyAvLyBmdWxsIHNldCwgc2VwYXJhdGUgZnJvbSBzZWxmXG5cbiAgICAgICAgc2V0RyA9IG5ldyBVVFhPU2V0KCk7XG4gICAgICAgIHNldEcuYWRkQXJyYXkoW25ld3V0eG8sIC4uLnV0eG9zdHJzXSk7IC8vIGZ1bGwgc2V0IHdpdGggbmV3IGVsZW1lbnRcblxuICAgICAgICBzZXRIID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0SC5hZGRBcnJheShbbmV3dXR4b10pOyAvLyBzZXQgd2l0aCBvbmx5IGEgbmV3IGVsZW1lbnRcbiAgICAgIH0pO1xuXG4gICAgICB0ZXN0KCd1bmtub3duIG1lcmdlIHJ1bGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgICAgc2V0Lm1lcmdlQnlSdWxlKHNldEEsICdFUlJPUicpO1xuICAgICAgICB9KS50b1Rocm93KCk7XG4gICAgICAgIGNvbnN0IHNldEFycmF5OkFycmF5PFVUWE8+ID0gc2V0Ry5nZXRBbGxVVFhPcygpO1xuICAgICAgfSk7XG5cbiAgICAgIHRlc3QoJ2ludGVyc2VjdGlvbicsICgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6VVRYT1NldDtcbiAgICAgICAgbGV0IHRlc3Q6Ym9vbGVhbjtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsICdpbnRlcnNlY3Rpb24nKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRBXSwgW3NldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCAnaW50ZXJzZWN0aW9uJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgJ2ludGVyc2VjdGlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsICdpbnRlcnNlY3Rpb24nKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG4gICAgICB9KTtcblxuICAgICAgdGVzdCgnZGlmZmVyZW5jZVNlbGYnLCAoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOlVUWE9TZXQ7XG4gICAgICAgIGxldCB0ZXN0OmJvb2xlYW47XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCAnZGlmZmVyZW5jZVNlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXREXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEUsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCAnZGlmZmVyZW5jZVNlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCAnZGlmZmVyZW5jZVNlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCAnZGlmZmVyZW5jZVNlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRGXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG4gICAgICB9KTtcblxuICAgICAgdGVzdCgnZGlmZmVyZW5jZU5ldycsICgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6VVRYT1NldDtcbiAgICAgICAgbGV0IHRlc3Q6Ym9vbGVhbjtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsICdkaWZmZXJlbmNlTmV3Jyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RiwgJ2RpZmZlcmVuY2VOZXcnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCAnZGlmZmVyZW5jZU5ldycpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsICdkaWZmZXJlbmNlTmV3Jyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0SF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRHXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHRlc3QoJ3N5bURpZmZlcmVuY2UnLCAoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOlVUWE9TZXQ7XG4gICAgICAgIGxldCB0ZXN0OmJvb2xlYW47XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCAnc3ltRGlmZmVyZW5jZScpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldERdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsICdzeW1EaWZmZXJlbmNlJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgJ3N5bURpZmZlcmVuY2UnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCAnc3ltRGlmZmVyZW5jZScpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEddLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0ZXN0KCd1bmlvbicsICgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6VVRYT1NldDtcbiAgICAgICAgbGV0IHRlc3Q6Ym9vbGVhbjtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsICd1bmlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsICd1bmlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsICd1bmlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEddLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsICd1bmlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEddLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0ZXN0KCd1bmlvbk1pbnVzTmV3JywgKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czpVVFhPU2V0O1xuICAgICAgICBsZXQgdGVzdDpib29sZWFuO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgJ3VuaW9uTWludXNOZXcnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXREXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEUsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCAndW5pb25NaW51c05ldycpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsICd1bmlvbk1pbnVzTmV3Jyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgJ3VuaW9uTWludXNOZXcnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRGXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG4gICAgICB9KTtcblxuICAgICAgdGVzdCgndW5pb25NaW51c1NlbGYnLCAoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOlVUWE9TZXQ7XG4gICAgICAgIGxldCB0ZXN0OmJvb2xlYW47XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCAndW5pb25NaW51c1NlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCAndW5pb25NaW51c1NlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCAndW5pb25NaW51c1NlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCAndW5pb25NaW51c1NlbGYnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==