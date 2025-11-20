mod udp_handler;

use std::sync::{Arc, Mutex};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
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

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            Ok(())
        })
        .manage(AppState {
            udp_handler: udp_handler.clone(),
        })
        .invoke_handler(tauri::generate_handler![send_uresee, get_connection_status, show_bubble])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
