document.addEventListener('DOMContentLoaded', () => {
    const cpuUsageSpan = document.getElementById('cpu-usage');
    const freeRamSpan = document.getElementById('free-ram');
    const totalRamSpan = document.getElementById('total-ram');
    const uptimeSpan = document.getElementById('uptime');
    const netRxSpan = document.getElementById('net-rx');
    const netTxSpan = document.getElementById('net-tx');
    const diskUsedSpan = document.getElementById('disk-used');
    const diskTotalSpan = document.getElementById('disk-total');

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
        if (window.electronAPI && window.electronAPI.getSystemInfo) {
            const info = await window.electronAPI.getSystemInfo();
            cpuUsageSpan.textContent = `${typeof info.cpuUsage === 'number' && !isNaN(info.cpuUsage) ? info.cpuUsage.toFixed(1) : 'N/A'}%`;
            freeRamSpan.textContent = `${bytesToGB(info.freeRam)} GB`;
            totalRamSpan.textContent = `${bytesToGB(info.totalRam)} GB`;
            uptimeSpan.textContent = formatUptime(info.uptime);
            netRxSpan.textContent = `${typeof info.netRx === 'number' && !isNaN(info.netRx) ? (info.netRx / 1024).toFixed(1) : 'N/A'} KB/s`;
            netTxSpan.textContent = `${typeof info.netTx === 'number' && !isNaN(info.netTx) ? (info.netTx / 1024).toFixed(1) : 'N/A'} KB/s`;
            diskUsedSpan.textContent = `${bytesToGB(info.diskUsed)} GB`;
            diskTotalSpan.textContent = `${bytesToGB(info.diskTotal)} GB`;
        } else {
            console.error("electronAPI.getSystemInfo not available in System Monitor window.");
            cpuUsageSpan.textContent = 'Error';
            freeRamSpan.textContent = 'Error';
            totalRamSpan.textContent = 'Error';
            uptimeSpan.textContent = 'Error';
            netRxSpan.textContent = 'Error';
            netTxSpan.textContent = 'Error';
            diskUsedSpan.textContent = 'Error';
            diskTotalSpan.textContent = 'Error';
        }
    }

    // Update info every 2 seconds
    setInterval(updateSystemInfo, 2000);
    updateSystemInfo(); // Initial update
});