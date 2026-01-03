import { vec2 } from "gl-matrix";
import { Quad } from "./quad";
import { Rect } from "./rect";
import { Sprite } from "./Sprite";
import { SpriteFont } from "./sprite-font";
import { Texture } from "./texture";

export class Content {
  public static playerTexture: Texture;
  public static ufoRedTexture: Texture;
  public static spreiteSheetTexture: Texture;
  public static backgroundTexture: Texture;
  public static explosionTexture: Texture;

  public static spriteFont: SpriteFont;

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

    Content.spriteFont = await this.loadSnowBSpriteFont(
      device,
      "Font/Unnamed.xml",
      "Font/Unnamed.png"
    );
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

  private static async loadSnowBSpriteFont(
    device: GPUDevice,
    xmlPath: string,
    texturePath: string
  ): Promise<SpriteFont> {
    const texture = await Texture.createTextureFromURL(device, texturePath);

    const xmlReg = await fetch(xmlPath);
    const xmlText = await xmlReg.text();

    const perser = new DOMParser();
    const xmlDoc = perser.parseFromString(xmlText, "text/xml");

    const lineHeight = parseInt(
      xmlDoc.querySelector("common")!.getAttribute("lineHeight")!
    );

    const spriteFont = new SpriteFont(texture, lineHeight);

    xmlDoc.querySelectorAll("char").forEach((char) => {
      const id = parseInt(char.getAttribute("id")!);
      const x = parseInt(char.getAttribute("x")!);
      const y = parseInt(char.getAttribute("y")!);
      const width = parseInt(char.getAttribute("width")!);
      const height = parseInt(char.getAttribute("height")!);
      const xoffset = parseInt(char.getAttribute("xoffset")!);
      const yoffset = parseInt(char.getAttribute("yoffset")!);
      const xadvance = parseInt(char.getAttribute("xadvance")!);

      const x1 = x / texture.width;
      const y1 = y / texture.height;
      const x2 = (x + width) / texture.width;
      const y2 = (y + height) / texture.height;

      const quad = new Quad(
        vec2.fromValues(x1, y1),
        vec2.fromValues(x2, y1),
        vec2.fromValues(x1, y2),
        vec2.fromValues(x2, y2)
      );

      spriteFont.createChar(
        id,
        quad,
        vec2.fromValues(width, height),
        xadvance,
        vec2.fromValues(xoffset, yoffset)
      );
    });

    return spriteFont;
  }
}
