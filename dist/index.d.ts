import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

interface LearnInfo {
    name: string;
    title: string;
    description?: string;
    entry_route?: string;
    entry_doctype?: string;
    category?: string;
    difficulty?: string;
    estimated_duration?: number;
    is_onboarding?: boolean;
    in_progress?: boolean;
    current_step?: number;
    prerequisites: string[];
    prerequisite_titles: Array<{
        name: string;
        title: string;
    }>;
}
interface LearnState {
    success: boolean;
    learn_name: string;
    title?: string;
    learn_title?: string;
    description?: string;
    current_step: number;
    total_steps: number;
    status?: string;
    is_test?: boolean;
    entry_route?: string;
    next_learn?: string;
    next_learn_title?: string;
    recommended_prerequisites?: Array<{
        name: string;
        title: string;
    }>;
    unmet_prerequisites?: string[];
    error?: string;
}
interface StepData {
    success: boolean;
    step_index: number;
    total_steps?: number;
    title?: string;
    explanation: string;
    action_type: string;
    action_target?: string;
    is_checkpoint?: boolean;
    is_last_step?: boolean;
    wait_condition?: string;
    wait_timeout?: number;
    skip_if?: string;
    allow_skip?: boolean;
    validation_rule?: string;
    on_error_message?: string;
    highlight_actions?: HighlightAction[];
    execute_actions?: BrowserAction[];
}
interface HighlightAction {
    action: string;
    selector: string;
    options?: Record<string, unknown>;
    [key: string]: unknown;
}
interface BrowserAction {
    action: string;
    selector?: string;
    value?: string;
    url?: string;
    fieldname?: string;
    [key: string]: unknown;
}
interface AdvanceResult {
    success: boolean;
    current_step: number;
    completed: boolean;
}
interface StepMessageData {
    step_index: number;
    total_steps: number;
    explanation: string;
    action_type: string;
    is_checkpoint?: boolean;
    has_execute_actions?: boolean;
    has_wait_condition?: boolean;
}
interface NoraLearnConfig {
    /** App identifier for context */
    appName?: string;
    /** Navigate to a URL — defaults to window.location.href assignment */
    navigate?: (url: string) => void;
    /** Get current route path — defaults to window.location.pathname */
    getCurrentRoute?: () => string;
    /** Show toast/alert */
    showAlert?: (message: string, variant: 'success' | 'warning' | 'error' | 'info') => void;
    /** CSRF token — defaults to window.csrf_token */
    csrfToken?: string;
    /** Nora icon URL */
    noraIconUrl?: string;
    /** Translation function — defaults to frappe._messages lookup */
    translate?: (text: string) => string;
}
type SessionEvent = {
    type: 'started';
    state: LearnState;
} | {
    type: 'step';
    step: StepData;
    stepIndex: number;
    totalSteps: number;
} | {
    type: 'advanced';
    stepIndex: number;
    totalSteps: number;
} | {
    type: 'paused';
} | {
    type: 'stopped';
} | {
    type: 'completed';
    nextLearn?: string;
    nextLearnTitle?: string;
} | {
    type: 'error';
    message: string;
} | {
    type: 'highlight';
    element: HTMLElement | null;
    rect: DOMRect | null;
} | {
    type: 'popover';
    element: HTMLElement | null;
    step: StepData;
};
interface SavedLearnState {
    learn_name: string;
    current_step: number;
    total_steps: number;
    title: string;
    timestamp: number;
}
declare global {
    interface Window {
        frappe?: {
            boot?: {
                nora_learns?: LearnInfo[];
                user?: {
                    name: string;
                    full_name?: string;
                };
                user_info?: Record<string, {
                    fullname: string;
                    image?: string;
                }>;
                sitename?: string;
            };
            _messages?: Record<string, string>;
        };
        csrf_token?: string;
    }
}

interface NoraLearnContextType {
    startLearn: (name: string, skipPrerequisites?: boolean) => Promise<boolean>;
    stopLearn: () => void;
    isActive: boolean;
}
declare function useNoraLearn(): NoraLearnContextType;
interface NoraLearnProviderProps {
    config?: NoraLearnConfig;
    children: React.ReactNode;
}
declare function NoraLearnProvider({ config, children }: NoraLearnProviderProps): react_jsx_runtime.JSX.Element;

interface LearnSidebarProps {
    isOpen: boolean;
    title: string;
    stepIndex: number;
    totalSteps: number;
    currentStep: StepData | null;
    highlightRect: DOMRect | null;
    isCompleted: boolean;
    nextLearn?: string;
    nextLearnTitle?: string;
    noraIconUrl?: string;
    translateFn?: (text: string) => string;
    onClose: () => void;
    onFinish: () => void;
    onRestart: () => void;
    onDoIt: () => void;
    onContinue: () => void;
    onNextLearn?: (name: string) => void;
    onValidationFail?: (message: string) => void;
}
declare function LearnSidebar({ isOpen, title, stepIndex, totalSteps, currentStep, highlightRect, isCompleted, nextLearn, nextLearnTitle, noraIconUrl, translateFn, onClose, onFinish, onRestart, onDoIt, onContinue, onNextLearn, onValidationFail, }: LearnSidebarProps): React.ReactPortal | null;

interface LearnPopupProps {
    learns: LearnInfo[];
    routeStr: string;
    translateFn?: (text: string) => string;
    onStart: (learnName: string) => void;
    onDismiss: (learnName: string) => void;
    onSnooze: (route: string) => void;
}
declare function LearnPopup({ learns, routeStr, translateFn, onStart, onDismiss, onSnooze, }: LearnPopupProps): React.ReactPortal | null;

interface StepPopoverProps {
    element: HTMLElement | null;
    step: StepData;
    stepIndex: number;
    totalSteps: number;
    translateFn?: (text: string) => string;
}
declare function StepPopover({ element, step, stepIndex, totalSteps, translateFn }: StepPopoverProps): React.ReactPortal | null;

interface StepMessageProps {
    data: StepMessageData;
    onDoIt?: () => void;
    onContinue?: () => void;
    onValidationFail?: (message: string) => void;
    validationRule?: string;
    validationErrorMessage?: string;
    translateFn?: (text: string) => string;
}
declare function StepMessage({ data, onDoIt, onContinue, onValidationFail, validationRule, validationErrorMessage, translateFn, }: StepMessageProps): react_jsx_runtime.JSX.Element;

interface PrerequisiteDialogProps {
    isOpen: boolean;
    prerequisites: Array<{
        name: string;
        title: string;
    }>;
    translateFn?: (text: string) => string;
    onContinue: () => void;
    onDoPrerequisite: (name: string) => void;
}
declare function PrerequisiteDialog({ isOpen, prerequisites, translateFn, onContinue, onDoPrerequisite, }: PrerequisiteDialogProps): React.ReactPortal | null;

type EventHandler = (event: SessionEvent) => void;
/**
 * LearnSession — Core orchestrator for interactive learning.
 * Framework-agnostic: emits events instead of manipulating DOM directly.
 * React components subscribe to these events via the provider.
 */
declare class LearnSession {
    learnName: string;
    skipPrerequisites: boolean;
    state: LearnState | null;
    isActive: boolean;
    currentStep: StepData | null;
    private _config;
    private _onEvent;
    private _watchInterval;
    private _pageChangeCleanup;
    private _clickAdvanceHandler;
    private _clickAdvanceTarget;
    private _advancing;
    private _popoverEl;
    constructor(learnName: string, onEvent: EventHandler, config?: NoraLearnConfig, skipPrerequisites?: boolean);
    start(): Promise<boolean>;
    resume(): Promise<boolean>;
    pause(): Promise<void>;
    stop(): void;
    restart(): Promise<void>;
    advanceStep(): Promise<void>;
    executeCurrentStep(): Promise<void>;
    private _fetchAndDisplayStep;
    private _highlightTarget;
    private _onComplete;
    private _startWatchingCondition;
    private _stopWatching;
    private _bindPageChange;
    private _unbindPageChange;
    private _dismissPopover;
    private _clearClickListener;
    private _saveLocalState;
    private _loadLocalState;
    private _clearLocalState;
    private _waitForPageReady;
    private _emit;
    static getSavedState(): SavedLearnState | null;
    static clearSavedState(): void;
}

/**
 * Hook to manage a LearnSession lifecycle.
 * Returns session state and control functions.
 */
declare function useLearnSession(config?: NoraLearnConfig): {
    startLearn: (learnName: string, skipPrerequisites?: boolean) => Promise<boolean>;
    resumeLearn: (learnName: string) => Promise<boolean>;
    pauseLearn: () => Promise<void>;
    stopLearn: () => void;
    restartLearn: () => Promise<void>;
    advanceStep: () => Promise<void>;
    executeStep: () => Promise<void>;
    resetCompleted: () => void;
    session: LearnSession | null;
    isActive: boolean;
    state: LearnState | null;
    currentStep: StepData | null;
    stepIndex: number;
    totalSteps: number;
    highlightedElement: HTMLElement | null;
    highlightRect: DOMRect | null;
    popoverElement: HTMLElement | null;
    popoverStep: StepData | null;
    isCompleted: boolean;
    nextLearn?: string;
    nextLearnTitle?: string;
    error: string | null;
};

/**
 * Hook to access available learns from frappe.boot or API.
 * Returns learns matching the current route.
 */
declare function useAvailableLearns(currentRoute: string): {
    allLearns: LearnInfo[];
    matchingLearns: LearnInfo[];
    dismissLearn: (learnName: string) => void;
    snoozeRoute: (route: string) => void;
    refreshLearns: () => Promise<void>;
};

/**
 * Hook to detect SPA route changes.
 * Intercepts pushState/replaceState and listens to popstate.
 */
declare function useRouteChange(callback: (path: string) => void): void;

declare function setCsrfToken(token: string): void;
declare function startLearn(learnName: string, skipPrerequisites?: boolean): Promise<LearnState>;
declare function getLearnState(learnName: string): Promise<LearnState>;
declare function getStepAsMessage(learnName: string, stepIndex: number, isTest?: boolean): Promise<StepData>;
declare function advanceStep(learnName: string): Promise<AdvanceResult>;
declare function pauseLearn(learnName: string): Promise<{
    success: boolean;
}>;
declare function completeLearn(learnName: string): Promise<{
    success: boolean;
}>;
declare function resetLearn(learnName: string): Promise<{
    success: boolean;
}>;
declare function getAvailableLearns(): Promise<{
    success: boolean;
    learns: LearnInfo[];
}>;
declare function cleanupDemoDocuments(learnName: string): Promise<void>;

declare function escapeHtml(text: string): string;
declare function sleep(ms: number): Promise<void>;
/**
 * Minimal markdown renderer (matches Nora's _renderMarkdown)
 * Supports: **bold**, _italic_, `code`, [link](url), lists, line breaks
 */
declare function renderMarkdown(text: string): string;
/**
 * Translation helper — uses frappe._messages if available, else returns key
 */
declare function translate(key: string, customFn?: (text: string) => string): string;
/**
 * Get user avatar URL from frappe.boot.user_info
 */
declare function getUserAvatarUrl(user?: string): string | null;
/**
 * Get current user info from frappe.boot
 */
declare function getCurrentUser(): {
    name: string;
    fullName: string;
};

/**
 * Execute a highlight action on a DOM element
 */
declare function highlight(element: HTMLElement, options?: Record<string, unknown>): void;
/**
 * Remove all Nora highlights from the page
 */
declare function removeHighlight(): void;
/**
 * Find a visible element by CSS selector, with :contains() support
 */
declare function findVisibleElement(selector: string): HTMLElement | null;
/**
 * Execute a single browser action
 */
declare function executeAction(action: BrowserAction): Promise<void>;
/**
 * Execute multiple browser actions in sequence
 */
declare function executeMany(actions: BrowserAction[]): Promise<void>;

export { type AdvanceResult, type BrowserAction, type HighlightAction, type LearnInfo, LearnPopup, LearnSession, LearnSidebar, type LearnState, type NoraLearnConfig, NoraLearnProvider, PrerequisiteDialog, type SavedLearnState, type SessionEvent, type StepData, StepMessage, type StepMessageData, StepPopover, advanceStep, cleanupDemoDocuments, completeLearn, escapeHtml, executeAction, executeMany, findVisibleElement, getAvailableLearns, getCurrentUser, getLearnState, getStepAsMessage, getUserAvatarUrl, highlight, pauseLearn, removeHighlight, renderMarkdown, resetLearn, setCsrfToken, sleep, startLearn, translate, useAvailableLearns, useLearnSession, useNoraLearn, useRouteChange };
