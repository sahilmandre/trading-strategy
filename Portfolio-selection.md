# Expert-Level Portfolio Generation Strategy

To align with the methodologies of professional traders, we will replace our simple sorting logic with a multi-factor model. This ensures we select only high-quality stocks that meet a strict set of criteria, reflecting both strong momentum and solid fundamentals. We will select the **Top 10 stocks** that pass these rigorous checks.

---

## 1. The "Momentum Kings" Portfolio Strategy

This strategy is designed to find stocks in a powerful **Stage 2 uptrend**, inspired by the work of Mark Minervini and Richard Driehaus. It's not just about recent performance; it's about the *quality* of the trend.

### Selection Criteria (A stock must pass ALL of these filters):

#### Trend Qualification (The Minervini Trend Template):
- The stock's current price must be **above its 50-day, 150-day, and 200-day moving averages**.
- The **150-day moving average** must be above the **200-day moving average**.
- The **200-day moving average** must be trending upwards for at least **one month**.
- The **50-day moving average** must be above both the 150-day and 200-day moving averages.
- The current price must be at least **25% above its 52-week low**.
- The current price must be **within 25% of its 52-week high** (the closer, the better).

#### Relative Strength Filter:
- The stock's performance over the last **6 months** must be in the **top 25%** of all stocks in the Nifty 500. This ensures we are only looking at market leaders.

#### Volume Confirmation:
- The average daily trading volume over the last **50 days** must be at least **30% higher** than its average volume over the last 200 days. This indicates growing institutional interest.

### Final Selection Process:

From the list of stocks that pass all the above filters, we will calculate a **"Quality Momentum Score."** This score is a weighted average of performance over different periods:

```
Score = (3-Month Performance * 0.4) + (6-Month Performance * 0.4) + (1-Year Performance * 0.2)
```

The **top 10 stocks** with the highest Quality Momentum Score will be selected for the monthly portfolio.

---

## 2. The "Alpha Titans" Portfolio Strategy

This strategy is a hybrid model inspired by William O'Neil's **CANSLIM system**. It aims to find stocks that are not only outperforming the market (generating Alpha) but also have the strong fundamental growth to justify and sustain that outperformance.

### Selection Criteria (A stock must pass ALL of these filters):

#### Alpha Performance Filter:
- The stock's **1-year performance** must be greater than the **Nifty 500 Index's 1-year performance** (i.e., alpha > 0).

#### Earnings Growth Filter (The 'A' in CANSLIM):
- The company's annual **Earnings Per Share (EPS) growth** over the last **3 years** must be greater than **20%**. This ensures we are investing in fundamentally strong, profitable companies.

#### Sales Growth Filter (The 'S' in CANSLIM):
- The company's annual **sales growth** over the last **3 years** must be greater than **15%**. Strong sales are a prerequisite for strong earnings.

#### Institutional Sponsorship Filter (The 'I' in CANSLIM):
- The stock must show a **net increase in institutional ownership** over the last quarter. This confirms that "smart money" is buying the stock.

### Final Selection Process:

From the list of stocks that pass all the fundamental and performance filters, we will rank them based on a single, clear metric: their **Alpha value**.

The **top 10 stocks** with the highest Alpha will be selected for the monthly portfolio.

---

