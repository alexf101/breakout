import { number } from "prop-types";

declare const window: { DEBUG: boolean | undefined };
// window.DEBUG = true;
export class Game {
    ctx: CanvasRenderingContext2D;
    drawTimer: number;
    canvas: HTMLCanvasElement;
    ball: Ball;
    t: number;
    lastT: number;
    rightKeyPressed: boolean = false;
    leftKeyPressed: boolean = false;
    paddle: Paddle;
    bricks: Brick[][];
    score: Score;

    // Brick layout config.
    static brickRowCount: number = 3;
    static brickColumnCount: number = 5;
    static brickOffsetTop: number = 30;
    static brickOffsetLeft: number = 30;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.reset();
        document.addEventListener("keydown", this.keyDownHandler, false);
        document.addEventListener("keyup", this.keyUpHandler, false);
        document.addEventListener("click", this.clickHandler, false);
    }
    teardown() {
        document.removeEventListener("keydown", this.keyDownHandler, false);
        document.removeEventListener("keyup", this.keyUpHandler, false);
        document.removeEventListener("click", this.clickHandler, false);
    }
    ballHitBottom = () => {
        this.pause();
    };
    reset() {
        this.ball = new Ball(
            this.ctx,
            this.canvas.width / 2,
            this.canvas.height - 100,
            this.ballHitBottom
        );
        this.ball.motions.linear = new LinearMotion(this.ball, 2 / 10, -2 / 10);
        this.paddle = new Paddle(
            this.ctx,
            (this.canvas.width - 10) / 2,
            this.ctx.canvas.height - Paddle.height
        );
        this.bricks = [];
        for (let i = 0; i < Game.brickColumnCount; i++) {
            this.bricks.push([]);
            for (let j = 0; j < Game.brickRowCount; j++) {
                this.bricks[i][j] = new Brick(
                    this.ctx,
                    i * (Brick.width + Brick.padding) + Game.brickOffsetTop,
                    j * (Brick.height + Brick.padding) + Game.brickOffsetLeft
                );
            }
        }
        this.score = new Score(this.ctx, 8, 20);
        this.start();
    }
    start() {
        if (this.drawTimer) {
            // Don't allow multiple timers to exist.
            return;
        }
        this.lastT = new Date().getTime();
        this.drawTimer = setInterval(() => this.step(), 10); // 100 fps
    }
    pause() {
        clearInterval(this.drawTimer);
        this.drawTimer = null;
    }
    step() {
        const now = new Date().getTime();
        const dt = now - this.lastT;
        this.lastT = now;

        this.ball.step(dt);
        this.paddle.step(dt);
        this.paddleBallInteraction();
        this.ballBrickInteraction();

        this.clear();
        this.draw(dt);
    }
    paddleBallInteraction() {
        // Interactions between multiple game objects
        // Is the ball overlapping the paddle?
        if (
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + Paddle.width &&
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y < this.paddle.y + Paddle.height &&
            // Only bounce if the ball is moving downwards! This prevents the ball from getting trapped inside the paddle if you move over it from the edge.
            this.ball.motions.linear.dy > 0
        ) {
            this.ball.motions.linear.bounceY();
        }
    }
    ballBrickInteraction() {
        // Is the ball overlapping a brick?
        // Convert ball position in to unit brick coordinate system.
        if (this.ball.y < 110) {
            let brickCoordY =
                (this.ball.y - Game.brickOffsetTop) /
                (Brick.height + Brick.padding);
            let brickCoordX =
                (this.ball.x - Game.brickOffsetLeft) /
                (Brick.width + Brick.padding);
            // Does a brick exist here?
            if (
                this.bricks[Math.floor(brickCoordX)] &&
                this.bricks[Math.floor(brickCoordX)][Math.floor(brickCoordY)]
            ) {
                let candidateBrick = this.bricks[Math.floor(brickCoordX)][
                    Math.floor(brickCoordY)
                ];
                // The actual brick only occupies the first part of the brick coordinate that isn't padding.
                // Now that we know which brick is a potential hit, we may as well switch back to canvas coordinates to
                // keep the math simple.
                // The left and top edges are guaranteed to be overlapping at this point, so we only need to worry about the right and bottom edges.
                if (
                    !candidateBrick.isHit &&
                    this.ball.x < candidateBrick.x + Brick.width &&
                    this.ball.y < candidateBrick.y + Brick.height
                ) {
                    // We hit! Mark the brick as struck so that we won't continue to render it or consider it for collisions, and bounce the ball.
                    candidateBrick.isHit = true;
                    this.ball.motions.linear.bounceY();
                    this.score.incrementScore();

                    // It's unsatisfying to display the victory message
                    // before drawing the empty final brick, so defer execution
                    // of this until after we've finished drawing.
                    setTimeout(() => {
                        if (this.weHaveWon()) {
                            this.clear();
                            alert("Congratulations! You win!");
                        }
                    }, 100);
                }
            }
        }
    }
    weHaveWon() {
        for (let i = 0; i < this.bricks.length; i++) {
            const col = this.bricks[i];
            for (let j = 0; j < col.length; j++) {
                const brick = col[j];
                if (!brick.isHit) {
                    return false;
                }
            }
        }
        return true;
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(dt: number) {
        this.ball.draw();
        this.paddle.draw();
        this.bricks.forEach(col =>
            col.forEach(brick => {
                if (!brick.isHit) {
                    brick.draw();
                }
            })
        );
        this.score.draw();
        if (window.DEBUG) {
            showCoords(this.ctx);
        }
    }
    keyDownHandler = (key: KeyboardEvent) => {
        if (key.key === "ArrowRight") {
            this.rightKeyPressed = true;
        } else if (key.key === "ArrowLeft") {
            this.leftKeyPressed = true;
        } else if (key.key === " ") {
            if (this.drawTimer) {
                this.pause();
            } else {
                this.start();
            }
        } else {
            if (window.DEBUG) {
                console.log("key pressed: ", key.key);
            }
        }
        this.updateControlled();
    };
    keyUpHandler = (key: KeyboardEvent) => {
        if (key.key === "ArrowRight") {
            this.rightKeyPressed = false;
        } else if (key.key === "ArrowLeft") {
            this.leftKeyPressed = false;
        }
        this.updateControlled();
    };
    clickHandler = (mouseevent: MouseEvent) => {
        if (window.DEBUG) {
            console.log("mouseevent: ", mouseevent);
            const rect = this.canvas.getBoundingClientRect();
            const x = mouseevent.clientX - rect.left;
            const y = mouseevent.clientY - rect.top;
            if (x < this.canvas.width && y < this.canvas.height) {
                this.ball.setPosition(x, y);
            }
        }
    };
    updateControlled() {
        if (this.rightKeyPressed && this.leftKeyPressed) {
            // If both keys are pressed, don't move the paddle.
            this.paddle.motions.linear = null;
        } else if (this.rightKeyPressed) {
            this.paddle.motions.linear = new LinearMotion(
                this.paddle,
                7 / 10,
                0
            );
        } else if (this.leftKeyPressed) {
            this.paddle.motions.linear = new LinearMotion(
                this.paddle,
                -7 / 10,
                0
            );
        } else {
            this.paddle.motions.linear = null;
        }
    }
}

// The game framework

abstract class CanvasObject {
    motions: {
        linear?: LinearMotion;
    };
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.ctx = ctx;
        this.setPosition(x, y);
        this.motions = {};
    }
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    step(dt: number) {
        if (this.motions.linear) {
            let [x, y] = this.motions.linear.calculatePositionChange(
                this.x,
                this.y,
                dt
            );
            this.setPosition(x, y);
        }
    }
    abstract draw(): void;
}

interface Motion {
    calculatePositionChange: (
        x: number,
        y: number,
        dt: number
    ) => [number, number];
}

class LinearMotion {
    dx: number;
    dy: number;
    constructor(obj: CanvasObject, dx: number, dy: number) {
        this.setVelocity(dx, dy);
    }
    setVelocity(dx: number, dy: number) {
        this.dx = dx;
        this.dy = dy;
    }
    bounceX() {
        this.setVelocity(-this.dx, this.dy);
    }
    bounceY() {
        this.setVelocity(this.dx, -this.dy);
    }
    calculatePositionChange(
        x: number,
        y: number,
        dt: number
    ): [number, number] {
        return [x + this.dx * dt, y + this.dy * dt];
    }
}

// The game objects

class Ball extends CanvasObject {
    ballHitBottomCallback: () => void;
    constructor(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        ballHitBottomCallback: () => void
    ) {
        super(ctx, x, y);
        this.ballHitBottomCallback = ballHitBottomCallback;
    }
    radius = 10;
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }

    overlaps(x: number, y: number) {
        // A circle overlaps the given point if it's within the
        // radius of our center point.
        // TODO: Implement this.
    }

    step(dt: number) {
        super.step(dt);
        this.bounceFromBoundaries();
    }

    bounceFromBoundaries() {
        const lm = this.motions.linear;
        // Note: be careful not to only consider proximity to the edge,
        // as the ball can become stuck if it somehow gets too close.
        // left edge, moving left
        if (this.x < this.radius && lm.dx < 0) {
            lm.bounceX();
        }
        // right edge, moving right
        if (this.x + this.radius >= this.ctx.canvas.width && lm.dx > 0) {
            lm.bounceX();
        }
        // top edge, moving up
        if (this.y < this.radius && lm.dy < 0) {
            lm.bounceY();
        }
        // bottom edge, moving down
        if (this.y + this.radius >= this.ctx.canvas.height && lm.dy > 0) {
            lm.bounceY();
            this.ballHitBottomCallback();
        }
    }
}

class Paddle extends CanvasObject {
    static height = 10;
    static width = 75;

    step(dt: number) {
        super.step(dt);
        // The paddle isn't allowed to move past the edges.
        if (this.x + Paddle.width > this.ctx.canvas.width) {
            this.x = this.ctx.canvas.width - Paddle.width;
        } else if (this.x < 0) {
            this.x = 0;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, Paddle.width, Paddle.height);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }
}

class Brick extends CanvasObject {
    static width = 75;
    static height = 20;
    static padding = 10;
    isHit: boolean = false;
    draw() {
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, Brick.width, Brick.height);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }
}

class Score extends CanvasObject {
    score: number = 0;
    incrementScore() {
        this.score += 10;
    }
    draw() {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fillText("Score: " + this.score.toString(), this.x, this.y);
    }
}

// Debugging graph.

function showCoords(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "8px Sans";
    ctx.lineWidth = 1;
    for (let i = 20; i < ctx.canvas.width; i += 20) {
        ctx.fillText(i.toString(), i, 10);
        drawLine(ctx, i, 20, i, ctx.canvas.height);
    }
    for (let j = 0; j < ctx.canvas.height; j += 20) {
        ctx.fillText(j.toString(), 0, j);
        drawLine(ctx, 0, j, ctx.canvas.width, j);
    }
}

function drawLine(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    u: number,
    v: number
) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(u, v);
    ctx.stroke();
}
