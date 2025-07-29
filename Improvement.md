# Comprehensive Enhancement Plan: Stock Screener App

This document outlines a strategic roadmap for enhancing the Stock Screener application. It's organized into logical phases, starting with foundational improvements and moving toward advanced features. Each item includes a goal, its importance, implementation steps, and a priority/effort assessment.

## Phase 1: Foundational Improvements (High Priority)

This phase focuses on strengthening the application's core to ensure reliability, performance, and scalability for all future features.

### 1.1. UI/UX Polish: Toast Notifications & Feedback

- **Goal**: Provide immediate and clear feedback to the user for their actions.
- **Why it Matters**: Improves user confidence and makes the app feel more professional and responsive. Replaces silent saves or alert() calls.
- **Implementation Steps**:
  - **Frontend**:
    - Choose and install a lightweight toast notification library (e.g., react-hot-toast).
    - Integrate toast notifications in `RebalancePage.jsx` to show "Saving...", "Saved successfully!", or "Error saving!" messages when the debounced save is triggered.
    - Add toasts for other asynchronous actions, like when "Fetch Prices" is clicked.
- **Priority**: High
- **Effort**: Low

## Phase 2: Core Feature Expansion (Medium Priority)

This phase focuses on delivering the most requested and impactful new features to the user.

### 2.1. User Accounts & Authentication

- **Goal**: Allow users to have their own private data, starting with the Rebalance table.
- **Why it Matters**: This is the gateway to personalization. It stops all users from sharing the same global rebalance state and is a prerequisite for saving custom portfolios, watchlists, or alerts.
- **Implementation Steps**:
  - **Backend**:
    - Add user authentication libraries (jsonwebtoken, bcryptjs).
    - Create a User model in MongoDB.
    - Create new routes (`/api/users/register`, `/api/users/login`).
    - Create JWT-based middleware to protect routes.
    - Modify the `RebalanceState` model to be user-specific (e.g., add a `userId` field).
    - Update the rebalance controllers to save/fetch data based on the authenticated user's ID from the JWT.
  - **Frontend**:
    - Create `LoginPage` and `RegisterPage` components.
    - Implement logic to store the JWT in `localStorage` upon login.
    - Create an Axios interceptor to automatically attach the JWT to all API requests.
    - Update the Redux slice for rebalancing to work with user-specific data.
- **Priority**: Medium
- **Effort**: High

### 2.2. Detailed Stock View Page

- **Goal**: Create a dedicated, comprehensive page for each individual stock.
- **Why it Matters**: Transforms the app from just a screener into a research tool, significantly increasing its value and user engagement.
- **Implementation Steps**:
  - **Backend**:
    - Create a new route: `/api/stocks/details/:ticker`.
    - The controller for this route will fetch the cached fundamental/technical data from the `StockData` model for that specific ticker.
    - (Optional) Add a service to fetch recent news for the ticker from a news API.
  - **Frontend**:
    - In `App.jsx`, add a new route: `/stocks/:ticker`.
    - In the screener tables (`MomentumPage.jsx`, `AlphaPage.jsx`), wrap the stock tickers in a `<Link>` component from `react-router-dom`.
    - Create a new `StockDetailPage.jsx` component.
    - This component will fetch data from the new backend endpoint and display:
      - A detailed price chart (can reuse the charting component).
      - All key metrics (Momentum Score, Alpha, P/E, 52-week high/low, etc.).
      - Company name and description.
- **Priority**: Medium
- **Effort**: Medium

## Phase 3: Advanced Analysis & User Experience

This phase introduces more powerful analytical tools and further refines the user experience.

### 3.1. Deeper Fundamental Analysis

- **Goal**: Enhance the "Alpha Titans" strategy with more robust fundamental data points.
- **Why it Matters**: Improves the quality and reliability of the Alpha strategy, making it more aligned with professional methodologies like CANSLIM.
- **Implementation Steps**:
  - **Backend**:
    - (Requires Budget) Sign up for a premium financial data API (e.g., EOD Historical Data, Financial Modeling Prep).
    - Update `analysisService.js` to fetch additional metrics: Debt-to-Equity, PEG Ratio, ROE, etc.
    - Add these new fields to the `StockData` Mongoose model.
    - Update the `runMonthlyPortfolioCreation` job in `schedule.js` to use these new metrics as filters for the "Alpha Titans" portfolio.
  - **Frontend**: The new, higher-quality data will automatically appear on the Alpha screener and Detailed Stock View pages.
- **Priority**: Low (High if budget allows)
- **Effort**: Medium

## Phase 4: Long-Term & Pro-Level Features

This phase includes features that would elevate the application to a professional-grade, potentially monetizable platform.

### 4.1. Alerts & Notifications via Telegram

- **Goal**: Proactively notify users about custom stock price alerts.
- **Why it Matters**: Massively increases user engagement and retention by bringing them back to the app with timely, actionable information.
- **Implementation Steps**:
  - **Backend**:
    - Create an Alert model (linked to `userId`, `ticker`, `targetPrice`, condition (e.g., "above", "below")).
    - Integrate a Telegram bot library (e.g., `node-telegram-bot-api`).
    - Create API endpoints to create, view, and delete alerts.
    - Create a new, frequently running cron job (e.g., every 5 minutes) that:
      - Fetches all active alerts.
      - Fetches the current prices for the relevant tickers.
      - Checks if any alert conditions are met.
      - If met, triggers a notification service to send a message via the Telegram bot to the user's linked chat ID.
  - **Frontend**:
    - Create a new "Alerts" page for users to manage their price alerts (set ticker, price target, etc.).
    - In the user's profile/settings page, add a field for them to input their Telegram Chat ID to link their account for notifications.
- **Priority**: Low
- **Effort**: High

### 4.2. Custom Screeners & Watchlists

- **Goal**: Allow users to create, save, and run their own screening criteria and create personal watchlists.
- **Why it Matters**: This is the ultimate personalization feature, giving users complete control and making the tool indispensable for their workflow.
- **Implementation Steps**:
  - **Backend**:
    - Create Screener and Watchlist models, linked to a `userId`.
    - Develop a flexible API endpoint that can take a dynamic set of filters (e.g., `marketCap > 50000`, `momentumScore > 80`) and query the `StockData` collection.
  - **Frontend**:
    - Build a UI for creating custom filters.
    - Create a "My Screeners" page where users can save and re-run their custom screens.
    - Implement a "Watchlist" feature.
- **Priority**: Low
- **Effort**: Very High
