# ~/link-shortener-api (Backend)

A robust, fault-tolerant REST API built with Node.js and Express to handle URL mapping and resolution. Designed with strict database schemas and secure, collision-resistant string generation.

This repository contains the server-side code and database models, automatically deployed via Render. It serves as the dedicated backend for the [Link Shortener UI](https://github.com/arsh-rasania-04/url-shortener-ui).

## Features

* **Secure ID Generation:** Utilizes `nanoid` instead of predictable sequential numbering or heavy hashing algorithms to generate secure, collision-resistant 6-character URL codes.
* **Database Architecture:** Custom Mongoose schemas mapped to MongoDB Atlas for structured, validated data storage.
* **Strict Boot Sequencing:** Engineered with asynchronous dependency handling to ensure the Express server only opens its port after a successful database connection, eliminating race conditions.
* **Cross-Origin Security:** Configured with strict CORS policies to securely accept incoming POST and GET requests exclusively from the designated frontend client.

## Tech Stack

* **Runtime environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas (NoSQL)
* **ODM:** Mongoose
* **String Generation:** `nanoid`
* **Deployment:** Render (Automated CI/CD Pipeline)