import { Rect } from "./rect";
import { Sprite } from "./Sprite";
import { Texture } from "./texture";

export class Content {
  public static playerTexture: Texture;
  public static ufoRedTexture: Texture;
  public static spreiteSheetTexture: Texture;
  public static backgroundTexture: Texture;
  public static explosionTexture: Texture;

  public static sprites: { [id: string]: Sprite } = {};
  public static async initialize(device: GPUDevice): Promise<void> {
    Content.playerTexture = await Texture.createTextureFromURL(
      device,
      "PNG/playerShip1_blue.png"
    );
    Content.ufoRedTexture = await Texture.createTextureFromURL(
      device,
      "PNG/ufoRed.png"
    );
    Content.spreiteSheetTexture = await Texture.createTextureFromURL(
      device,
      "Spritesheet/sheet.png"
    );
    Content.backgroundTexture = await Texture.createTextureFromURL(
      device,
      "Backgrounds/black.png"
    );
    Content.explosionTexture = await Texture.createTextureFromURL(
      device,
      "Spritesheet/explosion.png"
    );

    await this.loadSpriteSheet();
  }

  private static async loadSpriteSheet() {
    const sheetXmlReg = await fetch("Spritesheet/sheet.xml");
    const sheetXmlText = await sheetXmlReg.text();

    const perser = new DOMParser();
    const xmlDoc = perser.parseFromString(sheetXmlText, "text/xml");

    xmlDoc.querySelectorAll("SubTexture").forEach((subTexture) => {
      const name = subTexture.getAttribute("name")!.replace(".png", "");
      const x = parseInt(subTexture.getAttribute("x")!);
      const y = parseInt(subTexture.getAttribute("y")!);
      const width = parseInt(subTexture.getAttribute("width")!);
      const height = parseInt(subTexture.getAttribute("height")!);

      const drawRect = new Rect(0, 0, width, height);
      const sourceRect = new Rect(x, y, width, height);

      this.sprites[name] = new Sprite(
        this.spreiteSheetTexture,
        drawRect,
        sourceRect
      );
    });
  }
}
