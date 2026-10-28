const nav = document.querySelector("#nav");
const pageSections = [...document.querySelectorAll("main [data-tone]")];
const pageLinks = [...document.querySelectorAll(".escape-nav nav a[href^='#']")];

let sectionUpdateQueued = false;
function updateActiveSection() {
  sectionUpdateQueued = false;
  if (!pageSections.length || !nav) return;
  const marker = nav.getBoundingClientRect().bottom + 26;
  let activeSection = pageSections[0];
  pageSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= marker) activeSection = section;
  });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) {
    activeSection = pageSections.at(-1);
  }
  nav.classList.toggle("is-light", activeSection.dataset.tone === "light");
  pageLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${activeSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
function queueActiveSectionUpdate() {
  if (sectionUpdateQueued) return;
  sectionUpdateQueued = true;
  requestAnimationFrame(updateActiveSection);
}
window.addEventListener("scroll", queueActiveSectionUpdate, { passive: true });
window.addEventListener("resize", queueActiveSectionUpdate);
updateActiveSection();

const fullDemo = document.querySelector("#full-demo-video");
const fullDemoFrame = document.querySelector(".full-demo-frame");
const fullDemoPlay = document.querySelector("#full-demo-play");

fullDemoPlay.addEventListener("click", async () => {
  try {
    await fullDemo.play();
  } catch {
    fullDemo.focus();
  }
});
fullDemo.addEventListener("play", () => fullDemoFrame.classList.add("is-playing"));
fullDemo.addEventListener("pause", () => fullDemoFrame.classList.remove("is-playing"));

const clips = {
  collect: {
    title: "碎片收集",
    description: "探索房间并拾取散落的碎片，通过收集进度推动后续谜题。",
    duration: "25 秒 · 1920 × 1080",
    src: "assets/escape/1-1.mp4",
    poster: "assets/escape/collect-poster.png",
  },
  interact: {
    title: "场景交互",
    description: "与场景中的可交互物体进行操作，触发对应反馈并获取新的线索。",
    duration: "6 秒 · 1920 × 1080",
    src: "assets/escape/2-1.mp4",
    poster: "assets/escape/interact-poster.png",
  },
  password: {
    title: "密码验证",
    description: "根据已获得的线索输入密码，完成验证并推进逃脱流程。",
    duration: "8 秒 · 1920 × 1080",
    src: "assets/escape/3-1.mp4",
    poster: "assets/escape/password-poster.png",
  },
  escape: {
    title: "最终逃脱",
    description: "完成最后交互，触发成功逃脱与通关结果。",
    duration: "最终逃脱 · 1920 × 1080",
    src: "assets/escape/4-1.mp4",
    poster: "assets/escape/victory.png",
  },
};

const clipVideo = document.querySelector("#clip-video");
const clipSource = document.createElement("source");
clipSource.type = "video/mp4";
clipVideo.append(clipSource);

const clipFrame = document.querySelector(".clip-frame");
const clipPlay = document.querySelector("#clip-play");
const clipToggle = document.querySelector("#clip-toggle");
const clipReplay = document.querySelector("#clip-replay");
const clipMute = document.querySelector("#clip-mute");
const clipProgress = document.querySelector("#clip-progress");
const clipTime = document.querySelector("#clip-time");
const clipTitle = document.querySelector("#clip-title");
const clipDescription = document.querySelector("#clip-description");
const clipDuration = document.querySelector("#clip-duration");
const clipTabs = [...document.querySelectorAll("[data-clip]")];
let selectedClip = "collect";
let loadedClip = null;

function formatTime(value) {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateClipPlaybackState() {
  const paused = clipVideo.paused;
  clipFrame.classList.toggle("needs-play", paused);
  clipToggle.textContent = paused ? "播放" : "暂停";
  clipPlay.setAttribute("aria-label", paused ? "播放当前机制片段" : "暂停当前机制片段");
}

function loadClip(id) {
  const clip = clips[id];
  if (!clip || id === loadedClip) return;
  selectedClip = id;
  loadedClip = id;
  clipVideo.pause();
  clipFrame.classList.add("is-switching");
  clipVideo.removeAttribute("src");
  clipSource.src = clip.src;
  clipVideo.poster = clip.poster;
  clipTitle.textContent = clip.title;
  clipDescription.textContent = clip.description;
  clipDuration.textContent = clip.duration;
  clipTabs.forEach((tab) => {
    const selected = tab.dataset.clip === id;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  clipProgress.value = "0";
  clipTime.textContent = "0:00";
  clipVideo.load();
  updateClipPlaybackState();
  requestAnimationFrame(() => clipFrame.classList.remove("is-switching"));
}

async function playClip() {
  if (loadedClip !== selectedClip) loadClip(selectedClip);
  try {
    await clipVideo.play();
  } catch {
    updateClipPlaybackState();
  }
}

function replayClip() {
  if (loadedClip !== selectedClip) loadClip(selectedClip);
  const restartAndPlay = () => {
    clipVideo.currentTime = 0;
    playClip();
  };
  if (clipVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
    restartAndPlay();
  } else {
    clipVideo.addEventListener("loadedmetadata", restartAndPlay, { once: true });
  }
}

clipTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => loadClip(tab.dataset.clip));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowLeft") next = (index + clipTabs.length - 1) % clipTabs.length;
    if (event.key === "ArrowRight") next = (index + 1) % clipTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = clipTabs.length - 1;
    clipTabs[next].focus();
    loadClip(clipTabs[next].dataset.clip);
  });
});

clipPlay.addEventListener("click", playClip);
clipToggle.addEventListener("click", () => clipVideo.paused ? playClip() : clipVideo.pause());
clipReplay.addEventListener("click", replayClip);
clipMute.addEventListener("click", () => {
  clipVideo.muted = !clipVideo.muted;
  clipMute.textContent = clipVideo.muted ? "静音" : "有声";
  clipMute.setAttribute("aria-pressed", String(clipVideo.muted));
});

clipVideo.addEventListener("play", updateClipPlaybackState);
clipVideo.addEventListener("pause", updateClipPlaybackState);
clipVideo.addEventListener("ended", updateClipPlaybackState);
clipVideo.addEventListener("timeupdate", () => {
  if (!Number.isFinite(clipVideo.duration) || clipVideo.duration <= 0) return;
  clipProgress.value = String(Math.round((clipVideo.currentTime / clipVideo.duration) * 1000));
  clipTime.textContent = formatTime(clipVideo.currentTime);
});
clipVideo.addEventListener("loadedmetadata", () => {
  clipDuration.textContent = `${formatTime(clipVideo.duration)} · 1920 × 1080`;
});
clipProgress.addEventListener("input", () => {
  if (Number.isFinite(clipVideo.duration)) {
    clipVideo.currentTime = (Number(clipProgress.value) / 1000) * clipVideo.duration;
  }
});

if ("IntersectionObserver" in window) {
  const clipObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) clipVideo.pause();
    }),
    { threshold: 0.05 },
  );
  clipObserver.observe(clipFrame);
}

document.querySelectorAll("[data-select-clip]").forEach((link) => {
  link.addEventListener("click", () => loadClip(link.dataset.selectClip));
});

const caseTabs = [...document.querySelectorAll("[role='tab'][aria-controls^='case-']")];
const casePanels = caseTabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
const caseVideos = [...document.querySelectorAll(".case-inline-video")];

function formatCaseTime(value) {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

caseVideos.forEach((video) => {
  const controls = video.parentElement.querySelector(".case-video-controls");
  const toggle = controls.querySelector("[data-video-toggle]");
  const progress = controls.querySelector("[data-video-progress]");
  const time = controls.querySelector("[data-video-time]");
  const replay = controls.querySelector("[data-video-replay]");
  const refresh = () => {
    toggle.textContent = video.paused ? "播放" : "暂停";
    toggle.setAttribute("aria-label", video.paused ? "播放视频" : "暂停视频");
    if (Number.isFinite(video.duration) && video.duration > 0) {
      progress.value = String(Math.round((video.currentTime / video.duration) * 1000));
      time.textContent = formatCaseTime(video.currentTime);
    }
  };
  toggle.addEventListener("click", async () => {
    if (video.paused) {
      try { await video.play(); } catch { refresh(); }
    } else {
      video.pause();
    }
  });
  replay.addEventListener("click", async () => {
    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      const metadataReady = new Promise((resolve) => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
        video.addEventListener("error", resolve, { once: true });
      });
      video.load();
      await metadataReady;
    }
    video.currentTime = 0;
    try { await video.play(); } catch { refresh(); }
  });
  progress.addEventListener("input", () => {
    if (Number.isFinite(video.duration)) {
      video.currentTime = (Number(progress.value) / 1000) * video.duration;
    }
  });
  ["play", "pause", "ended", "timeupdate", "loadedmetadata"].forEach((eventName) => {
    video.addEventListener(eventName, refresh);
  });
});

function activateCase(index) {
  caseVideos.forEach((video) => video.pause());
  caseTabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.classList.toggle("is-selected", selected);
    casePanels[tabIndex].hidden = !selected;
  });
}

caseTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateCase(index));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowLeft") next = (index + caseTabs.length - 1) % caseTabs.length;
    if (event.key === "ArrowRight") next = (index + 1) % caseTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = caseTabs.length - 1;
    caseTabs[next].focus();
    activateCase(next);
  });
});

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function highlightCsharp(code) {
  const raw = code.textContent;
  const tokenPattern = /\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:using|public|private|void|if|else|return|break|new|float|bool|null|true|false)\b|\b(?:Vector3|Camera|KeyCode|PiecePickupUI|AudioManager|GameInit|GameObject|Resources|Cursor|CursorLockMode|Time|Input|Image|FindObjectOfType)\b|\b\d+(?:\.\d+)?\b/g;
  const html = [];
  let cursor = 0;

  for (const match of raw.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index;
    html.push(escapeHtml(raw.slice(cursor, start)));
    let tokenClass = "tok-number";
    if (token.startsWith("//")) tokenClass = "tok-comment";
    else if (token.startsWith('"')) tokenClass = "tok-string";
    else if (/^(using|public|private|void|if|else|return|break|new|float|bool|null|true|false)$/.test(token)) tokenClass = "tok-keyword";
    else if (/^\d/.test(token)) tokenClass = "tok-number";
    else tokenClass = "tok-type";
    html.push(`<span class="${tokenClass}">${escapeHtml(token)}</span>`);
    cursor = start + token.length;
  }
  html.push(escapeHtml(raw.slice(cursor)));
  code.innerHTML = html.join("");
}

document.querySelectorAll(".csharp-code").forEach(highlightCsharp);
updateClipPlaybackState();
