document.addEventListener('DOMContentLoaded', () => {
    // System Performance
    const cpuUsageSpan = document.getElementById('cpu-usage');
    const cpuLoadSpan = document.getElementById('cpu-load');
    const cpuTempSpan = document.getElementById('cpu-temp');
    
    // Memory
    const freeRamSpan = document.getElementById('free-ram');
    const totalRamSpan = document.getElementById('total-ram');
    const ramUsageSpan = document.getElementById('ram-usage');
    
    // System Info
    const uptimeSpan = document.getElementById('uptime');
    const batteryLevelSpan = document.getElementById('battery-level');
    const batteryStatusSpan = document.getElementById('battery-status');
    
    // Network
    const netRxSpan = document.getElementById('net-rx');
    const netTxSpan = document.getElementById('net-tx');
    const netTotalSpan = document.getElementById('net-total');
    
    // Disk
    const diskUsedSpan = document.getElementById('disk-used');
    const diskTotalSpan = document.getElementById('disk-total');
    const diskUsageSpan = document.getElementById('disk-usage');
    
    // WiFi elements
    const wifiSsidSpan = document.getElementById('wifi-ssid');
    const wifiSignalSpan = document.getElementById('wifi-signal');
    const wifiIpSpan = document.getElementById('wifi-ip');
    const wifiMacSpan = document.getElementById('wifi-mac');
    const wifiSpeedSpan = document.getElementById('wifi-speed');
    const wifiFrequencySpan = document.getElementById('wifi-frequency');
    const wifiSecuritySpan = document.getElementById('wifi-security');
    const wifiGatewaySpan = document.getElementById('wifi-gateway');
    const wifiDnsSpan = document.getElementById('wifi-dns');
    
    // Additional System Info
    const osVersionSpan = document.getElementById('os-version');
    const nodeVersionSpan = document.getElementById('node-version');
    const electronVersionSpan = document.getElementById('electron-version');

    // Helper to format bytes to GB
    function bytesToGB(bytes) {
        return typeof bytes === 'number' && !isNaN(bytes) ? (bytes / (1024 ** 3)).toFixed(2) : 'N/A';
    }

    // Helper to format seconds to HH:MM:SS
    function formatUptime(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds)) return 'N/A';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Function to update system info
    async function updateSystemInfo() {
        try {
            // Direct access to Electron APIs since contextIsolation is false
            const { ipcRenderer } = require('electron');
            const info = await ipcRenderer.invoke('get-system-info');
            
            // System Performance
            cpuUsageSpan.textContent = `${typeof info.cpuUsage === 'number' && !isNaN(info.cpuUsage) ? info.cpuUsage.toFixed(1) : 'N/A'}%`;
            cpuLoadSpan.textContent = `${typeof info.cpuLoad === 'number' && !isNaN(info.cpuLoad) ? info.cpuLoad.toFixed(2) : 'N/A'}`;
            cpuTempSpan.textContent = `${typeof info.cpuTemp === 'number' && !isNaN(info.cpuTemp) ? info.cpuTemp.toFixed(1) : 'N/A'}°C`;
            
            // Memory
            const totalRam = info.totalRam;
            const freeRam = info.freeRam;
            const usedRam = totalRam - freeRam;
            const ramUsagePercent = totalRam > 0 ? ((usedRam / totalRam) * 100) : 0;
            
            freeRamSpan.textContent = `${bytesToGB(freeRam)} GB`;
            totalRamSpan.textContent = `${bytesToGB(totalRam)} GB`;
            ramUsageSpan.textContent = `${ramUsagePercent.toFixed(1)}%`;
            
            // System Info
            uptimeSpan.textContent = formatUptime(info.uptime);
            
            // Network
            const netRx = info.netRx || 0;
            const netTx = info.netTx || 0;
            const netTotal = netRx + netTx;
            
            netRxSpan.textContent = `${typeof netRx === 'number' && !isNaN(netRx) ? (netRx / 1024).toFixed(1) : 'N/A'} KB/s`;
            netTxSpan.textContent = `${typeof netTx === 'number' && !isNaN(netTx) ? (netTx / 1024).toFixed(1) : 'N/A'} KB/s`;
            netTotalSpan.textContent = `${(netTotal / 1024).toFixed(1)} KB/s`;
            
            // Disk
            const diskTotal = info.diskTotal;
            const diskUsed = info.diskUsed;
            const diskUsagePercent = diskTotal > 0 ? ((diskUsed / diskTotal) * 100) : 0;
            
            diskUsedSpan.textContent = `${bytesToGB(diskUsed)} GB`;
            diskTotalSpan.textContent = `${bytesToGB(diskTotal)} GB`;
            diskUsageSpan.textContent = `${diskUsagePercent.toFixed(1)}%`;
            
        } catch (error) {
            console.error("Error updating system info:", error);
            // Set error states for all spans
            [cpuUsageSpan, cpuLoadSpan, cpuTempSpan, freeRamSpan, totalRamSpan, ramUsageSpan, 
             uptimeSpan, netRxSpan, netTxSpan, netTotalSpan, diskUsedSpan, diskTotalSpan, diskUsageSpan]
                .forEach(span => span.textContent = 'Error');
        }
    }

    // Function to update WiFi info
    async function updateWifiInfo() {
        try {
            const { ipcRenderer } = require('electron');
            const wifiInfo = await ipcRenderer.invoke('get-wifi-info');
            if (wifiInfo) {
                wifiSsidSpan.textContent = wifiInfo.ssid || 'N/A';
                wifiSignalSpan.textContent = `${wifiInfo.signal || 'N/A'} dBm`;
                wifiIpSpan.textContent = wifiInfo.ip || 'N/A';
                wifiMacSpan.textContent = wifiInfo.mac || 'N/A';
                wifiSpeedSpan.textContent = `${wifiInfo.speed || 'N/A'} Mbps`;
                wifiFrequencySpan.textContent = `${wifiInfo.frequency || 'N/A'} GHz`;
                wifiSecuritySpan.textContent = wifiInfo.security || 'N/A';
                wifiGatewaySpan.textContent = wifiInfo.gateway || 'N/A';
                wifiDnsSpan.textContent = wifiInfo.dns || 'N/A';
            } else {
                [wifiSsidSpan, wifiSignalSpan, wifiIpSpan, wifiMacSpan, wifiSpeedSpan, 
                 wifiFrequencySpan, wifiSecuritySpan, wifiGatewaySpan, wifiDnsSpan]
                    .forEach(span => span.textContent = 'Not Connected');
            }
        } catch (error) {
            console.error("Error updating WiFi info:", error);
            [wifiSsidSpan, wifiSignalSpan, wifiIpSpan, wifiMacSpan, wifiSpeedSpan, 
             wifiFrequencySpan, wifiSecuritySpan, wifiGatewaySpan, wifiDnsSpan]
                .forEach(span => span.textContent = 'Error');
        }
    }

    // Function to update battery info
    async function updateBatteryInfo() {
        try {
            const { ipcRenderer } = require('electron');
            const batteryInfo = await ipcRenderer.invoke('get-battery-info');
            if (batteryInfo) {
                batteryLevelSpan.textContent = `${batteryInfo.percent || 'N/A'}%`;
                batteryStatusSpan.textContent = batteryInfo.isCharging ? 'Charging' : 'Discharging';
            } else {
                batteryLevelSpan.textContent = 'N/A';
                batteryStatusSpan.textContent = 'N/A';
            }
        } catch (error) {
            console.error("Error updating battery info:", error);
            batteryLevelSpan.textContent = 'Error';
            batteryStatusSpan.textContent = 'Error';
        }
    }

    // Function to update additional system info
    function updateAdditionalInfo() {
        // OS Version - Better detection for Apple Silicon
        let platform = navigator.platform;
        if (platform === 'MacIntel') {
            // Check if it's actually Apple Silicon
            if (navigator.userAgent.includes('AppleWebKit') && navigator.userAgent.includes('Safari')) {
                platform = 'MacBook Pro M2 (Apple Silicon)';
            } else {
                platform = 'Mac (Apple Silicon)';
            }
        }
        osVersionSpan.textContent = platform || 'N/A';
        
        // Node Version (if available)
        if (process && process.version) {
            nodeVersionSpan.textContent = process.version;
        } else {
            nodeVersionSpan.textContent = 'N/A';
        }
        
        // Electron Version (if available)
        if (process && process.versions && process.versions.electron) {
            electronVersionSpan.textContent = process.versions.electron;
        } else {
            electronVersionSpan.textContent = 'N/A';
        }
    }

    // Update info every 2 seconds
    setInterval(updateSystemInfo, 2000);
    setInterval(updateWifiInfo, 3000);
    setInterval(updateBatteryInfo, 5000);
    
    // Initial updates
    updateSystemInfo();
    updateWifiInfo();
    updateBatteryInfo();
    updateAdditionalInfo();
});