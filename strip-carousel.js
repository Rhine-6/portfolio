(() => {
  const strip = document.querySelector("#strip");
  if (!strip) return;
  const previous = document.querySelector("#strip-prev");
  const next = document.querySelector("#strip-next");
  const animation = strip.getAnimations()[0];
  const group = strip.querySelector(".strip-group");
  if (!animation || !group) return;

  const loopWidth = () => group.getBoundingClientRect().width;
  const duration = Number.parseFloat(getComputedStyle(strip).animationDuration) * 1000;
  let dragging = false;
  let dragStartX = 0;
  let startTime = 0;

  const move = (direction) => {
    const width = loopWidth();
    if (width <= 0 || !Number.isFinite(duration)) return;
    animation.currentTime = Number(animation.currentTime || 0) + direction * (duration * 0.12);
  };

  previous?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  strip.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragStartX = event.clientX;
    startTime = Number(animation.currentTime || 0);
    animation.pause();
    strip.classList.add("drag");
    strip.setPointerCapture(event.pointerId);
  });
  strip.addEventListener("pointermove", (event) => {
    if (dragging) {
      const width = loopWidth();
      if (width > 0) animation.currentTime = startTime - ((event.clientX - dragStartX) / width) * duration;
    }
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => {
    strip.addEventListener(name, () => {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove("drag");
      animation.play();
    });
  });
})();
