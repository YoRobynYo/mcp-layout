const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const cpuUsageSpan = document.getElementById('cpu-usage');
    const freeRamSpan = document.getElementById('free-ram');
    const totalRamSpan = document.getElementById('total-ram');
    const uptimeSpan = document.getElementById('uptime');
    const netRxSpan = document.getElementById('net-rx');
    const netTxSpan = document.getElementById('net-tx');
    const diskUsedSpan = document.getElementById('disk-used');
    const diskTotalSpan = document.getElementById('disk-total');

    const wifiSsidSpan = document.getElementById('wifi-ssid');
    const wifiSignalSpan = document.getElementById('wifi-signal');
    const wifiIpSpan = document.getElementById('wifi-ip');
    const wifiMacSpan = document.getElementById('wifi-mac');
    const wifiSpeedSpan = document.getElementById('wifi-speed');
    const wifiFrequencySpan = document.getElementById('wifi-frequency');
    const wifiSecuritySpan = document.getElementById('wifi-security');
    const wifiGatewaySpan = document.getElementById('wifi-gateway');
    const wifiDnsSpan = document.getElementById('wifi-dns');

    async function updateSystemInfo() {
        const info = await ipcRenderer.invoke('get-system-info');

        cpuUsageSpan.textContent = `${info.cpuUsage.toFixed(1)}%`;
        freeRamSpan.textContent = `${(info.freeRam / (1024 ** 3)).toFixed(2)} GB`;
        totalRamSpan.textContent = `${(info.totalRam / (1024 ** 3)).toFixed(2)} GB`;
        
        const uptimeDays = Math.floor(info.uptime / (3600 * 24));
        const uptimeHours = Math.floor((info.uptime % (3600 * 24)) / 3600);
        const uptimeMinutes = Math.floor((info.uptime % 3600) / 60);
        uptimeSpan.textContent = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;

        netRxSpan.textContent = `${(info.netRx / 1024).toFixed(2)} KB/s`;
        netTxSpan.textContent = `${(info.netTx / 1024).toFixed(2)} KB/s`;

        diskUsedSpan.textContent = `${(info.diskUsed / (1024 ** 3)).toFixed(2)} GB`;
        diskTotalSpan.textContent = `${(info.diskTotal / (1024 ** 3)).toFixed(2)} GB`;
    }

    async function updateWifiInfo() {
        if (ipcRenderer) {
            try {
                const wifiInfo = await ipcRenderer.invoke('get-wifi-info');
                if (wifiInfo) {
                    wifiSsidSpan.textContent = wifiInfo.ssid || '--';
                    wifiSignalSpan.textContent = wifiInfo.signalStrength ? `${wifiInfo.signalStrength} dBm` : '--';
                    wifiIpSpan.textContent = wifiInfo.ipAddress || '--';
                    wifiMacSpan.textContent = wifiInfo.macAddress || '--';
                    wifiSpeedSpan.textContent = wifiInfo.connectionSpeed ? `${wifiInfo.connectionSpeed} Mbps` : '--';
                    wifiFrequencySpan.textContent = wifiInfo.frequency ? `${wifiInfo.frequency} GHz` : '--';
                    wifiSecuritySpan.textContent = wifiInfo.security || '--';
                    wifiGatewaySpan.textContent = wifiInfo.gateway || '--';
                    wifiDnsSpan.textContent = wifiInfo.dnsServers ? wifiInfo.dnsServers.join(', ') : '--';
                } else {
                    console.log('No Wi-Fi information available.');
                }
            } catch (error) {
                console.error('Error fetching Wi-Fi info:', error);
            }
        } else {
            console.warn('ipcRenderer not available. Cannot fetch Wi-Fi info.');
        }
    }

    // Update every 3 seconds
    setInterval(updateSystemInfo, 3000);
    setInterval(updateWifiInfo, 5000); // Update Wi-Fi info less frequently
    updateSystemInfo(); // Initial call
    updateWifiInfo(); // Initial call
});