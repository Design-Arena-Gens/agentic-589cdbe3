/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { buildScenePrompts, type ScenePrompt } from "@/lib/sceneEngine";

const demoScript = `A lone filmmaker stands on a windswept cliff at sunrise, reading a note that says the world still believes in their vision. They inhale, overwhelmed, as gulls sweep overhead.

Cut to a bustling studio loft where the team powers on monitors, pinning mood boards that mirror the filmmaker’s dream. Coffee steam glows in the morning light while focus and excitement fill the air.

The filmmaker steps into the space and the crew shares a silent nod before cameras roll. Motion rigs glide, lights bloom, and the dream begins to take shape.

As the shoot wraps, the team gathers on the rooftop, watching a projection of their finished sequence against the twilight sky. They celebrate quietly, knowing the story will now reach the world.`;

type CopyState = {
  index: number | null;
  timestamp: number;
};

function EmptyState() {
  return (
    <div className="empty-state">
      <h2>No scenes yet</h2>
      <p>Paste a script, generate prompts, and we&apos;ll break it into cinematic shots ready for Veo 3 or Kling.</p>
    </div>
  );
}

function SceneCard({ scene, onCopy, copied }: { scene: ScenePrompt; onCopy: (prompt: string, index: number) => void; copied: boolean }) {
  return (
    <article className="scene-card">
      <header className="scene-heading">
        <span className="scene-number">Scene {scene.index}</span>
        <button type="button" className={clsx("copy-button", copied && "copy-button__active")} onClick={() => onCopy(scene.prompt, scene.index)}>
          {copied ? "Copied" : "Copy Prompt"}
        </button>
      </header>
      <p className="scene-script">{scene.scriptSlice}</p>
      <div className="scene-metadata">
        <span>{scene.mood}</span>
        <span>{scene.lighting}</span>
        <span>{scene.movement}</span>
        <span>{scene.style}</span>
      </div>
      <div className="scene-prompt-block">
        <span className="prompt-label">Video Prompt</span>
        <p className="scene-prompt">{scene.prompt}</p>
      </div>
    </article>
  );
}

export default function Home() {
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<ScenePrompt[]>([]);
  const [touched, setTouched] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>({ index: null, timestamp: 0 });

  const hasScript = script.trim().length > 0;
  const fieldError = touched && !hasScript ? "Please paste a script before generating prompts." : "";

  const handleGenerate = useCallback(() => {
    setTouched(true);
    const trimmed = script.trim();
    if (!trimmed) {
      setScenes([]);
      return;
    }

    const generated = buildScenePrompts(trimmed);
    setScenes(generated);
  }, [script]);

  const handleUseDemo = useCallback(() => {
    setScript(demoScript);
    setTouched(false);
    const generated = buildScenePrompts(demoScript);
    setScenes(generated);
  }, []);

  const handleCopy = useCallback(async (prompt: string, index: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState({ index, timestamp: Date.now() });
    } catch {
      setCopyState({ index: null, timestamp: Date.now() });
    }
  }, []);

  const summary = useMemo(() => {
    if (scenes.length === 0) {
      return "";
    }

    return `${scenes.length} scene${scenes.length > 1 ? "s" : ""} ready for upload.`;
  }, [scenes]);

  return (
    <main className="page">
      <section className="panel panel--input">
        <div className="panel-header">
          <h1>Agentic Video Prompt Builder</h1>
          <p>Transform any script into Veo 3 or Kling-ready cinematic cues. Optimized for 9:16 vertical delivery with smooth emotional flow.</p>
        </div>
        <label htmlFor="script-input" className="input-label">
          Production Script
        </label>
        <textarea
          id="script-input"
          className={clsx("script-input", fieldError && "script-input__error")}
          placeholder="Paste your short-form script here. We will split it into 2–4 second scenes and craft detailed prompts."
          value={script}
          onChange={(event) => setScript(event.target.value)}
          rows={14}
        />
        {fieldError ? <span className="input-error">{fieldError}</span> : null}
        <div className="actions">
          <button type="button" className="cta-button" onClick={handleGenerate}>
            Generate Prompts
          </button>
          <button type="button" className="ghost-button" onClick={handleUseDemo}>
            Try Demo Script
          </button>
        </div>
        {summary ? <div className="summary-chip">{summary}</div> : null}
      </section>
      <section className="panel panel--output">
        <div className="panel-header">
          <h2>Scene Breakdown</h2>
          <p>Prompts are phrased for safe, cinematic vertical video generation. Copy scene-by-scene directly into Veo 3 or Kling AI.</p>
        </div>
        {scenes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="scene-grid">
            {scenes.map((scene) => (
              <SceneCard key={scene.index} scene={scene} onCopy={handleCopy} copied={copyState.index === scene.index} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
