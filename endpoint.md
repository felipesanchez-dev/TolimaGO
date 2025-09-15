auth
# Registro de Usuario
http://localhost:3000/api/v1/auth/register

ejemplo de entrada json

{
  "name": "Felipe Sanchez",
  "email": "felipe@gmail.com", 
  "password": "123456789",
  "phone": "+57 310 2452542",
  "city": "Ibagué",
  "isResident": true,
  "role": "user"
}

{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "68c745590fc3197166e705bf",
            "name": "Felipe Sanchez",
            "email": "felipe@gmail.com",
            "role": "user",
            "isEmailVerified": false,
            "createdAt": "2025-09-14T22:44:41.754Z"
        },
        "tokens": {
            "accessToken": "temp_access_68c745590fc3197166e705bf_1757889881944",
            "refreshToken": "temp_refresh_68c745590fc3197166e705bf_1757889881944",
            "expiresIn": "15d"
        }
    }
}

# Login de Usuario
http://localhost:3000/api/v1/auth/login

{
  "email": "felipe@gmail.com", 
  "password": "123456789"
}

{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": "68c70cf463547c16cf343663",
            "name": "Felipe Sanchez",
            "email": "felipe@gmail.com",
            "role": "user",
            "isEmailVerified": false,
            "lastLoginAt": "2025-09-14T22:45:19.854Z"
        },
        "tokens": {
            "accessToken": "temp_access_68c70cf463547c16cf343663_1757889919747",
            "refreshToken": "temp_refresh_68c70cf463547c16cf343663_1757889919747",
            "expiresIn": "15d"
        }
    }
}