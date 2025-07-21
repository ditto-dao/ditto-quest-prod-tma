import WebApp from '@twa-dev/sdk';
import PreloadManager from './preload-manager';
import { DITTO_STATUS_JSON_URI, DQ_REFERRAL_LINK_PREFIX } from '../utils/config';
import { STORE_FINGERPRINT_EVENT, USE_REFERRAL_CODE, USE_REFERRAL_CODE_SUCCESS } from '../utils/events';
import { getFingerprint } from '../utils/fingerprint';
import { User } from '../utils/types';

export enum LoginStep {
    CHECKING_SERVER = "Checking server status...",
    CONNECTING = "Connecting to server...",
    VALIDATING = "Validating login...",
    SETTING_FINGERPRINT = "Setting up device fingerprint...",
    PROCESSING_REFERRAL = "Processing referral code...",
    LOADING_ASSETS = "Loading game assets...",
    LOADING_USER_DATA = "Loading user data...",
    LOADING_SKILL_DATA = "Loading skill data...",
    FINALIZING = "Finalizing setup...",
    COMPLETE = "Ready to play!",
    // Error states
    MAINTENANCE = "Game is under maintenance",
    ERROR = "Login failed",
    INVALID_ACCESS = "Please open through the official app",
    DISCONNECTED = "Disconnected from server"
}

interface LoginState {
    step: LoginStep;
    progress: number;
    isComplete: boolean;
    accessGranted: boolean;
    error: string | null;
    telegramId: string | null;
    username: string | null;
}

type LoginListener = (state: LoginState) => void;

class LoginManager {
    private static instance: LoginManager;
    private listeners: LoginListener[] = [];
    private socket: any = null;
    private dispatch: any = null;

    private state: LoginState = {
        step: LoginStep.CHECKING_SERVER,
        progress: 0,
        isComplete: false,
        accessGranted: false,
        error: null,
        telegramId: null,
        username: null
    };

    // Condition flags
    private conditions = {
        serverOnline: false,
        socketConnected: false,
        loginValidated: false,
        fingerprintSent: false,
        referralProcessed: false,
        assetsLoaded: false,
        userDataLoaded: false,
        skillDataLoaded: false
    };

    static getInstance(): LoginManager {
        if (!LoginManager.instance) {
            LoginManager.instance = new LoginManager();
        }
        return LoginManager.instance;
    }

    // Public API
    subscribe(listener: LoginListener): () => void {
        this.listeners.push(listener);
        listener(this.state); // Immediate update
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    getState(): LoginState {
        return { ...this.state };
    }

    // Initialize with socket and dispatch
    initialize(socket: any, dispatch: any) {
        this.socket = socket;
        this.dispatch = dispatch;
        this.setupSocketListeners();
        this.startLoginFlow();
    }

    // Step 1: Check server status
    private async startLoginFlow() {
        try {
            this.updateState({ step: LoginStep.CHECKING_SERVER, progress: 0 });

            const response = await fetch(DITTO_STATUS_JSON_URI, {
                cache: "no-store",
            });
            const data = await response.json();

            if (data.status === 'LIVE') {
                this.conditions.serverOnline = true;
                this.updateState({ step: LoginStep.CONNECTING, progress: 5 });
                this.validateTelegramAccess();
            } else if (data.status === 'MAINTENANCE') {
                this.setError(LoginStep.MAINTENANCE);
            } else {
                this.setError(LoginStep.ERROR);
            }
        } catch (err) {
            console.error("Server status check failed:", err);
            this.setError(LoginStep.ERROR);
        }
    }

    // Step 2: Validate Telegram access
    private validateTelegramAccess() {
        if (!WebApp.initDataUnsafe.user) {
            this.setError(LoginStep.INVALID_ACCESS);
            return;
        }

        // Wait for socket connection
        this.waitForSocket();
    }

    // Step 3: Wait for socket and send login validation
    private waitForSocket() {
        if (this.socket && this.socket.connected) {
            this.onSocketConnected();
        } else {
            // Wait for socket connection
            setTimeout(() => this.waitForSocket(), 100);
        }
    }

    private onSocketConnected() {
        this.conditions.socketConnected = true;
        this.updateState({ step: LoginStep.VALIDATING, progress: 10 });

        this.socket.emit("validate-login", {
            initData: WebApp.initData,
            userData: WebApp.initDataUnsafe.user,
        });
    }

    // Step 4: Handle login validation response
    private onLoginValidated(telegramId: string) {
        this.conditions.loginValidated = true;

        // Update Redux state
        if (this.dispatch) {
            this.dispatch({ type: 'telegramId/setTelegramId', payload: telegramId });
            this.dispatch({
                type: 'telegramUsername/setTelegramUsername',
                payload: WebApp.initDataUnsafe.user?.username || `user_${telegramId}`
            });
        }

        this.updateState({
            step: LoginStep.SETTING_FINGERPRINT,
            progress: 50,
            accessGranted: true,
            telegramId,
            username: WebApp.initDataUnsafe.user?.username || `user_${telegramId}`
        });

        this.sendFingerprint();
    }

    // Step 5: Send fingerprint (non-blocking)
    private async sendFingerprint() {
        try {
            const fingerprint = await getFingerprint();
            this.socket.emit(STORE_FINGERPRINT_EVENT, fingerprint);
            console.log('✅ Fingerprint sent successfully');
        } catch (error) {
            console.error('❌ Fingerprint failed, using fallback:', error);
            this.socket.emit(STORE_FINGERPRINT_EVENT, 'mobile_fallback_' + Date.now());
        }

        this.conditions.fingerprintSent = true;
        this.updateState({ progress: 60 });
        this.processReferral();
    }

    // Step 6: Process referral if exists
    private processReferral() {
        const inviteLink = WebApp.initDataUnsafe.start_param;
        if (inviteLink?.startsWith(DQ_REFERRAL_LINK_PREFIX)) {
            this.updateState({ step: LoginStep.PROCESSING_REFERRAL, progress: 70 });
            this.socket.emit(USE_REFERRAL_CODE, inviteLink);
            // Will be marked complete by socket event
        } else {
            this.conditions.referralProcessed = true;
            this.updateState({ progress: 75 });
            this.checkCompletion();
        }
    }

    // Step 7: Start asset preloading (parallel with other steps)
    private startAssetPreloading(userData: User) {
        const preloadManager = PreloadManager.getInstance();

        preloadManager.addProgressCallback((progress) => {
            if (progress.complete) {
                console.log('✅ Assets preloaded');
                this.conditions.assetsLoaded = true;
                this.checkCompletion();
            }
        });

        preloadManager.preloadEverything(userData);
    }

    // Socket event handlers
    private setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on("login-validated", (telegramId: string) => {
            this.onLoginValidated(telegramId);
        });

        this.socket.on("login-invalid", (msg: string) => {
            this.setError(LoginStep.ERROR, msg);
        });

        this.socket.on("tele-validate-error", (msg: string) => {
            this.setError(LoginStep.ERROR, msg);
        });

        this.socket.on(USE_REFERRAL_CODE_SUCCESS, () => {
            console.log('✅ Referral processed');
            this.conditions.referralProcessed = true;
            this.updateState({ progress: 85 });
            this.checkCompletion();
        });

        this.socket.on("disconnect", () => {
            if (this.state.accessGranted) {
                this.setError(LoginStep.DISCONNECTED, "Lost connection to server");
            }
        });
    }

    // Called by user context when all user data is loaded
    setUserDataLoaded(userData: User) {
        console.log('✅ User data loaded');
        this.conditions.userDataLoaded = true;
        this.updateState({ step: LoginStep.LOADING_USER_DATA, progress: 90 });
        this.checkCompletion();
        this.startAssetPreloading(userData);
    }

    // Called by skill context when skill data is loaded  
    setSkillDataLoaded() {
        console.log('✅ Skill data loaded');
        this.conditions.skillDataLoaded = true;
        this.updateState({ progress: 95 });
        this.checkCompletion();
    }

    // Check if all conditions are met for completion
    private checkCompletion() {
        const requiredConditions = [
            'serverOnline',
            'socketConnected',
            'loginValidated',
            'fingerprintSent',
            'referralProcessed',
            'assetsLoaded',
            'userDataLoaded',
            'skillDataLoaded'
        ] as const;

        const allComplete = requiredConditions.every(
            condition => this.conditions[condition]
        );

        console.log('🔍 Completion check:', {
            ...this.conditions,
            allComplete
        });

        if (allComplete && !this.state.isComplete) {
            this.updateState({
                step: LoginStep.FINALIZING,
                progress: 98
            });

            setTimeout(() => {
                this.updateState({
                    step: LoginStep.COMPLETE,
                    progress: 100,
                    isComplete: true
                });
            }, 500);
        }
    }

    // Helper methods
    private updateState(updates: Partial<LoginState>) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    private setError(step: LoginStep, message?: string) {
        this.updateState({
            step,
            error: message || step,
            progress: 100
        });
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

export default LoginManager;