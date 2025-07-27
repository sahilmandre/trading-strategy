# Stock Screener Application: Project Requirements

## 1. Project Overview

The goal is to develop a web-based Stock Screener application that helps users identify promising stocks from the Indian market based on Momentum and Alpha strategies. The application will feature automatically generated monthly model portfolios, a portfolio rebalancing tool, and will consist of a Node.js/Express.js backend and a ReactJS frontend.

## 2. Core Features & Functionality

Data Sourcing: The application will fetch real-time and historical stock data for a predefined list of Nifty 500 stocks.

Stock List: The list of 500 stock tickers will be maintained in a separate, importable file (e.g., a JSON array). Tickers must be formatted correctly for the data provider (e.g., RELIANCE.NS for Yahoo Finance).

Primary Data Source: yahoo-finance2 NPM package.

### Backend Strategies & Portfolios:

    Momentum Strategy: The backend will calculate and rank the Nifty 500 stocks based on their price momentum and assign a single Momentum Score.

    Alpha Strategy: The backend will calculate which stocks are generating "alpha" against the Nifty 500 index.

    Automated Model Portfolios: The system will automatically generate and store distinct portfolios based on the top-performing Momentum and Alpha stocks each month.

### Frontend Interface: A user-friendly interface with four main views/features:

    Momentum Page: To screen and rank all stocks by their Momentum Score.

    Alpha Page: To screen stocks generating significant alpha.

    Model Portfolios Page: To display the automatically generated monthly portfolios.

    Rebalance Page: A utility for users to plan their custom portfolio allocations.

## 3. Backend Requirements (Node.js & Express.js)

Database:

MongoDB: Will be used to store historical analysis data and the generated monthly StrategyPortfolios.

    API Endpoints:

    GET /api/momentum: Returns a JSON object of all 500 stocks ranked by their momentum score.

    GET /api/alpha: Returns a JSON object of stocks generating positive alpha.

    GET /api/portfolios: Returns the latest automatically generated Momentum and Alpha model portfolios from the database.

    GET /api/quotes: Accepts a list of stock tickers (e.g., /api/quotes?tickers=RELIANCE.NS,TCS.NS) and returns their current market price.

Data Models:

Stock: A core data model representing a single stock (ticker, name, etc.).

    MomentumData: Includes 1-Day, 1-Week, 1-Month, 3-Month, 6-Month, and 1-Year price changes, volume analysis, and a calculated Momentum Score (e.g., a rating from 1-100).

    AlphaData: Includes the calculated alpha value and supporting data.

    StrategyPortfolio: A model to be stored in MongoDB. Will contain the portfolio name (e.g., "Momentum Portfolio - July 2025"), the generation date, and a list of the stocks included in that month's portfolio.

Business Logic:

Data Fetching & Caching: Implement a robust mechanism to fetch data from financial APIs, with caching to improve performance.

    Momentum Score Calculation: Develop an algorithm to weigh the different timeframes (1D, 1W, 1M, 3M, 6M, 1Y) and volume data into a single, representative Momentum Score.

Scheduled Updates & Portfolio Generation:

A daily job (using node-cron) will update stock data and recalculate Momentum/Alpha scores for the screeners.

    A monthly job (e.g., on the 1st of each month) will automatically select the top N stocks (e.g., top 20) based on Momentum and Alpha scores, create StrategyPortfolio documents, and save them to MongoDB.

## 4. Frontend Requirements (ReactJS)

Technology Stack: ReactJS, React Router, Axios, React Query.

UI/UX:

    Momentum/Alpha Pages: Sortable and filterable tables displaying stocks with their key metrics. The Momentum page will prominently feature the new Momentum Score.

Model Portfolios Page:

A dedicated page to display the latest model portfolios.

Users can select to view the "Monthly Momentum Portfolio" or "Monthly Alpha Portfolio".

The page will display the list of stocks in the selected portfolio for the current month.

Rebalance Table Page: No changes. The dynamic table for custom portfolio planning remains as specified.

General: A responsive design, loading indicators, and graceful error handling.

## 5. Non-Functional Requirements

Performance: Fast and responsive.

Scalability: Architecture should support growth.

Reliability: Stable and accurate data.

Maintainability: Well-structured and commented code.

## 6. Development & Deployment (Future Considerations)

Version Control: Git.

Deployment: Heroku, Vercel, AWS, Google Cloud, or Azure.