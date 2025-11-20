use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::net::{IpAddr, Ipv4Addr, SocketAddr, UdpSocket};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use tokio::task;

const UDP_PORT: u16 = 5555;
const BUFFER_SIZE: usize = 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UruseeMessage {
    pub r#type: String,
    pub timestamp: i64,
    pub machine_id: String,
}

#[derive(Debug, Clone)]
pub struct UdpHandler {
    machine_id: String,
    broadcast_addr: Ipv4Addr,
}

impl UdpHandler {
    pub fn new() -> Result<Self> {
        let machine_id = uuid::Uuid::new_v4().to_string();
        let broadcast_addr = Self::get_broadcast_address().unwrap_or_else(|e| {
            eprintln!("Warning: Failed to get local IP: {}", e);
            eprintln!("Using default broadcast address 255.255.255.255");
            Ipv4Addr::new(255, 255, 255, 255)
        });

        Ok(Self {
            machine_id,
            broadcast_addr,
        })
    }

    fn get_broadcast_address() -> Result<Ipv4Addr> {
        // ローカル IP アドレスを取得
        let local_ip = local_ip_address::local_ip()
            .context("Failed to get local IP address")?;

        if let IpAddr::V4(ipv4) = local_ip {
            // サブネットマスク 255.255.255.0 を想定してブロードキャストアドレスを計算
            let octets = ipv4.octets();
            let broadcast = Ipv4Addr::new(octets[0], octets[1], octets[2], 255);
            println!("Detected local IP: {}, using broadcast: {}", ipv4, broadcast);
            Ok(broadcast)
        } else {
            // IPv6 の場合はデフォルトで 255.255.255.255 を使用
            println!("IPv6 detected, using default broadcast address");
            Ok(Ipv4Addr::new(255, 255, 255, 255))
        }
    }

    pub fn send_uresee(&self) -> Result<()> {
        let socket = UdpSocket::bind("0.0.0.0:0")
            .context("Failed to bind UDP socket for sending")?;

        socket.set_broadcast(true)
            .context("Failed to set broadcast option")?;

        let message = UruseeMessage {
            r#type: "uresee".to_string(),
            timestamp: chrono::Utc::now().timestamp(),
            machine_id: self.machine_id.clone(),
        };

        let json = serde_json::to_string(&message)
            .context("Failed to serialize message")?;

        let broadcast_addr = SocketAddr::from((self.broadcast_addr, UDP_PORT));
        socket.send_to(json.as_bytes(), broadcast_addr)
            .context("Failed to send UDP broadcast")?;

        println!("Sent uresee broadcast to {}", broadcast_addr);
        Ok(())
    }

    pub fn start_listener(app: AppHandle, handler: Arc<Mutex<UdpHandler>>) -> Result<()> {
        let socket = UdpSocket::bind(format!("0.0.0.0:{}", UDP_PORT))
            .context("Failed to bind UDP socket for receiving")?;

        socket.set_broadcast(true)
            .context("Failed to set broadcast option")?;

        println!("UDP listener started on port {}", UDP_PORT);

        // 非同期タスクでリスナーを起動
        task::spawn_blocking(move || {
            let mut buf = [0u8; BUFFER_SIZE];

            loop {
                match socket.recv_from(&mut buf) {
                    Ok((size, _addr)) => {
                        if let Ok(json_str) = std::str::from_utf8(&buf[..size]) {
                            if let Ok(message) = serde_json::from_str::<UruseeMessage>(json_str) {
                                if message.r#type == "uresee" {
                                    println!("Received uresee message: {:?}", message);

                                    // フロントエンドにイベントを送信
                                    if let Err(e) = app.emit("uresee-received", &message) {
                                        eprintln!("Failed to emit event: {}", e);
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to receive UDP packet: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    pub fn get_machine_id(&self) -> &str {
        &self.machine_id
    }

    pub fn get_broadcast_addr(&self) -> Ipv4Addr {
        self.broadcast_addr
    }
}
