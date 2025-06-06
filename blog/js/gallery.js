   
// --- Multi-canvas support ---

// Store per-canvas state
const canvasStates = new Map();
const imageList = [
    { src: "blaze.jpg", title: "Techtonic Activities", creationDate: "2025" },
    { src: "griddy.jpg", title: "Griddy in Motion", creationDate: "2025" },
    { src: "inazuma.png", title: "Peak kicks Trash into oblivion", creationDate: "2025", sculpture: true },
    { src: "thomas.jpg", title: "Portrait of a Lady On Fire", creationDate: "2025" },
    { src: "reddit.png", title: "Reddit, as fortold", creationDate: "2025" },
    { src: "brutalist.png", title: "Rodin's Brutalist Thinker", creationDate: "2025", sculpture: true }
];
let imageSculptures = imageList.filter(img => img.sculpture).length;

// Utility to get all canvases (including .g and any others)
function getAllCanvases() {
    return Array.from(document.getElementsByTagName('canvas'));
}

// Per-canvas state structure
function createCanvasState(canvas, imageIdx) {
    const ctx = canvas.getContext("2d");
    const CANVAS_WIDTH = 1280;
    const CANVAS_HEIGHT = 720;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    MOUSE_DOWN = false;
    MOUSE_RIGHT_DOWN = false;
    MOUSE_POSITION = { x: 0, y: 0 };

    // Per-canvas entity management
    let entities = new Set();
    let categories = new Map();
    let entityArray = [];
    let GAME_PAUSED = false;

    // General Entity class
    class Entity {
        constructor() {
            this.z = 0;
            this.categories = new Set();
        }
        run() {}
        draw() {}
    }

    class centerPiece extends Entity {
        constructor(drawOnceCallback) {
            super();
            this.cx = canvas.width / 2;
            this.cy = canvas.height / 2 - 40;
            this.frameW = 40;
            this.imageSprite = new Image();
            this.currentImage = imageList[imageIdx].src;
            this.imageSprite.src = "./images/" + this.currentImage;
            this.photoW = 180;
            this.photoH = 240;
            this.title = imageList[imageIdx].title;
            this.creationDate = imageList[imageIdx].creationDate;
            this.isHover = false;
            // Redraw canvas when image loads
            this.imageSprite.onload = () => {
                this.updatePhotoSize();
                updateResponsiveEntities();
                if (drawOnceCallback) drawOnceCallback();
            };
        }
        updatePhotoSize() {
            // Set photoW and photoH based on image aspect ratio, keeping max height = 500, max width = 500
            const maxH = 450;
            const maxW = 700;
            let iw = this.imageSprite.naturalWidth;
            let ih = this.imageSprite.naturalHeight;
            if (iw && ih) {
                let aspect = iw / ih;
                if (ih >= iw) {
                    this.photoH = maxH;
                    this.photoW = Math.min(maxW, maxH * aspect);
                } else {
                    this.photoW = maxW;
                    this.photoH = Math.min(maxH, maxW / aspect);
                }
            }
            this.numPoles = Math.floor(Math.random() * 5) + 3; // Random number of poles between 3 and 6
        }
        run() {
            npcSpawnerLoop();
        }
        setImage(imgName) {
            if (this.currentImage === imgName) return;
            this.currentImage = imgName;
            this.imageSprite = new Image();
            this.imageSprite.onload = () => {
                this.updatePhotoSize();
                if (state && state.drawOnce) state.drawOnce();
            };
            this.imageSprite.src = "./images/" + imgName;
            const meta = imageList.find(img => img.src === imgName);
            if (meta) {
                this.title = meta.title;
                this.creationDate = meta.creationDate;
            }
        }
    }
        // Per-canvas FramedPhoto
    class FramedPhoto extends centerPiece {
        constructor(drawOnceCallback) {
            super(drawOnceCallback);
            this.cx = canvas.width / 2;
            this.cy = canvas.height / 2 - 100;
            this.pedestalImg = new Image();
            this.pedestalImg.src = "./images/pedestal.png";
            this.title = imageList[imageIdx].title;
            this.creationDate = imageList[imageIdx].creationDate;
            this.frameImg = new Image();
            this.frameImg.src = "./images/frame.png";
            this.frameImg.onload = () => {
                if (drawOnceCallback) drawOnceCallback();
            };
            // --- Zoom state ---
            this.zoomed = false;
            this.zoomOrigin = { x: 0, y: 0 };
        }
        draw() {
            // --- Zoom logic ---
            
            if (this.zoomed) {
                // Zoom in, center on zoomOrigin
                const zoomScale = 2.2;
                ctx.save();
                ctx.translate(
                    canvas.width / 2,
                    canvas.height / 2
                );
                ctx.scale(zoomScale, zoomScale);
                ctx.translate(
                    -(this.zoomOrigin.x),
                    -(this.zoomOrigin.y)
                );
            }
            const cx = this.cx, cy = this.cy, photoW = this.photoW, photoH = this.photoH, frameW = this.frameW;
            ctx.save();
            ctx.beginPath();
            ctx.rect(cx - photoW/2, cy - photoH/2, photoW, photoH);
            if (this.imageSprite.complete && this.imageSprite.naturalWidth > 0) {
                ctx.drawImage(this.imageSprite, cx - photoW/2, cy - photoH/2, photoW, photoH);
                if (this.frameImg.complete && this.frameImg.naturalWidth > 0) {
                    let frameOuterW = photoW + 2 * frameW;
                    let frameOuterH = photoH + 2 * frameW;
                    ctx.drawImage(
                        this.frameImg,
                        cx - frameOuterW / 2,
                        cy - frameOuterH / 2,
                        frameOuterW,
                        frameOuterH
                    );
                }
            }
            ctx.save();
            let shadowSize = 10;
            ctx.globalAlpha = 0.45;
            ctx.filter = `blur(10px)`;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = shadowSize * 2;
            ctx.strokeRect(cx - photoW/2 + shadowSize/2, cy - photoH/2 + shadowSize/2, photoW - shadowSize, photoH - shadowSize);
            ctx.filter = "none";
            ctx.globalAlpha = 1.0;
            ctx.restore();
            ctx.restore();
            // --- End zoom logic ---
            if (this.zoomed) {
                ctx.restore();
            }
        }
    }

    class standSculpture extends centerPiece {
        constructor(drawOnceCallback) {
            super();
            this.cx = canvas.width / 2;
            this.cy = canvas.height / 2 - 100;
            this.pedestalImg = new Image();
            this.pedestalImg.src = "./images/pedestal.png";
            this.title = imageList[imageIdx].title;
            this.creationDate = imageList[imageIdx].creationDate;
            this.pedestalImg.onload = () => {
                if (drawOnceCallback) drawOnceCallback();
            };
            // --- Zoom state ---
            this.zoomed = false;
            this.zoomOrigin = { x: 0, y: 0 };
        }
        
        draw() {
            // --- Zoom logic ---
            if (this.zoomed) {
                const zoomScale = 2.2;
                ctx.save();
                ctx.translate(
                    canvas.width / 2,
                    canvas.height / 2
                );
                ctx.scale(zoomScale, zoomScale);
                ctx.translate(
                    -(this.zoomOrigin.x),
                    -(this.zoomOrigin.y)
                );
            }
            const cx = this.cx, cy = this.cy, photoW = this.photoW, photoH = this.photoH, frameW = this.frameW;
            ctx.save();
            const pedestalW = photoW;
            const pedestalH = this.pedestalImg.naturalHeight / this.pedestalImg.naturalWidth * (pedestalW / 1.5);
            // Draw pedestal first, then sculpture on top
            if (this.pedestalImg.complete && this.pedestalImg.naturalWidth > 0) {
                // Pedestal width matches sculpture width, height is proportional
                ctx.drawImage(
                    this.pedestalImg,
                    cx - pedestalW / 2,
                    cy + photoH / 2 - pedestalH,
                    pedestalW,
                    pedestalH
                );
            }
            ctx.beginPath();
            if (this.imageSprite.complete && this.imageSprite.naturalWidth > 0) {
                ctx.drawImage(this.imageSprite, cx - photoW/2, cy - photoH/3 - pedestalH, photoW, photoH);
            }
            ctx.restore();
            // --- End zoom logic ---
            if (this.zoomed) {
                ctx.restore();
            }
        }
    }

    class Pole extends Entity {
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
            this.height = 120;
            this.width = 32;
            if (!Pole.poleImg) {
                Pole.poleImg = new Image();
                Pole.poleImg.src = "./images/pole.png";
                Pole.poleImg.onload = () => {
                    Pole.poleImgLoaded = true;
                    if (state && state.drawOnce) state.drawOnce();
                };
            }
            this.categories.add("pole");
        }
        run() {}
        draw() {
            ctx.save();
            if (ArtWork && ArtWork.zoomed) return
            if (Pole.poleImg && Pole.poleImg.complete && Pole.poleImg.naturalWidth > 0) {
                let img = Pole.poleImg;
                let scale = 2.0;
                let drawW = this.width;
                let drawH = this.height;
                if (img.naturalWidth && img.naturalHeight) {
                    let aspect = img.naturalWidth / img.naturalHeight;
                    drawH = this.height * scale;
                    drawW = this.height * aspect * scale;
                }
                ctx.drawImage(
                    img,
                    this.x - drawW / 2,
                    this.y - drawH + 50,
                    drawW,
                    drawH
                );
            }
            ctx.restore();
        }
    }

    // Popup class for painting details
    class PaintingPopup extends Entity {
        constructor() {
            super();
            this.visible = false;
            this.x = 0;
            this.y = 0;
            this.meta = null;
        }
        show(x, y, meta) {
            this.visible = true;
            this.x = x;
            this.y = y;
            this.meta = meta;
        }
        hide() {
            this.visible = false;
        }
        draw(ctx) {
            // Hide popup if zoomed in
            if (!this.visible || !this.meta || (ArtWork && ArtWork.zoomed)) return;
            const popupWidth = ctx.measureText(this.meta.title).width * 2 + 24;
            const popupHeight = 80;
            let px = this.x;
            let py = this.y;
            
            ctx.textAlign = "left";
            if (px + popupWidth > canvas.width) px = canvas.width - popupWidth - 10;
            if (py + popupHeight > canvas.height) py = canvas.height - popupHeight - 10;

            ctx.save();
            ctx.fillStyle = "#000";
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = 2;
            ctx.translate(px, py);
            ctx.scale(1.5, 1.5);
            ctx.beginPath();
            ctx.rect(0, 0, popupWidth, popupHeight);
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px Georgia, serif";
            ctx.fillText(this.meta.title, 12, 26);
            ctx.font = "italic 14px Georgia, serif";
            ctx.fillText("Created: " + this.meta.creationDate, 12, 48);
            ctx.font = "12px Georgia, serif";
            let imageLength = (imageList[imageIdx].sculpture) ? imageSculptures : (imageList.length - imageSculptures);
            let falseIndicies = imageList.slice(0, imageIdx + 1).filter(item => !item.sculpture).length
            let indices = imageList.slice(0, imageIdx + 1).filter(item => item.sculpture === true).length
            let currentLength = (imageList[imageIdx].sculpture) ? indices : falseIndicies;
            ctx.fillText(`${(imageList[imageIdx].sculpture) ? "Sculpture" : "Painting"} ${currentLength} / ${imageLength}`, 12, 66);
            ctx.restore();
        }
    }

    // Draw rope connecting pole tops
    function drawRopeBetweenPoles(poles) {
        // Hide poles if zoomed in
        if (ArtWork && ArtWork.zoomed) return;
        if (poles.length < 2) return;
        ctx.save();
        ctx.beginPath();
        // Start at first pole top
        let sag = 30; // pixels of sag
        for (let i = 0; i < poles.length; i++) {
            let pole = poles[i];
            let px = pole.x;
            let py = pole.y - pole.height * 1.25;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                // Sag between previous and current pole
                let prev = poles[i-1];
                let prevX = prev.x, prevY = prev.y - prev.height;
                let midX = (prevX + px) / 2;
                let midY = (prevY + py) / 2 + sag;
                ctx.quadraticCurveTo(midX, midY, px, py);
            }
        }
        ctx.strokeStyle = "#d22";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#a00";
        ctx.stroke();
        ctx.restore();
    }

    // Per-canvas add/remove/category
    function category(cat) {
        return categories.get(cat) || [];
    }
    function remove(entity) {
        entities.delete(entity);
        for (const category of entity.categories) {
            if (categories.has(category)) {
                categories.get(category).delete(entity);
            }
        }
        const index = entityArray.indexOf(entity);
        if (index >= 0) entityArray.splice(index, 1);
    }
    function add(entity) {
        if (entities.has(entity)) return;
        entities.add(entity);
        entityArray.push(entity);
        for (const category of entity.categories) {
            if (!categories.has(category)) {
                categories.set(category, new Set([entity]));
            } else {
                categories.get(category).add(entity);
            }
        }
        return entity;
    }

    // Per-canvas popup
    const paintingPopup = new PaintingPopup();

    // Per-canvas FramedPhoto
    let ArtWork;
    // Draw loop for this canvas
    let running = false;
    let rafId = null;
    function draw() {
        if (!running) return;
        rafId = requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        entityArray.sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
        for (let i = 0; i < entityArray.length; i++) {
            if (!GAME_PAUSED) {
                entityArray[i].run();
            }
            if (!entityArray[i]) return;
            entityArray[i].draw();
        }
        drawRopeBetweenPoles(Array.from(category("pole")));
        paintingPopup.draw(ctx);
    }

    // Single-frame draw for static render (no animation)
    function drawOnce() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        entityArray.sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
        for (let i = 0; i < entityArray.length; i++) {
            entityArray[i].draw();
        }
        drawRopeBetweenPoles(Array.from(category("pole")));
        paintingPopup.draw(ctx);
    }

    // --- NPCs ---
    class NPC extends Entity {
        constructor(cx, cy, stopX, stopY, label) {
            super();
            this.x = cx;
            this.y = cy;
            this.z = 10000;
            this.stopX = stopX;
            this.stopY = stopY;
            this.radius = 50 + Math.random() * 10;
            this.imageSprite = new Image();
            this.currentImage = imageList[imageIdx].src;
            this.imageSprite.src = "./images/" + label; // Placeholder NPC image
            this.state = "walking"; // walking, watching, leaving
            this.timer = 0;
            this.speed = 2 + Math.random() * 1.5;
            this.categories.add("npc");
            this.walkPhase = Math.random() * Math.PI * 2; // randomize start
            this.wobbleMag = 4 + Math.random() * 2;
        }
        run() {
            // Advance walk phase for wobble
            if (this.state === "walking" || this.state === "leaving") {
                this.walkPhase += 0.18 + Math.random() * 0.03;
            }
            if (this.state === "walking") {
                // Move towards stopX, stopY
                let dx = this.stopX - this.x;
                let dy = this.stopY - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 2) {
                    this.state = "watching";
                    this.timer = 60 + Math.random() * 120; // watch for 1-3 seconds
                } else {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                }
            } else if (this.state === "watching") {
                this.timer--;
                if (this.timer <= 0) {
                    this.state = "leaving";
                    // Pick a random exit direction (left or right)
                    this.exitX = (Math.random() < 0.5) ? -100 : canvas.width + 100;
                    this.exitY = this.y + (Math.random() - 0.5) * 60;
                }
            } else if (this.state === "leaving") {
                let dx = this.exitX - this.x;
                let dy = this.exitY - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 2) {
                    // Remove self
                    remove(this);
                } else {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                }
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = 0.85;
            // Wobble offset for walking/leaving
            let wobbleX = 0, wobbleY = 0;
            if (this.state === "walking" || this.state === "leaving") {
                wobbleX = Math.sin(this.walkPhase) * this.wobbleMag;
                wobbleY = Math.cos(this.walkPhase) * (this.wobbleMag * 0.3);
            }
            ctx.beginPath();
            ctx.setTransform(
                (this.state != "leaving" && (this.stopX - this.x) < 1 || this.state == "leaving" && (this.stopX - this.x) > 1) ? -1 : 1, 0, // set the direction of x axis
                0, 1,   // set the direction of y axis
                this.x + this.radius, // set the x origin
                this.y + 0   // set the y origin
            );
            ctx.drawImage(
                this.imageSprite,
                wobbleX - this.radius,
                wobbleY - this.radius,
                this.radius * 2,
                this.radius * 2
            );
            ctx.restore();
        }
    }

    // --- NPC Spawner ---
    const npcClassLabels = [
        "george.png", "george_artist.png", "george_cow.png", "george_worhol.png", "george_minecraft.png"
    ];
    function spawnNPC() {
        // Pick a random side (left or right)
        const side = Math.random() < 0.5 ? "left" : "right";
        const startX = side === "left" ? -60 : canvas.width + 60;
        const startY = canvas.height / 2 + 180 + (Math.random() - 0.5) * 80;
        // Stop in front of the artwork, but randomize a bit
        const stopX = canvas.width / 2 + (Math.random() - 0.5) * 120;
        const stopY = canvas.height / 2 + 180 + (Math.random() - 0.5) * 30;
        const label = npcClassLabels[Math.floor(Math.random() * npcClassLabels.length)];
        add(new NPC(startX, startY, stopX, stopY, label));
    }

    // --- NPC spawn timer ---
    let npcSpawnTimer = 0;
    function npcSpawnerLoop() {
        // Only spawn if not zoomed in
        if (ArtWork && !ArtWork.zoomed) {
            if (npcSpawnTimer <= 0) {
                // Limit number of NPCs at once
                if ((category("npc").length || 0) < 4) {
                    spawnNPC();
                }
                npcSpawnTimer = 120 + Math.random() * 180; // 2-5 seconds
            } else {
                npcSpawnTimer--;
            }
        }
        // Remove all NPCs if zoomed in
        if (ArtWork && ArtWork.zoomed) {
            for (const npc of Array.from(category("npc"))) remove(npc);
        }
    }

    // Per-canvas ArtWork (must be after drawOnce is defined)
    if(imageList[imageIdx].sculpture) {
        ArtWork = add(new standSculpture(drawOnce));
    } else {
        ArtWork = add(new FramedPhoto(drawOnce));
    }

    // Responsive: update all entities on resize
    function updateResponsiveEntities() {
        ArtWork.cx = canvas.width / 2;
        ArtWork.cy = (imageList[imageIdx].sculpture) ?  canvas.height / 2 - 40 : canvas.height / 2 - 100;
        for (let pole of Array.from(category("pole"))) remove(pole);
        // Remove: for (let tri of Array.from(category("illuminati"))) remove(tri);
        // Use a default if numPoles is not set yet (e.g., before image loads)
        let NUM_POLES = ArtWork.numPoles || 3;
        let y = canvas.height / 2 + 230;
        for (let i = 0; i < NUM_POLES; i++) {
            let spacing = canvas.width / (NUM_POLES + 1);
            let x = spacing * (i + 1);
            add(new Pole(x, y));
        }
        // Remove: if (imageIdx == 0) {
        //     const cx = ArtWork.cx;
        //     const cy = ArtWork.cy;
        //     const baseSize = Math.min(ArtWork.photoW, ArtWork.photoH) * 0.6;
        //     let triangle = new IlluminatiTriangle(cx, cy, baseSize);
        //     triangle.size = baseSize;
        //     add(triangle);
        // }
    }

    // Animation control
    function startDrawLoop() {
        if (!running) {
            running = true;
            draw();
        }
    }
    function stopDrawLoop() {
        running = false;
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }
    // Remove doritos() function

    // Store state for this canvas
    state = {
        canvas, ctx, entities, categories, entityArray, GAME_PAUSED,
        add, remove, category, ArtWork, paintingPopup, updateResponsiveEntities,
        imageIdx, startDrawLoop, stopDrawLoop, drawOnce
    };
    return state;
}

// Setup all canvases on DOMContentLoaded
function init_gallery() {
    const canvases = getAllCanvases();
    canvases.forEach((cv, idx) => {
        const imgIdx = idx % imageList.length;
        const state = createCanvasState(cv, imgIdx);
        canvasStates.set(cv, state);

        // Draw each canvas once on load
        state.drawOnce();
    });
    resize();

    // --- IntersectionObserver for in-view animation ---
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const canvas = entry.target;
                const state = canvasStates.get(canvas);
                if (!state) continue;
                if (entry.isIntersecting) {
                    state.startDrawLoop();
                } else {
                    state.stopDrawLoop();
                }
            }
        }, {
            threshold: 0.05 // consider in view if at least 5% visible
        });
        canvases.forEach(cv => observer.observe(cv));
    } else {
        // Fallback: start all animations
        for (const state of canvasStates.values()) {
            state.startDrawLoop();
        }
    }
};

// --- Per-canvas input handlers ---
resize = () => {
    let windowWidth = innerWidth,
        windowHeight = innerHeight,
        availableRatio = windowWidth / windowHeight,
        canvasRatio = 1280 / 720,
        appliedWidth,
        appliedHeight;

    if (availableRatio <= canvasRatio) {
        appliedWidth = windowWidth;
        appliedHeight = appliedWidth / canvasRatio;
    } else {
        appliedHeight = windowHeight;
        appliedWidth = appliedHeight * canvasRatio;
    }

    // // Resize all containers with class "t"
    // const containers = document.getElementsByClassName('t');
    // for (let i = 0; i < containers.length; i++) {
    //     containers[i].style.width = appliedWidth * 0.9 + 'px';
    //     containers[i].style.height = appliedHeight * 0.9 + 'px';
    // }

    // Resize all canvases and update their entities
    for (const state of canvasStates.values()) {
        state.canvas.width = 1280;
        state.canvas.height = 720;
        state.updateResponsiveEntities();
        state.drawOnce(); // <-- render after resizing
    }
};
// Resize handler for all canvases
onresize = () => {
    resize();
};

// Mousemove, mousedown, and keydown handlers for all canvases
onmousemove = (evt) => {
    for (const state of canvasStates.values()) {
        const { canvas, ArtWork, paintingPopup, category, imageIdx } = state;
        const rect = canvas.getBoundingClientRect();
        const mx = (evt.clientX - rect.left) / rect.width * canvas.width;
        const my = (evt.clientY - rect.top) / rect.height * canvas.height;
        // Hover logic
        const cx = ArtWork.cx;
        const cy = ArtWork.cy;
        const photoW = ArtWork.photoW;
        const photoH = ArtWork.photoH;
        const isPhotoHover =
            mx >= cx - photoW / 2 &&
            mx <= cx + photoW / 2 &&
            my >= cy - photoH / 2 &&
            my <= cy + photoH / 2;
        const popupX = mx + 16;
        const popupY = my + 16;
        // Remove illuminati hover logic
        ArtWork.isHover = isPhotoHover;
        // --- Cursor logic ---
        if (isPhotoHover) {
            if (ArtWork.zoomed) {
                canvas.style.cursor = "zoom-out";
            } else {
                canvas.style.cursor = "zoom-in";
            }
        } else {
            canvas.style.cursor = "";
        }
        // --- Popup logic ---
        if (isPhotoHover && !ArtWork.zoomed) {
            paintingPopup.show(popupX, popupY, imageList[imageIdx]);
        } else {
            paintingPopup.hide();
        }
    }
};

onmousedown = (evt) => {
    // --- Artwork zoom on click ---
    for (const state of canvasStates.values()) {
        const { canvas, ArtWork } = state;
        const rect = canvas.getBoundingClientRect();
        const mx = (evt.clientX - rect.left) / rect.width * canvas.width;
        const my = (evt.clientY - rect.top) / rect.height * canvas.height;
        const cx = ArtWork.cx;
        const cy = ArtWork.cy;
        const photoW = ArtWork.photoW;
        const photoH = ArtWork.photoH;
        const isPhotoHover =
            mx >= cx - photoW / 2 &&
            mx <= cx + photoW / 2 &&
            my >= cy - photoH / 2 &&
            my <= cy + photoH / 2;
        if (isPhotoHover) {
            if (!ArtWork.zoomed) {
                ArtWork.zoomed = true;
                ArtWork.zoomOrigin = { x: mx, y: my };
                canvas.style.cursor = "zoom-out";
            } else {
                ArtWork.zoomed = false;
                canvas.style.cursor = "zoom-in";
            }
            state.drawOnce();
            evt.preventDefault();
        }
    }
};

oncontextmenu = (evt) => evt.preventDefault();
init_gallery()