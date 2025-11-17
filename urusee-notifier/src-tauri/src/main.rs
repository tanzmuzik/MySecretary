// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    Window,
};
use tokio::sync::broadcast;

mod websocket;

// ログエントリの構造
#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct LogEntry {
    timestamp: String,
    machine_name: String,
}

// アプリケーション状態
struct AppState {
    logs: Arc<Mutex<Vec<LogEntry>>>,
    sound_enabled: Arc<Mutex<bool>>,
    tx: broadcast::Sender<String>,
}

// WebSocketサーバーからのメッセージを受信するコマンド
#[tauri::command]
fn get_machine_name() -> String {
    hostname::get()
        .unwrap_or_else(|_| std::ffi::OsString::from("Unknown"))
        .to_string_lossy()
        .to_string()
}

// ログを取得
#[tauri::command]
fn get_logs(state: tauri::State<AppState>) -> Vec<LogEntry> {
    state.logs.lock().unwrap().clone()
}

// ログを追加
#[tauri::command]
fn add_log(state: tauri::State<AppState>, machine_name: String) {
    let entry = LogEntry {
        timestamp: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        machine_name,
    };
    state.logs.lock().unwrap().push(entry.clone());

    // ログをファイルに保存
    save_logs(&state.logs.lock().unwrap());
}

// ログをファイルに保存
fn save_logs(logs: &Vec<LogEntry>) {
    if let Some(data_dir) = dirs::data_dir() {
        let app_dir = data_dir.join("urusee-notifier");
        std::fs::create_dir_all(&app_dir).ok();
        let log_file = app_dir.join("logs.json");

        if let Ok(json) = serde_json::to_string_pretty(logs) {
            std::fs::write(log_file, json).ok();
        }
    }
}

// ログをファイルから読み込み
fn load_logs() -> Vec<LogEntry> {
    if let Some(data_dir) = dirs::data_dir() {
        let log_file = data_dir.join("urusee-notifier").join("logs.json");

        if let Ok(content) = std::fs::read_to_string(log_file) {
            if let Ok(logs) = serde_json::from_str(&content) {
                return logs;
            }
        }
    }
    Vec::new()
}

// 効果音設定を取得
#[tauri::command]
fn get_sound_enabled(state: tauri::State<AppState>) -> bool {
    *state.sound_enabled.lock().unwrap()
}

// 効果音設定を変更
#[tauri::command]
fn set_sound_enabled(state: tauri::State<AppState>, enabled: bool) {
    *state.sound_enabled.lock().unwrap() = enabled;
}

// 「うるせぇ！」を送信
#[tauri::command]
fn send_urusee(state: tauri::State<AppState>) {
    let msg = "うるせぇ！";
    let _ = state.tx.send(msg.to_string());
}

fn main() {
    // ブロードキャストチャンネルを作成
    let (tx, _rx) = broadcast::channel::<String>(100);

    // システムトレイメニューを作成
    let quit = CustomMenuItem::new("quit".to_string(), "終了");
    let show = CustomMenuItem::new("show".to_string(), "設定を表示");
    let send = CustomMenuItem::new("send".to_string(), "うるせぇ！");

    let tray_menu = SystemTrayMenu::new()
        .add_item(send)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    // アプリケーション状態を初期化
    let app_state = AppState {
        logs: Arc::new(Mutex::new(load_logs())),
        sound_enabled: Arc::new(Mutex::new(true)),
        tx: tx.clone(),
    };

    tauri::Builder::default()
        .manage(app_state)
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                // 左クリックで「うるせぇ！」を送信
                if let Some(state) = app.try_state::<AppState>() {
                    let _ = state.tx.send("うるせぇ！".to_string());

                    // フロントエンドに通知
                    if let Some(window) = app.get_window("main") {
                        let _ = window.emit("send-urusee", ());
                    }
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    if let Some(window) = app.get_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "send" => {
                    if let Some(state) = app.try_state::<AppState>() {
                        let _ = state.tx.send("うるせぇ！".to_string());

                        // フロントエンドに通知
                        if let Some(window) = app.get_window("main") {
                            let _ = window.emit("send-urusee", ());
                        }
                    }
                }
                _ => {}
            },
            _ => {}
        })
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            // WebSocketサーバーを起動
            let tx_clone = tx.clone();
            let window_clone = window.clone();

            tauri::async_runtime::spawn(async move {
                websocket::start_server(tx_clone, window_clone).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_machine_name,
            get_logs,
            add_log,
            get_sound_enabled,
            set_sound_enabled,
            send_urusee
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
