# ecosystem-sim API Documentation

## Introduction

The `ecosystem-sim` API is designed for creating simulation environments, digital twins, and scenario modeling applications within the broader framework of the AI-infrastructure estate at DCoop HQ. Utilizing advanced algorithms and robust data management techniques, the API provides tools to model, simulate, and analyze various environments and scenarios effectively.

## Versioning

- Current Version: 1.0.0
- Release Date: 2023-10-01

## Base URL

All API endpoints are available under the following base URL:

```
https://api.ecosystem-sim.dcoop.com/v1
```

## Authentication

To access the `ecosystem-sim` API, authentication via OAuth 2.0 is required. You must include a valid access token in the Authorization header as follows:

```
Authorization: Bearer <your_access_token>
```

## Endpoints

### 1. Create a Simulation Environment

**POST /simulations**

This endpoint allows the creation of a new simulation environment.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "configuration": {
    "parameters": {
      "gravity": "float",
      "friction": "float"
    },
    "dimensions": {
      "width": "float",
      "height": "float",
      "depth": "float"
    }
  }
}
```

**Response:**

- **201 Created**
  ```json
  {
    "id": "string",
    "status": "created",
    "message": "Simulation environment successfully created."
  }
  ```

### 2. Retrieve a Simulation Environment

**GET /simulations/{id}**

Fetch details of a specific simulation environment by its ID.

**Parameters:**

- `id` (required): The unique identifier of the simulation environment.

**Response:**

- **200 OK**
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "configuration": {
      "parameters": {
        "gravity": "float",
        "friction": "float"
      },
      "dimensions": {
        "width": "float",
        "height": "float",
        "depth": "float"
      }
    }
  }
  ```

### 3. Update a Simulation Environment

**PUT /simulations/{id}**

Update the configuration of an existing simulation environment.

**Parameters:**

- `id` (required): The unique identifier of the simulation environment.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "configuration": {
    "parameters": {
      "gravity": "float",
      "friction": "float"
    },
    "dimensions": {
      "width": "float",
      "height": "float",
      "depth": "float"
    }
  }
}
```

**Response:**

- **200 OK**
  ```json
  {
    "id": "string",
    "status": "updated",
    "message": "Simulation environment successfully updated."
  }
  ```

### 4. Delete a Simulation Environment

**DELETE /simulations/{id}**

Remove a specific simulation environment.

**Parameters:**

- `id` (required): The unique identifier of the simulation environment.

**Response:**

- **204 No Content**
  - (No content returned)

### 5. Run a Simulation

**POST /simulations/{id}/run**

Initiate the simulation of the specified environment.

**Parameters:**

- `id` (required): The unique identifier of the simulation environment.

**Request Body:**

```json
{
  "duration": "int", // in seconds
  "scenario": {
    "events": [
      {
        "type": "string",
        "parameters": {
          "key": "value" // dynamic event parameters
        }
      }
    ]
  }
}
```

**Response:**

- **202 Accepted**
  ```json
  {
    "id": "string",
    "status": "running",
    "message": "Simulation has started."
  }
  ```

### 6. Get Simulation Results

**GET /simulations/{id}/results**

Retrieve results from a completed simulation.

**Parameters:**

- `id` (required): The unique identifier of the simulation environment.

**Response:**

- **200 OK**
  ```json
  {
    "id": "string",
    "results": {
      "scenarios": [
        {
          "event": "string",
          "outcome": "string",
          "timestamp": "datetime"
        }
      ]
    }
  }
  ```

## Error Handling

The API uses standard HTTP status codes to indicate success or failure:

- **400 Bad Request**: The request was unacceptable, often due to missing a required parameter.
- **401 Unauthorized**: Invalid or missing authentication credentials.
- **403 Forbidden**: The server understood the request, but refuses to authorize it.
- **404 Not Found**: The requested resource does not exist.
- **500 Internal Server Error**: An error occurred on the server.

## Rate Limiting

Each client is limited to 100 requests per minute. Exceeding this limit will result in a `429 Too Many Requests` response.

## Governance Configuration

### governance.yaml

```yaml
version: 1.0
metadata:
  name: ecosystem-sim
  description: API Governance for ecosystem-sim
  environment: production
  contact:
    name: DCoop HQ Support
    email: support@dcoop.com
    url: https://support.dcoop.com
rules:
  - name: Rate Limiting
    description: Limit API usage per client
    type: throttle
    configuration:
      limit: 100
      interval: 1m
  - name: Authentication
    description: Requires OAuth 2.0 tokens for all requests
    type: auth
    configuration:
      method: Bearer
  - name: Error Handling
    description: Standard error responses
    type: error-handling
    configuration:
      response:
        - 400: "Bad Request"
        - 401: "Unauthorized"
        - 403: "Forbidden"
        - 404: "Not Found"
        - 500: "Internal Server Error"
```

## Conclusion

The `ecosystem-sim` API provides a straightforward interface for managing simulation environments, enabling users to create, update, delete, run, and retrieve data from simulations. With compliance to governance standards, the API ensures robustness, efficiency, and security in managing simulation workloads within the DCoop AI-infrastructure estate.
