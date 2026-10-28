const works = [
  {
    id: "next-journey",
    title: "下一段旅程",
    english: "The Next Journey",
    category: "AIGC SHORT FILM",
    description: "以一辆汽车的视角串联三段人生经历的 AIGC 原创叙事短片，探索生成式影像中的视觉一致性与故事表达。",
    cover: "assets/home-covers/next-journey-cover.png",
    alt: "《下一段旅程》封面：夕阳下的汽车与片名",
    href: "next-journey.html",
  },
  {
    id: "escape",
    title: "ESCAPE",
    category: "GAME DEVELOPMENT",
    description: "基于 Unity 开发的第一人称密室逃脱游戏，通过探索、碎片收集、场景交互与密码解谜构建完整逃脱流程。",
    cover: "assets/home-covers/escape-cover.png",
    alt: "Escape 游戏封面：餐桌场景与主菜单",
    href: "escape.html",
  },
  {
    id: "processing",
    title: "Processing",
    english: "Kuromi’s Challenge",
    category: "CREATIVE CODING",
    description: "简易的 Processing 小游戏，用方向键控制角色收集豆子，每次得 2 分；达到 20 分后切换至胜利画面。",
    cover: "assets/home-covers/processing-cover.png",
    alt: "Processing《Kuromi’s Challenge》封面与开始说明",
    href: "processing.html",
  },
  {
    id: "find-yourself",
    title: "找回自己",
    english: "Find Yourself",
    category: "NARRATIVE SHORT FILM",
    description: "一部围绕个人兴趣、自我选择与成长展开的真人剧情短片，通过现实与另一人格的对话，呈现主人公重新找回绘画热情的过程。",
    cover: "assets/home-covers/find-yourself-cover.png",
    alt: "《找回自己》封面：林间天空与影片标题",
    href: "find-yourself.html",
  },
  {
    id: "hongwu",
    title: "混在洪武当咸鱼",
    category: "AIGC VISUAL PRODUCTION",
    description: "参与小说《混在洪武当咸鱼》的 AIGC 短剧改编项目，负责部分剧情策划与角色视觉资产设计。通过 GPT、即梦及 Photoshop 进行角色形象生成与多轮迭代，重点优化人物真实质感、视觉风格及角色一致性。项目中，两套个人设计的角色定妆方案经团队评审后被最终采用，同时参与首集样片评审与叙事优化，积累了 AIGC 影视内容开发及团队协作经验。",
    textOnly: true,
  },
];

const heroGallery = document.querySelector("#hero-collage");
const worksGrid = document.querySelector("#works-grid");
const dialog = document.querySelector("#hongwu-dialog");

function createHeroCard(work) {
  const card = document.createElement("a");
  card.className = `hero-work hero-work--${work.id}`;
  card.href = work.href;
  card.setAttribute("aria-label", `查看项目：${work.title}`);
  card.innerHTML = `
    <img src="${work.cover}" alt="${work.alt}" loading="eager" />
    <span class="glass-arrow" aria-hidden="true">↗</span>`;
  return card;
}

function createWorkCard(work, index) {
  if (work.textOnly) {
    const entry = document.createElement("button");
    entry.className = "work-card work-card--text";
    entry.type = "button";
    entry.dataset.openDialog = "hongwu-dialog";
    entry.setAttribute("aria-haspopup", "dialog");
    entry.innerHTML = `
      <p class="work-category">${String(index + 1).padStart(2, "0")} &nbsp; ${work.category}</p>
      <h3>${work.title}</h3>
      <p>${work.description}</p>
      <span class="text-entry-arrow" aria-hidden="true">↗</span>`;
    return entry;
  }

  const card = document.createElement("a");
  card.className = `work-card work-card--${work.id}`;
  card.href = work.href;
  card.setAttribute("aria-label", `打开项目 ${work.title}`);
  card.innerHTML = `
    <div class="work-media">
      <img src="${work.cover}" alt="${work.alt}" loading="lazy" />
      <span class="glass-arrow" aria-hidden="true">↗</span>
    </div>
    <div class="work-copy">
      <p class="work-category">${String(index + 1).padStart(2, "0")} &nbsp; ${work.category}</p>
      <h3>${work.title}${work.english ? `<span class="work-en">${work.english}</span>` : ""}</h3>
      <p>${work.description}</p>
    </div>`;
  return card;
}

if (heroGallery) {
  ["escape", "next-journey", "find-yourself"]
    .map((id) => works.find((work) => work.id === id))
    .filter(Boolean)
    .forEach((work) => heroGallery.append(createHeroCard(work)));
}
if (worksGrid) {
  works.forEach((work, index) => worksGrid.append(createWorkCard(work, index)));
}

document.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (dialog && !dialog.open) dialog.showModal();
  });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

if (dialog) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
