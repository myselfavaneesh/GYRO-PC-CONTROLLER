/**
 * UdpClient.js
 * Handles high-frequency, low-latency UDP socket broadcasting.
 */
import dgram from 'react-native-udp';

class UdpClient {
    constructor() {
        this.socket = null;
        this.ip = '192.168.1.100'; // Default fallback
        this.port = 8080;
        this.connected = false;
    }

    connect(ip, port) {
        this.ip = ip;
        this.port = parseInt(port, 10);
        
        if (this.socket) {
            this.socket.close();
        }

        this.socket = dgram.createSocket('udp4');
        this.socket.bind(0);
        
        this.socket.once('listening', () => {
            this.connected = true;
            console.log('UDP Client bound');
        });

        this.socket.on('error', (err) => {
            console.error('UDP Error:', err);
            this.connected = false;
        });
    }

    /**
     * Send telemetry over UDP
     * @param {number} steer -1.0 to 1.0 (left to right)
     * @param {number} gas 0.0 to 1.0
     * @param {number} brake 0.0 to 1.0
     */
    sendTelemetry(steer, gas, brake) {
        if (!this.connected || !this.socket) return;

        const payload = JSON.stringify({
            steer,
            gas,
            brake,
            timestamp: Date.now()
        });

        this.socket.send(payload, 0, payload.length, this.port, this.ip, (err) => {
            if (err) console.error('UDP Send Error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
    }
}

export default new UdpClient();
