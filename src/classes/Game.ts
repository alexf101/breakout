import { number } from "prop-types";

export class Game {
    ctx: CanvasRenderingContext2D;
    drawTimer: number;
    canvas: HTMLCanvasElement;
    ball: TheBall;
    t: number;
    lastT: number;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.reset();
    }
    reset() {
        this.ball = new TheBall(
            this.ctx,
            this.canvas.width / 2,
            this.canvas.height - 30
        );
        this.ball.motions.linear = new LinearMotion(this.ball, 2 / 10, -2 / 10);
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
        this.clear();
        this.draw(dt);
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(dt: number) {
        this.ball.draw();
        drawRect(this.ctx);
        drawBlueRect(this.ctx);
        showCoords(this.ctx);
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
        if (this.x < this.radius) {
            lm.setVelocity(-lm.dx, lm.dy);
        }
        if (this.x + this.radius >= this.ctx.canvas.width) {
            lm.setVelocity(-lm.dx, lm.dy);
        }
        if (this.y < this.radius) {
            lm.setVelocity(lm.dx, -lm.dy);
        }
        if (this.y + this.radius >= this.ctx.canvas.height) {
            lm.setVelocity(lm.dx, -lm.dy);
        }
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

function drawRect(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(20, 40, 50, 50);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function drawBlueRect(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(160, 10, 100, 40);
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.stroke();
    ctx.closePath();
}
