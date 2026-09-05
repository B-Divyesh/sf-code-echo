import { buildReading, cleanSelection } from '../lib/reader';
import { addHistory, loadHistory, loadSettings } from '../lib/storage';
import type { EchoSettings } from '../lib/types';
import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    const host = document.createElement('div');
    host.id = 'code-echo-root';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
    const shadow = host.attachShadow({ mode: 'open' });
    document.documentElement.append(host);

    shadow.innerHTML = `<style>${styles}</style><div id="echo-action" hidden><button type="button" aria-label="Read selected code"><span aria-hidden="true">◖</span> Hear selection</button></div><section id="echo-reader" role="dialog" aria-modal="true" aria-labelledby="echo-title" hidden><header><div><span class="eyebrow">CODE ECHO</span><h2 id="echo-title">Reading selection</h2></div><button class="icon-button" id="echo-close" aria-label="Close reader">×</button></header><div class="chunk-frame"><span id="echo-position">1 / 1</span><code id="echo-chunk" aria-live="polite"></code><span id="echo-spoken" class="spoken"></span></div><div class="controls"><button id="echo-prev" aria-label="Show previous part">← <span>Previous</span></button><button id="echo-play">■ <span>Stop</span></button><button id="echo-next" aria-label="Show next part"><span>Next</span> →</button></div><p id="echo-hint">R replays this part · ← → move · Esc close</p><p id="echo-status" class="status" role="status"></p></section><div id="echo-toast" role="status" aria-live="polite" hidden></div>`;

    const action = shadow.querySelector<HTMLDivElement>('#echo-action')!;
    const reader = shadow.querySelector<HTMLElement>('#echo-reader')!;
    const chunkNode = shadow.querySelector<HTMLElement>('#echo-chunk')!;
    const spokenNode = shadow.querySelector<HTMLElement>('#echo-spoken')!;
    const positionNode = shadow.querySelector<HTMLElement>('#echo-position')!;
    const playButton = shadow.querySelector<HTMLButtonElement>('#echo-play')!;
    const prevButton = shadow.querySelector<HTMLButtonElement>('#echo-prev')!;
    const nextButton = shadow.querySelector<HTMLButtonElement>('#echo-next')!;
    const closeButton = shadow.querySelector<HTMLButtonElement>('#echo-close')!;
    const statusNode = shadow.querySelector<HTMLElement>('#echo-status')!;
    const toast = shadow.querySelector<HTMLElement>('#echo-toast')!;

    let selectedText = '';
    let parts: Array<{ visual: string; spoken: string }> = [];
    let index = 0;
    let settings: EchoSettings | undefined;
    let speaking = false;
    let utterance: SpeechSynthesisUtterance | undefined;
    let previousFocus: HTMLElement | undefined;

    function showToast(message: string) {
      toast.textContent = message;
      toast.hidden = false;
      window.setTimeout(() => { toast.hidden = true; }, 3200);
    }

    function hideAction() {
      action.hidden = true;
    }

    function positionAction() {
      const selection = window.getSelection();
      const text = cleanSelection(selection?.toString() ?? '');
      if (!selection || selection.rangeCount === 0 || !text) return hideAction();
      selectedText = text;
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - 170);
      const top = Math.min(window.innerHeight - 58, Math.max(8, rect.bottom + 8));
      action.style.left = `${left}px`;
      action.style.top = `${top}px`;
      action.hidden = false;
    }

    async function openReader(rawText: string) {
      const text = cleanSelection(rawText);
      if (!text) {
        showToast('Select a code line or identifier first.');
        return;
      }
      if (!('speechSynthesis' in window)) {
        showToast('Speech is not available in this browser. Try a current Chrome build.');
        return;
      }
      if (reader.hidden && document.activeElement instanceof HTMLElement) previousFocus = document.activeElement;
      settings = await loadSettings();
      parts = buildReading(text, settings);
      if (!parts.length) {
        showToast('That selection has no speakable parts with the current punctuation settings.');
        return;
      }
      selectedText = text;
      index = 0;
      reader.dataset.theme = settings.theme;
      reader.style.setProperty('--echo-size', `${settings.textSize}px`);
      reader.hidden = false;
      hideAction();
      await addHistory(text);
      updateChunk();
      closeButton.focus();
      speakCurrent(true);
    }

    function updateChunk() {
      const part = parts[index];
      if (!part) return;
      chunkNode.textContent = part.visual;
      spokenNode.textContent = `Says: ${part.spoken}`;
      positionNode.textContent = `${index + 1} / ${parts.length}`;
      prevButton.disabled = index === 0;
      nextButton.disabled = index === parts.length - 1;
    }

    function stopSpeech() {
      speechSynthesis.cancel();
      speaking = false;
      utterance = undefined;
      playButton.innerHTML = '▶ <span>Read</span>';
      statusNode.textContent = 'Stopped.';
    }

    function speakCurrent(continueThrough: boolean, replayed = false) {
      const current = parts[index];
      if (!settings || !current) return;
      speechSynthesis.cancel();
      utterance = new SpeechSynthesisUtterance(current.spoken);
      utterance.rate = settings.rate;
      utterance.volume = settings.volume;
      playButton.innerHTML = '■ <span>Stop</span>';
      statusNode.textContent = replayed ? `Replaying part ${index + 1}.` : `Reading part ${index + 1}.`;
      utterance.onstart = () => {
        speaking = true;
        playButton.innerHTML = '■ <span>Stop</span>';
        statusNode.textContent = replayed ? `Replaying part ${index + 1}.` : `Reading part ${index + 1}.`;
      };
      utterance.onerror = (event) => {
        speaking = false;
        playButton.innerHTML = '▶ <span>Read</span>';
        statusNode.textContent = event.error === 'canceled' || event.error === 'interrupted'
          ? 'Stopped.'
          : replayed
            ? 'Replay could not start. Check this browser’s voice settings.'
            : 'Speech could not start. Check this browser’s voice settings.';
      };
      utterance.onend = () => {
        if (continueThrough && index < parts.length - 1) {
          index += 1;
          updateChunk();
          speakCurrent(true);
        } else {
          speaking = false;
          playButton.innerHTML = '↻ <span>Replay</span>';
          statusNode.textContent = 'Finished. Press R to replay this part.';
        }
      };
      speechSynthesis.speak(utterance);
    }

    function move(delta: number) {
      index = Math.min(parts.length - 1, Math.max(0, index + delta));
      updateChunk();
      speakCurrent(false);
    }

    function closeReader() {
      stopSpeech();
      reader.hidden = true;
      if (previousFocus?.isConnected) previousFocus.focus();
      previousFocus = undefined;
    }

    function replayLatest() {
      loadHistory().then((history) => history[0] ? openReader(history[0].text) : showToast('Nothing to replay yet. Select code and read it once.'));
    }

    action.querySelector('button')!.addEventListener('click', () => openReader(selectedText));
    closeButton.addEventListener('click', closeReader);
    playButton.addEventListener('click', () => speaking ? stopSpeech() : speakCurrent(false));
    prevButton.addEventListener('click', () => move(-1));
    nextButton.addEventListener('click', () => move(1));

    document.addEventListener('mouseup', (event) => {
      if (event.composedPath().includes(host)) return;
      window.setTimeout(positionAction, 10);
    });
    document.addEventListener('selectionchange', () => {
      if (!window.getSelection()?.toString().trim()) hideAction();
    });
    document.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement;
      const inForm = /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable;
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        openReader(window.getSelection()?.toString() ?? '');
        return;
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        replayLatest();
        return;
      }
      if (reader.hidden || inForm || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape') closeReader();
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key.toLowerCase() === 'r') { event.preventDefault(); speakCurrent(false, true); }
    });
    reader.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = [closeButton, prevButton, playButton, nextButton].filter((button) => !button.disabled);
      const current = shadow.activeElement as HTMLButtonElement | null;
      const currentIndex = current ? controls.indexOf(current) : -1;
      if (event.shiftKey && currentIndex <= 0) {
        event.preventDefault();
        controls.at(-1)?.focus();
      } else if (!event.shiftKey && currentIndex === controls.length - 1) {
        event.preventDefault();
        controls[0]?.focus();
      }
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'echo:read') openReader(message.text ?? '');
      if (message.type === 'echo:read-selection') openReader(window.getSelection()?.toString() ?? '');
      if (message.type === 'echo:replay') replayLatest();
    });
  }
});

const styles = `
  :host { all: initial; color-scheme: light dark; }
  * { box-sizing: border-box; }
  button { min-height: 44px; border: 2px solid #211d19; border-radius: 9px; padding: 8px 13px; background: #fff9ec; color: #211d19; font: 700 14px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace; cursor: pointer; }
  button:hover { background: #f4c542; }
  button:active { transform: translate(2px, 2px); }
  button:focus-visible { outline: 3px solid #155c73; outline-offset: 3px; }
  button:disabled { opacity: .45; cursor: not-allowed; }
  [hidden] { display: none !important; }
  #echo-action { position: fixed; pointer-events: auto; filter: drop-shadow(3px 3px 0 #211d19); }
  #echo-action button { background: #f4c542; white-space: nowrap; }
  #echo-reader { --echo-size: 24px; position: fixed; pointer-events: auto; left: max(12px, env(safe-area-inset-left)); right: max(12px, env(safe-area-inset-right)); bottom: max(12px, env(safe-area-inset-bottom)); width: min(680px, calc(100vw - 24px)); margin-inline: auto; padding: 16px; border: 2px solid #211d19; border-radius: 14px; background: #fff9ec; color: #211d19; box-shadow: 5px 5px 0 #155c73; font: 16px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; animation: echo-in 180ms ease-out; }
  #echo-reader[data-theme="night"] { background:#24201b; color:#fff7e8; border-color:#fff7e8; box-shadow:5px 5px 0 #72cde0; }
  #echo-reader[data-theme="night"] button { background:#24201b; color:#fff7e8; border-color:#fff7e8; }
  #echo-reader[data-theme="contrast"] { background:#000; color:#fff; border-color:#fff; box-shadow:5px 5px 0 #f4c542; }
  #echo-reader[data-theme="contrast"] button { background:#000; color:#fff; border-color:#fff; }
  header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
  .eyebrow { color:#155c73; font-size:11px; font-weight:800; letter-spacing:.14em; }
  [data-theme="night"] .eyebrow, [data-theme="contrast"] .eyebrow { color:#72cde0; }
  h2 { margin:2px 0 12px; font-size:16px; }
  .icon-button { width:44px; padding:0; font-size:24px; }
  .chunk-frame { position:relative; min-height:116px; display:grid; place-items:center; gap:6px; padding:30px 18px 14px; overflow-wrap:anywhere; text-align:center; background:#211d19; color:#fff7e8; border-radius:8px; }
  #echo-position { position:absolute; top:8px; right:10px; color:#c9bead; font-size:12px; font-variant-numeric:tabular-nums; }
  #echo-chunk { display:block; padding:6px 10px; background:#f4c542; color:#211d19; font:700 var(--echo-size)/1.3 ui-monospace, SFMono-Regular, Consolas, monospace; box-decoration-break:clone; -webkit-box-decoration-break:clone; }
  .spoken { display:block; color:#fff7e8; font-size:13px; }
  .controls { display:grid; grid-template-columns:1fr 1.15fr 1fr; gap:8px; margin-top:12px; }
  #echo-play { background:#155c73; color:#fff; border-color:#155c73; }
  #echo-hint, .status { margin:9px 0 0; font-size:12px; color:#625a50; text-align:center; }
  [data-theme="night"] #echo-hint, [data-theme="night"] .status, [data-theme="contrast"] #echo-hint, [data-theme="contrast"] .status { color:#c9bead; }
  #echo-toast { position:fixed; pointer-events:auto; left:50%; bottom:24px; translate:-50% 0; width:min(420px,calc(100vw - 24px)); padding:14px 18px; border:2px solid #211d19; border-radius:10px; background:#fff9ec; color:#211d19; box-shadow:4px 4px 0 #c33e32; font:700 14px/1.4 ui-monospace, monospace; }
  @keyframes echo-in { from { opacity:0; transform:translateY(18px); } }
  @media (max-width: 480px) { #echo-reader { padding:12px; } .controls span { display:none; } #echo-hint { display:none; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; } button:active { transform:none; } }
`;
