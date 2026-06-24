const config = {
    totalSlides: 10,
    lerp: 0.075,
    scrollSpeed: 3.5,
    centerWidth: 0.15,
    minScale: 0.36,
    spread: 2.5,
    fadeStart: 0.5,
    aspect: 1 / 1.25,
    gap: 12,
    radiusRatio: 0.05,
    baseline: 0.0,
};

const slider = document.querySelector(".slider");

const scaleAt = (u) =>
    config.minScale + (1 - config.minScale) / (1 + (u / config.spread) ** 2);

const offsetAt = (u, baseWidth) =>
    baseWidth *
        (config.minScale * u +
            (1 - config.minScale) * config.spread * Math.atan(u / config.spread)) +
    config.gap * u;

const slideCount = Math.ceil(1 / (config.centerWidth * config.minScale)) + 6;

const lerp = (start, end, t) => start + (end - start) * t;
const wrap = (value, max) => ((value % max) + max) % max;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const slides = [];
const slideStreamIndex = [];

for (let i = 0; i < slideCount; i++) {
    const slide = document.createElement("div");
    slide.className = "slide";

    const img = document.createElement("img");
    img.alt = "";
    slide.appendChild(img);
    slider.appendChild(slide);

    slides.push(slide);
    slideStreamIndex.push(i - Math.floor(slideCount / 2));
}

function setSlideImage(slide, imageNumber) {
    if (slide.dataset.image === String(imageNumber)) return;
    slide.dataset.image = imageNumber;
    slide.querySelector("img").src = `../img/slide-img-${imageNumber}.jpg`;
}

let scroll = 0;
let scrollTarget = 0;

slider.addEventListener("wheel", (e) => {
    e.preventDefault();
    scrollTarget += (e.deltaY + e.deltaX) * config.scrollSpeed * 0.0014;
}, { passive: false });

let lastPointerX = null;

slider.addEventListener("pointerdown", (e) => {
    lastPointerX = e.clientX;
    slider.setPointerCapture(e.pointerId);
});

slider.addEventListener("pointermove", (e) => {
    if (lastPointerX === null) return;
    scrollTarget += (lastPointerX - e.clientX) * config.scrollSpeed * -0.005;
    lastPointerX = e.clientX;
});

const releasePointer = () => {
    lastPointerX = null;
};

slider.addEventListener("pointerup", releasePointer);
slider.addEventListener("pointercancel", releasePointer);

function render() {
    scroll += (scrollTarget - scroll) * config.lerp;

    const sliderWidth = slider.clientWidth;
    const sliderHeight = slider.clientHeight;
    const baselineOffset = sliderHeight * config.baseline;
    const baseWidth = sliderWidth * config.centerWidth;
    const centerX = sliderWidth / 2;
    const recycleMargin = baseWidth;

    for (let i = 0; i < slideCount; i++) {
        const slide = slides[i];
        let streamIndex = slideStreamIndex[i];

        while (centerX + offsetAt(streamIndex + scroll, baseWidth) > sliderWidth + recycleMargin)
            streamIndex -= slideCount;
        while (centerX + offsetAt(streamIndex + scroll, baseWidth) < -recycleMargin)
            streamIndex += slideCount;
        slideStreamIndex[i] = streamIndex;

        const u = streamIndex + scroll;
        const scale = scaleAt(u);
        const width = Math.round(baseWidth * scale);
        const height = Math.round(width / config.aspect);
        const left = Math.round(centerX + offsetAt(u, baseWidth) - width / 2);
        const opacity = clamp((scale - config.minScale) / (config.fadeStart - config.minScale), 0, 1);

        setSlideImage(slide, wrap(streamIndex, config.totalSlides) + 1);

        slide.style.width = `${width}px`;
        slide.style.height = `${height}px`;
        slide.style.borderRadius = `${Math.round(width * config.radiusRatio)}px`;
        slide.style.opacity = opacity;
        slide.style.zIndex = width;
        slide.style.transform = `translate(${left}px, ${-baselineOffset}px)`;
    }

    requestAnimationFrame(render);
}

render();
