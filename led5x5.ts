// Part of extension https://github.com/EmmetBrickHacker/pxt-unified-wukong/

/**
 * Predefined visual states for the 5x5 LED matrix.
 * Button state values directly correspond to the 'urcbtn' radio protocol values.
 */
enum VehicleVisualState {
    // System and connectivity states
    //% block="ID"
    ShowRadioGroup = 0,
    //% block="online"
    Connected = 1,
    //% block="offline"
    Disconnected = 2,

    // Standard mode - Pressed events (ends with 1)
    //% block="Button C pressed"
    BtnC_Pressed = 41,
    //% block="Button D pressed"
    BtnD_Pressed = 81,
    //% block="Button E pressed"
    BtnE_Pressed = 21,
    //% block="Button F pressed"
    BtnF_Pressed = 61,

    // Standard mode - Released events (ends with 0)
    //% block="Button C released"
    BtnC_Released = 40,
    //% block="Button D released"
    BtnD_Released = 80,
    //% block="Button E released"
    BtnE_Released = 20,
    //% block="Button F released"
    BtnF_Released = 60,

    // Alternative mode - Pressed events (ends with 1)
    //% block="Alt Button C pressed"
    AltBtnC_Pressed = 141,
    //% block="Alt Button D pressed"
    AltBtnD_Pressed = 181,
    //% block="Alt Button E pressed"
    AltBtnE_Pressed = 121,
    //% block="Alt Button F pressed"
    AltBtnF_Pressed = 161,

    // Alternative mode - Released events (ends with 0)
    //% block="Alt Button C released"
    AltBtnC_Released = 140,
    //% block="Alt Button D released"
    AltBtnD_Released = 180,
    //% block="Alt Button E released"
    AltBtnE_Released = 120,
    //% block="Alt Button F released"
    AltBtnF_Released = 160
}

namespace led5x5 {
    let currentTargetState: VehicleVisualState = VehicleVisualState.ShowRadioGroup;
    let currentlyRenderedState: number = -1; // -1 forces initial redraw upon startup
    let radioGroupValue: number = 0;

    /**
     * Updates the intended visual state of the vehicle's LED screen.
     * The manager thread will handle the actual redraw if the state changed.
     */
    export function setVisualState(state: VehicleVisualState): void {
        currentTargetState = state;
    }

    /**
     * Sets the active radio group value to display when in ShowRadioGroup state.
     */
    export function setRadioGroup(group: number): void {
        radioGroupValue = group;
    }

    /**
     * Starts the background task that manages low-latency screen updates.
     * Uses a specific asynchronous timing interval to minimize collision risks.
     */
    export function startDisplayManager(): void {
        // 247 ms interval prevents periodic synchronization with 100ms or 500ms radio tasks
        loops.everyInterval(247, function () {
            if (currentTargetState !== currentlyRenderedState) {
                currentlyRenderedState = currentTargetState;

                switch (currentlyRenderedState) {
                    case VehicleVisualState.ShowRadioGroup:
                        nums.icon(radioGroupValue).showImage(0);
                        break;

                    case VehicleVisualState.Connected:
                        basic.showIcon(IconNames.Yes);
                        break;

                    case VehicleVisualState.Disconnected:
                        basic.showIcon(IconNames.No);
                        break;

                    // Example handling of specific button events (can be customized or left blank)
                    case VehicleVisualState.BtnC_Pressed:
                        basic.showString("C");
                        break;

                    case VehicleVisualState.AltBtnC_Pressed:
                        basic.showString("X");
                        break;

                    default:
                        // If an unhandled button state or release event is caught, 
                        // we fallback to the Connected icon (checkmark) to show we are still online.
                        basic.showIcon(IconNames.Yes);
                        break;
                }
            }
        });
    }
}
