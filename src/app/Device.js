class Device {
    constructor(longitude, latitude) {
        this.longitude = longitude;
        this.latitude = latitude;
    }

    json() {
        return {
            "type": "Device",
            "geometry": {
                "type": "Device",
                "coordinates": [
                    this.longitude,
                    this.latitude
                ]
            }
        };
    }
}

export default Device;