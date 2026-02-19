import { vec2 } from "gl-matrix";
import { Content } from "../content";
import { SpriteRenderer } from "../sprite-renderer";
import { Color } from "../Color";

export class GameOver {
  public currentScore = 0;

  public draw(
    spriteRenderer: SpriteRenderer,
    gameWidth: number,
    gameHeight: number,
  ) {
    const gameOver = `GAME OVER`;
    const score = `Score: ${this.currentScore}`;

    // Calculate a rough center (adjust based on your font size)
    const pos = vec2.fromValues(gameWidth / 2 - 110, gameHeight / 2 - 50);
    const scorePos = vec2.fromValues(gameWidth / 2 - 80, gameHeight / 2);

    // Draw shadow/offset for better readability
    spriteRenderer.drawString(
      Content.spriteFont,
      gameOver,
      vec2.fromValues(pos[0] + 1, pos[1] + 1),
      new Color(1, 1, 1), // White shadow
      0.5,
    );

    // Draw main text
    spriteRenderer.drawString(
      Content.spriteFont,
      gameOver,
      pos,
      new Color(0, 0, 1), // Bright Blue
      0.5,
    );
    // Draw score below the game over text
    spriteRenderer.drawString(
      Content.spriteFont,
      score,
      vec2.fromValues(scorePos[0] + 1, scorePos[1] + 1),
      new Color(1, 1, 1), // Black shadow
      0.5,
    );
    spriteRenderer.drawString(
      Content.spriteFont,
      score,
      scorePos,
      new Color(0, 0, 1), // Bright Blue
      0.5,
    );
  }
}
