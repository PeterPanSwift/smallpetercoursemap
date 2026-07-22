"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Topic = {
  id: string;
  title: string;
};

type ExportRatio = "4:3" | "16:9";
type Locale = "zh" | "en";

const defaultTopicsZh: Topic[] = [
  { id: "swiftui-intro", title: "SwiftUI 初相見" },
  { id: "views-modifiers", title: "View 與修飾器" },
  { id: "stacks-layout", title: "Stacks 組合術" },
  { id: "state-data", title: "狀態與資料流" },
  { id: "lists-navigation", title: "清單與導覽" },
  { id: "animation", title: "動畫魔法" },
  { id: "forms-controls", title: "表單與控制項" },
  { id: "networking", title: "網路資料串接" },
  { id: "components", title: "可重用元件" },
  { id: "portfolio", title: "我的 SwiftUI 作品" },
];

const defaultTopicsEn: Topic[] = [
  { id: "swiftui-intro", title: "Meet SwiftUI" },
  { id: "views-modifiers", title: "Views and Modifiers" },
  { id: "stacks-layout", title: "Building with Stacks" },
  { id: "state-data", title: "State and Data Flow" },
  { id: "lists-navigation", title: "Lists and Navigation" },
  { id: "animation", title: "Animation Magic" },
  { id: "forms-controls", title: "Forms and Controls" },
  { id: "networking", title: "Networking and Data" },
  { id: "components", title: "Reusable Components" },
  { id: "portfolio", title: "My SwiftUI Project" },
];

const localizedDefaults = {
  zh: { topics: defaultTopicsZh, courseTitle: "SwiftUI 入門冒險", characterName: "小彼" },
  en: { topics: defaultTopicsEn, courseTitle: "SwiftUI Starter Adventure", characterName: "Little Peter" },
} satisfies Record<Locale, { topics: Topic[]; courseTitle: string; characterName: string }>;

const defaultCharacterImage = "/fox.jpg";

const translations = {
  zh: {
    brandName: "彼學島",
    brandHome: "彼學島首頁",
    brandTagline: (name: string) => `和${name}一起探索`,
    progress: (value: number) => `目前進度 ${value}%`,
    edit: "編輯角色關卡",
    exportImage: "輸出圖片",
    questLine: "任何主題都能變成冒險",
    heroBefore: "陪著",
    heroEmphasis: "一步一步",
    heroAfter: "完成學習！",
    heroDescription: (name: string) => `語言、程式、攝影或任何新技能，都能排成專屬路線。準備好後按下出發，看${name}一路走到終點吧。`,
    moving: (name: string) => `${name}前進中…`,
    start: (name: string) => `${name}出發`,
    viewMap: "看看課程地圖",
    buddyAria: (name: string) => `學習夥伴${name}`,
    knowledge: "知識 +1",
    newSkill: "新技能",
    letsGo: "一起出發吧！",
    mapLine: "你的專屬學習路線",
    mapTitle: "今天想走到哪一關？",
    mapDescription: (name: string) => `點一下任一關卡，${name}會沿著路線逐關前進；也可以從第一關開始完整播放。`,
    currentCourse: "CURRENT COURSE",
    levelAria: (index: number, title: string) => `第 ${index} 關：${title}`,
    completed: "已走過",
    currentPosition: "目前位置",
    level: (index: number) => `第 ${index} 關`,
    finish: "完成這趟學習冒險！",
    stayCurious: "保持好奇，繼續探索。",
    nextSkill: "下一個會的新技能，可能就從今天的一小步開始。",
    again: "再走一次 ↗",
    editorTitle: "編輯課程與角色",
    closeEditor: "關閉編輯器",
    editorHelp: "設定課程與學習夥伴，再逐項調整關卡，或一次貼上多行文字快速建立整張課程地圖。",
    courseName: "課程名稱",
    coursePlaceholder: "例如：日文五十音冒險",
    characterPreview: (name: string) => `${name}的角色預覽`,
    learningBuddy: "學習夥伴",
    characterName: "角色名字",
    uploadCharacter: "上傳角色圖片",
    restoreCharacter: "恢復小彼",
    imageNote: "圖片會裁成正方形並保存在此瀏覽器。",
    editorMethod: "課程編輯方式",
    editOneByOne: "逐項編輯",
    bulkInput: "多行快速輸入",
    topicAria: (index: number) => `第 ${index} 關主題`,
    moveUp: (title: string) => `將 ${title} 往上移`,
    moveDown: (title: string) => `將 ${title} 往下移`,
    deleteTopic: (title: string) => `刪除 ${title}`,
    newTopic: "新的課程主題",
    addTopic: "＋ 新增一個課程主題",
    oneLineOneLevel: "一行就是一個關卡",
    bulkTip: "可直接從記事本或試算表貼上；空白行會自動忽略。",
    topicList: "課程主題清單",
    bulkPlaceholder: "攝影構圖基礎\n光線與曝光\n人像攝影實作",
    bulkSummaryBefore: "目前會建立",
    bulkSummaryAfter: "個關卡",
    applyBulk: "套用並切回逐項編輯 →",
    resetTen: "還原預設 10 關",
    cancel: "取消",
    save: "儲存並更新地圖",
    exportTitle: "輸出課程地圖",
    closeExport: "關閉輸出視窗",
    exportHelp: (name: string) => `選擇投影片比例，系統會把課程名稱、全部關卡、路線與${name}排進一張高解析度 PNG。`,
    generating: "正在產生…",
    standardSlide: "4:3 標準投影片",
    widescreen: "16:9 寬螢幕",
    exportNote: "圖片會直接下載到裝置，不會上傳課程內容。",
    imageLoadFailed: "圖片載入失敗",
    chooseImage: "請選擇圖片檔案。",
    imageTooLarge: "圖片請小於 10 MB。",
    cannotReadImage: "無法讀取這張圖片。",
    cannotProcessImage: "無法處理這張圖片。",
    imageProcessFailed: "圖片處理失敗，請換一張再試。",
    cannotCreateImage: "無法建立圖片",
    exportFailed: "圖片輸出失敗",
    exportTryAgain: "圖片輸出失敗，請再試一次。",
    fallbackCourseTitle: "我的學習冒險",
    fileName: "課程地圖",
    exportBrand: (name: string) => `彼學島 · 和${name}一起探索`,
    exportProgress: (count: number, progress: number) => `${count} 個冒險關卡 · ${progress}% 完成`,
    exportFooter: (name: string) => `✦  每一步都算數，和${name}一起走到終點！`,
  },
  en: {
    brandName: "Peter Learning Island",
    brandHome: "Peter Learning Island home",
    brandTagline: (name: string) => `Explore with ${name}`,
    progress: (value: number) => `Current progress ${value}%`,
    edit: "Edit Character & Levels",
    exportImage: "Export Image",
    questLine: "Turn any topic into an adventure",
    heroBefore: "Learn with",
    heroEmphasis: "step by step",
    heroAfter: "and finish strong!",
    heroDescription: (name: string) => `Languages, coding, photography, or any new skill can become your own learning path. Press start and watch ${name} travel all the way to the finish.`,
    moving: (name: string) => `${name} is moving…`,
    start: (name: string) => `Start with ${name}`,
    viewMap: "View the course map",
    buddyAria: (name: string) => `Learning buddy ${name}`,
    knowledge: "Knowledge +1",
    newSkill: "New skill",
    letsGo: "Let's go!",
    mapLine: "Your personal learning path",
    mapTitle: "How far will you go today?",
    mapDescription: (name: string) => `Select any level and ${name} will follow the path one step at a time. You can also play the entire journey from level one.`,
    currentCourse: "CURRENT COURSE",
    levelAria: (index: number, title: string) => `Level ${index}: ${title}`,
    completed: "Completed",
    currentPosition: "Current position",
    level: (index: number) => `Level ${index}`,
    finish: "Complete this learning adventure!",
    stayCurious: "Stay curious. Keep exploring.",
    nextSkill: "Your next skill may begin with one small step today.",
    again: "Start again ↗",
    editorTitle: "Edit Course & Character",
    closeEditor: "Close editor",
    editorHelp: "Set up your course and learning buddy, then edit each level or paste multiple lines to build the whole map at once.",
    courseName: "Course title",
    coursePlaceholder: "For example: Japanese Alphabet Adventure",
    characterPreview: (name: string) => `${name} character preview`,
    learningBuddy: "Learning buddy",
    characterName: "Character name",
    uploadCharacter: "Upload character image",
    restoreCharacter: "Restore Little Peter",
    imageNote: "The image is cropped to a square and saved only in this browser.",
    editorMethod: "Course editing method",
    editOneByOne: "Edit one by one",
    bulkInput: "Quick multiline input",
    topicAria: (index: number) => `Topic for level ${index}`,
    moveUp: (title: string) => `Move ${title} up`,
    moveDown: (title: string) => `Move ${title} down`,
    deleteTopic: (title: string) => `Delete ${title}`,
    newTopic: "New course topic",
    addTopic: "+ Add a course topic",
    oneLineOneLevel: "One line equals one level",
    bulkTip: "Paste directly from notes or a spreadsheet. Blank lines are ignored.",
    topicList: "Course topic list",
    bulkPlaceholder: "Photography composition\nLight and exposure\nPortrait photography practice",
    bulkSummaryBefore: "This will create",
    bulkSummaryAfter: "levels",
    applyBulk: "Apply and return to list editing →",
    resetTen: "Reset to 10 default levels",
    cancel: "Cancel",
    save: "Save and update map",
    exportTitle: "Export Course Map",
    closeExport: "Close export window",
    exportHelp: (name: string) => `Choose a slide ratio to arrange the course title, every level, the route, and ${name} in one high-resolution PNG.`,
    generating: "Generating…",
    standardSlide: "4:3 Standard Slide",
    widescreen: "16:9 Widescreen",
    exportNote: "The image downloads directly to your device. Course content is not uploaded.",
    imageLoadFailed: "Unable to load the image",
    chooseImage: "Please choose an image file.",
    imageTooLarge: "Please use an image smaller than 10 MB.",
    cannotReadImage: "Unable to read this image.",
    cannotProcessImage: "Unable to process this image.",
    imageProcessFailed: "Image processing failed. Please try another image.",
    cannotCreateImage: "Unable to create the image",
    exportFailed: "Image export failed",
    exportTryAgain: "Image export failed. Please try again.",
    fallbackCourseTitle: "My Learning Adventure",
    fileName: "course-map",
    exportBrand: (name: string) => `Peter Learning Island · Explore with ${name}`,
    exportProgress: (count: number, progress: number) => `${count} adventure levels · ${progress}% complete`,
    exportFooter: (name: string) => `✦  Every step counts. Reach the finish with ${name}!`,
  },
} as const;

const xPositions = [22, 50, 78, 58, 25, 44, 76, 57, 24, 50];
const nodeMotifs = ["✦", "♡", "☁", "✿", "☀", "♫", "★", "☺", "◇", "❋"];

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) {
  const characters = Array.from(text);
  const lines: string[] = [];
  let currentLine = "";

  for (const character of characters) {
    const candidate = currentLine + character;
    if (currentLine && context.measureText(candidate).width > maxWidth) {
      lines.push(currentLine);
      currentLine = character;
      if (lines.length === maxLines) break;
    } else {
      currentLine = candidate;
    }
  }

  if (lines.length < maxLines && currentLine) lines.push(currentLine);
  const visibleCharacters = lines.join("").length;
  if (visibleCharacters < characters.length && lines.length > 0) {
    let lastLine = lines[lines.length - 1];
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) lastLine = lastLine.slice(0, -1);
    lines[lines.length - 1] = `${lastLine}…`;
  }

  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function drawFeltFibers(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  seed: number,
) {
  context.save();
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.clip();
  context.lineCap = "round";
  for (let index = 0; index < 30; index += 1) {
    const angle = ((index * 47 + seed * 31) % 360) * (Math.PI / 180);
    const distance = (((index * 29 + seed * 13) % 84) / 100) ** 0.7;
    const fiberX = x + Math.cos(angle) * radiusX * distance;
    const fiberY = y + Math.sin(angle) * radiusY * distance;
    const fiberAngle = ((index * 23 + seed * 17) % 180) * (Math.PI / 180);
    const fiberLength = Math.max(2.5, radiusX * (0.045 + (index % 4) * 0.012));
    context.strokeStyle = index % 3 === 0 ? "rgba(255,255,255,.25)" : "rgba(74,48,34,.12)";
    context.lineWidth = Math.max(0.8, radiusX * 0.012);
    context.beginPath();
    context.moveTo(fiberX - Math.cos(fiberAngle) * fiberLength, fiberY - Math.sin(fiberAngle) * fiberLength);
    context.lineTo(fiberX + Math.cos(fiberAngle) * fiberLength, fiberY + Math.sin(fiberAngle) * fiberLength);
    context.stroke();
  }
  context.restore();
}

function loadCanvasImage(source: string, errorMessage: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(errorMessage));
    image.src = source;
  });
}

async function createCharacterImage(file: File, locale: Locale) {
  const t = translations[locale];
  if (!file.type.startsWith("image/")) throw new Error(t.chooseImage);
  if (file.size > 10 * 1024 * 1024) throw new Error(t.imageTooLarge);

  const source = URL.createObjectURL(file);
  try {
    const image = await loadCanvasImage(source, t.imageLoadFailed);
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    if (!cropSize) throw new Error(t.cannotReadImage);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(t.cannotProcessImage);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);
    context.drawImage(
      image,
      (image.naturalWidth - cropSize) / 2,
      (image.naturalHeight - cropSize) / 2,
      cropSize,
      cropSize,
      0,
      0,
      512,
      512,
    );
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(source);
  }
}

function topicsFromLines(text: string, previousTopics: Topic[]): Topic[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((title, index) => ({
      id: previousTopics[index]?.id ?? `topic-${Date.now()}-${index}`,
      title,
    }));
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("zh");
  const t = translations[locale];
  const defaults = localizedDefaults[locale];
  const [topics, setTopics] = useState<Topic[]>(defaultTopicsZh);
  const [courseTitle, setCourseTitle] = useState(localizedDefaults.zh.courseTitle);
  const [draftTopics, setDraftTopics] = useState<Topic[]>(defaultTopicsZh);
  const [draftCourseTitle, setDraftCourseTitle] = useState(localizedDefaults.zh.courseTitle);
  const [characterName, setCharacterName] = useState(localizedDefaults.zh.characterName);
  const [characterImage, setCharacterImage] = useState(defaultCharacterImage);
  const [draftCharacterName, setDraftCharacterName] = useState(localizedDefaults.zh.characterName);
  const [draftCharacterImage, setDraftCharacterImage] = useState(defaultCharacterImage);
  const [characterImageError, setCharacterImageError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journeyTarget, setJourneyTarget] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportRatio | null>(null);
  const [exportError, setExportError] = useState("");
  const [editorMode, setEditorMode] = useState<"list" | "bulk">("list");
  const [bulkText, setBulkText] = useState(defaultTopicsZh.map((topic) => topic.title).join("\n"));
  const [isHydrated, setIsHydrated] = useState(false);
  const [foxPosition, setFoxPosition] = useState({ x: 0, y: 0, ready: false });
  const mapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isRunning = journeyTarget !== null;

  useEffect(() => {
    const detectedLocale: Locale = window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
    const detectedDefaults = localizedDefaults[detectedLocale];
    setLocale(detectedLocale);
    document.documentElement.lang = detectedLocale === "zh" ? "zh-Hant" : "en";
    document.title = detectedLocale === "zh"
      ? "彼學島｜和小彼一起探索任何主題"
      : "Peter Learning Island | Explore Any Topic with Little Peter";
    try {
      const saved = window.localStorage.getItem("swiftui-course-map-topics");
      const savedTitle = window.localStorage.getItem("course-map-title");
      const savedCharacterName = window.localStorage.getItem("course-map-character-name");
      const savedCharacterImage = window.localStorage.getItem("course-map-character-image");
      if (saved) {
        const parsed = JSON.parse(saved) as Topic[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopics(parsed.filter((topic) => topic?.title?.trim()).map((topic) => ({ id: topic.id, title: topic.title })));
        }
      } else {
        setTopics(detectedDefaults.topics.map((topic) => ({ ...topic })));
      }
      setCourseTitle(savedTitle?.trim() || detectedDefaults.courseTitle);
      setCharacterName(savedCharacterName?.trim() || detectedDefaults.characterName);
      if (savedCharacterImage?.startsWith("data:image/")) setCharacterImage(savedCharacterImage);
    } catch {
      // If saved data is invalid, the friendly starter curriculum remains available.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem("swiftui-course-map-topics", JSON.stringify(topics));
      window.localStorage.setItem("course-map-title", courseTitle);
      window.localStorage.setItem("course-map-character-name", characterName);
      if (characterImage.startsWith("data:image/")) {
        window.localStorage.setItem("course-map-character-image", characterImage);
      } else {
        window.localStorage.removeItem("course-map-character-image");
      }
    } catch {
      // The current session still works if browser storage is unavailable.
    }
  }, [characterImage, characterName, courseTitle, isHydrated, topics]);

  const updateFoxPosition = useCallback(() => {
    const map = mapRef.current;
    const node = nodeRefs.current[currentIndex];
    if (!map || !node) return;
    const mapRect = map.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    setFoxPosition({
      x: nodeRect.left - mapRect.left + nodeRect.width / 2,
      y: nodeRect.top - mapRect.top - 8,
      ready: true,
    });
  }, [currentIndex]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateFoxPosition);
    window.addEventListener("resize", updateFoxPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateFoxPosition);
    };
  }, [topics, updateFoxPosition]);

  useEffect(() => {
    if (journeyTarget === null) return;
    if (currentIndex === journeyTarget) {
      setJourneyTarget(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => index + Math.sign(journeyTarget - index));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [currentIndex, journeyTarget]);

  useEffect(() => {
    if (!isRunning) return;
    const frame = window.requestAnimationFrame(() => {
      const node = nodeRefs.current[currentIndex];
      if (!node) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      node.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentIndex, isRunning]);

  function beginJourney() {
    setCurrentIndex(0);
    setJourneyTarget(topics.length - 1);
  }

  function openEditor() {
    const copies = topics.map((topic) => ({ ...topic }));
    setDraftTopics(copies);
    setDraftCourseTitle(courseTitle);
    setDraftCharacterName(characterName);
    setDraftCharacterImage(characterImage);
    setCharacterImageError("");
    setBulkText(copies.map((topic) => topic.title).join("\n"));
    setEditorMode("list");
    setIsEditorOpen(true);
  }

  function changeEditorMode(mode: "list" | "bulk") {
    if (mode === editorMode) return;
    if (mode === "bulk") {
      setBulkText(draftTopics.map((topic) => topic.title).join("\n"));
    } else {
      const parsed = topicsFromLines(bulkText, draftTopics);
      if (parsed.length > 0) setDraftTopics(parsed);
    }
    setEditorMode(mode);
  }

  function updateDraft(id: string, value: string) {
    setDraftTopics((items) => items.map((item) => (item.id === id ? { ...item, title: value } : item)));
  }

  function moveDraft(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draftTopics.length) return;
    setDraftTopics((items) => {
      const copy = [...items];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function addDraft() {
    setDraftTopics((items) => [
      ...items,
      { id: `topic-${Date.now()}`, title: t.newTopic },
    ]);
  }

  async function updateDraftCharacterImage(file?: File) {
    if (!file) return;
    setCharacterImageError("");
    try {
      setDraftCharacterImage(await createCharacterImage(file, locale));
    } catch (error) {
      setCharacterImageError(error instanceof Error ? error.message : t.imageProcessFailed);
    }
  }

  function saveDraft() {
    const sourceTopics = editorMode === "bulk" ? topicsFromLines(bulkText, draftTopics) : draftTopics;
    const cleaned = sourceTopics
      .map((topic) => ({ id: topic.id, title: topic.title.trim() }))
      .filter((topic) => topic.title.length > 0);
    if (cleaned.length === 0) return;
    setTopics(cleaned);
    setCourseTitle(draftCourseTitle.trim() || t.fallbackCourseTitle);
    setCharacterName(draftCharacterName.trim() || defaults.characterName);
    setCharacterImage(draftCharacterImage);
    setCurrentIndex(0);
    setJourneyTarget(null);
    setIsEditorOpen(false);
  }

  async function exportCourseMap(ratio: ExportRatio) {
    setIsExporting(ratio);
    setExportError("");
    try {
      await document.fonts.ready;
      const dimensions = ratio === "4:3" ? { width: 1600, height: 1200 } : { width: 1920, height: 1080 };
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error(t.cannotCreateImage);
      let feltTexture: HTMLImageElement | null = null;
      let feltLevelImages: { locked: HTMLImageElement; current: HTMLImageElement; complete: HTMLImageElement } | null = null;
      try {
        feltTexture = await loadCanvasImage("/felt-wool-texture.png", t.imageLoadFailed);
      } catch {
        // The map remains exportable with the drawn fiber fallback.
      }
      try {
        const [locked, current, complete] = await Promise.all([
          loadCanvasImage("/felt-level-locked.png", t.imageLoadFailed),
          loadCanvasImage("/felt-level-current.png", t.imageLoadFailed),
          loadCanvasImage("/felt-level-complete.png", t.imageLoadFailed),
        ]);
        feltLevelImages = { locked, current, complete };
      } catch {
        // The drawn felt nodes remain available if a photographic asset is unavailable.
      }

      const { width, height } = dimensions;
      context.fillStyle = "#fffaf2";
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalAlpha = 0.5;
      context.fillStyle = "#eeeaff";
      context.beginPath();
      context.arc(width - 90, 80, 230, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#e4f4ef";
      context.beginPath();
      context.arc(20, height - 20, 190, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.fillStyle = "#ff704d";
      roundedRect(context, 62, 48, 70, 70, 22);
      context.fill();
      context.fillStyle = "#ffffff";
      context.font = "900 38px 'Noto Sans TC', sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("彼", 97, 83);

      context.textAlign = "left";
      context.fillStyle = "#8175d8";
      context.font = "900 18px Nunito, 'Noto Sans TC', sans-serif";
      context.fillText(t.exportBrand(characterName), 154, 65);
      context.fillStyle = "#27233a";
      context.font = `900 ${ratio === "4:3" ? 48 : 52}px Nunito, 'Noto Sans TC', sans-serif`;
      context.fillText(courseTitle, 154, 105);

      const progressText = t.exportProgress(topics.length, progress);
      context.font = "800 20px Nunito, 'Noto Sans TC', sans-serif";
      const progressWidth = context.measureText(progressText).width + 48;
      context.fillStyle = "#ffffff";
      roundedRect(context, width - progressWidth - 62, 61, progressWidth, 52, 26);
      context.fill();
      context.fillStyle = "#e95634";
      context.textAlign = "center";
      context.fillText(progressText, width - progressWidth / 2 - 62, 87);

      const surfaceX = 54;
      const surfaceY = 154;
      const surfaceWidth = width - 108;
      const surfaceHeight = height - 220;
      context.fillStyle = "rgba(255,255,255,.94)";
      context.shadowColor = "rgba(50,41,82,.12)";
      context.shadowBlur = 34;
      context.shadowOffsetY = 14;
      roundedRect(context, surfaceX, surfaceY, surfaceWidth, surfaceHeight, 36);
      context.fill();
      context.shadowColor = "transparent";

      const aspectFactor = ratio === "16:9" ? 2.1 : 1.15;
      const maximumColumns = ratio === "16:9" ? 7 : 6;
      const columns = Math.max(1, Math.min(maximumColumns, Math.ceil(Math.sqrt(topics.length * aspectFactor))));
      const rows = Math.ceil(topics.length / columns);
      const mapLeft = surfaceX + 58;
      const mapRight = surfaceX + surfaceWidth - 58;
      const mapTop = surfaceY + 52;
      const mapBottom = surfaceY + surfaceHeight - 92;
      const cellWidth = (mapRight - mapLeft) / columns;
      const cellHeight = (mapBottom - mapTop) / rows;
      const nodeRadius = Math.max(18, Math.min(48, cellWidth * 0.14, cellHeight * 0.22));
      const topicFontSize = Math.max(13, Math.min(23, cellWidth / 14, cellHeight / 5));
      const positions = topics.map((_, index) => {
        const row = Math.floor(index / columns);
        const positionInRow = index % columns;
        const column = row % 2 === 0 ? positionInRow : columns - 1 - positionInRow;
        return {
          x: mapLeft + (column + 0.5) * cellWidth,
          y: mapTop + row * cellHeight + Math.min(cellHeight * 0.35, nodeRadius + 12),
        };
      });

      context.strokeStyle = "#d8d0dd";
      context.lineWidth = Math.max(4, nodeRadius * 0.12);
      context.setLineDash([9, 13]);
      context.lineCap = "round";
      context.beginPath();
      positions.forEach((position, index) => {
        if (index === 0) context.moveTo(position.x, position.y);
        else context.lineTo(position.x, position.y);
      });
      context.stroke();
      context.setLineDash([]);

      positions.forEach((position, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const nodeColor = isComplete ? "#82b7a0" : isCurrent ? "#df775b" : "#d9c9b7";
        const edgeColor = isComplete ? "#4f7867" : isCurrent ? "#a94334" : "#9e826b";

        context.save();
        context.shadowColor = "rgba(78,54,39,.22)";
        context.shadowBlur = Math.max(5, nodeRadius * 0.18);
        context.shadowOffsetY = Math.max(4, nodeRadius * 0.2);
        context.fillStyle = edgeColor;
        context.beginPath();
        context.ellipse(position.x, position.y + nodeRadius * 0.2, nodeRadius * 1.23, nodeRadius * 1.01, index % 2 ? 0.025 : -0.025, 0, Math.PI * 2);
        context.fill();
        context.shadowColor = "transparent";
        context.fillStyle = nodeColor;
        context.beginPath();
        context.ellipse(position.x, position.y, nodeRadius * 1.19, nodeRadius * 0.98, index % 2 ? -0.025 : 0.025, 0, Math.PI * 2);
        context.fill();
        context.restore();

        if (feltTexture) {
          const sourceSize = Math.min(360, feltTexture.naturalWidth, feltTexture.naturalHeight);
          const sourceRangeX = Math.max(1, feltTexture.naturalWidth - sourceSize);
          const sourceRangeY = Math.max(1, feltTexture.naturalHeight - sourceSize);
          const sourceX = (index * 83) % sourceRangeX;
          const sourceY = (index * 61) % sourceRangeY;
          context.save();
          context.beginPath();
          context.ellipse(position.x, position.y, nodeRadius * 1.18, nodeRadius * 0.97, index % 2 ? -0.025 : 0.025, 0, Math.PI * 2);
          context.clip();
          context.globalAlpha = 0.72;
          context.globalCompositeOperation = "multiply";
          context.drawImage(
            feltTexture,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            position.x - nodeRadius * 1.2,
            position.y - nodeRadius,
            nodeRadius * 2.4,
            nodeRadius * 2,
          );
          context.restore();
        }

        drawFeltFibers(context, position.x, position.y, nodeRadius * 1.17, nodeRadius * 0.95, index + 1);

        context.save();
        context.strokeStyle = isComplete ? "rgba(42,86,66,.42)" : isCurrent ? "rgba(105,39,29,.43)" : "rgba(91,64,46,.36)";
        context.lineWidth = Math.max(1.5, nodeRadius * 0.045);
        context.setLineDash([Math.max(3, nodeRadius * 0.1), Math.max(3, nodeRadius * 0.09)]);
        context.beginPath();
        context.ellipse(position.x, position.y, nodeRadius * 1.03, nodeRadius * 0.82, index % 2 ? -0.025 : 0.025, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
        context.restore();

        if (feltLevelImages) {
          const feltLevelImage = isComplete
            ? feltLevelImages.complete
            : isCurrent
              ? feltLevelImages.current
              : feltLevelImages.locked;
          const feltLevelSize = nodeRadius * 3.05;
          context.drawImage(
            feltLevelImage,
            position.x - feltLevelSize / 2,
            position.y - feltLevelSize / 2,
            feltLevelSize,
            feltLevelSize,
          );
        }

        context.fillStyle = "rgba(255,248,232,.88)";
        context.beginPath();
        context.ellipse(position.x, position.y - 2, nodeRadius * 0.46, nodeRadius * 0.42, index % 2 ? 0.08 : -0.08, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = isComplete ? "#3f715d" : isCurrent ? "#8b493c" : "#806d5d";
        context.font = `900 ${Math.max(17, nodeRadius * 0.68)}px Georgia, 'Noto Sans TC', serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(isComplete ? "✓" : nodeMotifs[index % nodeMotifs.length], position.x, position.y - 2);

        context.fillStyle = "#fff9e9";
        roundedRect(context, position.x - nodeRadius * 0.54, position.y + nodeRadius * 0.66, nodeRadius * 1.08, Math.max(20, nodeRadius * 0.48), 9);
        context.fill();
        context.strokeStyle = "rgba(100,73,53,.35)";
        context.lineWidth = 1.5;
        context.setLineDash([3, 3]);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = isCurrent ? "#a94334" : isComplete ? "#3f715d" : "#6f5f53";
        context.font = `900 ${Math.max(10, nodeRadius * 0.25)}px Nunito, sans-serif`;
        context.fillText(String(index + 1).padStart(2, "0"), position.x, position.y + nodeRadius * 0.91);

        const labelTop = position.y + nodeRadius + 14;
        const labelWidth = Math.max(74, cellWidth - 18);
        const labelHeight = topicFontSize * 2.75;
        context.fillStyle = "rgba(255,250,237,.94)";
        roundedRect(context, position.x - labelWidth / 2, labelTop, labelWidth, labelHeight, 12);
        context.fill();
        context.strokeStyle = "rgba(181,151,125,.58)";
        context.lineWidth = 1.5;
        context.stroke();

        context.fillStyle = isCurrent ? "#a94334" : isComplete ? "#3f715d" : "#4d4038";
        context.font = `800 ${topicFontSize}px 'Noto Sans TC', sans-serif`;
        context.textBaseline = "top";
        drawWrappedText(context, topics[index].title, position.x, labelTop + 7, labelWidth - 14, topicFontSize * 1.28);
      });

      try {
        const foxImage = await loadCanvasImage(characterImage, t.imageLoadFailed);
        const currentPosition = positions[Math.min(currentIndex, positions.length - 1)];
        if (currentPosition) {
          const foxSize = Math.max(80, nodeRadius * 2.05);
          const foxX = currentPosition.x + nodeRadius * 1.08;
          const foxY = currentPosition.y - nodeRadius * 1.55;
          context.save();
          context.fillStyle = "#ffffff";
          context.beginPath();
          context.arc(foxX, foxY, foxSize / 2 + 6, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.arc(foxX, foxY, foxSize / 2, 0, Math.PI * 2);
          context.clip();
          context.drawImage(foxImage, foxX - foxSize / 2, foxY - foxSize / 2, foxSize, foxSize);
          context.restore();
        }
      } catch {
        // The complete map can still be exported if the mascot image is unavailable.
      }

      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillStyle = "#8175d8";
      context.font = "900 18px Nunito, 'Noto Sans TC', sans-serif";
      context.fillText(t.exportFooter(characterName), surfaceX + 48, surfaceY + surfaceHeight - 42);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error(t.exportFailed)), "image/png");
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = courseTitle.replace(/[\\/:*?"<>|]/g, "-").trim() || t.fileName;
      link.download = `${safeTitle}-${ratio.replace(":", "x")}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setIsExportOpen(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : t.exportTryAgain);
    } finally {
      setIsExporting(null);
    }
  }

  const progress = topics.length > 1 ? Math.round((currentIndex / (topics.length - 1)) * 100) : 100;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={t.brandHome}>
          <span className="brand-mark">彼</span>
          <span>
            <strong>{t.brandName}</strong>
            <small>{t.brandTagline(characterName)}</small>
          </span>
        </a>
        <div className="header-actions">
          <div className="progress-pill" aria-label={t.progress(progress)}>
            <span>🔥</span>
            <strong>{progress}%</strong>
          </div>
          <button className="edit-button" type="button" onClick={openEditor}>
            <span aria-hidden="true">✎</span> {t.edit}
          </button>
          <button className="header-export-button" type="button" onClick={() => { setExportError(""); setIsExportOpen(true); }}>
            <span aria-hidden="true">⇩</span> {t.exportImage}
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>LEARNING QUEST</span> {t.questLine}</p>
          <h1>{t.heroBefore} {characterName}{locale === "zh" ? "，" : ""}<br /><em>{t.heroEmphasis}</em> {t.heroAfter}</h1>
          <p className="hero-description">{t.heroDescription(characterName)}</p>
          <div className="hero-buttons">
            <button className="primary-button" type="button" onClick={beginJourney} disabled={isRunning}>
              <span aria-hidden="true">▶</span> {isRunning ? t.moving(characterName) : t.start(characterName)}
            </button>
            <a className="text-link" href="#course-map">{t.viewMap} <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-visual" aria-label={t.buddyAria(characterName)}>
          <div className="sparkle sparkle-one">✦</div>
          <div className="sparkle sparkle-two">✦</div>
          <div className="code-chip chip-left">{t.knowledge}</div>
          <div className="code-chip chip-right">{t.newSkill}</div>
          <div className="hero-image-ring">
            <img src={characterImage} alt={t.buddyAria(characterName)} />
          </div>
          <div className="speech-bubble">{t.letsGo}<span>♥</span></div>
        </div>
      </section>

      <section className="map-section" id="course-map">
        <div className="section-heading">
          <p className="eyebrow"><span>LEARNING MAP</span> {t.mapLine}</p>
          <h2>{t.mapTitle}</h2>
          <p>{t.mapDescription(characterName)}</p>
        </div>

        <div className="map-shell">
          <div className="map-toolbar">
            <div>
              <span className="chapter-label">{t.currentCourse}</span>
              <strong>{courseTitle}</strong>
            </div>
          </div>

          <div className="map-area" ref={mapRef}>
            <div className="cloud cloud-a" />
            <div className="cloud cloud-b" />
            {foxPosition.ready && (
              <div
                className={`traveling-fox ${isRunning ? "is-traveling" : ""}`}
                style={{ left: foxPosition.x, top: foxPosition.y }}
                aria-hidden="true"
              >
                <span className="fox-name">{characterName}</span>
                <img src={characterImage} alt="" />
              </div>
            )}

            <ol className="course-path">
              {topics.map((topic, index) => {
                const x = xPositions[index % xPositions.length];
                const side = x > 62 ? "left" : "right";
                const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "locked";
                const nextX = xPositions[(index + 1) % xPositions.length];
                const direction = nextX - x;
                const isWideTurn = Math.abs(direction) > 24;
                const angle = direction >= 0 ? (isWideTurn ? 32 : 55) : (isWideTurn ? 148 : 125);
                const distance = isWideTurn ? 34 : 25;
                return (
                  <li
                    className={`course-row ${state}`}
                    key={topic.id}
                    style={{ "--node-x": `${x}%`, "--next-x": `${nextX}%` } as CSSProperties}
                  >
                    {index < topics.length - 1 && (
                      <span
                        className="trail-segment"
                        style={{ "--trail-angle": `${angle}deg`, "--trail-length": `${distance}%` } as CSSProperties}
                        aria-hidden="true"
                      />
                    )}
                    <div className={`node-stage label-${side}`}>
                      <button
                        className="course-node"
                        type="button"
                        ref={(element) => { nodeRefs.current[index] = element; }}
                        onClick={() => setJourneyTarget(index)}
                        aria-label={t.levelAria(index + 1, topic.title)}
                      >
                        <span className="node-motif">{state === "complete" ? "✓" : nodeMotifs[index % nodeMotifs.length]}</span>
                        <span className="node-number">{String(index + 1).padStart(2, "0")}</span>
                      </button>
                      <div className="topic-label">
                        <small>{state === "complete" ? t.completed : state === "current" ? t.currentPosition : t.level(index + 1)}</small>
                        <strong>{topic.title}</strong>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className={`finish-card ${currentIndex === topics.length - 1 ? "reached" : ""}`}>
              <span className="finish-icon">🏆</span>
              <div><small>FINAL DESTINATION</small><strong>{t.finish}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-fox"><img src={characterImage} alt={t.buddyAria(characterName)} /></div>
        <div><strong>{t.stayCurious}</strong><p>{t.nextSkill}</p></div>
        <button type="button" className="primary-button compact" onClick={beginJourney}>{t.again}</button>
      </footer>

      {isEditorOpen && (
        <div className="editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditorOpen(false); }}>
          <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="editor-header">
              <div><p className="eyebrow"><span>COURSE EDITOR</span></p><h2 id="editor-title">{t.editorTitle}</h2></div>
              <button className="icon-button" type="button" onClick={() => setIsEditorOpen(false)} aria-label={t.closeEditor}>×</button>
            </div>
            <p className="editor-help">{t.editorHelp}</p>
            <label className="course-name-field">
              <span>{t.courseName}</span>
              <input value={draftCourseTitle} onChange={(event) => setDraftCourseTitle(event.target.value)} maxLength={40} placeholder={t.coursePlaceholder} />
            </label>
            <section className="character-settings" aria-labelledby="character-settings-title">
              <img className="character-preview" src={draftCharacterImage} alt={t.characterPreview(draftCharacterName || defaults.characterName)} />
              <div className="character-settings-body">
                <strong id="character-settings-title">{t.learningBuddy}</strong>
                <label className="character-name-field">
                  <span>{t.characterName}</span>
                  <input
                    value={draftCharacterName}
                    onChange={(event) => setDraftCharacterName(event.target.value)}
                    maxLength={12}
                    placeholder={defaults.characterName}
                  />
                </label>
                <div className="character-actions">
                  <label className="character-upload-button">
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        void updateDraftCharacterImage(file);
                      }}
                    />
                    {t.uploadCharacter}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftCharacterName(defaults.characterName);
                      setDraftCharacterImage(defaultCharacterImage);
                      setCharacterImageError("");
                    }}
                  >
                    {t.restoreCharacter}
                  </button>
                </div>
                <p className={`character-image-note ${characterImageError ? "is-error" : ""}`} aria-live="polite">
                  {characterImageError || t.imageNote}
                </p>
              </div>
            </section>
            <div className="editor-mode-switch" role="tablist" aria-label={t.editorMethod}>
              <button className={editorMode === "list" ? "active" : ""} type="button" role="tab" aria-selected={editorMode === "list"} onClick={() => changeEditorMode("list")}>{t.editOneByOne}</button>
              <button className={editorMode === "bulk" ? "active" : ""} type="button" role="tab" aria-selected={editorMode === "bulk"} onClick={() => changeEditorMode("bulk")}>{t.bulkInput}</button>
            </div>

            {editorMode === "list" ? (
              <>
                <div className="topic-editor-list">
                  {draftTopics.map((topic, index) => (
                    <div className="topic-editor-row" key={topic.id}>
                      <span className="drag-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="fixed-motif" aria-hidden="true">{nodeMotifs[index % nodeMotifs.length]}</span>
                      <label className="topic-input-label">
                        <span className="sr-only">{t.topicAria(index + 1)}</span>
                        <input value={topic.title} onChange={(event) => updateDraft(topic.id, event.target.value)} maxLength={42} />
                      </label>
                      <div className="row-actions">
                        <button type="button" onClick={() => moveDraft(index, -1)} disabled={index === 0} aria-label={t.moveUp(topic.title)}>↑</button>
                        <button type="button" onClick={() => moveDraft(index, 1)} disabled={index === draftTopics.length - 1} aria-label={t.moveDown(topic.title)}>↓</button>
                        <button className="delete-topic" type="button" onClick={() => setDraftTopics((items) => items.filter((item) => item.id !== topic.id))} disabled={draftTopics.length === 1} aria-label={t.deleteTopic(topic.title)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-topic" type="button" onClick={addDraft}>{t.addTopic}</button>
              </>
            ) : (
              <div className="bulk-editor">
                <div className="bulk-tip"><span aria-hidden="true">↵</span><div><strong>{t.oneLineOneLevel}</strong><p>{t.bulkTip}</p></div></div>
                <label htmlFor="bulk-topics">{t.topicList}</label>
                <textarea
                  id="bulk-topics"
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  placeholder={t.bulkPlaceholder}
                  spellCheck="false"
                />
                <div className="bulk-summary">
                  <span>{t.bulkSummaryBefore} <strong>{topicsFromLines(bulkText, draftTopics).length}</strong> {t.bulkSummaryAfter}</span>
                  <button type="button" onClick={() => changeEditorMode("list")} disabled={topicsFromLines(bulkText, draftTopics).length === 0}>{t.applyBulk}</button>
                </div>
              </div>
            )}
            <div className="editor-footer">
              <button className="ghost-button" type="button" onClick={() => { const resetTopics = defaults.topics.map((topic) => ({ ...topic })); setDraftTopics(resetTopics); setDraftCourseTitle(defaults.courseTitle); setBulkText(resetTopics.map((topic) => topic.title).join("\n")); }}>{t.resetTen}</button>
              <div><button className="text-cancel" type="button" onClick={() => setIsEditorOpen(false)}>{t.cancel}</button><button className="primary-button compact" type="button" onClick={saveDraft}>{t.save}</button></div>
            </div>
          </section>
        </div>
      )}

      {isExportOpen && (
        <div className="export-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isExporting) setIsExportOpen(false); }}>
          <section className="export-panel" role="dialog" aria-modal="true" aria-labelledby="export-title">
            <div className="export-header">
              <div><p className="eyebrow"><span>EXPORT MAP</span></p><h2 id="export-title">{t.exportTitle}</h2></div>
              <button className="icon-button" type="button" onClick={() => setIsExportOpen(false)} disabled={Boolean(isExporting)} aria-label={t.closeExport}>×</button>
            </div>
            <p className="export-help">{t.exportHelp(characterName)}</p>
            <div className="ratio-options">
              <button type="button" className="ratio-card" onClick={() => exportCourseMap("4:3")} disabled={Boolean(isExporting)}>
                <span className="ratio-preview ratio-four-three"><i /><i /><i /></span>
                <span><strong>{isExporting === "4:3" ? t.generating : t.standardSlide}</strong><small>1600 × 1200 PNG</small></span>
              </button>
              <button type="button" className="ratio-card" onClick={() => exportCourseMap("16:9")} disabled={Boolean(isExporting)}>
                <span className="ratio-preview ratio-sixteen-nine"><i /><i /><i /></span>
                <span><strong>{isExporting === "16:9" ? t.generating : t.widescreen}</strong><small>1920 × 1080 PNG</small></span>
              </button>
            </div>
            <p className={`export-note ${exportError ? "is-error" : ""}`} aria-live="polite">{exportError || t.exportNote}</p>
          </section>
        </div>
      )}
    </main>
  );
}
