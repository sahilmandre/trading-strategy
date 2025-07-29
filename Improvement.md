# Stock Screener Application Improvement & Feature Roadmap

This document outlines the planned enhancements for the Stock Screener application, designed to increase its power, reliability, and user experience.

## Phase 1: Immediate Priority - Data Source Enhancement

This is the next feature we will build to solve the incomplete benchmark data issue.

### Objective

To ensure complete and reliable historical data for all Indian stocks and indices.

### Backend Implementation

* Integrate New API: Install and integrate the stock-nse-india NPM package into our backend.
* Create a Fallback System: Refactor the data-fetching services (analysisService, benchmarkController).
	+ The system will first attempt to fetch data from the stock-nse-india API, as it is a more direct and reliable source for the Indian market.
	+ If the NSE API fails or returns incomplete data, the system will automatically fall back to using yahoo-finance2 as a secondary source.
* Update Ticker Mapping: Create a mapping between NSE symbols (e.g., RELIANCE) and Yahoo Finance symbols (e.g., RELIANCE.NS) to ensure the fallback system works seamlessly.

### Frontend Implementation

* No changes required. The frontend will continue to call the same API endpoints. The improvements in data quality will be automatically reflected in the charts and tables.

## Phase 2: Future Backend Enhancements

These are potential features we can add to make the backend even more powerful.

### 1. Deeper Fundamental Analysis

* Goal: Enhance the "Alpha Titans" strategy with more robust fundamental data.
* Implementation: Integrate a premium financial data API (like EOD Historical Data or Financial Modeling Prep) to access key metrics that free APIs don't provide, such as:
	+ Debt-to-Equity Ratio
	+ Price-to-Earnings Growth (PEG) Ratio
	+ Return on Equity (ROE)
	+ Quarterly Sales & EPS Growth (%)

### 2. User Accounts & Authentication

* Goal: Allow users to save their own custom portfolios and rebalance tables.
* Implementation: Add a user authentication system (e.g., using JWT). All user-specific data (like the rebalance table state) would be saved to their own document in the database, not a global one.

### 3. Alerts & Notifications

* Goal: Proactively notify users of important events.
* Implementation: Create a system where users can set price alerts for specific stocks. The backend would have a job that periodically checks prices and sends an email or in-app notification if an alert is triggered.

## Phase 3: Future Frontend Enhancements

These features would significantly improve the user experience and analytical capabilities of the UI.

### 1. Advanced Interactive Charting

* Goal: Give users more powerful tools to analyze performance.
* Implementation: Enhance the Recharts implementation to allow users to add technical indicators like Moving Averages, RSI, and Bollinger Bands directly onto the performance charts.

### 2. Detailed Stock View Page

* Goal: Create a dedicated, comprehensive page for each stock.
* Implementation: Make each stock ticker in the tables a clickable link. This link would lead to a new page (/stocks/:ticker) that shows:
	+ A detailed price chart for that specific stock.
	+ All the calculated momentum and alpha data points.
	+ Key fundamental information.
	+ Recent news related to the company.

### 3. UI/UX Polish

* Goal: Improve the overall feel and professionalism of the application.
* Implementation:
	+ Add "toast" notifications for actions like "Rebalance table saved."
	+ Implement pagination for the Momentum and Alpha screener tables to improve performance.
	+ Add a dark mode/light mode toggle for user preference.
