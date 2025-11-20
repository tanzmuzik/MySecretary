mod udp_handler;

use std::sync::{Arc, Mutex};
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
        .invoke_handler(tauri::generate_handler![send_uresee, get_connection_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
