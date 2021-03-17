"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("src/utils/bintools"));
const utxos_1 = require("src/apis/avm/utxos");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvYXZtL3V0eG9zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBdUI7QUFDdkIsb0NBQWlDO0FBQ2pDLGtFQUEwQztBQUMxQyw4Q0FBbUQ7QUFFbkQsK0RBQW9EO0FBRXBELE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFeEMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7SUFDcEIsTUFBTSxPQUFPLEdBQVUsOE9BQThPLENBQUM7SUFDdFEsTUFBTSxTQUFTLEdBQVUsa0tBQWtLLENBQUM7SUFDNUwsTUFBTSxTQUFTLEdBQVUsVUFBVSxDQUFDO0lBQ3BDLE1BQU0sT0FBTyxHQUFVLGtFQUFrRSxDQUFDO0lBQzFGLE1BQU0sTUFBTSxHQUFVLGtFQUFrRSxDQUFDO0lBQ3pGLE1BQU0sTUFBTSxHQUFVLG1DQUFtQyxDQUFDO0lBQzFELE1BQU0sS0FBSyxHQUFVLE1BQU0sQ0FBQztJQUM1QixNQUFNLFVBQVUsR0FBVSxJQUFJLENBQUM7SUFDL0IsTUFBTSxRQUFRLEdBQVUsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFcEQsTUFBTSxTQUFTLEdBQVUsbUNBQW1DLENBQUM7SUFFN0QsVUFBVTtJQUNWLE1BQU0sU0FBUyxHQUFVLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkQsMEtBQTBLO0lBRTFLLG9DQUFvQztJQUNwQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtRQUNwQixNQUFNLEVBQUUsR0FBUSxJQUFJLFlBQUksRUFBRSxDQUFDO1FBQzNCLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEIsTUFBTSxLQUFLLEdBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEs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QUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDL0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsTUFBTSxJQUFJLEdBQVEsSUFBSSxZQUFJLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sUUFBUSxHQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFTLENBQUM7WUFDNUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7UUFDcEIsTUFBTSxHQUFHLEdBQVcsSUFBSSxlQUFPLEVBQUUsQ0FBQztRQUNsQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQy9DLE1BQU0sRUFBRSxHQUFRLElBQUksWUFBSSxFQUFFLENBQUM7WUFDM0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBUSxJQUFJLFlBQUksRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFD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RSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXhCLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXhCLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXhCLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFB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LE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFeEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFeEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFeEIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFF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QUMsQ0FBQyxDQUFDO2dCQUNuRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV4QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXhCLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCTiBmcm9tICdibi5qcyc7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICdzcmMvdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgVVRYTywgVVRYT1NldCB9IGZyb20gJ3NyYy9hcGlzL2F2bS91dHhvcyc7XG5pbXBvcnQgeyBBbW91bnRPdXRwdXQgfSBmcm9tICdzcmMvYXBpcy9hdm0vb3V0cHV0cyc7XG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnc3JjL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucyc7XG5cbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcblxuZGVzY3JpYmUoJ1VUWE8nLCAoKSA9PiB7XG4gIGNvbnN0IHV0eG9oZXg6c3RyaW5nID0gJzAwMDAzOGQxYjlmMTEzODY3MmRhNmZiNmMzNTEyNTUzOTI3NmE5YWNjMmE2NjhkNjNiZWE2YmEzYzc5NWUyZWRiMGY1MDAwMDAwMDEzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDA0ZGQ1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFhMzZmZDBjMmRiY2FiMzExNzMxZGRlN2VmMTUxNGJkMjZmY2RjNzRkJztcbiAgY29uc3Qgb3V0cHV0aGV4OnN0cmluZyA9ICczZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDA0ZGQ1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFhMzZmZDBjMmRiY2FiMzExNzMxZGRlN2VmMTUxNGJkMjZmY2RjNzRkJztcbiAgY29uc3Qgb3V0cHV0aWR4OnN0cmluZyA9ICcwMDAwMDAwMSc7XG4gIGNvbnN0IG91dHR4aWQ6c3RyaW5nID0gJzM4ZDFiOWYxMTM4NjcyZGE2ZmI2YzM1MTI1NTM5Mjc2YTlhY2MyYTY2OGQ2M2JlYTZiYTNjNzk1ZTJlZGIwZjUnO1xuICBjb25zdCBvdXRhaWQ6c3RyaW5nID0gJzNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgnO1xuICBjb25zdCBvcGFkZHI6c3RyaW5nID0gJ0Z1QjZMdzJENjJOdU04enBHTEE0QXZlcHE3ZUdzWlJpRyc7XG4gIGNvbnN0IG9wYW10OnN0cmluZyA9ICc0ZGQ1JztcbiAgY29uc3Qgb3Bsb2NrdGltZTpzdHJpbmcgPSAnMDAnO1xuICBjb25zdCB1dHhvYnVmZjpCdWZmZXIgPSBCdWZmZXIuZnJvbSh1dHhvaGV4LCAnaGV4Jyk7XG5cbiAgY29uc3Qgb3RoZXJhZGRyOnN0cmluZyA9ICdNYVR2S0djY2JZekN4ekJrSnBiMnpIVzdFMVdSZVpxQjgnO1xuXG4gIC8vIFBheW1lbnRcbiAgY29uc3QgT1BVVFhPc3RyOnN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUodXR4b2J1ZmYpO1xuICAvLyBcIlU5ckZnSzVqamRYbVY4azV0cHFlWGtpbXpyTjNvOWVDQ2NYZXN5aE1CQlp1OU1RSkNEVERvNVduNXBzS3Z6SlZNSnBpTWJka2ZEWGtwN3NLWmRkZkNaZHhwdURteU55N1ZGa2ExOXpNVzRqY3o2RFJRdk5mQTJrdkpZS2s5NnpjN3VpemdwM2kyRllXckI4bXIxc1BKOG9QOVRoNjRHUTV5SGQ4XCI7XG5cbiAgLy8gaW1wbGllcyBmcm9tU3RyaW5nIGFuZCBmcm9tQnVmZmVyXG4gIHRlc3QoJ0NyZWF0aW9uJywgKCkgPT4ge1xuICAgIGNvbnN0IHUxOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgIHUxLmZyb21CdWZmZXIodXR4b2J1ZmYpO1xuICAgIGNvbnN0IHUxaGV4OnN0cmluZyA9IHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpO1xuICAgIGV4cGVjdCh1MWhleCkudG9CZSh1dHhvaGV4KTtcbiAgfSk7XG5cbiAgdGVzdCgnRW1wdHkgQ3JlYXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3QgdTE6VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgZXhwZWN0KCgpID0+IHtcbiAgICAgIHUxLnRvQnVmZmVyKCk7XG4gICAgfSkudG9UaHJvdygpO1xuICB9KTtcblxuICB0ZXN0KCdDcmVhdGlvbiBvZiBUeXBlJywgKCkgPT4ge1xuICAgIGNvbnN0IG9wOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgIG9wLmZyb21TdHJpbmcoT1BVVFhPc3RyKTtcbiAgICBleHBlY3Qob3AuZ2V0T3V0cHV0KCkuZ2V0T3V0cHV0SUQoKSkudG9CZSg3KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ0Z1bnRpb25hbGl0eScsICgpID0+IHtcbiAgICBjb25zdCB1MTpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICB1MS5mcm9tQnVmZmVyKHV0eG9idWZmKTtcbiAgICBjb25zdCB1MWhleDpzdHJpbmcgPSB1MS50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKTtcbiAgICB0ZXN0KCdnZXRBc3NldElEIE5vbkNBJywgKCkgPT4ge1xuICAgICAgY29uc3QgYXNzZXRpZDpCdWZmZXIgPSB1MS5nZXRBc3NldElEKCk7XG4gICAgICBleHBlY3QoYXNzZXRpZC50b1N0cmluZygnaGV4JywgMCwgYXNzZXRpZC5sZW5ndGgpKS50b0JlKG91dGFpZCk7XG4gICAgfSk7XG4gICAgdGVzdCgnZ2V0VHhJRCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHR4aWQ6QnVmZmVyID0gdTEuZ2V0VHhJRCgpO1xuICAgICAgZXhwZWN0KHR4aWQudG9TdHJpbmcoJ2hleCcsIDAsIHR4aWQubGVuZ3RoKSkudG9CZShvdXR0eGlkKTtcbiAgICB9KTtcbiAgICB0ZXN0KCdnZXRPdXRwdXRJZHgnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0eGlkeDpCdWZmZXIgPSB1MS5nZXRPdXRwdXRJZHgoKTtcbiAgICAgIGV4cGVjdCh0eGlkeC50b1N0cmluZygnaGV4JywgMCwgdHhpZHgubGVuZ3RoKSkudG9CZShvdXRwdXRpZHgpO1xuICAgIH0pO1xuICAgIHRlc3QoJ2dldFVUWE9JRCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHR4aWQ6QnVmZmVyID0gQnVmZmVyLmZyb20ob3V0dHhpZCwgJ2hleCcpO1xuICAgICAgY29uc3QgdHhpZHg6QnVmZmVyID0gQnVmZmVyLmZyb20ob3V0cHV0aWR4LCAnaGV4Jyk7XG4gICAgICBjb25zdCB1dHhvaWQ6c3RyaW5nID0gYmludG9vbHMuYnVmZmVyVG9CNTgoQnVmZmVyLmNvbmNhdChbdHhpZCwgdHhpZHhdKSk7XG4gICAgICBleHBlY3QodTEuZ2V0VVRYT0lEKCkpLnRvQmUodXR4b2lkKTtcbiAgICB9KTtcbiAgICB0ZXN0KCd0b1N0cmluZycsICgpID0+IHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZWQ6c3RyaW5nID0gdTEudG9TdHJpbmcoKTtcbiAgICAgIGV4cGVjdChzZXJpYWxpemVkKS50b0JlKGJpbnRvb2xzLmNiNThFbmNvZGUodXR4b2J1ZmYpKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuY29uc3Qgc2V0TWVyZ2VUZXN0ZXIgPSAoaW5wdXQ6VVRYT1NldCwgZXF1YWw6QXJyYXk8VVRYT1NldD4sIG5vdEVxdWFsOkFycmF5PFVUWE9TZXQ+KTpib29sZWFuID0+IHtcbiAgY29uc3QgaW5zdHI6c3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoaW5wdXQuZ2V0VVRYT0lEcygpLnNvcnQoKSk7XG4gIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IGVxdWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGVxdWFsW2ldLmdldFVUWE9JRHMoKS5zb3J0KCkpICE9IGluc3RyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgbm90RXF1YWwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkobm90RXF1YWxbaV0uZ2V0VVRYT0lEcygpLnNvcnQoKSkgPT0gaW5zdHIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5kZXNjcmliZSgnVVRYT1NldCcsICgpID0+IHtcbiAgY29uc3QgdXR4b3N0cnM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICBiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKCcwMDAwMzhkMWI5ZjExMzg2NzJkYTZmYjZjMzUxMjU1MzkyNzZhOWFjYzJhNjY4ZDYzYmVhNmJhM2M3OTVlMmVkYjBmNTAwMDAwMDAxM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwNGRkNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxYTM2ZmQwYzJkYmNhYjMxMTczMWRkZTdlZjE1MTRiZDI2ZmNkYzc0ZCcsICdoZXgnKSksXG4gICAgYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbSgnMDAwMGMzZTQ4MjM1NzE1ODdmZTJiZGZjNTAyNjg5ZjVhODIzOGI5ZDBlYTdmMzI3NzEyNGQxNmFmOWRlMGQyZDk5MTEwMDAwMDAwMDNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgwMDAwMDAwNzAwMDAwMDAwMDAwMDAwMTkwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWUxYjZiNmE0YmFkOTRkMmUzZjIwNzMwMzc5YjliY2Q2ZjE3NjMxOGUnLCAnaGV4JykpLFxuICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oJzAwMDBmMjlkYmE2MWZkYThkNTdhOTExZTdmODgxMGY5MzViZGU4MTBkM2Y4ZDQ5NTQwNDY4NWJkYjhkOWQ4NTQ1ZTg2MDAwMDAwMDAzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDAwMDE5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlMWI2YjZhNGJhZDk0ZDJlM2YyMDczMDM3OWI5YmNkNmYxNzYzMThlJywgJ2hleCcpKSxcbiAgXTtcbiAgY29uc3QgYWRkcnM6QXJyYXk8QnVmZmVyPiA9IFtcbiAgICBiaW50b29scy5jYjU4RGVjb2RlKCdGdUI2THcyRDYyTnVNOHpwR0xBNEF2ZXBxN2VHc1pSaUcnKSxcbiAgICBiaW50b29scy5jYjU4RGVjb2RlKCdNYVR2S0djY2JZekN4ekJrSnBiMnpIVzdFMVdSZVpxQjgnKSxcbiAgXTtcbiAgdGVzdCgnQ3JlYXRpb24nLCAoKSA9PiB7XG4gICAgY29uc3Qgc2V0OlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHNldC5hZGQodXR4b3N0cnNbMF0pO1xuICAgIGNvbnN0IHV0eG86VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKTtcbiAgICBjb25zdCBzZXRBcnJheTpBcnJheTxVVFhPPiA9IHNldC5nZXRBbGxVVFhPcygpO1xuICAgIGV4cGVjdCh1dHhvLnRvU3RyaW5nKCkpLnRvQmUoc2V0QXJyYXlbMF0udG9TdHJpbmcoKSk7XG4gIH0pO1xuXG4gIHRlc3QoJ011dGxpcGxlIGFkZCcsICgpID0+IHtcbiAgICBjb25zdCBzZXQ6VVRYT1NldCA9IG5ldyBVVFhPU2V0KCk7XG4gICAgLy8gZmlyc3QgYWRkXG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHNldC5hZGQodXR4b3N0cnNbaV0pO1xuICAgIH1cbiAgICAvLyB0aGUgdmVyaWZ5IChkbyB0aGVzZSBzdGVwcyBzZXBhcmF0ZSB0byBlbnN1cmUgbm8gb3ZlcndyaXRlcylcbiAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgZXhwZWN0KHNldC5pbmNsdWRlcyh1dHhvc3Ryc1tpXSkpLnRvQmUodHJ1ZSk7XG4gICAgICBjb25zdCB1dHhvOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzW2ldKTtcbiAgICAgIGNvbnN0IHZlcml1dHhvOlVUWE8gPSBzZXQuZ2V0VVRYTyh1dHhvLmdldFVUWE9JRCgpKSBhcyBVVFhPO1xuICAgICAgZXhwZWN0KHZlcml1dHhvLnRvU3RyaW5nKCkpLnRvQmUodXR4b3N0cnNbaV0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdGVzdCgnYWRkQXJyYXknLCAoKSA9PiB7XG4gICAgY29uc3Qgc2V0OlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHNldC5hZGRBcnJheSh1dHhvc3Rycyk7XG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUxOlVUWE8gPSBuZXcgVVRYTygpO1xuICAgICAgZTEuZnJvbVN0cmluZyh1dHhvc3Ryc1tpXSk7XG4gICAgICBleHBlY3Qoc2V0LmluY2x1ZGVzKGUxKSkudG9CZSh0cnVlKTtcbiAgICAgIGNvbnN0IHV0eG86VVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgICB1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbaV0pO1xuICAgICAgY29uc3QgdmVyaXV0eG86VVRYTyA9IHNldC5nZXRVVFhPKHV0eG8uZ2V0VVRYT0lEKCkpIGFzIFVUWE87XG4gICAgICBleHBlY3QodmVyaXV0eG8udG9TdHJpbmcoKSkudG9CZSh1dHhvc3Ryc1tpXSk7XG4gICAgfVxuXG4gICAgc2V0LmFkZEFycmF5KHNldC5nZXRBbGxVVFhPcygpKTtcbiAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdXR4bzpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICAgIHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1tpXSk7XG4gICAgICBleHBlY3Qoc2V0LmluY2x1ZGVzKHV0eG8pKS50b0JlKHRydWUpO1xuXG4gICAgICBjb25zdCB2ZXJpdXR4bzpVVFhPID0gc2V0LmdldFVUWE8odXR4by5nZXRVVFhPSUQoKSkgYXMgVVRYTztcbiAgICAgIGV4cGVjdCh2ZXJpdXR4by50b1N0cmluZygpKS50b0JlKHV0eG9zdHJzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgbzpvYmplY3QgPSBzZXQuc2VyaWFsaXplKFwiaGV4XCIpO1xuICAgIGxldCBzOlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgIHMuZGVzZXJpYWxpemUobyk7XG4gICAgbGV0IHQ6b2JqZWN0ID0gc2V0LnNlcmlhbGl6ZShcImRpc3BsYXlcIik7XG4gICAgbGV0IHI6VVRYT1NldCA9IG5ldyBVVFhPU2V0KCk7XG4gICAgci5kZXNlcmlhbGl6ZSh0KTtcbiAgfSk7XG5cbiAgdGVzdCgnb3ZlcndyaXRpbmcgVVRYTycsICgpID0+IHtcbiAgICBjb25zdCBzZXQ6VVRYT1NldCA9IG5ldyBVVFhPU2V0KCk7XG4gICAgc2V0LmFkZEFycmF5KHV0eG9zdHJzKTtcbiAgICBjb25zdCB0ZXN0dXR4bzpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICB0ZXN0dXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKTtcbiAgICBleHBlY3Qoc2V0LmFkZCh1dHhvc3Ryc1swXSwgdHJ1ZSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKTtcbiAgICBleHBlY3Qoc2V0LmFkZCh1dHhvc3Ryc1swXSwgZmFsc2UpKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgZXhwZWN0KHNldC5hZGRBcnJheSh1dHhvc3RycywgdHJ1ZSkubGVuZ3RoKS50b0JlKDMpO1xuICAgIGV4cGVjdChzZXQuYWRkQXJyYXkodXR4b3N0cnMsIGZhbHNlKS5sZW5ndGgpLnRvQmUoMCk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdGdW5jdGlvbmFsaXR5JywgKCkgPT4ge1xuICAgIGxldCBzZXQ6VVRYT1NldDtcbiAgICBsZXQgdXR4b3M6QXJyYXk8VVRYTz47XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgICAgc2V0LmFkZEFycmF5KHV0eG9zdHJzKTtcbiAgICAgIHV0eG9zID0gc2V0LmdldEFsbFVUWE9zKCk7XG4gICAgfSk7XG5cbiAgICB0ZXN0KCdyZW1vdmUnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0dXR4bzpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICAgIHRlc3R1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbMF0pO1xuICAgICAgZXhwZWN0KHNldC5yZW1vdmUodXR4b3N0cnNbMF0pLnRvU3RyaW5nKCkpLnRvQmUodGVzdHV0eG8udG9TdHJpbmcoKSk7XG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZSh1dHhvc3Ryc1swXSkpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChzZXQuYWRkKHV0eG9zdHJzWzBdLCBmYWxzZSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKTtcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlKHV0eG9zdHJzWzBdKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpO1xuICAgIH0pO1xuXG4gICAgdGVzdCgncmVtb3ZlQXJyYXknLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0dXR4bzpVVFhPID0gbmV3IFVUWE8oKTtcbiAgICAgIHRlc3R1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbMF0pO1xuICAgICAgZXhwZWN0KHNldC5yZW1vdmVBcnJheSh1dHhvc3RycykubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgZXhwZWN0KHNldC5yZW1vdmVBcnJheSh1dHhvc3RycykubGVuZ3RoKS50b0JlKDApO1xuICAgICAgZXhwZWN0KHNldC5hZGQodXR4b3N0cnNbMF0sIGZhbHNlKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpO1xuICAgICAgZXhwZWN0KHNldC5yZW1vdmVBcnJheSh1dHhvc3RycykubGVuZ3RoKS50b0JlKDEpO1xuICAgICAgZXhwZWN0KHNldC5hZGRBcnJheSh1dHhvc3RycywgZmFsc2UpLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlQXJyYXkodXR4b3MpLmxlbmd0aCkudG9CZSgzKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ2dldFVUWE9JRHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCB1aWRzOkFycmF5PHN0cmluZz4gPSBzZXQuZ2V0VVRYT0lEcygpO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVpZHMuaW5kZXhPZih1dHhvc1tpXS5nZXRVVFhPSUQoKSkpLm5vdC50b0JlKC0xKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRlc3QoJ2dldEFsbFVUWE9zJywgKCkgPT4ge1xuICAgICAgY29uc3QgYWxsdXR4b3M6QXJyYXk8VVRYTz4gPSBzZXQuZ2V0QWxsVVRYT3MoKTtcbiAgICAgIGNvbnN0IHVzdHJzOkFycmF5PHN0cmluZz4gPSBbXTtcbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IGFsbHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVzdHJzLnB1c2goYWxsdXR4b3NbaV0udG9TdHJpbmcoKSk7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QodXN0cnMuaW5kZXhPZih1dHhvc3Ryc1tpXSkpLm5vdC50b0JlKC0xKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHVpZHM6QXJyYXk8c3RyaW5nPiA9IHNldC5nZXRVVFhPSURzKCk7XG4gICAgICBjb25zdCBhbGx1dHhvczI6QXJyYXk8VVRYTz4gPSBzZXQuZ2V0QWxsVVRYT3ModWlkcyk7XG4gICAgICBjb25zdCB1c3RyczI6QXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgYWxsdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdXN0cnMyLnB1c2goYWxsdXR4b3MyW2ldLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVzdHJzMi5pbmRleE9mKHV0eG9zdHJzW2ldKSkubm90LnRvQmUoLTEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGVzdCgnZ2V0VVRYT0lEcyBCeSBBZGRyZXNzJywgKCkgPT4ge1xuICAgICAgbGV0IHV0eG9pZHM6QXJyYXk8c3RyaW5nPjtcbiAgICAgIHV0eG9pZHMgPSBzZXQuZ2V0VVRYT0lEcyhbYWRkcnNbMF1dKTtcbiAgICAgIGV4cGVjdCh1dHhvaWRzLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgIHV0eG9pZHMgPSBzZXQuZ2V0VVRYT0lEcyhhZGRycyk7XG4gICAgICBleHBlY3QodXR4b2lkcy5sZW5ndGgpLnRvQmUoMyk7XG4gICAgICB1dHhvaWRzID0gc2V0LmdldFVUWE9JRHMoYWRkcnMsIGZhbHNlKTtcbiAgICAgIGV4cGVjdCh1dHhvaWRzLmxlbmd0aCkudG9CZSgzKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ2dldEFsbFVUWE9TdHJpbmdzJywgKCkgPT4ge1xuICAgICAgY29uc3QgdXN0cnM6QXJyYXk8c3RyaW5nPiA9IHNldC5nZXRBbGxVVFhPU3RyaW5ncygpO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVzdHJzLmluZGV4T2YodXR4b3N0cnNbaV0pKS5ub3QudG9CZSgtMSk7XG4gICAgICB9XG4gICAgICBjb25zdCB1aWRzOkFycmF5PHN0cmluZz4gPSBzZXQuZ2V0VVRYT0lEcygpO1xuICAgICAgY29uc3QgdXN0cnMyOkFycmF5PHN0cmluZz4gPSBzZXQuZ2V0QWxsVVRYT1N0cmluZ3ModWlkcyk7XG4gICAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QodXN0cnMyLmluZGV4T2YodXR4b3N0cnNbaV0pKS5ub3QudG9CZSgtMSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0ZXN0KCdnZXRBZGRyZXNzZXMnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qoc2V0LmdldEFkZHJlc3NlcygpLnNvcnQoKSkudG9TdHJpY3RFcXVhbChhZGRycy5zb3J0KCkpO1xuICAgIH0pO1xuXG4gICAgdGVzdCgnZ2V0QmFsYW5jZScsICgpID0+IHtcbiAgICAgIGxldCBiYWxhbmNlMTpCTjtcbiAgICAgIGxldCBiYWxhbmNlMjpCTjtcbiAgICAgIGJhbGFuY2UxID0gbmV3IEJOKDApO1xuICAgICAgYmFsYW5jZTIgPSBuZXcgQk4oMCk7XG4gICAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhc3NldGlkID0gdXR4b3NbaV0uZ2V0QXNzZXRJRCgpO1xuICAgICAgICBiYWxhbmNlMS5hZGQoc2V0LmdldEJhbGFuY2UoYWRkcnMsIGFzc2V0aWQpKTtcbiAgICAgICAgYmFsYW5jZTIuYWRkKCh1dHhvc1tpXS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKTtcbiAgICAgIH1cbiAgICAgIGV4cGVjdChiYWxhbmNlMS50b1N0cmluZygpKS50b0JlKGJhbGFuY2UyLnRvU3RyaW5nKCkpO1xuXG4gICAgICBiYWxhbmNlMSA9IG5ldyBCTigwKTtcbiAgICAgIGJhbGFuY2UyID0gbmV3IEJOKDApO1xuICAgICAgY29uc3Qgbm93OkJOID0gVW5peE5vdygpO1xuICAgICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXNzZXRpZCA9IGJpbnRvb2xzLmNiNThFbmNvZGUodXR4b3NbaV0uZ2V0QXNzZXRJRCgpKTtcbiAgICAgICAgYmFsYW5jZTEuYWRkKHNldC5nZXRCYWxhbmNlKGFkZHJzLCBhc3NldGlkLCBub3cpKTtcbiAgICAgICAgYmFsYW5jZTIuYWRkKCh1dHhvc1tpXS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKTtcbiAgICAgIH1cbiAgICAgIGV4cGVjdChiYWxhbmNlMS50b1N0cmluZygpKS50b0JlKGJhbGFuY2UyLnRvU3RyaW5nKCkpO1xuICAgIH0pO1xuXG4gICAgdGVzdCgnZ2V0QXNzZXRJRHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBhc3NldElEczpBcnJheTxCdWZmZXI+ID0gc2V0LmdldEFzc2V0SURzKCk7XG4gICAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QoYXNzZXRJRHMpLnRvQ29udGFpbih1dHhvc1tpXS5nZXRBc3NldElEKCkpO1xuICAgICAgfVxuICAgICAgY29uc3QgYWRkcmVzc2VzOkFycmF5PEJ1ZmZlcj4gPSBzZXQuZ2V0QWRkcmVzc2VzKCk7XG4gICAgICBleHBlY3Qoc2V0LmdldEFzc2V0SURzKGFkZHJlc3NlcykpLnRvRXF1YWwoc2V0LmdldEFzc2V0SURzKCkpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ01lcmdlIFJ1bGVzJywgKCkgPT4ge1xuICAgICAgbGV0IHNldEE6VVRYT1NldDtcbiAgICAgIGxldCBzZXRCOlVUWE9TZXQ7XG4gICAgICBsZXQgc2V0QzpVVFhPU2V0O1xuICAgICAgbGV0IHNldEQ6VVRYT1NldDtcbiAgICAgIGxldCBzZXRFOlVUWE9TZXQ7XG4gICAgICBsZXQgc2V0RjpVVFhPU2V0O1xuICAgICAgbGV0IHNldEc6VVRYT1NldDtcbiAgICAgIGxldCBzZXRIOlVUWE9TZXQ7XG4gICAgICAvLyBUYWtlLW9yLUxlYXZlXG4gICAgICBjb25zdCBuZXd1dHhvOnN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oJzAwMDBhY2Y4ODY0N2IzZmJhYTlmZGY0Mzc4ZjNhMGRmNmE1ZDE1ZDhlZmIwMThhZDc4ZjEyNjkwMzkwZTc5ZTE2ODc2MDAwMDAwMDNhY2Y4ODY0N2IzZmJhYTlmZGY0Mzc4ZjNhMGRmNmE1ZDE1ZDhlZmIwMThhZDc4ZjEyNjkwMzkwZTc5ZTE2ODc2MDAwMDAwMDcwMDAwMDAwMDAwMDE4NmEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFmY2VkYThmOTBmY2I1ZDMwNjE0Yjk5ZDc5ZmM0YmFhMjkzMDc3NjI2JywgJ2hleCcpKTtcblxuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNldEEgPSBuZXcgVVRYT1NldCgpO1xuICAgICAgICBzZXRBLmFkZEFycmF5KFt1dHhvc3Ryc1swXSwgdXR4b3N0cnNbMl1dKTtcblxuICAgICAgICBzZXRCID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0Qi5hZGRBcnJheShbdXR4b3N0cnNbMV0sIHV0eG9zdHJzWzJdXSk7XG5cbiAgICAgICAgc2V0QyA9IG5ldyBVVFhPU2V0KCk7XG4gICAgICAgIHNldEMuYWRkQXJyYXkoW3V0eG9zdHJzWzBdLCB1dHhvc3Ryc1sxXV0pO1xuXG4gICAgICAgIHNldEQgPSBuZXcgVVRYT1NldCgpO1xuICAgICAgICBzZXRELmFkZEFycmF5KFt1dHhvc3Ryc1sxXV0pO1xuXG4gICAgICAgIHNldEUgPSBuZXcgVVRYT1NldCgpO1xuICAgICAgICBzZXRFLmFkZEFycmF5KFtdKTsvLyBlbXB0eSBzZXRcblxuICAgICAgICBzZXRGID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0Ri5hZGRBcnJheSh1dHhvc3Rycyk7IC8vIGZ1bGwgc2V0LCBzZXBhcmF0ZSBmcm9tIHNlbGZcblxuICAgICAgICBzZXRHID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgc2V0Ry5hZGRBcnJheShbbmV3dXR4bywgLi4udXR4b3N0cnNdKTsgLy8gZnVsbCBzZXQgd2l0aCBuZXcgZWxlbWVudFxuXG4gICAgICAgIHNldEggPSBuZXcgVVRYT1NldCgpO1xuICAgICAgICBzZXRILmFkZEFycmF5KFtuZXd1dHhvXSk7IC8vIHNldCB3aXRoIG9ubHkgYSBuZXcgZWxlbWVudFxuICAgICAgfSk7XG5cbiAgICAgIHRlc3QoJ3Vua25vd24gbWVyZ2UgcnVsZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgICBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgJ0VSUk9SJyk7XG4gICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgY29uc3Qgc2V0QXJyYXk6QXJyYXk8VVRYTz4gPSBzZXRHLmdldEFsbFVUWE9zKCk7XG4gICAgICB9KTtcblxuICAgICAgdGVzdCgnaW50ZXJzZWN0aW9uJywgKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czpVVFhPU2V0O1xuICAgICAgICBsZXQgdGVzdDpib29sZWFuO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgJ2ludGVyc2VjdGlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEFdLCBbc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsICdpbnRlcnNlY3Rpb24nKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRGXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCAnaW50ZXJzZWN0aW9uJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgJ2ludGVyc2VjdGlvbicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0ZXN0KCdkaWZmZXJlbmNlU2VsZicsICgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6VVRYT1NldDtcbiAgICAgICAgbGV0IHRlc3Q6Ym9vbGVhbjtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsICdkaWZmZXJlbmNlU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldERdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsICdkaWZmZXJlbmNlU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsICdkaWZmZXJlbmNlU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsICdkaWZmZXJlbmNlU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0ZXN0KCdkaWZmZXJlbmNlTmV3JywgKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czpVVFhPU2V0O1xuICAgICAgICBsZXQgdGVzdDpib29sZWFuO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgJ2RpZmZlcmVuY2VOZXcnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCAnZGlmZmVyZW5jZU5ldycpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsICdkaWZmZXJlbmNlTmV3Jyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0SF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRHXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgJ2RpZmZlcmVuY2VOZXcnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG4gICAgICB9KTtcblxuICAgICAgdGVzdCgnc3ltRGlmZmVyZW5jZScsICgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6VVRYT1NldDtcbiAgICAgICAgbGV0IHRlc3Q6Ym9vbGVhbjtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsICdzeW1EaWZmZXJlbmNlJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRFLCBzZXRGLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RiwgJ3N5bURpZmZlcmVuY2UnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCAnc3ltRGlmZmVyZW5jZScpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsICdzeW1EaWZmZXJlbmNlJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0R10sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHRlc3QoJ3VuaW9uJywgKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czpVVFhPU2V0O1xuICAgICAgICBsZXQgdGVzdDpib29sZWFuO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgJ3VuaW9uJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RiwgJ3VuaW9uJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgJ3VuaW9uJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0R10sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgJ3VuaW9uJyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0R10sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHRlc3QoJ3VuaW9uTWludXNOZXcnLCAoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOlVUWE9TZXQ7XG4gICAgICAgIGxldCB0ZXN0OmJvb2xlYW47XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCAndW5pb25NaW51c05ldycpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldERdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsICd1bmlvbk1pbnVzTmV3Jyk7XG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSk7XG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpO1xuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgJ3VuaW9uTWludXNOZXcnKTtcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKTtcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSk7XG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCAndW5pb25NaW51c05ldycpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0ZXN0KCd1bmlvbk1pbnVzU2VsZicsICgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6VVRYT1NldDtcbiAgICAgICAgbGV0IHRlc3Q6Ym9vbGVhbjtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsICd1bmlvbk1pbnVzU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsICd1bmlvbk1pbnVzU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsICd1bmlvbk1pbnVzU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsICd1bmlvbk1pbnVzU2VsZicpO1xuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pO1xuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19