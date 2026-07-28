# CivicSwarm Architecture & Multi-Agent Design Document

## 📐 System Architecture Diagram

```mermaid
flowchart TD
    Citizen([Citizen User / App]) -->|1. Submit Text / Image / Location| REST[Express REST API]
    REST -->|2. Save Ticket| DB[(MongoDB 2dsphere)]
    REST -->|3. Trigger Pipeline| Swarm[AI Multi-Agent Swarm Mesh]
    
    subgraph Swarm[Autonomous 10 AI Agents Mesh]
        Agent1[1. Complaint Understanding] --> Agent2[2. Image Analysis CV]
        Agent2 --> Agent3[3. Location Intelligence]
        Agent3 --> Agent4[4. Geospatial Duplicate Detection]
        Agent4 --> Agent5[5. Department Routing]
        Agent5 --> Agent6[6. Priority Scoring]
        Agent6 --> Agent7[7. Workflow Tracking]
        Agent7 --> Agent8[8. Escalation Agent]
        Agent8 --> Agent9[9. Citizen Notification Stream]
        Agent9 --> Agent10[10. Government Analytics]
    end

    Swarm -->|Realtime Execution Steps| Socket[Socket.io Gateway]
    Socket -->|WebSocket Stream| UI[AI Processing Panel Visualizer]
    Swarm -->|Persist Triage Data| DB
    Officer([Government Officer]) -->|Command Center GIS Map| REST
```

---

## 🔁 Sequence Flow of Complaint Triage

1. **Submission Phase**: Citizen posts multi-modal payload (Text, Image, Audio, Coordinates).
2. **Persistence Phase**: Ticket initialized with `Reported` status and unique ID (`CIV-XXXXXX`).
3. **Agent Orchestration Phase**:
   - `Agent 1` parses issue type & severity.
   - `Agent 2` runs computer vision hazard detection.
   - `Agent 3` converts coordinates to municipal ward & GeoJSON point.
   - `Agent 4` queries MongoDB `$near` index (500m radius) to merge duplicate citations.
   - `Agent 5` assigns department (PWD / BWSSB / BESCOM / BBMP).
   - `Agent 6` computes 0-100 priority score matrix.
   - `Agent 7` assigns SLA hours and initial timeline.
   - `Agent 8` checks SLA breaches & triggers alerts.
   - `Agent 9` dispatches step updates over WebSocket.
   - `Agent 10` updates government leaderboard.
4. **Dashboard View Phase**: Government officers inspect ticket on interactive Leaflet GIS map with priority pulse colors.
