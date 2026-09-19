/**
 * ============================================================================
 * 📡 赤ちゃんのファーストアート WebRTC / BroadcastChannel ワイヤレス同期モジュール
 * ============================================================================
 * 
 * 【概要】
 * 操作端末（iPadやスマートフォン）と投影モニター（Macやプロジェクター）間で、
 * リアルタイムのタッチ座標・絵の具の広がり・パレット変更・リセット信号を
 * WebRTC (PeerJS) および BroadcastChannel (同一ブラウザ複数タブ同期) を使用して
 * 超低遅延（60FPS）で同期します。
 */

export interface FirstArtSyncMessage {
  type: 'droplets_update' | 'pointer_down' | 'pointer_move' | 'palette_change' | 'reset' | 'frame_toggle' | 'host_closed';
  droplets?: Array<{ x: number; y: number; r: number; colorIdx: number }>;
  x?: number;
  y?: number;
  screenX?: number;
  screenY?: number;
  normX?: number;
  normY?: number;
  seed?: number;
  paletteIdx?: number;
  showFrame?: boolean;
}

/** 部屋コードの全角数字・スペース自動正規化関数 */
export function normalizeRoomCode(code: string): string {
  if (!code) return '';
  return code
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角数字 -> 半角数字
    .replace(/[^0-9a-zA-Z]/g, '') // 英数字以外を除去
    .toUpperCase();
}

/** PeerJS 接続設定 (Google STUN サーバー明示指定でNAT越え接続保証) */
const PEER_OPTIONS = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
  },
};

export class FirstArtSyncLinkWireless {
  private peer: any = null;
  private connection: any = null; // コントローラー用
  private connections: any[] = []; // ホスト用 (複数iPad端末同時接続管理)
  private broadcastChannel: BroadcastChannel | null = null;
  private isHost: boolean = false;
  private roomId: string = '';

  private onMessageCallback: ((data: FirstArtSyncMessage) => void) | null = null;
  private onReadyCallback: ((roomId: string) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onCloseCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {}

  /**
   * ホスト（プロジェクション投影モニター側）として初期化
   */
  public async startHost(preferredRoomId?: string): Promise<string> {
    this.isHost = true;
    this.roomId = normalizeRoomCode(preferredRoomId || Math.floor(1000 + Math.random() * 9000).toString());
    const peerId = `baby-firstart-room-${this.roomId}`;

    // 同一端末の別タブ・マルチモニタ用 BroadcastChannel 初期化
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(`first-art-channel-${this.roomId}`);
      this.broadcastChannel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data as FirstArtSyncMessage);
        }
      };
    }

    try {
      const PeerModule = await import('peerjs');
      const Peer = PeerModule.default;

      if (this.peer) {
        try { this.peer.destroy(); } catch {}
      }

      this.peer = new Peer(peerId, PEER_OPTIONS);

      this.peer.on('open', (id: string) => {
        console.log('[FirstArt Sync] Host registered with Peer ID:', id);
        if (this.onReadyCallback) {
          this.onReadyCallback(this.roomId);
        }
      });

      this.peer.on('disconnected', () => {
        console.log('[FirstArt Sync] Host disconnected from signaling server. Reconnecting...');
        if (this.peer && !this.peer.destroyed) {
          try { this.peer.reconnect(); } catch {}
        }
      });

      this.peer.on('connection', (conn: any) => {
        console.log('[FirstArt Sync] Controller connected:', conn.peer);
        this.connections.push(conn);

        conn.on('open', () => {
          if (this.onConnectCallback) this.onConnectCallback();
        });

        conn.on('data', (data: any) => {
          if (this.onMessageCallback) this.onMessageCallback(data as FirstArtSyncMessage);
        });

        conn.on('close', () => {
          this.connections = this.connections.filter((c) => c !== conn);
          if (this.onCloseCallback) this.onCloseCallback();
        });

        conn.on('error', (err: any) => {
          if (this.onErrorCallback) this.onErrorCallback(err.toString());
        });
      });

      this.peer.on('error', (err: any) => {
        console.warn('[FirstArt Sync] Host Peer error:', err);
        if (err.type === 'unavailable-id') {
          this.close();
          this.startHost();
        } else if (this.onErrorCallback) {
          this.onErrorCallback(err.toString());
        }
      });
    } catch (error) {
      console.error('[FirstArt Sync] Failed to import PeerJS:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(String(error));
      }
    }

    return this.roomId;
  }

  /**
   * クライアント（iPad操作端末側）としてホストにWebRTC接続（自動リトライ付き）
   */
  public async connectToHost(roomId: string, retryCount: number = 0) {
    const cleanRoomId = normalizeRoomCode(roomId);
    this.isHost = false;
    this.roomId = cleanRoomId;
    const targetPeerId = `baby-firstart-room-${cleanRoomId}`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (this.broadcastChannel) this.broadcastChannel.close();
      this.broadcastChannel = new BroadcastChannel(`first-art-channel-${cleanRoomId}`);
      this.broadcastChannel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data as FirstArtSyncMessage);
        }
      };
    }

    try {
      const PeerModule = await import('peerjs');
      const Peer = PeerModule.default;
      const clientId = `baby-firstart-client-${Math.floor(100000 + Math.random() * 900000)}`;

      if (this.peer) {
        try { this.peer.destroy(); } catch {}
      }

      this.peer = new Peer(clientId, PEER_OPTIONS);
      let isConnected = false;

      this.peer.on('open', () => {
        console.log(`[FirstArt Sync] Connecting to host ${targetPeerId} (Attempt ${retryCount + 1})...`);
        const conn = this.peer.connect(targetPeerId, { reliable: true });
        this.connection = conn;

        conn.on('open', () => {
          console.log('[FirstArt Sync] Connected to host!');
          isConnected = true;
          if (this.onConnectCallback) this.onConnectCallback();
        });

        conn.on('data', (data: any) => {
          if (this.onMessageCallback) this.onMessageCallback(data as FirstArtSyncMessage);
        });

        conn.on('close', () => {
          if (this.onCloseCallback) this.onCloseCallback();
        });

        conn.on('error', (err: any) => {
          console.warn('[FirstArt Sync] Connection error:', err);
          if (this.onErrorCallback) this.onErrorCallback(err.toString());
        });
      });

      this.peer.on('disconnected', () => {
        if (!isConnected && this.peer && !this.peer.destroyed) {
          try { this.peer.reconnect(); } catch {}
        }
      });

      this.peer.on('error', (err: any) => {
        console.warn(`[FirstArt Sync] Peer error (Attempt ${retryCount + 1}):`, err);
        if (!isConnected && (err.type === 'peer-unavailable' || err.type === 'network' || err.type === 'server-error') && retryCount < 2) {
          console.log(`[FirstArt Sync] Peer unavailable, retrying in 1.2s... (${retryCount + 2}/3)`);
          try { this.peer.destroy(); } catch {}
          setTimeout(() => {
            this.connectToHost(cleanRoomId, retryCount + 1);
          }, 1200);
        } else if (this.onErrorCallback) {
          this.onErrorCallback(`部屋ID「${cleanRoomId}」が見つからないか無効です。PC側で「投影モニター」が起動中かご確認ください。`);
        }
      });
    } catch (error) {
      console.error('[FirstArt Sync] Failed to import PeerJS:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(String(error));
      }
    }
  }

  /**
   * メッセージ送信（BroadcastChannel ＋ 全接続WebRTCピアへ送信）
   */
  public send(msg: FirstArtSyncMessage) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (err) {
        console.warn('[FirstArt Sync] BroadcastChannel send error:', err);
      }
    }

    if (this.isHost) {
      // ホストの場合: 全接続コントローラー（iPad）に送信
      const targets = new Set([...this.connections, this.connection].filter(Boolean));
      targets.forEach((conn: any) => {
        try {
          conn.send(msg);
        } catch (err) {
          console.warn('[FirstArt Sync] WebRTC send error:', err);
        }
      });
    } else if (this.connection) {
      // コントローラーの場合: ホストに送信
      try {
        this.connection.send(msg);
      } catch (err) {
        console.warn('[FirstArt Sync] WebRTC send error:', err);
      }
    }
  }

  public onMessage(callback: (data: FirstArtSyncMessage) => void) {
    this.onMessageCallback = callback;
  }
  public onReady(callback: (roomId: string) => void) {
    this.onReadyCallback = callback;
  }
  public onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }
  public onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }
  public onError(callback: (err: string) => void) {
    this.onErrorCallback = callback;
  }

  public close() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.connections.forEach((conn) => {
      try { conn.close(); } catch {}
    });
    this.connections = [];
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
