/**
 * @fileoverview CpuXenoEffects takes in image frame data and outputs
 * the results from the wasm-run Drishti CPU-based XenoRenderer graph. Also, it
 * will expect to have a GL canvas reference set, and it will render the xeno
 * effect texture directly to that canvas on process() or processGl() call.
 */
(function(scope) {
  'use strict';

  let hasLoaded = false;

  const postRun = () => {
    console.log('Loaded wasm module.');
    hasLoaded = true;
  };
  if (Array.isArray(scope.Module.postRun)) {
    scope.Module.postRun.push(postRun);
  } else {
    scope.Module.postRun = [postRun];
  }

  /**
   * A class for processing CPU image frames and rendering the desired
   * Xeno Effect directly to the GL-backed canvas provided.
   */
  class CpuXenoEffects {
    constructor() {
      this.pixelsPtr_ = null;
      this.pixelsSize_ = 0;
    }

    /**
     * Sets whether or not our GL-input-based effects graphs should automatically
     * "mirror" our input textures across the x-axis, which is a nice effect for
     * "selfie-mode". Must be called before the Drishti graph has been initialized
     * and started running, in order to take effect.
     * @param {boolean} mirrored Whether or not to mirror the input GL image
     *     automatically across the x-axis in our effects graphs.
     */
    setGlMirrorMode(mirrored) {
      console.log('setGlMirrorMode called with: ', mirrored);
      this.mirrored_ = mirrored;
      scope.Module.postRun.push(() => {
        if (scope.Module._setGlMirrorMode) {
          scope.Module._setGlMirrorMode(mirrored);
        } else {
          console.log('Warning: setGlMirrorMode not implemented for this effect');
        }
      });
      if (hasLoaded) {
        if (scope.Module._setGlMirrorMode) {
          scope.Module._setGlMirrorMode(this.mirrored_);
        } else {
          console.log('Warning: setGlMirrorMode not implemented for this effect');
        }
      }
    }

    /**
     * Takes a canvas (which should be able to be backed by a WebGL2 context), and
     * when the Webassembly module has loaded, this canvas will be attached to our
     * C++-side frame processor, which will render directly to it on frame output.
     * @param {!Canvas} canvas The canvas to be used for WebGL2 rendering of our
     *     Xeno Effect output.
     */
    setGlCanvas(canvas) {
      console.log('setGlCanvas called with: ', canvas);
      this.canvas_ = canvas;
      scope.Module.postRun.push(function() {
        console.log('Attaching canvas to wasm module in post-run.');
        scope.Module.canvas = canvas;
        console.log('Canvas is: ', scope.Module.canvas);
      });
      if (hasLoaded) {
        console.log('Attaching canvas to wasm module directly.');
        scope.Module.canvas = this.canvas_;
      }
    }

    // Bindings into C++

    /**
     * For internal use, a helper function which sets up a special 'input' texture
     * and binds it to our WebAssembly GL canvas, so that JS WebGL calls can
     * interact directly with our C++ GL context, until unbound or replaced with
     * a new texture.
     * @return {boolean} success Returns false if our setup is not yet ready to
     *     attempt this. Returns true if we attempted to bind a texture to our
     *     GL canvas.
     */
    bindTextureToGlCanvas() {
      if (!hasLoaded || !scope.Module.canvas) {
        return false;
      }
      return scope.Module._bindTextureToCanvas();
    }

    /**
     * Takes the JS string for the desired effect to render, and hands it off to
     * C++ for processing. On next process() call, this effect will be loaded,
     * and will be the new effect used for rendering until changed.
     * @param {string} effectName The name of the effect to be rendered. Must
     *     match one of the effects assets preloaded into the Webassembly binary.
     */
    setEffect(effectName) {
      if (hasLoaded) {
        // ccall is not as efficient as direct calling, but easier since we
        // don't have to worry about string conversion/memory management.
        scope.Module.ccall('setEffect', null, ['string'], [effectName]);
      }
    }

    /**
     * Sets the subgraphs used by the main graph passed in setGraph() and must be
     * called before calling setGraph().
     * @param {!Array<!Uint8Array>} graphDataList An array of raw Drishti graph
     *   data, in raw text format (.pbtxt).
     */
    setSubgraphs(graphDataList) {
      if (!hasLoaded) {
        console.log('Error: trying to call setSubgraphs before wasm loaded!');
        return;
      }
      scope.Module._clearSubgraphs();
      for (const graphData of graphDataList) {
        const size = graphData.length;
        const dataPtr = scope.Module._malloc(size);
        scope.Module.HEAPU8.set(graphData, dataPtr);
        scope.Module._pushTextSubgraph(size, dataPtr);
        scope.Module._free(dataPtr);
      }
    }

    /**
     * Takes the raw data from a Drishti graph, and passes it to C++ to be run
     * over the video stream. Will replace the previously running Drishti graph,
     * if there is one.
     * @param {!Uint8Array} graphData The raw Drishti graph data, either in binary
     *     protobuffer format (.binarypb), or else in raw text format (.pbtxt).
     * @param {boolean} isBinary This should be set to true if the graph is in
     *     binary format, and false if it is in human-readable text format.
     */
    setGraph(graphData, isBinary) {
      // For now just error out.  TODO(tmullen): Instead store this so we can
      // retry when module loads.
      if (!hasLoaded) {
        console.log('Error: trying to call setGraph before wasm module loaded!');
        return;
      }
      const size = graphData.length;
      const dataPtr = scope.Module._malloc(size);
      scope.Module.HEAPU8.set(graphData, dataPtr);
      if (isBinary) {
        scope.Module._changeBinaryGraph(size, dataPtr);
      } else {
        scope.Module._changeTextGraph(size, dataPtr);
      }
      scope.Module._free(dataPtr);
    }

    /**
     * Takes the relevant information from the JS image frame and hands it off
     * to C++ for processing the currently selected effect.
     * @param {!ImageData} imageData The raw image data for the current frame.
     * @param {number} timestamp The timestamp of the current frame, in ms.
     * @return {?MspfData} output The timing information, or null if no processing
     *     occurred.
     */
    process(imageData, timestamp) {
      /**
       * Typedef representing effect processing/rendering timing information.
       * - mspf: Debug data; an average of ms/frame over the last 10 frames.
       *
       * @typedef {{
       *   mspf: number,
       * }}
       */
      var MspfData;
      // TODO(tmullen): When you separate out Mspf presentation layer, you can
      // just return the mspf directly here.
      if (!hasLoaded) {
        return null;
      }

      // TODO(tmullen): Refactor image frame passing into common subroutine.
      // Similar-to-identical code is currently used by several FrameProcessors.
      const width = imageData.width;
      const height = imageData.height;

      // (Re-)allocate image memory space if needed.
      // TODO(tmullen): Allow for a close() call and free up the image memory then
      const size = 4 * width * height;
      if (this.pixelsSize_ != size) {
        if (this.pixelsPtr_) {
          scope.Module._free(this.pixelsPtr_);
        }
        this.pixelsPtr_ = scope.Module._malloc(size);
        this.pixelsSize_ = size;
      }
      scope.Module.HEAPU8.set(imageData.data, this.pixelsPtr_);

      const wasmHeapWriterByteCount = 24;  // 4 ints and 1 ll (timestamp)
      const frameDataWriter = new WasmHeapWriter(wasmHeapWriterByteCount);
      // Order matters here, and must follow the C++ layout in FrameData struct.
      // We add one more int here for proper padding for timestamp.
      frameDataWriter.writeInt32(0);  // padding.
      frameDataWriter.writeInt32(width);
      frameDataWriter.writeInt32(height);
      frameDataWriter.writePtr(this.pixelsPtr_);
      frameDataWriter.writeFloat64(timestamp);

      const frameDataPtr = frameDataWriter.getData();

      // We deal with only float offsets for now.
      const outputPtr = scope.Module._process(frameDataPtr) / 4;
      scope.Module._free(frameDataPtr);

      const output = {
        mspf: scope.Module.HEAPF32[outputPtr],
      };
      return output;
    }

    /**
     * Takes the relevant information from the HTML5 video object and hands it off
     * to C++ for processing the currently selected effect.  Similar to process(),
     * but uses an OpenGL texture reference as the input mechanism, since WebGL
     * can directly push video data to texture.
     * @param {!HTMLVideoElement} video Reference to the video we wish to render
     *     an effect onto, at its current frame.
     * @param {number} timestamp The timestamp of the current frame, in ms.
     * @return {?MspfData} output The timing information, or null if no processing
     *     occurred.
     */
    processVideoGl(video, timestamp) {
      if (!hasLoaded) {
        return null;
      }
      // We must create and bind the texture native-side so we have a GL name
      // for it, which is necessary if we want to manage it with C++ OpenGL
      // code Drishti-side (wrapped as a GpuBuffer object).
      if (!this.bindTextureToGlCanvas()) {
        return null;
      }
      // Grabbing the context can create it, so any WebGL calls should be made
      // *after* bindTextureToCanvas returns successfully.
      const gl =
        this.canvas_.getContext('webgl2') || this.canvas_.getContext('webgl');
      if (!gl) {
        alert('Failed to create WebGL canvas context when passing video frame.');
        return null;
      }
      // We assume that using the video object here is the quickest way to push
      // the video texture data into GPU memory, which makes sense, but this
      // assumption has not been tested.
      // TODO(tmullen): If you swap over to using a PBO, texSubImage2D might be
      //     faster here.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      // Still pass in width, height, and timestamp CPU-side
      const wasmHeapWriterByteCount = 16;  // 2 ints and a ll (timestamp)
      const frameDataWriter = new WasmHeapWriter(wasmHeapWriterByteCount);
      frameDataWriter.writeInt32(video.videoWidth);
      frameDataWriter.writeInt32(video.videoHeight);
      frameDataWriter.writeFloat64(timestamp);
      const frameDataPtr = frameDataWriter.getData();

      const outputPtr = scope.Module._processGl(frameDataPtr) / 4;
      scope.Module._free(frameDataPtr);
      const output = {
        mspf: scope.Module.HEAPF32[outputPtr],
      };
      return output;
    }
  }

  scope.CpuXenoEffects = CpuXenoEffects;

})(self);
