const canvasStates = new Map();
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const IMAGE_PATH = "./images/gallery/";
const imageList = [
    { src: "blaze.jpg", title: "Techtonic Activities", creationDate: "2025" },
    { src: "griddy.jpg", title: "Griddy in Motion", creationDate: "2025" },
    { src: "inazuma.png", title: "Peak kicks Trash into oblivion", creationDate: "2025", sculpture: true },
    { src: "thomas.jpg", title: "Portrait of a Lady On Fire", creationDate: "2025" },
    { src: "reddit.png", title: "Reddit, as fortold", creationDate: "2025" },
    { src: "brutalist.png", title: "Rodin's Brutalist Thinker", creationDate: "2025", sculpture: true }
];
const npcClassLabels = [
    "george.png",
    "george_artist.png",
    "george_cow.png",
    "george_worhol.png",
    "george_minecraft.png"
];

function loadImage(src, onload) {
    const img = new Image();

    if (onload) img.onload = onload;
    img.onerror = () => console.error("Failed to load image:", src);
    img.src = src;
    return img;
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function createCanvasState(canvas, imageIdx) {
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    let entities = new Set();
    let categories = new Map();
    let entityArray = [];
    let running = false;
    let rafId = null;
    let gamePaused = false;
    let npcSpawnTimer = 0;

    class Entity {
        constructor() {
            this.z = 0;
            this.categories = new Set();
        }
        run() {}
        draw() {}
    }

    function add(entity) {
        if (entities.has(entity)) return entity;

        entities.add(entity);
        entityArray.push(entity);

        for (const cat of entity.categories) {
            if (!categories.has(cat)) categories.set(cat, new Set());
            categories.get(cat).add(entity);
        }

        return entity;
    }

    function remove(entity) {
        if (!entities.delete(entity)) return;
        entityArray.splice(entityArray.indexOf(entity), 1);

        for (const cat of entity.categories) {
            categories.get(cat)?.delete(entity);
        }
    }

    function category(name) {
        return categories.get(name) || new Set();
    }

    function drawRope() {
        const poles = [...category("pole")];
        if (poles.length < 2) return;
        ctx.save();
        ctx.beginPath();
        const SAG_HEIGHT = 30;
        poles.forEach((pole, i) => {
            const x = pole.x;
            const y = pole.y - pole.height * 1.25;

            if (i === 0) {
                ctx.moveTo(x, y);
                return;
            }

            const previous = poles[i - 1];
            const midX = (previous.x + x) / 2;
            const midY = (previous.y - previous.height + y) / 2 + SAG_HEIGHT;

            ctx.quadraticCurveTo(midX, midY, x, y);
        });

        ctx.strokeStyle = "#d22";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#a00";
        ctx.stroke();
        ctx.restore();
    }

    function render(update = true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        entityArray.sort((a, b) => a.z - b.z);
        for (const entity of [...entityArray]) {
            if (!entities.has(entity)) continue;

            if (update && !gamePaused) {
                entity.run();
            }

            if (entities.has(entity)) {
                entity.draw();
            }
        }
        drawRope();
    }

    function drawOnce() {
        render(false);
    }

    function draw() {
        if (!running) return;
        render(true);
        rafId = requestAnimationFrame(draw);
    }

    function startDrawLoop() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(draw);
    }

    function stopDrawLoop() {
        running = false;
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    class CenterPiece extends Entity {
        constructor(onload) {
            super();
            const metadata = imageList[imageIdx];
            this.cx = CANVAS_WIDTH / 2;
            this.cy = CANVAS_HEIGHT / 2 - 100;
            this.frameW = 40;
            this.photoW = 180;
            this.photoH = 240;
            this.numPoles = 3;
            this.currentImage = metadata.src;
            this.title = metadata.title;
            this.creationDate = metadata.creationDate;

            this.imageSprite = loadImage(IMAGE_PATH + this.currentImage,
                () => {
                    this.updatePhotoSize();
                    updateResponsiveEntities();
                    onload?.();
                }
            );
        }

        updatePhotoSize() {
            const img = this.imageSprite;
            if (!img.naturalWidth || !img.naturalHeight) return;

            const maxW = 700;
            const maxH = 450;

            const aspect = img.naturalWidth / img.naturalHeight;

            if (aspect < 1) {
                this.photoH = maxH;
                this.photoW = Math.min(maxW, maxH * aspect);
            } else {
                this.photoW = maxW;
                this.photoH = Math.min(maxH, maxW / aspect);
            }

            this.numPoles = Math.floor(Math.random() * 5) + 3;
        }

        run() {
            npcSpawnerLoop();
        }

        setImage(imgName) {
            if (this.currentImage === imgName) return;

            this.currentImage = imgName;

            const metadata = imageList.find(img => img.src === imgName);

            if (metadata) {
                this.title = metadata.title;
                this.creationDate = metadata.creationDate;
            }

            this.imageSprite = loadImage(IMAGE_PATH + imgName, () => {
                this.updatePhotoSize();
                updateResponsiveEntities();
                drawOnce();
            });
        }
    }


    class FramedPhoto extends CenterPiece {
        constructor(onload) {
            super(onload);

            this.frameImg = loadImage(IMAGE_PATH + "frame.png", onload);
        }

        draw() {
            const { cx, cy, photoW, photoH, frameW } = this;

            if (!this.imageSprite.complete || !this.imageSprite.naturalWidth) return;
            ctx.save();
            ctx.drawImage(this.imageSprite, cx - photoW / 2, cy - photoH / 2, photoW, photoH);
            if (this.frameImg.complete && this.frameImg.naturalWidth) {
                const outerW = photoW + frameW * 2;
                const outerH = photoH + frameW * 2;
                ctx.drawImage(this.frameImg, cx - outerW / 2, cy - outerH / 2, outerW, outerH);
            }

            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.filter = "blur(10px)";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 20;
            ctx.strokeRect(cx - photoW / 2 + 5, cy - photoH / 2 + 5, photoW - 10, photoH - 10);
            ctx.restore();
            ctx.restore();
        }
    }


    class StandSculpture extends CenterPiece {
        constructor(onload) {
            super(onload);
            this.cy = CANVAS_HEIGHT / 2 - 40;
            this.pedestalImg = loadImage(IMAGE_PATH + "pedestal.png", onload);
        }

        draw() {
            const { cx, cy, photoW, photoH } = this;
            if (!this.imageSprite.complete || !this.imageSprite.naturalWidth) return;
            ctx.save();
            const pedestalW = photoW;
            const pedestalH = this.pedestalImg.naturalWidth ? this.pedestalImg.naturalHeight / this.pedestalImg.naturalWidth * (pedestalW / 1.5) : 0;
            if (this.pedestalImg.complete && this.pedestalImg.naturalWidth) {
                ctx.drawImage(this.pedestalImg, cx - pedestalW / 2, cy + photoH / 2 - pedestalH, pedestalW, pedestalH);
            }
            ctx.drawImage(this.imageSprite, cx - photoW / 2, cy - photoH / 3 - pedestalH, photoW, photoH);
            ctx.restore();
        }
    }

    class Pole extends Entity {
        static image = loadImage(IMAGE_PATH + "pole.png");
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
            this.width = 32;
            this.height = 120;
            this.categories.add("pole");
        }

        draw() {
            const img = Pole.image;
            if (!img.complete || !img.naturalWidth) return;
            const scale = 2;
            const drawH = this.height * scale;
            const drawW = drawH * img.naturalWidth / img.naturalHeight;
            ctx.drawImage(img, this.x - drawW / 2, this.y - drawH + 50, drawW, drawH);
        }
    }

    class NPC extends Entity {
        constructor(startX, startY, stopX, stopY, imageName) {
            super();
            this.x = startX;
            this.y = startY;
            this.stopX = stopX;
            this.stopY = stopY;
            this.exitX = null;
            this.exitY = null;
            this.radius = randomRange(50, 60);
            this.speed = randomRange(2, 3.5);

            this.state = "walking";
            this.timer = 0;
            this.walkPhase = Math.random() * Math.PI * 2;
            this.wobbleMag = randomRange(4, 6);
            this.imageSprite = loadImage(IMAGE_PATH + imageName);
            this.z = 10000;
            this.categories.add("npc");
        }

        moveTowards(targetX, targetY) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 2) return true;
            this.x += dx / distance * this.speed;
            this.y += dy / distance * this.speed;

            return false;
        }

        run() {
            if (this.state === "walking" || this.state === "leaving") {
                this.walkPhase += 0.2;
            }

            if (this.state === "walking") {
                if (this.moveTowards(this.stopX, this.stopY)) {
                    this.state = "watching";
                    this.timer = randomRange(60, 180);
                }
            }

            else if (this.state === "watching") {
                this.timer--;
                if (this.timer <= 0) {
                    this.state = "leaving";
                    this.exitX = Math.random() < 0.5 ? -100 : CANVAS_WIDTH + 100;
                    this.exitY = this.y + randomRange(-30, 30);
                }
            }

            else if (this.state === "leaving") {
                if (this.moveTowards(this.exitX, this.exitY)) {
                    remove(this);
                }
            }
        }

        draw() {
            const img = this.imageSprite;
            if (!img.complete || !img.naturalWidth) return;
            const moving = this.state !== "watching";
            const wobbleX = moving ? Math.sin(this.walkPhase) * this.wobbleMag : 0;
            const wobbleY = moving ? Math.cos(this.walkPhase) * this.wobbleMag * 0.3 : 0;
            const facingLeft = this.state === "leaving" ? this.exitX < this.x : this.stopX < this.x;
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.setTransform(facingLeft ? -1 : 1, 0, 0, 1, this.x + this.radius, this.y);
            ctx.drawImage(img, wobbleX - this.radius, wobbleY - this.radius, this.radius * 2, this.radius * 2);
            ctx.restore();
        }
    }

    function spawnNPC() {
        const fromLeft = Math.random() < 0.5;
        const startX = fromLeft ? -60 : CANVAS_WIDTH + 60;
        const startY = CANVAS_HEIGHT / 2 + 180 + randomRange(-40, 40);
        const stopX = CANVAS_WIDTH / 2 + randomRange(-60, 60);
        const stopY = CANVAS_HEIGHT / 2 + 180 + randomRange(-15, 15);

        const imageName = npcClassLabels[Math.floor(Math.random() * npcClassLabels.length)];
        add(new NPC(startX, startY, stopX, stopY, imageName));
    }

    function npcSpawnerLoop() {
        if (npcSpawnTimer <= 0) {
            spawnNPC();
            npcSpawnTimer = randomRange(120, 300);
        } else {
            npcSpawnTimer--;
        }
    }

    const ArtWork = imageList[imageIdx].sculpture ? add(new StandSculpture(drawOnce)) : add(new FramedPhoto(drawOnce));

    function updateResponsiveEntities() {
        ArtWork.cx = CANVAS_WIDTH / 2;
        ArtWork.cy = imageList[imageIdx].sculpture ? CANVAS_HEIGHT / 2 - 40 : CANVAS_HEIGHT / 2 - 100;
        for (const pole of [...category("pole")]) {
            remove(pole);
        }

        const count = ArtWork.numPoles || 3;
        const y = CANVAS_HEIGHT / 2 + 230;

        for (let i = 0; i < count; i++) {
            const spacing = CANVAS_WIDTH / (count + 1);
            add(new Pole(spacing * (i + 1), y));
        }
    }

    const state = {
        canvas,
        ctx,
        entities,
        categories,
        entityArray,
        add,
        remove,
        category,
        ArtWork,
        imageIdx,
        updateResponsiveEntities,
        drawOnce,
        startDrawLoop,
        stopDrawLoop,

        get GAME_PAUSED() {
            return gamePaused;
        },

        set GAME_PAUSED(value) {
            gamePaused = value;
        }
    };

    return state;
}

function getAllCanvases() {
    return [...document.getElementsByTagName("canvas")];
}

function init_gallery() {
    const canvases = getAllCanvases();

    canvases.forEach((canvas, idx) => {
        const imageIdx = idx % imageList.length;
        const state = createCanvasState(canvas, imageIdx);
        canvasStates.set(canvas, state);
        state.startDrawLoop();
    });

    resize();
}


function resize() {
    const windowRatio = innerWidth / innerHeight;
    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    let width, height;

    if (windowRatio <= canvasRatio) {
        width = innerWidth;
        height = width / canvasRatio;
    } else {
        height = innerHeight;
        width = height * canvasRatio;
    }

    for (const state of canvasStates.values()) {
        state.updateResponsiveEntities();
        state.drawOnce();
    }
}

window.addEventListener("resize", resize);

window.addEventListener("contextmenu", event => {
    event.preventDefault();
});

init_gallery();