/* By Morgan McGuire @CasualEffects https://casual-effects.com LGPL 3.0 License*/
"use strict";

/* 
   The profiler manages both data displayed to the user and the graphics rate scaling.
*/

// Because browser timers are low precision (even performance.now is
// limited to 1ms for "security" on most browsers), we need to
// accumulate timing data over many frames to make it accurate.

function Profiler() {
    // Should be an integer multiple of the graphics period so that
    // graphics appears a representable number of times in the profile
    // data. The first interval is "1" to get results immediately.
    this.framesThisInterval       = 1;
    this.framesSinceIntervalStart = 0;
    this.intervalStartTime        = NaN;

    this.graphicsPeriod           = 1;

    this.lastGraphicsPeriodChangeTime = -Infinity;

    // Accumulated physics time for the interval.  Because the physics
    // time is micro-profiled, this does not give the accuracy of the
    // overall frame timing, but it does have better accuracy than
    // measuring a single frame.
    this.physicsAccumTime          = 0;
    this.graphicsAccumTime         = 0;
    this.logicAccumTime            = 0;

    const cutoff = 2e-3;
    const speed = 0.09;
    
    // Estimates of time spent on each part of the computation
    this.smoothLogicTime           = new EuroFilter(cutoff, speed);
    this.smoothPhysicsTime         = new EuroFilter(cutoff, speed);
    this.smoothGraphicsTime        = new EuroFilter(cutoff, speed);

    // Interval between frames, not time spent in computation
    this.smoothFrameTime           = new EuroFilter(cutoff, speed);

    // Used for measuring compute time in a frame
    this.currentFrameStartTime     = this.now();

    // Set to true when debugging the profiler itself
    // to track and display metadata
    this.debuggingProfiler         = false;
    this.reset();
}


// Return a timestamp
Profiler.prototype.now = function() {
    // In testing during January 2019, I found that Chrome has sub-millisecond
    // precision (accuracy unknown) and Firefox and Safari have millisecond 
    // precision, so performance.now is still better than Date.now.
    //
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    return performance.now();
};


Profiler.prototype.startFrame = function () {
    this.currentFrameStartTime = this.now();
};


Profiler.prototype.reset = function() {
    this.intervalStartTime            = this.now();
    this.framesSinceIntervalStart     = 0;
    this.lastGraphicsPeriodChangeTime = this.now();
    this.framesThisInterval           = 1;
    this.physicsAccumTime             = 0;
    this.logicAccumTime               = 0;
    this.graphicsAccumTime            = 0;
    this.currentFrameStartTime        = this.now();
    this.graphicsPeriod               = 1;
    this.smoothLogicTime.reset();
    this.smoothPhysicsTime.reset();
    this.smoothGraphicsTime.reset();
    this.smoothFrameTime.reset();
};


Profiler.prototype.endFrame = function(physicsTime, graphicsTime, logicToGraphicsTimeShift) {
    ++this.framesSinceIntervalStart;
    const grossComputeTime = this.now() - this.currentFrameStartTime;
    this.physicsAccumTime += physicsTime;
    this.graphicsAccumTime += graphicsTime + logicToGraphicsTimeShift;
    this.logicAccumTime += grossComputeTime - physicsTime - graphicsTime - logicToGraphicsTimeShift;

    if (this.framesSinceIntervalStart < this.framesThisInterval) {
        // Not at the end of the interval
        return;
    }

    const intervalEndTime = this.now();
    // Update the counters
    {
        const N = this.framesThisInterval;
        const frameTime = (intervalEndTime - this.intervalStartTime) / N;
        
        // Compute the best estimate of real time spent on each operation.
        // The graphics time is the actual time spent there, which takes
        // the reduced refresh rate into account.
        let graphicsTime = this.graphicsAccumTime / N;
        let physicsTime = this.physicsAccumTime / N;
        let logicTime = Math.max(this.logicAccumTime / N, 0);
        
        // Assume that at least 10% of the logic time is actually
        // graphics draw call setup, so that the profiler can estimate
        // the impact of reducing the refresh rate and avoiding that
        // overhead. We have no way to measure this precisely in
        // JavaScript.
        graphicsTime += logicTime * 0.10;
        logicTime *= 0.90;
        
        this.smoothLogicTime.update(logicTime, N);
        this.smoothPhysicsTime.update(physicsTime, N);
        this.smoothGraphicsTime.update(graphicsTime, N);
        this.smoothFrameTime.update(frameTime, N);
    }
    
    // Reset for new frame
    this.physicsAccumTime = 0;
    this.graphicsAccumTime = 0;
    this.logicAccumTime = 0;
    this.framesSinceIntervalStart = 0;
    this.intervalStartTime = intervalEndTime;
    
    if (this.framesThisInterval === 1) {
        // End of the first frame. Change to a useful measurement
        // interval. Note that there will be some roundoff for
        // the cost of graphics based on the interval since it
        // isn't running every frame. Use 15 so that we see
        // no roundoff effects at 15, 30, 60 Hz but are still very
        // responsive at lower framerates.
        this.framesThisInterval = 15;
    } else if (intervalEndTime - this.lastGraphicsPeriodChangeTime >= 1000) {
        // End of the interval and at a reasonable time at which to evaluate the
        // interval length and graphics period.

        const maxG = 6;
        // Graphics periods:
        //   1 -> 60 Hz
        //   2 -> 30 Hz
        //   3 -> 20 Hz
        //   4 -> 15 Hz
        //   5 -> 12 Hz
        //   6 -> 10 Hz
        
        const logicTime    = this.smoothLogicTime.get();
        const physicsTime  = this.smoothPhysicsTime.get();
        const graphicsTime = this.smoothGraphicsTime.get();
        const frameTime    = this.smoothFrameTime.get();
        const G            = this.graphicsPeriod;

        // Estimates of the best frame time we might hit if graphicsPeriod changes 
        const minAchievableTime              = logicTime + physicsTime + graphicsTime * G / maxG;
        const expectedTimeAtLowerFramerate   = logicTime + physicsTime + graphicsTime * G / (G + 1);
        const expectedTimeAtCurrentFramerate = logicTime + physicsTime + graphicsTime;
        const expectedTimeAtHigherFramerate  = logicTime + physicsTime + graphicsTime * G / Math.max(G - 1, 0.5);
        let newG = G;

        if (frameTime > 19 && QRuntime.game_frames > 200) {
            // We're many frames in and can't keep up.  Try disabling
            // bloom.
            allow_bloom = false;
        }

        // Sometimes the JIT runs or another scheduling event occurs and the actual time
        // is way out of sync with the expected time. Do not drop the framerate in this case.
        if (
            // Not making frame rate
            (frameTime > 17.5) &&
                
            // and our timing estimates seem valid (i.e., the JIT didn't just run or something weird
            // that might throw off timing)
            (frameTime < 2 * expectedTimeAtCurrentFramerate)) {
            
            if (
                // The best we can possibly by graphics scaling 
                //((minAchievableTime <= 16.5) || (minAchievableTime < frameTime * 0.6))  &&

                // Not at the lowest frame rate yet
                (G < maxG) &&

                // We've been in the current mode for what we expected
                // to be one second worth of frames, so this is
                // probably steady state.
                (QRuntime.mode_frames > 60 / G)) {

                // It is worth lowering the graphics rate, as it
                // should help us hit frame rate
                newG = G + 1;

                if (! deployed) {
                $systemPrint(`\nLowered graphics update from ${60 / G} to ${60 / newG} Hz because:\n` +
                             `  minAchievableTime = ${minAchievableTime.toFixed(2)}\n` +
                             `  expectedTimeAtLowerFramerate   = ${expectedTimeAtLowerFramerate.toFixed(2)}\n` +
                             `  expectedTimeAtCurrentFramerate = ${expectedTimeAtCurrentFramerate.toFixed(2)}\n` +
                             `  expectedTimeAtHigherFramerate  = ${expectedTimeAtHigherFramerate.toFixed(2)}\n` +
                             `  actualTimeAtCurrentFramerate   = ${frameTime.toFixed(2)}`, 'color:#F43');
                }
            }
        } else if (

            // Not at the highest graphics frame rate
            (G > 1) &&

            // We're plausibly performing well (being pretty liberal about it due to odd performance
            // numbers on low end machines when using infrequent timers)
            (frameTime < 30) &&
            
            // Increasing frame rate should still keep us under the limit
            (expectedTimeAtHigherFramerate < 16.6) &&
                
            // Even given the error in our current estimates, the new frame rate
            // should still be pretty close to 60 Hz. Sometimes on RPi the actual
            // frame time reports low, and then when we change rate it is able
            // to catch up, so be very liberal here on timing
            (expectedTimeAtHigherFramerate * Math.min(1.0, frameTime / expectedTimeAtCurrentFramerate) < 25)) {
                       
            // We have headroom and should increase the graphics rate
            // back towards full framerate.
            newG = G - 1;

            if (! deployed) {
            $systemPrint(`\nRaised graphics update from ${60 / G} to ${60 / newG} Hz because:\n` +
                         `  minAchievableTime = ${minAchievableTime.toFixed(2)}\n` +
                         `  expectedTimeAtLowerFramerate   = ${expectedTimeAtLowerFramerate.toFixed(2)}\n` +
                         `  expectedTimeAtCurrentFramerate = ${expectedTimeAtCurrentFramerate.toFixed(2)}\n` +
                         `  expectedTimeAtHigherFramerate  = ${expectedTimeAtHigherFramerate.toFixed(2)}\n` +
                         `  actualTimeAtCurrentFramerate   = ${frameTime.toFixed(2)}`, 'color:#1E8');
            }
        }
        
        if (newG !== G) {
            // Period changed
            this.graphicsPeriod = newG;

            // Want to target about 10 frames for interval length, but it
            // must be an integer multiple of newG.
            this.framesThisInterval = Math.ceil(10 / newG) * newG;
            this.lastGraphicsPeriodChangeTime = intervalEndTime;
        }
        
    }
};

const profiler = new Profiler();
