// Konfigurasi Utama
const config = {
  // UUID VLESS (ganti dengan UUID Anda)
  uuid: "d758164a-ffdd-433d-b198-e171bed502b7",
  
  // Domain worker bawaan (untuk halaman palsu)
  workerDomain: "cdi.ahem7553.workers.dev",
  
  // Domain kustom (untuk proxy)
  customDomain: "cdi.ahem7553@gmail.com",
  
  // Path untuk VLESS (gunakan path yang tidak mencurigakan)
  vlessPath: "/cdn-cgi/trace",
  
  // Halaman palsu (bisa diubah sesuai kebutuhan)
  fakeWebsite: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Portal</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 400px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 40px;
            box-sizing: border-box;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            font-size: 28px;
            color: #2c3e50;
            margin: 0;
        }
        .logo p {
            color: #7f8c8d;
            margin: 10px 0 0;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #34495e;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 16px;
        }
        .form-group input:focus {
            outline: none;
            border-color: #3498db;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #7f8c8d;
        }
        .alert {
            padding: 10px;
            background-color: #f8d7da;
            color: #721c24;
            border-radius: 4px;
            margin-bottom: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Secure Portal</h1>
            <p>Employee Access System</p>
        </div>
        
        <div class="alert" id="alert">Invalid username or password</div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn">Login</button>
        </form>
        
        <div class="footer">
            <p>&copy; 2023 Secure Portal. All rights reserved.</p>
            <p>Unauthorized access is prohibited.</p>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('alert').style.display = 'block';
        });
    </script>
</body>
</html>
  `,
  
  // Header untuk masking (membuat request terlihat seperti request normal)
  maskingHeaders: {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Cache-Control": "max-age=0",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
  },
  
  // Daftar User-Agent yang akan dirotasi
  userAgents: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
  ],
  
  // Daftar path alternatif untuk VLESS
  vlessPaths: [
    "/cdn-cgi/trace",
    "/assets/js/main.js",
    "/static/css/style.css",
    "/api/v1/data",
    "/cdn/verify"
  ]
};

// Fungsi untuk menangani request
async function handleRequest(request) {
  const url = new URL(request.url);
  const host = request.headers.get('host');
  
  // 1. Handle domain worker bawaan (tampilkan halaman palsu)
  if (host === config.workerDomain) {
    return new Response(config.fakeWebsite, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...config.maskingHeaders
      }
    });
  }
  
  // 2. Handle domain kustom untuk VLESS
  if (host === config.customDomain) {
    // Cek apakah path ada di daftar vlessPaths
    const isVlessPath = config.vlessPaths.some(path => url.pathname === path);
    
    if (isVlessPath) {
      if (request.headers.get('Upgrade') === 'websocket') {
        return handleWebSocket(request);
      } else {
        // Untuk request non-WebSocket, kembalikan response yang mirip dengan CDN trace
        return new Response(`msg=ok
host=${config.customDomain}
time=${Math.floor(Date.now() / 1000)}`, {
          headers: {
            'Content-Type': 'text/plain',
            ...config.maskingHeaders
          }
        });
      }
    } 
    // Path lain di domain kustom
    else {
      return new Response('Not Found', { 
        status: 404,
        headers: config.maskingHeaders
      });
    }
  }
  
  // 3. Handle domain tidak dikenal
  return new Response('Not Found', { 
    status: 404,
    headers: config.maskingHeaders
  });
}

// Fungsi untuk menangani WebSocket
async function handleWebSocket(request) {
  const [client, server] = Object.values(new WebSocketPair());
  server.accept();
  
  // Terima koneksi dari klien
  server.addEventListener('message', async (event) => {
    try {
      // Ekstrak data VLESS
      const vlessData = parseVLESSData(event.data);
      
      // Buat request ke tujuan
      const response = await fetch(vlessData.url, {
        method: vlessData.method,
        headers: {
          ...vlessData.headers,
          ...config.maskingHeaders,
          // Rotasi User-Agent
          "User-Agent": config.userAgents[Math.floor(Math.random() * config.userAgents.length)]
        },
        body: vlessData.body
      });
      
      // Kirim response kembali
      const responseData = await response.arrayBuffer();
      server.send(new Uint8Array(responseData));
    } catch (error) {
      server.close(1011, 'Proxy Error');
    }
  });
  
  return new Response(null, { 
    status: 101, 
    webSocket: client,
    headers: config.maskingHeaders
  });
}

// Fungsi untuk parsing data VLESS
function parseVLESSData(data) {
  const buffer = new Uint8Array(data);
  
  // Ekstrak UUID (16 byte setelah version)
  const receivedUuid = Array.from(buffer.slice(1, 17))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Verifikasi UUID
  if (receivedUuid !== config.uuid.replace(/-/g, '')) {
    throw new Error('Invalid UUID');
  }
  
  // Ekstrak address type
  const addressType = buffer[17];
  let address, port;
  let offset = 18;
  
  if (addressType === 1) { // IPv4
    address = `${buffer[18]}.${buffer[19]}.${buffer[20]}.${buffer[21]}`;
    offset += 4;
  } else if (addressType === 2) { // Domain
    const domainLength = buffer[18];
    address = new TextDecoder().decode(buffer.slice(19, 19 + domainLength));
    offset += 1 + domainLength;
  } else if (addressType === 3) { // IPv6
    throw new Error('IPv6 not supported');
  }
  
  // Ekstrak port
  port = (buffer[offset] << 8) | buffer[offset + 1];
  offset += 2;
  
  // Ekstrak payload
  const payload = buffer.slice(offset);
  const payloadText = new TextDecoder().decode(payload);
  const [requestLine, ...headerLines] = payloadText.split('\r\n');
  const [method, path] = requestLine.split(' ');
  
  // Buat headers
  const headers = {};
  headerLines.forEach(line => {
    if (line) {
      const [key, value] = line.split(': ');
      headers[key] = value;
    }
  });
  
  // Buat URL tujuan
  const url = `http://${address}:${port}${path}`;
  
  return {
    url,
    method,
    headers,
    body: payload.slice(payloadText.indexOf('\r\n\r\n') + 4)
  };
}

// Event listener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
