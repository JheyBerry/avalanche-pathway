"use strict";
/**
 * @packageDocumentation
 * @module Common-AssetAmount
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardAssetAmountDestination = exports.AssetAmount = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Class for managing asset amounts in the UTXOSet fee calcuation
 */
class AssetAmount {
    constructor(assetID, amount, burn) {
        // assetID that is amount is managing.
        this.assetID = buffer_1.Buffer.alloc(32);
        // amount of this asset that should be sent.
        this.amount = new bn_js_1.default(0);
        // burn is the amount of this asset that should be burned.
        this.burn = new bn_js_1.default(0);
        // spent is the total amount of this asset that has been consumed.
        this.spent = new bn_js_1.default(0);
        // stakeableLockSpent is the amount of this asset that has been consumed that
        // was locked.
        this.stakeableLockSpent = new bn_js_1.default(0);
        // change is the excess amount of this asset that was consumed over the amount
        // requested to be consumed(amount + burn).
        this.change = new bn_js_1.default(0);
        // stakeableLockChange is a flag to mark if the input that generated the
        // change was locked.
        this.stakeableLockChange = false;
        // finished is a convenience flag to track "spent >= amount + burn"
        this.finished = false;
        this.getAssetID = () => {
            return this.assetID;
        };
        this.getAssetIDString = () => {
            return this.assetID.toString("hex");
        };
        this.getAmount = () => {
            return this.amount;
        };
        this.getSpent = () => {
            return this.spent;
        };
        this.getBurn = () => {
            return this.burn;
        };
        this.getChange = () => {
            return this.change;
        };
        this.getStakeableLockSpent = () => {
            return this.stakeableLockSpent;
        };
        this.getStakeableLockChange = () => {
            return this.stakeableLockChange;
        };
        this.isFinished = () => {
            return this.finished;
        };
        // spendAmount should only be called if this asset is still awaiting more
        // funds to consume.
        this.spendAmount = (amt, stakeableLocked = false) => {
            if (this.finished) {
                /* istanbul ignore next */
                throw new Error('Error - AssetAmount.spendAmount: attempted to spend '
                    + 'excess funds');
            }
            this.spent = this.spent.add(amt);
            if (stakeableLocked) {
                this.stakeableLockSpent = this.stakeableLockSpent.add(amt);
            }
            const total = this.amount.add(this.burn);
            if (this.spent.gte(total)) {
                this.change = this.spent.sub(total);
                if (stakeableLocked) {
                    this.stakeableLockChange = true;
                }
                this.finished = true;
            }
            return this.finished;
        };
        this.assetID = assetID;
        this.amount = typeof amount === "undefined" ? new bn_js_1.default(0) : amount;
        this.burn = typeof burn === "undefined" ? new bn_js_1.default(0) : burn;
        this.spent = new bn_js_1.default(0);
        this.stakeableLockSpent = new bn_js_1.default(0);
        this.stakeableLockChange = false;
    }
}
exports.AssetAmount = AssetAmount;
class StandardAssetAmountDestination {
    constructor(destinations, senders, changeAddresses) {
        this.amounts = [];
        this.destinations = [];
        this.senders = [];
        this.changeAddresses = [];
        this.amountkey = {};
        this.inputs = [];
        this.outputs = [];
        this.change = [];
        // TODO: should this function allow for repeated calls with the same
        //       assetID?
        this.addAssetAmount = (assetID, amount, burn) => {
            let aa = new AssetAmount(assetID, amount, burn);
            this.amounts.push(aa);
            this.amountkey[aa.getAssetIDString()] = aa;
        };
        this.addInput = (input) => {
            this.inputs.push(input);
        };
        this.addOutput = (output) => {
            this.outputs.push(output);
        };
        this.addChange = (output) => {
            this.change.push(output);
        };
        this.getAmounts = () => {
            return this.amounts;
        };
        this.getDestinations = () => {
            return this.destinations;
        };
        this.getSenders = () => {
            return this.senders;
        };
        this.getChangeAddresses = () => {
            return this.changeAddresses;
        };
        this.getAssetAmount = (assetHexStr) => {
            return this.amountkey[assetHexStr];
        };
        this.assetExists = (assetHexStr) => {
            return (assetHexStr in this.amountkey);
        };
        this.getInputs = () => {
            return this.inputs;
        };
        this.getOutputs = () => {
            return this.outputs;
        };
        this.getChangeOutputs = () => {
            return this.change;
        };
        this.getAllOutputs = () => {
            return this.outputs.concat(this.change);
        };
        this.canComplete = () => {
            for (let i = 0; i < this.amounts.length; i++) {
                if (!this.amounts[i].isFinished()) {
                    return false;
                }
            }
            return true;
        };
        this.destinations = destinations;
        this.changeAddresses = changeAddresses;
        this.senders = senders;
    }
}
exports.StandardAssetAmountDestination = StandardAssetAmountDestination;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRhbW91bnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2Fzc2V0YW1vdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFpQztBQUNqQyxrREFBdUI7QUFJdkI7O0dBRUc7QUFDSCxNQUFhLFdBQVc7SUFvRnRCLFlBQVksT0FBZSxFQUFFLE1BQVUsRUFBRSxJQUFRO1FBbkZqRCxzQ0FBc0M7UUFDNUIsWUFBTyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0MsNENBQTRDO1FBQ2xDLFdBQU0sR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQywwREFBMEQ7UUFDaEQsU0FBSSxHQUFPLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9CLGtFQUFrRTtRQUN4RCxVQUFLLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsNkVBQTZFO1FBQzdFLGNBQWM7UUFDSix1QkFBa0IsR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3Qyw4RUFBOEU7UUFDOUUsMkNBQTJDO1FBQ2pDLFdBQU0sR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyx3RUFBd0U7UUFDeEUscUJBQXFCO1FBQ1gsd0JBQW1CLEdBQVksS0FBSyxDQUFDO1FBRS9DLG1FQUFtRTtRQUN6RCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBRXBDLGVBQVUsR0FBRyxHQUFXLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3RCLENBQUMsQ0FBQTtRQUVELHFCQUFnQixHQUFHLEdBQVcsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQTtRQUVELGNBQVMsR0FBRyxHQUFP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QUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0NBRUY7QUF0RkQsd0VBc0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLUFzc2V0QW1vdW50XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IHsgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tICcuL291dHB1dCc7XG5pbXBvcnQgeyBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSAnLi9pbnB1dCc7XG5cbi8qKlxuICogQ2xhc3MgZm9yIG1hbmFnaW5nIGFzc2V0IGFtb3VudHMgaW4gdGhlIFVUWE9TZXQgZmVlIGNhbGN1YXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIEFzc2V0QW1vdW50IHtcbiAgLy8gYXNzZXRJRCB0aGF0IGlzIGFtb3VudCBpcyBtYW5hZ2luZy5cbiAgcHJvdGVjdGVkIGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG4gIC8vIGFtb3VudCBvZiB0aGlzIGFzc2V0IHRoYXQgc2hvdWxkIGJlIHNlbnQuXG4gIHByb3RlY3RlZCBhbW91bnQ6IEJOID0gbmV3IEJOKDApO1xuICAvLyBidXJuIGlzIHRoZSBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IHNob3VsZCBiZSBidXJuZWQuXG4gIHByb3RlY3RlZCBidXJuOiBCTiA9IG5ldyBCTigwKTtcblxuICAvLyBzcGVudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHRoaXMgYXNzZXQgdGhhdCBoYXMgYmVlbiBjb25zdW1lZC5cbiAgcHJvdGVjdGVkIHNwZW50OiBCTiA9IG5ldyBCTigwKTtcbiAgLy8gc3Rha2VhYmxlTG9ja1NwZW50IGlzIHRoZSBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IGhhcyBiZWVuIGNvbnN1bWVkIHRoYXRcbiAgLy8gd2FzIGxvY2tlZC5cbiAgcHJvdGVjdGVkIHN0YWtlYWJsZUxvY2tTcGVudDogQk4gPSBuZXcgQk4oMCk7XG5cbiAgLy8gY2hhbmdlIGlzIHRoZSBleGNlc3MgYW1vdW50IG9mIHRoaXMgYXNzZXQgdGhhdCB3YXMgY29uc3VtZWQgb3ZlciB0aGUgYW1vdW50XG4gIC8vIHJlcXVlc3RlZCB0byBiZSBjb25zdW1lZChhbW91bnQgKyBidXJuKS5cbiAgcHJvdGVjdGVkIGNoYW5nZTogQk4gPSBuZXcgQk4oMCk7XG4gIC8vIHN0YWtlYWJsZUxvY2tDaGFuZ2UgaXMgYSBmbGFnIHRvIG1hcmsgaWYgdGhlIGlucHV0IHRoYXQgZ2VuZXJhdGVkIHRoZVxuICAvLyBjaGFuZ2Ugd2FzIGxvY2tlZC5cbiAgcHJvdGVjdGVkIHN0YWtlYWJsZUxvY2tDaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvLyBmaW5pc2hlZCBpcyBhIGNvbnZlbmllbmNlIGZsYWcgdG8gdHJhY2sgXCJzcGVudCA+PSBhbW91bnQgKyBidXJuXCJcbiAgcHJvdGVjdGVkIGZpbmlzaGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZ2V0QXNzZXRJRCA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLmFzc2V0SUQ7XG4gIH1cblxuICBnZXRBc3NldElEU3RyaW5nID0gKCk6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXNzZXRJRC50b1N0cmluZyhcImhleFwiKTtcbiAgfVxuXG4gIGdldEFtb3VudCA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYW1vdW50XG4gIH1cblxuICBnZXRTcGVudCA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuc3BlbnQ7XG4gIH1cblxuICBnZXRCdXJuID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5idXJuO1xuICB9XG5cbiAgZ2V0Q2hhbmdlID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFuZ2U7XG4gIH1cblxuICBnZXRTdGFrZWFibGVMb2NrU3BlbnQgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLnN0YWtlYWJsZUxvY2tTcGVudDtcbiAgfVxuXG4gIGdldFN0YWtlYWJsZUxvY2tDaGFuZ2UgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuc3Rha2VhYmxlTG9ja0NoYW5nZTtcbiAgfVxuXG4gIGlzRmluaXNoZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoZWQ7XG4gIH1cblxuICAvLyBzcGVuZEFtb3VudCBzaG91bGQgb25seSBiZSBjYWxsZWQgaWYgdGhpcyBhc3NldCBpcyBzdGlsbCBhd2FpdGluZyBtb3JlXG4gIC8vIGZ1bmRzIHRvIGNvbnN1bWUuXG4gIHNwZW5kQW1vdW50ID0gKGFtdDogQk4sIHN0YWtlYWJsZUxvY2tlZDogYm9vbGVhbiA9IGZhbHNlKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHRoaXMuZmluaXNoZWQpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIC0gQXNzZXRBbW91bnQuc3BlbmRBbW91bnQ6IGF0dGVtcHRlZCB0byBzcGVuZCAnXG4gICAgICAgICsgJ2V4Y2VzcyBmdW5kcycpO1xuICAgIH1cbiAgICB0aGlzLnNwZW50ID0gdGhpcy5zcGVudC5hZGQoYW10KTtcbiAgICBpZiAoc3Rha2VhYmxlTG9ja2VkKSB7XG4gICAgICB0aGlzLnN0YWtlYWJsZUxvY2tTcGVudCA9IHRoaXMuc3Rha2VhYmxlTG9ja1NwZW50LmFkZChhbXQpO1xuICAgIH1cblxuICAgIGNvbnN0IHRvdGFsOiBCTiA9IHRoaXMuYW1vdW50LmFkZCh0aGlzLmJ1cm4pO1xuICAgIGlmICh0aGlzLnNwZW50Lmd0ZSh0b3RhbCkpIHtcbiAgICAgIHRoaXMuY2hhbmdlID0gdGhpcy5zcGVudC5zdWIodG90YWwpO1xuICAgICAgaWYgKHN0YWtlYWJsZUxvY2tlZCkge1xuICAgICAgICB0aGlzLnN0YWtlYWJsZUxvY2tDaGFuZ2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoYXNzZXRJRDogQnVmZmVyLCBhbW91bnQ6IEJOLCBidXJuOiBCTikge1xuICAgIHRoaXMuYXNzZXRJRCA9IGFzc2V0SUQ7XG4gICAgdGhpcy5hbW91bnQgPSB0eXBlb2YgYW1vdW50ID09PSBcInVuZGVmaW5lZFwiID8gbmV3IEJOKDApIDogYW1vdW50O1xuICAgIHRoaXMuYnVybiA9IHR5cGVvZiBidXJuID09PSBcInVuZGVmaW5lZFwiID8gbmV3IEJOKDApIDogYnVybjtcbiAgICB0aGlzLnNwZW50ID0gbmV3IEJOKDApO1xuICAgIHRoaXMuc3Rha2VhYmxlTG9ja1NwZW50ID0gbmV3IEJOKDApO1xuICAgIHRoaXMuc3Rha2VhYmxlTG9ja0NoYW5nZSA9IGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZEFzc2V0QW1vdW50RGVzdGluYXRpb248VE8gZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dCwgVEkgZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0PiAge1xuICBwcm90ZWN0ZWQgYW1vdW50czogQXJyYXk8QXNzZXRBbW91bnQ+ID0gW107XG4gIHByb3RlY3RlZCBkZXN0aW5hdGlvbnM6IEFycmF5PEJ1ZmZlcj4gPSBbXTtcbiAgcHJvdGVjdGVkIHNlbmRlcnM6IEFycmF5PEJ1ZmZlcj4gPSBbXTtcbiAgcHJvdGVjdGVkIGNoYW5nZUFkZHJlc3NlczogQXJyYXk8QnVmZmVyPiA9IFtdO1xuICBwcm90ZWN0ZWQgYW1vdW50a2V5OiBvYmplY3QgPSB7fTtcbiAgcHJvdGVjdGVkIGlucHV0czogQXJyYXk8VEk+ID0gW107XG4gIHByb3RlY3RlZCBvdXRwdXRzOiBBcnJheTxUTz4gPSBbXTtcbiAgcHJvdGVjdGVkIGNoYW5nZTogQXJyYXk8VE8+ID0gW107XG5cbiAgLy8gVE9ETzogc2hvdWxkIHRoaXMgZnVuY3Rpb24gYWxsb3cgZm9yIHJlcGVhdGVkIGNhbGxzIHdpdGggdGhlIHNhbWVcbiAgLy8gICAgICAgYXNzZXRJRD9cbiAgYWRkQXNzZXRBbW91bnQgPSAoYXNzZXRJRDogQnVmZmVyLCBhbW91bnQ6IEJOLCBidXJuOiBCTikgPT4ge1xuICAgIGxldCBhYTogQXNzZXRBbW91bnQgPSBuZXcgQXNzZXRBbW91bnQoYXNzZXRJRCwgYW1vdW50LCBidXJuKTtcbiAgICB0aGlzLmFtb3VudHMucHVzaChhYSk7XG4gICAgdGhpcy5hbW91bnRrZXlbYWEuZ2V0QXNzZXRJRFN0cmluZygpXSA9IGFhO1xuICB9XG5cbiAgYWRkSW5wdXQgPSAoaW5wdXQ6IFRJKSA9PiB7XG4gICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dCk7XG4gIH1cblxuICBhZGRPdXRwdXQgPSAob3V0cHV0OiBUTykgPT4ge1xuICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dCk7XG4gIH1cblxuICBhZGRDaGFuZ2UgPSAob3V0cHV0OiBUTykgPT4ge1xuICAgIHRoaXMuY2hhbmdlLnB1c2gob3V0cHV0KTtcbiAgfVxuXG4gIGdldEFtb3VudHMgPSAoKTogQXJyYXk8QXNzZXRBbW91bnQ+ID0+IHtcbiAgICByZXR1cm4gdGhpcy5hbW91bnRzO1xuICB9XG5cbiAgZ2V0RGVzdGluYXRpb25zID0gKCk6IEFycmF5PEJ1ZmZlcj4gPT4ge1xuICAgIHJldHVybiB0aGlzLmRlc3RpbmF0aW9ucztcbiAgfVxuXG4gIGdldFNlbmRlcnMgPSAoKTogQXJyYXk8QnVmZmVyPiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuc2VuZGVycztcbiAgfVxuXG4gIGdldENoYW5nZUFkZHJlc3NlcyA9ICgpOiBBcnJheTxCdWZmZXI+ID0+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFuZ2VBZGRyZXNzZXM7XG4gIH1cblxuICBnZXRBc3NldEFtb3VudCA9IChhc3NldEhleFN0cjogc3RyaW5nKTogQXNzZXRBbW91bnQgPT4ge1xuICAgIHJldHVybiB0aGlzLmFtb3VudGtleVthc3NldEhleFN0cl07XG4gIH1cblxuICBhc3NldEV4aXN0cyA9IChhc3NldEhleFN0cjogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIChhc3NldEhleFN0ciBpbiB0aGlzLmFtb3VudGtleSk7XG4gIH1cblxuICBnZXRJbnB1dHMgPSAoKTogQXJyYXk8VEk+ID0+IHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dHM7XG4gIH1cblxuICBnZXRPdXRwdXRzID0gKCk6IEFycmF5PFRPPiA9PiB7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0cztcbiAgfVxuXG4gIGdldENoYW5nZU91dHB1dHMgPSAoKTogQXJyYXk8VE8+ID0+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFuZ2U7XG4gIH1cblxuICBnZXRBbGxPdXRwdXRzID0gKCk6IEFycmF5PFRPPiA9PiB7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0cy5jb25jYXQodGhpcy5jaGFuZ2UpO1xuICB9XG5cbiAgY2FuQ29tcGxldGUgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFtb3VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghdGhpcy5hbW91bnRzW2ldLmlzRmluaXNoZWQoKSkge1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihkZXN0aW5hdGlvbnM6IEFycmF5PEJ1ZmZlcj4sIHNlbmRlcnM6IEFycmF5PEJ1ZmZlcj4sIGNoYW5nZUFkZHJlc3NlczogQXJyYXk8QnVmZmVyPikge1xuICAgIHRoaXMuZGVzdGluYXRpb25zID0gZGVzdGluYXRpb25zO1xuICAgIHRoaXMuY2hhbmdlQWRkcmVzc2VzID0gY2hhbmdlQWRkcmVzc2VzO1xuICAgIHRoaXMuc2VuZGVycyA9IHNlbmRlcnM7XG4gIH1cblxufSJdfQ==