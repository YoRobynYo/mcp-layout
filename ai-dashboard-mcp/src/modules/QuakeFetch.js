// QuakeFetch.js
// Usage: call update(rawXMLString) with feed XML string to parse & update UI

class EarthquakeFeed {
  constructor(config) {
    this.mapWidth = config.mapWidth || 800;     // map image width in pixels
    this.mapHeight = config.mapHeight || 600;   // map image height in pixels
    this.offsetX = config.offsetX || 0;          // horizontal pixel offset
    this.offsetY = config.offsetY || 0;          // vertical pixel offset
    this.maxMarkers = config.maxMarkers || 20;  // max markers to show
    this.markersContainer = document.getElementById(config.markersContainerId);
    this.summaryElement = document.getElementById(config.summaryElementId);
  }

  update(rawXMLString) {
    if (!rawXMLString) {
      console.error("No feed XML string provided");
      return;
    }

    const quakeData = this.parseFeed(rawXMLString);

    this.clearMarkers();

    quakeData.slice(0, this.maxMarkers).forEach((quake, i) => {
      this.showMarker(i, quake);
    });

    this.updateSummary(quakeData.length);

    return `Earthquakes Displayed: ${quakeData.length}`;
  }

  parseFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const entries = xmlDoc.querySelectorAll("entry");
    const quakes = [];

    entries.forEach((entry) => {
      try {
        const title = entry.querySelector("title")?.textContent || "";
        const link = entry.querySelector('link[type="text/html"]')?.getAttribute("href") || "";
        const updated = entry.querySelector("updated")?.textContent || "";
        // fallback if your feed uses different time element:
        const timeRaw = updated;

        // Extract magnitude from title e.g. "M 4.5 - Location"
        const magnitudeMatch = title.match(/M\s*([\d.]+)/);
        const magnitude = magnitudeMatch ? magnitudeMatch[1] : "N/A";

        // Extract depth - might require feed-specific parsing, fallback to N/A
        let depth = "N/A";
        const depthMatch = entry.textContent.match(/Depth<\/dt><dd>([\d.]+)\(/);
        if (depthMatch) depth = depthMatch[1];

        // Extract lat/lon from georss:point
        let latitude = 0, longitude = 0;
        const geoPoint = entry.querySelector("georss\\:point, point");
        if (geoPoint) {
          const coords = geoPoint.textContent.trim().split(/\s+/);
          latitude = parseFloat(coords[0]);
          longitude = parseFloat(coords[1]);
        }

        // Convert lon/lat to pixel positions on the map
        const xPos = Math.floor((((longitude + 390) % 360) / 360) * this.mapWidth) + this.offsetX;
        const yPos = Math.floor(((90 - latitude) / 180) * this.mapHeight) + this.offsetY;

        quakes.push({
          title,
          link,
          timeRaw,
          magnitude,
          depth,
          latitude,
          longitude,
          xPos,
          yPos,
        });
      } catch (e) {
        console.warn("Failed parsing entry:", e);
      }
    });

    return quakes;
  }

  showMarker(index, quake) {
    // Create or reuse a marker div
    let marker = document.getElementById(`quakeMarker${index}`);
    if (!marker) {
      marker = document.createElement("div");
      marker.id = `quakeMarker${index}`;
      marker.classList.add("quake-marker"); // add your CSS styling for markers
      if (this.markersContainer) {
        this.markersContainer.appendChild(marker);
      } else {
        console.warn("Markers container not found!");
        return;
      }
    }

    // Position the marker
    marker.style.position = "absolute";
    marker.style.left = `${quake.xPos}px`;
    marker.style.top = `${quake.yPos}px`;

    // Set tooltip text
    const localTime = this.localEventTime(quake.timeRaw);
    marker.title = `${quake.title}\nTime: ${localTime}\nMagnitude: ${quake.magnitude}\nDepth: ${quake.depth}`;

    // Click opens quake link in external browser
    marker.onclick = () => {
      require("electron").shell.openExternal(quake.link);
    };

    marker.style.display = "block";
  }

  clearMarkers() {
    if (!this.markersContainer) return;
    // Remove all existing quake markers
    const markers = this.markersContainer.querySelectorAll(".quake-marker");
    markers.forEach(marker => marker.remove());
  }

  updateSummary(count) {
    if (this.summaryElement) {
      this.summaryElement.textContent = `[ ${count} ] Earthquakes`;
    }
  }

  localEventTime(utcString) {
    // Convert UTC time string (ISO 8601) to local string
    const date = new Date(utcString);
    if (isNaN(date)) return "Invalid Date";
    return date.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "long",
    });
  }
}

// Example usage:

// In your HTML, you must have:
// <div id="quakeMarkers" style="position:relative; width:800px; height:600px;"></div>
// <div id="quakeSummary"></div>

// In your Electron app main JS or preload script:
// const quakeFeed = new EarthquakeFeed({
//   mapWidth: 800,
//   mapHeight: 600,
//   offsetX: 0,
//   offsetY: 0,
//   maxMarkers: 20,
//   markersContainerId: "quakeMarkers",
//   summaryElementId: "quakeSummary",
// });

// Then whenever you get your raw XML feed string, call:
// quakeFeed.update(rawXMLString);


export default EarthquakeFeed;
