/**
 * @fileoverview This module defines a convenience class for writing values to
 * the web assembly heap.
 */

(function(scope) {
  'use strict';

// TODO(vollick): would be nice if the size could be determined implicitly.
  class WasmHeapWriter {
    constructor(size) {
      this.ptr_ = scope.Module._malloc(size);
      this.size_ = size;
      this.uint8_view_ =
        new Uint8Array(scope.Module.HEAPU8.buffer, this.ptr_, size);
      this.uint32_view_ =
        new Uint32Array(scope.Module.HEAPU32.buffer, this.ptr_, size >> 2);
      this.float32_view_ =
        new Float32Array(scope.Module.HEAPF32.buffer, this.ptr_, size >> 2);
      this.float64_view_ =
        new Float64Array(scope.Module.HEAPF64.buffer, this.ptr_, size >> 3);
      this.offset_ = 0;
    }

    snapToWordAlignment() {
      let inWordOffset = this.offset_ % 4;
      if (inWordOffset == 0) {
        return;
      }
      this.offset_ += 4 - inWordOffset;
    }

    snapToDoubleWordAlignment() {
      let inWordOffset = this.offset_ % 8;
      if (inWordOffset == 0) {
        return;
      }
      this.offset_ += 8 - inWordOffset;
    }

    writeUint8(value) {
      this.uint8_view_[this.offset_] = value;
      this.offset_ += 1;
    }

    writeBool(value) {
      this.writeUint8(value);
    }

    writeInt32(value) {
      this.snapToWordAlignment();
      this.uint32_view_[this.offset_ >> 2] = value;
      this.offset_ += 4;
    }

    writeFloat64(value) {
      this.snapToDoubleWordAlignment();
      this.float64_view_[this.offset_ >> 3] = value;
      this.offset_ += 8;
    }

    writePtr(value) {
      this.writeInt32(value);
    }

    writeFloat(value) {
      this.snapToWordAlignment();
      this.float32_view_[this.offset_ >> 2] = value;
      this.offset_ += 4;
    }

    // Caller takes ownership of the returned pointer.
    getData() {
      this.snapToWordAlignment();
      var bytes_written = this.offset_;
      if (bytes_written != this.size_) {
        console.error(
          'wrote ' + bytes_written + ' bytes, but expected to write ' +
          this.size_);
      }
      var ptr = this.ptr_;
      this.ptr_ = null;
      return ptr;
    }
  }

  scope.WasmHeapWriter = WasmHeapWriter;
})(self);
