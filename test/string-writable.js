import { Writable } from "node:stream";

export class StringWritable extends Writable {
  constructor(options) {
    super(options);
    this._data = "";
  }

  _write(chunk, encoding, callback) {
    this._data += chunk;
    callback();
  }

  _final(callback) {
    this.emit("done", this._data);
    callback();
  }
}
