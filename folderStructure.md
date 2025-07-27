/stock-screener-backend
|
|-- /config
|   |-- nifty500.js         # (You've already placed the stock list here)
|   |-- db.js               # (We will move our database connection logic here)
|
|-- /controllers
|   |-- stockController.js    # (Will handle the logic for incoming API requests for momentum/alpha)
|   |-- portfolioController.js# (Will handle the logic for portfolio-related requests)
|
|-- /models
|   |-- stockDataModel.js     # (Mongoose schema for storing historical stock data analysis)
|   |-- portfolioModel.js     # (Mongoose schema for our automated monthly portfolios)
|
|-- /routes
|   |-- stockRoutes.js        # (Will define the API routes: /api/momentum, /api/alpha, /api/quotes)
|   |-- portfolioRoutes.js    # (Will define the API routes: /api/portfolios)
|
|-- /services
|   |-- dataService.js        # (Will contain the core logic for fetching data from Yahoo Finance)
|   |-- analysisService.js    # (Will contain the core logic for calculating momentum scores and alpha)
|   |-- portfolioService.js   # (Will contain the logic for generating the monthly portfolios)
|
|-- /jobs
|   |-- schedule.js           # (We will define all our node-cron scheduled jobs here)
|
|-- index.js                  # (The main server entry point - keeps this file clean)
|-- .env                      # (Environment variables)
|-- package.json
|-- package-lock.json
|-- .gitignore