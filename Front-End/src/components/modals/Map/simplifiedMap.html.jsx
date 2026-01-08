export const simplifiedMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Rescue Map with Compass</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body, html {
            height: 100%;
            width: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #map {
            width: 100%;
            height: 100%;
            background: #e6f0fa;
        }
        
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .loading-text {
            margin-top: 20px;
            font-size: 16px;
            color: #4b5563;
        }
        
        /* IMPROVED COMPASS STYLES */
        .compass-container {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            border-radius: 12px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.2);
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
        }
        
        .compass {
            width: 50px;
            height: 50px;
            position: relative;
            transition: transform 0.1s linear;
        }
        
        .compass-arrow {
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 15px solid #ef4444;
            position: absolute;
            top: 2px;
            left: 17px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .compass-circle {
            width: 50px;
            height: 50px;
            border: 2px solid #4b5563;
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }
        
        .compass-north {
            position: absolute;
            top: 4px;
            left: 20px;
            font-size: 10px;
            font-weight: bold;
            color: #ef4444;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        /* SMOOTHER USER MARKER ROTATION */
        .user-marker-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .user-marker-direction {
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 16px solid #3b82f6;
            margin-bottom: -3px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .user-marker-circle {
            width: 26px;
            height: 26px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .user-marker-moving .user-marker-circle {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            animation: pulse-moving 2s infinite;
        }
        
        /* ARRIVED USER MARKER */
        .user-marker-arrived .user-marker-circle {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            animation: pulse-arrived 2s infinite;
        }
        
        /* COMPLETED ROUTE LINE STYLE */
        .completed-route-line {
            color: #10b981 !important;
            opacity: 0.7 !important;
        }
        
        @keyframes pulse-moving {
            0% { 
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4),
                            0 4px 12px rgba(16, 185, 129, 0.3);
            }
            70% { 
                box-shadow: 0 0 0 10px rgba(16, 185, 129, 0),
                            0 4px 12px rgba(16, 185, 129, 0.3);
            }
            100% { 
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0),
                            0 4px 12px rgba(16, 185, 129, 0.3);
            }
        }
        
        @keyframes pulse-arrived {
            0% { 
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7),
                            0 0 0 0 rgba(16, 185, 129, 0.4),
                            0 4px 12px rgba(16, 185, 129, 0.3);
            }
            50% {
                transform: scale(1.1);
            }
            70% { 
                box-shadow: 0 0 0 15px rgba(16, 185, 129, 0),
                            0 0 0 30px rgba(16, 185, 129, 0),
                            0 4px 12px rgba(16, 185, 129, 0.3);
            }
            100% { 
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0),
                            0 0 0 0 rgba(16, 185, 129, 0),
                            0 4px 12px rgba(16, 185, 129, 0.3);
            }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* DEVICE ORIENTATION PERMISSION BUTTON */
        .orientation-permission-btn {
            position: absolute;
            top: 100px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            z-index: 1000;
            cursor: pointer;
            display: none;
        }
        
        .orientation-permission-btn:hover {
            background: #2563eb;
        }
        
        /* RESPONSIVE CONTROLS */
        .leaflet-control-zoom {
            position: absolute !important;
            top: 90px !important;
            right: 20px !important;
            border: none !important;
            background: transparent !important;
        }
        
        .leaflet-control-zoom a {
            background: white !important;
            border: none !important;
            border-radius: 50% !important;
            margin-bottom: 10px !important;
            width: 40px !important;
            height: 40px !important;
            line-height: 40px !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
            color: #0e7490 !important;
            font-size: 20px !important;
        }
        
        @media (max-width: 480px) {
            .compass-container {
                width: 60px;
                height: 60px;
                top: 15px;
                right: 15px;
            }
            
            .compass {
                width: 40px;
                height: 40px;
            }
            
            .compass-arrow {
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-bottom: 14px solid #ef4444;
                left: 13px;
            }
            
            .compass-north {
                left: 14px;
                font-size: 9px;
            }
            
            .leaflet-control-zoom {
                top: 80px !important;
                right: 15px !important;
            }
            
            .orientation-permission-btn {
                top: 90px;
                right: 15px;
                padding: 8px 12px;
                font-size: 11px;
            }
        }
        
        .route-info {
            position: absolute;
            top: 80px;
            left: 20px;
            background: white;
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
            min-width: 250px;
        }
        
        .speed-indicator {
            position: absolute;
            bottom: 80px;
            right: 20px;
            background: white;
            padding: 10px 15px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .heading-indicator {
            position: absolute;
            bottom: 130px;
            right: 20px;
            background: white;
            padding: 10px 15px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .accuracy-indicator {
            position: absolute;
            bottom: 180px;
            right: 20px;
            background: white;
            padding: 10px 15px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .device-orientation-indicator {
            position: absolute;
            bottom: 230px;
            right: 20px;
            background: white;
            padding: 10px 15px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* ARRIVAL NOTIFICATION */
        .arrival-notification {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(16, 185, 129, 0.95);
            color: white;
            padding: 25px 35px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
            z-index: 3000;
            text-align: center;
            animation: arrival-popup 0.8s ease-out;
            max-width: 350px;
            width: 90%;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            display: none;
        }
        
        .arrival-notification h3 {
            margin-bottom: 15px;
            font-size: 22px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .arrival-notification p {
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.5;
            color: #f0fdf4;
        }
        
        .arrival-notification button {
            background: white;
            color: #10b981;
            border: none;
            padding: 12px 25px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        }
        
        .arrival-notification button:hover {
            background: #f0fdf4;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(255, 255, 255, 0.4);
        }
        
        @keyframes arrival-popup {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            70% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        /* EXACT ROUTE END POINT MARKER */
        .exact-endpoint-marker {
            background: #dc2626;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.3);
            animation: endpoint-pulse 2s infinite;
        }
        
        /* GREEN ENDPOINT MARKER FOR RESCUED */
        .exact-endpoint-marker-green {
            background: #10b981;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
            animation: endpoint-pulse-green 2s infinite;
        }
        
        /* ARRIVED ENDPOINT MARKER */
        .exact-endpoint-marker-arrived {
            background: #10b981;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.5);
            animation: endpoint-pulse-arrived 1.5s infinite;
        }
        
        /* INVALID COORDINATES MARKER */
        .invalid-coordinates-marker {
            background: #f59e0b;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: invalid-pulse 2s infinite;
        }
        
        @keyframes endpoint-pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7),
                            0 0 0 0 rgba(220, 38, 38, 0.3);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(220, 38, 38, 0),
                            0 0 0 20px rgba(220, 38, 38, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(220, 38, 38, 0),
                            0 0 0 0 rgba(220, 38, 38, 0);
            }
        }
        
        @keyframes endpoint-pulse-green {
            0% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7),
                            0 0 0 0 rgba(16, 185, 129, 0.3);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(16, 185, 129, 0),
                            0 0 0 20px rgba(16, 185, 129, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0),
                            0 0 0 0 rgba(16, 185, 129, 0);
            }
        }
        
        @keyframes endpoint-pulse-arrived {
            0% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.9),
                            0 0 0 0 rgba(16, 185, 129, 0.6),
                            0 0 0 0 rgba(16, 185, 129, 0.3);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(16, 185, 129, 0),
                            0 0 0 30px rgba(16, 185, 129, 0),
                            0 0 0 45px rgba(16, 185, 129, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0),
                            0 0 0 0 rgba(16, 185, 129, 0),
                            0 0 0 0 rgba(16, 185, 129, 0);
            }
        }
        
        @keyframes invalid-pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7),
                            0 4px 12px rgba(245, 158, 11, 0.3);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(245, 158, 11, 0),
                            0 4px 12px rgba(245, 158, 11, 0.3);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(245, 158, 11, 0),
                            0 4px 12px rgba(245, 158, 11, 0.3);
            }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <!-- Compass Widget -->
    <div class="compass-container">
        <div class="compass" id="compass">
            <div class="compass-arrow"></div>
            <div class="compass-circle"></div>
            <div class="compass-north">N</div>
        </div>
    </div>
    
    <!-- Device Orientation Permission Button -->
    <button id="orientationPermissionBtn" class="orientation-permission-btn">
        Enable Compass
    </button>
    
    <!-- Route Information -->
    <div id="routeInfo" class="route-info" style="display: none;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #0e7490; font-size: 16px;">Navigation Active</div>
        <div id="routeStats" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <div>Distance: <span id="distanceRemaining" style="font-weight: 600;">--</span> km</div>
            <div>ETA: <span id="etaTime" style="font-weight: 600;">--</span> min</div>
        </div>
        <div id="progressBar" style="margin-top: 8px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
            <div id="progressFill" style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); width: 0%; transition: width 0.5s;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px; color: #6b7280;">
            <span>Start</span>
            <span id="progressPercent">0%</span>
            <span>Destination</span>
        </div>
    </div>
    
    <!-- Arrival Notification -->
    <div id="arrivalNotification" class="arrival-notification">
        <h3>🎉 ARRIVED AT DESTINATION!</h3>
        <p>You have successfully reached the household location.</p>
        <button onclick="closeArrivalNotification()">OK, CONTINUE</button>
    </div>
    
    <div class="loading-overlay" id="loadingOverlay">
        <div style="width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #0e7490; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div class="loading-text">Loading Interactive Map...</div>
    </div>

    <!-- Device Orientation Indicators -->
    <div id="deviceOrientationIndicator" class="device-orientation-indicator" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        Orientation: <span id="deviceOrientationValue">--</span>°
    </div>
    
    <div id="headingIndicator" class="heading-indicator" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
        Heading: <span id="headingValue">--</span>°
    </div>
    
    <div id="speedIndicator" class="speed-indicator" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
        Speed: <span id="speedValue">0.0</span> km/h
    </div>
    
    <div id="accuracyIndicator" class="accuracy-indicator" style="display: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#8b5cf6">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
        Accuracy: <span id="accuracyValue">--</span>m
    </div>

    <script>
        let map = null;
        let userMarker = null;
        let routeControl = null;
        let markers = [];
        let isMapReady = false;
        let isNavigating = false;
        let currentRoute = null;
        let currentHeading = 0;
        let isMoving = false;
        let exactEndpointMarker = null;
        let directLineToExactEndpoint = null;
        let householdStatusMap = {};
        let routeLine = null;
        
        // Device Orientation Variables
        let deviceOrientationSupported = false;
        let deviceOrientationPermissionGranted = false;
        let deviceAlpha = 0; // Compass direction (0-360)
        let deviceBeta = 0;  // Front-back tilt
        let deviceGamma = 0; // Left-right tilt
        let lastDeviceOrientationUpdate = 0;
        let orientationUpdateInterval = 100; // ms
        
        // Arrival detection variables
        let hasArrived = false;
        let arrivalThreshold = 0.00001; // Approximately 1.1 meters in latitude/longitude
        let arrivalCheckCount = 0;
        const requiredArrivalChecks = 3; // User must be at destination for 3 consecutive updates
        
        // Speech Synthesis for Voice Announcement
        let speechSynthesis = window.speechSynthesis;
        let isVoiceAnnounced = false;
        
        // Icons definition with professional design
        const icons = {
            user: L.divIcon({
                className: 'user-marker-container',
                html: \`
                    <div style="transform: rotate(0deg);">
                        <div class="user-marker-direction"></div>
                        <div class="user-marker-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                    </div>
                \`,
                iconSize: [30, 40],
                iconAnchor: [15, 40]
            }),
            movingUser: L.divIcon({
                className: 'user-marker-container',
                html: \`
                    <div style="transform: rotate(0deg);">
                        <div class="user-marker-direction"></div>
                        <div class="user-marker-circle user-marker-moving">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                    </div>
                \`,
                iconSize: [30, 40],
                iconAnchor: [15, 40]
            }),
            arrivedUser: L.divIcon({
                className: 'user-marker-container user-marker-arrived',
                html: \`
                    <div style="transform: rotate(0deg);">
                        <div class="user-marker-direction" style="border-bottom-color: #10b981;"></div>
                        <div class="user-marker-circle user-marker-arrived">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                    </div>
                \`,
                iconSize: [30, 40],
                iconAnchor: [15, 40]
            }),
            // PROFESSIONAL HOUSEHOLD ICON - EXACT PIN POINT (DEFAULT RED)
            household: L.divIcon({
                className: 'professional-household-icon',
                html: \`
                    <div style="position: relative;">
                        <!-- Main house icon -->
                        <div style="background: #dc2626; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                            <!-- House SVG Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                        </div>
                        <!-- Pin point indicator -->
                        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; background: #dc2626; border-radius: 50%; border: 2px solid white;"></div>
                        <!-- Shadow for pin -->
                        <div style="position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 2px; height: 6px; background: rgba(0,0,0,0.2);"></div>
                    </div>
                \`,
                iconSize: [32, 44],
                iconAnchor: [16, 38]
            }),
            // RESCUED HOUSEHOLD ICON - GREEN COLOR
            rescuedHousehold: L.divIcon({
                className: 'rescued-household-icon',
                html: \`
                    <div style="position: relative;">
                        <!-- Main house icon -->
                        <div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                            <!-- House SVG Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                        </div>
                        <!-- Pin point indicator -->
                        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; background: #10b981; border-radius: 50%; border: 2px solid white;"></div>
                        <!-- Shadow for pin -->
                        <div style="position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 2px; height: 6px; background: rgba(0,0,0,0.2);"></div>
                        <!-- Checkmark for rescued status -->
                        <div style="position: absolute; top: -5px; right: -5px; background: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                    </div>
                \`,
                iconSize: [32, 44],
                iconAnchor: [16, 38]
            }),
            // INVALID COORDINATES ICON - YELLOW/ORANGE COLOR
            invalidHousehold: L.divIcon({
                className: 'invalid-household-icon',
                html: \`
                    <div class="invalid-coordinates-marker">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                    </div>
                \`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            }),
            // Professional evacuation icon
            evacuation: L.divIcon({
                className: 'professional-evacuation-icon',
                html: \`
                    <div style="background: #059669; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                    </div>
                \`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }),
            // Professional municipality icon
            municipality: L.divIcon({
                className: 'professional-municipality-icon',
                html: \`
                    <div style="background: #d97706; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-4h4v4zm6 0h-4v-4h4v4zm0-6h-4V7h4v4z"/>
                        </svg>
                    </div>
                \`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            }),
            // Exact endpoint marker for route (DEFAULT RED)
            exactEndpoint: L.divIcon({
                className: 'exact-endpoint-marker',
                html: \`
                    <div class="exact-endpoint-marker"></div>
                \`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            }),
            // Exact endpoint marker for rescued households (GREEN)
            exactEndpointGreen: L.divIcon({
                className: 'exact-endpoint-marker-green',
                html: \`
                    <div class="exact-endpoint-marker-green"></div>
                \`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            }),
            // Exact endpoint marker for arrived destination
            exactEndpointArrived: L.divIcon({
                className: 'exact-endpoint-marker-arrived',
                html: \`
                    <div class="exact-endpoint-marker-arrived"></div>
                \`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        };
        
        // Voice Announcement Function
        function speak(text, rate = 1.0, pitch = 1.0, volume = 1.0) {
            if (!speechSynthesis) {
                console.log('Speech synthesis not supported');
                return;
            }
            
            try {
                // Cancel any ongoing speech
                speechSynthesis.cancel();
                
                // Create utterance
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = rate;
                utterance.pitch = pitch;
                utterance.volume = volume;
                utterance.lang = 'en-US';
                
                // Speak
                speechSynthesis.speak(utterance);
                
                console.log('Voice announcement:', text);
            } catch (error) {
                console.error('Error with speech synthesis:', error);
            }
        }
        
        // Show Arrival Notification
        function showArrivalNotification() {
            const notification = document.getElementById('arrivalNotification');
            if (notification) {
                notification.style.display = 'block';
                
                // Voice announcement
                speak("You have arrived at the destination! Mission accomplished.", 1.0, 1.0, 1.0);
                
                // Auto-hide after 10 seconds
                setTimeout(() => {
                    if (notification.style.display === 'block') {
                        notification.style.display = 'none';
                    }
                }, 10000);
            }
        }
        
        // Close Arrival Notification
        window.closeArrivalNotification = function() {
            const notification = document.getElementById('arrivalNotification');
            if (notification) {
                notification.style.display = 'none';
            }
        };
        
        function initMap() {
            try {
                console.log('Initializing map...');
                const defaultCenter = [14.6760, 121.0437];
                
                map = L.map('map', {
                    center: defaultCenter,
                    zoom: 15,
                    zoomControl: false,
                    attributionControl: false,
                    doubleClickZoom: true,
                    scrollWheelZoom: true,
                    touchZoom: true,
                    dragging: true,
                    boxZoom: true,
                    keyboard: true,
                    inertia: true,
                    tap: true
                });
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                    minZoom: 3
                }).addTo(map);
                
                // Add custom zoom control
                L.control.zoom({
                    position: 'topright'
                }).addTo(map);
                
                // Handle map resize for responsive design
                setTimeout(() => map.invalidateSize(), 100);
                
                // Hide loading overlay
                setTimeout(() => {
                    document.getElementById('loadingOverlay').style.display = 'none';
                    isMapReady = true;
                    
                    // Check device orientation support
                    checkDeviceOrientationSupport();
                    
                    // Notify React Native that map is ready
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'mapReady',
                            status: 'success'
                        }));
                    }
                    
                    console.log('Map initialized successfully');
                }, 500);
                
            } catch (error) {
                console.error('Error initializing map:', error);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'error',
                        message: error.toString()
                    }));
                }
            }
        }
        
        // DEVICE ORIENTATION FUNCTIONS
        function checkDeviceOrientationSupport() {
            if (typeof DeviceOrientationEvent !== 'undefined') {
                deviceOrientationSupported = true;
                console.log('Device Orientation API is supported');
                
                // Check if permission is needed (iOS 13+)
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    console.log('iOS Device: Permission required for device orientation');
                    showOrientationPermissionButton();
                } else {
                    // Android and other browsers - start listening immediately
                    startDeviceOrientationListener();
                }
            } else {
                console.log('Device Orientation API is NOT supported');
                deviceOrientationSupported = false;
            }
        }
        
        function showOrientationPermissionButton() {
            const btn = document.getElementById('orientationPermissionBtn');
            if (btn) {
                btn.style.display = 'block';
                btn.onclick = requestDeviceOrientationPermission;
            }
        }
        
        function requestDeviceOrientationPermission() {
            if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
                console.log('No permission needed, starting listener');
                startDeviceOrientationListener();
                return;
            }
            
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        deviceOrientationPermissionGranted = true;
                        console.log('Device orientation permission granted');
                        startDeviceOrientationListener();
                        document.getElementById('orientationPermissionBtn').style.display = 'none';
                    } else {
                        console.log('Device orientation permission denied');
                        alert('Compass functionality requires device orientation permission. Please enable it in your browser settings.');
                    }
                })
                .catch(console.error);
        }
        
        function startDeviceOrientationListener() {
            if (!deviceOrientationSupported) return;
            
            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
            console.log('Device orientation listener started');
            
            // Show device orientation indicator
            const indicator = document.getElementById('deviceOrientationIndicator');
            if (indicator) indicator.style.display = 'flex';
        }
        
        function handleDeviceOrientation(event) {
            const now = Date.now();
            if (now - lastDeviceOrientationUpdate < orientationUpdateInterval) {
                return; // Throttle updates
            }
            lastDeviceOrientationUpdate = now;
            
            // Get device orientation values
            deviceAlpha = event.alpha; // Compass direction (0-360)
            deviceBeta = event.beta;   // Front-back tilt (-180 to 180)
            deviceGamma = event.gamma; // Left-right tilt (-90 to 90)
            
            // Update compass with device orientation
            updateCompassWithDeviceOrientation();
            
            // Update user marker with device orientation if not moving fast
            if (userMarker) {
                updateUserMarkerWithDeviceOrientation();
            }
            
            // Update device orientation indicator
            updateDeviceOrientationIndicator();
        }
        
        function updateCompassWithDeviceOrientation() {
            try {
                const compass = document.getElementById('compass');
                if (compass) {
                    // Smooth rotation based on device orientation (alpha)
                    let rotation = 360 - deviceAlpha;
                    
                    // Ensure rotation is within 0-360 range
                    if (rotation < 0) rotation += 360;
                    if (rotation >= 360) rotation -= 360;
                    
                    compass.style.transform = \`rotate(\${rotation}deg)\`;
                }
            } catch (error) {
                console.error('Error updating compass with device orientation:', error);
            }
        }
        
        function updateUserMarkerWithDeviceOrientation() {
            try {
                if (!userMarker || !userMarker.getElement()) return;
                
                // Only update user marker rotation if moving slowly or stationary
                // (When moving fast, use GPS heading instead)
                const markerDiv = userMarker.getElement().querySelector('div');
                if (markerDiv) {
                    // Smooth rotation for user marker
                    markerDiv.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    markerDiv.style.transform = \`rotate(\${deviceAlpha}deg)\`;
                }
                
                // Update current heading for other calculations
                currentHeading = deviceAlpha;
                
            } catch (error) {
                console.error('Error updating user marker with device orientation:', error);
            }
        }
        
        function updateDeviceOrientationIndicator() {
            try {
                const orientationValue = document.getElementById('deviceOrientationValue');
                if (orientationValue) {
                    orientationValue.textContent = Math.round(deviceAlpha);
                }
                
                // Show heading indicator
                const headingIndicator = document.getElementById('headingIndicator');
                if (headingIndicator) {
                    headingIndicator.style.display = 'flex';
                }
            } catch (error) {
                console.error('Error updating device orientation indicator:', error);
            }
        }
        
        function updateCompass(heading) {
            try {
                const compass = document.getElementById('compass');
                if (compass) {
                    // Only update if device orientation is not available or not accurate
                    if (!deviceOrientationSupported || !deviceOrientationPermissionGranted) {
                        compass.style.transform = \`rotate(\${360 - heading}deg)\`;
                    }
                }
                
                // Update heading indicator
                const headingValue = document.getElementById('headingValue');
                if (headingValue) {
                    headingValue.textContent = Math.round(heading);
                }
                
                // Show heading indicator
                const headingIndicator = document.getElementById('headingIndicator');
                if (headingIndicator) {
                    headingIndicator.style.display = 'flex';
                }
            } catch (error) {
                console.error('Error updating compass:', error);
            }
        }
        
        function updateUserMarkerRotation(marker, heading) {
            try {
                if (!marker || !marker.getElement()) return;
                
                const markerDiv = marker.getElement().querySelector('div');
                if (markerDiv) {
                    // When GPS heading is available and device is moving fast,
                    // use GPS heading instead of device orientation
                    markerDiv.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    markerDiv.style.transform = \`rotate(\${heading}deg)\`;
                }
                
                // Update current heading
                currentHeading = heading;
                
            } catch (error) {
                console.error('Error updating marker rotation:', error);
            }
        }
        
        function processData(data) {
            if (!map || !isMapReady) {
                console.log('Map not ready yet, queuing data...');
                setTimeout(() => processData(data), 500);
                return;
            }
            
            try {
                console.log('Processing map data...');
                
                // Clear existing markers (but keep route line if arrived)
                if (!hasArrived) {
                    markers.forEach(marker => {
                        if (marker && marker.remove && marker !== routeLine && marker !== directLineToExactEndpoint) {
                            map.removeLayer(marker);
                        }
                    });
                    markers = markers.filter(m => m === routeLine || m === directLineToExactEndpoint);
                }
                
                // Clear existing route control (but keep the line if arrived)
                if (routeControl && !hasArrived) {
                    map.removeControl(routeControl);
                    routeControl = null;
                }
                
                // Clear exact endpoint marker if not arrived
                if (exactEndpointMarker && !hasArrived) {
                    map.removeLayer(exactEndpointMarker);
                    exactEndpointMarker = null;
                }
                
                // Clear direct line if not arrived
                if (directLineToExactEndpoint && !hasArrived) {
                    map.removeLayer(directLineToExactEndpoint);
                    directLineToExactEndpoint = null;
                }
                
                // Reset household status map
                householdStatusMap = {};
                
                // Show route info if navigating
                const routeInfo = document.getElementById('routeInfo');
                if (isNavigating) {
                    routeInfo.style.display = 'block';
                } else {
                    routeInfo.style.display = 'none';
                }
                
                // Add municipalities
                if (data.municipalities && Array.isArray(data.municipalities)) {
                    data.municipalities.forEach(municipality => {
                        if (municipality.coordinates) {
                            const marker = L.marker(
                                [municipality.coordinates.latitude, municipality.coordinates.longitude],
                                { icon: icons.municipality }
                            ).addTo(map);
                            
                            marker.bindPopup(\`
                                <div style="min-width: 200px; padding: 10px;">
                                    <strong>\${municipality.municipality}</strong><br>
                                    \${municipality.barangayName}<br>
                                    \${municipality.fullAddress}
                                </div>
                            \`);
                            
                            markers.push(marker);
                        }
                    });
                }
                
                // Add evacuation centers
                if (data.evacuations && Array.isArray(data.evacuations)) {
                    data.evacuations.forEach(evac => {
                        if (evac.location) {
                            const marker = L.marker(
                                [evac.location.latitude, evac.location.longitude],
                                { icon: icons.evacuation }
                            ).addTo(map);
                            
                            let statusColor = '#10b981';
                            let statusText = 'Available';
                            if (evac.status === 'high') {
                                statusColor = '#f59e0b';
                                statusText = 'Limited';
                            } else if (evac.status === 'full') {
                                statusColor = '#ef4444';
                                statusText = 'Full';
                            }
                            
                            marker.bindPopup(\`
                                <div style="min-width: 250px; padding: 10px;">
                                    <strong>\${evac.evacuationName}</strong><br>
                                    Status: <span style="color:\${statusColor};font-weight:bold">\${statusText}</span><br>
                                    Capacity: \${evac.currentEvacuation}/\${evac.evacuationCapacity}<br>
                                    Contact: \${evac.contactPerson.name}<br>
                                    Phone: \${evac.contactPerson.contactNumber}
                                </div>
                            \`);
                            
                            markers.push(marker);
                        }
                    });
                }
                
                // Add households with professional popup
                if (data.household && Array.isArray(data.household)) {
                    data.household.forEach(household => {
                        // Check if household has valid coordinates
                        const hasLocation = household.location && 
                                          household.location.latitude !== undefined && 
                                          household.location.longitude !== undefined &&
                                          household.location.latitude !== null && 
                                          household.location.longitude !== null &&
                                          !isNaN(household.location.latitude) && 
                                          !isNaN(household.location.longitude);
                        
                        const hasDirectCoordinates = household.latitude !== undefined && 
                                                   household.longitude !== undefined &&
                                                   household.latitude !== null && 
                                                   household.longitude !== null &&
                                                   !isNaN(household.latitude) && 
                                                   !isNaN(household.longitude);
                        
                        let lat, lng;
                        let hasValidCoordinates = false;
                        
                        if (hasLocation) {
                            lat = household.location.latitude;
                            lng = household.location.longitude;
                            hasValidCoordinates = true;
                        } else if (hasDirectCoordinates) {
                            lat = household.latitude;
                            lng = household.longitude;
                            hasValidCoordinates = true;
                        }
                        
                        // Store household status for later use
                        if (household._id) {
                            householdStatusMap[household._id] = household.status;
                        }
                        
                        // Check if household is rescued and use appropriate icon
                        const isRescued = household.status === 'Rescued' || household.status === 'rescued' || household.rescued === true;
                        
                        let marker;
                        
                        if (hasValidCoordinates) {
                            // Use appropriate icon based on rescue status
                            const householdIcon = isRescued ? icons.rescuedHousehold : icons.household;
                            
                            marker = L.marker(
                                [lat, lng],
                                { icon: householdIcon }
                            ).addTo(map);
                        } else {
                            // Use invalid coordinates icon
                            marker = L.marker(
                                [14.6760, 121.0437], // Default center if no coordinates
                                { icon: icons.invalidHousehold }
                            ).addTo(map);
                        }
                        
                        const status = household.isActive ? 'Active' : 'Inactive';
                        const statusColor = household.isActive ? '#10b981' : '#ef4444';
                        
                        // Add rescued status to popup if applicable
                        const rescuedStatus = isRescued ? 
                            \`<div style="background: #d1fae5; padding: 8px; border-radius: 6px; margin: 8px 0; text-align: center;">
                                <span style="color: #065f46; font-weight: bold;">✅ RESCUED</span>
                            </div>\` : '';
                        
                        // Add warning for invalid coordinates
                        const invalidCoordinatesWarning = !hasValidCoordinates ? 
                            \`<div style="background: #fef3c7; padding: 8px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #f59e0b;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                                    </svg>
                                    <span style="color: #92400e; font-weight: bold;">⚠️ INVALID COORDINATES</span>
                                </div>
                                <div style="margin-top: 4px; font-size: 12px; color: #92400e;">
                                    This household has no valid GPS coordinates. Cannot navigate to exact location.
                                </div>
                            </div>\` : '';
                        
                        // EXACT COORDINATES SECTION
                        const coordinatesSection = hasValidCoordinates ? 
                            \`<!-- EXACT COORDINATES SECTION -->
                            <div style="background: #eff6ff; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" style="margin-right: 8px;">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span style="color: #3b82f6; font-weight: 600; font-size: 14px;">Exact Coordinates</span>
                                </div>
                                <div style="font-family: monospace; font-size: 12px; color: #1e40af;">
                                    Lat: \${lat.toFixed(6)}<br>
                                    Lng: \${lng.toFixed(6)}<br>
                                    Accuracy: \${household.location?.accuracy || 'Unknown'}m
                                </div>
                            </div>\` : '';
                        
                        // NAVIGATE BUTTON (only show if not rescued and has valid coordinates)
                        const navigateButton = (!isRescued && hasValidCoordinates) ? 
                            \`<button onclick="startNavigationFromMap('\${household._id}')" 
                                    style="width:100%;margin-top:12px;padding:12px;background:linear-gradient(135deg, #0e7490 0%, #155e75 100%);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;box-shadow:0 2px 8px rgba(14, 116, 144, 0.3);">
                                Navigate to Exact Location
                            </button>\` : '';
                        
                        // DISABLED NAVIGATE BUTTON (if invalid coordinates)
                        const disabledNavigateButton = (!isRescued && !hasValidCoordinates) ? 
                            \`<button style="width:100%;margin-top:12px;padding:12px;background:#9ca3af;color:white;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:not-allowed;opacity:0.6;">
                                ⚠️ Cannot Navigate (No Coordinates)
                            </button>\` : '';
                        
                        marker.bindPopup(\`
                            <div style="min-width: 280px; padding: 15px;">
                                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                    <div style="background: \${!hasValidCoordinates ? '#f59e0b' : (isRescued ? '#10b981' : '#dc2626')}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                        \${!hasValidCoordinates ? 
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>' :
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
                                        }
                                    </div>
                                    <div>
                                        <strong style="font-size: 16px; color: #111827;">\${household.householdCode}</strong><br>
                                        <span style="color: #6b7280; font-size: 14px;">\${household.householdName || 'Household'}</span>
                                    </div>
                                </div>
                                
                                \${rescuedStatus}
                                \${invalidCoordinatesWarning}
                                
                                <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                        <span style="color: #6b7280; font-size: 13px;">Head of Family:</span>
                                        <span style="font-weight: 600; color: #111827;">\${household.householdName || household.members?.[0]?.userId?.fullName || 'N/A'}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                        <span style="color: #6b7280; font-size: 13px;">Members:</span>
                                        <span style="font-weight: 600; color: #111827;">\${household.members || household.totalMembers || 'N/A'}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #6b7280; font-size: 13px;">Status:</span>
                                        <span style="color: \${statusColor}; font-weight: bold;">\${status}</span>
                                    </div>
                                </div>
                                
                                \${coordinatesSection}
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: #6b7280; font-size: 13px;">Phone:</span>
                                    <span style="font-weight: 600; color: #111827;">\${household.contact || household.members?.[0]?.userId?.contactNumber || 'N/A'}</span>
                                </div>
                                
                                \${navigateButton}
                                \${disabledNavigateButton}
                                
                                <div style="text-align: center; margin-top: 8px;">
                                    <span style="color: #9ca3af; font-size: 11px;">
                                        \${isRescued ? '✅ Already rescued' : 
                                          !hasValidCoordinates ? '⚠️ Coordinates required for navigation' : 
                                          'Pin point accuracy: ' + (household.location?.accuracy || 'High')}
                                    </span>
                                </div>
                            </div>
                        \`);
                        
                        markers.push(marker);
                    });
                }
                
                // Update user location
                if (data.currentLocation) {
                    updateUserLocation(data.currentLocation);
                }
                
                // Setup route if navigation data exists and not already arrived
                if (data.navigationRoute && data.navigationMode && !hasArrived) {
                    // Check if destination household is rescued
                    let isDestinationRescued = false;
                    let hasValidDestination = true;
                    
                    if (data.navigationRoute.toHouseholdId) {
                        const destinationStatus = householdStatusMap[data.navigationRoute.toHouseholdId];
                        isDestinationRescued = destinationStatus === 'Rescued' || destinationStatus === 'rescued';
                        
                        // Check if destination coordinates are valid
                        const destinationHousehold = data.household?.find(h => h._id === data.navigationRoute.toHouseholdId);
                        if (destinationHousehold) {
                            const hasLocation = destinationHousehold.location && 
                                               destinationHousehold.location.latitude !== undefined && 
                                               destinationHousehold.location.longitude !== undefined;
                            const hasDirectCoordinates = destinationHousehold.latitude !== undefined && 
                                                        destinationHousehold.longitude !== undefined;
                            
                            hasValidDestination = hasLocation || hasDirectCoordinates;
                        }
                    }
                    
                    // Only setup route if destination has valid coordinates
                    if (hasValidDestination) {
                        setupRoute(data.navigationRoute, isDestinationRescued);
                    } else {
                        console.log('Cannot setup route: Destination has invalid coordinates');
                        // Notify React Native
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'routeError',
                                message: 'Destination has invalid GPS coordinates'
                            }));
                        }
                    }
                }
                
                // Fit bounds to show all markers
                if (markers.length > 0 || userMarker) {
                    const allMarkers = markers.slice();
                    if (userMarker) allMarkers.push(userMarker);
                    
                    const group = L.featureGroup(allMarkers);
                    map.fitBounds(group.getBounds(), { 
                        padding: [50, 50],
                        maxZoom: 15 
                    });
                }
                
                console.log('Map data processed successfully');
                
            } catch (error) {
                console.error('Error processing map data:', error);
            }
        }
        
        function updateUserLocation(location) {
            try {
                const lat = location.latitude || 14.6760;
                const lng = location.longitude || 121.0437;
                const speed = location.speed || 0;
                let heading = location.heading || currentHeading;
                const accuracy = location.accuracy || 0;
                
                // Ensure heading is between 0-360 degrees
                if (heading < 0) heading += 360;
                if (heading >= 360) heading -= 360;
                
                // Use arrived icon if arrived, otherwise moving or stationary icon
                let userIcon;
                if (hasArrived) {
                    userIcon = icons.arrivedUser;
                } else {
                    userIcon = speed > 0.3 ? icons.movingUser : icons.user;
                }
                
                const isCurrentlyMoving = speed > 0.3;
                
                if (userMarker) {
                    // Update position
                    userMarker.setLatLng([lat, lng]);
                    
                    // Update icon if status changed
                    if (hasArrived) {
                        userMarker.setIcon(icons.arrivedUser);
                    } else if (isCurrentlyMoving !== isMoving) {
                        userMarker.setIcon(userIcon);
                        isMoving = isCurrentlyMoving;
                    }
                    
                    // If moving fast and not arrived, use GPS heading instead of device orientation
                    if (isCurrentlyMoving && speed > 1 && !hasArrived) {
                        updateUserMarkerRotation(userMarker, heading);
                        currentHeading = heading;
                        updateCompass(heading);
                    }
                    // If stationary or moving slowly, device orientation will handle rotation
                } else {
                    // Create new marker
                    userMarker = L.marker([lat, lng], { 
                        icon: userIcon,
                        zIndexOffset: 1000
                    }).addTo(map);
                    
                    // Set initial rotation based on heading
                    updateUserMarkerRotation(userMarker, heading);
                    currentHeading = heading;
                    updateCompass(heading);
                    
                    userMarker.bindPopup(\`
                        <div style="padding: 12px; min-width: 200px;">
                            <strong>Your Location</strong><br>
                            Lat: \${lat.toFixed(6)}<br>
                            Lng: \${lng.toFixed(6)}<br>
                            Speed: \${(speed * 3.6).toFixed(1)} km/h<br>
                            Heading: \${Math.round(heading)}°<br>
                            Accuracy: \${accuracy ? accuracy.toFixed(1) + 'm' : 'N/A'}
                        </div>
                    \`);
                    
                    isMoving = isCurrentlyMoving;
                }
                
                // Update indicators
                updateIndicators(speed, heading, accuracy);
                
                // If navigating, update route progress
                if (isNavigating && currentRoute) {
                    updateRouteProgress(location);
                }
                
                // Center map on user if they're moving fast enough and not arrived
                if (speed > 1 && isNavigating && !hasArrived) {
                    map.setView([lat, lng], map.getZoom());
                }
                
            } catch (error) {
                console.error('Error updating user location:', error);
            }
        }
        
        function updateIndicators(speed, heading, accuracy) {
            try {
                // Speed indicator
                const speedEl = document.getElementById('speedIndicator');
                const speedValue = document.getElementById('speedValue');
                if (speedEl && speedValue) {
                    const kmh = (speed * 3.6).toFixed(1);
                    speedValue.textContent = kmh;
                    speedEl.style.display = kmh > 0 ? 'flex' : 'none';
                }
                
                // Heading indicator
                const headingEl = document.getElementById('headingIndicator');
                const headingValue = document.getElementById('headingValue');
                if (headingEl && headingValue) {
                    headingValue.textContent = Math.round(heading);
                    headingEl.style.display = 'flex';
                }
                
                // Accuracy indicator
                const accuracyEl = document.getElementById('accuracyIndicator');
                const accuracyValue = document.getElementById('accuracyValue');
                if (accuracyEl && accuracyValue) {
                    accuracyValue.textContent = accuracy ? accuracy.toFixed(1) : '--';
                    accuracyEl.style.display = accuracy > 0 ? 'flex' : 'none';
                }
            } catch (error) {
                console.error('Error updating indicators:', error);
            }
        }
        
        function setupRoute(route, isRescued = false) {
            try {
                if (!route || !route.from || !route.to) return;
                
                // Clear existing route control
                if (routeControl) {
                    map.removeControl(routeControl);
                    routeControl = null;
                }
                
                // Clear existing route line
                if (routeLine) {
                    map.removeLayer(routeLine);
                    routeLine = null;
                }
                
                const fromLatLng = L.latLng(route.from.latitude, route.from.longitude);
                const toLatLng = L.latLng(route.to.latitude, route.to.longitude);
                
                console.log('Setting up route from:', fromLatLng, 'to:', toLatLng);
                
                // Reset arrival tracking
                hasArrived = false;
                arrivalCheckCount = 0;
                isVoiceAnnounced = false;
                
                // Show route info
                document.getElementById('routeInfo').style.display = 'block';
                
                // If destination is rescued, don't show navigation controls
                if (isRescued) {
                    console.log('Destination is rescued - navigation controls hidden');
                    // Still add exact endpoint marker but green
                    addExactEndpointMarker(toLatLng, true);
                    return;
                }
                
                // FIXED ROUTING: Use walking profile and force route to exact endpoint
                routeControl = L.Routing.control({
                    waypoints: [fromLatLng, toLatLng],
                    routeWhileDragging: false,
                    showAlternatives: false,
                    fitSelectedRoutes: false,
                    show: false,
                    createMarker: function() { return null; },
                    lineOptions: {
                        styles: [
                            {
                                color: '#0e7490',
                                weight: 8,
                                opacity: 0.9,
                                lineCap: 'round'
                            },
                            {
                                color: 'white',
                                weight: 4,
                                opacity: 0.9,
                                dashArray: '15, 15',
                                lineCap: 'round'
                            }
                        ]
                    },
                    router: L.Routing.osrmv1({
                        serviceUrl: 'https://router.project-osrm.org/route/v1',
                        profile: 'foot'
                    })
                }).addTo(map);
                
                // Store route data
                currentRoute = route;
                isNavigating = true;
                
                // Listen for route found event
                routeControl.on('routesfound', function(e) {
                    console.log('Route found event triggered');
                    const routes = e.routes;
                    if (routes && routes.length > 0) {
                        const foundRoute = routes[0];
                        const distance = (foundRoute.summary.totalDistance / 1000).toFixed(2);
                        const time = Math.round(foundRoute.summary.totalTime / 60);
                        
                        document.getElementById('distanceRemaining').textContent = distance;
                        document.getElementById('etaTime').textContent = time;
                        
                        // Store the route line
                        routeLine = foundRoute.coordinateLines[0];
                        
                        // Add exact endpoint marker at the household location
                        addExactEndpointMarker(toLatLng, isRescued);
                        
                        // Check if route ends at exact endpoint and adjust if needed
                        ensureRouteEndsAtExactEndpoint(foundRoute, toLatLng, isRescued);
                        
                        // Notify React Native
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'routeCalculated',
                                distance: distance,
                                time: time
                            }));
                        }
                        
                        // Fit bounds to show entire route with padding
                        const bounds = L.latLngBounds([fromLatLng, toLatLng]);
                        map.fitBounds(bounds, { 
                            padding: [100, 100],
                            maxZoom: 18
                        });
                        
                        console.log('Route calculation complete. Distance:', distance, 'km, Time:', time, 'min');
                    } else {
                        console.log('No routes found, creating direct line');
                        createDirectLineToExactEndpoint(fromLatLng, toLatLng, isRescued);
                    }
                });
                
                // Handle route errors
                routeControl.on('routingerror', function(e) {
                    console.error('Routing error:', e.error);
                    createDirectLineToExactEndpoint(fromLatLng, toLatLng, isRescued);
                });
                
                console.log('Route setup initiated');
                
            } catch (error) {
                console.error('Error setting up route:', error);
                if (route && route.from && route.to) {
                    const fromLatLng = L.latLng(route.from.latitude, route.from.longitude);
                    const toLatLng = L.latLng(route.to.latitude, route.to.longitude);
                    createDirectLineToExactEndpoint(fromLatLng, toLatLng, isRescued);
                }
            }
        }
        
        function addExactEndpointMarker(latlng, isRescued = false) {
            try {
                // Remove existing exact endpoint marker
                if (exactEndpointMarker) {
                    map.removeLayer(exactEndpointMarker);
                }
                
                // Add a pulsating marker at the exact endpoint
                const endpointIcon = hasArrived ? icons.exactEndpointArrived : 
                                    (isRescued ? icons.exactEndpointGreen : icons.exactEndpoint);
                exactEndpointMarker = L.marker(latlng, {
                    icon: endpointIcon,
                    zIndexOffset: 2000
                }).addTo(map);
                
                // Add tooltip
                const tooltipText = hasArrived ? 'Arrived at Destination!' : 
                                  (isRescued ? 'Rescued Household Location' : 'Exact Household Location');
                exactEndpointMarker.bindTooltip(tooltipText, {
                    permanent: false,
                    direction: 'top',
                    offset: [0, -10]
                });
                
                console.log('Exact endpoint marker added at:', latlng, 'Rescued:', isRescued, 'Arrived:', hasArrived);
                
            } catch (error) {
                console.error('Error adding exact endpoint marker:', error);
            }
        }
        
        function ensureRouteEndsAtExactEndpoint(route, exactEndpoint, isRescued = false) {
            try {
                if (!route || !route.coordinates || route.coordinates.length === 0) {
                    console.log('No route coordinates to adjust');
                    return;
                }
                
                // Get the last coordinate of the route
                const lastCoordinate = route.coordinates[route.coordinates.length - 1];
                const lastLatLng = L.latLng(lastCoordinate.lat, lastCoordinate.lng);
                
                // Calculate distance between last route point and exact endpoint
                const distanceToEndpoint = lastLatLng.distanceTo(exactEndpoint);
                
                console.log('Distance from route end to exact endpoint:', distanceToEndpoint.toFixed(2), 'meters');
                
                // If the route doesn't end exactly at the endpoint (more than 5 meters away)
                if (distanceToEndpoint > 5) {
                    console.log('Route ends', distanceToEndpoint.toFixed(2), 'meters from exact endpoint. Creating direct connection.');
                    createDirectLineToExactEndpoint(lastLatLng, exactEndpoint, isRescued);
                }
                
            } catch (error) {
                console.error('Error ensuring route ends at exact endpoint:', error);
            }
        }
        
        function createDirectLineToExactEndpoint(startLatLng, endLatLng, isRescued = false) {
            try {
                // Remove existing direct line
                if (directLineToExactEndpoint) {
                    map.removeLayer(directLineToExactEndpoint);
                }
                
                // Calculate direct distance
                const directDistance = startLatLng.distanceTo(endLatLng) / 1000; // in km
                
                console.log('Creating direct line. Distance:', directDistance.toFixed(2), 'km', 'Rescued:', isRescued);
                
                // Create a direct polyline from start to exact endpoint
                const lineColor = hasArrived ? '#10b981' : (isRescued ? '#10b981' : '#dc2626');
                directLineToExactEndpoint = L.polyline([startLatLng, endLatLng], {
                    color: lineColor,
                    weight: 6,
                    opacity: 0.8,
                    dashArray: '10, 10',
                    lineCap: 'round',
                    lineJoin: 'round',
                    className: hasArrived ? 'completed-route-line' : ''
                }).addTo(map);
                
                // Add to markers array for cleanup
                markers.push(directLineToExactEndpoint);
                
                // Add exact endpoint marker
                addExactEndpointMarker(endLatLng, isRescued);
                
                // Update route info with direct distance
                if (currentRoute) {
                    const time = Math.round((directDistance / 5) * 60); // Estimate 5 km/h walking speed
                    document.getElementById('distanceRemaining').textContent = directDistance.toFixed(2);
                    document.getElementById('etaTime').textContent = time;
                }
                
                // Fit bounds to show the direct line
                const bounds = L.latLngBounds([startLatLng, endLatLng]);
                map.fitBounds(bounds, { 
                    padding: [100, 100],
                    maxZoom: 18
                });
                
            } catch (error) {
                console.error('Error creating direct line:', error);
            }
        }
        
        function updateRouteProgress(currentLocation) {
            if (!currentRoute || !userMarker || hasArrived) return;
            
            try {
                const userLatLng = userMarker.getLatLng();
                const destinationLatLng = L.latLng(
                    currentRoute.to.latitude,
                    currentRoute.to.longitude
                );
                
                // Calculate remaining distance
                const remainingDistance = userLatLng.distanceTo(destinationLatLng) / 1000; // in km
                
                // Calculate total distance (initial distance)
                const totalDistance = parseFloat(currentRoute.distance) || remainingDistance;
                const distanceCovered = totalDistance - remainingDistance;
                const progressPercentage = Math.max(0, Math.min(100, (distanceCovered / totalDistance) * 100));
                
                // Update UI
                document.getElementById('distanceRemaining').textContent = remainingDistance.toFixed(2);
                document.getElementById('progressFill').style.width = progressPercentage + '%';
                document.getElementById('progressPercent').textContent = Math.round(progressPercentage) + '%';
                
                // Calculate ETA based on current speed
                const speed = currentLocation.speed || 0; // m/s
                if (speed > 0) {
                    const timeInHours = remainingDistance / (speed * 3.6); // km/h
                    const etaMinutes = Math.ceil(timeInHours * 60);
                    document.getElementById('etaTime').textContent = etaMinutes;
                }
                
                // Notify React Native of progress update
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'routeProgress',
                        distanceRemaining: remainingDistance.toFixed(2),
                        progressPercentage: Math.round(progressPercentage),
                        estimatedTime: document.getElementById('etaTime').textContent
                    }));
                }
                
                // EXACT COORDINATES COMPARISON for arrival detection
                const latDiff = Math.abs(userLatLng.lat - destinationLatLng.lat);
                const lngDiff = Math.abs(userLatLng.lng - destinationLatLng.lng);
                
                console.log('Coordinates Comparison:');
                console.log('User: lat=' + userLatLng.lat.toFixed(6) + ', lng=' + userLatLng.lng.toFixed(6));
                console.log('Destination: lat=' + destinationLatLng.lat.toFixed(6) + ', lng=' + destinationLatLng.lng.toFixed(6));
                console.log('Difference: latDiff=' + latDiff.toFixed(6) + ', lngDiff=' + lngDiff.toFixed(6));
                console.log('Threshold: ' + arrivalThreshold);
                
                // Check if user is at the exact destination (within threshold)
                if (latDiff <= arrivalThreshold && lngDiff <= arrivalThreshold) {
                    arrivalCheckCount++;
                    console.log('User at destination! Check count: ' + arrivalCheckCount + '/' + requiredArrivalChecks);
                    
                    // User must be at destination for multiple consecutive checks to confirm arrival
                    if (arrivalCheckCount >= requiredArrivalChecks && !hasArrived) {
                        hasArrived = true;
                        console.log('ARRIVAL CONFIRMED! User is at exact destination coordinates.');
                        
                        // Update user marker to arrived style
                        if (userMarker) {
                            userMarker.setIcon(icons.arrivedUser);
                        }
                        
                        // Update endpoint marker to arrived style
                        addExactEndpointMarker(destinationLatLng, false);
                        
                        // Update route line to completed style
                        if (directLineToExactEndpoint) {
                            directLineToExactEndpoint.setStyle({
                                color: '#10b981',
                                opacity: 0.7,
                                className: 'completed-route-line'
                            });
                        }
                        
                        // Show arrival notification
                        showArrivalNotification();
                        
                        // Voice announcement (only once)
                        if (!isVoiceAnnounced) {
                            speak("You have arrived at the destination. Mission accomplished.", 1.0, 1.0, 1.0);
                            isVoiceAnnounced = true;
                        }
                        
                        // Notify React Native
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'arrivedAtDestination',
                                message: 'Arrived at exact household location',
                                userCoordinates: {
                                    latitude: userLatLng.lat,
                                    longitude: userLatLng.lng
                                },
                                destinationCoordinates: {
                                    latitude: destinationLatLng.lat,
                                    longitude: destinationLatLng.lng
                                },
                                difference: {
                                    latitude: latDiff,
                                    longitude: lngDiff
                                }
                            }));
                        }
                    }
                } else {
                    // Reset check count if user moves away from destination
                    arrivalCheckCount = 0;
                }
                
            } catch (error) {
                console.error('Error updating route progress:', error);
            }
        }
        
        function stopNavigation() {
            if (routeControl) {
                map.removeControl(routeControl);
                routeControl = null;
            }
            
            // Don't remove route line and markers when stopping navigation
            // They will remain on the map
            
            isNavigating = false;
            currentRoute = null;
            hasArrived = false;
            arrivalCheckCount = 0;
            isVoiceAnnounced = false;
            
            document.getElementById('routeInfo').style.display = 'none';
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'navigationStopped'
                }));
            }
        }
        
        // Navigation function
        window.startNavigationFromMap = function(householdId) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'startNavigation',
                    householdId: householdId
                }));
            }
        };
        
        // Handle window resize for responsive design
        window.addEventListener('resize', function() {
            if (map) {
                setTimeout(() => {
                    map.invalidateSize();
                    console.log('Map resized for responsive design');
                }, 100);
            }
        });
        
        // Initialize map when page loads
        window.addEventListener('load', function() {
            setTimeout(initMap, 100);
        });
        
        // Handle messages from React Native
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'stopNavigation') {
                    stopNavigation();
                } else if (data.type === 'updateLocation') {
                    updateUserLocation(data.location);
                } else if (data.type === 'arrivedAtDestination') {
                    // Handle arrival notification from React Native
                    console.log('Arrived at destination:', data.message);
                } else {
                    processData(data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
        
        // Also listen for the postMessage event (for Android)
        document.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'stopNavigation') {
                    stopNavigation();
                } else if (data.type === 'updateLocation') {
                    updateUserLocation(data.location);
                } else if (data.type === 'arrivedAtDestination') {
                    // Handle arrival notification from React Native
                    console.log('Arrived at destination:', data.message);
                } else {
                    processData(data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
        
    </script>
</body>
</html>
`;