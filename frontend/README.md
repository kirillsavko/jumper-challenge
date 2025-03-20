# 🚀 Jumper challenge frontend

My task was to implement the only backend part of the application. Despite that I made one update in the frontend application to make testing easier. Via the frontend you can get the signature for your Ethereum account which is needed for testing the backend part on Swagger. <br />
The logic of getting the signature was tested with MetaMask only. So, with other wallets the signature getting might not work. If possible please use MetaMask. <br />

Before starting the frontend application please make sure that the backend application is running, otherwise the logic of getting the signature won't work since those applications are connected between each other.

Also, worth to mention that I only added one component in the project and it has some hardcoded logic inside. If my task was to implement the frontend application as well I would do it differently. I believe the hardcoded solution is enough here to save some time for backend logic implementing. 

## Getting Started

First, install dependencies:
```bash
npm install
```
Or
```bash
yarn install
```

Then, run the development server:

```bash
npm run dev
```
Or
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
