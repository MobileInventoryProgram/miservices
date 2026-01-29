# Create First Admin User

Since we don't have a registration UI yet, you can create the first admin user using the API endpoint directly.

## Using curl (in Replit Shell):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@miservices.co.uk",
    "password": "ChangeMe123!",
    "name": "Admin User",
    "role": "admin"
  }'
```

## Or using the browser console:

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Paste this code and press Enter:

```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    email: 'admin@miservices.co.uk',
    password: 'ChangeMe123!',
    name: 'Admin User',
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => console.log('Admin created:', data))
.catch(err => console.error('Error:', err));
```

## Create Franchise User:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "franchise1",
    "email": "franchise@example.com",
    "password": "TestPass123!",
    "name": "Test Franchise Owner",
    "role": "franchise",
    "franchiseTerritory": "London"
  }'
```

## Create Staff User:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type": "application/json" \
  -d '{
    "username": "staff1",
    "email": "staff@miservices.co.uk",
    "password": "TestPass123!",
    "name": "Test Staff Member",
    "role": "staff"
  }'
```

## Login

After creating a user, visit: http://localhost:5000/members/login

Use the username and password you created above.

## Important Notes

- **Change the default passwords immediately!**
- The registration endpoint should be secured or removed in production
- In Phase 2, we'll build a proper admin user management interface
