# Weather Monitoring & Analytics System

<p align="center">
  <strong>A full-stack weather analytics platform for processing, serving, and visualizing historical UK weather data.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/API-REST-FF6B35" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend%20Hosting-Vercel-000000?logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend%20Hosting-Render-46E3B7?logo=render&logoColor=black" />
</p>

---

## Overview

The **Weather Monitoring & Analytics System** is a full-stack web application designed to transform historical weather data into an interactive analytics dashboard.

The system follows a **decoupled frontend/backend architecture**:

- **React + TypeScript + Vite** powers the frontend dashboard.
- **Django** provides the backend and REST API.
- **PostgreSQL** stores the processed weather data.
- **Vercel** hosts the frontend.
- **Render** hosts the Django API.
- **UptimeRobot** periodically pings the backend to reduce cold-start delays on the Render free tier.

The application is intentionally optimized for constrained cloud infrastructure. Instead of attempting to serve the complete historical dataset from the production API, the production dataset was reduced to **1,804 carefully selected/optimized records**, resulting in an approximately **200 KB API payload**.

This allows the frontend to request the required dataset in a **single bulk API request**, after which filtering, chart preparation, and visualization can happen efficiently on the client.

---

# Table of Contents

- [Project Goals](#project-goals)
- [Live Architecture](#live-architecture)
- [Application Architecture](#application-architecture)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Why a Single Flattened Table](#why-a-single-flattened-table)
- [Production Data Optimization](#production-data-optimization)
- [Frontend Dashboard](#frontend-dashboard)
- [Dashboard Components](#dashboard-components)
- [Visualization Design](#visualization-design)
- [API Architecture](#api-architecture)
- [Bulk Data Strategy](#bulk-data-strategy)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Deployment Architecture](#deployment-architecture)
- [Render Cold-Start Solution](#render-cold-start-solution)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [API Usage](#api-usage)
- [Performance Engineering](#performance-engineering)
- [Security](#security)
- [Challenges & Engineering Decisions](#challenges--engineering-decisions)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Project Highlights](#project-highlights)
- [Author](#author)

---

# Project Goals

The system was developed with the following objectives:

1. Parse and process summarized weather data.
2. Store the processed data in a structured database.
3. Expose weather information through a REST API.
4. Build a modern, decoupled frontend.
5. Provide interactive weather filtering.
6. Visualize multiple weather parameters simultaneously.
7. Optimize the application for limited cloud resources.
8. Minimize unnecessary API requests.
9. Provide a production-deployable architecture.
10. Maintain a clean separation between frontend, backend, database, and infrastructure.

---

# Live Architecture

```text
                         USER
                           │
                           ▼
              ┌────────────────────────┐
              │   React + TypeScript   │
              │      Dashboard         │
              │                        │
              │        Vercel          │
              └────────────┬───────────┘
                           │
                           │ HTTPS / REST API
                           ▼
              ┌────────────────────────┐
              │     Django Backend     │
              │       REST API         │
              │                        │
              │        Render          │
              └────────────┬───────────┘
                           │
                           │ Django ORM
                           ▼
              ┌────────────────────────┐
              │       PostgreSQL       │
              │      Weather Data      │
              └────────────────────────┘

                           ▲
                           │
                    Periodic Ping
                           │
                    ┌─────────────┐
                    │ UptimeRobot │
                    └─────────────┘
Application Architecture

The application uses a decoupled client-server architecture.
flowchart TD

    USER["User"]

    FRONTEND["React + TypeScript + Vite<br/>Analytics Dashboard"]

    API["Django REST API"]

    LOGIC["Backend Query / Processing Logic"]

    DB[("PostgreSQL<br/>Weather Data")]

    UPTIME["UptimeRobot<br/>5-Minute Health Ping"]

    USER --> FRONTEND
    FRONTEND -->|HTTPS GET| API
    API --> LOGIC
    LOGIC --> DB

    UPTIME -->|Periodic Request| API
