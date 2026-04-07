"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ChatArea: () => ChatArea,
  LearnPopup: () => LearnPopup,
  LearnSession: () => LearnSession,
  LearnSidebar: () => LearnSidebar,
  NoraLearnProvider: () => NoraLearnProvider,
  PrerequisiteDialog: () => PrerequisiteDialog,
  StepMessage: () => StepMessage,
  StepPopover: () => StepPopover,
  advanceStep: () => advanceStep,
  cleanupDemoDocuments: () => cleanupDemoDocuments,
  completeLearn: () => completeLearn,
  escapeHtml: () => escapeHtml,
  executeAction: () => executeAction,
  executeMany: () => executeMany,
  findVisibleElement: () => findVisibleElement,
  getAvailableLearns: () => getAvailableLearns,
  getBrowserActions: () => getBrowserActions,
  getCurrentUser: () => getCurrentUser,
  getLearnState: () => getLearnState,
  getStepAsMessage: () => getStepAsMessage,
  getThreadMessages: () => getThreadMessages,
  getUserAvatarUrl: () => getUserAvatarUrl,
  highlight: () => highlight,
  pauseLearn: () => pauseLearn,
  removeHighlight: () => removeHighlight,
  renderMarkdown: () => renderMarkdown,
  resetLearn: () => resetLearn,
  sendMessageInThread: () => sendMessageInThread,
  setCsrfToken: () => setCsrfToken,
  sleep: () => sleep,
  startConversation: () => startConversation,
  startLearn: () => startLearn,
  translate: () => translate,
  useAvailableLearns: () => useAvailableLearns,
  useLearnSession: () => useLearnSession,
  useNoraLearn: () => useNoraLearn,
  useRouteChange: () => useRouteChange
});
module.exports = __toCommonJS(index_exports);

// src/components/NoraLearnProvider.tsx
var import_react9 = require("react");

// src/core/api.ts
var _csrfToken;
function setCsrfToken(token) {
  _csrfToken = token;
}
function getCsrfToken() {
  return _csrfToken || window.csrf_token || "None";
}
async function frappePost(method, args = {}) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(args)) {
    if (value !== void 0 && value !== null) {
      formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }
  }
  const response = await fetch(`/api/method/${method}`, {
    method: "POST",
    headers: { "X-Frappe-CSRF-Token": getCsrfToken() },
    body: formData
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.message;
}
async function startLearn(learnName, skipPrerequisites = false) {
  return frappePost("nora.api.learn_engine.start_learn", {
    learn_name: learnName,
    skip_prerequisites: skipPrerequisites ? 1 : 0
  });
}
async function getLearnState(learnName) {
  return frappePost("nora.api.learn_engine.get_learn_state", {
    learn_name: learnName
  });
}
async function getStepAsMessage(learnName, stepIndex, isTest = false) {
  return frappePost("nora.api.learn_engine.get_step_as_message", {
    learn_name: learnName,
    step_index: stepIndex,
    is_test: isTest ? 1 : 0
  });
}
async function advanceStep(learnName) {
  return frappePost("nora.api.learn_engine.advance_step", {
    learn_name: learnName
  });
}
async function pauseLearn(learnName) {
  return frappePost("nora.api.learn_engine.pause_learn", {
    learn_name: learnName
  });
}
async function completeLearn(learnName) {
  return frappePost("nora.api.learn_engine.complete_learn", {
    learn_name: learnName
  });
}
async function resetLearn(learnName) {
  return frappePost("nora.api.learn_engine.reset_learn", {
    learn_name: learnName
  });
}
async function getAvailableLearns() {
  return frappePost(
    "nora.api.learn_engine.get_available_learns",
    {}
  );
}
async function cleanupDemoDocuments(learnName) {
  try {
    await frappePost("nora.api.learn_engine.cleanup_nora_demo_documents", {
      learn_name: learnName
    });
  } catch {
  }
}
async function startConversation(message, context) {
  return frappePost(
    "nora.api.quick_chat.start_conversation",
    { message, context }
  );
}
async function sendMessageInThread(threadId, message, context) {
  return frappePost(
    "nora.api.quick_chat.send_message_in_thread",
    { thread_id: threadId, message, context }
  );
}
async function getThreadMessages(threadId) {
  return frappePost(
    "nora.api.quick_chat.get_thread_messages",
    { thread_id: threadId }
  );
}
async function getBrowserActions(threadId) {
  return frappePost(
    "nora.api.quick_chat.get_browser_actions",
    { thread_id: threadId }
  );
}

// src/core/utils.ts
var ESC_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (ch) => ESC_MAP[ch] || ch);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function renderMarkdown(text) {
  if (!text) return "";
  let html = escapeHtml(text);
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code class="nora-ls-code">$1</code>');
  html = html.replace(
    /((?:^|<br>)\s*[-*]\s+.+(?:<br>\s*[-*]\s+.+)*)/g,
    (block) => {
      const items = block.split("<br>").map((line) => {
        const m = line.match(/^\s*[-*]\s+(.+)/);
        return m ? "<li>" + m[1] + "</li>" : line;
      }).join("");
      return '<ul style="margin:4px 0;padding-left:20px;">' + items + "</ul>";
    }
  );
  html = html.replace(/\n/g, "<br>");
  return html;
}
function translate(key, customFn) {
  if (customFn) return customFn(key);
  return window.frappe?._messages?.[key] || key;
}
function getUserAvatarUrl(user) {
  if (!user) user = window.frappe?.boot?.user?.name;
  if (!user) return null;
  const info = window.frappe?.boot?.user_info?.[user];
  return info?.image || null;
}
function getCurrentUser() {
  const boot = window.frappe?.boot;
  const name = boot?.user?.name || "Guest";
  const fullName = boot?.user?.full_name || boot?.user_info?.[name]?.fullname || name;
  return { name, fullName };
}

// src/core/browser-actions.ts
var _highlightedElement = null;
function highlight(element, options) {
  removeHighlight();
  const color = options?.glow || "#7c3aed";
  const persistent = options?.persistent !== false;
  element._noraOriginalStyles = {
    outline: element.style.outline,
    boxShadow: element.style.boxShadow,
    animation: element.style.animation
  };
  element.style.outline = `2px solid ${color}`;
  element.style.boxShadow = `0 0 12px 4px ${color}40, 0 0 24px 8px ${color}20`;
  element.style.animation = "nora-highlight-pulse 1.5s ease-in-out infinite";
  if (!document.getElementById("nora-highlight-keyframes")) {
    const style = document.createElement("style");
    style.id = "nora-highlight-keyframes";
    style.textContent = `
      @keyframes nora-highlight-pulse {
        0%, 100% { box-shadow: 0 0 12px 4px ${color}40, 0 0 24px 8px ${color}20; }
        50% { box-shadow: 0 0 18px 6px ${color}60, 0 0 36px 12px ${color}30; }
      }
    `;
    document.head.appendChild(style);
  }
  _highlightedElement = element;
  element._noraHighlighted = true;
  if (!persistent) {
    setTimeout(() => removeHighlight(), options?.duration || 3e3);
  }
}
function removeHighlight() {
  if (_highlightedElement) {
    const el = _highlightedElement;
    if (el._noraOriginalStyles) {
      el.style.outline = el._noraOriginalStyles.outline || "";
      el.style.boxShadow = el._noraOriginalStyles.boxShadow || "";
      el.style.animation = el._noraOriginalStyles.animation || "";
      el._noraOriginalStyles = void 0;
    }
    ;
    el._noraHighlighted = false;
    _highlightedElement = null;
  }
  document.querySelectorAll('[style*="nora-highlight-pulse"]').forEach((el) => {
    const htmlEl = el;
    if (htmlEl._noraOriginalStyles) {
      htmlEl.style.outline = htmlEl._noraOriginalStyles.outline || "";
      htmlEl.style.boxShadow = htmlEl._noraOriginalStyles.boxShadow || "";
      htmlEl.style.animation = htmlEl._noraOriginalStyles.animation || "";
      htmlEl._noraOriginalStyles = void 0;
    } else {
      ;
      el.style.outline = "";
      el.style.boxShadow = "";
      el.style.animation = "";
    }
  });
}
function findVisibleElement(selector) {
  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const parseContains = (sel) => {
    const m = sel.match(/:contains\(['"]?([^'")\]]+)['"]?\)/);
    if (!m) return null;
    return { base: sel.replace(/:contains\(['"]?[^'")\]]+['"]?\)/, "").trim() || "*", text: m[1].toLowerCase() };
  };
  const queryAll = (root, sel) => {
    if (sel.includes(":contains(") && sel.includes(",")) {
      const results = [];
      const parts = sel.split(/,(?![^(]*\))/);
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const parsed2 = parseContains(trimmed);
        if (parsed2) {
          try {
            results.push(...Array.from(root.querySelectorAll(parsed2.base)).filter(
              (el) => el.textContent?.toLowerCase().includes(parsed2.text)
            ));
          } catch {
          }
        } else {
          try {
            results.push(...Array.from(root.querySelectorAll(trimmed)));
          } catch {
          }
        }
      }
      return results;
    }
    const parsed = parseContains(sel);
    if (parsed) {
      return Array.from(root.querySelectorAll(parsed.base)).filter(
        (el) => el.textContent?.toLowerCase().includes(parsed.text)
      );
    }
    try {
      return Array.from(root.querySelectorAll(sel));
    } catch {
      return [];
    }
  };
  const modal = document.querySelector(".modal.show, .modal.in");
  if (modal) {
    for (const el of queryAll(modal, selector)) {
      if (isVisible(el)) return el;
    }
    try {
      for (const el of modal.querySelectorAll(`[data-fieldname="${selector}"]`)) {
        if (isVisible(el)) return el;
      }
    } catch {
    }
  }
  for (const el of queryAll(document, selector)) {
    if (isVisible(el)) return el;
  }
  try {
    for (const el of document.querySelectorAll(`[data-fieldname="${selector}"]`)) {
      if (isVisible(el)) return el;
    }
  } catch {
  }
  return null;
}
async function executeAction(action) {
  switch (action.action) {
    case "navigate":
      if (action.url) {
        window.location.href = action.url;
      }
      break;
    case "click": {
      const el = action.selector ? findVisibleElement(action.selector) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(200);
        el.click();
      }
      break;
    }
    case "set_value": {
      const el = action.selector ? findVisibleElement(action.selector) : action.fieldname ? findVisibleElement(`[data-fieldname="${action.fieldname}"]`) : null;
      if (el) {
        const input = el.matches("input, textarea, select") ? el : el.querySelector("input, textarea, select");
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, action.value || "");
          } else {
            input.value = action.value || "";
          }
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      break;
    }
    case "highlight": {
      const el = action.selector ? findVisibleElement(action.selector) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(200);
        highlight(el, action.options);
      }
      break;
    }
    case "scroll": {
      const el = action.selector ? findVisibleElement(action.selector) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      break;
    }
    case "focus": {
      const el = action.selector ? findVisibleElement(action.selector) : null;
      if (el) {
        el.focus();
      }
      break;
    }
  }
}
async function executeMany(actions) {
  for (const action of actions) {
    await executeAction(action);
    await sleep(300);
  }
}
async function executeHighlightActions(actions) {
  let targetEl = null;
  for (const action of actions) {
    if (action.selector) {
      const el = findVisibleElement(action.selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(200);
        highlight(el, action.options);
        if (!targetEl) targetEl = el;
      }
    }
  }
  return targetEl;
}

// src/core/session.ts
var LOCAL_KEY = "nora_active_learn";
var MAX_RESUME_AGE = 6e5;
var MAX_LOCAL_AGE = 36e5;
var LearnSession = class {
  constructor(learnName, onEvent, config = {}, skipPrerequisites = false) {
    this.state = null;
    this.isActive = false;
    this.currentStep = null;
    this._watchInterval = null;
    this._pageChangeCleanup = null;
    this._clickAdvanceHandler = null;
    this._clickAdvanceTarget = null;
    this._advancing = false;
    this._popoverEl = null;
    this.learnName = learnName;
    this._onEvent = onEvent;
    this._config = config;
    this.skipPrerequisites = skipPrerequisites;
  }
  // ========== Lifecycle ==========
  async start() {
    try {
      const result = await startLearn(this.learnName, this.skipPrerequisites);
      if (!result.success) {
        if (result.unmet_prerequisites) {
          this._emit({ type: "error", message: "prerequisites_required" });
        }
        return false;
      }
      this.state = result;
      if (result.recommended_prerequisites?.length && !this.skipPrerequisites) {
      }
      this.isActive = true;
      this._emit({ type: "started", state: result });
      if (result.entry_route) {
        const navigate = this._config.navigate || ((url) => {
          window.location.href = url;
        });
        const getCurrentRoute = this._config.getCurrentRoute || (() => window.location.pathname);
        const currentPath = getCurrentRoute();
        if (currentPath !== result.entry_route) {
          navigate(result.entry_route);
          this._saveLocalState();
          return true;
        }
      }
      this._saveLocalState();
      this._bindPageChange();
      await this._waitForPageReady();
      await sleep(500);
      await this._fetchAndDisplayStep();
      return true;
    } catch (e) {
      console.error("[Nora Learn] start() error:", e);
      this._emit({ type: "error", message: "Error starting learn" });
      return false;
    }
  }
  async resume() {
    try {
      const saved = this._loadLocalState();
      if (!saved || saved.learn_name !== this.learnName) return false;
      let result = await getLearnState(this.learnName);
      if (!result?.success) {
        result = await startLearn(this.learnName);
        if (!result?.success) return false;
      }
      this.state = result;
      this.isActive = true;
      this._emit({ type: "started", state: result });
      if (saved.current_step && saved.current_step > (result.current_step || 0)) {
        this.state.current_step = saved.current_step;
      }
      this._bindPageChange();
      this._saveLocalState();
      await this._fetchAndDisplayStep();
      return true;
    } catch (e) {
      console.error("[Nora Learn] resume() error:", e);
      return false;
    }
  }
  async pause() {
    this._stopWatching();
    this.isActive = false;
    try {
      await pauseLearn(this.learnName);
    } catch {
    }
    removeHighlight();
    this._unbindPageChange();
    this._dismissPopover();
    this._saveLocalState();
    this._emit({ type: "paused" });
  }
  stop() {
    this._stopWatching();
    this.isActive = false;
    removeHighlight();
    this._unbindPageChange();
    this._dismissPopover();
    this._clearClickListener();
    this._clearLocalState();
    this._emit({ type: "stopped" });
  }
  async restart() {
    this._stopWatching();
    removeHighlight();
    this._dismissPopover();
    this._unbindPageChange();
    this.isActive = true;
    try {
      await resetLearn(this.learnName);
    } catch {
    }
    this.state = null;
    this.currentStep = null;
    this._clearLocalState();
    await this.start();
  }
  async advanceStep() {
    if (this._advancing) return;
    this._advancing = true;
    if (!this.isActive || !this.state) {
      this._advancing = false;
      return;
    }
    if (this.currentStep?.highlight_actions?.length) {
      const selector = this.currentStep.highlight_actions[0].selector;
      if (selector) {
        const el = findVisibleElement(selector);
        if (el?.closest(".form-tabs, .nav")) {
          el.click();
          await sleep(300);
        }
      }
    }
    this._stopWatching();
    removeHighlight();
    this._dismissPopover();
    try {
      const nextStep = (this.state.current_step || 0) + 1;
      if (this.state.is_test) {
        if (nextStep >= this.state.total_steps) {
          this._onComplete();
          return;
        }
        this.state.current_step = nextStep;
      } else {
        const result = await advanceStep(this.learnName);
        if (!result?.success) return;
        if (result.completed) {
          this._onComplete();
          return;
        }
        this.state.current_step = result.current_step;
      }
      this._saveLocalState();
      this._emit({ type: "advanced", stepIndex: this.state.current_step, totalSteps: this.state.total_steps });
      await sleep(500);
      await this._fetchAndDisplayStep();
    } catch (e) {
      console.error("[Nora Learn] advanceStep() error:", e);
    } finally {
      this._advancing = false;
    }
  }
  async executeCurrentStep() {
    if (!this.currentStep?.execute_actions) return;
    try {
      await executeMany(this.currentStep.execute_actions);
      if (this.currentStep.action_type === "click" || this.currentStep.action_type === "navigate") {
        await sleep(2e3);
      }
      if (!this.currentStep.wait_condition) {
        if (this.currentStep.is_last_step) {
          this._onComplete();
        } else {
          await this.advanceStep();
        }
      }
    } catch (e) {
      console.error("[Nora Learn] executeCurrentStep() error:", e);
    }
  }
  // ========== Internal: Step Management ==========
  async _fetchAndDisplayStep() {
    if (!this.isActive || !this.state) return;
    const stepIndex = this.state.current_step;
    try {
      const step = await getStepAsMessage(
        this.learnName,
        stepIndex,
        this.state.is_test || false
      );
      if (!step.success) return;
      this.currentStep = step;
      if (step.skip_if) {
        try {
          if (new Function(`return !!(${step.skip_if})`)()) {
            if (step.is_last_step) {
              this._onComplete();
            } else {
              await this.advanceStep();
            }
            return;
          }
        } catch {
        }
      }
      if (step.allow_skip && step.wait_condition) {
        try {
          if (new Function(`return !!(${step.wait_condition})`)()) {
            if (step.is_last_step) {
              this._onComplete();
            } else {
              await this.advanceStep();
            }
            return;
          }
        } catch {
        }
      }
      this._dismissPopover();
      removeHighlight();
      if (step.highlight_actions?.length) {
        await sleep(300);
        await this._highlightTarget(step);
      }
      this._emit({
        type: "step",
        step,
        stepIndex,
        totalSteps: this.state.total_steps
      });
      if (step.wait_condition && !step.is_checkpoint) {
        this._startWatchingCondition(step);
      }
    } catch (e) {
      console.error("[Nora Learn] _fetchAndDisplayStep() error:", e);
    }
  }
  async _highlightTarget(step) {
    const targetEl = await executeHighlightActions(step.highlight_actions || []);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      this._emit({ type: "highlight", element: targetEl, rect });
      this._emit({ type: "popover", element: targetEl, step });
      this._clearClickListener();
      const isInput = targetEl.matches("input, textarea, select, [contenteditable]") || !!targetEl.querySelector("input, textarea, select, [contenteditable]");
      if (!isInput) {
        this._clickAdvanceHandler = () => {
          this._clearClickListener();
          setTimeout(() => {
            if (this.isActive) this.advanceStep();
          }, 500);
        };
        targetEl.addEventListener("click", this._clickAdvanceHandler, { once: true });
        this._clickAdvanceTarget = targetEl;
      }
    } else {
      this._emit({ type: "highlight", element: null, rect: null });
    }
  }
  _onComplete() {
    this._stopWatching();
    this.isActive = false;
    removeHighlight();
    this._dismissPopover();
    this._unbindPageChange();
    this._clearClickListener();
    this._clearLocalState();
    const nextLearn = this.state?.next_learn;
    const nextLearnTitle = this.state?.next_learn_title;
    cleanupDemoDocuments(this.learnName);
    this._emit({
      type: "completed",
      nextLearn: nextLearn || void 0,
      nextLearnTitle: nextLearnTitle || void 0
    });
  }
  // ========== Condition Watching ==========
  _startWatchingCondition(step) {
    this._stopWatching();
    const condition = step.wait_condition;
    if (!condition) return;
    const deadline = Date.now() + (step.wait_timeout || 30) * 1e3;
    this._watchInterval = setInterval(() => {
      if (!this.isActive) {
        this._stopWatching();
        return;
      }
      try {
        if (new Function(`return !!(${condition})`)()) {
          this._stopWatching();
          if (step.is_last_step) {
            this._onComplete();
          } else {
            this.advanceStep();
          }
        }
      } catch {
      }
      if (Date.now() >= deadline) {
        this._stopWatching();
        this._emit({ type: "error", message: "timeout" });
      }
    }, 500);
  }
  _stopWatching() {
    if (this._watchInterval) {
      clearInterval(this._watchInterval);
      this._watchInterval = null;
    }
  }
  // ========== Page Change Handling ==========
  _bindPageChange() {
    this._unbindPageChange();
    const handler = () => {
      if (!this.isActive) return;
      setTimeout(() => {
        if (!this.isActive || !this.currentStep) return;
        if (this.currentStep.highlight_actions?.length) {
          this._highlightTarget(this.currentStep);
        }
        if (this.currentStep.wait_condition && !this.currentStep.is_checkpoint) {
          this._startWatchingCondition(this.currentStep);
        }
      }, 1e3);
    };
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = (...args) => {
      origPush(...args);
      handler();
    };
    history.replaceState = (...args) => {
      origReplace(...args);
      handler();
    };
    const popstateHandler = () => handler();
    window.addEventListener("popstate", popstateHandler);
    this._pageChangeCleanup = () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", popstateHandler);
    };
  }
  _unbindPageChange() {
    if (this._pageChangeCleanup) {
      this._pageChangeCleanup();
      this._pageChangeCleanup = null;
    }
  }
  // ========== Popover Management ==========
  _dismissPopover() {
    if (this._popoverEl) {
      this._popoverEl.remove();
      this._popoverEl = null;
    }
    document.getElementById("nora-step-popover")?.remove();
  }
  // ========== Click Listener ==========
  _clearClickListener() {
    if (this._clickAdvanceTarget && this._clickAdvanceHandler) {
      this._clickAdvanceTarget.removeEventListener("click", this._clickAdvanceHandler);
      this._clickAdvanceHandler = null;
      this._clickAdvanceTarget = null;
    }
  }
  // ========== Local State Persistence ==========
  _saveLocalState() {
    if (!this.state) return;
    try {
      const data = {
        learn_name: this.learnName,
        current_step: this.state.current_step,
        total_steps: this.state.total_steps,
        title: this.state.title || this.state.learn_title || "",
        timestamp: Date.now()
      };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch {
    }
  }
  _loadLocalState() {
    try {
      const d = localStorage.getItem(LOCAL_KEY);
      if (!d) return null;
      const p = JSON.parse(d);
      if (Date.now() - p.timestamp > MAX_LOCAL_AGE) {
        this._clearLocalState();
        return null;
      }
      return p;
    } catch {
      return null;
    }
  }
  _clearLocalState() {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {
    }
  }
  // ========== Utilities ==========
  async _waitForPageReady() {
    const maxWait = 5e3;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      if (document.readyState === "complete") return;
      await sleep(200);
    }
  }
  _emit(event) {
    try {
      this._onEvent(event);
    } catch (e) {
      console.error("[Nora Learn] Event handler error:", e);
    }
  }
  // ========== Static: Auto-resume ==========
  static getSavedState() {
    try {
      const d = localStorage.getItem(LOCAL_KEY);
      if (!d) return null;
      const p = JSON.parse(d);
      if (Date.now() - p.timestamp > MAX_RESUME_AGE) {
        localStorage.removeItem(LOCAL_KEY);
        return null;
      }
      return p;
    } catch {
      return null;
    }
  }
  static clearSavedState() {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {
    }
  }
};

// src/hooks/useLearnSession.ts
var import_react = require("react");
var INITIAL_STATE = {
  isActive: false,
  state: null,
  currentStep: null,
  stepIndex: 0,
  totalSteps: 0,
  highlightedElement: null,
  highlightRect: null,
  popoverElement: null,
  popoverStep: null,
  isCompleted: false,
  error: null
};
function useLearnSession(config = {}) {
  const [sessionState, setSessionState] = (0, import_react.useState)(INITIAL_STATE);
  const sessionRef = (0, import_react.useRef)(null);
  const configRef = (0, import_react.useRef)(config);
  configRef.current = config;
  (0, import_react.useEffect)(() => {
    return () => {
      if (sessionRef.current?.isActive) {
        sessionRef.current.stop();
      }
    };
  }, []);
  const handleEvent = (0, import_react.useCallback)((event) => {
    switch (event.type) {
      case "started":
        setSessionState((prev) => ({
          ...prev,
          isActive: true,
          state: event.state,
          stepIndex: event.state.current_step,
          totalSteps: event.state.total_steps,
          isCompleted: false,
          error: null
        }));
        break;
      case "step":
        setSessionState((prev) => ({
          ...prev,
          currentStep: event.step,
          stepIndex: event.stepIndex,
          totalSteps: event.totalSteps
        }));
        break;
      case "advanced":
        setSessionState((prev) => ({
          ...prev,
          stepIndex: event.stepIndex,
          totalSteps: event.totalSteps
        }));
        break;
      case "highlight":
        setSessionState((prev) => ({
          ...prev,
          highlightedElement: event.element,
          highlightRect: event.rect
        }));
        break;
      case "popover":
        setSessionState((prev) => ({
          ...prev,
          popoverElement: event.element,
          popoverStep: event.step
        }));
        break;
      case "paused":
        setSessionState((prev) => ({
          ...prev,
          isActive: false
        }));
        break;
      case "stopped":
        setSessionState(INITIAL_STATE);
        sessionRef.current = null;
        break;
      case "completed":
        setSessionState((prev) => ({
          ...prev,
          isActive: false,
          isCompleted: true,
          nextLearn: event.nextLearn,
          nextLearnTitle: event.nextLearnTitle
        }));
        break;
      case "error":
        setSessionState((prev) => ({
          ...prev,
          error: event.message
        }));
        break;
    }
  }, []);
  const startLearn2 = (0, import_react.useCallback)(async (learnName, skipPrerequisites = false) => {
    if (sessionRef.current?.isActive) {
      sessionRef.current.stop();
    }
    const session = new LearnSession(learnName, handleEvent, configRef.current, skipPrerequisites);
    sessionRef.current = session;
    return session.start();
  }, [handleEvent]);
  const resumeLearn = (0, import_react.useCallback)(async (learnName) => {
    if (sessionRef.current?.isActive) {
      sessionRef.current.stop();
    }
    const session = new LearnSession(learnName, handleEvent, configRef.current);
    sessionRef.current = session;
    return session.resume();
  }, [handleEvent]);
  const pauseLearn2 = (0, import_react.useCallback)(async () => {
    if (sessionRef.current?.isActive) {
      await sessionRef.current.pause();
    }
  }, []);
  const stopLearn = (0, import_react.useCallback)(() => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
  }, []);
  const restartLearn = (0, import_react.useCallback)(async () => {
    if (sessionRef.current) {
      await sessionRef.current.restart();
    }
  }, []);
  const advanceStep2 = (0, import_react.useCallback)(async () => {
    if (sessionRef.current?.isActive) {
      await sessionRef.current.advanceStep();
    }
  }, []);
  const executeStep = (0, import_react.useCallback)(async () => {
    if (sessionRef.current?.isActive) {
      await sessionRef.current.executeCurrentStep();
    }
  }, []);
  const resetCompleted = (0, import_react.useCallback)(() => {
    setSessionState(INITIAL_STATE);
    sessionRef.current = null;
  }, []);
  return {
    ...sessionState,
    startLearn: startLearn2,
    resumeLearn,
    pauseLearn: pauseLearn2,
    stopLearn,
    restartLearn,
    advanceStep: advanceStep2,
    executeStep,
    resetCompleted,
    session: sessionRef.current
  };
}

// src/hooks/useAvailableLearns.ts
var import_react2 = require("react");
function useAvailableLearns(currentRoute) {
  const [allLearns, setAllLearns] = (0, import_react2.useState)(() => {
    return window.frappe?.boot?.nora_learns || [];
  });
  const [matchingLearns, setMatchingLearns] = (0, import_react2.useState)([]);
  (0, import_react2.useEffect)(() => {
    if (!allLearns.length) {
      setMatchingLearns([]);
      return;
    }
    const snoozed = _getSnoozed();
    const routeStr = currentRoute.replace(/^\//, "");
    if (snoozed["__all__"] && Date.now() < snoozed["__all__"]) {
      setMatchingLearns([]);
      return;
    }
    if (snoozed[routeStr] && Date.now() < snoozed[routeStr]) {
      setMatchingLearns([]);
      return;
    }
    const matching = allLearns.filter((learn) => {
      if (learn.entry_route) {
        const learnRoute = learn.entry_route.replace(/^\//, "");
        if (routeStr.toLowerCase() === learnRoute.toLowerCase()) return true;
        if (routeStr.startsWith(learnRoute.toLowerCase() + "/") || learnRoute.startsWith(routeStr.toLowerCase() + "/")) return true;
      }
      const isHome = currentRoute === "/" || currentRoute === "/app" || currentRoute === "/app/" || currentRoute === "/app/home";
      if (isHome && learn.is_onboarding) return true;
      return false;
    });
    const matchNames = matching.map((l) => l.name);
    matching.sort((a, b) => {
      const aHas = (a.prerequisites || []).some((p) => matchNames.includes(p));
      const bHas = (b.prerequisites || []).some((p) => matchNames.includes(p));
      if (aHas && !bHas) return 1;
      if (!aHas && bHas) return -1;
      return a.name < b.name ? -1 : 1;
    });
    setMatchingLearns(matching);
  }, [allLearns, currentRoute]);
  const snoozeRoute = (0, import_react2.useCallback)((route, scope, hours) => {
    const snoozed = _getSnoozed();
    const expiry = Date.now() + hours * 60 * 60 * 1e3;
    if (scope === "all") {
      snoozed["__all__"] = expiry;
    } else {
      const routeStr = route.replace(/^\//, "");
      snoozed[routeStr] = expiry;
    }
    localStorage.setItem("nora_learn_snoozed", JSON.stringify(snoozed));
    setMatchingLearns([]);
  }, []);
  const refreshLearns = (0, import_react2.useCallback)(async () => {
    try {
      const result = await getAvailableLearns();
      if (result.success && result.learns) {
        setAllLearns(result.learns);
        if (window.frappe?.boot) {
          window.frappe.boot.nora_learns = result.learns;
        }
      }
    } catch {
    }
  }, []);
  return { allLearns, matchingLearns, snoozeRoute, refreshLearns };
}
function _getSnoozed() {
  try {
    const snoozed = JSON.parse(localStorage.getItem("nora_learn_snoozed") || "{}");
    const now = Date.now();
    let changed = false;
    for (const key of Object.keys(snoozed)) {
      if (snoozed[key] < now) {
        delete snoozed[key];
        changed = true;
      }
    }
    if (changed) localStorage.setItem("nora_learn_snoozed", JSON.stringify(snoozed));
    return snoozed;
  } catch {
    return {};
  }
}

// src/hooks/useRouteChange.ts
var import_react3 = require("react");
function useRouteChange(callback) {
  const cbRef = (0, import_react3.useRef)(callback);
  cbRef.current = callback;
  (0, import_react3.useEffect)(() => {
    const notify = () => cbRef.current(window.location.pathname);
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = (...args) => {
      origPush(...args);
      notify();
    };
    history.replaceState = (...args) => {
      origReplace(...args);
      notify();
    };
    const popstateHandler = () => notify();
    window.addEventListener("popstate", popstateHandler);
    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", popstateHandler);
    };
  }, []);
}

// src/components/LearnSidebar.tsx
var import_react6 = require("react");
var import_react_dom = require("react-dom");

// src/components/StepMessage.tsx
var import_react4 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function StepMessage({
  data,
  onDoIt,
  onContinue,
  onValidationFail,
  validationRule,
  validationErrorMessage,
  translateFn
}) {
  const __ = (t) => translate(t, translateFn);
  const buttonsRef = (0, import_react4.useRef)(null);
  const actionableTypes = ["click", "navigate", "set_value", "submit_form"];
  const showDoIt = data.has_execute_actions && actionableTypes.includes(data.action_type);
  const showContinue = !data.has_wait_condition || data.is_checkpoint;
  (0, import_react4.useEffect)(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.classList.remove("nora-ls-buttons-hidden");
    }, 2e3);
    return () => clearTimeout(timer);
  }, [data.step_index]);
  const handleContinue = () => {
    if (validationRule) {
      try {
        if (!new Function(`return !!(${validationRule})`)()) {
          onValidationFail?.(validationErrorMessage || __("Please complete this step first."));
          return;
        }
      } catch {
      }
    }
    onContinue?.();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "nora-ls-step-message", style: { animation: "nora-lp-fadeIn 0.3s ease" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "nora-ls-step-badge", children: [
      __("Step"),
      " ",
      data.step_index + 1,
      "/",
      data.total_steps
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "nora-ls-step-text",
        dangerouslySetInnerHTML: { __html: renderMarkdown(data.explanation) }
      }
    ),
    (showDoIt || showContinue) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: buttonsRef, className: "nora-ls-step-buttons nora-ls-buttons-hidden", children: [
      showDoIt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "nora-ls-btn nora-ls-do-it", onClick: onDoIt, children: __("Do it for me") }),
      showContinue && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "nora-ls-btn nora-ls-continue", onClick: handleContinue, children: [
        __("Continue"),
        " \u25B8"
      ] })
    ] })
  ] });
}

// src/components/ChatArea.tsx
var import_react5 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function ChatArea({
  isExpanded,
  learnName,
  learnTitle,
  currentStep,
  stepIndex,
  totalSteps,
  noraIconUrl,
  translateFn
}) {
  const __ = (t) => translate(t, translateFn);
  const [messages, setMessages] = (0, import_react5.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react5.useState)(false);
  const [threadId, setThreadId] = (0, import_react5.useState)(null);
  const knownMsgNames = (0, import_react5.useRef)(/* @__PURE__ */ new Set());
  const pollRef = (0, import_react5.useRef)(null);
  const pollCountRef = (0, import_react5.useRef)(0);
  const textareaRef = (0, import_react5.useRef)(null);
  const chatMessagesRef = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    if (isExpanded && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isExpanded]);
  (0, import_react5.useEffect)(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);
  (0, import_react5.useEffect)(() => {
    return () => stopPolling();
  }, []);
  const stopPolling = (0, import_react5.useCallback)(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsLoading(false);
  }, []);
  const startPolling = (0, import_react5.useCallback)(() => {
    stopPolling();
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current++;
      if (pollCountRef.current > 240) {
        stopPolling();
        setMessages((prev) => [...prev, {
          id: `timeout-${Date.now()}`,
          role: "assistant",
          text: __("Response is taking too long. Please try again.")
        }]);
        return;
      }
      if (!threadId) return;
      try {
        const result = await getThreadMessages(threadId);
        if (result.success && result.messages) {
          for (const msg of result.messages) {
            if (msg.is_bot && !knownMsgNames.current.has(msg.name)) {
              knownMsgNames.current.add(msg.name);
              setMessages((prev) => [...prev, {
                id: msg.name,
                role: "assistant",
                text: msg.text
              }]);
              stopPolling();
              try {
                const actionsResult = await getBrowserActions(threadId);
                if (actionsResult.success && actionsResult.actions?.length) {
                  for (const action of actionsResult.actions) {
                    await executeAction(action);
                  }
                }
              } catch {
              }
            }
          }
        }
      } catch {
      }
    }, 500);
  }, [threadId, stopPolling, __]);
  const buildContext = (0, import_react5.useCallback)(() => {
    const user2 = getCurrentUser();
    const ctx = {
      route: window.location.pathname,
      user: user2.name,
      user_fullname: user2.fullName
    };
    if (currentStep) {
      ctx.learn_context = {
        learn_name: learnName,
        learn_title: learnTitle,
        current_step: stepIndex,
        total_steps: totalSteps,
        step_title: currentStep.title || "",
        step_action_type: currentStep.action_type || "",
        step_action_target: currentStep.action_target || ""
      };
    }
    return ctx;
  }, [currentStep, learnName, learnTitle, stepIndex, totalSteps]);
  const sendMessage = (0, import_react5.useCallback)(async (text) => {
    if (isLoading || !text.trim()) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, {
      id: `user-${Date.now()}`,
      role: "user",
      text
    }]);
    try {
      const context = JSON.stringify(buildContext());
      if (!threadId) {
        const result = await startConversation(text, context);
        if (result.success && result.thread_id) {
          setThreadId(result.thread_id);
          setTimeout(() => startPolling(), 100);
        }
      } else {
        await sendMessageInThread(threadId, text, context);
        startPolling();
      }
    } catch (e) {
      console.error("[Nora Learn Chat] error:", e);
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        text: __("Sorry, an error occurred. Please try again.")
      }]);
      setIsLoading(false);
    }
  }, [isLoading, threadId, buildContext, startPolling, __]);
  (0, import_react5.useEffect)(() => {
  }, [threadId, startPolling]);
  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleSend = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value.trim();
    if (!text) return;
    textareaRef.current.value = "";
    textareaRef.current.style.height = "auto";
    sendMessage(text);
  };
  const handleInput = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + "px";
  };
  if (!isExpanded) return null;
  const user = getCurrentUser();
  const avatarUrl = getUserAvatarUrl(user.name);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: "nora-lp-chat-area",
      onKeyDown: (e) => e.stopPropagation(),
      onKeyUp: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "nora-lp-chat-messages", ref: chatMessagesRef, children: [
          messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `nora-ls-message ${msg.role === "user" ? "nora-ls-message-user" : "nora-ls-message-bot"}`, children: [
            msg.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "nora-ls-avatar nora-ls-avatar-user", children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { src: avatarUrl, alt: user.name }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { width: 22, height: 22, borderRadius: "50%", background: "#7c3aed", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }, children: user.fullName.charAt(0).toUpperCase() }) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "nora-ls-avatar nora-ls-avatar-bot", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { src: noraIconUrl, alt: "NORA" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "div",
              {
                className: "nora-ls-message-content",
                dangerouslySetInnerHTML: {
                  __html: msg.role === "user" ? escapeHtml(msg.text) : msg.text
                }
              }
            )
          ] }, msg.id)),
          isLoading && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "nora-ls-message nora-ls-message-bot nora-ls-typing", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "nora-ls-avatar nora-ls-avatar-bot", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { src: noraIconUrl, alt: "NORA" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "nora-ls-message-content nora-ls-typing-dots", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", {}),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", {}),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", {})
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "nora-lp-input-wrapper", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "textarea",
            {
              ref: textareaRef,
              className: "nora-lp-textarea",
              placeholder: __("Ask NORA anything..."),
              rows: 1,
              onKeyDown: handleKeyDown,
              onInput: handleInput
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              className: "nora-lp-send",
              title: __("Send"),
              disabled: isLoading,
              onClick: (e) => {
                e.stopPropagation();
                handleSend();
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
              ] })
            }
          )
        ] })
      ]
    }
  );
}

// src/components/LearnSidebar.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function LearnSidebar({
  isOpen,
  title,
  learnName,
  stepIndex,
  totalSteps,
  currentStep,
  highlightRect,
  isCompleted,
  nextLearn,
  nextLearnTitle,
  noraIconUrl = "/assets/nora/images/nora_icon.svg",
  translateFn,
  onClose,
  onFinish,
  onRestart,
  onDoIt,
  onContinue,
  onNextLearn,
  onValidationFail
}) {
  const __ = (t) => translate(t, translateFn);
  const [chatExpanded, setChatExpanded] = (0, import_react6.useState)(false);
  if (!isOpen) return null;
  const pos = computePosition(highlightRect);
  const progress = totalSteps > 0 ? Math.round((stepIndex + 1) / totalSteps * 100) : 0;
  const stepMessageData = currentStep ? {
    step_index: stepIndex,
    total_steps: totalSteps,
    explanation: currentStep.explanation || "",
    action_type: currentStep.action_type,
    is_checkpoint: currentStep.is_checkpoint,
    has_execute_actions: !!currentStep.execute_actions?.length,
    has_wait_condition: !!currentStep.wait_condition
  } : null;
  const sidebar = /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: `nora-lp nora-lp-${pos.h} nora-lp-${pos.v}`,
      onMouseDown: (e) => e.stopPropagation(),
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => e.stopPropagation(),
      onKeyUp: (e) => e.stopPropagation(),
      onKeyPress: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "nora-lp-header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { className: "nora-lp-icon", src: noraIconUrl, alt: "NORA" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "nora-lp-header-text", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "nora-lp-title", children: escapeHtml(title) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "nora-lp-step", children: [
              __("Step"),
              " ",
              stepIndex + 1,
              "/",
              totalSteps
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "nora-lp-header-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "nora-lp-btn", title: __("Restart"), onClick: onRestart, children: "\u21BA" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "nora-lp-btn", title: __("Finish"), onClick: onFinish, children: "\u2713" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "nora-lp-btn close-popup", title: __("Close"), onClick: onClose, children: "\u2715" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "nora-lp-progress", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "nora-lp-progress-bar", style: { width: `${progress}%` } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "nora-lp-messages", children: isCompleted ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          CompletionMessage,
          {
            __,
            nextLearn,
            nextLearnTitle,
            onNextLearn,
            onClose,
            noraIconUrl
          }
        ) : stepMessageData ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          StepMessage,
          {
            data: stepMessageData,
            onDoIt,
            onContinue,
            onValidationFail,
            validationRule: currentStep?.validation_rule,
            validationErrorMessage: currentStep?.on_error_message,
            translateFn
          }
        ) : null }),
        !isCompleted && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "nora-lp-chat-toggle", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            className: "nora-lp-btn nora-lp-chat-btn",
            onClick: (e) => {
              e.stopPropagation();
              setChatExpanded(!chatExpanded);
            },
            children: chatExpanded ? __("Hide chat") + " \u2715" : __("Ask NORA") + " \u{1F4AC}"
          }
        ) }),
        !isCompleted && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          ChatArea,
          {
            isExpanded: chatExpanded,
            learnName,
            learnTitle: title,
            currentStep,
            stepIndex,
            totalSteps,
            noraIconUrl,
            translateFn
          }
        )
      ]
    }
  );
  return (0, import_react_dom.createPortal)(sidebar, document.body);
}
function CompletionMessage({
  __,
  nextLearn,
  nextLearnTitle,
  onNextLearn,
  onClose,
  noraIconUrl
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "nora-ls-message nora-ls-message-bot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "nora-ls-avatar nora-ls-avatar-bot", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: noraIconUrl, alt: "NORA" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "nora-ls-message-content", children: [
        "\u{1F389}",
        " ",
        __("Congratulations! You have completed this learn.")
      ] })
    ] }),
    nextLearn && onNextLearn && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: __("Next recommended learn:") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("br", {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "button",
        {
          className: "nora-ls-btn nora-ls-continue",
          style: { marginTop: 8, width: "100%" },
          onClick: () => onNextLearn(nextLearn),
          children: [
            nextLearnTitle || nextLearn,
            " \u25B8"
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          className: "nora-ls-btn",
          style: { marginTop: 6, width: "100%", background: "rgba(0,0,0,0.05)", color: "#64748b" },
          onClick: onClose,
          children: __("Close")
        }
      )
    ] })
  ] });
}
function computePosition(targetRect) {
  if (!targetRect) return { h: "left", v: "bottom" };
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const cx = targetRect.left + targetRect.width / 2;
  const cy = targetRect.top + targetRect.height / 2;
  return {
    h: cx < vpW / 2 ? "right" : "left",
    v: cy > vpH / 2 ? "top" : "bottom"
  };
}

// src/components/LearnPopup.tsx
var import_react7 = require("react");
var import_react_dom2 = require("react-dom");
var import_jsx_runtime4 = require("react/jsx-runtime");
var DURATIONS = [
  { hours: 1, label: "1h" },
  { hours: 4, label: "4h" },
  { hours: 24, label: "24h" },
  { hours: 168, labelKey: "1 sem." }
];
function LearnPopup({
  learns,
  routeStr,
  translateFn,
  onStart,
  onSnooze
}) {
  const __ = (t) => translate(t, translateFn);
  const [snoozeOpen, setSnoozeOpen] = (0, import_react7.useState)(false);
  const [snoozeScope, setSnoozeScope] = (0, import_react7.useState)("page");
  const [snoozeInfoText, setSnoozeInfoText] = (0, import_react7.useState)(__("R\xE9appara\xEEtra dans 24h"));
  if (!learns.length) return null;
  const MAX_VISIBLE = 2;
  const matchNames = learns.map((l) => l.name);
  const title = learns.length > 1 ? __("Formations disponibles") + ` (${learns.length})` : __("Formation disponible");
  const popup = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { id: "nora-assist-panel", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "nora-assist-card", role: "status", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-header", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "nora-assist-header-left", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "nora-assist-indicator" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "nora-assist-title", children: title })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-items", children: learns.map((learn, idx) => {
      const isHidden = idx >= MAX_VISIBLE;
      const hasUnmetPrereq = (learn.prerequisites || []).some((p) => matchNames.includes(p));
      const btnLabel = learn.in_progress ? __("Reprendre") : __("Commencer");
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "div",
        {
          className: `nora-assist-item${hasUnmetPrereq ? " nora-assist-item-disabled" : ""}${isHidden ? " nora-assist-item-overflow" : ""}`,
          "data-learn": learn.name,
          style: isHidden ? { display: "none" } : void 0,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "nora-assist-item-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "nora-assist-item-info", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "nora-assist-item-title", children: escapeHtml(learn.title) }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "nora-assist-item-meta", children: [
                  learn.in_progress && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "nora-assist-item-badge", children: __("En cours") }),
                  learn.estimated_duration && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "nora-assist-item-duration", children: [
                    learn.estimated_duration,
                    " min"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-item-right", children: hasUnmetPrereq ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { className: "btn btn-xs btn-default", disabled: true, children: __("Commencer") }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "button",
                {
                  className: "btn btn-xs btn-primary nora-assist-start",
                  onClick: () => onStart(learn.name),
                  children: btnLabel
                }
              ) })
            ] }),
            hasUnmetPrereq && learn.prerequisite_titles?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "nora-assist-item-prereq", children: [
              __("Faire d'abord"),
              " :",
              " ",
              learn.prerequisite_titles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("em", { children: escapeHtml(p.title) }, p.name))
            ] })
          ]
        },
        learn.name
      );
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-footer", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "button",
      {
        className: "nora-assist-later-btn",
        onClick: () => setSnoozeOpen((prev) => !prev),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: __("Plus tard") })
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `nora-assist-snooze-panel${snoozeOpen ? " nora-assist-snooze-panel-open" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-snooze-label", children: __("Rappeler plus tard") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "nora-assist-snooze-scope", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            className: `nora-assist-scope-btn${snoozeScope === "page" ? " active" : ""}`,
            onClick: () => setSnoozeScope("page"),
            children: __("Cette page")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            className: `nora-assist-scope-btn${snoozeScope === "all" ? " active" : ""}`,
            onClick: () => setSnoozeScope("all"),
            children: __("Toutes les pages")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-snooze-durations", children: DURATIONS.map((d) => {
        const label = d.labelKey ? __(d.labelKey) : d.label;
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            className: "nora-assist-duration-btn",
            onMouseEnter: () => setSnoozeInfoText(__("R\xE9appara\xEEtra dans") + " " + label),
            onClick: () => onSnooze(routeStr, snoozeScope, d.hours),
            children: label
          },
          d.hours
        );
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "nora-assist-snooze-info", children: snoozeInfoText })
    ] })
  ] }) });
  return (0, import_react_dom2.createPortal)(popup, document.body);
}

// src/components/StepPopover.tsx
var import_react8 = require("react");
var import_react_dom3 = require("react-dom");
var import_jsx_runtime5 = require("react/jsx-runtime");
function StepPopover({ element, step, stepIndex, totalSteps, translateFn }) {
  const __ = (t) => translate(t, translateFn);
  const popRef = (0, import_react8.useRef)(null);
  (0, import_react8.useEffect)(() => {
    if (!popRef.current || !element) return;
    positionPopover(popRef.current, element);
  }, [element, step]);
  if (!element) return null;
  const badge = `${__("Step")} ${stepIndex + 1}/${totalSteps}`;
  const popover = /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { ref: popRef, id: "nora-step-popover", className: "nora-pop-bottom", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "nora-pop-arrow" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "nora-pop-badge", children: badge }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "div",
      {
        className: "nora-pop-text",
        dangerouslySetInnerHTML: { __html: renderMarkdown(step.explanation || "") }
      }
    )
  ] });
  return (0, import_react_dom3.createPortal)(popover, document.body);
}
function positionPopover(pop, element) {
  const rect = element.getBoundingClientRect();
  const gap = 12;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const isLarge = rect.height > 200;
  const refTop = rect.top;
  const refBottom = isLarge ? Math.min(rect.top + 80, rect.bottom) : rect.bottom;
  pop.classList.remove("nora-pop-top", "nora-pop-bottom", "nora-pop-left", "nora-pop-right");
  let top;
  let left;
  let posClass;
  const spaceAbove = refTop;
  const spaceBelow = vpH - refBottom;
  const spaceRight = vpW - rect.right;
  const isInput = element.matches("input, textarea, select, [contenteditable]") || !!element.closest(".frappe-control")?.querySelector("input, select");
  if (isInput && spaceRight >= 300) {
    top = rect.top;
    left = rect.right + gap;
    posClass = "nora-pop-right";
  } else if (spaceBelow >= 180) {
    top = refBottom + gap;
    left = rect.left;
    posClass = "nora-pop-bottom";
  } else if (spaceRight >= 450) {
    top = refTop;
    left = rect.right + gap;
    posClass = "nora-pop-right";
  } else if (spaceAbove >= 150) {
    top = refTop - gap;
    left = rect.left + rect.width / 2 - 210;
    posClass = "nora-pop-top";
  } else {
    top = refBottom + gap;
    left = rect.left + rect.width / 2 - 210;
    posClass = "nora-pop-bottom";
  }
  left = Math.max(8, Math.min(left, vpW - 440));
  top = Math.max(8, Math.min(top, vpH - 100));
  pop.classList.add(posClass);
  if (posClass === "nora-pop-top") {
    pop.style.cssText = `position:fixed;bottom:${vpH - top}px;left:${left}px;`;
  } else {
    pop.style.cssText = `position:fixed;top:${top}px;left:${left}px;`;
  }
}

// src/components/PrerequisiteDialog.tsx
var import_react_dom4 = require("react-dom");
var import_jsx_runtime6 = require("react/jsx-runtime");
function PrerequisiteDialog({
  isOpen,
  prerequisites,
  translateFn,
  onContinue,
  onDoPrerequisite
}) {
  const __ = (t) => translate(t, translateFn);
  if (!isOpen || !prerequisites.length) return null;
  const dialog = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 100010,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)"
      },
      onClick: onContinue,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
        "div",
        {
          style: {
            background: "white",
            borderRadius: 16,
            padding: "24px",
            maxWidth: 420,
            width: "90vw",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)"
          },
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { style: { margin: "0 0 12px", fontSize: 16, fontWeight: 600 }, children: __("Recommended Prerequisites") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { margin: "0 0 12px", fontSize: 13, color: "#64748b" }, children: __("We recommend completing these formations first:") }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { style: { margin: "0 0 16px", paddingLeft: 20 }, children: prerequisites.map((p) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("li", { style: { padding: "4px 0", fontWeight: 600 }, children: escapeHtml(p.title) }, p.name)) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "button",
                {
                  style: {
                    padding: "8px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "white",
                    fontSize: 13,
                    cursor: "pointer"
                  },
                  onClick: () => onDoPrerequisite(prerequisites[0].name),
                  children: __("Do it first")
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "button",
                {
                  style: {
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 8,
                    background: "#7c3aed",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer"
                  },
                  onClick: onContinue,
                  children: __("Continue anyway")
                }
              )
            ] })
          ]
        }
      )
    }
  );
  return (0, import_react_dom4.createPortal)(dialog, document.body);
}

// src/components/NoraLearnProvider.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var NoraLearnContext = (0, import_react9.createContext)({
  startLearn: async () => false,
  stopLearn: () => {
  },
  isActive: false
});
function useNoraLearn() {
  return (0, import_react9.useContext)(NoraLearnContext);
}
function NoraLearnProvider({ config = {}, children }) {
  const [currentRoute, setCurrentRoute] = (0, import_react9.useState)(
    () => (config.getCurrentRoute || (() => window.location.pathname))()
  );
  const [showPopup, setShowPopup] = (0, import_react9.useState)(false);
  const popupTimerRef = (0, import_react9.useRef)(null);
  const [prereqDialog, setPrereqDialog] = (0, import_react9.useState)({ open: false, prerequisites: [], learnName: "" });
  (0, import_react9.useEffect)(() => {
    if (config.csrfToken) setCsrfToken(config.csrfToken);
    else if (window.csrf_token) setCsrfToken(window.csrf_token);
  }, [config.csrfToken]);
  const session = useLearnSession(config);
  const { matchingLearns, snoozeRoute, refreshLearns } = useAvailableLearns(currentRoute);
  useRouteChange(
    (0, import_react9.useCallback)(
      (path) => {
        setCurrentRoute(path);
        setShowPopup(false);
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        popupTimerRef.current = setTimeout(() => {
          setShowPopup(true);
        }, 2e3);
      },
      []
    )
  );
  (0, import_react9.useEffect)(() => {
    const timer = setTimeout(() => setShowPopup(true), 2e3);
    return () => clearTimeout(timer);
  }, []);
  (0, import_react9.useEffect)(() => {
    const saved = LearnSession.getSavedState();
    if (saved && !session.isActive) {
      session.resumeLearn(saved.learn_name).then((ok) => {
        if (!ok) LearnSession.clearSavedState();
      });
    }
  }, []);
  const handleStartLearn = (0, import_react9.useCallback)(
    async (name, skipPrerequisites = false) => {
      setShowPopup(false);
      const ok = await session.startLearn(name, skipPrerequisites);
      if (ok && session.state?.recommended_prerequisites?.length && !skipPrerequisites) {
        setPrereqDialog({
          open: true,
          prerequisites: session.state.recommended_prerequisites,
          learnName: name
        });
      }
      return ok;
    },
    [session]
  );
  const handleStopLearn = (0, import_react9.useCallback)(() => {
    session.stopLearn();
  }, [session]);
  const handleNextLearn = (0, import_react9.useCallback)(
    async (name) => {
      session.resetCompleted();
      await handleStartLearn(name, true);
    },
    [session, handleStartLearn]
  );
  const handleValidationFail = (0, import_react9.useCallback)(
    (message) => {
      const showAlert = config.showAlert || ((msg) => console.warn("[Nora Learn]", msg));
      showAlert(message, "warning");
    },
    [config.showAlert]
  );
  const handleComplete = (0, import_react9.useCallback)(() => {
    const showAlert = config.showAlert || ((msg) => console.log("[Nora Learn]", msg));
    showAlert("Learn completed!", "success");
    refreshLearns();
  }, [config.showAlert, refreshLearns]);
  (0, import_react9.useEffect)(() => {
    if (session.isCompleted) {
      handleComplete();
    }
  }, [session.isCompleted, handleComplete]);
  const showStepPopover = session.isActive && session.popoverElement && session.popoverStep && session.popoverStep.highlight_actions?.length;
  const sidebarTitle = session.state?.title || session.state?.learn_title || "";
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    NoraLearnContext.Provider,
    {
      value: {
        startLearn: handleStartLearn,
        stopLearn: handleStopLearn,
        isActive: session.isActive
      },
      children: [
        children,
        showPopup && !session.isActive && !session.isCompleted && matchingLearns.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          LearnPopup,
          {
            learns: matchingLearns,
            routeStr: currentRoute,
            translateFn: config.translate,
            onStart: (name) => handleStartLearn(name),
            onSnooze: snoozeRoute
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          LearnSidebar,
          {
            isOpen: session.isActive || session.isCompleted,
            title: sidebarTitle,
            learnName: session.state?.learn_name || "",
            stepIndex: session.stepIndex,
            totalSteps: session.totalSteps,
            currentStep: session.currentStep,
            highlightRect: session.highlightRect,
            isCompleted: session.isCompleted,
            nextLearn: session.nextLearn,
            nextLearnTitle: session.nextLearnTitle,
            noraIconUrl: config.noraIconUrl,
            translateFn: config.translate,
            onClose: handleStopLearn,
            onFinish: () => session.session?.["_onComplete"]?.call(session.session),
            onRestart: session.restartLearn,
            onDoIt: session.executeStep,
            onContinue: session.advanceStep,
            onNextLearn: handleNextLearn,
            onValidationFail: handleValidationFail
          }
        ),
        showStepPopover && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          StepPopover,
          {
            element: session.popoverElement,
            step: session.popoverStep,
            stepIndex: session.stepIndex,
            totalSteps: session.totalSteps,
            translateFn: config.translate
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          PrerequisiteDialog,
          {
            isOpen: prereqDialog.open,
            prerequisites: prereqDialog.prerequisites,
            translateFn: config.translate,
            onContinue: () => setPrereqDialog((p) => ({ ...p, open: false })),
            onDoPrerequisite: (name) => {
              setPrereqDialog((p) => ({ ...p, open: false }));
              handleStartLearn(name, true);
            }
          }
        )
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChatArea,
  LearnPopup,
  LearnSession,
  LearnSidebar,
  NoraLearnProvider,
  PrerequisiteDialog,
  StepMessage,
  StepPopover,
  advanceStep,
  cleanupDemoDocuments,
  completeLearn,
  escapeHtml,
  executeAction,
  executeMany,
  findVisibleElement,
  getAvailableLearns,
  getBrowserActions,
  getCurrentUser,
  getLearnState,
  getStepAsMessage,
  getThreadMessages,
  getUserAvatarUrl,
  highlight,
  pauseLearn,
  removeHighlight,
  renderMarkdown,
  resetLearn,
  sendMessageInThread,
  setCsrfToken,
  sleep,
  startConversation,
  startLearn,
  translate,
  useAvailableLearns,
  useLearnSession,
  useNoraLearn,
  useRouteChange
});
//# sourceMappingURL=index.js.map