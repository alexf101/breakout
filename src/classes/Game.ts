import { number } from "prop-types";

export class Game {
    ctx: CanvasRenderingContext2D;
    drawTimer: number;
    canvas: HTMLCanvasElement;
    ball: TheBall;
    t: number;
    lastT: number;
    rightKeyPressed: boolean = false;
    leftKeyPressed: boolean = false;
    paddle: ThePaddle;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.reset();
        document.addEventListener("keydown", this.keyDownHandler, false);
        document.addEventListener("keyup", this.keyUpHandler, false);
    }
    teardown() {
        document.removeEventListener("keydown", this.keyDownHandler, false);
        document.removeEventListener("keyup", this.keyUpHandler, false);
    }
    ballHitBottom = () => {
        this.pause();
    };
    reset() {
        this.ball = new TheBall(
            this.ctx,
            this.canvas.width / 2,
            this.canvas.height - 100,
            this.ballHitBottom
        );
        this.ball.motions.linear = new LinearMotion(this.ball, 2 / 10, -2 / 10);
        this.paddle = new ThePaddle(
            this.ctx,
            (this.canvas.width - 10) / 2,
            this.ctx.canvas.height - 75
        );
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

        // Interactions between multiple game objects
        // Is the ball overlapping the paddle?
        if (
            this.ball.x + this.ball.radius > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width &&
            this.ball.y + this.ball.radius >
                this.paddle.y + this.paddle.height &&
            this.ball.y < this.paddle.y + this.paddle.height &&
            // Only bounce if the ball is moving downwards! This prevents the ball from getting trapped inside the paddle if you move over it from the edge.
            this.ball.motions.linear.dy > 0
        ) {
            this.ball.motions.linear.bounceY();
        }

        this.clear();
        this.draw(dt);
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(dt: number) {
        this.ball.draw();
        this.paddle.draw();
        drawBlueRect(this.ctx);
        showCoords(this.ctx);
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
            if ((window as any).DEBUG) {
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

function showCoords(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "8px";
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

class TheBall extends CanvasObject {
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

class ThePaddle extends CanvasObject {
    height = 10;
    width = 75;

    step(dt: number) {
        super.step(dt);
        // The paddle isn't allowed to move past the edges.
        if (this.x + this.width > this.ctx.canvas.width) {
            this.x = this.ctx.canvas.width - this.width;
        } else if (this.x < 0) {
            this.x = 0;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
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

function drawBlueRect(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(160, 10, 100, 40);
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.stroke();
    ctx.closePath();
}
