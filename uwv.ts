// Enum for predefined ping timeout values
enum ConnectionTimeout {
    //% block="500 ms"
    Ms500 = 500,
    //% block="1000 ms"
    Ms1000 = 1000,
    //% block="1500 ms"
    Ms1500 = 1500,
    //% block="2000 ms"
    Ms2000 = 2000,
    //% block="2500 ms"
    Ms2500 = 2500
}

//% weight=95 color="#FFAA00" icon="\uf1b9" block="Unified wuKong"
namespace uwv {
    // Internal configuration variables
    let isInitialized: boolean = false;
    let leftMotorPort: wuKong.MotorList = wuKong.MotorList.M1;
    let rightMotorPort: wuKong.MotorList = wuKong.MotorList.M2;
    let leftMotorDir: number = 1;
    let rightMotorDir: number = 1;
    let pingTimeoutMs: number = 2000;
    let deadZoneRadius: number = 15;

    // Connection state variables
    let connection: boolean = false;
    let lastPingTime: number = 0;

    /**
     * Initializes the Unified Wukong Vehicle receiver with motor and radio configurations.
     * @param radioGroup radio group to listen on (0-255), e.g.: 0
     * @param leftPort port for the left motor, e.g.: wuKong.MotorList.M1
     * @param leftReverse toggle ON to invert left motor direction, default is OFF (Forward)
     * @param rightPort port for the right motor, e.g.: wuKong.MotorList.M2
     * @param rightReverse toggle ON to invert right motor direction, default is OFF (Forward)
     * @param pingTimeout selection of predefined connection timeouts in ms, default is 2000 ms
     * @param deadzone radius of the deadzone around zero to ignore joystick jitter, e.g.: 15
     */
    //% blockId=uwv_init_vehicle
    //% block="initialize Unified Wukong Vehicle | radio group $radioGroup left motor $leftPort reverese left motor $leftReverse right motor $rightPort reverese right motor $rightReverse||ping timeout (ms) $pingTimeout deadzone $deadzone"
    //% radioGroup.min=0 radioGroup.max=255 radioGroup.defl=0
    //% leftPort.defl=wuKong.MotorList.M1
    //% leftReverse.shadow="toggleOnOff" leftReverse.defl=false
    //% rightPort.defl=wuKong.MotorList.M2
    //% rightReverse.shadow="toggleOnOff" rightReverse.defl=false
    //% pingTimeout.defl=ConnectionTimeout.Ms2000
    //% deadzone.min=0 deadzone.max=100 deadzone.defl=15
    //% expandableArgumentMode="toggle" inlineInputMode=external
    //% weight=100
    export function initVehicle(
        radioGroup: number = 0,
        leftPort: wuKong.MotorList = wuKong.MotorList.M1,
        leftReverse: boolean = false,
        rightPort: wuKong.MotorList = wuKong.MotorList.M2,
        rightReverse: boolean = false,
        pingTimeout: ConnectionTimeout = ConnectionTimeout.Ms2000,
        deadzone: number = 15
    ): void {
        if (isInitialized) return;

        leftMotorPort = leftPort;
        rightMotorPort = rightPort;

        // Map boolean toggles to numerical multipliers: 
        // ON (true) = Reverse (-1), OFF (false) = Forward (1)
        leftMotorDir = leftReverse ? -1 : 1;
        rightMotorDir = rightReverse ? -1 : 1;

        // Cast the enum selection to its underlying millisecond number
        pingTimeoutMs = <number>pingTimeout;
        deadZoneRadius = deadzone;

        radio.setGroup(radioGroup);
        connection = false;
        lastPingTime = control.millis();

        setupRadioReceiver();
        startConnectionMonitor();

        isInitialized = true;

        // Show initial status on the LED screen (waiting for connection)
        nums.icon(radioGroup).showImage(0);
    }

    /**
     * Returns true if the vehicle is currently connected to the remote controller.
     */
    //% blockId=uwv_is_connected block="RC connection"
    //% weight=90
    export function isConnected(): boolean {
        return connection;
    }

    // --- INTERNAL FUNCTIONS ---

    function setupRadioReceiver(): void {
        radio.onReceivedValue(function (name: string, value: number) {
            if (name == "urcping") {
                if (!connection) {
                    connection = true;
                    basic.showIcon(IconNames.Yes); // Connection established
                }
                lastPingTime = control.millis();
            } else if (name == "urccoord") {
                // Any valid coordinate packet also confirms active connection
                if (!connection) {
                    connection = true;
                    basic.showIcon(IconNames.Yes);
                }
                lastPingTime = control.millis();

                // Unpack data using pxt-valpacker
                // Fully compatible with pxt-unified-rc layout (Left = X, Right = Y)
                let x = ValPacker.unpack(Package.Left, value);
                let y = ValPacker.unpack(Package.Right, value);

                processDrive(x, y);
            }
        });
    }

    function startConnectionMonitor(): void {
        // Background loop checking for connection timeout every 100 ms
        loops.everyInterval(100, function () {
            if (connection && (control.millis() - lastPingTime > pingTimeoutMs)) {
                connection = false;
                wuKong.stopAllMotor(); // Failsafe: instantly cut off power to all motors
                basic.showIcon(IconNames.No); // Visual indicator for disconnected state
            }
        });
    }

    function processDrive(x: number, y: number): void {
        if (!connection) {
            wuKong.stopAllMotor();
            return;
        }

        // 1. Apply deadzone filtering
        // Values strictly inside (-deadZoneRadius, deadZoneRadius) are zeroed out.
        // Threshold values (e.g., exactly -15 or 15) are accepted and passed through.
        if (Math.abs(x) < deadZoneRadius) {
            x = 0;
        }
        if (Math.abs(y) < deadZoneRadius) {
            y = 0;
        }

        // 2. Arcade steering inversion when driving in reverse
        if (y < 0) {
            x = -x;
        }

        // 3. Differential motor mixing
        let leftSpeed = y + x;
        let rightSpeed = y - x;

        // 4. Clamp speeds to valid Wukong limits (-100 to 100)
        leftSpeed = Math.max(-100, Math.min(100, leftSpeed));
        rightSpeed = Math.max(-100, Math.min(100, rightSpeed));

        // 5. Apply motor orientation correction (Forward = *1, Reverse = *-1)
        leftSpeed = leftSpeed * leftMotorDir;
        rightSpeed = rightSpeed * rightMotorDir;

        // 6. Write physical speeds to the Wukong board
        wuKong.setMotorSpeed(leftMotorPort, leftSpeed);
        wuKong.setMotorSpeed(rightMotorPort, rightSpeed);
    }
}