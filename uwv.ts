// Part of extension https://github.com/EmmetBrickHacker/pxt-unified-wukong/
// Actual file [!] https://github.com/EmmetBrickHacker/pxt-unified-wukong/blob/master/uwv.ts

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
    let activeRadioGroup: number = 0;

    // Connection state variables
    let connection: boolean = false;
    let lastPingTime: number = 0;

    /**
     * Initializes the Unified Wukong Vehicle receiver with motor and radio configurations.
     * @param radioGroup radio group to listen on (0-255), e.g.: 0
     * @param leftPort port for the left motor, e.g.: wuKong.MotorList.M1
     * @param leftReverse rotation direction of the left motor for forward movement
     * @param rightPort port for the right motor, e.g.: wuKong.MotorList.M2
     * @param rightReverse rotation direction of the right motor for forward movement
     * @param pingTimeout duration without receiving radio signals before forcing a stop
     * @param deadzone inner joystick region threshold where movement values are ignored
     */
    //% blockId=uwv_init_vehicle
    //% block="initialize Unified Wukong Vehicle | radio group $radioGroup left motor $leftPort reverse left motor $leftReverse right motor $rightPort reverse right motor $rightReverse||ping timeout (ms) $pingTimeout deadzone $deadzone"
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
        leftMotorDir = leftReverse ? -1 : 1;
        rightMotorDir = rightReverse ? -1 : 1;
        pingTimeoutMs = <number>pingTimeout;
        deadZoneRadius = deadzone;
        activeRadioGroup = radioGroup;

        // Apply radio frequency grouping
        radio.setGroup(radioGroup);
        connection = false;
        lastPingTime = control.millis();

        // Configure and start the dedicated screen management subsystem
        led5x5.setRadioGroup(activeRadioGroup);
        led5x5.setVisualState(VehicleVisualState.ShowRadioGroup);
        led5x5.startDisplayManager();

        // Run background receiver and monitor loops
        setupRadioReceiver();
        startConnectionMonitor();

        isInitialized = true;
    }

    /**
     * Returns true if the vehicle is currently connected to the remote controller.
     */
    //% blockId=uwv_is_connected block="RC connection"
    //% weight=90
    export function isConnected(): boolean {
        return connection;
    }

    // --- ADVANCED CONFIGURATION BLOCKS ---

    /**
     * Configures the display behavior of the vehicle.
     * @param mode how the disconnected state icon should be dismissed
     */
    //% blockId=uwv_config_display
    //% block="clear connection lost status by $mode"
    //% mode.defl=DisconnectClearMode.Timeout
    //% advanced=true
    export function configureDisplay(mode: DisconnectClearMode): void {
        led5x5.setDisconnectClearMode(mode);
    }
    
    // --- INTERNAL FUNCTIONS ---

    /**
     * Set up async radio handler for control packets.
     */
    function setupRadioReceiver(): void {
        radio.onReceivedValue(function (name: string, value: number) {
            if (name == "urcping") {
                if (!connection) {
                    connection = true;
                    led5x5.setVisualState(VehicleVisualState.Connected);
                }
                lastPingTime = control.millis();
            } else if (name == "urccoord") {
                if (!connection) {
                    connection = true;
                    led5x5.setVisualState(VehicleVisualState.Connected);
                }
                lastPingTime = control.millis();

                // Unpack differential coordinates
                let x = ValPacker.unpack(Package.Left, value);
                let y = ValPacker.unpack(Package.Right, value);

                processDrive(x, y);
            } else if (name == "urcbtn") {
                lastPingTime = control.millis();
                if (!connection) {
                    connection = true;
                }

                // DIRECT MAPPING: Cast the raw protocol value straight into the visual state enum
                led5x5.setVisualState(<VehicleVisualState>value);
                
            } else if (name == "urcbtn") {
                lastPingTime = control.millis();
                if (!connection) {
                    connection = true;
                }

                // Visual feedback
                led5x5.setVisualState(<VehicleVisualState>value);

                // NOVÉ: Trigger user reaction blocks & update autofire states
                uwv.processButtonMessage(value);
            }
        });
    }

    /**
     * Runs periodic background check evaluating link health.
     */
    function startConnectionMonitor(): void {
        loops.everyInterval(100, function () {
            if (connection && (control.millis() - lastPingTime > pingTimeoutMs)) {
                connection = false;
                wuKong.stopAllMotor(); // Failsafe: instantly cut off power to all motors
                led5x5.setVisualState(VehicleVisualState.Disconnected);
            }
        });
    }

    /**
     * Calculates arcade differential mixing and sends power outputs to wuKong motors.
     */
    function processDrive(x: number, y: number): void {
        if (!connection) {
            wuKong.stopAllMotor();
            return;
        }

        // Apply deadzone filtering
        if (Math.abs(x) < deadZoneRadius) { x = 0; }
        if (Math.abs(y) < deadZoneRadius) { y = 0; }

        // Arcade steering inversion when driving in reverse
        if (y < 0) { x = -x; }

        // Differential motor mixing
        let leftSpeed = y + x;
        let rightSpeed = y - x;

        // Clamp speeds to valid Wukong limits (-100 to 100)
        leftSpeed = Math.max(-100, Math.min(100, leftSpeed));
        rightSpeed = Math.max(-100, Math.min(100, rightSpeed));

        // Apply motor orientation adjustments
        leftSpeed = leftSpeed * leftMotorDir;
        rightSpeed = rightSpeed * rightMotorDir;

        // Execute hardware speed adjustments
        wuKong.setMotorSpeed(leftMotorPort, leftSpeed);
        wuKong.setMotorSpeed(rightMotorPort, rightSpeed);
    }
}