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
        // Convert radians to degrees
        let degrees = rawRoll * (180 / Math.PI);
        
        // Apply sensitivity (simulate up to 2000 lock-to-lock based on device's +-90 deg range)
        // A device turning 90 deg with 11.1x sensitivity = 1000 deg (half of 2000)
        let scaledDegrees = degrees * this.sensitivity;

        // Map to -1.0 to 1.0 assuming max theoretical angle is 1000 degrees each way
        let normalized = scaledDegrees / 1000.0;
        
        // Clamp to [-1.0, 1.0]
        normalized = Math.max(-1.0, Math.min(1.0, normalized));

        // Apply Deadzone
        if (Math.abs(normalized) < this.deadzone) {
            return 0.0;
        }

        // Rescale so that just past the deadzone doesn't jump
        if (normalized > 0) {
            return (normalized - this.deadzone) / (1.0 - this.deadzone);
        } else {
            return (normalized + this.deadzone) / (1.0 - this.deadzone);
        }
    }
}

export default new SensorFusion();
