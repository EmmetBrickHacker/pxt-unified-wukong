// Part of extension https://github.com/EmmetBrickHacker/pxt-unified-wukong/

/**
 * Dropdown options for controller buttons.
 * Includes Unicode icons to solve the physical label overlap issue.
 */
enum URCButtonId {
    //% block="◀ C"
    C,
    //% block="▲ D"
    D,
    //% block="▼ E"
    E,
    //% block="▶ F"
    F
}

enum URCButtonAction {
    //% block="pressed"
    Pressed,
    //% block="released"
    Released
}

//% color="#FFAA00" icon="\uf1b9" block="Unified wuKong"
namespace uwv {
    
    // Internal Event Bus ID for URC buttons
    const URC_EVENT_ID = 8888;
    
    // State memory for the boolean "is pressed" block
    let btnStates: boolean[] = [false, false, false, false]; // C, D, E, F
    let altBtnStates: boolean[] = [false, false, false, false]; // Alt C, D, E, F

    /**
     * Internal function called by uwv.ts when a urcbtn radio message is received.
     * Updates internal boolean states and fires the MakeCode Event Bus.
     */
    export function processButtonMessage(value: number): void {
        // Trigger the specific event block
        control.raiseEvent(URC_EVENT_ID, value);

        // Update internal states for the boolean blocks
        switch (value) {
            case 41: btnStates[URCButtonId.C] = true; break;
            case 40: btnStates[URCButtonId.C] = false; break;
            case 81: btnStates[URCButtonId.D] = true; break;
            case 80: btnStates[URCButtonId.D] = false; break;
            case 21: btnStates[URCButtonId.E] = true; break;
            case 20: btnStates[URCButtonId.E] = false; break;
            case 61: btnStates[URCButtonId.F] = true; break;
            case 60: btnStates[URCButtonId.F] = false; break;
            
            case 141: altBtnStates[URCButtonId.C] = true; break;
            case 140: altBtnStates[URCButtonId.C] = false; break;
            case 181: altBtnStates[URCButtonId.D] = true; break;
            case 180: altBtnStates[URCButtonId.D] = false; break;
            case 121: altBtnStates[URCButtonId.E] = true; break;
            case 120: altBtnStates[URCButtonId.E] = false; break;
            case 161: altBtnStates[URCButtonId.F] = true; break;
            case 160: altBtnStates[URCButtonId.F] = false; break;
        }
    }

    // --- USER BLOCKS (SUBCATEGORY: REACTIONS) ---

    /**
     * Event handler that runs code when a specific controller button is pressed or released.
     */
    //% blockId=uwv_on_button_event 
    //% block="on controller button $btn $action | alt mode $altMode"
    //% altMode.shadow="toggleOnOff" altMode.defl=false
    //% subcategory="Actions"
    //% weight=100
    export function onControllerButton(btn: URCButtonId, action: URCButtonAction, altMode: boolean, handler: () => void): void {
        // Calculate the exact numerical value that the URC controller sends
        let modeOffset = altMode ? 100 : 0;
        let actionDigit = (action === URCButtonAction.Pressed) ? 1 : 0;
        
        let btnDigit = 0;
        if (btn === URCButtonId.C) btnDigit = 40;
        else if (btn === URCButtonId.D) btnDigit = 80;
        else if (btn === URCButtonId.E) btnDigit = 20;
        else if (btn === URCButtonId.F) btnDigit = 60;

        let targetEventValue = modeOffset + btnDigit + actionDigit;

        // Register the handler to the MakeCode Event Bus
        control.onEvent(URC_EVENT_ID, targetEventValue, handler);
    }

    /**
     * Boolean block to check if a specific controller button is currently being held down.
     * Ideal for loops and continuous actions (Autofire).
     */
    //% blockId=uwv_is_button_pressed 
    //% block="controller button $btn is pressed | alt mode $altMode"
    //% altMode.shadow="toggleOnOff" altMode.defl=false
    //% subcategory="Reactions"
    //% weight=90
    export function isControllerButtonPressed(btn: URCButtonId, altMode: boolean = false): boolean {
        if (altMode) {
            return altBtnStates[btn];
        } else {
            return btnStates[btn];
        }
    }

    /**
     * Briefly flashes a custom icon on the vehicle's LED matrix (e.g., during an action).
     * Automatically returns to the standard status screen after 500ms.
     */
    //% blockId=uwv_show_action_icon 
    //% block="show action icon $img"
    //% img.shadow="device_build_image"
    //% subcategory="Reactions"
    //% weight=80
    export function showActionIcon(img: Image): void {
        // This bypasses the strict enum and directly forces an image
        // It relies on a new custom override we will add to led5x5.ts
        led5x5.renderCustomAction(img);
    }
}
