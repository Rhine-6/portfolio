/* =========================================================
   1. 顶部导航
   nav 对应 HTML 中 id="nav" 的 Liquid Glass 导航栏。
   ========================================================= */
const nav = document.querySelector("#nav");

/* =========================================================
   2. 页面内容进入视口时轻微淡入
   HTML 元素只要带 class="reveal"，就会自动获得此效果。
   threshold 数值越大，代表元素需要出现得更多才开始动画。
   ========================================================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.07 },
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================================
   3. 根据浅色/深色章节自动切换导航颜色
   HTML 中 data-tone="light" 表示浅色章节；
   data-tone="dark" 表示深色章节。
   ========================================================= */
const toneObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        nav.classList.toggle("is-light", entry.target.dataset.tone === "light");
      }
    });
  },
  { rootMargin: "-12% 0px -78%" },
);

document.querySelectorAll("[data-tone]").forEach((section) => {
  toneObserver.observe(section);
});

/* =========================================================
   4. 视频播放控制
   开始播放一个视频时，自动暂停页面中的其他视频。
   ========================================================= */
document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => {
    document.querySelectorAll("video").forEach((otherVideo) => {
      if (otherVideo !== video) otherVideo.pause();
    });
  });
});

/* =========================================================
   5. Visual Development 四组图片
   mode: "three" = 一组三阶段图片（Reference / Asset / Final）
   mode: "pairs" = 两组双阶段图片（Reference / Final）

   更换图片时，只需修改 assets/ 后面的文件名。
   如果调整案例顺序，应连同整组 { ... } 一起移动。
   ========================================================= */
const cases = [
  {
    mode: "three",
    ref: "assets/A11.jpg",
    asset: "assets/A12.jpg",
    final: "assets/A13.png",
    alt: ["车辆现实参考", "车辆视觉资产", "车辆最终影片镜头"],
  },
  {
    mode: "three",
    ref: "assets/A21.jpg",
    asset: "assets/A22.png",
    final: "assets/A23.png",
    alt: ["人物服装参考", "人物造型资产", "人物最终影片镜头"],
  },
  {
    mode: "pairs",
    pairs: [
      {
        ref: "assets/A31-1.png",
        final: "assets/A31-2.png",
        alt: ["相机道具参考", "相机道具最终影片镜头"],
      },
      {
        ref: "assets/A32-1.jpg",
        final: "assets/A32-2.png",
        alt: ["手机道具参考", "手机道具最终影片镜头"],
      },
    ],
  },
  {
    mode: "pairs",
    pairs: [
      {
        ref: "assets/A41-1.png",
        final: "assets/A41-2.png",
        alt: ["工厂喷涂设备参考", "工厂喷涂最终生成镜头"],
      },
      {
        ref: "assets/A42-1.png",
        final: "assets/A42-2.png",
        alt: ["方向盘安装参考", "方向盘安装最终生成镜头"],
      },
    ],
  },
];

// current 表示当前显示第几组案例；0 代表第一组。
let current = 0;
const stage = document.querySelector(".visual-display");
const threeStage = document.querySelector("#visual-three");
const pairsStage = document.querySelector("#visual-pairs");
const tabs = [...document.querySelectorAll(".tabs button")];
const count = document.querySelector("#count");

/* 切换 Visual Development 图片和页码。 */
function show(index) {
  // 让上一项/下一项在首尾之间循环。
  current = (index + cases.length) % cases.length;
  stage.classList.add("switch");

  // 160 毫秒后替换图片，形成轻微淡出/淡入效果。
  setTimeout(() => {
    const selectedCase = cases[current];

    if (selectedCase.mode === "three") {
      threeStage.hidden = false;
      pairsStage.hidden = true;

      const imageBindings = [
        ["#v-ref", "ref", 0],
        ["#v-asset", "asset", 1],
        ["#v-final", "final", 2],
      ];

      imageBindings.forEach(([selector, imageType, altIndex]) => {
        const image = document.querySelector(selector);
        image.src = selectedCase[imageType];
        image.alt = selectedCase.alt[altIndex];
      });
    } else {
      threeStage.hidden = true;
      pairsStage.hidden = false;

      selectedCase.pairs.forEach((pair, pairIndex) => {
        const number = pairIndex + 1;
        const referenceImage = document.querySelector(`#v-pair-${number}-ref`);
        const finalImage = document.querySelector(`#v-pair-${number}-final`);
        referenceImage.src = pair.ref;
        referenceImage.alt = pair.alt[0];
        finalImage.src = pair.final;
        finalImage.alt = pair.alt[1];
      });
    }

    // 更新上方选中状态和“01 / 04”页码。
    tabs.forEach((tab, tabIndex) => {
      tab.setAttribute("aria-selected", tabIndex === current);
    });
    count.textContent = `${String(current + 1).padStart(2, "0")} / 04`;
    stage.classList.remove("switch");
  }, 160);
}

// 点击四个案例名称进行切换。
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => show(index));
});

// PREV / NEXT 按钮。
document.querySelector("#prev").onclick = () => show(current - 1);
document.querySelector("#next").onclick = () => show(current + 1);

/* =========================================================
   6. Workflow 横向浏览箭头
   每次移动约四分之三屏；流程卡片本身仍可点击跳转章节。
   ========================================================= */
const workflowTrack = document.querySelector("#workflow-track");
const workflowPrev = document.querySelector("#workflow-prev");
const workflowNext = document.querySelector("#workflow-next");

function updateWorkflowArrows() {
  const maxScroll = workflowTrack.scrollWidth - workflowTrack.clientWidth;
  workflowPrev.disabled = workflowTrack.scrollLeft <= 2;
  workflowNext.disabled = workflowTrack.scrollLeft >= maxScroll - 2;
}

workflowPrev.addEventListener("click", () => {
  workflowTrack.scrollBy({ left: -workflowTrack.clientWidth * 0.75, behavior: "smooth" });
});

workflowNext.addEventListener("click", () => {
  workflowTrack.scrollBy({ left: workflowTrack.clientWidth * 0.75, behavior: "smooth" });
});

workflowTrack.addEventListener("scroll", updateWorkflowArrows, { passive: true });
window.addEventListener("resize", updateWorkflowArrows);
updateWorkflowArrows();

/* Selected Frames 画廊由独立的 strip-carousel.js 初始化。 */
