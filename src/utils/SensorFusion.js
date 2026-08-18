/**
 * SensorFusion.js
 * Maps raw device rotation into a normalized [-1.0, 1.0] steering value.
 */

// We assume 2000 degrees lock-to-lock => -1000 to +1000 degrees.
// Roll angle from react-native-sensors (accelerometer or gyro integration) typically gives radians or degrees.
// If using accelerometer/gyro, 'roll' is typically roughly -PI to PI radians (-180 to 180 degrees).
// To simulate a 2000 degree wheel, we need sensitivity multipliers.

class SensorFusion {
    constructor() {
        this.deadzone = 0.05; // 5% deadzone by default
        this.sensitivity = 1.0; // Multiplier to simulate higher steering lock
    }

    setParameters(deadzone, sensitivity) {
        this.deadzone = deadzone;
        this.sensitivity = sensitivity;
    }

    /**
     * Normalize device roll (assuming it comes in radians from -PI to PI)
     * @param {number} rawRoll - Device roll in radians
     * @returns {number} - Normalized float between -1.0 and 1.0
     */
    normalizeSteering(rawRoll) {
        // Convert rawRoll from radians to degrees
        const degrees = rawRoll * (180.0 / Math.PI);
        
        // Define a realistic baseline target range for mobile gaming (e.g., 45.0 degrees)
        const baselineTargetRange = 45.0;
        
        // Scale this baseline using the sensitivity configuration. 
        // Higher sensitivity = smaller target range (meaning you tilt less to turn fully)
        const scaledTargetRange = baselineTargetRange / (this.sensitivity || 1.0);

        // Divide the raw degrees by this new target range
        let normalized = degrees / scaledTargetRange;
        
        // Strictly clamp the final normalized float between -1.0 and 1.0
        normalized = Math.max(-1.0, Math.min(1.0, normalized));

        // Apply the deadzone logic
        if (Math.abs(normalized) <= this.deadzone) {
            return 0.0;
        }

        // Smoothly rescale the remaining value from 0.0 to 1.0 (or -1.0)
        // so the steering doesn't "snap" aggressively when escaping the deadzone.
        if (normalized > 0) {
            return (normalized - this.deadzone) / (1.0 - this.deadzone);
        } else {
            return (normalized + this.deadzone) / (1.0 - this.deadzone);
        }
    }
}

export default new SensorFusion();
