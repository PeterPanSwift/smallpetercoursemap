"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Topic = {
  id: string;
  title: string;
};

type ExportRatio = "4:3" | "16:9";

const defaultTopics: Topic[] = [
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

const defaultCourseTitle = "SwiftUI 入門冒險";
const defaultCharacterName = "小彼";
const defaultCharacterImage = "/fox.jpg";

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

function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("圖片載入失敗"));
    image.src = source;
  });
}

async function createCharacterImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("請選擇圖片檔案。");
  if (file.size > 10 * 1024 * 1024) throw new Error("圖片請小於 10 MB。");

  const source = URL.createObjectURL(file);
  try {
    const image = await loadCanvasImage(source);
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    if (!cropSize) throw new Error("無法讀取這張圖片。");
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("無法處理這張圖片。");
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
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [courseTitle, setCourseTitle] = useState(defaultCourseTitle);
  const [draftTopics, setDraftTopics] = useState<Topic[]>(defaultTopics);
  const [draftCourseTitle, setDraftCourseTitle] = useState(defaultCourseTitle);
  const [characterName, setCharacterName] = useState(defaultCharacterName);
  const [characterImage, setCharacterImage] = useState(defaultCharacterImage);
  const [draftCharacterName, setDraftCharacterName] = useState(defaultCharacterName);
  const [draftCharacterImage, setDraftCharacterImage] = useState(defaultCharacterImage);
  const [characterImageError, setCharacterImageError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journeyTarget, setJourneyTarget] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportRatio | null>(null);
  const [exportError, setExportError] = useState("");
  const [editorMode, setEditorMode] = useState<"list" | "bulk">("list");
  const [bulkText, setBulkText] = useState(defaultTopics.map((topic) => topic.title).join("\n"));
  const [isHydrated, setIsHydrated] = useState(false);
  const [foxPosition, setFoxPosition] = useState({ x: 0, y: 0, ready: false });
  const mapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isRunning = journeyTarget !== null;

  useEffect(() => {
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
      }
      if (savedTitle?.trim()) setCourseTitle(savedTitle.trim());
      if (savedCharacterName?.trim()) setCharacterName(savedCharacterName.trim());
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
      { id: `topic-${Date.now()}`, title: "新的課程主題" },
    ]);
  }

  async function updateDraftCharacterImage(file?: File) {
    if (!file) return;
    setCharacterImageError("");
    try {
      setDraftCharacterImage(await createCharacterImage(file));
    } catch (error) {
      setCharacterImageError(error instanceof Error ? error.message : "圖片處理失敗，請換一張再試。");
    }
  }

  function saveDraft() {
    const sourceTopics = editorMode === "bulk" ? topicsFromLines(bulkText, draftTopics) : draftTopics;
    const cleaned = sourceTopics
      .map((topic) => ({ id: topic.id, title: topic.title.trim() }))
      .filter((topic) => topic.title.length > 0);
    if (cleaned.length === 0) return;
    setTopics(cleaned);
    setCourseTitle(draftCourseTitle.trim() || "我的學習冒險");
    setCharacterName(draftCharacterName.trim() || defaultCharacterName);
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
      if (!context) throw new Error("無法建立圖片");

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
      context.fillText(`彼學島 · 和${characterName}一起探索`, 154, 65);
      context.fillStyle = "#27233a";
      context.font = `900 ${ratio === "4:3" ? 48 : 52}px Nunito, 'Noto Sans TC', sans-serif`;
      context.fillText(courseTitle, 154, 105);

      const progressText = `${topics.length} 個冒險關卡 · ${progress}% 完成`;
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
        const nodeColor = isComplete ? "#83cfbd" : isCurrent ? "#ff704d" : "#e7e4e9";
        const edgeColor = isComplete ? "#5ba998" : isCurrent ? "#e95634" : "#c9c5cf";

        context.fillStyle = edgeColor;
        context.beginPath();
        context.ellipse(position.x, position.y + nodeRadius * 0.22, nodeRadius * 1.22, nodeRadius, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = nodeColor;
        context.beginPath();
        context.ellipse(position.x, position.y, nodeRadius * 1.22, nodeRadius, 0, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = isComplete || isCurrent ? "#ffffff" : "#77717e";
        context.font = `900 ${Math.max(18, nodeRadius * 0.78)}px Georgia, 'Noto Sans TC', serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(isComplete ? "✓" : nodeMotifs[index % nodeMotifs.length], position.x, position.y - 2);

        context.fillStyle = "#ffffff";
        roundedRect(context, position.x - nodeRadius * 0.54, position.y + nodeRadius * 0.66, nodeRadius * 1.08, Math.max(20, nodeRadius * 0.48), 12);
        context.fill();
        context.fillStyle = isCurrent ? "#e95634" : isComplete ? "#408f7d" : "#6f6a7c";
        context.font = `900 ${Math.max(10, nodeRadius * 0.25)}px Nunito, sans-serif`;
        context.fillText(String(index + 1).padStart(2, "0"), position.x, position.y + nodeRadius * 0.91);

        context.fillStyle = isCurrent ? "#e95634" : isComplete ? "#408f7d" : "#27233a";
        context.font = `800 ${topicFontSize}px 'Noto Sans TC', sans-serif`;
        context.textBaseline = "top";
        drawWrappedText(context, topics[index].title, position.x, position.y + nodeRadius + 20, cellWidth - 20, topicFontSize * 1.28);
      });

      try {
        const foxImage = await loadCanvasImage(characterImage);
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
      context.fillText(`✦  每一步都算數，和${characterName}一起走到終點！`, surfaceX + 48, surfaceY + surfaceHeight - 42);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("圖片輸出失敗")), "image/png");
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = courseTitle.replace(/[\\/:*?"<>|]/g, "-").trim() || "課程地圖";
      link.download = `${safeTitle}-${ratio.replace(":", "x")}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setIsExportOpen(false);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "圖片輸出失敗，請再試一次。");
    } finally {
      setIsExporting(null);
    }
  }

  const progress = topics.length > 1 ? Math.round((currentIndex / (topics.length - 1)) * 100) : 100;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="彼學島首頁">
          <span className="brand-mark">彼</span>
          <span>
            <strong>彼學島</strong>
            <small>和{characterName}一起探索</small>
          </span>
        </a>
        <div className="header-actions">
          <div className="progress-pill" aria-label={`目前進度 ${progress}%`}>
            <span>🔥</span>
            <strong>{progress}%</strong>
          </div>
          <button className="edit-button" type="button" onClick={openEditor}>
            <span aria-hidden="true">✎</span> 編輯角色關卡
          </button>
          <button className="header-export-button" type="button" onClick={() => { setExportError(""); setIsExportOpen(true); }}>
            <span aria-hidden="true">⇩</span> 輸出圖片
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>LEARNING QUEST</span> 任何主題都能變成冒險</p>
          <h1>陪著{characterName}，<br /><em>一步一步</em>完成學習！</h1>
          <p className="hero-description">語言、程式、攝影或任何新技能，都能排成專屬路線。準備好後按下出發，看{characterName}一路走到終點吧。</p>
          <div className="hero-buttons">
            <button className="primary-button" type="button" onClick={beginJourney} disabled={isRunning}>
              <span aria-hidden="true">▶</span> {isRunning ? `${characterName}前進中…` : `${characterName}出發`}
            </button>
            <a className="text-link" href="#course-map">看看課程地圖 <span aria-hidden="true">↓</span></a>
          </div>
          <div className="mini-stats">
            <span><strong>自由編輯角色關卡</strong></span>
          </div>
        </div>
        <div className="hero-visual" aria-label={`學習夥伴${characterName}`}>
          <div className="sparkle sparkle-one">✦</div>
          <div className="sparkle sparkle-two">✦</div>
          <div className="code-chip chip-left">知識 +1</div>
          <div className="code-chip chip-right">新技能</div>
          <div className="hero-image-ring">
            <img src={characterImage} alt={`學習夥伴${characterName}`} />
          </div>
          <div className="speech-bubble">一起出發吧！<span>♥</span></div>
        </div>
      </section>

      <section className="map-section" id="course-map">
        <div className="section-heading">
          <p className="eyebrow"><span>LEARNING MAP</span> 你的專屬學習路線</p>
          <h2>今天想走到哪一關？</h2>
          <p>點一下任一關卡，{characterName}會沿著路線逐關前進；也可以從第一關開始完整播放。</p>
        </div>

        <div className="map-shell">
          <div className="map-toolbar">
            <div>
              <span className="chapter-label">CURRENT COURSE</span>
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
                        aria-label={`第 ${index + 1} 關：${topic.title}`}
                      >
                        <span className="node-motif">{state === "complete" ? "✓" : nodeMotifs[index % nodeMotifs.length]}</span>
                        <span className="node-number">{String(index + 1).padStart(2, "0")}</span>
                      </button>
                      <div className="topic-label">
                        <small>{state === "complete" ? "已走過" : state === "current" ? "目前位置" : `第 ${index + 1} 關`}</small>
                        <strong>{topic.title}</strong>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className={`finish-card ${currentIndex === topics.length - 1 ? "reached" : ""}`}>
              <span className="finish-icon">🏆</span>
              <div><small>FINAL DESTINATION</small><strong>完成這趟學習冒險！</strong></div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-fox"><img src={characterImage} alt={`學習夥伴${characterName}`} /></div>
        <div><strong>保持好奇，繼續探索。</strong><p>下一個會的新技能，可能就從今天的一小步開始。</p></div>
        <button type="button" className="primary-button compact" onClick={beginJourney}>再走一次 ↗</button>
      </footer>

      {isEditorOpen && (
        <div className="editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditorOpen(false); }}>
          <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="editor-header">
              <div><p className="eyebrow"><span>COURSE EDITOR</span></p><h2 id="editor-title">編輯課程與角色</h2></div>
              <button className="icon-button" type="button" onClick={() => setIsEditorOpen(false)} aria-label="關閉編輯器">×</button>
            </div>
            <p className="editor-help">設定課程與學習夥伴，再逐項調整關卡，或一次貼上多行文字快速建立整張課程地圖。</p>
            <label className="course-name-field">
              <span>課程名稱</span>
              <input value={draftCourseTitle} onChange={(event) => setDraftCourseTitle(event.target.value)} maxLength={40} placeholder="例如：日文五十音冒險" />
            </label>
            <section className="character-settings" aria-labelledby="character-settings-title">
              <img className="character-preview" src={draftCharacterImage} alt={`${draftCharacterName || defaultCharacterName}的角色預覽`} />
              <div className="character-settings-body">
                <strong id="character-settings-title">學習夥伴</strong>
                <label className="character-name-field">
                  <span>角色名字</span>
                  <input
                    value={draftCharacterName}
                    onChange={(event) => setDraftCharacterName(event.target.value)}
                    maxLength={12}
                    placeholder={defaultCharacterName}
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
                    上傳角色圖片
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftCharacterName(defaultCharacterName);
                      setDraftCharacterImage(defaultCharacterImage);
                      setCharacterImageError("");
                    }}
                  >
                    恢復小彼
                  </button>
                </div>
                <p className={`character-image-note ${characterImageError ? "is-error" : ""}`} aria-live="polite">
                  {characterImageError || "圖片會裁成正方形並保存在此瀏覽器。"}
                </p>
              </div>
            </section>
            <div className="editor-mode-switch" role="tablist" aria-label="課程編輯方式">
              <button className={editorMode === "list" ? "active" : ""} type="button" role="tab" aria-selected={editorMode === "list"} onClick={() => changeEditorMode("list")}>逐項編輯</button>
              <button className={editorMode === "bulk" ? "active" : ""} type="button" role="tab" aria-selected={editorMode === "bulk"} onClick={() => changeEditorMode("bulk")}>多行快速輸入</button>
            </div>

            {editorMode === "list" ? (
              <>
                <div className="topic-editor-list">
                  {draftTopics.map((topic, index) => (
                    <div className="topic-editor-row" key={topic.id}>
                      <span className="drag-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="fixed-motif" aria-hidden="true">{nodeMotifs[index % nodeMotifs.length]}</span>
                      <label className="topic-input-label">
                        <span className="sr-only">第 {index + 1} 關主題</span>
                        <input value={topic.title} onChange={(event) => updateDraft(topic.id, event.target.value)} maxLength={42} />
                      </label>
                      <div className="row-actions">
                        <button type="button" onClick={() => moveDraft(index, -1)} disabled={index === 0} aria-label={`將 ${topic.title} 往上移`}>↑</button>
                        <button type="button" onClick={() => moveDraft(index, 1)} disabled={index === draftTopics.length - 1} aria-label={`將 ${topic.title} 往下移`}>↓</button>
                        <button className="delete-topic" type="button" onClick={() => setDraftTopics((items) => items.filter((item) => item.id !== topic.id))} disabled={draftTopics.length === 1} aria-label={`刪除 ${topic.title}`}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-topic" type="button" onClick={addDraft}>＋ 新增一個課程主題</button>
              </>
            ) : (
              <div className="bulk-editor">
                <div className="bulk-tip"><span aria-hidden="true">↵</span><div><strong>一行就是一個關卡</strong><p>可直接從記事本或試算表貼上；空白行會自動忽略。</p></div></div>
                <label htmlFor="bulk-topics">課程主題清單</label>
                <textarea
                  id="bulk-topics"
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  placeholder={"攝影構圖基礎\n光線與曝光\n人像攝影實作"}
                  spellCheck="false"
                />
                <div className="bulk-summary">
                  <span>目前會建立 <strong>{topicsFromLines(bulkText, draftTopics).length}</strong> 個關卡</span>
                  <button type="button" onClick={() => changeEditorMode("list")} disabled={topicsFromLines(bulkText, draftTopics).length === 0}>套用並切回逐項編輯 →</button>
                </div>
              </div>
            )}
            <div className="editor-footer">
              <button className="ghost-button" type="button" onClick={() => { const defaults = defaultTopics.map((topic) => ({ ...topic })); setDraftTopics(defaults); setDraftCourseTitle(defaultCourseTitle); setBulkText(defaults.map((topic) => topic.title).join("\n")); }}>還原預設 10 關</button>
              <div><button className="text-cancel" type="button" onClick={() => setIsEditorOpen(false)}>取消</button><button className="primary-button compact" type="button" onClick={saveDraft}>儲存並更新地圖</button></div>
            </div>
          </section>
        </div>
      )}

      {isExportOpen && (
        <div className="export-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isExporting) setIsExportOpen(false); }}>
          <section className="export-panel" role="dialog" aria-modal="true" aria-labelledby="export-title">
            <div className="export-header">
              <div><p className="eyebrow"><span>EXPORT MAP</span></p><h2 id="export-title">輸出課程地圖</h2></div>
              <button className="icon-button" type="button" onClick={() => setIsExportOpen(false)} disabled={Boolean(isExporting)} aria-label="關閉輸出視窗">×</button>
            </div>
            <p className="export-help">選擇投影片比例，系統會把課程名稱、全部關卡、路線與{characterName}排進一張高解析度 PNG。</p>
            <div className="ratio-options">
              <button type="button" className="ratio-card" onClick={() => exportCourseMap("4:3")} disabled={Boolean(isExporting)}>
                <span className="ratio-preview ratio-four-three"><i /><i /><i /></span>
                <span><strong>{isExporting === "4:3" ? "正在產生…" : "4:3 標準投影片"}</strong><small>1600 × 1200 PNG</small></span>
              </button>
              <button type="button" className="ratio-card" onClick={() => exportCourseMap("16:9")} disabled={Boolean(isExporting)}>
                <span className="ratio-preview ratio-sixteen-nine"><i /><i /><i /></span>
                <span><strong>{isExporting === "16:9" ? "正在產生…" : "16:9 寬螢幕"}</strong><small>1920 × 1080 PNG</small></span>
              </button>
            </div>
            <p className={`export-note ${exportError ? "is-error" : ""}`} aria-live="polite">{exportError || "圖片會直接下載到裝置，不會上傳課程內容。"}</p>
          </section>
        </div>
      )}
    </main>
  );
}
