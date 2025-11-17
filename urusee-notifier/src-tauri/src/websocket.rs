use futures_util::{SinkExt, StreamExt};
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::Window;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio::sync::Mutex;
use tokio_tungstenite::{accept_async, tungstenite::Message};

type Tx = broadcast::Sender<String>;
type PeerMap = Arc<Mutex<Vec<tokio::sync::mpsc::UnboundedSender<Message>>>>;

async fn handle_connection(
    peer_map: PeerMap,
    raw_stream: TcpStream,
    addr: SocketAddr,
    mut rx: broadcast::Receiver<String>,
    window: Window,
) {
    println!("Incoming TCP connection from: {}", addr);

    let ws_stream = match accept_async(raw_stream).await {
        Ok(ws) => ws,
        Err(e) => {
            println!("Error during the websocket handshake: {}", e);
            return;
        }
    };

    println!("WebSocket connection established: {}", addr);

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut peer_rx) = tokio::sync::mpsc::unbounded_channel();

    // ピアリストに追加
    peer_map.lock().await.push(tx.clone());

    // メッセージをブロードキャスト受信して送信
    let send_task = tokio::spawn(async move {
        while let Ok(msg) = peer_rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // ブロードキャストチャンネルからメッセージを受信
    let broadcast_task = {
        let tx = tx.clone();
        tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                let _ = tx.send(Message::Text(msg));
            }
        })
    };

    // クライアントからのメッセージを受信
    let receive_task = {
        let peer_map = peer_map.clone();
        let window = window.clone();

        tokio::spawn(async move {
            while let Some(msg) = ws_receiver.next().await {
                match msg {
                    Ok(Message::Text(text)) => {
                        println!("Received message: {}", text);

                        // すべてのピアにブロードキャスト
                        let peers = peer_map.lock().await;
                        for peer in peers.iter() {
                            let _ = peer.send(Message::Text(text.clone()));
                        }

                        // フロントエンドに通知
                        let _ = window.emit("receive-urusee", text);
                    }
                    Ok(Message::Close(_)) => {
                        println!("Client disconnected: {}", addr);
                        break;
                    }
                    Err(e) => {
                        println!("Error receiving message: {}", e);
                        break;
                    }
                    _ => {}
                }
            }
        })
    };

    // すべてのタスクが完了するまで待機
    tokio::select! {
        _ = send_task => {},
        _ = broadcast_task => {},
        _ = receive_task => {},
    }

    println!("Connection closed: {}", addr);
}

pub async fn start_server(tx: Tx, window: Window) {
    let addr = "0.0.0.0:5555";
    let listener = match TcpListener::bind(&addr).await {
        Ok(listener) => listener,
        Err(e) => {
            println!("Failed to bind to {}: {}", addr, e);
            return;
        }
    };

    println!("WebSocket server listening on: {}", addr);

    let peer_map: PeerMap = Arc::new(Mutex::new(Vec::new()));

    while let Ok((stream, addr)) = listener.accept().await {
        let peer_map = peer_map.clone();
        let rx = tx.subscribe();
        let window = window.clone();

        tokio::spawn(handle_connection(peer_map, stream, addr, rx, window));
    }
}
