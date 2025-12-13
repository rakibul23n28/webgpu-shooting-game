export class InputManager {
  private keyDown: { [key: string]: boolean } = {};

  private mouseDown: { [button: number]: boolean } = {};
  private mouseReleased: { [button: number]: boolean } = {};

  constructor() {
    // Keyboard
    window.addEventListener("keydown", (e) => {
      this.keyDown[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keyDown[e.key.toLowerCase()] = false;
    });

    // Mouse
    window.addEventListener("mousedown", (e) => {
      this.mouseDown[e.button] = true;
    });

    window.addEventListener("mouseup", (e) => {
      this.mouseDown[e.button] = false;
      this.mouseReleased[e.button] = true;
    });

    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // -------- Keyboard --------
  public isKeyDown(key: string): boolean {
    return !!this.keyDown[key.toLowerCase()];
  }

  public isKeyUp(key: string): boolean {
    return !this.keyDown[key.toLowerCase()];
  }

  // -------- Mouse --------
  public isMouseDown(button: number): boolean {
    return !!this.mouseDown[button];
  }

  public isLeftMouseDown(): boolean {
    return this.isMouseDown(0);
  }

  public isRightMouseDown(): boolean {
    return this.isMouseDown(2);
  }

  public isRightMouseReleased(): boolean {
    return this.isMouseReleased(2);
  }

  /**
   * TRUE only ONCE when the button is released
   * (resets automatically after read)
   */
  public isMouseReleased(button: number): boolean {
    const released = !!this.mouseReleased[button];
    this.mouseReleased[button] = false; // consume event
    return released;
  }

  public isLeftMouseReleased(): boolean {
    return this.isMouseReleased(0);
  }
}
