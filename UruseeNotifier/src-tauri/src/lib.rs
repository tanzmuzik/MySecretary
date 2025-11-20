mod udp_handler;

use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};
use udp_handler::UdpHandler;

#[derive(Clone, serde::Serialize)]
struct ConnectionStatus {
    online: bool,
    broadcast_addr: String,
    machine_id: String,
}

// UDP ハンドラーのグローバル状態
struct AppState {
    udp_handler: Arc<Mutex<UdpHandler>>,
}

#[tauri::command]
fn send_uresee(state: tauri::State<AppState>) -> Result<String, String> {
    let handler = state.udp_handler.lock().map_err(|e| e.to_string())?;
    handler.send_uresee().map_err(|e| e.to_string())?;
    Ok("Uresee sent!".to_string())
}

#[tauri::command]
fn get_connection_status(state: tauri::State<AppState>) -> Result<ConnectionStatus, String> {
    let handler = state.udp_handler.lock().map_err(|e| e.to_string())?;
    Ok(ConnectionStatus {
        online: true,
        broadcast_addr: handler.get_broadcast_addr().to_string(),
        machine_id: handler.get_machine_id().to_string(),
    })
}

#[tauri::command]
async fn show_bubble(app: tauri::AppHandle, text: String, emoji: String, x: i32, y: i32) -> Result<(), String> {
    let label = format!("bubble-{}", chrono::Utc::now().timestamp_millis());

    // 透過ウィンドウを作成
    let window = WebviewWindowBuilder::new(
        &app,
        label.clone(),
        WebviewUrl::App(format!("bubble.html?text={}&emoji={}",
            urlencoding::encode(&text),
            urlencoding::encode(&emoji)
        ).into())
    )
    .title("")
    .inner_size(250.0, 100.0)
    .position(x as f64, y as f64)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(false)
    .focused(false)
    .build()
    .map_err(|e| e.to_string())?;

    // 3秒後にウィンドウを閉じる
    let window_clone = window.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(3));
        let _ = window_clone.close();
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // UDP ハンドラーを初期化
    let udp_handler = Arc::new(Mutex::new(
        UdpHandler::new().unwrap_or_else(|e| {
            eprintln!("Error initializing UDP handler: {}", e);
            panic!("Cannot initialize UDP handler: {}", e);
        })
    ));

    // setup クロージャ用にクローン
    let udp_handler_for_setup = udp_handler.clone();
    let udp_handler_for_tray = udp_handler.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(move |app| {
            // UDP リスナーを起動
            let handler_clone = udp_handler_for_setup.clone();
            match UdpHandler::start_listener(app.handle().clone(), handler_clone) {
                Ok(_) => println!("UDP listener started successfully"),
                Err(e) => {
                    eprintln!("Warning: Failed to start UDP listener: {}", e);
                    eprintln!("The app will continue to run, but UDP features may not work.");
                    eprintln!("Please check if port 5555 is available and firewall settings.");
                }
            }

            // トレイメニューを作成
            let show_item = MenuItem::with_id(app, "show", "設定を開く", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            // トレイアイコンを作成
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(move |tray, event| {
                    // 左クリックで「うるせぇ！」を送信
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        println!("Tray icon clicked - sending uresee!");
                        if let Ok(handler) = udp_handler_for_tray.lock() {
                            if let Err(e) = handler.send_uresee() {
                                eprintln!("Failed to send uresee from tray: {}", e);
                            }
                        }
                    }
                })
                .build(app)?;

            // メインウィンドウの閉じるボタンの動作を変更（最小化するだけで終了しない）
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        // ウィンドウを閉じる代わりに隠す
                        let _ = window_clone.hide();
                        api.prevent_close();
                    }
                });
            }

            Ok(())
        })
        .manage(AppState {
            udp_handler: udp_handler.clone(),
        })
        .invoke_handler(tauri::generate_handler![send_uresee, get_connection_status, show_bubble])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
