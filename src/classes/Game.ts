export class Game {
    ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }
    start() {
        console.log("game started");
        showCoords(this.ctx);
        renderRect(this.ctx);
        renderCirc(this.ctx);
        renderBlueRect(this.ctx);
    }
}

function showCoords(ctx: CanvasRenderingContext2D) {
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

function renderRect(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(20, 40, 50, 50);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function renderCirc(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(240, 160, 20, 0, Math.PI * 2, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
}

function renderBlueRect(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.rect(160, 10, 100, 40);
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.stroke();
    ctx.closePath();
}
