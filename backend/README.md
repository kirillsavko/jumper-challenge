# 🚀 Jumper challenge backend

## 🛠️ Getting Started

🏃‍♂️ Running the Project

For easier testing I wrapped the backend application into a docker container. In includes the node.js project, database migration, database itself. <br />
So, to start the application you only need to have Docker installed on your machine and execute the next command:
```bash
docker-compose up
```
After that you should be able to see the application by opening [http://localhost:8080](http://localhost:8080) in your browser.

⚠️️Important! ⚠️<br />
I added env variables directly into the docker file because I wanted to achieve the test process as fast as possible, just with one command without too many actions around. <br />
There are some env variables that have private information, like Alchemy project key. Since those variables are visible in the repository I'd like to mention something here. <br />
I completely understand that leaking private information is unacceptable, but here I decided to keep it intended. Anyway, I will delete this project in Alchemy after you check my home assignment task. <br />
I really want to mention that I would **_never_** do it in a real project, and it was implemented in this way on purpose.

## General information

For the project structure I decided to go with a pattern that is quite similar to MVC. The structure itself:
1) Controller. Controllers are used for working with API routes. In the project it's files that finish with `...Route.ts` since it was like that from the beginning and I decided to keep this way of naming;
2) Service. Services are used for business logic;
3) Repository. Repositories are used to interact with a database.

Every commit has a detailed message about the implementation details and thoughts about the changes. So, if you have a question about anything in the project the answer might be in the commit message.

## How to test the application
After opening the application in your browser you should be able to see the Swagger documentation for every endpoint. From there you can execute any of them and see the result right after.

### Account creation endpoint
The endpoint is accessible under the `POST /auth/login` route. Via this endpoint the user can log in this application with the given address and the signature. The signature can be gotten from the frontend.

### Fetching ERC token balances endpoint
The endpoint is accessible under the `GET /balances/{address}` route. The endpoint returns the list of token balances of the first page and the page key that is needed for fetching further token balances. I decided to implement this in that way because it makes the API requests faster. If we were needed to fetch **_all_** token balances for the given account then I would just go with `do while`.

### Getting leaderboard endpoint
The endpoint is accessible under the `GET /user/leaderboard` route. It returns the sorted leaderboard list across all users that have logged in the application. The limit is restricted by 100. If we were needed to return the leaderboard without any limit then I'd go with a pagination to don't make the request that heavy. <br />
The logic works a bit tricky. I update the balance record in the database every time the user logs in. I understand that this solution provides the leaderboard that isn't connected to the real-time data, but creating the entire leaderboard by checking balances of top 100 users makes the request very heavy. That's why I did it in that way. <br/>
Also, after the implementation I caught myself thinking that I probably implemented it in a wrong way. I just summed up all tokens of the user without converting it to for instance US dollar. But I'm not really sure here, so I decided to keep it as it's.


## 🛠️ Running tests
Tests can be run by the next commands:
```bash
npm run test
```
or
```bash
yarn test
```

Also, with coverage:
```bash
npm run test:cov
```
or
```bash
yarn test:cov
```

I covered all added logic with tests. There is only one thing that I'd improve if it was a real project. I would add a real database for tests that is created when a dev executes tests. I think it makes the tests more real and closer to the reality which is always good.

## P.S.
Thank you for giving me the opportunity to test myself in this task. I really appreciate that. <br />
I hope you will enjoy going through my code! Don't hesitate contacting me if you have any question! 
