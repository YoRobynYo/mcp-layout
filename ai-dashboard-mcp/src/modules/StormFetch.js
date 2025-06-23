// StormFetch.js
// Converted from Rainmeter Lua script to JavaScript for use in Electron

export class StormFeedParser {
  constructor(config) {
    this.config = config;
    this.imageHeight = config.imageHeight;
    this.imageWidth = config.imageWidth;
    this.offsetX = config.offsetX;
    this.offsetY = config.offsetY;
    this.storms = [];
    this.tipText = "";
  }

  parseFeed(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const items = xml.querySelectorAll("item");
    if (!items.length) return { storms: [], message: "No active storms." };

    this.storms = [];
    this.tipText = "";

    items.forEach((item, index) => {
      const title = item.querySelector("title")?.textContent.trim() || "(No Name)";
      const link = item.querySelector("link")?.textContent.trim();
      const description = item.querySelector("description")?.textContent || "";

      const windMatch = description.match(/Wind\D+(\d+)\s*MPH/);
      const movingMatch = description.match(/Movement\D+([^<]+)/);
      const locationMatch = description.match(/Location\D+(\d+\.?\d*)\s*([NS])\s+(\d+\.?\d*)\s*([WE])/);

      const wind = windMatch ? parseInt(windMatch[1]) : 0;
      const moving = movingMatch ? movingMatch[1].trim() : "Unknown";

      let lat = null, lon = null;
      if (locationMatch) {
        lat = this.resolveLatLong(parseFloat(locationMatch[1]), locationMatch[2], "N");
        lon = this.resolveLatLong(parseFloat(locationMatch[3]), locationMatch[4], "E");
      }

      const category = this.getStormCategory(wind);

      if (lat !== null && lon !== null) {
        const x = Math.floor((((lon + 390) % 360) / 360) * this.imageWidth + this.offsetX);
        const y = Math.floor(((90 - lat) / 180) * this.imageHeight + this.offsetY);

        this.storms.push({
          name: title,
          link,
          wind,
          moving,
          lat,
          lon,
          category,
          x,
          y,
        });

        this.tipText += `- ${title}\n`;
      }
    });

    return {
      storms: this.storms,
      message: `${this.storms.length} Storm(s) Plotted` || "No storms found.",
      tooltip: this.tipText,
    };
  }

  resolveLatLong(value, cardinal, positiveChar) {
    const sign = cardinal === positiveChar ? 1 : -1;
    let coordinate = value * sign;
    if (coordinate > 180) coordinate = 180 - (coordinate - 180);
    return coordinate;
  }

  getStormCategory(speed) {
    if (speed >= 1 && speed < 39) return "Tropical Depression";
    if (speed >= 39 && speed <= 73) return "Tropical Storm";
    if (speed >= 74 && speed <= 95) return "Category 1 Hurricane";
    if (speed >= 96 && speed <= 110) return "Category 2 Hurricane";
    if (speed >= 111 && speed <= 130) return "Category 3 Hurricane";
    if (speed >= 131 && speed <= 155) return "Category 4 Hurricane";
    if (speed > 155) return "Category 5 Hurricane";
    return "Unknown";
  }
}

// Example usage:
// const parser = new StormFeedParser({ imageHeight: 300, imageWidth: 600, offsetX: 10, offsetY: 10 });
// const result = parser.parseFeed(xmlString);
// result.storms.forEach(storm => { renderStorm(storm); });
