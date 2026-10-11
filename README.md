# SpG: Verify, don't trust

Team Spark Arise: Thulasidharsan V, Roshan R, Sudharsan R
Sakthi HackFest'26 · Web3 and FinTech · PS 10

## Abstract
Small vendors like Murugan, a tiffin cart owner who takes about ₹4,000 a day on UPI, are refused credit because their income is not in a form a lender accepts. SpG turns a vendor's own payment history into evidence a lender can verify independently. The vendor logs in, adds KYC details, loads a bank statement and chooses the amount needed. SpG removes refunds, transfers and circular transfers from sales and shows every step of the eligibility reasoning. The vendor then chooses what to share and confirms with an OTP. A signed report is created and the lender recomputes the hash chain and checks the signature, so any change to the data fails verification. The vendor can withdraw consent at any time, and every access is recorded in a log the vendor can see. This is a prototype with demo data and a simulated issuer.

## Problem
Small vendors with steady digital income are refused credit because a lender cannot verify their income. The vendor must control what is shared and be able to withdraw consent.

## Flow
1. Login and KYC (dummy Aadhaar and PAN, certificate file stays in the browser)
2. Bank statement and amount needed (₹1.5 lakh, ₹5.5 lakh or other)
3. Circular-transfer check
4. Eligibility with visible reasoning
5. Vendor picks what to share and confirms by OTP
6. Issuer signs the report
7. Lender verifies the signature and hash chain
8. Vendor can withdraw consent; the lender is then denied and the attempt is logged

## How the reasoning works
Verified sales only → weakest month → estimated profit → EMI room → supported loan amount, compared with the amount asked. Every step is shown to the vendor.

## Circular transfers (constraint released at hour 16)
A credit is treated as circular if the same account received a similar amount back from the vendor within 7 days (amount within 15%). Those credits are excluded from sales. The vendor sees the accounts, dates, amounts, the effect on the result and what would help. On the demo data, Karthik's supported amount falls from about ₹1,18,000 to ₹24,000. Murugan and Ravi have no flagged transfers.

## Trust model
| Who | Can do | Cannot do |
|---|---|---|
| Vendor | Choose what is shared, withdraw consent, see the access log | Edit signed data without detection |
| Issuer (simulated) | Sign the report | Release data without consent |
| Lender | Verify the signature and hashes | See raw transactions |

## Architecture
React + Vite web app in the browser: 5-step flow, evidence engine, crypto (SHA-256 hash chain, ECDSA signature through Web Crypto), consent and access log. A separate FastAPI issuer backend was built and tested earlier. It is not connected to this version and is not part of this repository.

## Run locally
```
npm install
npm run dev
```
Open the address that `npm run dev` prints.

## Assumptions
Expenses are 65% of sales, EMI is at most 30% of profit, 12 months at 18% a year, circular window 7 days with 15% amount tolerance. These are our assumptions, not validated values.

## Limitations
- Demo data and a demo OTP (shown on screen, no SMS)
- The issuer is simulated in the browser, no real bank is involved
- The access log and consent are enforced in the browser only
- Detects same-account round trips only, not multi-hop loops
- Self-reported billing records are shown but not counted, because a lender cannot verify them
- This is an evidence layer, not a credit score or a loan approval

## Adaptation log
- Hint 2: a hash alone can be created by the vendor, so we moved to an issuer signature that the lender verifies.
- Evaluator feedback: we re-read the problem statement and rebuilt the flow around consent, withdrawal, independent verification and visible reasoning.
- Hour 16 constraint: added circular-transfer detection and an explanation to the vendor.

## Next steps
Bank or Account Aggregator as the real issuer, transaction-graph detection of multi-hop loops, consent enforced at the issuer, a pilot with five vendors, and repaid EMIs added to the history.
